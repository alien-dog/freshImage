from app import db
from datetime import datetime

class RechargeRecord(db.Model):
    __tablename__ = 'recharge_history'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)  # Recharged amount in currency
    credits_gained = db.Column(db.Integer, nullable=False)  # Credits gained from recharge
    payment_method = db.Column(db.String(50), default='stripe')
    payment_id = db.Column(db.String(255))  # Payment ID from Stripe
    status = db.Column(db.String(20), default='pending')  # pending, success, failed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __init__(self, user_id, amount, credits_gained, payment_method='stripe', payment_id=None, status='pending'):
        self.user_id = user_id
        self.amount = amount
        self.credits_gained = credits_gained
        self.payment_method = payment_method
        self.payment_id = payment_id
        self.status = status
    
    def to_dict(self):
        """Convert the recharge record to a dictionary for JSON serialization."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'amount': self.amount,
            'credits_gained': self.credits_gained,
            'payment_method': self.payment_method,
            'payment_id': self.payment_id,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        } 