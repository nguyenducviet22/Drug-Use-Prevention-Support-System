import { Button } from "react-bootstrap";
import { Calendar, Clock, MapPin } from "lucide-react";
import { formatDateTime } from "../../utils/dateUtils";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import "./EventCard.css";

const EventCard = ({ event, onJoinEvent, onViewDetails, statusInfo, onCancelEvent }) => {
  const { t, i18n } = useTranslation("eventCard");
  const lang = i18n.language;
  const [cancelLoading, setCancelLoading] = useState(false);

  // Lấy nội dung động theo ngôn ngữ nếu có
  const eventName =
    lang === "vi" && event.eventNameVi ? event.eventNameVi : event.eventName;
  const description =
    lang === "vi" && event.descriptionVi
      ? event.descriptionVi
      : event.description;

  const userStatus = statusInfo?.status; // REGISTERED, CANCELLED, NOT_REGISTERED
  const isFull = statusInfo?.full;
  const eventStatus = event.status; // NOT_STARTED, ONGOING, CANCELLED, EXPIRED, DRAFT

  let buttonLabel = t("joinNowButton");
  let buttonVariant = "primary";
  let buttonClass = "";
  let disabled = false;

  if (userStatus === "REGISTERED") {
    buttonLabel = t("joinedButton", "Joined");
    buttonVariant = "secondary";
    disabled = true;
    buttonClass = "btn-joined";
  } else if (eventStatus === "CANCELLED") {
    buttonLabel = t("unavailableButton", "Unavailable");
    buttonVariant = "outline-danger";
    disabled = true;
    buttonClass = "btn-cancelled";
  } else if (eventStatus === "EXPIRED") {
    buttonLabel = t("expiredButton", "Expired");
    buttonVariant = "";
    disabled = true;
    buttonClass = "btn-expired";
  } else if (userStatus === "CANCELLED") {
    buttonLabel = t("cancelledButton", "Cancelled");
    buttonVariant = "outline-dark";
    disabled = true;
    buttonClass = "btn-cancelled";
  } else if (isFull) {
    buttonLabel = t("fullButton", "Full");
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
            src={event.image || "/placeholder.svg"}
            alt={eventName}
            className="event-image"
          />
        </div>

        {/* Content Section */}
        <div className="event-content-section">
          <h3 className="event-title">{eventName}</h3>

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

          <p className="event-description">{description}</p>

          <div className="event-actions">
            <Button
              className={`btn-join-now ${buttonClass} min-width-btn`}
              onClick={() => onJoinEvent(event.eventID)}
              disabled={disabled}
              variant={buttonVariant}
            >
              {buttonLabel}
            </Button>

            {userStatus === "REGISTERED" && (
              <Button
                className="btn-cancel mx-2 min-width-btn"
                variant="outline-danger"
                onClick={async () => {
                  if (cancelLoading) return;
                  setCancelLoading(true);
                  await onCancelEvent(event.eventID);
                  setCancelLoading(false);
                }}
                disabled={cancelLoading}
              >
                {cancelLoading ? t("cancellingButton", "Cancelling...") : t("cancelButton", "Cancel")}
              </Button>
            )}

            <Button
              className="btn-details"
              onClick={() => onViewDetails(event.eventID)}
              variant="outline-secondary"
            >
              {t("detailsButton")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
