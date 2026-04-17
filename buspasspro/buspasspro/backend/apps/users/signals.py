from django.db.models.signals import post_migrate
from django.dispatch import receiver

from .dev_seed import ensure_demo_users


@receiver(post_migrate)
def seed_demo_users_after_migrate(sender, **kwargs):
    if sender.name != 'apps.users':
        return
    ensure_demo_users()
