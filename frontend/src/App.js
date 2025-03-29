import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Navigation from './components/Navigation';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MattingHistory from './pages/MattingHistory';
import RechargeHistory from './pages/RechargeHistory';
import Recharge from './pages/Recharge';
import HomePage from './pages/HomePage';
import { getUser } from './services/authService';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const userData = await getUser();
          setUser(userData.user);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      
      setLoading(false);
    };
    
    fetchUser();
  }, []);
  
  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }
  
  return (
    <>
      <Navigation user={user} setUser={setUser} />
      <Container className="mt-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard user={user} setUser={setUser} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/matting-history" 
            element={
              <ProtectedRoute>
                <MattingHistory />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/recharge" 
            element={
              <ProtectedRoute>
                <Recharge user={user} setUser={setUser} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/recharge-history" 
            element={
              <ProtectedRoute>
                <RechargeHistory />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Container>
    </>
  );
}

export default App; 