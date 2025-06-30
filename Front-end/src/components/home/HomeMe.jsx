import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { Heart, Clipboard, Calendar, BookOpen, AlertTriangle, CalendarIcon, User } from "lucide-react";
import "./HomeMe.css";
import useFetch from "../../hooks/useFetch";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import CourseCard from "../card/CourseCard";
import BlogCard from "../card/BlogCard";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next"; // Import useTranslation

const HomeMe = () => {
  const { t } = useTranslation("homeMe"); // Initialize useTranslation
  const { user, authLoading } = useAuth();
  console.log(user);
  const navigate = useNavigate();

  // Update healthData to use translation keys
  const healthData = {
    mentalHealth: t("mentalHealthValue"),
    physicalHealth: t("physicalHealthValue"),
    lastDrugUse: t("lastDrugUseValue"),
    crafftScore: t("crafftScoreValue"),
    lastCounseling: t("lastCounselingValue"),
    warning: t("warningValue"),
    action: t("actionValue"),
  };

  // Update todaysTasks to use translation keys
  const todaysTasks = [
    {
      id: 1,
      title: t("taskConsultingTitle"),
      time: t("taskConsultingTime"),
      icon: <User size={20} />,
    },
    {
      id: 2,
      title: t("taskMiniTestTitle"),
      subtitle: t("taskMiniTestSubtitle"),
      icon: <BookOpen size={20} />,
    },
  ];

  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [learningCourses, setLearningCourses] = useState([]);
  const [draftBlogs, setDraftBlogs] = useState([]);
  const [upcomingAppointments, setupcomingAppointments] = useState([]);

  const { loading: loadingRecommendedCourses, error: errorRecommendedCourses, get: getRecommendedCourses } = useFetch();
  const { loading: loadingLearningCourses, error: errorLearningCourses, get: getLearningCourses } = useFetch();
  const { loading: loadingDraftBlogs, error: errorDraftBlogs, get: getDraftBlogs } = useFetch();
  const { loading: loadingAppointments, error: errorAppointments, get: getAppointments } = useFetch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user) {
          const ageGroup = user?.ageGroup;
          const username = user?.username;
          const recommendedCoursesData = await getRecommendedCourses(`http://localhost:8080/api/course/age-group/${ageGroup}`);
          setRecommendedCourses(recommendedCoursesData);

          const learningCoursesData = await getLearningCourses(`http://localhost:8080/api/course/LEARNING/${username}`);
          setLearningCourses(learningCoursesData);

          const draftBlogsData = await getDraftBlogs(`http://localhost:8080/api/blog/my-list/draft/${username}`);
          setDraftBlogs(draftBlogsData);

          const appointmentsData = await getAppointments(`http://localhost:8080/api/appointment/my-list/${username}`);
          setupcomingAppointments(appointmentsData);
        }
      } catch (err) {
        console.error("Fetch error in Home Me:", err);
        // Có thể set lỗi vào state để hiển thị ErrorMessage
      }
    };

    fetchData();
  }, [user, getRecommendedCourses, getLearningCourses, getDraftBlogs, getAppointments]);
  console.log("recommendedCourses:", recommendedCourses);
  console.log("learningCourses:", learningCourses);
  console.log("draftBlogs:", draftBlogs);
  console.log("upcomingAppointments:", upcomingAppointments);

  const handleDraftContinue = (blogId) => {
    navigate(`/blogs/draft/${blogId}`);
  };

  const handleMyBlogsClick = () => {
    navigate('/blogs');
  };

  const handleMyEventsClick = () => {
    navigate('/events');
  };

  const handleMyCoursesClick = () => {
    navigate('/courses');
  };

  const handleBookAppointmentClick = () => {
    navigate('/appointment');
  };

  if (!user || authLoading || loadingRecommendedCourses || loadingLearningCourses || loadingDraftBlogs || loadingAppointments) {
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
    <div className="home-me">
      <Container className="mb-5">
        {/* New Row for Buttons */}
        <Row className="mb-4 d-flex justify-content-center">
          <Col xs={12} md={3} className="mb-2 mb-md-0">
            <Button variant="info" className="w-100 rounded-pill shadow-sm custom-button" onClick={handleMyBlogsClick}>
              {t("myBlogsButton")}
            </Button>
          </Col>
          <Col xs={12} md={3} className="mb-2 mb-md-0">
            <Button variant="info" className="w-100 rounded-pill shadow-sm custom-button" onClick={handleMyEventsClick}>
              {t("myEventsButton")}
            </Button>
          </Col>
          <Col xs={12} md={3} className="mb-2 mb-md-0">
            <Button variant="info" className="w-100 rounded-pill shadow-sm custom-button" onClick={handleMyCoursesClick}>
              {t("myCoursesButton")}
            </Button>
          </Col>
          <Col xs={12} md={3}>
            <Button variant="info" className="w-100 rounded-pill shadow-sm custom-button" onClick={handleBookAppointmentClick}>
              {t("bookAppointmentButton")}
            </Button>
          </Col>
        </Row>

        <Row>
          {/* Health Status Card */}
          <Col lg={6} className="mb-4">
            <Card className="h-100 border-0 shadow-sm health-status-card">
              <div className="card-header-custom bg-primary text-white d-flex align-items-center">
                <Heart size={24} className="me-2" />
                <h5 className="mb-0 fw-bold">{t("healthStatusTitle")}</h5>
              </div>
              <Card.Body className="p-4">
                <div className="health-item mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <div className="health-icon mental-health me-2"></div>
                    <span className="health-label">{t("mentalHealthLabel")}</span>
                    <span className="health-value ms-1">{healthData.mentalHealth}</span>
                  </div>
                </div>

                <div className="health-item mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <div className="health-icon physical-health me-2"></div>
                    <span className="health-label">{t("physicalHealthLabel")}</span>
                    <span className="health-value ms-1">{healthData.physicalHealth}</span>
                  </div>
                </div>

                <div className="health-item mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <div className="health-icon drug-use me-2"></div>
                    <span className="health-label text-danger">{t("lastDrugUseLabel")}</span>
                    <span className="health-value ms-1">{healthData.lastDrugUse}</span>
                  </div>
                </div>

                <div className="health-item mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <div className="health-icon crafft-score me-2"></div>
                    <span className="health-label text-danger">{t("crafftScoreLabel")}</span>
                    <span className="health-value ms-1">{healthData.crafftScore}</span>
                  </div>
                </div>

                <div className="health-item mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <div className="health-icon counseling me-2"></div>
                    <span className="health-label text-danger">{t("lastCounselingLabel")}</span>
                    <span className="health-value ms-1">{healthData.lastCounseling}</span>
                  </div>
                </div>

                <div className="warning-section mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <AlertTriangle size={16} className="text-warning me-2" />
                    <span className="health-label text-warning">{t("warningLabel")}</span>
                    <span className="health-value ms-1">{healthData.warning}</span>
                  </div>
                </div>

                <div className="action-section">
                  <div className="d-flex align-items-center">
                    <CalendarIcon size={16} className="text-primary me-2" />
                    <span className="health-label text-primary">{t("actionLabel")}</span>
                    <span className="health-value ms-1">{healthData.action}</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Today's Tasks Card */}
          <Col lg={6} className="mb-4">
            <Card className="h-100 border-0 shadow-sm tasks-card">
              <div className="card-header-custom bg-info text-white d-flex align-items-center">
                <Clipboard size={24} className="me-2" />
                <h5 className="mb-0 fw-bold">{t("todaysTasksTitle")}</h5>
              </div>
              <Card.Body className="p-4">
                {todaysTasks.map((task) => (
                  <div key={task.id} className="task-item d-flex align-items-center p-3 mb-3 bg-light rounded-3">
                    <div className="task-icon me-3">
                      <div className="bg-primary bg-opacity-25 rounded-circle p-2">{task.icon}</div>
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-semibold text-dark">{task.title}</div>
                      {task.time && <small className="text-muted">{task.time}</small>}
                      {task.subtitle && <div className="text-primary small">{task.subtitle}</div>}
                    </div>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          {/* Upcoming Appointment Card */}
          <Col lg={6} className="mb-4">
            <Card className="h-100 border-0 shadow-sm appointment-card">
              <div className="card-header-custom bg-primary text-white d-flex align-items-center">
                <Calendar size={24} className="me-2" />
                <h5 className="mb-0 fw-bold">{t("upcomingAppointmentTitle")}</h5>
              </div>
              <Card.Body className="p-4">
                {upcomingAppointments.length > 0 ? (
                  <>
                    {upcomingAppointments.filter(appointment => appointment.status === "SCHEDULED").map((appointment) => (
                      <div className="appointment-info bg-light rounded-3 p-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <h6 className="fw-bold text-dark mb-1">{appointment.consultant.username}</h6>
                          </div>
                          <span className="badge bg-warning text-dark">{appointment.status}</span>
                        </div>
                        <div className="appointment-time mt-3">
                          <div className="fw-semibold text-primary">{appointment.appointmentDateTime}</div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-center text-muted">{t("noUpcomingAppointments")}</div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Recommended Course Card */}
          <Col lg={6} className="mb-4">
            <Card className="h-100 border-0 shadow-sm course-card">
              <div className="card-header-custom bg-success text-white d-flex align-items-center">
                <BookOpen size={24} className="me-2" />
                <h5 className="mb-0 fw-bold">{t("recommendedCourseTitle")}</h5>
              </div>
              <Card.Body className="p-4">
                {recommendedCourses.length > 0 ? (
                  <CourseCard course={recommendedCourses[0]} />
                ) : (
                  <div className="text-center text-muted">{t("noRecommendedCourses")}</div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Ongoing Activities Section */}
        <Row>
          <Col lg={12}>
            <h3 className="fw-bold text-dark mb-4">{t("ongoingActivitiesTitle")}</h3>
          </Col>
        </Row>

        <Row>
          {/* Learning Course Card */}
          <Col lg={6} className="mb-4">
            <Card className="h-100 border-0 shadow-sm learning-course-card">
              <div className="card-header-custom bg-info text-white d-flex align-items-center">
                <BookOpen size={24} className="me-2" />
                <h5 className="mb-0 fw-bold">{t("learningCourseTitle")}</h5>
              </div>
              <Card.Body className="p-4">
                {learningCourses.length > 0 ? (
                  <>
                    <CourseCard course={learningCourses[0]} status={'Learning'} />
                  </>
                ) : (
                  <div className="text-center text-muted">{t("noLearningCourses")}</div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* In-progress Blog Card */}
          <Col lg={6} className="mb-4">
            <Card className="h-100 border-0 shadow-sm blog-progress-card">
              <div className="card-header-custom bg-info text-white d-flex align-items-center">
                <Clipboard size={24} className="me-2" />
                <h5 className="mb-0 fw-bold">{t("inProgressBlogTitle")}</h5>
              </div>
              <Card.Body className="p-4">
                {draftBlogs.length === 0 ? (
                  <div className="text-center text-muted">{t("noDraftBlogs")}</div>
                ) : (
                  <>
                    <BlogCard blog={draftBlogs[0]} status={'draft'} />
                    <Button variant="primary" className="w-100" onClick={() => handleDraftContinue(draftBlogs[0].blogID)}>
                      {t("continueButton")}
                    </Button>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HomeMe;