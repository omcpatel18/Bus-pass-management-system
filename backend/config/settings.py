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
    REDIS_HOST = config('REDIS_HOST', default='127.0.0.1')
    REDIS_URL  = config('REDIS_URL', default='redis://127.0.0.1:6379/1')
    RAZORPAY_KEY_ID     = config('RAZORPAY_KEY_ID', default='')
    RAZORPAY_KEY_SECRET = config('RAZORPAY_KEY_SECRET', default='')
    QR_CODE_SECRET      = config('QR_CODE_SECRET', default='qr-secret')
    EMAIL_HOST_USER     = config('EMAIL_HOST_USER', default='')
    EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
except ImportError:
    SECRET_KEY  = 'django-insecure-buspasspro-dev-key'
    DEBUG       = True
    DB_NAME     = 'buspasspro'
    DB_USER     = 'postgres'
    DB_PASSWORD = 'postgres'
    DB_HOST     = 'localhost'
    DB_PORT     = '5432'
    REDIS_HOST  = '127.0.0.1'
    REDIS_URL   = 'redis://127.0.0.1:6379/1'
    RAZORPAY_KEY_ID = RAZORPAY_KEY_SECRET = QR_CODE_SECRET = ''
    EMAIL_HOST_USER = EMAIL_HOST_PASSWORD = ''

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
        'NAME': DB_NAME, 'USER': DB_USER, 'PASSWORD': DB_PASSWORD,
        'HOST': DB_HOST, 'PORT': DB_PORT,
    }
}

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {'hosts': [(REDIS_HOST, 6379)]},
    },
}

CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': REDIS_URL,
        'OPTIONS': {'CLIENT_CLASS': 'django_redis.client.DefaultClient'},
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

CORS_ALLOWED_ORIGINS = ['http://localhost:3000','http://localhost:5173']
CORS_ALLOW_CREDENTIALS = True

EMAIL_BACKEND     = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST        = 'smtp.gmail.com'
EMAIL_PORT        = 587
EMAIL_USE_TLS     = True
DEFAULT_FROM_EMAIL = 'BusPassPro <noreply@buspasspro.edu>'

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
