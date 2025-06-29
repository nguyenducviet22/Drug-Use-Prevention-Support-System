import { Button } from "react-bootstrap";
import { Calendar, Clock, MapPin } from "lucide-react";
import { formatDateTime } from "../utils/dateUtils";

import "./EventCard.css";

const EventCard = ({ event, onJoinEvent, onViewDetails, statusInfo }) => {
  const status = statusInfo?.status;
  const isFull = statusInfo?.full;

  let buttonLabel = "Join Now";
  let disabled = false;

  if (status === "REGISTERED") {
    buttonLabel = "Joined"; 
    disabled = true;
  } else if (isFull) {
    buttonLabel = "Full";
    disabled = true;
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
              className={`btn-join-now ${
                buttonLabel === "Joined"
                  ? "btn-joined"
                  : buttonLabel === "Full"
                  ? "btn-full"
                  : ""
              }`}
              variant=""
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
