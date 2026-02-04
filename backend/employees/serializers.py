import re

from rest_framework import serializers

from .models import Employee


class EmployeeSerializer(serializers.ModelSerializer):
    """
    Serialiser that exposes camelCase keys to the frontend while the
    underlying model uses the standard snake_case Django convention.
    """

    # Explicit field declarations with source mapping
    employeeId = serializers.CharField(source='employee_id', max_length=50)
    fullName = serializers.CharField(source='full_name', max_length=150)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Employee
        fields = ['id', 'employeeId', 'fullName', 'email', 'department', 'createdAt']
        read_only_fields = ['id', 'createdAt']

    # ── field-level validation ─────────────────────────────────
    def validate_employeeId(self, value):
        value = value.strip()
        # Only enforce uniqueness on create (instance is None)
        if self.instance is None and Employee.objects.filter(employee_id=value).exists():
            raise serializers.ValidationError(
                f'Employee ID "{value}" is already taken.'
            )
        return value

    def validate_fullName(self, value):
        return value.strip()

    def validate_email(self, value):
        value = value.strip().lower()
        if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', value):
            raise serializers.ValidationError(
                'Please provide a valid email address.'
            )
        return value

    def validate_department(self, value):
        return value.strip()
