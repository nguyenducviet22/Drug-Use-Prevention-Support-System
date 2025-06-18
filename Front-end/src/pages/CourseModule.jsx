import { useState, useEffect } from "react"
import { Container, Row, Col } from "react-bootstrap"
import { useParams, useNavigate } from "react-router-dom"
import { Clock, BookOpen } from "lucide-react"
import "./CourseModule.css"
import useFetch from "../hooks/useFetch"
import ErrorMessage from "../components/ErrorMessage"
import BackButton from "../components/BackButton"

const CourseModule = () => {
  const { id: moduleID } = useParams()
  const [module, setModule] = useState(null)
  const [lessons, setLessons] = useState([])
  const { loading: loadingModules, error: errorModules, get: getModules } = useFetch()
  const { loading: loadingLessons, error: errorLessons, get: getLessons } = useFetch()
  const [lessonCount, setLessonCount] = useState(0)
  const [lessonDuration, setLessonDuration] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const moduleData = await getModules(`http://localhost:8080/api/module/${moduleID}`)
        setModule(moduleData)

        const lessonData = await getLessons(`http://localhost:8080/api/lesson/module/${moduleID}`)
        setLessons(lessonData)
        setLessonCount(lessonData.length)

        const totalDuration = lessonData.reduce((sum, lesson) => {
          return sum + (lesson.lessonDuration || 0)
        }, 0)
        setLessonDuration(totalDuration)
      } catch (err) {
        console.error("Fetch error in CourseModule:", err)
      }
    }

    fetchAll()
  }, [moduleID])

  console.log(module);
  console.log(lessons);

  const onReadClick = (id) => {
    navigate(`/lesson/${id}`)
  }

  if (loadingModules || loadingLessons) {
    return (
      <Container className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    )
  }

  <ErrorMessage error={errorModules || errorLessons} />

  if (!module || !lessons) {
    return (
      <Container className="text-center py-5">
        <div className="alert alert-warning" role="alert">
          Module not found
        </div>
      </Container>
    )
  }

  return (
    <div className="course-details-page">
      <div className="course-header">
        <Container>
          <BackButton label="Back" />
          <div className="course-header-content">
            <h1 className="course-title">{module.moduleName}</h1>
          </div>
        </Container>
      </div>

      <Container className="course-features-container">
        <div className="course-features">
          <div className="feature">
            <div className="feature-value">
              <BookOpen size={18} className="feature-icon" />
              <span>{lessonCount} lessons</span>
            </div>
            <div className="feature-description">{module.moduleName}</div>
          </div>

          <div className="feature">
            <div className="feature-value">
              <Clock size={18} className="feature-icon" />
              <span>{lessonDuration} mins</span>
            </div>
            <div className="feature-description">&nbsp;</div>
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
          {lessons.map((lesson, index) => (
            <div key={lesson.lessonID} className="lesson-card" onClick={() => onReadClick(lesson.lessonID)}>
              <div className="lesson-header">
                <div>
                  <h3 className="lesson-title">
                    Lesson {index + 1}: {lesson.lessonName}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  )
}

export default CourseModule