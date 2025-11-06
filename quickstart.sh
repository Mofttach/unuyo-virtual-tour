#!/bin/bash

# ========================================
# QUICK START SCRIPT
# Virtual Tour UNU Yogyakarta
# ========================================

echo "🕌 Virtual Tour UNU Yogyakarta - Quick Start"
echo "============================================="
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "📝 Creating virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Install dependencies if needed
echo "📦 Checking dependencies..."
pip install -q -r requirements.txt

# Run migrations
echo "🗄️  Running database migrations..."
python manage.py makemigrations --noinput
python manage.py migrate --noinput

# Create superuser (skip if exists)
echo ""
echo "👤 Django Admin Credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "📝 Creating superuser (skip if exists)..."
python manage.py shell << END
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@unu.ac.id', 'admin123')
    print('✅ Superuser created: admin / admin123')
else:
    print('ℹ️  Superuser already exists')
END

# Generate dummy data if no scenes exist
echo ""
echo "📸 Checking for scene data..."
python manage.py shell << END
from tour_api.models import Scene
if Scene.objects.count() == 0:
    print('📥 No scenes found. Generating dummy data...')
    import subprocess
    subprocess.call(['python', 'generate_dummy_data.py'])
else:
    print(f'✅ Found {Scene.objects.count()} scenes in database')
END

echo ""
echo "============================================="
echo "🚀 READY TO START!"
echo "============================================="
echo ""
echo "📌 Next Steps:"
echo ""
echo "1️⃣  Start Django server:"
echo "   python manage.py runserver"
echo ""
echo "2️⃣  Access Django Admin:"
echo "   http://127.0.0.1:8000/admin/"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "3️⃣  Test API:"
echo "   http://127.0.0.1:8000/api/scenes/"
echo "   http://127.0.0.1:8000/api/scenes/pannellum/"
echo ""
echo "4️⃣  Open Frontend:"
echo "   • Install 'Live Server' extension in VS Code"
echo "   • Right-click on frontend/index.html"
echo "   • Select 'Open with Live Server'"
echo ""
echo "   Or use Python HTTP server:"
echo "   cd frontend && python3 -m http.server 5500"
echo "   Then open: http://localhost:5500"
echo ""
echo "============================================="
echo "✨ Happy Coding!"
echo "============================================="
