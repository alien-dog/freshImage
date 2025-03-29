from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models.user import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Check if required fields are provided
    if not data or not data.get('username') or not data.get('password') or not data.get('confirm_password'):
        return jsonify({
            'success': False,
            'message': 'Missing required fields (username, password, confirm_password)'
        }), 400
    
    # Check if passwords match
    if data.get('password') != data.get('confirm_password'):
        return jsonify({
            'success': False,
            'message': 'Passwords do not match'
        }), 400
    
    # Check if username already exists
    if User.query.filter_by(username=data.get('username')).first():
        return jsonify({
            'success': False,
            'message': 'Username already exists'
        }), 400
    
    # Create new user
    try:
        new_user = User(
            username=data.get('username'),
            password=data.get('password')
        )
        db.session.add(new_user)
        db.session.commit()
        
        # Generate token
        access_token = create_access_token(identity=new_user.id)
        
        return jsonify({
            'success': True,
            'token': access_token,
            'user': new_user.to_dict(),
            'expires_in': 3600  # 1 hour in seconds
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Error creating user: {str(e)}'
        }), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Check if required fields are provided
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({
            'success': False,
            'message': 'Missing required fields (username, password)'
        }), 400
    
    # Find user by username
    user = User.query.filter_by(username=data.get('username')).first()
    
    # Check if user exists and password matches
    if not user or not user.check_password(data.get('password')):
        return jsonify({
            'success': False,
            'message': 'Invalid username or password'
        }), 401
    
    # Generate token
    access_token = create_access_token(identity=user.id)
    
    return jsonify({
        'success': True,
        'token': access_token,
        'user': user.to_dict(),
        'expires_in': 3600  # 1 hour in seconds
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({
            'success': False,
            'message': 'User not found'
        }), 404
    
    return jsonify({
        'success': True,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    # In a more complete implementation, we would add the token to a blacklist
    # For now, we just return success as the client will remove the token
    return jsonify({
        'success': True
    }), 200 