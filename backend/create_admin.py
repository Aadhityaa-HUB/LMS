import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app, db
from app.models.admin import Admin

app = create_app('development')

with app.app_context():
    # Check if admin already exists
    existing = Admin.query.filter_by(username='admin').first()
    if existing:
        print("Admin user already exists!")
    else:
        admin = Admin(username='admin', email='admin@library.edu')
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.commit()
        print("✅ Admin user created successfully!")
        print("   Username: admin")
        print("   Password: admin123")
