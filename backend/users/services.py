import csv
import io
import os
import requests

from django.db import transaction
from django.core.cache import cache

from users.models import ClubUser
from users.utils import get_cookie_string

CLS_EXPORT_URL = os.getenv("CLS_EXPORT_URL")

# Externalize headers and cookies to environment variables or settings

PAYLOAD = {
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
    cookie_string = cache.get("cls_cookie")

    if not cookie_string:
        cookie_string = get_cookie_string()

    headers = {
        "Cookie": cookie_string,
    }

    response = requests.post(
        CLS_EXPORT_URL,
        json=PAYLOAD,
        headers=headers,
        timeout=30,
    )

    return response


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
