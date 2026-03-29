from app import db
from datetime import datetime

class Student(db.Model):
    __tablename__ = 'students'
    
    student_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(15))
    enrollment_number = db.Column(db.String(50), unique=True)
    department = db.Column(db.String(50))
    semester = db.Column(db.Integer)
    registration_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='active')
    
    # Relationships
    transactions = db.relationship('Transaction', backref='student', lazy=True)
    fines = db.relationship('Fine', backref='student', lazy=True)
    chatbot_messages = db.relationship('ChatbotMessage', backref='student', lazy=True)
    
    def to_dict(self):
        return {
            'student_id': self.student_id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'enrollment_number': self.enrollment_number,
            'department': self.department,
            'semester': self.semester,
            'registration_date': self.registration_date.isoformat(),
            'status': self.status
        }
