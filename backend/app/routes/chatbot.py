from flask import Blueprint, request, jsonify
from app import db
from app.models.chatbot import ChatbotMessage
from app.models.student import Student
from app.models.book import Book
from datetime import datetime
import re

chatbot_bp = Blueprint('chatbot', __name__)

# Predefined responses for common queries
RESPONSES = {
    'hello': 'Hello! Welcome to the Library Management System. How can I help you?',
    'help': 'I can help you with: book search, account info, fines, transaction history, and more. What would you like to know?',
    'hours': 'The library is open from 8 AM to 6 PM, Monday to Saturday.',
    'contact': 'You can contact the library at support@library.edu or visit us in person.',
}

@chatbot_bp.route('/message', methods=['POST'])
def send_message():
    """Send a message to the chatbot"""
    data = request.get_json()
    
    if not data or not data.get('message'):
        return jsonify({'message': 'Message is required'}), 400
    
    user_message = data['message'].lower().strip()
    student_id = data.get('student_id')
    
    # Generate bot response
    bot_response = generate_response(user_message, student_id)
    
    # Save message to database
    if student_id:
        student = db.session.get(Student, student_id)
        if student:
            chat_message = ChatbotMessage(
                student_id=student_id,
                user_message=data['message'],
                bot_response=bot_response
            )
            db.session.add(chat_message)
            db.session.commit()
    
    return jsonify({
        'user_message': data['message'],
        'bot_response': bot_response,
        'timestamp': datetime.utcnow().isoformat()
    }), 200

def generate_response(message, student_id=None):
    """Generate chatbot response based on user input"""
    
    # Check for predefined responses
    for key, response in RESPONSES.items():
        if key in message:
            return response
    
    # Search for books
    if 'book' in message or 'search' in message:
        search_term = message.replace('book', '').replace('search', '').strip()
        if search_term:
            books = Book.query.filter(
                (Book.title.ilike(f'%{search_term}%')) |
                (Book.author.ilike(f'%{search_term}%'))
            ).limit(3).all()
            
            if books:
                response = "I found these books:\n"
                for book in books:
                    response += f"- {book.title} by {book.author} (Available: {book.available_copies})\n"
                return response
            else:
                return f"Sorry, I couldn't find books matching '{search_term}'."
    
    # Check fines
    if 'fine' in message or 'due' in message or 'payment' in message:
        if student_id:
            from app.models.fine import Fine
            fines = Fine.query.filter_by(student_id=student_id, payment_status='pending').all()
            if fines:
                total_fine = sum(fine.amount for fine in fines)
                return f"You have {len(fines)} pending fine(s) totaling ₹{total_fine}. Please pay at the counter."
            else:
                return "Great! You don't have any pending fines."
        else:
            return "Please provide your student ID to check your fines."
    
    # Check active books
    if 'my book' in message or 'issued book' in message:
        if student_id:
            from app.models.transaction import Transaction
            transactions = Transaction.query.filter_by(student_id=student_id, status='issued').all()
            if transactions:
                response = "You have issued:\n"
                for trans in transactions:
                    book = db.session.get(Book, trans.book_id)
                    response += f"- {book.title} (Due: {trans.due_date})\n"
                return response
            else:
                return "You haven't issued any books."
        else:
            return "Please provide your student ID to check your issued books."
    
    # Default response
    return "I'm not sure about that. Try asking about books, fines, or your account. Type 'help' for more options."

@chatbot_bp.route('/chat-history/<int:student_id>', methods=['GET'])
def get_chat_history(student_id):
    """Get chat history for a student"""
    student = db.session.get(Student, student_id)
    
    if not student:
        return jsonify({'message': 'Student not found'}), 404
    
    messages = ChatbotMessage.query.filter_by(student_id=student_id).order_by(ChatbotMessage.timestamp.desc()).limit(50).all()
    
    return jsonify([message.to_dict() for message in messages]), 200
