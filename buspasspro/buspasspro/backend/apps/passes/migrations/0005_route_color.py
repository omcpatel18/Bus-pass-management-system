from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('passes', '0004_remove_passscanlog_conductor'),
    ]

    operations = [
        migrations.AddField(
            model_name='route',
            name='color',
            field=models.CharField(default='#1A4A8A', max_length=7),
        ),
    ]
