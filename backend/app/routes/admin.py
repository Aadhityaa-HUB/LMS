from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models.admin import Admin
from werkzeug.security import check_password_hash

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/login', methods=['POST'])
def login():
    """Admin login endpoint"""
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Missing username or password'}), 400
    
    admin = Admin.query.filter_by(username=data['username']).first()
    
    if not admin or not admin.check_password(data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401
    
    access_token = create_access_token(identity=admin.admin_id)
    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'admin': admin.to_dict()
    }), 200

@admin_bp.route('/register', methods=['POST'])
def register():
    """Admin registration endpoint"""
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password') or not data.get('email'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    if Admin.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists'}), 409
    
    if Admin.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already exists'}), 409
    
    admin = Admin(username=data['username'], email=data['email'])
    admin.set_password(data['password'])
    
    db.session.add(admin)
    db.session.commit()
    
    return jsonify({
        'message': 'Admin registered successfully',
        'admin': admin.to_dict()
    }), 201

@admin_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get admin profile"""
    admin_id = get_jwt_identity()
    admin = db.session.get(Admin, admin_id)
    
    if not admin:
        return jsonify({'message': 'Admin not found'}), 404
    
    return jsonify(admin.to_dict()), 200

@admin_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update admin profile"""
    admin_id = get_jwt_identity()
    admin = db.session.get(Admin, admin_id)
    
    if not admin:
        return jsonify({'message': 'Admin not found'}), 404
    
    data = request.get_json()
    
    if 'email' in data:
        admin.email = data['email']
    
    if 'password' in data:
        admin.set_password(data['password'])
    
    db.session.commit()
    
    return jsonify({
        'message': 'Profile updated successfully',
        'admin': admin.to_dict()
    }), 200
