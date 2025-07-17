import React from "react";
import { Card, Badge, Modal, Form, Button, Col } from "react-bootstrap";

const EventOptionCards = ({
  optionCardsData,
  optionData,
  showModal,
  selectedCard,
  handleCardClick,
  handleInputChange,
  handleSaveOption,
  handleCloseModal,
}) => {
  const renderCardContent = (card) => {
    const hasValue =
      optionData[card.key] && optionData[card.key].toString().trim() !== "";

    return (
      <Card.Body className="p-4">
        <div className="fs-1 mb-3">{card.icon}</div>
        <Card.Title className="fw-bold text-dark fs-5 mb-2">
          {card.title}
        </Card.Title>
        <Card.Text className="text-muted small mb-2">
          {card.description}
        </Card.Text>

        {hasValue && (
          <div className="mt-3">
            <Badge
              bg="primary"
              className="border-0 px-3 py-2 text-white"
              style={{ fontSize: "0.875rem", backgroundColor: "#3b82f6" }}
            >
              {optionData[card.key]} {card.unit}
            </Badge>
          </div>
        )}

        {!hasValue && (
          <div className="mt-3">
            <small className="text-primary fw-semibold">Click to set</small>
          </div>
        )}
      </Card.Body>
    );
  };

  return (
    <>
      {optionCardsData.map((card) => (
        <Col key={card.id} xs={12} md={6} lg={3}>
          <Card
            className="h-100 border-0 shadow text-center"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(8px)",
              transition: "all 0.3s ease",
              cursor: "pointer",
            }}
            onClick={() => handleCardClick(card)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 1rem 3rem rgba(0,0,0,0.175)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 0.5rem 1rem rgba(0,0,0,0.15)";
            }}
          >
            {renderCardContent(card)}
          </Card>
        </Col>
      ))}

      {/* Modal for Option Input */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center">
            <span className="me-2 fs-4">{selectedCard?.icon}</span>
            {selectedCard?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <p className="text-muted mb-3">{selectedCard?.description}</p>
            <Form.Group>
              <Form.Label className="fw-semibold">
                {selectedCard?.title}{" "}
                {selectedCard?.unit && `(${selectedCard.unit})`}
              </Form.Label>
              {selectedCard?.inputType === "select" ? (
                <Form.Select
                  value={optionData[selectedCard?.key] || ""}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="border-2"
                  style={{ borderRadius: "8px" }}
                  autoFocus
                >
                  {!optionData[selectedCard?.key] && (
                    <option value="">{selectedCard?.placeholder}</option>
                  )}
                  {selectedCard?.options?.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </Form.Select>
              ) : (
                <Form.Control
                  type={selectedCard?.inputType || "text"}
                  placeholder={selectedCard?.placeholder}
                  value={optionData[selectedCard?.key] || ""}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="border-2"
                  style={{ borderRadius: "8px" }}
                  autoFocus
                />
              )}
            </Form.Group>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveOption}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EventOptionCards;