import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Pagination, Badge, Spinner } from 'react-bootstrap';
import { getRechargeHistory } from '../services/paymentService';

const RechargeHistory = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 10
  });

  useEffect(() => {
    fetchHistory(1);
  }, []);

  const fetchHistory = async (page) => {
    setLoading(true);
    setError('');
    
    try {
      const data = await getRechargeHistory(page, pagination.perPage);
      
      if (data.success) {
        setRecords(data.records);
        setPagination({
          currentPage: data.pagination.current_page,
          totalPages: data.pagination.pages,
          totalItems: data.pagination.total,
          perPage: data.pagination.per_page
        });
      } else {
        setError('Failed to load recharge history');
      }
    } catch (err) {
      setError('Error fetching recharge history. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'success':
        return <Badge bg="success">Success</Badge>;
      case 'pending':
        return <Badge bg="warning">Pending</Badge>;
      case 'failed':
        return <Badge bg="danger">Failed</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // Generate pagination items
  const paginationItems = [];
  for (let number = 1; number <= pagination.totalPages; number++) {
    paginationItems.push(
      <Pagination.Item 
        key={number} 
        active={number === pagination.currentPage}
        onClick={() => fetchHistory(number)}
      >
        {number}
      </Pagination.Item>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <Card>
            <Card.Header as="h5">Recharge History</Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center my-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Loading recharge history...</p>
                </div>
              ) : error ? (
                <div className="text-center text-danger my-3">{error}</div>
              ) : records.length === 0 ? (
                <div className="text-center my-5">
                  <p>No recharge records found. Recharge your account to get started.</p>
                </div>
              ) : (
                <>
                  <Table responsive striped hover>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Credits</th>
                        <th>Payment Method</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((record, index) => (
                        <tr key={record.id}>
                          <td>{index + 1 + (pagination.currentPage - 1) * pagination.perPage}</td>
                          <td>{formatDate(record.created_at)}</td>
                          <td>${record.amount.toFixed(2)}</td>
                          <td>
                            <Badge bg="primary">{record.credits_gained} Credits</Badge>
                          </td>
                          <td className="text-capitalize">{record.payment_method}</td>
                          <td>{getStatusBadge(record.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  
                  <div className="d-flex justify-content-between align-items-center mt-4">
                    <div>
                      Showing {records.length} of {pagination.totalItems} records
                    </div>
                    <Pagination>
                      <Pagination.First onClick={() => fetchHistory(1)} disabled={pagination.currentPage === 1} />
                      <Pagination.Prev onClick={() => fetchHistory(pagination.currentPage - 1)} disabled={pagination.currentPage === 1} />
                      {paginationItems}
                      <Pagination.Next onClick={() => fetchHistory(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages} />
                      <Pagination.Last onClick={() => fetchHistory(pagination.totalPages)} disabled={pagination.currentPage === pagination.totalPages} />
                    </Pagination>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RechargeHistory; 