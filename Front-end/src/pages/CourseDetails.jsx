import { useState, useEffect } from "react"
import { Container, Row, Col, Button } from "react-bootstrap"
import { useParams, useNavigate } from "react-router-dom"
import { Clock, BookOpen, Calendar, User } from "lucide-react"
import "./CourseDetails.css"
import useFetch from "../hooks/useFetch"
import Recommendation from "../components/Recommendation"
import ErrorMessage from "../components/ErrorMessage"
import BackButton from "../components/BackButton"
import NotFound from "./NotFound"
import LoadingSpinner from "../components/LoadingSpinner"

const CourseDetails = () => {
  const { id: courseID } = useParams()
  const [course, setCourse] = useState(null)
  const [modules, setModules] = useState([])
  const [lessons, setLessons] = useState([])
  const { loading: loadingCourseDetails, error: errorCourseDetails, get: getCourseDetails } = useFetch()
  const { loading: loadingModules, error: errorModules, get: getModules } = useFetch()
  const { loading: loadingLessons, error: errorLessons, get: getLessons } = useFetch()
  const [moduleCount, setModuleCount] = useState(0)
  const [moduleDuration, setModuleDuration] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const courseData = await getCourseDetails(`http://localhost:8080/api/course/${courseID}`)
        setCourse(courseData)

        const moduleData = await getModules(`http://localhost:8080/api/course/${courseID}/modules`)
        setModules(moduleData)
        setModuleCount(moduleData.length)

        const lessonPromises = moduleData.map((mod) =>
          getLessons(`http://localhost:8080/api/lesson/module/${mod.moduleID}`)
        )

        const lessonsArray = await Promise.all(lessonPromises)
        const allLessons = lessonsArray.flat()

        const totalDuration = allLessons.reduce((sum, lesson) => {
          return sum + (lesson.lessonDuration || 0)
        }, 0)

        setLessons(allLessons)
        setModuleDuration(totalDuration)
      } catch (err) {
        console.error("Fetch error in CourseDetails:", err)
      }
    }

    fetchAll()
  }, [courseID])
  console.log(course);
  console.log(modules);
  console.log(lessons);

  const onEnrollClick = (id) => {
    navigate(`/courses/lesson/${id}`)
  }

  <Container className="py-5">
    <LoadingSpinner loading={loadingCourseDetails || loadingModules || loadingLessons} />
    <ErrorMessage error={errorCourseDetails || errorModules || errorLessons} />
  </Container>

  if (!course || !modules || !lessons) {
    return (
      <NotFound
        code="📘"
        title="Course Not Found"
        message="We couldn't find the course you're looking for."
        backLink="/courses"
        backText="Back to Courses"
      />
    )
  }

  return (
    <div className="course-details-page">
      <div className="course-header">
        <Container>
          <BackButton label="Back" />

          <div className="course-header-content">
            <h1 className="course-title">{course.courseName}</h1>
            <p className="course-description">{course.description}</p>

            <div className="mt-4 mb-3">
              <Button variant="primary" size="lg" className="enroll-button"
                onClick={() => onEnrollClick(course.courseID)}>
                Enroll
              </Button>
              <p className="enrolled-count">{course.quantity} already enrolled</p>
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
              <span>{moduleCount} modules</span>
            </div>
            <div className="feature-description">{course.description}</div>
          </div>

          <div className="feature">
            <div className="feature-value">
              <Clock size={18} className="feature-icon" />
              <span>{moduleDuration} mins</span>
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
        <h2 className="section-title">What you will learn</h2>

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

        <h2 className="section-title mt-5">Course content</h2>

        <div className="lessons-container">
          {modules.map((module, index) => (
            <div key={module.moduleID} className="lesson-card">
              <div className="lesson-header">
                <div>
                  <h3 className="lesson-title">
                    Module {index + 1}: {module.moduleName}
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
  )
}

export default CourseDetails