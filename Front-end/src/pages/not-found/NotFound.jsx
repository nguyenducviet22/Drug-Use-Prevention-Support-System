import React from 'react'
import "./NotFound.css"
import { Button, Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next' // Import useTranslation

export default function NotFound({
  code = "404",
  // Các props này sẽ ưu tiên nếu được truyền vào, nếu không sẽ dùng dịch từ i18n
  title,
  message,
  backText,
  backLink = "/",
}) {
  const { t } = useTranslation("notFound") // Khai báo useTranslation

  // Xác định nội dung hiển thị: ưu tiên props, nếu không thì dùng từ i18n
  const displayTitle = title || t("title");
  const displayMessage = message || t("message");
  const displayBackText = backText || t("backText");

  return (
    <Container className="py-5">
      <Row className="justify-content-center text-center">
        <Col md={6}>
          <h1 className="display-1 fw-bold text-primary">{code}</h1>
          <h2 className="mb-3">{displayTitle}</h2>
          <p className="text-muted mb-4">{displayMessage}</p>
          <Button as={Link} to={backLink} variant="primary">
            {displayBackText}
          </Button>
        </Col>
      </Row>
    </Container>
  )
}