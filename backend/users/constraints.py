import os
from dotenv import load_dotenv

load_dotenv()

CERT_PATH = f'certificates/{os.getenv("colizeum_certificate")}'
CERT_PASSWORD = os.getenv("colizeum_certificate_password")
LOGIN = os.getenv("colizeum_login")
PASSWORD = os.getenv("colizeum_password")
BASE_URL = os.getenv("colizeum_url").rstrip("/")
COOKIE_CACHE_KEY = "cls_cookie"
CACHE_TTL = 3600
TOKEN_CACHE_KEY = "cls_token"
