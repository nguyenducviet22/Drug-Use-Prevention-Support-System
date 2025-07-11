import { useEffect, useState } from "react";
import { Row, Col, Card, Button, Badge, Container, Modal } from "react-bootstrap";
import { BookOpen, GraduationCap, ClipboardCheck, Calendar, Award, TrendingUp, Eye } from "lucide-react";
import "./Reports.css";
import useFetch from "../../hooks/useFetch";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Reports = () => {
  const { t } = useTranslation("reports");
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalData, setModalData] = useState([]);
  const [modalType, setModalType] = useState(""); // To differentiate between data types in modal
  const [selectedAppointment, setSelectedAppointment] = useState(null); // New state for detailed appointment modal

  const { user, loading: authLoading } = useAuth();
  const username = user?.username;
  const role = user?.role;
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [assessmentResults, setAssessmentResults] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const { get } = useFetch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (username && role) {
          const blogsData = await get(`http://localhost:8080/api/blog/my-list/${username}/status/PUBLISHED`);
          setBlogs(blogsData);
          if (role === "MEMBER") {
            const enrollmentsData = await get(`http://localhost:8080/api/enrollment/my-list/${username}`);
            setEnrollments(enrollmentsData);
            const assessmentResultsData = await get(`http://localhost:8080/api/assessment-result/my-list/${username}`);
            setAssessmentResults(assessmentResultsData);
            const appointmentsData = await get(`http://localhost:8080/api/appointment/my-list/${username}`);
            setAppointments(appointmentsData);
          } else if (role === "CONSULTANT") {
            const appointmentsData = await get(`http://localhost:8080/api/appointment/consultant-list/${username}`);
            setAppointments(appointmentsData);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [username, role, get]);
  console.log(blogs);
  console.log(enrollments);
  console.log(assessmentResults);
  console.log(appointments);
  
  const stats = {
    totalBlogs: blogs.length,
    totalEnrollments: enrollments.length,
    totalAssessmentResults: assessmentResults.length,
    averageCourseScore: enrollments.length > 0
      ? Math.round(
          enrollments.reduce((sum, course) => sum + course.score, 0) / enrollments.length
        )
      : 0,
    totalAppointments: appointments.length,
  };

  const getRiskLevelColor = (riskLevel) => {
    const colors = {
      [t("riskLevelLow")]: "success",
      [t("riskLevelModerate")]: "warning",
      [t("riskLevelHigh")]: "danger",
    };
    return colors[riskLevel] || "secondary";
  };

  const handleViewDetails = (type, id) => {
    if (type === "blog") {
      navigate(`/blogs/${id}`);
    } else if (type === "course") {
      navigate(`/courses/${id}`);
    } else if (type === "assessment") {
      navigate(`/assessment-result/${id}`);
    }
    // No direct navigation for appointments from this modal, as we're showing a sub-modal.
  };

  const handleStatClick = (type) => {
    setModalType(type);
    if (type === "blogs") {
      setModalTitle(t("blogsSectionTitle"));
      setModalData(blogs);
    } else if (type === "enrollments") {
      setModalTitle(t("coursesSectionTitle"));
      setModalData(enrollments);
    } else if (type === "assessments") {
      setModalTitle(t("assessmentSectionTitle"));
      setModalData(assessmentResults);
    } else if (type === "appointments") {
      setModalTitle(t("appointmentsSectionTitle"));
      setModalData(appointments);
    }
    setShowModal(true);
  };

  const handleOpenAppointmentDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true); // Re-use the main modal for details, but this time its content changes.
    setModalType("appointmentDetails"); // Set a new type to render specific content
    setModalTitle(t("appointmentDetailsTitle")); // Set a specific title for this modal
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAppointment(null); // Clear selected appointment when closing
    setModalType(""); // Clear modal type
  };

  if (authLoading || isLoading) {
    return (
      <Container className="my-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t("loading")}</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <div className="reports">
      <Card className="reports-card">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">{t("title")}</h5>
        </Card.Header>
        <Card.Body>
          {/* Statistics Overview */}
          <div className="stats-overview mb-4">
            <Row>
              <Col md={role === "CONSULTANT" ? 6 : 3} className="mb-3">
                <div className="stat-card text-center p-3" onClick={() => handleStatClick("blogs")}>
                  <BookOpen size={32} className="text-primary mb-2" />
                  <h4 className="mb-1">{stats.totalBlogs}</h4>
                  <small className="text-muted">{t("blogsPublished")}</small>
                </div>
              </Col>
              {role === "MEMBER" && (
                <>
                  <Col md={3} className="mb-3">
                    <div className="stat-card text-center p-3" onClick={() => handleStatClick("enrollments")}>
                      <GraduationCap size={32} className="text-success mb-2" />
                      <h4 className="mb-1">{stats.totalEnrollments}</h4>
                      <small className="text-muted">{t("coursesCompleted")}</small>
                    </div>
                  </Col>
                  <Col md={3} className="mb-3">
                    <div className="stat-card text-center p-3" onClick={() => handleStatClick("assessments")}>
                      <ClipboardCheck size={32} className="text-warning mb-2" />
                      <h4 className="mb-1">{stats.totalAssessmentResults}</h4>
                      <small className="text-muted">{t("assessmentsTaken")}</small>
                    </div>
                  </Col>
                </>
              )}
              <Col md={role === "CONSULTANT" ? 6 : 3} className="mb-3">
                <div className="stat-card text-center p-3" onClick={() => handleStatClick("appointments")}>
                  <Calendar size={32} className="text-info mb-2" />
                  <h4 className="mb-1">{stats.totalAppointments}</h4>
                  <small className="text-muted">{t("appointmentsScheduled")}</small>
                </div>
              </Col>
            </Row>
          </div>
        </Card.Body>
      </Card>

      {/* Main Data List Modal */}
      <Modal show={showModal && modalType !== "appointmentDetails"} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalData.length === 0 ? (
            <p className="text-muted">{t("noDataAvailable")}</p>
          ) : (
            <div className="activity-list">
              {modalType === "blogs" &&
                modalData.map((blog) => (
                  <div key={blog.blogID} className="activity-item d-flex justify-content-between align-items-center p-3 mb-2">
                    <div className="activity-info">
                      <h6 className="mb-1">{blog.blogName}</h6>
                      <div className="activity-meta">
                        <small className="text-muted me-3">
                          <Calendar size={14} className="me-1" />
                          {new Date(blog.updatedAt).toLocaleDateString()}
                        </small>
                        <small className="text-muted me-3">
                          <BookOpen size={14} className="me-1" />
                          {blog.readingTime} {t("mins")}
                        </small>
                        <Badge bg="secondary" className="category-badge">
                          {blog.blogType}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="outline-primary" size="sm" onClick={() => handleViewDetails("blog", blog.blogID)}>
                      <Eye size={14} />
                    </Button>
                  </div>
                ))}

              {modalType === "enrollments" &&
                modalData.map((enrollment) => (
                  <div key={enrollment.course.courseID} className="activity-item d-flex justify-content-between align-items-center p-3 mb-2">
                    <div className="activity-info flex-grow-1">
                      <h6 className="mb-1">{enrollment.course.courseName}</h6>
                      <div className="activity-meta mb-2">
                        <small className="text-muted me-3">
                          <Calendar size={14} className="me-1" />
                          {new Date(enrollment.endDate).toLocaleDateString()}
                        </small>
                        <small className="text-muted me-3">
                          <GraduationCap size={14} className="me-1" />
                          {enrollment.course.duration}
                        </small>
                        {enrollment.course.certificate && (
                          <Badge bg="success" className="certificate-badge">
                            <Award size={12} className="me-1" />
                            {t("certified")}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="ms-3"
                      onClick={() => handleViewDetails("course", enrollment.course.courseID)}
                    >
                      <Eye size={14} />
                    </Button>
                  </div>
                ))}

              {modalType === "assessments" &&
                modalData.map((result) => (
                  <div key={result.assessmentResultID} className="activity-item p-3 mb-2">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="activity-info">
                        <h6 className="mb-1">{result.assessment?.assessmentType}</h6>
                        <div className="activity-meta">
                          <small className="text-muted me-3">
                            <Calendar size={14} className="me-1" />
                            {new Date(result.completedTime).toLocaleDateString()}
                          </small>
                          <small className="text-muted me-3">{t("score")}: {result.score}</small>
                          <Badge bg={getRiskLevelColor(result.riskLevel)} className="risk-badge">
                            {t(`riskLevel${result.riskLevel.charAt(0).toUpperCase()}${result.riskLevel.slice(1).toLowerCase()}`)}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="outline-primary" size="sm"
                        onClick={() => handleViewDetails("assessment", result.assessmentResultID)}
                      >
                        <Eye size={14} />
                      </Button>
                    </div>
                  </div>
                ))}

              {modalType === "appointments" &&
                modalData.map((appointment) => (
                  <div key={appointment.appointmentID} className="activity-item p-3 mb-2">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="activity-info">
                        <h6 className="mb-1">
                          {role === "MEMBER"
                            ? t("appointmentWithConsultant", { consultant: appointment.consultant.username })
                            : t("appointmentWithMember", { member: appointment.member.username })}
                        </h6>
                        <div className="activity-meta">
                          <small className="text-muted me-3">
                            <Calendar size={14} className="me-1" />
                            {new Date(appointment.appointmentDateTime).toLocaleDateString()} - {new Date(appointment.appointmentDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </small>
                          <Badge bg={appointment.status === "COMPLETED" ? "success" : "warning"} className="status-badge">
                            {t(`appointmentStatus${appointment.status.charAt(0).toUpperCase()}${appointment.status.slice(1).toLowerCase()}`)}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="outline-primary" size="sm" onClick={() => handleOpenAppointmentDetails(appointment)}>
                         <Eye size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            {t("close")}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Detailed Appointment Modal (sub-modal, but rendered as the main modal with specific content) */}
      <Modal show={showModal && modalType === "appointmentDetails"} onHide={handleCloseModal} size="md">
        <Modal.Header closeButton>
          <Modal.Title>{t("appointmentDetailsTitle")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAppointment && (
            <div>
              <p>
                <strong>{t("consultant")}:</strong> {selectedAppointment.consultant.username}
              </p>
              <p>
                <strong>{t("member")}:</strong> {selectedAppointment.member.username}
              </p>
              <p>
                <strong>{t("appointmentDateTime")}:</strong>{" "}
                {new Date(selectedAppointment.appointmentDateTime).toLocaleDateString()} -{" "}
                {new Date(selectedAppointment.appointmentDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p>
                <strong>{t("status")}:</strong>{" "}
                <Badge bg={selectedAppointment.status === "COMPLETED" ? "success" : "warning"}>
                  {t(`appointmentStatus${selectedAppointment.status.charAt(0).toUpperCase()}${selectedAppointment.status.slice(1).toLowerCase()}`)}
                </Badge>
              </p>
              <p>
                <strong>{t("notes")}:</strong> {selectedAppointment.notes || t("noNotes")}
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            {t("close")}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Reports;