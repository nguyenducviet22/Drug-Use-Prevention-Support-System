import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { MapPin, Clock, Video, User } from "lucide-react";
import "./HomeExplore.css";
import useFetch from "../../hooks/useFetch";
import { useEffect, useState } from "react";
import BlogCard from "../card/BlogCard";
import CourseCard from "../card/CourseCard";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next"; // Import useTranslation

const getRandomItems = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const HomeExplore = () => {
  const { t } = useTranslation("homeExplore"); // Initialize useTranslation
  const navigate = useNavigate();
  const [randomBlogs, setRandomBlogs] = useState([]);
  const [randomCourses, setRandomCourses] = useState([]);

  const [everyoneBlogs, setEveryoneBlogs] = useState([]);
  const { loading: loadingEveryoneBlogs, get: getEveryoneBlogs } = useFetch("http://localhost:8080/api/blog/age-group/EVERYONE");

  // Modify events array to use translation keys
  const events = [
    {
      id: 1,
      title: t("drugAwarenessWeekTitle"),
      time: t("drugAwarenessWeekTime"),
      location: t("drugAwarenessWeekLocation"),
      description: t("drugAwarenessWeekDescription"),
      activities: [
        t("drugAwarenessWeekActivities.activity1"),
        t("drugAwarenessWeekActivities.activity2"),
        t("drugAwarenessWeekActivities.activity3"),
        t("drugAwarenessWeekActivities.activity4"),
      ],
    },
    {
      id: 2,
      title: t("workshopTitle"),
      time: t("workshopTime"),
      platform: t("workshopPlatform"),
      speaker: t("workshopSpeaker"),
      contents: [
        t("workshopContents.content1"),
        t("workshopContents.content2"),
        t("workshopContents.content3"),
        t("workshopContents.content4"),
      ],
    },
  ];

  const [everyoneCourses, setEveryoneCourses] = useState([]);
  const { loading: loadingEveryoneCourses, get: getEveryoneCourses } = useFetch("http://localhost:8080/api/course/age-group/EVERYONE");

  useEffect(() => {
    getEveryoneBlogs()
      .then((data) => {
        setEveryoneBlogs(data);
        setRandomBlogs(getRandomItems(data, 2));
      })
      .catch(() => { });

    getEveryoneCourses()
      .then((data) => {
        setEveryoneCourses(data);
        setRandomCourses(getRandomItems(data, 3));
      })
      .catch(() => { });
  }, [getEveryoneBlogs, getEveryoneCourses]);

  console.log(everyoneBlogs);
  console.log(everyoneCourses);

  const handleReadMore = (blogId) => {
    navigate(`/blogs/${blogId}`);
  };

  const handleCoursesClick = (courseID) => {
    navigate(`/courses/${courseID}`);
  };

  if (loadingEveryoneBlogs || loadingEveryoneCourses) {
    return (
      <Container className="my-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t("loadingMessage")}</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <div className="home-explore">
      {/* New Blogs Section */}
      <Container className="mb-5">
        <div className="bg-light rounded-4 p-4">
          <h3 className="fw-bold text-dark mb-4">{t("newBlogsTitle")}</h3>
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
          <h3 className="fw-bold text-dark mb-4">{t("eventsTitle")}</h3>
          <Row>
            {events.map((event) => (
              <Col md={6} key={event.id} className="mb-4">
                <Card className="h-100 border-0 shadow-sm event-card">
                  <Card.Body className="p-4">
                    <Card.Title className="fw-bold text-dark mb-3 fs-5">{event.title}</Card.Title>

                    <div className="mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <Clock size={16} className="text-danger me-2" />
                        <span className="text-danger fw-semibold">{t("eventTime")}</span>
                        <span className="ms-1">{event.time}</span>
                      </div>

                      {event.location && (
                        <div className="d-flex align-items-center mb-2">
                          <MapPin size={16} className="text-danger me-2" />
                          <span className="text-danger fw-semibold">{t("eventLocation")}</span>
                          <span className="ms-1">{event.location}</span>
                        </div>
                      )}

                      {event.platform && (
                        <div className="d-flex align-items-center mb-2">
                          <Video size={16} className="text-danger me-2" />
                          <span className="text-danger fw-semibold">{t("eventPlatform")}</span>
                          <span className="ms-1">{event.platform}</span>
                        </div>
                      )}

                      {event.speaker && (
                        <div className="d-flex align-items-center mb-2">
                          <User size={16} className="text-danger me-2" />
                          <span className="text-danger fw-semibold">{t("eventSpeaker")}</span>
                          <span className="ms-1">{event.speaker}</span>
                        </div>
                      )}
                    </div>

                    {event.description && (
                      <div className="mb-3">
                        <span className="text-danger fw-semibold">{t("eventDescription")}</span>
                        <p className="mb-2 mt-1">{event.description}</p>
                      </div>
                    )}

                    {event.activities && (
                      <ul className="mb-3 ps-3">
                        {event.activities.map((activity, index) => (
                          <li key={index} className="mb-1">
                            {activity}
                          </li>
                        ))}
                      </ul>
                    )}

                    {event.contents && (
                      <div className="mb-3">
                        <span className="text-danger fw-semibold">{t("eventContents")}</span>
                        <ul className="mb-0 mt-1 ps-3">
                          {event.contents.map((content, index) => (
                            <li key={index} className="mb-1">
                              {content}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="text-center mt-4">
                      <Button variant="primary" className="px-4">
                        {t("attendButton")}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </Container>

      {/* Popular Courses Section */}
      <Container className="mb-5">
        <div className="bg-light rounded-4 p-4">
          <h3 className="fw-bold text-dark mb-4">{t("popularCoursesTitle")}</h3>
          <Row>
            {randomCourses.map((course) => (
              <Col md={4} key={course.courseID} className="mb-4">
                <CourseCard course={course}
                  onEnrollClick={handleCoursesClick}
                  onDetailsClick={handleCoursesClick} />
              </Col>
            ))}
          </Row>
        </div>
      </Container>
    </div>
  );
};

export default HomeExplore;