import os
import stripe
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.recharge_record import RechargeRecord

payment_bp = Blueprint('payment', __name__)

# Set Stripe API key from environment
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY', 'sk_test_your_stripe_test_key')

# Credit conversion rate (configurable)
CREDIT_CONVERSION_RATE = 10  # 1 currency unit = 10 credits

@payment_bp.route('/recharge', methods=['POST'])
@jwt_required()
def recharge():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({
            'success': False,
            'message': 'User not found'
        }), 404
    
    data = request.get_json()
    
    # Check if amount is provided
    if not data or not data.get('amount'):
        return jsonify({
            'success': False,
            'message': 'Amount is required'
        }), 400
    
    amount = float(data.get('amount'))
    
    # Validate amount
    if amount <= 0:
        return jsonify({
            'success': False,
            'message': 'Amount must be greater than zero'
        }), 400
    
    try:
        # Create Stripe Payment Intent
        payment_intent = stripe.PaymentIntent.create(
            amount=int(amount * 100),  # Convert to cents
            currency='usd',
            metadata={'user_id': str(user_id)}  # Ensure user_id is a string
        )
        
        # Calculate credits to be added
        credits_to_add = int(amount * CREDIT_CONVERSION_RATE)
        
        # Create recharge record
        recharge_record = RechargeRecord(
            user_id=user.id,
            amount=amount,
            credits_gained=credits_to_add,
            payment_id=payment_intent.id,
            status='pending'
        )
        
        db.session.add(recharge_record)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'client_secret': payment_intent.client_secret,
            'payment_id': payment_intent.id,
            'amount': amount,
            'credits_to_add': credits_to_add
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Payment initialization failed: {str(e)}'
        }), 500

@payment_bp.route('/payment-webhook', methods=['POST'])
def payment_webhook():
    payload = request.data
    sig_header = request.headers.get('Stripe-Signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, os.environ.get('STRIPE_WEBHOOK_SECRET', 'your_webhook_secret')
        )
    except ValueError as e:
        # Invalid payload
        return jsonify({'success': False}), 400
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        return jsonify({'success': False}), 400
    
    # Handle the event
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        payment_id = payment_intent['id']
        
        # Find the recharge record
        recharge_record = RechargeRecord.query.filter_by(payment_id=payment_id).first()
        
        if recharge_record and recharge_record.status != 'success':
            # Update recharge record status
            recharge_record.status = 'success'
            
            # Update user credit balance
            user = User.query.get(recharge_record.user_id)
            if user:
                user.credit_balance += recharge_record.credits_gained
                db.session.commit()
    
    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        payment_id = payment_intent['id']
        
        # Find the recharge record
        recharge_record = RechargeRecord.query.filter_by(payment_id=payment_id).first()
        
        if recharge_record:
            # Update recharge record status
            recharge_record.status = 'failed'
            db.session.commit()
    
    return jsonify({'success': True}), 200

@payment_bp.route('/credit/balance', methods=['GET'])
@jwt_required()
def get_credit_balance():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({
            'success': False,
            'message': 'User not found'
        }), 404
    
    return jsonify({
        'success': True,
        'credit_balance': user.credit_balance
    }), 200

@payment_bp.route('/recharge/history', methods=['GET'])
@jwt_required()
def recharge_history():
    user_id = get_jwt_identity()
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('limit', 10, type=int)
    
    # Get paginated records for the user
    records = RechargeRecord.query.filter_by(user_id=user_id) \
        .order_by(RechargeRecord.created_at.desc()) \
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