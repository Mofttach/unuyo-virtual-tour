#!/bin/bash
pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate
# Safely seed initial data (only runs if DB is empty)
python manage.py seed_tour
# Attempt to create superuser
python manage.py createsuperuser --noinput || true