import { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { Clock, ChevronDown, ChevronRight, Check, Circle } from "lucide-react";
import "./CourseLesson.css";
import { useLocation, useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import BackButton from "../../components/BackButton";
import ErrorMessage from "../../components/ErrorMessage";
import LoadingSpinner from "../../components/LoadingSpinner";
import NotFound from "../not-found/NotFound";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const CourseLesson = () => {
  const { t } = useTranslation("courseLesson"); // Khai báo useTranslation

  const [expandedModuleID, setExpandedModuleID] = useState(null)

  const { id: courseID } = useParams()
  const location = useLocation();
  const enrollmentID = location.state?.enrollmentID;

  const [course, setCourse] = useState(null)
  const [modules, setModules] = useState([])
  const [lessons, setLessons] = useState([])
  const [lessonByModuleID, setLessonByModuleID] = useState({})
  const [allUserProgress, setAllUserProgress] = useState([]); // New state to hold all user's progress entries

  const [selectedModuleID, setSelectedModuleID] = useState(null)
  const [selectedLessonID, setSelectedLessonID] = useState(null)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [currentLessonProgress, setCurrentLessonProgress] = useState(null)

  const { loading: loadingCourseDetails, error: errorCourseDetails, get: getCourseDetails } = useFetch()
  const { loading: loadingModules, error: errorModules, get: getModules } = useFetch()
  const { loading: loadingLessons, error: errorLessons, get: getLessons } = useFetch()
  // New fetch hook for all user progress
  const { get: getAllProgressForEnrollment, loading: loadingAllProgress, error: errorAllProgress } = useFetch()
  const { post: postProgress, loading: loadingNewProgress, error: errorNewProgress } = useFetch()
  const { put: putCompletedLesson, loading: loadingCompletedLesson, error: errorCompletedLesson } = useFetch()
  const { get: getProgress, loading: loadingProgress, error: errorProgress } = useFetch()
  const { put: updateEnrollmentStatus, loading: loadingEnrollmentUpdate, error: errorEnrollmentUpdate } = useFetch();
  const [moduleDuration, setModuleDuration] = useState(0)

  // Helper function to merge lessons with their progress status
  const mergeLessonsWithProgress = (modulesData, lessonsMap, progressData) => {
    const updatedLessonsMap = { ...lessonsMap };
    const progressMap = new Map();
    progressData.forEach(p => progressMap.set(p.lessonID, p));

    modulesData.forEach(mod => {
      if (updatedLessonsMap[mod.moduleID]) {
        updatedLessonsMap[mod.moduleID] = updatedLessonsMap[mod.moduleID].map(lesson => {
          const progressForLesson = progressMap.get(lesson.lessonID);
          return {
            ...lesson,
            status: progressForLesson ? progressForLesson.status : "NOT_STARTED", // Default to NOT_STARTED
            progressID: progressForLesson ? progressForLesson.progressID : null // Also add progressID
          };
        });
      }
    });
    return updatedLessonsMap;
  };

  const checkAllLessonsCompleted = useCallback(() => {
    const allLessonsFlat = Object.values(lessonByModuleID).flat();

    if (allLessonsFlat.length === 0) {
      return false; // If no lessons, course is not completed
    }

    const allCompleted = allLessonsFlat.every(lesson => lesson.status === "COMPLETED");

    return allCompleted;
  }, [lessonByModuleID]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const courseData = await getCourseDetails(`http://localhost:8080/api/course/${courseID}`);
        setCourse(courseData);

        const moduleData = await getModules(`http://localhost:8080/api/course/${courseID}/modules`);
        setModules(moduleData);

        const lessonPromises = moduleData.map((mod) =>
          getLessons(`http://localhost:8080/api/module/${mod.moduleID}/lessons`)
        );

        const lessonsArray = await Promise.all(lessonPromises);
        let initialLessonsMap = {};

        moduleData.forEach((mod, index) => {
          initialLessonsMap[mod.moduleID] = lessonsArray[index];
        });

        // 1. Fetch all user progress if enrollmentID is available
        let userProgress = [];
        if (enrollmentID) {
          userProgress = await getAllProgressForEnrollment(`http://localhost:8080/api/progress/enrollment/${enrollmentID}`);
          setAllUserProgress(userProgress);
        }

        // 2. Merge lessons with user progress
        const mergedLessonsMap = mergeLessonsWithProgress(moduleData, initialLessonsMap, userProgress);
        setLessonByModuleID(mergedLessonsMap);

        const allLessonsFlat = lessonsArray.flat()
        const totalDuration = allLessonsFlat.reduce((sum, lesson) => {
          return sum + (lesson.duration || 0)
        }, 0)
        setModuleDuration(totalDuration)

        if (moduleData.length > 0) {
          const firstModuleID = moduleData[0].moduleID;
          setSelectedModuleID(firstModuleID);
          setLessons(mergedLessonsMap[firstModuleID] || []); // Use merged data for current lessons
          setExpandedModuleID(firstModuleID);

          // If there's a first lesson, try to pre-select it and fetch its progress
          if (mergedLessonsMap[firstModuleID] && mergedLessonsMap[firstModuleID].length > 0) {
            const firstLesson = mergedLessonsMap[firstModuleID][0];
            setSelectedLessonID(firstLesson.lessonID);
            setSelectedLesson(firstLesson); // Set the selected lesson content
            setCurrentLessonProgress({
              progressID: firstLesson.progressID,
              status: firstLesson.status,
              enrollment: { enrollmentID: enrollmentID }, // Mock minimal enrollment for currentLessonProgress
              lessonID: firstLesson.lessonID
            });
          }
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchInitialData();
  }, [courseID, enrollmentID, getAllProgressForEnrollment, getCourseDetails, getLessons, getModules]); // Added dependencies


  useEffect(() => {
    if (selectedModuleID && lessonByModuleID[selectedModuleID]) {
      setLessons(lessonByModuleID[selectedModuleID]);
    }
  }, [selectedModuleID, lessonByModuleID]);

  console.log('Course:', course);
  console.log('Modules:', modules);
  console.log('Lessons for selected module:', lessons);
  console.log('All Lessons by Module ID (with progress):', lessonByModuleID);
  console.log('Current Lesson Progress:', currentLessonProgress);

  const handleMarkAsRead = async () => {
    if (!currentLessonProgress || currentLessonProgress.status === "COMPLETED") {
      console.log("Lesson already completed or no progress to mark.");
      return;
    }

    const progressIDToUpdate = currentLessonProgress.progressID;

    // Optimistically update the UI
    setCurrentLessonProgress(prev => ({ ...prev, status: "COMPLETED" }));
    setLessonByModuleID(prevMap => {
      const newMap = { ...prevMap };
      if (selectedModuleID && newMap[selectedModuleID]) {
        newMap[selectedModuleID] = newMap[selectedModuleID].map(lesson =>
          lesson.lessonID === selectedLessonID ? { ...lesson, status: "COMPLETED" } : lesson
        );
      }
      return newMap;
    });

    try {
      await putCompletedLesson(null, {}, `http://localhost:8080/api/progress/${progressIDToUpdate}`);
      const updatedLessonByModuleID = { ...lessonByModuleID };
      if (selectedModuleID && updatedLessonByModuleID[selectedModuleID]) {
        updatedLessonByModuleID[selectedModuleID] = updatedLessonByModuleID[selectedModuleID].map(lesson =>
          lesson.lessonID === selectedLessonID ? { ...lesson, status: "COMPLETED" } : lesson
        );
      }
      // Cập nhật state lessonByModuleID ngay lập tức
      setLessonByModuleID(updatedLessonByModuleID);

      // Kiểm tra tất cả các lesson
      const allLessonsCompleted = Object.values(updatedLessonByModuleID).flat().every(lesson => lesson.status === "COMPLETED");

      if (allLessonsCompleted) {
        console.log("All lessons completed! Marking enrollment as COMPLETED.");
        if (enrollmentID) {
          await updateEnrollmentStatus(
            null, {}, `http://localhost:8080/api/enrollment/${enrollmentID}/COMPLETED`
          );
          console.log("Enrollment status updated to COMPLETED.");
          toast.success(t("toastMessages.allLessonsCompleted"))
        } else {
          console.warn("Enrollment ID not available to update enrollment status.");
        }
      }

    } catch (error) {
      console.error("Failed to complete lesson or update enrollment status: ", error);
      // Revert optimistic update if API call fails
      setCurrentLessonProgress(prev => ({ ...prev, status: "NOT_STARTED" }));
      setLessonByModuleID(prevMap => {
        const newMap = { ...prevMap };
        if (selectedModuleID && newMap[selectedModuleID]) {
          newMap[selectedModuleID] = newMap[selectedModuleID].map(lesson =>
            lesson.lessonID === selectedLessonID ? { ...lesson, status: "NOT_STARTED" } : lesson
          );
        }
        return newMap;
      });
    }
  };

  const handleModuleClick = (moduleID) => {
    setExpandedModuleID(prevID => prevID === moduleID ? null : moduleID);
    setSelectedModuleID(moduleID);
    // When a module is clicked, we ensure `lessons` state is updated from `lessonByModuleID`
    if (lessonByModuleID[moduleID]) {
      setLessons(lessonByModuleID[moduleID]);
    }
  };

  const handleLessonClick = async (lessonID) => {
    setSelectedLessonID(lessonID);
    const foundLesson = (lessonByModuleID[selectedModuleID] || []).find((l) => l.lessonID === lessonID);
    setSelectedLesson(foundLesson);
    setCurrentLessonProgress(null); // Clear previous lesson's progress

    if (!enrollmentID || !lessonID) {
      console.warn("Enrollment ID or Lesson ID is missing, cannot fetch progress.");
      return;
    }

    try {
      // Fetch the specific progress for this lesson and enrollment
      const progressResponse = await getProgress(`http://localhost:8080/api/progress?enrollmentID=${enrollmentID}&lessonID=${lessonID}`);

      if (progressResponse.data) {
        setCurrentLessonProgress(progressResponse);
      } else {
        const newProgress = await postProgress({ enrollmentID, lessonID }, {}, "http://localhost:8080/api/progress");
        setCurrentLessonProgress(newProgress);

        // Update the lessonByModuleID with the new progress status for this lesson
        setLessonByModuleID(prevMap => {
          const newMap = { ...prevMap };
          if (selectedModuleID && newMap[selectedModuleID]) {
            newMap[selectedModuleID] = newMap[selectedModuleID].map(lesson =>
              lesson.lessonID === lessonID ? { ...lesson, status: newProgress.status, progressID: newProgress.progressID } : lesson
            );
          }
          return newMap;
        });
      }

    } catch (error) {
      console.error("Failed to fetch or create progress:", error);
      setCurrentLessonProgress(null); // Clear progress on error
    }
  };

  const isCurrentLessonCompleted = currentLessonProgress?.status === "COMPLETED";

  // Check overall loading state
  const isLoadingData = loadingCourseDetails || loadingModules || loadingLessons || loadingAllProgress;
  const hasError = errorCourseDetails || errorModules || errorLessons || errorAllProgress;

  // Show loading spinner if any initial data is loading
  if (isLoadingData) {
    return (
      <Container className="py-5">
        <LoadingSpinner loading={isLoadingData} />
        <ErrorMessage error={hasError} />
      </Container>
    );
  }

  // Show NotFound if essential data is missing after loading
  if (hasError || !course || !modules || Object.keys(lessonByModuleID).length === 0) {
    return (
      <NotFound
        code={t("lessonNotFound.code")}
        title={t("lessonNotFound.title")}
        message={t("lessonNotFound.message")}
        backLink={`/courses`}
        backText={t("lessonNotFound.backText")}
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
              <BackButton label={t("backButton")} />
              {/* Course Info */}
              <div className="course-info">
                <div className="reading-time">
                  <div className="time-info">
                    <Clock size={20} className="time-icon" />
                    <span>{t("sidebar.minutes", { duration: moduleDuration })}</span>
                  </div>
                </div>

                <div className="learning-objective">
                  <span className="objective-label">{t("sidebar.courseLabel")} </span>
                  <span className="objective-text">{course?.courseName}</span>
                </div>
              </div>

              {/* Module Navigation */}
              <div className="module-navigation">
                {modules.map((module, index) => (
                  <div key={module.moduleID} className="module-section">
                    <button
                      className="module-header"
                      onClick={() => handleModuleClick(module.moduleID)}
                      aria-expanded={expandedModuleID === module.moduleID}
                    >
                      {expandedModuleID === module.moduleID ? (
                        <ChevronDown size={16} className="module-icon" />
                      ) : (
                        <ChevronRight size={16} className="module-icon" />
                      )}
                      <span className="module-title">
                        {t("lessonNavigation.moduleTitle", { index: index + 1, moduleName: module.moduleName })}
                      </span>
                    </button>

                    {expandedModuleID === module.moduleID && (
                      <div className="lessons-list">
                        {(lessonByModuleID[module.moduleID] || []).map((lessonItem) => (
                          <button
                            key={lessonItem.lessonID}
                            className={`lesson-item ${lessonItem.lessonID === selectedLessonID ? "active" : ""}`}
                            onClick={() => handleLessonClick(lessonItem.lessonID)}
                          >
                            {/* Use lessonItem.status directly for sidebar icons */}
                            {lessonItem.status === "COMPLETED" ? (
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
                  <div className="section-content">
                    <p className="content-paragraph"
                      dangerouslySetInnerHTML={{ __html: selectedLesson.content }}
                    />
                    <p>Resources: <a href={selectedLesson.resource} target="_blank" rel="noopener noreferrer">{selectedLesson.resource}</a></p>
                  </div>

                  {/* Mark as Read Button */}
                  <div className="mark-read-section">
                    <Button
                      className={`mark-read-btn ${isCurrentLessonCompleted ? "completed" : ""}`}
                      onClick={handleMarkAsRead}
                      disabled={isCurrentLessonCompleted || loadingCompletedLesson || loadingNewProgress || loadingProgress}
                    >
                      {(loadingCompletedLesson || loadingNewProgress || loadingProgress) ? (
                        t("mainContent.markAsReadButton.loading")
                      ) : isCurrentLessonCompleted ? (
                        t("mainContent.markAsReadButton.completed")
                      ) : (
                        t("mainContent.markAsReadButton.markAsRead")
                      )}
                    </Button>
                    {(errorNewProgress || errorCompletedLesson || errorProgress) &&
                      <ErrorMessage error={errorNewProgress || errorCompletedLesson || errorProgress} />}
                  </div>
                </div>
              ) : (
                <div className="text-muted text-center py-4">{t("mainContent.selectLessonPrompt")}</div>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default CourseLesson