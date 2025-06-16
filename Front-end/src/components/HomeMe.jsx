import { Container, Row, Col, Button, Card } from "react-bootstrap"
import { Heart, Clipboard, Calendar, BookOpen, AlertTriangle, CalendarIcon, User } from "lucide-react"
import "./HomeMe.css"
import useFetch from "../hooks/useFetch"
import { useAuth } from "../hooks/useAuth"
import { useEffect, useState } from "react"
import CourseCard from "./CourseCard"
import BlogCard from "./BlogCard"

const HomeMe = () => {
    const { user, authLoading } = useAuth();
    console.log(user);

    const healthData = {
        mentalHealth: "Moderate Anxiety",
        physicalHealth: "Stable",
        lastDrugUse: "4 months ago (Methamphetamine)",
        crafftScore: "6 (High Risk)",
        lastCounseling: "May 10, 2025 – with Dr. Sawyer",
        warning: "Possible relapse risk detected",
        action: "Schedule appointment within 3 days",
    }

    const todaysTasks = [
        {
            id: 1,
            title: "Consulting with Mohammed Ahijed",
            time: "14:50 PM",
            icon: <User size={20} />,
        },
        {
            id: 2,
            title: "Mini Test - [Course_Name]",
            subtitle: "Click to continue",
            icon: <BookOpen size={20} />,
        },
    ]

    const upcomingAppointment = {
        doctor: "Dr. Mohammed Ahijed",
        specialty: "Addiction Counselor",
        time: "14:50PM",
        date: "Sun, 1/08",
        status: "In Progress",
    }

    const [recommendedCourses, setRecommendedCourses] = useState([])
    const [learningCourses, setLearningCourses] = useState([])
    const [draftBlogs, setDraftBlogs] = useState([])

    const { loading: loadingRecommendedCourses,
        error: errorRecommendedCourses,
        get: getRecommendedCourses } = useFetch(user?.ageGroup ? `http://localhost:8080/api/course/age-group/${user.ageGroup}` : null)

    const { loading: loadingLearningCourses,
        error: errorLearningCourses,
        get: getLearningCourses } = useFetch(user?.username ? `http://localhost:8080/api/course/LEARNING/${user.username}` : null)
        
    const { loading: loadingDraftBlogs,
        error: errorDraftBlogs,
        get: getDraftBlogs } = useFetch(user?.username ? `http://localhost:8080/api/blog/draft/${user.username}` : null)

    useEffect(() => {
        getRecommendedCourses().then(setRecommendedCourses).catch(() => { })
        getLearningCourses().then(setLearningCourses).catch(() => { })
        getDraftBlogs().then(setDraftBlogs).catch(() => { })
    }, [getRecommendedCourses, getLearningCourses])

    const handleDraftContinue = (blogId) => {
        navigate(`/blogs/draft/${blogId}`)
    }

    if (!user || authLoading || loadingRecommendedCourses || loadingLearningCourses || loadingDraftBlogs) {
        return (
            <Container className="my-5">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </Container>
        )
    }

    return (
        <div className="home-me">
            <Container className="mb-5">
                <Row>
                    {/* Health Status Card */}
                    <Col lg={6} className="mb-4">
                        <Card className="h-100 border-0 shadow-sm health-status-card">
                            <div className="card-header-custom bg-primary text-white d-flex align-items-center">
                                <Heart size={24} className="me-2" />
                                <h5 className="mb-0 fw-bold">Health Status</h5>
                            </div>
                            <Card.Body className="p-4">
                                <div className="health-item mb-3">
                                    <div className="d-flex align-items-center mb-2">
                                        <div className="health-icon mental-health me-2"></div>
                                        <span className="health-label">Mental Health:</span>
                                        <span className="health-value ms-1">{healthData.mentalHealth}</span>
                                    </div>
                                </div>

                                <div className="health-item mb-3">
                                    <div className="d-flex align-items-center mb-2">
                                        <div className="health-icon physical-health me-2"></div>
                                        <span className="health-label">Physical Health:</span>
                                        <span className="health-value ms-1">{healthData.physicalHealth}</span>
                                    </div>
                                </div>

                                <div className="health-item mb-3">
                                    <div className="d-flex align-items-center mb-2">
                                        <div className="health-icon drug-use me-2"></div>
                                        <span className="health-label text-danger">Last Drug Use:</span>
                                        <span className="health-value ms-1">{healthData.lastDrugUse}</span>
                                    </div>
                                </div>

                                <div className="health-item mb-3">
                                    <div className="d-flex align-items-center mb-2">
                                        <div className="health-icon crafft-score me-2"></div>
                                        <span className="health-label text-danger">CRAFFT Score:</span>
                                        <span className="health-value ms-1">{healthData.crafftScore}</span>
                                    </div>
                                </div>

                                <div className="health-item mb-3">
                                    <div className="d-flex align-items-center mb-2">
                                        <div className="health-icon counseling me-2"></div>
                                        <span className="health-label text-danger">Last Counseling:</span>
                                        <span className="health-value ms-1">{healthData.lastCounseling}</span>
                                    </div>
                                </div>

                                <div className="warning-section mb-3">
                                    <div className="d-flex align-items-center mb-2">
                                        <AlertTriangle size={16} className="text-warning me-2" />
                                        <span className="health-label text-warning">Warning:</span>
                                        <span className="health-value ms-1">{healthData.warning}</span>
                                    </div>
                                </div>

                                <div className="action-section">
                                    <div className="d-flex align-items-center">
                                        <CalendarIcon size={16} className="text-primary me-2" />
                                        <span className="health-label text-primary">Action:</span>
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
                                <h5 className="mb-0 fw-bold">Today's Tasks</h5>
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
                                <h5 className="mb-0 fw-bold">Upcoming Appointment</h5>
                            </div>
                            <Card.Body className="p-4">
                                <div className="appointment-info bg-light rounded-3 p-3">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <div>
                                            <h6 className="fw-bold text-dark mb-1">{upcomingAppointment.doctor}</h6>
                                            <p className="text-muted mb-0 small">{upcomingAppointment.specialty}</p>
                                        </div>
                                        <span className="badge bg-warning text-dark">{upcomingAppointment.status}</span>
                                    </div>
                                    <div className="appointment-time mt-3">
                                        <div className="fw-semibold text-primary">{upcomingAppointment.time}</div>
                                        <div className="text-muted small">{upcomingAppointment.date}</div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Recommended Course Card */}
                    <Col lg={6} className="mb-4">
                        <Card className="h-100 border-0 shadow-sm course-card">
                            <div className="card-header-custom bg-success text-white d-flex align-items-center">
                                <BookOpen size={24} className="me-2" />
                                <h5 className="mb-0 fw-bold">Recommended Course</h5>
                            </div>
                            <Card.Body className="p-4">
                                {recommendedCourses.length > 0 ? (
                                    <CourseCard course={recommendedCourses[0]} />
                                ) : (
                                    <div className="text-center text-muted">No recommended courses available at this time.</div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Ongoing Activities Section */}
                <Row>
                    <Col lg={12}>
                        <h3 className="fw-bold text-dark mb-4">Ongoing Activities</h3>
                    </Col>
                </Row>

                <Row>
                    {/* Learning Course Card */}
                    <Col lg={6} className="mb-4">
                        <Card className="h-100 border-0 shadow-sm learning-course-card">
                            <div className="card-header-custom bg-info text-white d-flex align-items-center">
                                <BookOpen size={24} className="me-2" />
                                <h5 className="mb-0 fw-bold">Learning Course</h5>
                            </div>
                            <Card.Body className="p-4">
                                {learningCourses.length > 0 ? (
                                    <>
                                        <CourseCard course={learningCourses[0]} status={'Learning'} />
                                        <div className="progress-section mb-3">
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="text-muted small">Progress</span>
                                                <span className="fw-semibold text-primary">95%</span>
                                            </div>
                                            <div className="progress progress-custom" style={{ height: "8px" }}>
                                                <div
                                                    className="progress-bar bg-primary"
                                                    style={{ width: "95%" }}
                                                    role="progressbar"
                                                    aria-valuenow={95}
                                                    aria-valuemin={0}
                                                    aria-valuemax={100}
                                                ></div>
                                            </div>
                                        </div>
                                        <Button variant="primary" className="w-100">
                                            Continue
                                        </Button>
                                    </>
                                ) : (
                                    <div className="text-center text-muted">No learning courses found.</div>
                                )}

                            </Card.Body>
                        </Card>
                    </Col>

                    {/* In-progress Blog Card */}
                    <Col lg={6} className="mb-4">
                        <Card className="h-100 border-0 shadow-sm blog-progress-card">
                            <div className="card-header-custom bg-info text-white d-flex align-items-center">
                                <Clipboard size={24} className="me-2" />
                                <h5 className="mb-0 fw-bold">In-progress Blog</h5>
                            </div>
                            <Card.Body className="p-4">
                                {draftBlogs.length === 0 ? (
                                    <div className="text-center text-muted">No draft blogs found.</div>
                                ) : (
                                    <>
                                        <BlogCard blog={draftBlogs[0]} status={'draft'} />
                                        <Button variant="primary" className="w-100">
                                            Continue
                                        </Button>
                                    </>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default HomeMe
