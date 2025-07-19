import React from "react";
import { Card, Form } from "react-bootstrap";
import { CalendarIcon, MapPinIcon, UserIcon } from "lucide-react";

const EventDetailCards = ({
  detailCardsData,
  eventDetails,
  calculatedEndTime,
  dateTimeRef,
  handleEventDetailChange,
  formatDateTimeDisplay,
  handleDateTimeClick,
}) => {
  return (
    <div className="d-flex flex-column gap-3">
      {detailCardsData.map((card, index) => (
        <Card key={index} className="border-0 shadow-sm">
          <Card.Body className="p-3">
            <div className="d-flex align-items-center mb-3">
              <div
                className="me-3 rounded text-white d-flex align-items-center justify-content-center"
                style={{
                  width: "40px",
                  height: "40px",
                  background: card.color,
                }}
              >
                {card.icon}
              </div>
              <span className="fw-semibold text-dark">
                {card.label}
              </span>
            </div>

            {card.key === "dateTime" ? (
              <div className="position-relative">
                <Form.Control
                  ref={dateTimeRef}
                  type="datetime-local"
                  value={eventDetails[card.key] || ""}
                  onChange={(e) =>
                    handleEventDetailChange(card.key, e.target.value)
                  }
                  className="border-2"
                  style={{
                    borderColor: "#dee2e6",
                    borderRadius: "8px",
                    opacity: eventDetails[card.key] ? 1 : 0,
                  }}
                />
                {!eventDetails[card.key] && (
                  <div
                    className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center px-3 text-muted"
                    style={{
                      cursor: "pointer",
                      backgroundColor: "white",
                      border: "2px solid #dee2e6",
                      borderRadius: "8px",
                    }}
                    onClick={handleDateTimeClick}
                  >
                    {card.placeholder}
                  </div>
                )}
              </div>
            ) : (
              <Form.Control
                type={card.inputType || "text"}
                placeholder={card.placeholder}
                value={eventDetails[card.key] || ""}
                onChange={(e) =>
                  handleEventDetailChange(card.key, e.target.value)
                }
                className="border-2"
                style={{
                  borderColor: "#dee2e6",
                  borderRadius: "8px",
                }}
              />
            )}

            {card.key === "dateTime" && (
              <div className="mt-2">
                {eventDetails[card.key] && (
                  <small className="text-muted d-block">
                    📅 Bắt đầu: {formatDateTimeDisplay(eventDetails[card.key])}
                  </small>
                )}
                {calculatedEndTime && (
                  <small className="text-muted d-block">
                    ⏰ Kết thúc: {formatDateTimeDisplay(calculatedEndTime)}
                  </small>
                )}
                {!eventDetails[card.key] && !calculatedEndTime && (
                  <small className="text-muted d-block">
                    Chưa có thời gian
                  </small>
                )}
              </div>
            )}
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default EventDetailCards;