import React from 'react';
import { Card, Alert, Row, Col, Badge, Button } from 'react-bootstrap';
import './admin.css';

const SystemManagement = () => {
return (
    <div className="system-management-content">
      <h1>System Management</h1>

      <Row>
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5>System Health <Badge bg="success">Operational</Badge></h5>
            </Card.Header>
            <Card.Body>
              <Alert variant="success">All services running normally</Alert>
              <div>Errors: 2 minor</div>
              <div>Avg Response Time: 245ms</div>
              <div>Uptime: 99.8%</div>
              <Button size="sm" variant="outline-primary">View Details</Button>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header><h5>User Feedback <Badge bg="info">12 New</Badge></h5></Card.Header>
            <Card.Body>
              <div>Avg Rating: 4.6</div>
              <div>New Feedbacks: 12</div>
              <div>Needs Attention: 3</div>
              <Button size="sm" variant="outline-primary">View Feedback</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SystemManagement;
