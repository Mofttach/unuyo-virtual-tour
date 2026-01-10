#!/bin/bash
# Build script for Render/Railway

# 1. Install dependencies
pip install -r requirements.txt

# 2. Collect static files
python manage.py collectstatic --noinput

# 3. Migrate database
python manage.py migrate
