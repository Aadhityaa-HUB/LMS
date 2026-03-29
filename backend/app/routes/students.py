from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.student import Student
from datetime import datetime

students_bp = Blueprint('students', __name__)

@students_bp.route('/', methods=['GET'])
@jwt_required()
def get_all_students():
    """Get all students"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    students = Student.query.paginate(page=page, per_page=per_page)
    
    return jsonify({
        'total': students.total,
        'pages': students.pages,
        'current_page': page,
        'students': [student.to_dict() for student in students.items]
    }), 200

@students_bp.route('/<int:student_id>', methods=['GET'])
def get_student(student_id):
    """Get student by ID"""
    student = Student.query.get(student_id)
    
    if not student:
        return jsonify({'message': 'Student not found'}), 404
    
    return jsonify(student.to_dict()), 200

@students_bp.route('/email/<email>', methods=['GET'])
def get_student_by_email(email):
    """Get student by email"""
    student = Student.query.filter_by(email=email).first()
    
    if not student:
        return jsonify({'message': 'Student not found'}), 404
    
    return jsonify(student.to_dict()), 200

@students_bp.route('/register', methods=['POST'])
def register_student():
    """Register a new student"""
    data = request.get_json()
    
    if not data or not data.get('name') or not data.get('email'):
        return jsonify({'message': 'Name and email are required'}), 400
    
    if Student.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already registered'}), 409
    
    if data.get('enrollment_number') and Student.query.filter_by(enrollment_number=data['enrollment_number']).first():
        return jsonify({'message': 'Enrollment number already exists'}), 409
    
    student = Student(
        name=data['name'],
        email=data['email'],
        phone=data.get('phone'),
        enrollment_number=data.get('enrollment_number'),
        department=data.get('department'),
        semester=data.get('semester'),
        status='active'
    )
    
    db.session.add(student)
    db.session.commit()
    
    return jsonify({
        'message': 'Student registered successfully',
        'student': student.to_dict()
    }), 201

@students_bp.route('/<int:student_id>', methods=['PUT'])
@jwt_required()
def update_student(student_id):
    """Update student profile"""
    student = Student.query.get(student_id)
    
    if not student:
        return jsonify({'message': 'Student not found'}), 404
    
    data = request.get_json()
    
    if 'name' in data:
        student.name = data['name']
    if 'phone' in data:
        student.phone = data['phone']
    if 'department' in data:
        student.department = data['department']
    if 'semester' in data:
        student.semester = data['semester']
    if 'status' in data:
        student.status = data['status']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Student profile updated successfully',
        'student': student.to_dict()
    }), 200

@students_bp.route('/<int:student_id>', methods=['DELETE'])
@jwt_required()
def deactivate_student(student_id):
    """Deactivate student"""
    student = Student.query.get(student_id)
    
    if not student:
        return jsonify({'message': 'Student not found'}), 404
    
    student.status = 'inactive'
    db.session.commit()
    
    return jsonify({'message': 'Student deactivated successfully'}), 200
