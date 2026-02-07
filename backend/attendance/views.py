from datetime import datetime, timedelta
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from employees.models import Employee
from .models import Attendance
from .serializers import AttendanceSerializer


class AttendancePagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 500


class AttendanceViewSet(viewsets.ModelViewSet):
    """
    list            – GET  /api/attendance          (supports ?startDate & ?endDate)
    create (upsert) – POST /api/attendance
    by_employee     – GET  /api/attendance/employee/{employeeId}
    """

    queryset = Attendance.objects.all().order_by('-date')
    serializer_class = AttendanceSerializer
    pagination_class = AttendancePagination
    http_method_names = ['get', 'post']

    # ── filtered list ──────────────────────────────────────────
    def get_queryset(self):
        qs = super().get_queryset()
        start = self.request.query_params.get('startDate')
        end = self.request.query_params.get('endDate')

        # If no date range specified, default to last 30 days for better performance
        if not start and not end:
            thirty_days_ago = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
            qs = qs.filter(date__gte=thirty_days_ago)
        elif start and end:
            qs = qs.filter(date__gte=start, date__lte=end)

        return qs

    # ── create / update (upsert) ───────────────────────────────
    def create(self, request, *args, **kwargs):
        employee_id = request.data.get('employeeId', '').strip()
        date = request.data.get('date', '').strip()
        att_status = request.data.get('status', '').strip()

        # --- validation ---
        if not employee_id or not date or not att_status:
            return Response(
                {'message': 'All fields are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if att_status not in ('Present', 'Absent'):
            return Response(
                {'message': 'Status must be Present or Absent.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not Employee.objects.filter(employee_id=employee_id).exists():
            return Response(
                {'message': 'Employee not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # --- upsert: update existing record or create a new one ---
        attendance, created = Attendance.objects.update_or_create(
            employee_id=employee_id,
            date=date,
            defaults={'status': att_status},
        )

        data = AttendanceSerializer(attendance).data
        if not created:
            data['updated'] = True

        http_status = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(data, status=http_status)

    # ── custom action: records for a single employee ───────────
    @action(
        detail=False,
        methods=['get'],
        url_path=r'employee/(?P<employee_id>[^/.]+)',
        url_name='by-employee',
    )
    def by_employee(self, request, employee_id=None):
        records = Attendance.objects.filter(employee_id=employee_id).order_by('-date')
        serializer = self.get_serializer(records, many=True)
        return Response(serializer.data)
