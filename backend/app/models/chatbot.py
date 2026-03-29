from app import db
from datetime import datetime

class ChatbotMessage(db.Model):
    __tablename__ = 'chatbot_messages'
    
    message_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.student_id'))
    user_message = db.Column(db.Text)
    bot_response = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'message_id': self.message_id,
            'student_id': self.student_id,
            'user_message': self.user_message,
            'bot_response': self.bot_response,
            'timestamp': self.timestamp.isoformat()
        }
