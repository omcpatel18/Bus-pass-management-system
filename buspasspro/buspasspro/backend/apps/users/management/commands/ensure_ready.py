from django.core.management.base import BaseCommand
from apps.users.dev_seed import ensure_demo_users

class Command(BaseCommand):
    help = 'Ensures demo users are seeded properly before starting'

    def handle(self, *args, **options):
        self.stdout.write('Checking demo users...')
        try:
            ensure_demo_users()
            self.stdout.write(self.style.SUCCESS('Demo users verified/created.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Could not seed demo users: {e}'))
