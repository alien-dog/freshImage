import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { initializePayment, getCreditBalance } from '../services/paymentService';

// Load Stripe.js
const stripePromise = loadStripe('pk_test_your_stripe_public_key');

// Credit options
const CREDIT_PACKAGES = [
  { amount: 10, credits: 100, label: '100 Credits' },
  { amount: 20, credits: 220, label: '220 Credits (10% bonus)' },
  { amount: 50, credits: 600, label: '600 Credits (20% bonus)' },
  { amount: 100, credits: 1300, label: '1300 Credits (30% bonus)' }
];

// Card element style
const cardStyle = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4'
      }
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a'
    }
  }
};

// Checkout form component
const CheckoutForm = ({ amount, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);
  
  useEffect(() => {
    const fetchPaymentIntent = async () => {
      setProcessing(true);
      setError(null);
      
      try {
        const data = await initializePayment(amount);
        
        if (data.success) {
          setPaymentInfo({
            clientSecret: data.client_secret,
            paymentId: data.payment_id,
            amount: data.amount,
            credits: data.credits_to_add
          });
        } else {
          setError(data.message || 'Failed to initialize payment');
        }
      } catch (err) {
        setError(err.message || 'An error occurred. Please try again.');
      } finally {
        setProcessing(false);
      }
    };
    
    fetchPaymentIntent();
  }, [amount]);
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements || !paymentInfo) {
      return;
    }
    
    setProcessing(true);
    
    const result = await stripe.confirmCardPayment(paymentInfo.clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)
      }
    });
    
    if (result.error) {
      setError(result.error.message);
      setProcessing(false);
    } else {
      if (result.paymentIntent.status === 'succeeded') {
        onSuccess();
      } else {
        setError('Payment processing failed. Please try again.');
        setProcessing(false);
      }
    }
  };
  
  return (
    <Form onSubmit={handleSubmit}>
      {error && (
        <Alert variant="danger">{error}</Alert>
      )}
      
      {paymentInfo && (
        <div className="mb-4">
          <h5>Order Summary</h5>
          <p>Amount: ${paymentInfo.amount.toFixed(2)}</p>
          <p>Credits to add: {paymentInfo.credits}</p>
        </div>
      )}
      
      <Form.Group className="mb-3">
        <Form.Label>Card Information</Form.Label>
        <div className="p-3 border rounded">
          <CardElement options={cardStyle} />
        </div>
        <Form.Text className="text-muted">
          Test card: 4242 4242 4242 4242 | Exp: Any future date | CVC: Any 3 digits
        </Form.Text>
      </Form.Group>
      
      <div className="d-flex justify-content-between">
        <Button variant="secondary" onClick={onCancel} disabled={processing}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={!stripe || processing}>
          {processing ? (
            <>
              <Spinner as="span" animation="border" size="sm" className="me-2" />
              Processing...
            </>
          ) : `Pay $${amount.toFixed(2)}`}
        </Button>
      </div>
    </Form>
  );
};

// Main component
const Recharge = ({ user, setUser }) => {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [currentCredits, setCurrentCredits] = useState(user?.credit_balance || 0);
  
  useEffect(() => {
    // Fetch current credit balance
    const fetchCredits = async () => {
      try {
        const data = await getCreditBalance();
        if (data.success) {
          setCurrentCredits(data.credit_balance);
        }
      } catch (error) {
        console.error('Error fetching credit balance:', error);
      }
    };
    
    fetchCredits();
  }, []);
  
  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
    setPaymentSuccess(false);
  };
  
  const handlePaymentSuccess = async () => {
    setPaymentSuccess(true);
    
    // Refresh credit balance
    try {
      const data = await getCreditBalance();
      if (data.success) {
        setCurrentCredits(data.credit_balance);
        setUser((prevUser) => ({
          ...prevUser,
          credit_balance: data.credit_balance
        }));
      }
    } catch (error) {
      console.error('Error fetching updated credit balance:', error);
    }
  };
  
  const resetSelection = () => {
    setSelectedPackage(null);
  };
  
  return (
    <Container>
      <Row className="my-4">
        <Col md={12}>
          <Card>
            <Card.Body>
              <Card.Title>Your Current Balance</Card.Title>
              <h3 className="credit-balance">{currentCredits} Credits</h3>
              <Card.Text>
                Each credit allows you to process one image.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {paymentSuccess ? (
        <Row>
          <Col md={12}>
            <Card className="text-center">
              <Card.Body>
                <h2 className="text-success mb-4">Payment Successful!</h2>
                <p>Your credits have been added to your account.</p>
                <p>Your new balance: <strong>{currentCredits} Credits</strong></p>
                <div className="mt-4">
                  <Button as={Link} to="/dashboard" variant="primary" className="me-3">
                    Go to Dashboard
                  </Button>
                  <Button onClick={resetSelection} variant="outline-primary">
                    Buy More Credits
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : selectedPackage ? (
        <Row>
          <Col md={12}>
            <Card>
              <Card.Header as="h5">Checkout</Card.Header>
              <Card.Body>
                <Elements stripe={stripePromise}>
                  <CheckoutForm 
                    amount={selectedPackage.amount} 
                    onSuccess={handlePaymentSuccess}
                    onCancel={resetSelection}
                  />
                </Elements>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : (
        <Row>
          <Col md={12}>
            <Card>
              <Card.Header as="h5">Select a Credit Package</Card.Header>
              <Card.Body>
                <Row>
                  {CREDIT_PACKAGES.map((pkg, index) => (
                    <Col md={6} lg={3} key={index} className="mb-3">
                      <Card 
                        className="text-center h-100" 
                        onClick={() => handlePackageSelect(pkg)}
                        style={{ cursor: 'pointer' }}
                      >
                        <Card.Body>
                          <h4>{pkg.label}</h4>
                          <h3 className="text-primary">${pkg.amount.toFixed(2)}</h3>
                          <p>
                            <small className="text-muted">
                              ${(pkg.amount / pkg.credits).toFixed(2)} per credit
                            </small>
                          </p>
                          <Button variant="primary" className="mt-2">
                            Select
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
            
            <Card className="mt-4">
              <Card.Header>Payment Information</Card.Header>
              <Card.Body>
                <p>
                  <i className="fas fa-lock me-2"></i>
                  Your payment is processed securely through Stripe. We do not store your card information.
                </p>
                <p>
                  Credits are added to your account immediately after successful payment.
                </p>
                <p>
                  <Link to="/recharge-history">View your recharge history</Link>
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Recharge; 