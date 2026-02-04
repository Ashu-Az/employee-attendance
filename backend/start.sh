#!/bin/bash
# Render start script — runs migrations then launches gunicorn
python manage.py migrate
exec gunicorn hrms_project.wsgi:application --bind 0.0.0.0:${PORT:-8000}
