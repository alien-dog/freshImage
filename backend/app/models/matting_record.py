from app import db
from datetime import datetime

class MattingRecord(db.Model):
    __tablename__ = 'matting_history'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    original_image_path = db.Column(db.String(255), nullable=False)
    processed_image_path = db.Column(db.String(255), nullable=False)
    credit_consumed = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __init__(self, user_id, original_image_path, processed_image_path, credit_consumed=1):
        self.user_id = user_id
        self.original_image_path = original_image_path
        self.processed_image_path = processed_image_path
        self.credit_consumed = credit_consumed
    
    def to_dict(self):
        """Convert the matting record to a dictionary for JSON serialization."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'original_image_path': self.original_image_path,
            'processed_image_path': self.processed_image_path,
            'credit_consumed': self.credit_consumed,
            'created_at': self.created_at.isoformat() if self.created_at else None
        } 