import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';

const PendingCard = ({ title, count, items, onView, onApprove }) => ( // Added onView, onApprove to props
  <Card className="pending-card h-100">
    <Card.Body>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h5 className="fw-bold text-dark mb-0">{title}</h5>
        <Badge bg="primary" className="fs-6 px-3 py-2">
          {count} pending
        </Badge>
      </div>

      <div className="mb-4">
        {items.map((item) => {
          const name = item.courseName || item.blogName || item.title || 'No Title';
          const submittedDate = item.updatedAt || 'recently';
          const id = item.courseID || item.blogID || item.id;
          const author = item.member?.username || 'Unknown Author';

          return (
            <div key={id || Math.random()} className="p-3 mb-3 bg-light rounded-3 border">
              <div className="d-flex align-items-start justify-content-between">
                <div className="flex-grow-1 me-3">
                  <p className="fw-semibold text-dark mb-1 small">{name}</p>
                  <div className="d-flex align-items-center text-muted small">
                    <span className="fw-medium">By {author}</span>
                    <span className="mx-2">•</span>
                    <span>{submittedDate}</span>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <Button
                    size="sm"
                    variant="success"
                    className="btn-gradient-success"
                    onClick={() => onApprove && onApprove(id, title.toLowerCase().slice(0, -1))} // Pass ID and type
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    className="btn-gradient-primary"
                    onClick={() => onView && onView(id, title.toLowerCase().slice(0, -1))} // Pass ID and type
                  >
                    View
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card.Body>
  </Card>
);

export default PendingCard;