import os
import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from PIL import Image
from app import db
from app.models.user import User
from app.models.matting_record import MattingRecord
from app.services.matting_service import process_image

matting_bp = Blueprint('matting', __name__)

# Ensure upload directories exist
def ensure_upload_dirs():
    upload_dir = os.path.join(current_app.root_path, 'uploads')
    original_dir = os.path.join(upload_dir, 'original')
    processed_dir = os.path.join(upload_dir, 'processed')
    
    os.makedirs(original_dir, exist_ok=True)
    os.makedirs(processed_dir, exist_ok=True)
    
    return original_dir, processed_dir

# Validate file extension
def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@matting_bp.route('/matting', methods=['POST'])
@jwt_required()
def matting():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({
            'success': False,
            'message': 'User not found'
        }), 404
    
    # Check if user has enough credits
    if user.credit_balance < 1:
        return jsonify({
            'success': False,
            'message': 'Insufficient credits. Please recharge.'
        }), 403
    
    # Check if file is in the request
    if 'image' not in request.files:
        return jsonify({
            'success': False,
            'message': 'No image file found in request'
        }), 400
    
    file = request.files['image']
    
    # Check if filename is empty
    if file.filename == '':
        return jsonify({
            'success': False,
            'message': 'No selected file'
        }), 400
    
    # Check if file type is allowed
    if not allowed_file(file.filename):
        return jsonify({
            'success': False,
            'message': 'File type not allowed. Please upload a PNG or JPG/JPEG file.'
        }), 400
    
    try:
        # Create upload directories if they don't exist
        original_dir, processed_dir = ensure_upload_dirs()
        
        # Generate a unique filename
        filename = secure_filename(file.filename)
        ext = filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4().hex}.{ext}"
        
        # Save original image
        original_path = os.path.join(original_dir, unique_filename)
        file.save(original_path)
        
        # Process image (remove background)
        processed_filename = f"processed_{unique_filename}"
        processed_path = os.path.join(processed_dir, processed_filename)
        
        success = process_image(original_path, processed_path)
        
        if not success:
            return jsonify({
                'success': False,
                'message': 'Failed to process image'
            }), 500
        
        # Create matting record
        record = MattingRecord(
            user_id=user.id,
            original_image_path=f"/uploads/original/{unique_filename}",
            processed_image_path=f"/uploads/processed/{processed_filename}",
            credit_consumed=1
        )
        
        # Update user credit balance
        user.credit_balance -= 1
        
        # Save changes to database
        db.session.add(record)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'processed_image': record.processed_image_path,
            'remaining_credit': user.credit_balance
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Error processing image: {str(e)}'
        }), 500

@matting_bp.route('/matting/history', methods=['GET'])
@jwt_required()
def matting_history():
    user_id = get_jwt_identity()
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('limit', 10, type=int)
    
    # Get paginated records for the user
    records = MattingRecord.query.filter_by(user_id=user_id) \
        .order_by(MattingRecord.created_at.desc()) \
        .paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'success': True,
        'records': [record.to_dict() for record in records.items],
        'pagination': {
            'total': records.total,
            'pages': records.pages,
            'current_page': records.page,
            'per_page': records.per_page
        }
    }), 200 