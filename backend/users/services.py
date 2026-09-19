import csv
import io
import logging
import re
from datetime import timedelta
import requests
import requests_pkcs12

from django.conf import settings
from django.db import transaction
from django.core.cache import cache
from django.contrib.auth import get_user_model
from django.utils import timezone

from users.models import ClubUser, ClubTransaction
from users.utils import get_cookie_token_string, get_guest_id

from users.constraints import (
    BASE_URL,
    CERT_PATH,
    CERT_PASSWORD,
    COOKIE_CACHE_KEY,
    ONE_SPIN_MIN_TOP_UP,
)


logger = logging.getLogger(__name__)
User = get_user_model()


def send_telegram_message(telegram_id: str, text: str) -> tuple[bool, str]:
    """Send one admin campaign message through the Telegram Bot API."""
    token = getattr(settings, 'TELEGRAM_BOT_TOKEN', None)
    if not token:
        return False, 'TELEGRAM_BOT_TOKEN is not configured.'

    try:
        response = requests.post(
            f'https://api.telegram.org/bot{token}/sendMessage',
            json={
                'chat_id': str(telegram_id),
                'text': text,
            },
            timeout=15,
        )
        response_data = response.json()
    except (requests.RequestException, ValueError) as error:
        return False, str(error)

    if response.status_code == 200 and response_data.get('ok'):
        return True, ''

    return False, response_data.get(
        'description', 'Telegram rejected the message.'
    )


def _transaction_phone(value: str) -> str | None:
    """Extract and normalize the phone number embedded in an operation name."""
    if not value:
        return None

    # The HTML contains a short guest ID in showGuestAnketa(...), followed by
    # the phone number in the visible operation text. Inspect every group so
    # the guest ID cannot be mistaken for the phone number.
    for value_group in re.findall(r'\(([^()]*)\)', value):
        digits = ''.join(char for char in value_group if char.isdigit())
        if len(digits) >= 10:
            return digits[-10:]

    return None


def _external_transaction_key(operation: dict) -> str | None:
    """Return the fiscal number used to identify one operation."""
    fiscal_number = str(operation.get('fiscal_number') or '').strip()

    if not fiscal_number:
        return None

    return fiscal_number


def _operations_log_payload(start_date: str, end_date: str) -> dict:
    columns = [
        'date',
        'time',
        'club_name',
        'type',
        'name',
        'source',
        'form',
        'sum',
        'date_fiscal',
        'fn_number',
        'fiscal_number',
    ]
    payload = {
        'draw': '1',
        'start': '0',
        'length': '1000',
        'order[0][column]': '0',
        'order[0][dir]': 'asc',
        'order[0][name]': '',
        'search[value]': '',
        'search[regex]': 'false',
        'date_from': start_date,
        'date_to': end_date,
        'club_id': '',
        'operation_type': 'plus',
        'operation_source': '',
        'operation_form': '',
        'sum_from': str(ONE_SPIN_MIN_TOP_UP),
        'sum_to': '',
    }

    for index, column in enumerate(columns):
        payload.update({
            f'columns[{index}][data]': column,
            f'columns[{index}][name]': '',
            f'columns[{index}][searchable]': 'true',
            f'columns[{index}][orderable]': 'true',
            f'columns[{index}][search][value]': '',
            f'columns[{index}][search][regex]': 'false',
        })

    return payload


def get_club_transactions() -> list[dict]:
    """Fetch positive operations from yesterday and today."""
    today = timezone.localdate()
    # Include the complete previous day so transactions created shortly
    # before midnight are still processed by the next scheduler run.
    start_date = today - timedelta(days=1)
    url = f'{BASE_URL}/all_operations_log/server_processing.php'
    cookie_string, _ = get_cookie_token_string()

    response = requests_pkcs12.post(
        url,
        headers={
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest',
            'Cookie': cookie_string,
        },
        data=_operations_log_payload(
            f'{start_date.isoformat()} 00:00',
            f'{today.isoformat()} 23:59',
        ),
        pkcs12_filename=CERT_PATH,
        pkcs12_password=CERT_PASSWORD,
        allow_redirects=False,
        timeout=30,
    )
    response.raise_for_status()

    data = response.json()
    operations = data.get('data', [])
    return operations if isinstance(operations, list) else []


def _process_club_transaction(operation: dict) -> bool:
    """Persist one new operation and award its spins exactly once."""
    try:
        amount = int(float(operation.get('sum', 0)))
    except (TypeError, ValueError):
        return False

    if amount <= ONE_SPIN_MIN_TOP_UP:
        return False

    check_number = _external_transaction_key(operation)
    phone_number = _transaction_phone(operation.get('name', ''))
    if not check_number or not phone_number:
        logger.warning(
            'Skipping club operation with incomplete data: %s',
            check_number or '<unknown>',
        )
        return False

    with transaction.atomic():
        if ClubTransaction.objects.filter(check_number=check_number).exists():
            return False

        user = User.objects.select_for_update().filter(
            mobile_phone__mobile_phone=phone_number
        ).first()
        if not user:
            logger.warning(
                'SPINS NOT AWARDED: fiscal_number=%s, phone=%s, amount=%s. '
                'User is not registered in the app; the operation will be '
                'retried on the next sync.',
                check_number,
                phone_number,
                amount,
            )
            return False

        ClubTransaction.objects.create(
            admin=None,
            user=user,
            amount_rub=amount,
            check_number=check_number,
        )
        return True


def sync_club_transactions() -> int:
    """Fetch and process new qualifying club operations."""
    try:
        operations = get_club_transactions()
    except Exception:
        logger.exception('Failed to fetch club transactions')
        return 0

    processed = 0
    for operation in operations:
        try:
            if _process_club_transaction(operation):
                processed += 1
        except Exception:
            logger.exception(
                'Failed to process club operation %s',
                _external_transaction_key(operation),
            )

    logger.info(
        'Club transaction sync completed: %s new transactions',
        processed
    )
    return processed


def parse_fio(fio_raw: str) -> tuple[str, str, str]:
    """
    Safely parses Russian 'ФИО' (Фамилия Имя Отчество).
    Returns (first_name, last_name, middle_name).
    """
    if not fio_raw or not isinstance(fio_raw, str):
        return "", "", ""

    parts = fio_raw.strip().split()
    if not parts:
        return "", "", ""

    # Russian ФИО order: parts[0] = Surname (last_name),
    # parts[1] = Name (first_name)
    if len(parts) == 1:
        return parts[0], "", ""
    elif len(parts) == 2:
        return parts[1], parts[0], ""
    else:
        last_name = parts[0]
        first_name = parts[1]
        middle_name = " ".join(parts[2:])
        return first_name, last_name, middle_name


def get_database():
    url = f"{BASE_URL}/guests_search/search_export_csv.php"

    cookie_string = cache.get(COOKIE_CACHE_KEY)

    if not cookie_string:
        cookie_string = get_cookie_token_string()[0]

    headers = {
        "Cookie": cookie_string,
    }

    payload = {
        "export": True,
        "title": "Статистика и балансы гостей",
        "search": {"value": ""},
        "order": [{"column": 0, "dir": "asc"}],
        "guests_group": "0",
        "last_visit_from": "",
        "last_visit_to": "",
        "date_insert_from": "",
        "date_insert_to": "",
        "balance_from": "",
        "balance_to": "",
        "bonus_balance_from": "",
        "bonus_balance_to": "",
        "guests_group_hand": "0"
    }

    response = requests.post(
        url,
        json=payload,
        headers=headers,
        timeout=30,
    )

    return response


def edit_guest_bonus_balance(phone_number: str, bonuses: int) -> bool:
    """Credit a wheel prize in the external club system.

    The external service is an integration boundary. Network, certificate,
    authentication, and malformed-response errors must not turn the spins
    endpoint into an unhandled 500 response. The caller can roll back the
    local spin and return a controlled error instead.
    """
    try:
        guest_id = get_guest_id(phone_number)

        if not guest_id:
            return False

        url = f"{BASE_URL}/master_api/guests/{guest_id}/balance"

        payload = {
            "type": "bonus_balance",
            "sum": bonuses,
        }

        cookie_string, token = get_cookie_token_string()

        headers = {
            "Cookie": cookie_string,
            "Authorization": f"Bearer {token}",
        }

        response = requests.post(
            url,
            json=payload,
            headers=headers,
            timeout=30,
        )

        return response.status_code == 200
    except Exception:
        logger.exception(
            "Failed to credit wheel bonus for phone number %s",
            phone_number,
        )
        return False


def sync_guests_database():
    """Fetch CSV export and perform fast batch synchronization."""
    response = get_database()

    content = response.content.decode('utf-8-sig', errors='replace')
    csv_file = io.StringIO(content)

    sample = content[:2048]
    delimiter = ';' if ';' in sample else ','
    reader = csv.DictReader(csv_file, delimiter=delimiter)

    # Clean whitespace from CSV field names
    if reader.fieldnames:
        reader.fieldnames = [
            name.strip() if name else name for name in reader.fieldnames
        ]

    # Pre-fetch existing users into memory for O(1) lookups
    existing_users = {
        user.mobile_phone: user for user in ClubUser.objects.all()
    }

    to_create = []
    to_update = []

    for row in reader:
        phone = row.get('Телефон')
        if not phone:
            continue

        clean_phone = ''.join(filter(str.isdigit, str(phone)))[-10:]
        if len(clean_phone) != 10:
            continue

        first_name, last_name, middle_name = parse_fio(row.get('ФИО'))
        age_raw = str(row.get('Возраст', '')).strip()
        age_val = int(age_raw) if age_raw.isdigit() else 1

        defaults = {
            'first_name': first_name,
            'last_name': last_name,
            'middle_name': middle_name,
            'age': age_val,
        }

        if clean_phone in existing_users:
            user = existing_users[clean_phone]
            has_changes = False

            for field, val in defaults.items():
                if getattr(user, field) != val:
                    setattr(user, field, val)
                    has_changes = True

            if has_changes:
                to_update.append(user)
        else:
            new_user = ClubUser(mobile_phone=clean_phone, **defaults)
            to_create.append(new_user)
            existing_users[clean_phone] = new_user
            # Prevent duplicates in the same CSV stream

    # Execute DB operations in optimized bulk batches
    with transaction.atomic():
        if to_create:
            ClubUser.objects.bulk_create(to_create, batch_size=1000)
        if to_update:
            ClubUser.objects.bulk_update(
                to_update,
                fields=['first_name', 'last_name', 'middle_name', 'age'],
                batch_size=1000
            )

    return len(to_create), len(to_update)
