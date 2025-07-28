import React from "react";
import { Card, Form, Col } from "react-bootstrap";
// Import useTranslation từ react-i18next
import { useTranslation } from "react-i18next";

const EventNameSubtitleForm = ({ eventName, setEventName, subTitle, setSubTitle }) => {
  // Lấy hàm t từ namespace 'createEventPage'
  const { t } = useTranslation("createEventPage"); 

  return (
    <Col xs={12} lg={8} style={{ width: "100%", display: "contents" }}>
      <Card
        className="border-0 shadow-lg"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(8px)",
          borderRadius: "24px",
        }}
      >
        <Card.Body className="p-5">
          <Form>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold text-dark mb-3">
                {t("eventName")} {/* Sử dụng t() để dịch */}
              </Form.Label>
              <Form.Control
                type="text"
                placeholder={t("enterEventNamePlaceholder")}
                className="text-center fw-semibold border-2"
                style={{
                  height: "64px",
                  fontSize: "1.5rem",
                  borderRadius: "16px",
                  borderColor: "#dee2e6",
                }}
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label className="fw-semibold text-dark mb-3">
                {t("eventSubtitle")} {/* Sử dụng t() để dịch */}
              </Form.Label>
              <Form.Control
                type="text"
                placeholder={t("addSubtitlePlaceholder")}
                className="text-center border-2"
                style={{
                  height: "48px",
                  fontSize: "1.125rem",
                  borderRadius: "12px",
                  borderColor: "#dee2e6",
                }}
                value={subTitle}
                onChange={(e) => setSubTitle(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default EventNameSubtitleForm;