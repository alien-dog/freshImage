import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Pagination, Image, Badge, Spinner } from 'react-bootstrap';
import { getMattingHistory } from '../services/mattingService';

const MattingHistory = () => {
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
      const data = await getMattingHistory(page, pagination.perPage);
      
      if (data.success) {
        setRecords(data.records);
        setPagination({
          currentPage: data.pagination.current_page,
          totalPages: data.pagination.pages,
          totalItems: data.pagination.total,
          perPage: data.pagination.per_page
        });
      } else {
        setError('Failed to load matting history');
      }
    } catch (err) {
      setError('Error fetching matting history. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
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
            <Card.Header as="h5">Matting History</Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center my-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Loading history...</p>
                </div>
              ) : error ? (
                <div className="text-center text-danger my-3">{error}</div>
              ) : records.length === 0 ? (
                <div className="text-center my-5">
                  <p>No matting records found. Process an image on the Dashboard to get started.</p>
                </div>
              ) : (
                <>
                  <Table responsive striped hover>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Date</th>
                        <th>Original Image</th>
                        <th>Processed Image</th>
                        <th>Credits Used</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((record, index) => (
                        <tr key={record.id}>
                          <td>{index + 1 + (pagination.currentPage - 1) * pagination.perPage}</td>
                          <td>{formatDate(record.created_at)}</td>
                          <td>
                            <Image 
                              src={record.original_image_path} 
                              thumbnail 
                              width={80} 
                              height={80} 
                              alt="Original"
                            />
                          </td>
                          <td>
                            <Image 
                              src={record.processed_image_path} 
                              thumbnail 
                              width={80} 
                              height={80} 
                              alt="Processed"
                            />
                            <a 
                              href={record.processed_image_path} 
                              className="ms-2" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              download
                            >
                              Download
                            </a>
                          </td>
                          <td>
                            <Badge bg="primary">{record.credit_consumed}</Badge>
                          </td>
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

export default MattingHistory; 