#!/bin/bash
# Install dependencies
pip install -r requirements.txt --break-system-packages

# Collect static files only — NO database operations during build
# Database operations (migrate, seed) happen at runtime via Vercel
python manage.py collectstatic --noinput