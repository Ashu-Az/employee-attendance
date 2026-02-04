from django.urls import path, include
from django.http import JsonResponse
from datetime import datetime


def health_check(request):
    """Simple liveness probe – useful for Render and other hosts."""
    return JsonResponse({'status': 'ok', 'timestamp': datetime.now().isoformat()})


urlpatterns = [
    path('api/health', health_check, name='health'),
    path('api/', include('employees.urls')),
    path('api/', include('attendance.urls')),
]
