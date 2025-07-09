import { useState, useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { Clock, MapPin, Users, CircleDot } from "lucide-react";
import { useTranslation } from "react-i18next";

import useFetch from "../../hooks/useFetch";
import Recommendation from "../../components/others/Recommendation";
import ErrorMessage from "../../components/ErrorMessage";
import BackButton from "../../components/BackButton";
import LoadingSpinner from "../../components/LoadingSpinner";
import NotFound from "../not-found/NotFound";

import "./EventDetails.css";
import { formatEventDateAndTimeRange } from "../../utils/dateUtils.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../hooks/useAuth";

const EventDetails = () => {
  const { t, i18n } = useTranslation("eventDetails");
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [statusInfo, setStatusInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registerLocked, setRegisterLocked] = useState(false);
  const { user } = useAuth();
  const [cancelLocked, setCancelLocked] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8080/api/event/${id}`);
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          setEvent(data.data);
        } catch (e) {
          console.error("Response is not valid JSON:", text);
          throw new Error("Invalid response format");
        }

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
        title={t("notFoundTitle")}
        message={t("notFoundMessage")}
        backLink="/events"
        backText={t("backToEvents")}
      />
    );
  }

  // Lấy nội dung động theo ngôn ngữ
  const lang = i18n.language;
  const eventName =
    lang === "vi" && event.eventNameVi ? event.eventNameVi : event.eventName;
  const subTitle =
    lang === "vi" && event.subTitleVi ? event.subTitleVi : event.subTitle;
  const description =
    lang === "vi" && event.descriptionVi
      ? event.descriptionVi
      : event.description;
  const details =
    lang === "vi" && event.detailsVi ? event.detailsVi : event.details;

  const { dateStr, timeStr } = formatEventDateAndTimeRange(
    event.startDate,
    event.endDate
  );

  let registerLabel = t("register");
  let registerVariant = "primary";
  let registerDisabled = false;

  const userStatus = statusInfo?.status;
  const eventStatus = event.status;

  if (userStatus === "REGISTERED") {
    registerLabel = t("joined");
    registerVariant = "secondary";
    registerDisabled = true;
  } else if (eventStatus === "CANCELLED") {
    registerLabel = t("unavailable");
    registerVariant = "outline-danger";
    registerDisabled = true;
  } else if (eventStatus === "EXPIRED") {
    registerLabel = t("expired");
    registerVariant = "custom-expired";
    registerDisabled = true;
  } else if (userStatus === "NOT_REGISTERED") {
    registerLabel = t("register");
    registerVariant = "primary";
    registerDisabled = false;
  } else if (statusInfo?.full) {
    registerLabel = t("full");
    registerVariant = "outline-danger";
    registerDisabled = true;
  }

  return (
    <Container className="event-details-container py-4">
      <BackButton label={t("backToEvents")} />
      <h1 className="event-title text-center">{eventName}</h1>
      <p className="event-subtitle text-center text-muted mb-4">{subTitle}</p>
      <Row className="event-stats mb-4">
        <Col xs={6} md={3}>
          <div className="stat-card">
            <div className="stat-value">{event.quantity}</div>
            <div className="stat-label">{t("participants")}</div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="stat-card">
            <div className="stat-value">{event.ageGroup}</div>
            <div className="stat-label">{t("ageGroup")}</div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="stat-card">
            <div className="stat-value">{event.duration} mins</div>
            <div className="stat-label">{t("duration")}</div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="stat-card">
            <div className="stat-value">
              {event.fee != null && event.fee === 0
                ? t("free")
                : `$${event.fee}`}
            </div>
            <div className="stat-label">{t("fee")}</div>
          </div>
        </Col>
      </Row>
      <Row>
        <Col lg={8} className="mb-4">
          <div className="event-image-container mb-4">
            <img
              src={event.img || "/placeholder.svg?height=300&width=300"}
              alt={eventName}
              className="event-image"
            />
          </div>

          <div className="event-content">
            <h2 className="content-heading">{t("introduction")}</h2>
            <p>{description}</p>

            <h2 className="content-heading">{t("programContent")}</h2>
            <p>{details}</p>
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
                registerLabel === t("expired") ? "btn-expired" : ""
              }`}
              disabled={registerDisabled || registerLocked}
              onClick={() => {
                const token = localStorage.getItem("token");

                if (!token) {
                  if (registerLocked) return;

                  toast.warning(<strong>{t("pleaseLogin")}</strong>);
                  setRegisterLocked(true);
                  setTimeout(() => setRegisterLocked(false), 2000);
                  return;
                }

                if (!registerDisabled) {
                  if (!user || user.ageGroup !== event.ageGroup) {
                    toast.error(<strong>{t("unsuitableAge")}</strong>);
                    return;
                  }

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
                      toast.success(<strong>{t("successRegister")}</strong>);
                      setStatusInfo((prev) => ({
                        ...prev,
                        status: "REGISTERED",
                      }));
                    })
                    .catch((err) => {
                      toast.error(
                        <strong>
                          {t("registerFail")}: {err.message}
                        </strong>
                      );
                    });
                }
              }}
            >
              {registerLabel}
            </Button>

            {userStatus === "REGISTERED" && (
              <Button
                variant="outline-danger"
                size="lg"
                className="register-button w-100 mb-4"
                disabled={cancelLocked}
                onClick={async () => {
                  if (cancelLocked) return;
                  setCancelLocked(true);
                  const token = localStorage.getItem("token");
                  try {
                    const res = await fetch(
                      `http://localhost:8080/api/event/${event.eventID}/cancel`,
                      {
                        method: "PUT",
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      }
                    );
                    if (!res.ok)
                      throw new Error(t("cancelFail") || "Cancel failed!");
                    toast.success(
                      <strong>
                        {t("cancelSuccess") || "Cancelled successfully!"}
                      </strong>
                    );
                    setStatusInfo((prev) => ({
                      ...prev,
                      status: "NOT_REGISTERED", // hoặc fetch lại status mới nhất từ backend
                    }));
                  } catch (err) {
                    toast.error(
                      <strong>{err.message || t("cancelFail")}</strong>
                    );
                  } finally {
                    setCancelLocked(false);
                  }
                }}
              >
                {cancelLocked
                  ? t("cancellingButton", "Cancelling...")
                  : t("cancelButton", "Cancel")}
              </Button>
            )}

            <h3 className="sidebar-heading text-center mb-3">{t("details")}</h3>

            <div className="detail-card mb-3">
              <div className="detail-label">{t("time")}:</div>
              <div className="detail-value">
                <Clock size={18} className="detail-icon" />
                <span>
                  <div>{dateStr}</div>
                  <div>{timeStr}</div>
                </span>
              </div>
            </div>

            <div className="detail-card mb-3">
              <div className="detail-label">{t("location")}:</div>
              <div className="detail-value">
                <MapPin size={18} className="detail-icon" />
                <span>{event.location}</span>
              </div>
            </div>

            <div className="detail-card mb-3">
              <div className="detail-label">{t("capacity")}:</div>
              <div className="detail-value">
                <Users size={18} className="detail-icon" />
                <span>{event.quantity}</span>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-label">{t("status")}:</div>
              <div
                className={`detail-value ${
                  statusInfo?.full ? "status-full" : "status-available"
                }`}
              >
                <CircleDot size={18} className="detail-icon" />
                <span>
                  {statusInfo?.status === "REGISTERED"
                    ? t("registered")
                    : statusInfo?.full
                    ? t("full")
                    : t("ongoing")}
                </span>
              </div>
            </div>
          </div>
        </Col>
      </Row>
      <Recommendation type="event" />
      <ToastContainer position="top-right" />
    </Container>
  );
};

export default EventDetails;
