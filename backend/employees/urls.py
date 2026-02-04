from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

# trailing_slash=False keeps URLs like /api/employees (no trailing /)
router = DefaultRouter(trailing_slash=False)
router.register(r'employees', views.EmployeeViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
