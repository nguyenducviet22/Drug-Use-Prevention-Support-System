import { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { Plus, X, Edit3, Save } from "lucide-react";
import "./ModuleCreation.css";
import useFetch from "../hooks/useFetch";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import BackButton from "../components/BackButton";

const ModuleCreation = () => {
  // Recieve from CourseCreation
  const { courseID } = useParams();
  // Recieve from LessonCreation (or when navigating to edit module)
  const { moduleID: paramModuleID } = useParams();
  const [moduleID, setModuleID] = useState(paramModuleID || "");
  const [lessons, setLessons] = useState([]);
  const [course, setCourse] = useState({});
  const navigate = useNavigate();

  // State for selected lessons
  const [selectedLessonIds, setSelectedLessonIds] = useState([]);

  // useFetch hooks for various API calls
  const { loading: loadingPostModule, error: errorPostModule, post: postNewModule } = useFetch();
  const { loading: loadingPutModule, error: errorPutModule, put: putModule } = useFetch();
  const { loading: loadingLessons, error: errorLessons, get: getLessons } = useFetch();
  const { loading: loadingModule, error: errorModule, get: getModule } = useFetch();
  const { loading: loadingCourse, error: errorCourse, get: getCourse } = useFetch();
  // New: useFetch for bulk lesson status update
  const { loading: loadingPutLessonsStatus, error: errorPutLessonsStatus, put: putLessonsStatus } = useFetch();
  // New: useFetch for single lesson status update/delete (for the X button)
  const { loading: loadingUpdateLessonStatus, error: errorUpdateLessonStatus, put: putLessonStatus } = useFetch();


  const [formData, setFormData] = useState({
    moduleName: "",
  });

  // Fetch initial data (course details, module details if editing, and lessons)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch course details regardless of moduleID presence
        const courseData = await getCourse(`http://localhost:8080/api/course/${courseID}`);
        setCourse(courseData);

        // If moduleID exists (meaning we are in edit mode for a module)
        if (moduleID) {
          const lessonsData = await getLessons(`http://localhost:8080/api/module/${moduleID}/lessons`);
          setLessons(lessonsData);

          const moduleData = await getModule(`http://localhost:8080/api/module/${moduleID}`);
          setFormData(moduleData);
        }
      } catch (error) {
        console.error("Fetch error in Module Creation:", error);
        toast.error("Failed to load module data. Please try again.", "danger");
      }
    };

    fetchData();
  }, [getLessons, getModule, getCourse, moduleID, courseID]);
  console.log("lessons", lessons);
  console.log("Selected lesson IDs:", selectedLessonIds);

  const handleAddLesson = () => {
    // Only allow adding lesson if module has been created/saved
    if (moduleID) {
      navigate(`/courses/${courseID}/module/${moduleID}/lesson/create`);
    } else {
      toast.error("Please create or save the module first before adding lessons.");
    }
  };

  const handleEditLesson = (lessonID) => {
    navigate(`/courses/${courseID}/module/${moduleID}/lesson/${lessonID}/update`);
  };

  // New function to handle checkbox changes for lessons
  const handleToggleLessonSelection = (lessonID) => {
    setSelectedLessonIds((prevSelected) =>
      prevSelected.includes(lessonID)
        ? prevSelected.filter((id) => id !== lessonID) // Deselect
        : [...prevSelected, lessonID] // Select
    );
  };

  // New function to mark selected lessons as unavailable
  const handleMarkSelectedUnavailableLessons = async () => {
    if (selectedLessonIds.length === 0) {
      toast.info("Please select at least one lesson to mark as unavailable.");
      return;
    }

    if (!window.confirm(`Are you sure you want to mark ${selectedLessonIds.length} lesson(s) as unavailable?`)) {
      return;
    }

    // Optimistically update UI
    const originalLessons = [...lessons];
    setLessons((prevLessons) =>
      prevLessons.map((lesson) =>
        selectedLessonIds.includes(lesson.lessonID)
          ? { ...lesson, status: "UNAVAILABLE" }
          : lesson
      )
    );

    try {
      const requestBody = {
        lessonIds: selectedLessonIds,
        status: "UNAVAILABLE"
      };
      // Assuming a PUT endpoint like /api/lesson/{moduleID}/unavailable
      const response = await putLessonsStatus(requestBody, {}, `http://localhost:8080/api/lesson/${moduleID}/unavailable`);
      toast.success("Selected lessons marked unavailable successfully!");
      console.log("Lessons set to unavailable:", response);
      setSelectedLessonIds([]); // Clear selection after successful update
    } catch (error) {
      console.error("Failed to update lesson status:", error);
      toast.error("Failed to mark selected lessons unavailable. Reverting changes.");
      setLessons(originalLessons); // Revert UI on error
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An unexpected error occurred while updating lesson status.");
      }
    }
  };

  const handleCreateModule = async () => {
    try {
      const moduleData = {
        moduleName: formData.moduleName,
        courseID
      };
      console.log("Module Data for creation:", moduleData);

      const response = await postNewModule(moduleData, {}, "http://localhost:8080/api/module");
      const { moduleID: newModuleID } = response;
      setModuleID(newModuleID);
      toast.success("Module created successfully!", "success");
      console.log("Created module:", response);
      navigate(`/courses/${courseID}/module/${newModuleID}/update`, { replace: true });
    } catch (error) {
      console.error("Failed to create module:", error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to create module. Please try again.");
      }
    }
  };

  const handleSaveModule = async () => {
    try {
      const moduleData = {
        moduleName: formData.moduleName,
        courseID // Include courseID in update payload if required by backend
      };
      console.log("Module Data for saving:", moduleData);

      const response = await putModule(moduleData, {}, `http://localhost:8080/api/module/${moduleID}`);
      toast.success("Module saved successfully!", "success");
      console.log("Saved module:", response);
      navigate(`/courses/${courseID}/update`); // Navigate back to CourseCreation page
    } catch (error) {
      console.error("Failed to save module:", error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to save module. Please try again.");
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Container className="module-creation-container">
      <Row className="justify-content-center">
        <Col lg={10} md={12}>
          <BackButton label="Back" />
          {/* Course Header - Displays the name of the parent course */}
          <div className="course-header-section mb-4">
            <h1 className="course-title">{course.courseName || 'Loading Course...'}</h1>
          </div>

          {/* Module Creation Form */}
          <div className="module-form-content">
            {/* Module Name Input */}
            <Form.Group className="mb-4">
              <Form.Control
                type="text"
                id="moduleNameInput"
                placeholder="Enter Module Name"
                value={formData.moduleName}
                onChange={(e) => handleInputChange("moduleName", e.target.value)}
                className="module-name-input"
              />
            </Form.Group>

            {/* Create - Save Module Button */}
            <div className="save-section mt-4 mb-4 d-flex justify-content-end">
              {moduleID?.trim() !== "" ? (
                <Button className="save-module-btn" onClick={handleSaveModule} disabled={loadingPutModule}>
                  <Save size={16} className="me-2" />
                  Save Module
                </Button>
              ) : (
                <Button className="create-module-btn" onClick={handleCreateModule} disabled={loadingPostModule}>
                  <Plus size={16} className="me-2" />
                  Create Module
                </Button>
              )}
            </div>

            {/* Lessons Section Header with Add Lesson and Mark Unavailable Buttons */}
            <div className="lessons-list-header d-flex justify-content-between align-items-center mb-3">
              <Button className="add-lesson-btn me-2" onClick={handleAddLesson} disabled={!moduleID}>
                <Plus size={16} className="me-1" />
                Add Lesson
              </Button>

              <Button
                className="btn btn-danger"
                onClick={handleMarkSelectedUnavailableLessons}
                disabled={!moduleID || selectedLessonIds.length === 0 || loadingPutLessonsStatus}
              >
                Mark Selected Unavailable ({selectedLessonIds.length})
              </Button>
            </div>

            {/* Lessons List */}
            <div className="lessons-list">
              {lessons.length === 0 ? (
                <p className="text-center text-muted">No lessons added yet. Add a lesson to get started!</p>
              ) : (
                lessons.map((lesson) => (
                  <Card
                    key={lesson.lessonID}
                    className={`lesson-card mb-2 d-flex flex-row align-items-center ${lesson.status === 'UNAVAILABLE' ? 'lesson-unavailable' : ''}`}
                  >
                    <Card.Body className="d-flex flex-grow-1 align-items-center">
                      {/* Checkbox for selection */}
                      <Form.Check
                        type="checkbox"
                        className="me-3"
                        checked={selectedLessonIds.includes(lesson.lessonID)}
                        onChange={() => handleToggleLessonSelection(lesson.lessonID)}
                        disabled={lesson.status === 'UNAVAILABLE'} // Disable checkbox if already unavailable
                      />
                      <div className="lesson-content flex-grow-1">
                        <h5 className="lesson-title mb-0">
                          {lesson.lessonName}
                          {lesson.status === 'UNAVAILABLE' && (
                            <span className="badge bg-warning text-dark ms-2">Unavailable</span>
                          )}
                        </h5>
                      </div>
                      <div className="lesson-actions ms-auto">
                        <Button
                          variant="link"
                          className="edit-lesson-btn me-2"
                          onClick={() => handleEditLesson(lesson.lessonID)}
                          disabled={lesson.status === 'UNAVAILABLE'} // Disable edit if unavailable
                        >
                          <Edit3 size={16} />
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                ))
              )}
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ModuleCreation;
