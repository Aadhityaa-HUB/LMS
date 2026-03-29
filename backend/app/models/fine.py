from app import db
from datetime import datetime

class Fine(db.Model):
    __tablename__ = 'fines'
    
    fine_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.student_id'), nullable=False)
    transaction_id = db.Column(db.Integer, db.ForeignKey('transactions.transaction_id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    reason = db.Column(db.String(255))
    payment_status = db.Column(db.String(20), default='pending')
    payment_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'fine_id': self.fine_id,
            'student_id': self.student_id,
            'transaction_id': self.transaction_id,
            'amount': self.amount,
            'reason': self.reason,
            'payment_status': self.payment_status,
            'payment_date': self.payment_date.isoformat() if self.payment_date else None,
            'created_at': self.created_at.isoformat()
        }
