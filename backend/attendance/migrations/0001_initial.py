from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Attendance',
            fields=[
                (
                    'id',
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name='ID',
                    ),
                ),
                ('employee_id', models.CharField(max_length=50)),
                ('date', models.CharField(max_length=10)),
                (
                    'status',
                    models.CharField(
                        choices=[('Present', 'Present'), ('Absent', 'Absent')],
                        max_length=10,
                    ),
                ),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['-date'],
                'unique_together': {('employee_id', 'date')},
            },
        ),
    ]
