import { Button } from "react-bootstrap";
import { Calendar, Clock, MapPin } from "lucide-react";
import { formatDateTime } from "../utils/dateUtils";

import "./EventCard.css";

const EventCard = ({ event, onJoinEvent, onViewDetails, statusInfo }) => {
  const userStatus = statusInfo?.status; // REGISTERED, CANCELLED, NOT_REGISTERED
  const isFull = statusInfo?.full;
  const eventStatus = event.status; // NOT_STARTED, ONGOING, CANCELLED, EXPIRED, DRAFT

  let buttonLabel = "Join Now";
  let buttonVariant = "primary";
  let buttonClass = ""; // ← Khai báo thêm biến này
  let disabled = false;

  if (userStatus === "REGISTERED") {
    buttonLabel = "Joined";
    buttonVariant = "secondary";
    disabled = true;
    buttonClass = "btn-joined";
  } else if (eventStatus === "CANCELLED") {
    buttonLabel = "Unavailable";
    buttonVariant = "outline-danger";
    disabled = true;
    buttonClass = "btn-cancelled";
  } else if (eventStatus === "EXPIRED") {
    buttonLabel = "Expired";
    buttonVariant = ""; // không dùng bootstrap variant nữa
    disabled = true;
    buttonClass = "btn-expired";
  } else if (userStatus === "CANCELLED") {
    buttonLabel = "Cancelled";
    buttonVariant = "outline-dark";
    disabled = true;
    buttonClass = "btn-cancelled";
  } else if (isFull) {
    buttonLabel = "Full";
    buttonVariant = "outline-secondary";
    disabled = true;
    buttonClass = "btn-full";
  }

  return (
    <div className="event-card">
      <div
        className={`event-card-inner ${
          event.imagePosition === "right" ? "reverse" : ""
        }`}
      >
        {/* Image Section */}
        <div className="event-image-section">
          <img
            src={event.img || "/placeholder.svg"}
            alt={event.eventName}
            className="event-image"
          />
        </div>

        {/* Content Section */}
        <div className="event-content-section">
          <h3 className="event-title">{event.eventName}</h3>

          <div className="event-meta">
            <div className="event-meta-item">
              <Calendar size={16} className="event-icon" />
              <span className="event-meta-text">
                {formatDateTime(event.startDate)}
              </span>
            </div>
            <div className="event-meta-item">
              <Clock size={16} className="event-icon" />
              <span className="event-meta-text">{event.duration} mins</span>
            </div>
            <div className="event-meta-item">
              <MapPin size={16} className="event-icon" />
              <span className="event-meta-text">{event.location}</span>
            </div>
          </div>

          <p className="event-description">{event.description}</p>

          <div className="event-actions">
            <Button
              className={`btn-join-now ${buttonClass}`}
              onClick={() => onJoinEvent(event.eventID)}
              disabled={disabled}
            >
              {buttonLabel}
            </Button>
            <Button
              className="btn-details"
              onClick={() => onViewDetails(event.eventID)}
              variant="outline-secondary"
            >
              Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
