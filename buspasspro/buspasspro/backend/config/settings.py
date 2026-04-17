import os
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

# Read .env file
try:
    from decouple import config
    SECRET_KEY = config('SECRET_KEY', default='django-insecure-buspasspro-dev-key')
    DEBUG      = config('DEBUG', default=True, cast=bool)
    DB_NAME    = config('DB_NAME', default='buspasspro')
    DB_USER    = config('DB_USER', default='postgres')
    DB_PASSWORD = config('DB_PASSWORD', default='postgres')
    DB_HOST    = config('DB_HOST', default='localhost')
    DB_PORT    = config('DB_PORT', default='5432')
    ENABLE_DEMO_USERS = config('ENABLE_DEMO_USERS', default=DEBUG, cast=bool)
    DEMO_ADMIN_EMAIL = config('DEMO_ADMIN_EMAIL', default='admin@admin.com')
    DEMO_ADMIN_PASSWORD = config('DEMO_ADMIN_PASSWORD', default='12345678')
    DEMO_STUDENT_EMAIL = config('DEMO_STUDENT_EMAIL', default='test@example.com')
    DEMO_STUDENT_PASSWORD = config('DEMO_STUDENT_PASSWORD', default='12345678')
    RAZORPAY_KEY_ID     = config('RAZORPAY_KEY_ID', default='')
    RAZORPAY_KEY_SECRET = config('RAZORPAY_KEY_SECRET', default='')
    QR_CODE_SECRET      = config('QR_CODE_SECRET', default='qr-secret')
    EMAIL_BACKEND       = config('EMAIL_BACKEND', default='django.core.mail.backends.smtp.EmailBackend')
    EMAIL_HOST          = config('EMAIL_HOST', default='smtp.gmail.com')
    EMAIL_PORT          = config('EMAIL_PORT', default=587, cast=int)
    EMAIL_USE_TLS       = config('EMAIL_USE_TLS', default=True, cast=bool)
    EMAIL_USE_SSL       = config('EMAIL_USE_SSL', default=False, cast=bool)
    EMAIL_HOST_USER     = config('EMAIL_HOST_USER', default='')
    EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
    DEFAULT_FROM_EMAIL  = config('DEFAULT_FROM_EMAIL', default=EMAIL_HOST_USER or 'BusPassPro <noreply@buspasspro.edu>')
except ImportError:
    SECRET_KEY  = 'django-insecure-buspasspro-dev-key'
    DEBUG       = True
    DB_NAME     = 'buspasspro'
    DB_USER     = 'postgres'
    DB_PASSWORD = 'postgres'
    DB_HOST     = 'localhost'
    DB_PORT     = '5432'
    ENABLE_DEMO_USERS = True
    DEMO_ADMIN_EMAIL = 'admin@admin.com'
    DEMO_ADMIN_PASSWORD = '12345678'
    DEMO_STUDENT_EMAIL = 'test@example.com'
    DEMO_STUDENT_PASSWORD = '12345678'
    RAZORPAY_KEY_ID = RAZORPAY_KEY_SECRET = QR_CODE_SECRET = ''
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    EMAIL_HOST = 'smtp.gmail.com'
    EMAIL_PORT = 587
    EMAIL_USE_TLS = True
    EMAIL_USE_SSL = False
    EMAIL_HOST_USER = EMAIL_HOST_PASSWORD = ''
    DEFAULT_FROM_EMAIL = 'BusPassPro <noreply@buspasspro.edu>'

ALLOWED_HOSTS = ['localhost', '127.0.0.1']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'channels',
    'django_filters',
    'drf_spectacular',
    'apps.users',
    'apps.passes',
    'apps.payments',
    'apps.buses',
    'apps.ai_engine',
    'apps.notifications',
    'apps.taxis',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'
AUTH_USER_MODEL = 'users.User'
ASGI_APPLICATION = 'config.asgi.application'
WSGI_APPLICATION = 'config.wsgi.application'

TEMPLATES = [{
    'BACKEND': 'django.template.backends.django.DjangoTemplates',
    'DIRS': [BASE_DIR / 'templates'],
    'APP_DIRS': True,
    'OPTIONS': {'context_processors': [
        'django.template.context_processors.debug',
        'django.template.context_processors.request',
        'django.contrib.auth.context_processors.auth',
        'django.contrib.messages.context_processors.messages',
    ]},
}]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': DB_NAME,
        'USER': DB_USER,
        'PASSWORD': DB_PASSWORD,
        'HOST': DB_HOST,
        'PORT': DB_PORT,
    }
}

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
    },
}

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
    }
}

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': ('rest_framework_simplejwt.authentication.JWTAuthentication',),
    'DEFAULT_PERMISSION_CLASSES': ('rest_framework.permissions.IsAuthenticated',),
    'DEFAULT_FILTER_BACKENDS': ['django_filters.rest_framework.DjangoFilterBackend','rest_framework.filters.SearchFilter','rest_framework.filters.OrderingFilter'],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME':  timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS':  True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
]
CORS_ALLOWED_ORIGIN_REGEXES = [
    r'^http://localhost:517[0-9]$',
    r'^http://127\.0\.0\.1:517[0-9]$',
]
CORS_ALLOW_CREDENTIALS = True

STATIC_URL  = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL   = '/media/'
MEDIA_ROOT  = BASE_DIR / 'media'

SPECTACULAR_SETTINGS = {
    'TITLE': 'BusPassPro API',
    'DESCRIPTION': 'College Bus Pass Management System',
    'VERSION': '1.0.0',
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True
