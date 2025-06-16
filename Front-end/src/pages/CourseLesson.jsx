import { useState, useEffect } from "react"
import { Container, Row, Col, Button } from "react-bootstrap"
import { Clock, ChevronDown, ChevronRight, Check, Circle } from "lucide-react"
import "./CourseLesson.css"
import { useParams } from "react-router-dom"
import useFetch from "../hooks/useFetch"
import BackButton from "../components/BackButton"
import ErrorMessage from "../components/ErrorMessage"
import LoadingSpinner from "../components/LoadingSpinner"
import NotFound from '../pages/NotFound'

const CourseLesson = () => {
  // const [courseData, setCourseData] = useState(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [expandedModules, setExpandedModules] = useState({ 1: true, 2: true })

  const { id: courseID } = useParams()
  const [course, setCourse] = useState(null)
  const [modules, setModules] = useState([])
  const [lessons, setLessons] = useState([])
  const [selectedModuleID, setSelectedModuleID] = useState(null)
  const [lessonByModuleID, setLessonByModuleID] = useState({})
  const [selectedLessonID, setSelectedLessonID] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const { loading: loadingCourseDetails, error: errorCourseDetails, get: getCourseDetails } = useFetch()
  const { loading: loadingModules, error: errorModules, get: getModules } = useFetch()
  const { loading: loadingLessons, error: errorLessons, get: getLessons } = useFetch()
  const [moduleDuration, setModuleDuration] = useState(0)

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const courseData = await getCourseDetails(`http://localhost:8080/api/course/${courseID}`);
        setCourse(courseData);

        const moduleData = await getModules(`http://localhost:8080/api/course/${courseID}/modules`);
        setModules(moduleData);
        console.log('Module Data: ', moduleData);

        // Fetch all lessons for each module
        const lessonPromises = moduleData.map((mod) =>
          getLessons(`http://localhost:8080/api/lesson/module/${mod.moduleID}`)
        );

        const lessonsArray = await Promise.all(lessonPromises);
        const lessonsMap = {};

        moduleData.forEach((mod, index) => {
          lessonsMap[mod.moduleID] = lessonsArray[index];
        });

        setLessonByModuleID(lessonsMap);

        //Total reading time of the course
        const allLessons = lessonsArray.flat()
        const totalDuration = allLessons.reduce((sum, lesson) => {
          return sum + (lesson.lessonDuration || 0)
        }, 0)
        setModuleDuration(totalDuration)

        // Nếu muốn tự động chọn module đầu tiên và hiện bài học
        if (moduleData.length > 0) {
          const firstModuleID = moduleData[0].moduleID;
          setSelectedModuleID(firstModuleID);
          setLessons(lessonsMap[firstModuleID] || []);
        }
      } catch (err) {
        console.error("Error fetching course/modules/lessons:", err);
      }
    };

    fetchInitialData();
  }, [courseID]);


  useEffect(() => {
    const fetchLessonsByModule = async () => {
      if (!selectedModuleID) return;

      try {
        const moduleLessons = await getLessons(`http://localhost:8080/api/lesson/module/${selectedModuleID}`);
        setLessons(moduleLessons);
      } catch (err) {
        console.error("Error fetching lessons for module:", err);
      }
    };

    fetchLessonsByModule();
  }, [selectedModuleID]);

  console.log(course);
  console.log(modules);
  console.log(lessons);

  // Mock course and lesson data
  const mockCourseData = {
    id: 1,
    title: "Drug refusal skills for students",
    provider: "ReNewMe",
    readingTime: "45 minutes",
    learningObjective: "Basic Knowledge",
    modules: [
      {
        id: 1,
        title: "Module 1",
        lessons: [
          { id: 1, title: "Lesson 1", completed: true },
          { id: 2, title: "Lesson 2", completed: true },
          { id: 3, title: "Lesson 3", completed: false },
        ],
      },
      {
        id: 2,
        title: "Module 2",
        lessons: [
          { id: 4, title: "Lesson 1", completed: false },
          { id: 5, title: "Lesson 2", completed: false },
          { id: 6, title: "Lesson 3", completed: false },
        ],
      },
    ],
  }

  const mockLesson = {
    id: 1,
    title: "Understanding Drugs",
    content: {
      sections: [
        {
          title: "Introduction to Drug Awareness",
          content: `Drug awareness is a critical component of maintaining personal health and making informed decisions throughout life. Understanding what drugs are, how they affect the body, and the risks associated with their use is essential knowledge for everyone, especially students who may encounter peer pressure or situations involving substance use.

This lesson will provide you with foundational knowledge about drugs, their classifications, effects on the human body, and the importance of drug prevention. By the end of this lesson, you will have a comprehensive understanding of the basic concepts that will serve as the foundation for the rest of this course.`,
        },
        {
          title: "What Are Drugs",
          content: `A drug is any substance that, when taken into the body, alters its function either physically, mentally, or both. This definition encompasses a wide range of substances, from prescription medications that treat medical conditions to illegal substances that are used recreationally.

It's important to understand that not all drugs are inherently bad. Many drugs serve important medical purposes and save lives when used properly under medical supervision. However, the misuse or abuse of any drug can lead to serious health consequences, addiction, and other negative outcomes.`,
          keyDefinition: {
            title: "Key Definition",
            content:
              "Drug: Any substance that changes the way your body or mind works when you take it into your body.",
          },
        },
        {
          title: "Types and Classifications of Drugs",
          content: `Drugs can be classified in several ways to help us understand their effects and risks:

**By Legal Status:**
• Legal drugs (alcohol, tobacco, caffeine)
• Prescription drugs (medications prescribed by doctors)
• Illegal drugs (substances prohibited by law)

**By Effects on the Body:**
• Stimulants (increase alertness and energy)
• Depressants (slow down body functions)
• Hallucinogens (alter perception and reality)

**Protective Factors:**
• Strong family bonds: Close relationships with family members
• Academic success: Doing well in school and being engaged
• Personal values: Strong beliefs about right and wrong
• Good coping skills: Healthy ways to deal with stress and problems`,
        },
      ],
      conclusion: `Understanding drugs and their effects is the first step in making informed decisions about substance use. This foundational knowledge will serve you throughout this course and in real-life situations where you might encounter drugs or pressure to use them.

Remember that knowledge is power. The more you understand about drugs, their risks, and the factors that contribute to drug problems, the better equipped you'll be to make healthy choices and help others do the same.

In the next lesson, we'll explore risk factors and warning signs in more detail, giving you the tools to recognize potentially dangerous situations before they become problems.`,
      keyTakeaways: [
        "Drugs are substances that alter body or mind function",
        "Not all drugs are illegal, but all can be harmful if misused",
        "Drugs affect the brain's communication system",
        "Prevention is more effective than treatment",
        "Understanding risk and protective factors helps in making better decisions",
      ],
    },
  }

  // useEffect(() => {
  //   // Simulate API call
  //   setTimeout(() => {
  //     setCourseData(mockCourseData)
  //     setLesson(mockLesson)
  //     setLoading(false)
  //   }, 1000)
  // }, [lessonId])

  const handleMarkAsRead = () => {
    setIsCompleted(true)
    console.log(`Lesson ${lessonId} marked as completed`)
  }

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }))
  }

  const handleModuleClick = (moduleID) => {
    toggleModule(moduleID);
    setSelectedModuleID(moduleID);
  };

  const handleLessonClick = (lessonId) => {
    setSelectedLessonID(lessonId);
    const found = lessons.find((l) => l.lessonID === lessonId);
    setSelectedLesson(found);
  }

  <Container className="py-5">
    <LoadingSpinner loading={loadingCourseDetails || loadingModules || loadingLessons} />
    <ErrorMessage error={errorCourseDetails || errorModules || errorLessons} />
  </Container>

  if (!course || !modules || !lessons) {
    return (
      <NotFound
        code="📘"
        title="Lesson Not Found"
        message="We couldn't find the lesson you're looking for."
        backLink={`/courses`}
        backText="Back to Courses"
      />
    )
  }

  return (
    <div className="course-lesson-page">
      <Container fluid className="px-0">
        <Row className="g-0">
          {/* Sidebar */}
          <Col lg={3} className="sidebar-col">
            <div className="lesson-sidebar">
              <BackButton label="Back" />
              {/* Course Info */}
              <div className="course-info">
                <div className="reading-time">
                  <h6 className="reading-time-title">Reading Time</h6>
                  <div className="time-info">
                    <Clock size={20} className="time-icon" />
                    <span>{moduleDuration} mins</span>
                  </div>
                </div>

                <div className="learning-objective">
                  <span className="objective-label">Course: </span>
                  <span className="objective-text">{course.courseName}</span>
                </div>

                <div className="learning-objective">
                  <span className="objective-label">Description: </span>
                  <span className="objective-text">{course.description}</span>
                </div>
              </div>

              {/* Module Navigation */}
              <div className="module-navigation">
                {modules.map((module) => (
                  <div key={module.moduleID} className="module-section">
                    <button
                      className="module-header"
                      onClick={() => handleModuleClick(module.moduleID)}
                      aria-expanded={expandedModules[module.moduleID]}
                    >
                      {expandedModules[module.moduleID] ? (
                        <ChevronDown size={16} className="module-icon" />
                      ) : (
                        <ChevronRight size={16} className="module-icon" />
                      )}
                      <span className="module-title">{module.moduleName}</span>
                    </button>

                    {expandedModules[module.moduleID] && (
                      <div className="lessons-list">
                        {(lessonByModuleID[module.moduleID] || []).map((lessonItem) => (
                          <button
                            key={lessonItem.lessonID}
                            className={`lesson-item ${lessonItem.lessonID === selectedLessonID ? "active" : ""}`}
                            onClick={() => handleLessonClick(lessonItem.lessonID)}
                          >
                            {lessonItem.completed ? (
                              <Check size={16} className="lesson-status completed" />
                            ) : (
                              <Circle size={16} className="lesson-status incomplete" />
                            )}
                            <span className="lesson-title">{lessonItem.lessonName}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Col>

          {/* Main Content */}
          <Col lg={9} className="content-col">
            <div className="lesson-content">
              {selectedLesson ? (
                <div className="content-section">
                  <h2 className="section-title">{selectedLesson.lessonName}</h2>
                  {/* Hiển thị nội dung bài học nếu có */}
                  {/* <div className="section-content">
                    {selectedLesson.lessonContent.map((paragraph, index) => (
                      <p key={index} className="content-paragraph">{paragraph}</p>
                    ))}
                  </div> */}

                  {/* Key Definition Box nếu có */}
                  {/* {selectedLesson.keyDefinition && (
                    <div className="key-definition-box">
                      <h4 className="definition-title">{selectedLesson.keyDefinition.title}</h4>
                      <p className="definition-content">{selectedLesson.keyDefinition.content}</p>
                    </div>
                  )} */}

                  {/* Conclusion nếu có */}
                  {/* <div className="content-section">
                    <h2 className="section-title">Conclusion</h2>
                    <div className="section-content">
                      {selectedLesson.content?.conclusion?.split("\n\n").map((p, i) => (
                        <p key={i} className="content-paragraph">{p}</p>
                      ))}
                    </div>
                  </div> */}

                  {/* Key Takeaways nếu có */}
                  {/* <div className="key-takeaways-section">
                    <h3 className="takeaways-title">Key Takeaways</h3>
                    <ul className="takeaways-list">
                      {selectedLesson.content?.keyTakeaways?.map((takeaway, i) => (
                        <li key={i} className="takeaway-item">{takeaway}</li>
                      ))}
                    </ul>
                  </div> */}

                  {/* Mark as Read Button */}
                  <div className="mark-read-section">
                    <Button
                      className={`mark-read-btn ${isCompleted ? "completed" : ""}`}
                      onClick={handleMarkAsRead}
                      disabled={isCompleted}
                    >
                      {isCompleted ? "Completed" : "Mark as Read"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-muted text-center py-4">Select a lesson to start learning.</div>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default CourseLesson
