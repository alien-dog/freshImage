import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <Container>
      <Row className="mt-5">
        <Col md={12} className="text-center">
          <h1>Welcome to Image Matting App</h1>
          <p className="lead">
            Remove backgrounds from your images with AI-powered technology
          </p>
        </Col>
      </Row>
      
      <Row className="mt-5">
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body className="text-center">
              <i className="fas fa-user-circle fa-3x mb-3"></i>
              <Card.Title>Create an Account</Card.Title>
              <Card.Text>
                Register to access our powerful image matting tools and keep track of your processed images.
              </Card.Text>
              <Link to="/register">
                <Button variant="primary">Register Now</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body className="text-center">
              <i className="fas fa-image fa-3x mb-3"></i>
              <Card.Title>Remove Image Backgrounds</Card.Title>
              <Card.Text>
                Upload your images and our AI will automatically remove the background, giving you clean results.
              </Card.Text>
              <Link to="/login">
                <Button variant="primary">Try It Now</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body className="text-center">
              <i className="fas fa-credit-card fa-3x mb-3"></i>
              <Card.Title>Pay-As-You-Go</Card.Title>
              <Card.Text>
                Our simple credit system lets you pay only for what you use. Recharge your account when needed.
              </Card.Text>
              <Link to="/login">
                <Button variant="primary">Get Credits</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mt-5">
        <Col md={12} className="text-center">
          <h2>How It Works</h2>
          <p>
            Our advanced image matting technology makes it easy to remove backgrounds from your photos.
            Simply upload your image, and our AI will do the rest. It's perfect for e-commerce products, 
            profile pictures, graphic design, and more!
          </p>
          <Link to="/register">
            <Button variant="primary" size="lg" className="mt-3">Get Started Today</Button>
          </Link>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage; 