from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.book import Book
from app.models.transaction import Transaction
import qrcode
from io import BytesIO
import base64

books_bp = Blueprint('books', __name__)

@books_bp.route('/', methods=['GET'])
def get_all_books():
    """Get all books"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    books = Book.query.paginate(page=page, per_page=per_page)
    
    return jsonify({
        'total': books.total,
        'pages': books.pages,
        'current_page': page,
        'books': [book.to_dict() for book in books.items]
    }), 200

@books_bp.route('/<int:book_id>', methods=['GET'])
def get_book(book_id):
    """Get book by ID"""
    book = db.session.get(Book, book_id)
    
    if not book:
        return jsonify({'message': 'Book not found'}), 404
    
    return jsonify(book.to_dict()), 200

@books_bp.route('/search', methods=['GET'])
def search_books():
    """Search books by title, author, or category"""
    query = request.args.get('q', '', type=str)
    search_type = request.args.get('type', 'all', type=str)
    
    if not query:
        return jsonify({'message': 'Search query is required'}), 400
    
    if search_type == 'title':
        books = Book.query.filter(Book.title.ilike(f'%{query}%')).all()
    elif search_type == 'author':
        books = Book.query.filter(Book.author.ilike(f'%{query}%')).all()
    elif search_type == 'category':
        books = Book.query.filter(Book.category.ilike(f'%{query}%')).all()
    else:
        books = Book.query.filter(
            (Book.title.ilike(f'%{query}%')) |
            (Book.author.ilike(f'%{query}%')) |
            (Book.category.ilike(f'%{query}%'))
        ).all()
    
    return jsonify([book.to_dict() for book in books]), 200

@books_bp.route('/', methods=['POST'])
@jwt_required()
def add_book():
    """Add a new book"""
    data = request.get_json()
    
    if not data or not data.get('title') or not data.get('author'):
        return jsonify({'message': 'Title and author are required'}), 400
    
    # Generate QR code (without Pillow - text-based)
    qr_code_data = f"BOOK|ISBN:{data.get('isbn', 'N/A')}|TITLE:{data.get('title')}"
    
    book = Book(
        title=data['title'],
        author=data['author'],
        isbn=data.get('isbn'),
        publisher=data.get('publisher'),
        publication_year=data.get('publication_year'),
        category=data.get('category'),
        total_copies=data.get('total_copies', 1),
        available_copies=data.get('available_copies', 1),
        location=data.get('location'),
        price=data.get('price'),
        qr_code=qr_code_data
    )
    
    db.session.add(book)
    db.session.commit()
    
    return jsonify({
        'message': 'Book added successfully',
        'book': book.to_dict()
    }), 201

@books_bp.route('/<int:book_id>', methods=['PUT'])
@jwt_required()
def update_book(book_id):
    """Update book details"""
    book = db.session.get(Book, book_id)
    
    if not book:
        return jsonify({'message': 'Book not found'}), 404
    
    data = request.get_json()
    
    if 'title' in data:
        book.title = data['title']
    if 'author' in data:
        book.author = data['author']
    if 'publisher' in data:
        book.publisher = data['publisher']
    if 'category' in data:
        book.category = data['category']
    if 'total_copies' in data:
        book.total_copies = data['total_copies']
    if 'available_copies' in data:
        book.available_copies = data['available_copies']
    if 'location' in data:
        book.location = data['location']
    if 'price' in data:
        book.price = data['price']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Book updated successfully',
        'book': book.to_dict()
    }), 200

@books_bp.route('/<int:book_id>', methods=['DELETE'])
@jwt_required()
def delete_book(book_id):
    """Delete a book"""
    book = db.session.get(Book, book_id)
    
    if not book:
        return jsonify({'message': 'Book not found'}), 404
    
    db.session.delete(book)
    db.session.commit()
    
    return jsonify({'message': 'Book deleted successfully'}), 200

@books_bp.route('/most-read', methods=['GET'])
def get_most_read_books():
    """Get most read books"""
    limit = request.args.get('limit', 10, type=int)
    
    books = db.session.query(Book).outerjoin(Transaction).group_by(Book.book_id).order_by(Book.read_count.desc()).limit(limit).all()
    
    return jsonify([book.to_dict() for book in books]), 200

@books_bp.route('/available', methods=['GET'])
def get_available_books():
    """Get available books"""
    books = Book.query.filter(Book.available_copies > 0).all()
    
    return jsonify([book.to_dict() for book in books]), 200
