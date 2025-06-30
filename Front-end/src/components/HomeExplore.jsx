import { Container, Row, Col, Button, Card, Spinner } from "react-bootstrap";
import { Clock, MapPin, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import BlogCard from "./BlogCard";
import CourseCard from "./CourseCard";
import "./HomeExplore.css";
import moment from "moment";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../hooks/useAuth";

const getRandomItems = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const HomeExplore = () => {
  const [attendLocked, setAttendLocked] = useState(false);
  const navigate = useNavigate();
  const [randomBlogs, setRandomBlogs] = useState([]);
  const [randomCourses, setRandomCourses] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const [registeredEventIds, setRegisteredEventIds] = useState([]);

  const handleAttend = async (eventID) => {
    const token = localStorage.getItem("token");
    const selectedEvent = upcomingEvents.find((e) => e.eventID === eventID);

    if (!token) {
      if (attendLocked) return;
      setAttendLocked(true);
      toast.warning(<strong>⚠️ Please login to attend!</strong>);
      setTimeout(() => setAttendLocked(false), 2000);
      return;
    }

    if (!user || user.ageGroup !== selectedEvent?.ageGroup) {
      toast.error(<strong>❌ Unsuitable Age!</strong>);
      return;
    }

    const normalizedID = eventID.toLowerCase();
    if (registeredEventIds.includes(normalizedID)) {
      toast.info(<strong>✅ You already registered this event</strong>);
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

      toast.success(<strong>🎉 Registered Successfully!</strong>);
      setRegisteredEventIds((prev) => [...prev, normalizedID]);
    } catch (err) {
      toast.error(<strong>❌ {err.message || "Registration failed"}</strong>);
    }
  };

  const { loading: loadingBlogs, get: getBlogs } = useFetch(
    "http://localhost:8080/api/blog/age-group/EVERYONE"
  );
  const { loading: loadingCourses, get: getCourses } = useFetch(
    "http://localhost:8080/api/course/age-group/EVERYONE"
  );
  const { loading: loadingEvents, get: getEvents } = useFetch(
    "http://localhost:8080/api/event/upcoming"
  );

  useEffect(() => {
    getBlogs().then((data) => {
      setRandomBlogs(getRandomItems(data, 2));
    });
    getCourses().then((data) => {
      setRandomCourses(getRandomItems(data, 3));
    });
    getEvents().then((data) => {
      console.log("Event API result:", data);
      if (Array.isArray(data)) {
        // Nếu là mảng trực tiếp
        setUpcomingEvents(data.slice(0, 2));
      } else if (Array.isArray(data?.data)) {
        // Nếu là object có field data
        setUpcomingEvents(data.data.slice(0, 2));
      } else {
        setUpcomingEvents([]);
      }
    });
  }, [getBlogs, getCourses, getEvents]);

  // Theo dõi khi upcomingEvents thay đổi
  useEffect(() => {
    console.log("Render upcomingEvents:", upcomingEvents);
  }, [upcomingEvents]);

  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      console.log("🚀 Fetching registered events...");
      console.log("👤 user:", user);
      console.log("🔐 token:", token);
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
        const joinedIds = joined.map((e) => e.eventID?.toLowerCase()); // 👈 Normalize lowercase
        setRegisteredEventIds(joinedIds);
        console.log("✔️ Registered Event IDs:", joinedIds);
      } catch (err) {
        console.error("Failed to fetch joined events:", err.message);
      }
    };

    fetchRegisteredEvents();
  }, [user, token]);

  const handleReadMore = (blogId) => {
    navigate(`/blogs/${blogId}`);
  };

  if (loadingBlogs || loadingCourses || loadingEvents) {
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
          <h3 className="fw-bold text-dark mb-4">New Blogs</h3>
          <Row>
            {randomBlogs.map((blog) => (
              <Col md={6} key={blog.blogID} className="mb-4">
                <BlogCard blog={blog} onReadClick={handleReadMore} />
              </Col>
            ))}
          </Row>
        </div>
      </Container>

      {/* Events Section */}
      <Container className="mb-5">
        <div className="bg-light rounded-4 p-4">
          <h3 className="fw-bold text-dark mb-4">Upcoming Events</h3>
          <Row>
            {upcomingEvents.map((event) => {
              const normalizedId = event.eventID.toLowerCase();
              const isAttended = registeredEventIds.includes(normalizedId);
              const isCancelled = event.status === "CANCELLED";

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
                        <span className="text-danger fw-semibold">Time:</span>
                        <span className="ms-1">
                          {moment(event.startDate).format("DD/MM/YYYY HH:mm")} –{" "}
                          {moment(event.endDate).format("HH:mm")}
                        </span>
                      </div>

                      {event.location && (
                        <div className="mb-2">
                          <MapPin size={16} className="text-danger me-2" />
                          <span className="text-danger fw-semibold">
                            Location:
                          </span>
                          <span className="ms-1">{event.location}</span>
                        </div>
                      )}

                      {event.fee !== undefined && (
                        <div className="mb-2">
                          <DollarSign size={16} className="text-danger me-2" />
                          <span className="text-danger fw-semibold">Fee:</span>
                          <span className="ms-1">
                            {event.fee === 0 ? "Free" : `$${event.fee}`}
                          </span>
                        </div>
                      )}

                      {event.description && (
                        <p className="mt-3">{event.description}</p>
                      )}

                      <div className="d-flex justify-content-center gap-4 mt-4 flex-wrap">
                        <Button
                          size="lg"
                          variant={
                            isAttended
                              ? "secondary"
                              : isCancelled
                              ? "outline-danger"
                              : "primary"
                          }
                          disabled={isAttended || isCancelled || attendLocked}
                          onClick={() => handleAttend(event.eventID)}
                        >
                          {isAttended
                            ? "Attended"
                            : isCancelled
                            ? "Unavailable"
                            : "Attend"}
                        </Button>

                        <Button
                          size="lg"
                          variant="outline-secondary"
                          className="px-4"
                          onClick={() => navigate(`/events/${event.eventID}`)}
                        >
                          Details
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
          <h3 className="fw-bold text-dark mb-4">Popular Courses</h3>
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
