import React from 'react'
import "./NotFound.css"
import { Button, Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'

export default function NotFound({
  code = "404",
  title = "Page Not Found",
  message = "The page you're looking for doesn't exist.",
  backLink = "/",
  backText = "Go Home",
}) {
  return (
    <Container className="py-5">
      <Row className="justify-content-center text-center">
        <Col md={6}>
          <h1 className="display-1 fw-bold text-primary">{code}</h1>
          <h2 className="mb-3">{title}</h2>
          <p className="text-muted mb-4">{message}</p>
          <Button as={Link} to={backLink} variant="primary">
            {backText}
          </Button>
        </Col>
      </Row>
    </Container>
  )
}
