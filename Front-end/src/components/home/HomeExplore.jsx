import { Container, Row, Col, Button, Card, Spinner } from "react-bootstrap";
import { Clock, MapPin, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import BlogCard from "../card/BlogCard";
import CourseCard from "../card/CourseCard";
import "./HomeExplore.css";
import moment from "moment";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../hooks/useAuth";
import { useTranslation } from "react-i18next";

const getRandomItems = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const HomeExplore = () => {
  const { t } = useTranslation("homeExplore");
  const [attendLocked, setAttendLocked] = useState(false);
  const navigate = useNavigate();
  const [randomBlogs, setRandomBlogs] = useState([]);
  const [randomCourses, setRandomCourses] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [registeredEventIds, setRegisteredEventIds] = useState([]);
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const [cancelLoadingIds, setCancelLoadingIds] = useState([]); // Lưu các event đang hủy

  const getEventStatus = async (eventId) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/event/${eventId}/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await res.json();
      return result;
    } catch (err) {
      console.error("Error fetching status for event", eventId, err.message);
      return { status: "NOT_REGISTERED", full: false };
    }
  };

  const { loading: loadingEveryoneBlogs, get: getEveryoneBlogs } = useFetch(
    "http://localhost:8080/api/blog/age-group/EVERYONE"
  );
  const { loading: loadingEveryoneCourses, get: getEveryoneCourses } = useFetch(
    "http://localhost:8080/api/course/age-group/EVERYONE"
  );
  const { loading: loadingEvents, get: getEvents } = useFetch(
    "http://localhost:8080/api/event/upcoming"
  );

  const handleAttend = async (eventID) => {
    const selectedEvent = upcomingEvents.find((e) => e.eventID === eventID);

    if (!token) {
      if (attendLocked) return;
      setAttendLocked(true);
      toast.warning(
        <strong>⚠️ {t("pleaseLogin") || "Please login to attend!"}</strong>
      );
      setTimeout(() => setAttendLocked(false), 2000);
      return;
    }

    if (!user || user.ageGroup !== selectedEvent?.ageGroup) {
      toast.error(
        <strong>❌ {t("unsuitableAge") || "Unsuitable Age!"}</strong>
      );
      return;
    }

    const normalizedID = eventID.toLowerCase();
    if (registeredEventIds.includes(normalizedID)) {
      toast.info(
        <strong>
          ✅ {t("alreadyRegistered") || "You already registered this event"}
        </strong>
      );
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8080/api/event/${eventID}/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const text = await res.text();
      const result = text ? JSON.parse(text) : {};

      if (!res.ok) throw new Error(result?.message || res.statusText);

      toast.success(
        <strong>🎉 {t("registerSuccess") || "Registered Successfully!"}</strong>
      );
      setRegisteredEventIds((prev) => [...prev, normalizedID]);
    } catch (err) {
      toast.error(
        <strong>
          ❌ {err.message || t("registerFailed") || "Registration failed"}
        </strong>
      );
    }
  };

  const handleCancel = async (eventID) => {
    if (cancelLoadingIds.includes(eventID)) return; // Đang xử lý, chặn spam
    setCancelLoadingIds((prev) => [...prev, eventID]);
    try {
      const res = await fetch(
        `http://localhost:8080/api/event/${eventID}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error(t("cancelFailed") || "Cancel failed!");
      toast.success(
        <strong>✅ {t("cancelSuccess") || "Cancelled successfully!"}</strong>
      );
      // Xóa khỏi danh sách đã đăng ký
      setRegisteredEventIds((prev) =>
        prev.filter((id) => id !== eventID.toLowerCase())
      );
    } catch (err) {
      toast.error(
        <strong>
          ❌ {err.message || t("cancelFailed") || "Cancel failed!"}
        </strong>
      );
    } finally {
      setCancelLoadingIds((prev) => prev.filter((id) => id !== eventID));
    }
  };

  useEffect(() => {
    getEveryoneBlogs()
      .then((data) => {
        setRandomBlogs(getRandomItems(data, 2));
      })
      .catch(() => {});

    getEveryoneCourses()
      .then((data) => {
        setRandomCourses(getRandomItems(data, 3));
      })
      .catch(() => {});

    getEvents().then(async (data) => {
      const eventsArray = Array.isArray(data) ? data : data?.data || [];
      const topEvents = eventsArray.slice(0, 2);

      const enrichedEvents = await Promise.all(
        topEvents.map(async (event) => {
          const statusInfo = await getEventStatus(event.eventID);
          return { ...event, statusInfo };
        })
      );

      setUpcomingEvents(enrichedEvents);
    });
  }, [getEveryoneBlogs, getEveryoneCourses, getEvents]);

  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      if (!user || !token) return;

      try {
        const res = await fetch(
          `http://localhost:8080/api/event/my-events/${user.username}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const text = await res.text();
        const result = text ? JSON.parse(text) : [];

        if (!res.ok) {
          throw new Error(result?.message || res.statusText);
        }

        const joined = Array.isArray(result) ? result : result.data || [];
        const joinedIds = joined.map((e) => e.eventID?.toLowerCase());
        setRegisteredEventIds(joinedIds);
      } catch (err) {
        console.error("Failed to fetch joined events:", err.message);
      }
    };

    fetchRegisteredEvents();
  }, [user, token]);

  if (loadingEveryoneBlogs || loadingEveryoneCourses || loadingEvents) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <div className="home-explore">
      {/* Blogs Section */}
      <Container className="mb-5">
        <div className="bg-light rounded-4 p-4">
          <h3 className="fw-bold text-dark mb-4">{t("newBlogsTitle")}</h3>
          <Row>
            {randomBlogs.map((blog) => (
              <Col md={6} key={blog.blogID} className="mb-4">
                <BlogCard
                  blog={blog}
                  onReadClick={() => navigate(`/blogs/${blog.blogID}`)}
                />
              </Col>
            ))}
          </Row>
        </div>
      </Container>

      {/* Events Section */}
      <Container className="mb-5">
        <div className="bg-light rounded-4 p-4">
          <h3 className="fw-bold text-dark mb-4">{t("eventsTitle")}</h3>
          <Row>
            {upcomingEvents.map((event) => {
              const normalizedId = event.eventID.toLowerCase();
              const isAttended = registeredEventIds.includes(normalizedId);
              const isCancelled = event.status === "CANCELLED";
              const isFull = event.statusInfo?.full === true;

              return (
                <Col md={6} key={event.eventID} className="mb-4">
                  <Card className="h-100 border-0 shadow-sm event-card">
                    {event.img && (
                      <Card.Img
                        variant="top"
                        src={event.img}
                        alt={event.eventName}
                        style={{ height: 180, objectFit: "cover" }}
                      />
                    )}
                    <Card.Body className="p-4">
                      <Card.Title className="fw-bold text-dark mb-2 fs-5">
                        {event.eventName}
                      </Card.Title>

                      {event.subTitle && (
                        <Card.Subtitle className="mb-2 text-muted">
                          {event.subTitle}
                        </Card.Subtitle>
                      )}

                      <div className="mb-2">
                        <Clock size={16} className="text-danger me-2" />
                        <span className="text-danger fw-semibold">
                          {t("eventTime")}
                        </span>
                        <span className="ms-1">
                          {moment(event.startDate).format("DD/MM/YYYY HH:mm")} –{" "}
                          {moment(event.endDate).format("HH:mm")}
                        </span>
                      </div>

                      {event.location && (
                        <div className="mb-2">
                          <MapPin size={16} className="text-danger me-2" />
                          <span className="text-danger fw-semibold">
                            {t("eventLocation")}
                          </span>
                          <span className="ms-1">{event.location}</span>
                        </div>
                      )}

                      {event.fee !== undefined && (
                        <div className="mb-2">
                          <DollarSign size={16} className="text-danger me-2" />
                          <span className="text-danger fw-semibold">
                            {t("eventFee") || "Fee:"}
                          </span>
                          <span className="ms-1">
                            {event.fee === 0
                              ? t("free") || "Free"
                              : `$${event.fee}`}
                          </span>
                        </div>
                      )}

                      {event.description && (
                        <p className="mt-3">{event.description}</p>
                      )}

                      <div className="d-flex justify-content-center gap-4 mt-4 flex-wrap">
                        {isAttended ? (
                          <Button
                            size="lg"
                            variant="outline-danger"
                            className="min-width-btn"
                            disabled={cancelLoadingIds.includes(event.eventID)}
                            onClick={() => handleCancel(event.eventID)}
                          >
                            {cancelLoadingIds.includes(event.eventID)
                              ? t("cancellingButton") || "Cancelling..."
                              : t("cancelButton") || "Cancel"}
                          </Button>
                        ) : (
                          <Button
                            size="lg"
                            className={`${
                              isFull ? "btn-full" : ""
                            } min-width-btn`}
                            variant={
                              isCancelled
                                ? "outline-danger"
                                : isFull
                                ? "outline-secondary"
                                : "primary"
                            }
                            disabled={isCancelled || isFull || attendLocked}
                            onClick={() => handleAttend(event.eventID)}
                          >
                            {isCancelled
                              ? t("unavailable") || "Unavailable"
                              : isFull
                              ? t("full") || "Full"
                              : t("attendButton") || "Attend"}
                          </Button>
                        )}

                        <Button
                          size="lg"
                          variant="outline-secondary"
                          className="px-4"
                          onClick={() => navigate(`/events/${event.eventID}`)}
                        >
                          {t("details") || "Details"}
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
      </Container>

      {/* Courses Section */}
      <Container className="mb-5">
        <div className="bg-light rounded-4 p-4">
          <h3 className="fw-bold text-dark mb-4">{t("popularCoursesTitle")}</h3>
          <Row>
            {randomCourses.map((course) => (
              <Col md={4} key={course.courseID} className="mb-4">
                <CourseCard course={course} />
              </Col>
            ))}
          </Row>
        </div>
        <ToastContainer position="top-right" autoClose={3000} />
      </Container>
    </div>
  );
};

export default HomeExplore;
