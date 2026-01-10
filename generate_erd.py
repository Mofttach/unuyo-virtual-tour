#!/usr/bin/env python3
"""
ERD Generator - Virtual Tour UNU Yogyakarta
Generates visual ERD diagrams from database schema

Requirements:
    pip install eralchemy2 graphviz

Usage:
    python generate_erd.py
"""

import os
import sys
from pathlib import Path

def check_dependencies():
    """Check if required dependencies are installed"""
    try:
        import eralchemy2
        print("✓ eralchemy2 installed")
        return True
    except ImportError:
        print("✗ eralchemy2 not installed")
        print("\nInstall dependencies with:")
        print("  pip install eralchemy2 graphviz")
        return False

def generate_from_sql():
    """Generate ERD from SQL file"""
    from eralchemy2 import render_er
    
    sql_file = Path(__file__).parent / "erd_schema.sql"
    output_png = Path(__file__).parent / "DATABASE_ERD.png"
    output_pdf = Path(__file__).parent / "DATABASE_ERD.pdf"
    output_dot = Path(__file__).parent / "DATABASE_ERD.dot"
    
    if not sql_file.exists():
        print(f"✗ SQL file not found: {sql_file}")
        return False
    
    print(f"\n📄 Reading SQL schema from: {sql_file}")
    
    try:
        # Generate PNG
        print(f"🎨 Generating PNG diagram...")
        render_er(str(sql_file), str(output_png))
        print(f"✓ PNG created: {output_png}")
        
        # Generate PDF
        print(f"📊 Generating PDF diagram...")
        render_er(str(sql_file), str(output_pdf))
        print(f"✓ PDF created: {output_pdf}")
        
        # Generate DOT (Graphviz source)
        print(f"🔧 Generating DOT file...")
        render_er(str(sql_file), str(output_dot))
        print(f"✓ DOT created: {output_dot}")
        
        return True
        
    except Exception as e:
        print(f"✗ Error generating ERD: {e}")
        return False

def generate_from_django():
    """Generate ERD from Django models"""
    from eralchemy2 import render_er
    
    output_png = Path(__file__).parent / "DATABASE_ERD_DJANGO.png"
    output_pdf = Path(__file__).parent / "DATABASE_ERD_DJANGO.pdf"
    
    print(f"\n📦 Generating ERD from Django models...")
    
    try:
        # Setup Django environment
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'unu_tour.settings')
        import django
        django.setup()
        
        # Generate from Django ORM
        print(f"🎨 Generating PNG diagram from Django models...")
        render_er("django://", str(output_png))
        print(f"✓ PNG created: {output_png}")
        
        print(f"📊 Generating PDF diagram from Django models...")
        render_er("django://", str(output_pdf))
        print(f"✓ PDF created: {output_pdf}")
        
        return True
        
    except ImportError:
        print("⚠ Django not configured. Using SQL schema instead.")
        return False
    except Exception as e:
        print(f"✗ Error generating Django ERD: {e}")
        return False

def generate_mermaid_preview():
    """Generate HTML preview with Mermaid.js diagram"""
    html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ERD - Virtual Tour UNU Yogyakarta</title>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            margin-bottom: 0.5rem;
        }
        .subtitle {
            color: #7f8c8d;
            margin-bottom: 2rem;
        }
        .mermaid {
            background: white;
            padding: 1rem;
            border-radius: 4px;
        }
        .info {
            margin-top: 2rem;
            padding: 1rem;
            background: #e8f5e9;
            border-left: 4px solid #4caf50;
            border-radius: 4px;
        }
        .info h3 {
            margin-top: 0;
            color: #2e7d32;
        }
        .info ul {
            margin: 0.5rem 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Entity Relationship Diagram</h1>
        <p class="subtitle">Virtual Tour UNU Yogyakarta - Database Schema</p>
        
        <div class="mermaid">
erDiagram
    SCENE ||--o{ HOTSPOT : "has many"
    SCENE ||--o{ HOTSPOT : "referenced by"
    
    SCENE {
        int id PK
        string title
        string slug UK
        text description
        string building
        int floor "nullable"
        string floor_description
        int order
        string location
        date published_date
        image panorama_image
        image thumbnail
        string author
        boolean is_active
        boolean is_featured
        float initial_pitch
        float initial_yaw
        float initial_fov
        datetime created_at
        datetime updated_at
    }
    
    HOTSPOT {
        int id PK
        int from_scene_id FK
        int to_scene_id FK "nullable"
        string hotspot_type "scene|info|floor"
        float pitch
        float yaw
        string text
        text info_description
        datetime created_at
    }
        </div>
        
        <div class="info">
            <h3>📊 Database Statistics</h3>
            <ul>
                <li><strong>Tables:</strong> 2 (Scene, Hotspot)</li>
                <li><strong>Relationships:</strong> 1:N (One-to-Many)</li>
                <li><strong>Total Fields:</strong> 28 fields</li>
                <li><strong>Foreign Keys:</strong> 2 (from_scene_id, to_scene_id)</li>
            </ul>
        </div>
        
        <div class="info" style="background: #e3f2fd; border-left-color: #2196f3;">
            <h3>🔗 Relationships</h3>
            <ul>
                <li><strong>Scene → Hotspot:</strong> One scene can have many hotspots</li>
                <li><strong>Scene ← Hotspot:</strong> One scene can be referenced by many hotspots</li>
                <li><strong>Cascade Delete:</strong> Deleting a scene will delete all its hotspots</li>
            </ul>
        </div>
    </div>
    
    <script>
        mermaid.initialize({ 
            startOnLoad: true,
            theme: 'default',
            themeVariables: {
                primaryColor: '#4caf50',
                primaryTextColor: '#fff',
                primaryBorderColor: '#388e3c',
                lineColor: '#757575',
                secondaryColor: '#2196f3',
                tertiaryColor: '#fff'
            }
        });
    </script>
</body>
</html>"""
    
    output_html = Path(__file__).parent / "DATABASE_ERD.html"
    output_html.write_text(html_content, encoding='utf-8')
    print(f"✓ HTML preview created: {output_html}")
    print(f"  Open in browser: file://{output_html.absolute()}")

def main():
    """Main execution"""
    print("=" * 60)
    print("ERD Generator - Virtual Tour UNU Yogyakarta")
    print("=" * 60)
    
    # Generate Mermaid HTML preview (always available)
    print("\n1️⃣  Generating Mermaid.js HTML Preview...")
    generate_mermaid_preview()
    
    # Check dependencies for advanced features
    print("\n2️⃣  Checking dependencies for PNG/PDF generation...")
    if check_dependencies():
        print("\n3️⃣  Generating ERD diagrams...")
        
        # Try Django first, fallback to SQL
        if not generate_from_django():
            generate_from_sql()
    else:
        print("\n⚠ PNG/PDF generation skipped (dependencies not installed)")
        print("HTML preview is available and works without additional dependencies.")
    
    print("\n" + "=" * 60)
    print("✅ ERD Generation Complete!")
    print("=" * 60)
    print("\nGenerated files:")
    
    for file in Path(__file__).parent.glob("DATABASE_ERD.*"):
        size = file.stat().st_size
        print(f"  • {file.name} ({size:,} bytes)")
    
    print("\n💡 Tip: Open DATABASE_ERD.html in your browser for interactive view")

if __name__ == "__main__":
    main()
