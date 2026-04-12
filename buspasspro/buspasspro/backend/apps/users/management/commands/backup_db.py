import os
import subprocess
from datetime import datetime
from django.core.management.base import BaseCommand
from django.conf import settings
from django.core.management import call_command

class Command(BaseCommand):
    help = 'Backup the PostgreSQL database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--path',
            type=str,
            help='Specific path for the backup file',
        )

    def handle(self, *args, **options):
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_dir = os.path.join(settings.BASE_DIR, 'backups')
        
        if not os.path.exists(backup_dir):
            os.makedirs(backup_dir)
            self.stdout.write(self.style.SUCCESS(f'Created backup directory: {backup_dir}'))

        db_conf = settings.DATABASES['default']
        db_name = db_conf['NAME']
        db_user = db_conf['USER']
        db_pass = db_conf['PASSWORD']
        db_host = db_conf.get('HOST', 'localhost')
        db_port = db_conf.get('PORT', '5432')

        backup_file = options['path'] or os.path.join(backup_dir, f'backup_{timestamp}.json')

        # Portability fallback: Always create a JSON dump as a baseline
        self.stdout.write(f'Creating JSON snapshot to {backup_file}...')
        try:
            with open(backup_file, 'w', encoding='utf-8') as f:
                call_command('dumpdata', exclude=['auth.permission', 'contenttypes'], stdout=f)
            self.stdout.write(self.style.SUCCESS(f'Successfully created JSON backup: {backup_file}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'JSON backup failed: {str(e)}'))

        # If it's PostgreSQL, try to do a native sql dump if pg_dump is available
        if db_conf['ENGINE'] == 'django.db.backends.postgresql':
            sql_backup = os.path.join(backup_dir, f'backup_{timestamp}.sql')
            self.stdout.write(f'Attempting native PostgreSQL dump to {sql_backup}...')
            
            # Set password environment variable for pg_dump
            env = os.environ.copy()
            env['PGPASSWORD'] = str(db_pass)
            
            try:
                # Try to run pg_dump
                process = subprocess.run(
                    ['pg_dump', '-h', db_host, '-p', str(db_port), '-U', db_user, '-d', db_name, '-f', sql_backup],
                    env=env,
                    capture_output=True,
                    text=True
                )
                
                if process.returncode == 0:
                    self.stdout.write(self.style.SUCCESS(f'Successfully created SQL backup: {sql_backup}'))
                else:
                    self.stdout.write(self.style.WARNING(f'pg_dump failed (likely not in PATH). Error: {process.stderr[:200]}'))
                    self.stdout.write(self.style.NOTICE('Falling back to JSON snapshot only.'))
            except FileNotFoundError:
                self.stdout.write(self.style.WARNING('pg_dump utility not found in system PATH.'))
                self.stdout.write(self.style.NOTICE('Backup preserved as JSON snapshot.'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Native backup error: {str(e)}'))
