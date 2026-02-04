from rest_framework import viewsets, status
from rest_framework.response import Response

from attendance.models import Attendance
from .models import Employee
from .serializers import EmployeeSerializer


class EmployeeViewSet(viewsets.ModelViewSet):
    """
    list    – GET  /api/employees
    create  – POST /api/employees
    destroy – DELETE /api/employees/{pk}
    """

    queryset = Employee.objects.all().order_by('-created_at')
    serializer_class = EmployeeSerializer

    # Only these HTTP methods are allowed on this endpoint
    http_method_names = ['get', 'post', 'delete']

    def create(self, request, *args, **kwargs):
        # Pre-check duplicate Employee ID → 409 Conflict (matches original API)
        employee_id = request.data.get('employeeId', '').strip()
        if employee_id and Employee.objects.filter(employee_id=employee_id).exists():
            return Response(
                {'message': f'Employee ID "{employee_id}" is already taken.'},
                status=status.HTTP_409_CONFLICT,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        # Remove every attendance record tied to this employee first
        Attendance.objects.filter(employee_id=instance.employee_id).delete()

        instance.delete()
        return Response({'message': 'Employee deleted successfully.'})
