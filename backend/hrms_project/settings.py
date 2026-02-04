import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# ── Security ─────────────────────────────────────────────────
SECRET_KEY = os.environ.get(
    'SECRET_KEY', 'django-insecure-default-key-change-in-production'
)

DEBUG = os.environ.get('DEBUG', 'True').lower() == 'true'

ALLOWED_HOSTS = ['*']

# ── Installed apps ───────────────────────────────────────────
INSTALLED_APPS = [
    'django.contrib.contenttypes',
    'django.contrib.auth',
    'rest_framework',
    'corsheaders',
    'employees',
    'attendance',
]

# ── Middleware ────────────────────────────────────────────────
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
]

# ── URLs ──────────────────────────────────────────────────────
ROOT_URLCONF = 'hrms_project.urls'

# ── Database ──────────────────────────────────────────────────
# SQLite out of the box for local development.
# Set DATABASE_URL in the environment to switch to PostgreSQL on deploy.
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

database_url = os.environ.get('DATABASE_URL')
if database_url:
    import dj_database_url
    DATABASES['default'] = dj_database_url.config(default=database_url)

# ── CORS ──────────────────────────────────────────────────────
# Allow all origins – tighten this in production if you like
CORS_ALLOW_ALL_ORIGINS = True

# ── Django REST Framework ────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'EXCEPTION_HANDLER': 'hrms_project.exceptions.custom_exception_handler',
}

# ── Misc ──────────────────────────────────────────────────────
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_TZ = True
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# No trailing slash – keeps API URLs consistent with the frontend calls
APPEND_SLASH = False
