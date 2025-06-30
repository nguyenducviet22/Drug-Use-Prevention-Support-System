import { useState, useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { Clock, MapPin, Users, CircleDot } from "lucide-react";
import "./EventDetails.css";
import Recommendation from "../components/Recommendation";
import ErrorMessage from "../components/ErrorMessage";
import BackButton from "../components/BackButton";
import LoadingSpinner from "../components/LoadingSpinner";
import NotFound from "./NotFound";
import { formatEventDateAndTimeRange } from "../utils/dateUtils.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../hooks/useAuth";

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [statusInfo, setStatusInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registerLocked, setRegisterLocked] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8080/api/event/${id}`);
        const text = await res.text(); // lấy raw text
        try {
          const data = JSON.parse(text); // cố gắng parse JSON
          setEvent(data.data);
        } catch (e) {
          console.error("Response is not valid JSON:", text); // in ra HTML hoặc lỗi
          throw new Error("Invalid response format");
        }

        // Fetch status if user is authenticated
        const token = localStorage.getItem("token");
        if (token) {
          const statusRes = await fetch(
            `http://localhost:8080/api/event/${id}/status`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (statusRes.ok) {
            const statusData = await statusRes.json();
            setStatusInfo(statusData);
          }
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load event details.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <Container className="py-5">
        <LoadingSpinner loading />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <ErrorMessage error={error} />
      </Container>
    );
  }

  if (!event) {
    return (
      <NotFound
        code="📅"
        title="Event Not Found"
        message="We couldn't find the event you're looking for."
        backLink="/events"
        backText="Back to Events"
      />
    );
  }

  const { dateStr, timeStr } = formatEventDateAndTimeRange(
    event.startDate,
    event.endDate
  );

  // 🧠 Determine register button logic
  let registerLabel = "Register";
  let registerVariant = "primary";
  let registerDisabled = false;

  const userStatus = statusInfo?.status;
  const eventStatus = event.status;

  if (userStatus === "REGISTERED") {
    registerLabel = "Joined";
    registerVariant = "secondary";
    registerDisabled = true;
  } else if (eventStatus === "CANCELLED") {
    registerLabel = "Unavailable";
    registerVariant = "outline-danger";
    registerDisabled = true;
  } else if (eventStatus === "EXPIRED") {
    registerLabel = "Expired";
    registerVariant = "custom-expired"; // dùng class CSS thay vì variant bootstrap
    registerDisabled = true;
  } else if (userStatus === "CANCELLED") {
    registerLabel = "Cancelled";
    registerVariant = "outline-dark";
    registerDisabled = true;
  } else if (statusInfo?.full) {
    registerLabel = "Full";
    registerVariant = "outline-danger";
    registerDisabled = true;
  }

  return (
    <Container className="event-details-container py-4">
      <BackButton label="Back" />
      <h1 className="event-title text-center">{event.eventName}</h1>
      <p className="event-subtitle text-center text-muted mb-4">
        {event.subTitle}
      </p>
      <Row className="event-stats mb-4">
        <Col xs={6} md={3}>
          <div className="stat-card">
            <div className="stat-value">{event.quantity}</div>
            <div className="stat-label">Participants</div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="stat-card">
            <div className="stat-value">{event.ageGroup}</div>
            <div className="stat-label">Age Group</div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="stat-card">
            <div className="stat-value">{event.duration} mins</div>
            <div className="stat-label">Duration</div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="stat-card">
            <div className="stat-value">
              {event.fee != null && event.fee === 0 ? "FREE" : `$${event.fee}`}
            </div>
            <div className="stat-label">Fee</div>
          </div>
        </Col>
      </Row>
      <Row>
        <Col lg={8} className="mb-4">
          <div className="event-image-container mb-4">
            <img
              src={event.img || "/placeholder.svg?height=300&width=300"}
              alt={event.eventName}
              className="event-image"
            />
          </div>

          <div className="event-content">
            <h2 className="content-heading">Introduction</h2>
            <p>{event.description}</p>

            <h2 className="content-heading">
              Program content (What you will learn)
            </h2>
            <p>{event.details}</p>
          </div>
        </Col>

        <Col lg={4}>
          <div className="event-sidebar">
            <Button
              variant={
                registerVariant === "custom-expired"
                  ? undefined
                  : registerVariant
              }
              size="lg"
              className={`register-button w-100 mb-4 ${
                registerLabel === "Expired" ? "btn-expired" : ""
              }`}
              disabled={registerDisabled || registerLocked}
              onClick={() => {
                const token = localStorage.getItem("token");

                if (!token) {
                  if (registerLocked) return; // chống spam nhiều lần

                  toast.warning(<strong>Please login to register!</strong>);
                  setRegisterLocked(true);
                  setTimeout(() => setRegisterLocked(false), 2000); // mở lại sau 2s
                  return;
                }

                if (!registerDisabled) {
                  if (!user || user.ageGroup !== event.ageGroup) {
                    console.log(user);
                    toast.error(<strong>❌ Unsuitable Age!</strong>);
                    return;
                  }

                  // 📩 Gọi API đăng ký
                  fetch(
                    `http://localhost:8080/api/event/${event.eventID}/register`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  )
                    .then(async (res) => {
                      const result = await res.json();
                      if (!res.ok) throw new Error(result.message);
                      toast.success(
                        <strong>🎉 Registered Successfully!</strong>
                      );
                      setStatusInfo((prev) => ({
                        ...prev,
                        status: "REGISTERED",
                      }));
                    })
                    .catch((err) => {
                      toast.error(
                        <strong>Registration failed: {err.message}</strong>
                      );
                    });
                }
              }}
            >
              {registerLabel}
            </Button>

            <h3 className="sidebar-heading text-center mb-3">Details</h3>

            <div className="detail-card mb-3">
              <div className="detail-label">Time:</div>
              <div className="detail-value">
                <Clock size={18} className="detail-icon" />
                <span>
                  <div>{dateStr}</div>
                  <div>{timeStr}</div>
                </span>
              </div>
            </div>

            <div className="detail-card mb-3">
              <div className="detail-label">Location:</div>
              <div className="detail-value">
                <MapPin size={18} className="detail-icon" />
                <span>{event.location}</span>
              </div>
            </div>

            <div className="detail-card mb-3">
              <div className="detail-label">Capacity:</div>
              <div className="detail-value">
                <Users size={18} className="detail-icon" />
                <span>{event.quantity}</span>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-label">Status:</div>
              <div
                className={`detail-value ${
                  statusInfo?.full ? "status-full" : "status-available"
                }`}
              >
                <CircleDot size={18} className="detail-icon" />
                <span>
                  {statusInfo?.status === "REGISTERED"
                    ? "Registered"
                    : statusInfo?.full
                    ? "Full"
                    : "On-Going"}
                </span>
              </div>
            </div>
          </div>
        </Col>
      </Row>
      <Recommendation type="event" />
      <ToastContainer position="top-right" />;
    </Container>
  );
};

export default EventDetails;
