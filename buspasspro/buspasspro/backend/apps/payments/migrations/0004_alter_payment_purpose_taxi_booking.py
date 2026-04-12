from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0003_alter_payment_purpose'),
    ]

    operations = [
        migrations.AlterField(
            model_name='payment',
            name='purpose',
            field=models.CharField(
                choices=[
                    ('PASS_PURCHASE', 'Pass Purchase'),
                    ('PASS_RENEWAL', 'Pass Renewal'),
                    ('WALLET_TOPUP', 'Wallet Topup'),
                    ('TICKET', 'Ticket'),
                    ('TAXI_BOOKING', 'Taxi Booking'),
                ],
                max_length=20,
            ),
        ),
    ]
