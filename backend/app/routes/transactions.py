from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.transaction import Transaction
from app.models.book import Book
from app.models.student import Student
from app.models.fine import Fine
from datetime import datetime, timedelta

transactions_bp = Blueprint('transactions', __name__)

@transactions_bp.route('/', methods=['GET'])
@jwt_required()
def get_all_transactions():
    """Get all transactions (admin)"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    transactions = Transaction.query.order_by(Transaction.issue_date.desc()).paginate(page=page, per_page=per_page)
    return jsonify([t.to_dict() for t in transactions.items]), 200

@transactions_bp.route('/fines', methods=['GET'])
@jwt_required()
def get_all_fines():
    """Get all fines (admin)"""
    fines = Fine.query.order_by(Fine.created_at.desc()).all()
    return jsonify([fine.to_dict() for fine in fines]), 200

@transactions_bp.route('/issue', methods=['POST'])
@jwt_required()
def issue_book():
    """Issue a book to a student"""
    data = request.get_json()
    
    if not data or not data.get('book_id') or not data.get('student_id'):
        return jsonify({'message': 'Book ID and Student ID are required'}), 400
    
    book = db.session.get(Book, data['book_id'])
    student = db.session.get(Student, data['student_id'])
    
    if not book:
        return jsonify({'message': 'Book not found'}), 404
    if not student:
        return jsonify({'message': 'Student not found'}), 404
    
    if book.available_copies <= 0:
        return jsonify({'message': 'Book not available'}), 400
    
    # Create transaction
    due_date = (datetime.utcnow() + timedelta(days=14)).date()
    transaction = Transaction(
        book_id=data['book_id'],
        student_id=data['student_id'],
        due_date=due_date,
        status='issued'
    )
    
    # Update book availability
    book.available_copies -= 1
    book.read_count += 1
    
    db.session.add(transaction)
    db.session.commit()
    
    return jsonify({
        'message': 'Book issued successfully',
        'transaction': transaction.to_dict()
    }), 201

@transactions_bp.route('/return/<int:transaction_id>', methods=['POST'])
def return_book(transaction_id):
    """Return a book"""
    transaction = db.session.get(Transaction, transaction_id)
    
    if not transaction:
        return jsonify({'message': 'Transaction not found'}), 404
    
    if transaction.status == 'returned':
        return jsonify({'message': 'Book already returned'}), 400
    
    book = db.session.get(Book, transaction.book_id)
    
    # Calculate fine if overdue
    today = datetime.utcnow().date()
    fine_amount = 0
    
    if today > transaction.due_date:
        days_late = (today - transaction.due_date).days
        fine_amount = days_late * 10  # ₹10 per day fine
    
    # Always mark as returned once the book is handed back
    transaction.status = 'returned'
    
    transaction.return_date = today
    transaction.fine_amount = fine_amount
    
    # Update book availability
    book.available_copies += 1
    
    # Create fine record if applicable
    if fine_amount > 0:
        fine = Fine(
            student_id=transaction.student_id,
            transaction_id=transaction_id,
            amount=fine_amount,
            reason=f'Late return - {days_late} days overdue',
            payment_status='pending'
        )
        db.session.add(fine)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Book returned successfully',
        'transaction': transaction.to_dict(),
        'fine_amount': fine_amount
    }), 200

@transactions_bp.route('/student/<int:student_id>/active', methods=['GET'])
def get_student_active_books(student_id):
    """Get active books issued to a student"""
    student = db.session.get(Student, student_id)
    
    if not student:
        return jsonify({'message': 'Student not found'}), 404
    
    transactions = Transaction.query.filter_by(student_id=student_id, status='issued').all()
    
    return jsonify([transaction.to_dict() for transaction in transactions]), 200

@transactions_bp.route('/student/<int:student_id>/history', methods=['GET'])
def get_student_transaction_history(student_id):
    """Get transaction history for a student"""
    student = db.session.get(Student, student_id)
    
    if not student:
        return jsonify({'message': 'Student not found'}), 404
    
    transactions = Transaction.query.filter_by(student_id=student_id).all()
    
    return jsonify([transaction.to_dict() for transaction in transactions]), 200

@transactions_bp.route('/overdue', methods=['GET'])
@jwt_required()
def get_overdue_books():
    """Get all overdue books"""
    today = datetime.utcnow().date()
    
    transactions = Transaction.query.filter(
        Transaction.status.in_(['issued', 'overdue']),
        Transaction.due_date < today
    ).all()
    
    return jsonify([transaction.to_dict() for transaction in transactions]), 200

@transactions_bp.route('/<int:transaction_id>', methods=['GET'])
def get_transaction_details(transaction_id):
    """Get transaction details"""
    transaction = Transaction.query.get(transaction_id)
    
    if not transaction:
        return jsonify({'message': 'Transaction not found'}), 404
    
    return jsonify(transaction.to_dict()), 200

@transactions_bp.route('/fine/pay/<int:fine_id>', methods=['POST'])
def pay_fine(fine_id):
    """Mark fine as paid"""
    fine = db.session.get(Fine, fine_id)
    
    if not fine:
        return jsonify({'message': 'Fine not found'}), 404
    
    if fine.payment_status == 'paid':
        return jsonify({'message': 'Fine already paid'}), 400
    
    fine.payment_status = 'paid'
    fine.payment_date = datetime.utcnow()
    
    # Mark transaction fine as paid
    transaction = db.session.get(Transaction, fine.transaction_id)
    transaction.fine_paid = True
    
    db.session.commit()
    
    return jsonify({
        'message': 'Fine paid successfully',
        'fine': fine.to_dict()
    }), 200

@transactions_bp.route('/fine/student/<int:student_id>', methods=['GET'])
def get_student_fines(student_id):
    """Get fines for a student"""
    student = db.session.get(Student, student_id)
    
    if not student:
        return jsonify({'message': 'Student not found'}), 404
    
    fines = Fine.query.filter_by(student_id=student_id).all()
    
    return jsonify([fine.to_dict() for fine in fines]), 200
