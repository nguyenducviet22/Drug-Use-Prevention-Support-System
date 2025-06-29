import { useEffect, useState } from "react"
import { Row, Col, Card, Button, Badge, ProgressBar, Container } from "react-bootstrap"
import { BookOpen, GraduationCap, ClipboardCheck, Calendar, Award, TrendingUp, Download, Eye } from "lucide-react"
import "./Reports.css"
import useFetch from "../../hooks/useFetch"
import { useAuth } from "../../hooks/useAuth"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next" // Import useTranslation

const Reports = () => {
  const { t } = useTranslation("reports") // Initialize useTranslation
  const [activeTab, setActiveTab] = useState("finished-activities")
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  // Mock data for finished activities
  const [blogs, setBlogs] = useState([])
  const [courses, setCourses] = useState([]) // Assuming this will be fetched in the future
  const [assessmentResults, setAssessmentResults] = useState([])
  const username = user?.username;
  const { loading: loadingBlogs, error: blogsError, get: getBlogs } = useFetch(`http://localhost:8080/api/blog/my-list/${username}`)
  // const { loading: coursesLoading, error: coursesError, get: getCourses } = useFetch(`http://localhost:8080/api/course/my-list/${user?.username}`)
  const { loading: loadingAssessmentResults, error: assessmentResultsError, get: getAssessmentResults } = useFetch(`http://localhost:8080/api/assessment-result/my-list/${username}`)

  useEffect(() => {
    getBlogs()
      .then(setBlogs)
      .catch(() => { });

    // getCourses()
    //   .then(setCourses)
    //   .catch(() => { });

    getAssessmentResults()
      .then(setAssessmentResults)
      .catch(() => { });
  }, [getBlogs, getAssessmentResults])

  const finishedActivities = {
    blogs,
    courses: [ // This is still mock data. You'll need to fetch real data here.
      {
        id: 1,
        title: "School Drug Prevention",
        completedDate: "2024-12-20",
        duration: "4 hours",
        score: 95,
        certificate: true,
      },
      {
        id: 2,
        title: "Awareness of synthetic drugs",
        completedDate: "2024-12-01",
        duration: "3 hours",
        score: 88,
        certificate: true,
      },
    ],
    assessmentResults
  }

  const stats = {
    totalBlogs: finishedActivities.blogs.length,
    totalCourses: finishedActivities.courses.length,
    totalAssessmentResults: finishedActivities.assessmentResults.length,
    averageCourseScore: finishedActivities.courses.length > 0
      ? Math.round(
          finishedActivities.courses.reduce((sum, course) => sum + course.score, 0) / finishedActivities.courses.length,
        )
      : 0, // Handle division by zero
    certificatesEarned: finishedActivities.courses.filter((course) => course.certificate).length,
  }

  const getRiskLevelColor = (riskLevel) => {
    const colors = {
      [t("riskLevelLow")]: "success", // Use translated key
      [t("riskLevelModerate")]: "warning", // Use translated key
      [t("riskLevelHigh")]: "danger", // Use translated key
    }
    return colors[riskLevel] || "secondary"
  }

  const handleDownloadReport = () => {
    console.log("Download report clicked")
    // Implement report download functionality
  }

  const handleViewDetails = (type, id) => {
    if (type === "blog") {
      navigate(`/blogs/${id}`);
    } else if (type === "course") {
      navigate(`/courses/${id}`);
    } else if (type === "assessment") {
      navigate(`/assessment-result/${id}`);
    }
  }

  if (authLoading || loadingBlogs || loadingAssessmentResults) {
    return (
      <Container className="my-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t("loading")}</span>
          </div>
        </div>
      </Container>
    )
  }

  return (
    <div className="reports">
      <Card className="reports-card">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">{t("title")}</h5>
          <Button variant="outline-primary" size="sm" onClick={handleDownloadReport}>
            <Download size={16} className="me-1" />
            {t("downloadReport")}
          </Button>
        </Card.Header>
        <Card.Body>
          {/* Statistics Overview */}
          <div className="stats-overview mb-4">
            <Row>
              <Col md={3} className="mb-3">
                <div className="stat-card text-center p-3">
                  <BookOpen size={32} className="text-primary mb-2" />
                  <h4 className="mb-1">{stats.totalBlogs}</h4>
                  <small className="text-muted">{t("blogsRead")}</small>
                </div>
              </Col>
              <Col md={3} className="mb-3">
                <div className="stat-card text-center p-3">
                  <GraduationCap size={32} className="text-success mb-2" />
                  <h4 className="mb-1">{stats.totalCourses}</h4>
                  <small className="text-muted">{t("coursesCompleted")}</small>
                </div>
              </Col>
              <Col md={3} className="mb-3">
                <div className="stat-card text-center p-3">
                  <ClipboardCheck size={32} className="text-warning mb-2" />
                  <h4 className="mb-1">{stats.totalAssessmentResults}</h4>
                  <small className="text-muted">{t("assessmentsTaken")}</small>
                </div>
              </Col>
              <Col md={3} className="mb-3">
                <div className="stat-card text-center p-3">
                  <Award size={32} className="text-info mb-2" />
                  <h4 className="mb-1">{stats.certificatesEarned}</h4>
                  <small className="text-muted">{t("certificatesEarned")}</small>
                </div>
              </Col>
            </Row>
          </div>

          {/* Finished Activities Section */}
          <div className="finished-activities">
            <h6 className="section-title mb-4">
              <TrendingUp size={20} className="me-2" />
              {t("finishedActivities")}
            </h6>

            {/* Blogs Section */}
            <div className="activity-section mb-4">
              <h6 className="activity-title mb-3">{t("blogsSectionTitle")}</h6>
              {finishedActivities.blogs.length === 0 ? (
                <p className="text-muted">{t("noBlogsWritten")}</p>
              ) : (
                <div className="activity-list">
                  {finishedActivities.blogs.map((blog) => (
                    <div
                      key={blog.blogID}
                      className="activity-item d-flex justify-content-between align-items-center p-3 mb-2"
                    >
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
                </div>
              )}
            </div>

            {/* Courses Section */}
            <div className="activity-section mb-4">
              <h6 className="activity-title mb-3">{t("coursesSectionTitle")}</h6>
              {finishedActivities.courses.length === 0 ? (
                <p className="text-muted">{t("noCoursesCompleted")}</p>
              ) : (
                <div className="activity-list">
                  {finishedActivities.courses.map((course) => (
                    <div
                      key={course.id}
                      className="activity-item d-flex justify-content-between align-items-center p-3 mb-2"
                    >
                      <div className="activity-info flex-grow-1">
                        <h6 className="mb-1">{course.title}</h6>
                        <div className="activity-meta mb-2">
                          <small className="text-muted me-3">
                            <Calendar size={14} className="me-1" />
                            {new Date(course.completedDate).toLocaleDateString()}
                          </small>
                          <small className="text-muted me-3">
                            <GraduationCap size={14} className="me-1" />
                            {course.duration}
                          </small>
                          {course.certificate && (
                            <Badge bg="success" className="certificate-badge">
                              <Award size={12} className="me-1" />
                              {t("certified")}
                            </Badge>
                          )}
                        </div>
                        <div className="score-progress">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <small className="text-muted">{t("score")}</small>
                            <small className="fw-bold text-primary">{course.score}%</small>
                          </div>
                          <ProgressBar variant="primary" now={course.score} style={{ height: "6px" }} />
                        </div>
                      </div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="ms-3"
                        onClick={() => handleViewDetails("course", course.id)}
                      >
                        <Eye size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Assessment Section */}
            <div className="activity-section">
              <h6 className="activity-title mb-3">{t("assessmentSectionTitle")}</h6>
              {finishedActivities.assessmentResults.length === 0 ? (
                <p className="text-muted">{t("noAssessmentsCompleted")}</p>
              ) : (
                <div className="activity-list">
                  {finishedActivities.assessmentResults.map((result) => (
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
                              {t(`riskLevel${result.riskLevel.replace(/\s/g, '')}`)}
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
                </div>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}

export default Reports