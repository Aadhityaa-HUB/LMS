from app import db
from datetime import datetime, timedelta

class Transaction(db.Model):
    __tablename__ = 'transactions'
    
    transaction_id = db.Column(db.Integer, primary_key=True)
    book_id = db.Column(db.Integer, db.ForeignKey('books.book_id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('students.student_id'), nullable=False)
    issue_date = db.Column(db.DateTime, default=datetime.utcnow)
    due_date = db.Column(db.Date, default=lambda: (datetime.utcnow() + timedelta(days=14)).date())
    return_date = db.Column(db.Date)
    status = db.Column(db.String(20), default='issued')
    fine_amount = db.Column(db.Float, default=0)
    fine_paid = db.Column(db.Boolean, default=False)
    
    # Relationships
    fines = db.relationship('Fine', backref='transaction', lazy=True)
    
    def calculate_fine(self, fine_per_day=10):
        if self.return_date is None:
            today = datetime.utcnow().date()
            if today > self.due_date:
                days_late = (today - self.due_date).days
                self.fine_amount = days_late * fine_per_day
                self.status = 'overdue'
        return self.fine_amount
    
    def to_dict(self):
        return {
            'transaction_id': self.transaction_id,
            'book_id': self.book_id,
            'student_id': self.student_id,
            'issue_date': self.issue_date.isoformat(),
            'due_date': self.due_date.isoformat(),
            'return_date': self.return_date.isoformat() if self.return_date else None,
            'status': self.status,
            'fine_amount': self.fine_amount,
            'fine_paid': self.fine_paid
        }
