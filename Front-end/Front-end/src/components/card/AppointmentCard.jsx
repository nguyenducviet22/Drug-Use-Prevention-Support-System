import React from "react";
import { Card, Row, Col, Button } from "react-bootstrap";
import { Calendar, Video } from "lucide-react";
import { useTranslation } from "react-i18next";
import "./AppointmentCard.css";

const AppointmentCard = ({ appointments = [] }) => {
  const { t } = useTranslation("appointmentCard");

  const startTime = new Date();
  startTime.setHours(startTime.getHours() - 1);

  const filteredAppointments = appointments.filter(
    (appointment) =>
      appointment.status === "SCHEDULED" &&
      new Date(appointment.appointmentDateTime) >= startTime
  );

  return (
    <Card className="h-100 border-0 shadow-sm appointment-card">
      <div className="card-header-custom bg-primary text-white d-flex align-items-center">
        <Calendar size={24} className="me-2" />
        <h5 className="mb-0 fw-bold">{t("upcomingAppointmentTitle")}</h5>
      </div>
      <Card.Body className="p-4">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((appointment) => (
            <div key={appointment.appointmentID} className="appointment-item">
              <div className="appointment-info bg-light rounded-3 p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h6 className="fw-bold text-dark mb-1">
                      {appointment.consultant.username}
                    </h6>
                  </div>
                  <span className="badge bg-warning text-dark">
                    {appointment.status}
                  </span>
                </div>
                <div className="appointment-time mt-3">
                  <div className="fw-semibold text-primary">
                    {appointment.appointmentDateTime}
                  </div>
                </div>
              </div>
              <Row className="mt-3">
                <Col>
                  <Button
                    variant="primary"
                    size="sm"
                    className="btn-custom btn-primary-custom"
                    onClick={() => window.open(appointment.link)}
                  >
                    <Video size={14} className="me-1" />
                    {t("joinMeetingButton")}
                  </Button>
                </Col>
              </Row>
            </div>
          ))
        ) : (
          <div className="text-center text-muted">
            {t("noUpcomingAppointments")}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default AppointmentCard;
