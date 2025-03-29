import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { processImage } from '../services/mattingService';
import { getCreditBalance } from '../services/paymentService';
import { Link } from 'react-router-dom';

const Dashboard = ({ user, setUser }) => {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [processedImageUrl, setProcessedImageUrl] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState(user?.credit_balance || 0);
  
  useEffect(() => {
    const fetchCreditBalance = async () => {
      try {
        const data = await getCreditBalance();
        if (data.success) {
          setCredits(data.credit_balance);
          // Update user object with new credit balance
          setUser((prevUser) => ({ ...prevUser, credit_balance: data.credit_balance }));
        }
      } catch (error) {
        console.error('Error fetching credit balance:', error);
      }
    };
    
    fetchCreditBalance();
  }, [setUser]);
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Reset processed image and error
      setProcessedImageUrl(null);
      setError('');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!imageFile) {
      setError('Please select an image to process');
      return;
    }
    
    if (credits < 1) {
      setError('Insufficient credits. Please recharge your account.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const data = await processImage(imageFile);
      
      if (data.success) {
        setProcessedImageUrl(data.processed_image);
        setCredits(data.remaining_credit);
        // Update user object with new credit balance
        setUser((prevUser) => ({ ...prevUser, credit_balance: data.remaining_credit }));
      } else {
        setError(data.message || 'Failed to process image');
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container className="dashboard-container">
      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Body>
              <Card.Title>Your Credits</Card.Title>
              <div className="d-flex justify-content-between align-items-center">
                <div className="credit-balance">
                  <Badge bg="primary" className="p-2">{credits} Credits</Badge>
                </div>
                <Link to="/recharge">
                  <Button variant="success">Recharge Credits</Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col md={12}>
          <Card>
            <Card.Body>
              <Card.Title>Image Matting</Card.Title>
              <Card.Subtitle className="mb-3 text-muted">
                Remove background from your image (1 credit per image)
              </Card.Subtitle>
              
              {error && (
                <Alert variant="danger">{error}</Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Select Image</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/jpg"
                    disabled={loading}
                  />
                  <Form.Text className="text-muted">
                    Supported formats: JPG, JPEG, PNG
                  </Form.Text>
                </Form.Group>
                
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={!imageFile || loading || credits < 1}
                  className="mb-3"
                >
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Processing...
                    </>
                  ) : 'Process Image'}
                </Button>
                
                {credits < 1 && (
                  <Alert variant="warning">
                    You don't have enough credits. <Link to="/recharge">Recharge now</Link>
                  </Alert>
                )}
              </Form>
              
              <Row className="mt-4">
                {previewUrl && (
                  <Col md={6}>
                    <Card>
                      <Card.Header>Original Image</Card.Header>
                      <Card.Body className="text-center">
                        <img 
                          src={previewUrl} 
                          alt="Original" 
                          className="image-preview" 
                        />
                      </Card.Body>
                    </Card>
                  </Col>
                )}
                
                {processedImageUrl && (
                  <Col md={6}>
                    <Card>
                      <Card.Header>Processed Image</Card.Header>
                      <Card.Body className="text-center">
                        <img 
                          src={processedImageUrl} 
                          alt="Processed" 
                          className="image-preview" 
                        />
                      </Card.Body>
                      <Card.Footer className="text-center">
                        <Button 
                          variant="outline-primary" 
                          href={processedImageUrl} 
                          target="_blank" 
                          download
                        >
                          Download
                        </Button>
                      </Card.Footer>
                    </Card>
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard; 