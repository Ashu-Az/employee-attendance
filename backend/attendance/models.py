from django.db import models


class Attendance(models.Model):
    STATUS_CHOICES = [
        ('Present', 'Present'),
        ('Absent', 'Absent'),
    ]

    employee_id = models.CharField(max_length=50, db_index=True)  # mirrors Employee.employee_id
    date = models.CharField(max_length=10, db_index=True)          # YYYY-MM-DD string
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # One record per employee per day – enforced at the DB level
        unique_together = ('employee_id', 'date')
        ordering = ['-date']
        indexes = [
            models.Index(fields=['employee_id', 'date']),
            models.Index(fields=['-date']),
        ]

    def __str__(self):
        return f'{self.employee_id} | {self.date} | {self.status}'
