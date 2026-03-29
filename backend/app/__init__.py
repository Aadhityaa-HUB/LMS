from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import config
import os

db = SQLAlchemy()
jwt = JWTManager()

def create_app(config_name='development'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    CORS(app, resources={r"/*": {"origins": "*"}})
    
    db.init_app(app)
    jwt.init_app(app)
    
    # Register blueprints
    from app.routes.admin import admin_bp
    from app.routes.books import books_bp
    from app.routes.students import students_bp
    from app.routes.transactions import transactions_bp
    from app.routes.chatbot import chatbot_bp
    
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(books_bp, url_prefix='/api/books')
    app.register_blueprint(students_bp, url_prefix='/api/students')
    app.register_blueprint(transactions_bp, url_prefix='/api/transactions')
    app.register_blueprint(chatbot_bp, url_prefix='/api/chatbot')
    
    # Try to create tables, but don't fail if database is not available
    try:
        with app.app_context():
            db.create_all()
    except Exception as e:
        print(f"Warning: Could not create database tables: {e}")
        print("Database tables will be created when database connection is available.")
    
    return app
