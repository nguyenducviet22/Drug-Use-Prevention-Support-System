import { Button } from "react-bootstrap";
import { Calendar, Clock, MapPin } from "lucide-react";
import "./EventCard.css";
import { useTranslation } from "react-i18next"; // Import useTranslation

const EventCard = ({ event, onJoinEvent, onViewDetails }) => {
  const { t } = useTranslation("eventCard"); // Initialize useTranslation

  return (
    <div className="event-card">
      <div className={`event-card-inner ${event.imagePosition === "right" ? "reverse" : ""}`}>
        {/* Image Section */}
        <div className="event-image-section">
          <img src={event.image || "/placeholder.svg"} alt={event.eventName} className="event-image" />
        </div>

        {/* Content Section */}
        <div className="event-content-section">
          <h3 className="event-title">{event.eventName}</h3>

          <div className="event-meta">
            <div className="event-meta-item">
              <Calendar size={16} className="event-icon" />
              <span className="event-meta-text">{event.startDate}</span>
            </div>
            <div className="event-meta-item">
              <Clock size={16} className="event-icon" />
              <span className="event-meta-text">{event.time}</span>
            </div>
            <div className="event-meta-item">
              <MapPin size={16} className="event-icon" />
              <span className="event-meta-text">{event.location}</span>
            </div>
          </div>

          <p className="event-description">{event.description}</p>

          <div className="event-actions">
            <Button className="btn-join-now" onClick={() => onJoinEvent(event.id)}>
              {t("joinNowButton")}
            </Button>
            <Button className="btn-details" onClick={() => onViewDetails(event.id)}>
              {t("detailsButton")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;