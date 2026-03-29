from app import db
from datetime import datetime

class Book(db.Model):
    __tablename__ = 'books'
    
    book_id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    author = db.Column(db.String(100), nullable=False)
    isbn = db.Column(db.String(20), unique=True)
    publisher = db.Column(db.String(100))
    publication_year = db.Column(db.Integer)
    category = db.Column(db.String(50))
    total_copies = db.Column(db.Integer, default=1)
    available_copies = db.Column(db.Integer, default=1)
    qr_code = db.Column(db.String(255))
    location = db.Column(db.String(100))
    price = db.Column(db.Float)
    read_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    transactions = db.relationship('Transaction', backref='book', lazy=True)
    
    def to_dict(self):
        return {
            'book_id': self.book_id,
            'title': self.title,
            'author': self.author,
            'isbn': self.isbn,
            'publisher': self.publisher,
            'publication_year': self.publication_year,
            'category': self.category,
            'total_copies': self.total_copies,
            'available_copies': self.available_copies,
            'qr_code': self.qr_code,
            'location': self.location,
            'price': self.price,
            'read_count': self.read_count,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
