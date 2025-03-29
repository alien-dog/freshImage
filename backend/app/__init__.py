from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
import os
from datetime import timedelta
import pymysql
from urllib.parse import quote_plus

# Register PyMySQL as the MySQL driver
pymysql.install_as_MySQLdb()

# Initialize SQLAlchemy
db = SQLAlchemy()

# Initialize JWT Manager
jwt = JWTManager()

def create_app():
    # Create and configure the app
    app = Flask(__name__)
    CORS(app)
    
    # Load configuration from environment variables
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
    
    # Direct MySQL configuration instead of URI
    db_user = os.environ.get('DB_USER', 'root')

    db_password = os.environ.get('DB_PASSWORD', 'Ir%86241992')
    encoded_password = quote_plus(db_password)
    db_host = os.environ.get('DB_HOST', 'localhost')
    db_name = os.environ.get('DB_NAME', 'database_name')
    
    # Use custom connection string format to avoid encoding issues
    app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{db_user}:{encoded_password}@{db_host}/{db_name}?charset=utf8mb4"
    print(app.config['SQLALCHEMY_DATABASE_URI'])
    # Disable pooling which can help with connection issues
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_recycle': 280,
        'pool_timeout': 20,
        'pool_pre_ping': True
    }
    
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
    
    # Initialize extensions with app
    db.init_app(app)
    jwt.init_app(app)
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.matting import matting_bp
    from app.routes.payment import payment_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(matting_bp, url_prefix='/api')
    app.register_blueprint(payment_bp, url_prefix='/api')
    
    return app 