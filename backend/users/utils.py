import hashlib
import hmac
import re
from urllib.parse import parse_qsl

from django.core.cache import cache

import requests_pkcs12

from users.constraints import (
    CERT_PATH,
    CERT_PASSWORD,
    LOGIN,
    PASSWORD,
    BASE_URL,
    COOKIE_CACHE_KEY,
    CACHE_TTL,
    TOKEN_CACHE_KEY
)


def get_cookie_token_string() -> tuple[str, str]:
    cookie = cache.get(COOKIE_CACHE_KEY)
    token = cache.get(TOKEN_CACHE_KEY)

    url = f"{BASE_URL}/auth.php"

    if cookie and token:

        return cookie, token

    payload = {
        "login": LOGIN,
        "password": PASSWORD,
        "r": "",
        "lang": "ru",
    }

    response = requests_pkcs12.post(
        url,
        data=payload,
        pkcs12_filename=CERT_PATH,
        pkcs12_password=CERT_PASSWORD,
        allow_redirects=False
    )

    cookie_header_string = "; ".join(
        [f"{k}={v}" for k, v in response.cookies.items()]
    )

    token = response.cookies.get_dict().get("token")

    cache.set(COOKIE_CACHE_KEY, cookie_header_string, CACHE_TTL)
    cache.set(TOKEN_CACHE_KEY, token, CACHE_TTL)

    return cookie_header_string, token


def get_guest_id(mobile_phone: str) -> str | None:
    url = f"{BASE_URL}/guests_search/search.php"
    cookie = get_cookie_token_string()[0]

    payload = {
        "draw": "1",
        "start": "0",
        "length": "10",
        "search[value]": mobile_phone,
        "search[regex]": "false",
        "order[0][column]": "0",
        "order[0][dir]": "asc",
        "guests_group": "0",
        "guests_group_hand": "0",
        "last_visit_from": "",
        "last_visit_to": "",
        "date_insert_from": "",
        "date_insert_to": "",
        "balance_from": "",
        "balance_to": "",
        "bonus_balance_from": "",
        "bonus_balance_to": "",
    }

    for i in range(15):
        payload[f"columns[{i}][data]"] = str(i)
        payload[f"columns[{i}][name]"] = ""
        payload[f"columns[{i}][searchable]"] = "true"
        payload[f"columns[{i}][orderable]"] = (
            "false" if i in (9, 10, 14) else "true"
        )
        payload[f"columns[{i}][search][value]"] = ""
        payload[f"columns[{i}][search][regex]"] = "false"

    headers = {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
        "Cookie": cookie,
    }

    response = requests_pkcs12.post(
        url,
        headers=headers,
        data=payload,
        pkcs12_filename=CERT_PATH,
        pkcs12_password=CERT_PASSWORD,
        allow_redirects=False
    )

    res_json = response.json()
    records_total = res_json.get("recordsTotal", 0)
    data = res_json.get("data", [])

    if records_total == 0 or not data:
        return None

    if records_total > 1:
        return None

    for cell in data[0]:
        if isinstance(cell, str):
            match = re.search(r"showGuestAnketa\((\d+)\)", cell)
            if match:
                return int(match.group(1))

    return None


def validate_telegram_data(init_data: str, bot_token: str) -> bool:
    """
    Validates the Telegram WebApp initData string using HMAC-SHA-256.
    """
    # Parse the query string into a dictionary
    parsed_data = dict(parse_qsl(init_data))

    # Extract the hash and remove it from the dictionary
    received_hash = parsed_data.pop('hash', None)
    if not received_hash:
        return False

    # Sort the remaining key-value pairs alphabetically by key
    data_check_string = '\n'.join(
        f"{k}={v}" for k, v in sorted(parsed_data.items())
    )

    # Generate the secret key (HMAC of bot token using 'WebAppData' as the key)
    secret_key = hmac.new(
        b"WebAppData", bot_token.encode(), hashlib.sha256
    ).digest()

    # Calculate the final hash
    calculated_hash = hmac.new(
        secret_key, data_check_string.encode(), hashlib.sha256
    ).hexdigest()

    # Compare securely
    return hmac.compare_digest(calculated_hash, received_hash)
