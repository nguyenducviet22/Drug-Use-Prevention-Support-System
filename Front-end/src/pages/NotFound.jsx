import React from 'react'
import "./NotFound.css"

export default function NotFound() {
  return (
    <Container className="py-5">
      <Row className="justify-content-center text-center">
        <Col md={6}>
          <h1 className="display-1 fw-bold text-primary">404</h1>
          <h2 className="mb-3">Page Not Found</h2>
          <p className="text-muted mb-4">The page you're looking for doesn't exist.</p>
          <Button as={Link} to="/" variant="primary">
            Go Home
          </Button>
        </Col>
      </Row>
    </Container>
  )
}
