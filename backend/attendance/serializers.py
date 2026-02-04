from rest_framework import serializers

from .models import Attendance


class AttendanceSerializer(serializers.ModelSerializer):
    """camelCase output to match what the React frontend expects."""

    employeeId = serializers.CharField(source='employee_id')
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Attendance
        fields = ['id', 'employeeId', 'date', 'status', 'createdAt']
        read_only_fields = ['id', 'createdAt']
