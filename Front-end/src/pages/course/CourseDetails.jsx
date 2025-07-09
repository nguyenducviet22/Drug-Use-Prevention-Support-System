import { useState, useEffect, useCallback } from "react"
import { Container, Row, Col, Button } from "react-bootstrap"
import { useParams, useNavigate } from "react-router-dom"
import { Clock, BookOpen, Calendar, User } from "lucide-react"
import "./CourseDetails.css"
import useFetch from "../../hooks/useFetch"
import Recommendation from "../../components/others/Recommendation"
import ErrorMessage from "../../components/ErrorMessage"
import BackButton from "../../components/BackButton"
import NotFound from "../not-found/NotFound"
import LoadingSpinner from "../../components/LoadingSpinner"
import { toast } from "react-toastify"
import { useAuth } from "../../hooks/useAuth"
import { useTranslation } from "react-i18next"; // Import useTranslation

const CourseDetails = () => {
  const { t } = useTranslation("courseDetails"); // Khai báo useTranslation

  const { id: courseID } = useParams()
  const { user, authLoading } = useAuth()
  const username = user?.username
  const [course, setCourse] = useState(null)
  const [enrollment, setEnrollment] = useState(null)
  const [completionProgress, setCompletionProgress] = useState(0)
  const [modules, setModules] = useState([])
  const [lessons, setLessons] = useState([])
  const { loading: loadingCourseDetails, error: errorCourseDetails, get: getCourseDetails } = useFetch()
  const { loading: loadingModules, error: errorModules, get: getModules } = useFetch()
  const { loading: loadingLessons, error: errorLessons, get: getLessons } = useFetch()
  const { loading: loadingEnrollment, error: errorEnrollment, get: getEnrollment } = useFetch()
  const { loading: loadingCompletionProgress, error: errorCompletionProgress, get: getCompletionProgress } = useFetch()
  const { loading: loadingNewEnrollment, error: errorNewEnrollment, post: postEnrollment } = useFetch()
  const [moduleCount, setModuleCount] = useState(0)
  const [moduleDuration, setModuleDuration] = useState(0)
  const navigate = useNavigate()

  const fetchEnrollmentStatus = useCallback(async () => {
    // Chỉ fetch nếu username đã có và không đang trong quá trình authLoading
    if (username && !authLoading) {
      try {
        if (!courseID) {
          console.warn("Course ID is not available yet for fetching enrollment status.");
          return;
        }
        const initialEnrollment = await getEnrollment(`http://localhost:8080/api/enrollment?courseID=${courseID}&username=${username}`);
        setEnrollment(initialEnrollment);
      } catch (err) {
        // Nếu API trả về 404 (Not Found), nghĩa là người dùng chưa đăng ký
        if (err.response && err.response.status === 404) {
          setEnrollment(null); // Đặt null để biểu thị chưa đăng ký
        } else {
          console.error("Error fetching initial enrollment status:", err);
        }
      }
    } else if (!username && !authLoading) {
      // Nếu authLoading kết thúc và không có username (người dùng chưa đăng nhập)
      setEnrollment(null);
    }
  }, [username, authLoading, courseID, getEnrollment]);

  console.log("Enrollment:", enrollment);
  const enrollmentID = enrollment?.enrollmentID
  console.log(enrollmentID);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseData = await getCourseDetails(`http://localhost:8080/api/course/${courseID}`);
        setCourse(courseData);

        const moduleData = await getModules(`http://localhost:8080/api/course/${courseID}/modules`);
        setModules(moduleData);
        setModuleCount(moduleData.length);

        const lessonPromises = moduleData.map((mod) =>
          getLessons(`http://localhost:8080/api/module/${mod.moduleID}/lessons`)
        );

        const lessonsArray = await Promise.all(lessonPromises);
        const allLessons = lessonsArray.flat();

        const totalDuration = allLessons.reduce((sum, lesson) => {
          return sum + (lesson.lessonDuration || 0);
        }, 0);

        setLessons(allLessons);
        setModuleDuration(totalDuration);
      } catch (err) {
        console.error("Fetch error in CourseDetails:", err);
        toast.error(t("toastMessages.fetchDataError"), "danger") 
      }
    };

    fetchData();
  }, [courseID, getCourseDetails, getModules, getLessons, t]); // Thêm t vào dependency array

  useEffect(() => {
    const fetchProgress = async () => {
      if (enrollmentID && courseID) {
        try {
          const completionProgressData = await getCompletionProgress(`http://localhost:8080/api/progress/course-completion?enrollmentID=${enrollmentID}&courseID=${courseID}`);
          setCompletionProgress(completionProgressData);
        } catch (err) {
          console.error("Error fetching completion progress:", err);
        }
      } else if (enrollment === null && !loadingEnrollment && !authLoading) {
        // If enrollment is explicitly null (user not enrolled), set progress to 0
        setCompletionProgress(0);
      }
    };
    fetchProgress();
  }, [enrollmentID, courseID, getCompletionProgress, enrollment, loadingEnrollment, authLoading]); // Add enrollment as a dependency

  useEffect(() => {
    if (course) {
      fetchEnrollmentStatus();
    }
  }, [course, fetchEnrollmentStatus]);
  console.log("Course:", course);
  console.log("Modules:", modules);
  console.log("Lessons:", lessons);
  console.log("Enrollment:", enrollment);
  console.log("isCourseEnrolled (status):", enrollment?.status);
  console.log("completionProgress:", completionProgress);

  const onEnrollClick = async (id) => {
    if (!username) {
      toast.error(t("toastMessages.loginRequired")); 
      navigate('/login');
      return;
    }

    const currentEnrollmentStatus = enrollment?.status;

    if (currentEnrollmentStatus === "LEARNING" || currentEnrollmentStatus === "NOT_STARTED" || currentEnrollmentStatus === "COMPLETED") {
      // If already learning, not started, or completed, just navigate
      if (enrollment?.enrollmentID) {
        toast.info(t("toastMessages.continueOrCompleted")); 
        navigate(`/courses/lesson/${id}`, {
          state: {
            enrollmentID: enrollment.enrollmentID
          }
        });
      } else {
        toast.error(t("toastMessages.enrollmentInfoNotFound")); 
        // Fallback: try to re-fetch if ID is missing for some reason
        fetchEnrollmentStatus();
      }
      return; // Exit function early
    }

    const enrollmentData = {
      courseID: id,
    };

    try {
      const response = await postEnrollment(enrollmentData, {}, "http://localhost:8080/api/enrollment");

      setEnrollment(response);
      toast.success(t("toastMessages.enrollmentSuccess")); 
      console.log(`Enrolled successfully`, response);

      navigate(`/courses/lesson/${id}`, {
        state: {
          enrollmentID: response.enrollmentID // Lấy enrollmentID từ response.data
        }
      });
    } catch (err) {
      console.error("Failed to enroll:", err);
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(t("toastMessages.apiError", { message: err.response.data.message }));
      } else {
        toast.error(t("toastMessages.enrollmentFailed")); 
      }
    }
  }

  const isCourseEnrolled = enrollment?.status;
  console.log(isCourseEnrolled);

  return (
    <Container className="py-5">
      <LoadingSpinner loading={authLoading || loadingCourseDetails || loadingModules || loadingLessons || loadingEnrollment || loadingNewEnrollment} />
      <ErrorMessage error={errorCourseDetails || errorModules || errorLessons || errorEnrollment || errorNewEnrollment} />

      {!course || !modules || !lessons ? (
        <NotFound
          code={t("courseNotFound.code")}
          title={t("courseNotFound.title")}
          message={t("courseNotFound.message")}
          backLink="/courses"
          backText={t("courseNotFound.backText")}
        />
      ) : (
        <div className="course-details-page">
          <div className="course-header">
            <Container>
              <BackButton label={t("backButton")} /> 

              <div className="course-header-content">
                <h1 className="course-title">{course.courseName}</h1>
                <p className="course-description">{course.description}</p>

                <div className="mt-4 mb-3">
                  {isCourseEnrolled && (
                    <div className="progress-section mb-3">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted small">{t("progressSection.progressLabel")}</span> 
                        <span className="fw-semibold text-primary">
                          {completionProgress?.completion ? completionProgress.completion.toFixed(2) : 0}%
                        </span>
                      </div>
                      <div className="progress progress-custom" style={{ height: "8px" }}>
                        <div
                          className="progress-bar bg-primary"
                          style={{ width: `${completionProgress?.completion ? completionProgress.completion : 0}%` }}
                          role="progressbar"
                          aria-valuenow={completionProgress?.completion ? completionProgress.completion : 0}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        ></div>
                      </div>
                    </div>
                  )}
                  <Button
                    variant="primary"
                    size="lg"
                    className="enroll-button"
                    onClick={() => onEnrollClick(course.courseID)}
                    disabled={loadingNewEnrollment || loadingEnrollment}
                  >
                    {loadingNewEnrollment || loadingEnrollment ? (
                      t("enrollButton.loading") 
                    ) : (
                      isCourseEnrolled === "NOT_STARTED" || isCourseEnrolled === "LEARNING" ? (
                        t("enrollButton.continue") 
                      ) : isCourseEnrolled === "EXPIRED" ? (
                        t("enrollButton.refreshDue") 
                      ) : isCourseEnrolled === "COMPLETED" ? (
                        t("enrollButton.completed") 
                      ) : (
                        t("enrollButton.enroll") 
                      )
                    )}
                  </Button>
                  <p className="enrolled-count">{t("enrolledCount", { quantity: course.quantity })}</p> 
                </div>
              </div>
            </Container>
          </div>

          <Container className="course-features-container">
            <div className="course-features">
              <div className="feature">
                <div className="feature-value">
                  <User size={18} className="feature-icon" />
                  <span>{course.ageGroup}</span>
                </div>
                <div className="feature-description">&nbsp;</div>
              </div>

              <div className="feature">
                <div className="feature-value">
                  <BookOpen size={18} className="feature-icon" />
                  <span>{t("features.modules", { count: moduleCount })}</span> 
                </div>
                <div className="feature-description">{course.description}</div>
              </div>

              <div className="feature">
                <div className="feature-value">
                  <Clock size={18} className="feature-icon" />
                  <span>{t("features.minutes", { duration: course.duration })}</span> 
                </div>
                <div className="feature-description">&nbsp;</div>
              </div>

              <div className="feature">
                <div className="feature-value">
                  <Calendar size={18} className="feature-icon" />
                  <span>{course.createdAt}</span>
                </div>
              </div>
            </div>
          </Container>

          <Container className="py-5">
            <h2 className="section-title">{t("sections.whatYouWillLearn")}</h2> 

            <Row className="learning-outcomes">
              {lessons.map((lesson) => (
                <Col md={6} key={lesson.lessonID} className="mb-4">
                  <div className="outcome-card">
                    <h3 className="outcome-title">{lesson.lessonName}</h3>
                    <p className="outcome-description">{lesson.lessonObjectives}</p>
                  </div>
                </Col>
              ))}
            </Row>

            <h2 className="section-title mt-5">{t("sections.courseContent")}</h2> 

            <div className="lessons-container">
              {modules.map((module, index) => (
                <div key={module.moduleID} className="lesson-card">
                  <div className="lesson-header">
                    <div>
                      <h3 className="lesson-title">
                        {t("sections.moduleTitle", { index: index + 1, moduleName: module.moduleName })} 
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Container>

          {/* Related Courses Section */}
          <Recommendation type="course" />
        </div>
      )}
    </Container>
  )
}

export default CourseDetails