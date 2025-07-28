import React from "react";
import { Col, Card, Modal, Button, Form } from "react-bootstrap";
import { XCircleIcon } from "lucide-react";

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
  return (
    <>
      {optionCardsData.map((card) => (
        <Col key={card.key} xs={12} md={6} lg={3}>
          <Card
            className="border-0 shadow-sm option-card h-100"
            style={{ borderRadius: "16px", cursor: "pointer" }}
            onClick={() => handleCardClick(card)}
          >
            <Card.Body className="p-4 d-flex flex-column align-items-center justify-content-center text-center">
              <div
                className="mb-3 rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: "56px",
                  height: "56px",
                  backgroundColor: "rgba(var(--bs-primary-rgb), 0.1)",
                }}
              >
                {card.icon}
              </div>
              <h5 className="fw-bold text-dark mb-1">{card.title}</h5>
              <p className="text-muted mb-0">
                {card.key === "fee" && parseFloat(optionData[card.key]) === 0
                  ? "Free"
                  : optionData[card.key]
                  ? `${optionData[card.key]} ${card.unit || ""}`.trim()
                  : card.description}
              </p>
            </Card.Body>
          </Card>
        </Col>
      ))}

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header className="border-0">
          <Modal.Title className="fw-bold">{selectedCard?.title}</Modal.Title>
          <Button
            variant="link"
            className="text-muted p-0"
            onClick={handleCloseModal}
          >
            <XCircleIcon size={24} />
          </Button>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            {selectedCard?.inputType === "select" ? (
              <Form.Select
                value={optionData[selectedCard.key] || ""}
                onChange={(e) => handleInputChange(e.target.value)}
              >
                <option value="">{selectedCard.placeholder}</option>
                {selectedCard.options.map((option) => (
                  <option key={option} value={option}>
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
              />
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveOption}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EventOptionCards;