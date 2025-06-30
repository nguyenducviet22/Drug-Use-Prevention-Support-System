import { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { Upload, Plus, Save, Edit3, X } from "lucide-react"; // Keep X if it's used for single-module unavailable
import "./CourseCreation.css";
import { useNavigate, useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { toast } from "react-toastify";
import BackButton from "../components/BackButton";

const CourseCreation = () => {
  // const [activeTab, setActiveTab] = useState("module");
  const { courseID: paramCourseID } = useParams();
  const [courseID, setCourseID] = useState(paramCourseID || "");
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);

  const [selectedModuleIds, setSelectedModuleIds] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);

  const { error: errorAgeGroup, loading: loadingAgeGroups, get: getAgeGroups } = useFetch();
  const { loading: loadingPostCourse, error: errorPostCourse, post: postNewCourse } = useFetch();
  const { loading: loadingPutCourse, error: errorPutCourse, put: putCourse } = useFetch();
  const { loading: loadingCourse, error: errorCourse, get: getCourse } = useFetch();
  const { loading: loadingModules, error: errorModules, get: getModules } = useFetch();
  const { loading: loadingPutModulesStatus, error: errorPutModulesStatus, put: putModulesStatus } = useFetch();

  const [formData, setFormData] = useState({
    courseName: "",
    description: "",
    ageGroup: "EVERYONE",
    image: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ageGroupsData = await getAgeGroups("http://localhost:8080/api/course/age-group");
        setAgeGroups(ageGroupsData);

        if (courseID) {
          const courseData = await getCourse(`http://localhost:8080/api/course/${courseID}`);
          setFormData(courseData);

          const moduleData = await getModules(`http://localhost:8080/api/course/${courseID}/modules`);
          setModules(moduleData);
        }
      } catch (err) {
        console.error("Fetch error in CourseCreation:", err);
        toast.error("Failed to fetch data in Course Creation", "danger");
      }
    };

    fetchData();
  }, [getAgeGroups, getCourse, getModules, courseID]);

  console.log("modules", modules);

  const handleCreateCourse = async () => {
    try {
      const courseData = {
        courseName: formData.courseName,
        description: formData.description,
        ageGroup: formData.ageGroup,
        image: formData.image
      };
      console.log("Course Data", courseData);

      const response = await postNewCourse(courseData, {}, "http://localhost:8080/api/course");
      const { courseID: newCourseId } = response;
      setCourseID(newCourseId);
      toast.success("Course created successfully! You can now add modules.", "success");
      console.log("Created course:", response);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to create course. Please try again.");
      }
    }
  };

  const handleSaveCourse = async () => {
    try {
      const courseData = {
        courseName: formData.courseName,
        description: formData.description,
        ageGroup: formData.ageGroup,
        image: formData.image
      };
      console.log("Course Data to save:", courseData);

      const response = await putCourse(courseData, {}, `http://localhost:8080/api/course/${courseID}`);
      toast.success("Course details saved successfully!", "success");
      console.log("Saved course:", response);
      navigate(`/courses/${courseID}`);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to save course. Please try again.");
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("Image uploaded:", file.name);
      // Add actual image upload logic here (e.g., to S3, convert to base64 for direct save)
    }
  };

  const handleAddModule = () => {
    if (courseID) {
      navigate(`/courses/${courseID}/module/create`);
    } else {
      toast.error("Please create or save the course first before adding modules.");
    }
  };

  const handleEditModule = (moduleID) => {
    navigate(`/courses/${courseID}/module/${moduleID}/update`);
  };

  // New: Function to handle toggling module selection
  const handleToggleModuleSelection = (moduleID) => {
    setSelectedModuleIds((prevSelected) =>
      prevSelected.includes(moduleID)
        ? prevSelected.filter((id) => id !== moduleID) // Deselect
        : [...prevSelected, moduleID] // Select
    );
  };

  // New: Function to mark selected modules as unavailable
  const handleMarkSelectedUnavailable = async () => {
    if (selectedModuleIds.length === 0) {
      toast.info("Please select at least one module to mark as unavailable.");
      return;
    }

    if (!window.confirm(`Are you sure you want to mark ${selectedModuleIds.length} module(s) as unavailable?`)) {
      return;
    }

    // Optimistically update UI
    const originalModules = [...modules];
    setModules((prevModules) =>
      prevModules.map((mod) =>
        selectedModuleIds.includes(mod.moduleID)
          ? { ...mod, status: "UNAVAILABLE" }
          : mod
      )
    );

    try {
      // The request body should be { moduleIds: [array of UUIDs] }
      const requestBody = { moduleIds: selectedModuleIds, status: "UNAVAILABLE" };
      const response = await putModulesStatus(requestBody, {}, `http://localhost:8080/api/module/${courseID}/unavailable`);
      toast.success("Selected modules marked unavailable successfully!");
      console.log("Modules set to unavailable:", response);
      setSelectedModuleIds([]); // Clear selection after successful update
    } catch (error) {
      console.error("Failed to update module status:", error);
      toast.error("Failed to set to unavailable selected modules. Reverting changes.");
      setModules(originalModules); // Revert UI on error
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An unexpected error occurred while updating module status.");
      }
    }
  };
  console.log("Current modules:", modules);
  console.log("Selected module IDs:", selectedModuleIds);

  return (
    <Container className="course-creation-container py-5">
      <Row className="justify-content-center">
        <Col lg={10} md={12}>
          <BackButton label="Back" />
          {/* Course Creation Header */}
          <div className="course-header">
            <Row className="w-100 d-flex justify-content-around align-items-center m-0">
              <Col md={6}>
                <div className="course-form-section">
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="text"
                      placeholder="Course Name"
                      value={formData.courseName}
                      onChange={(e) => handleInputChange("courseName", e.target.value)}
                      className="course-name-input"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Control
                      as="textarea"
                      rows={4}
                      placeholder="Description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      className="course-description-input"
                    />
                  </Form.Group>

                  <Form.Select
                    value={formData.ageGroup}
                    onChange={(e) => handleInputChange("ageGroup", e.target.value)}
                    className="mb-4 filter-select-new"
                  >
                    <option value="">Select Age Group</option>
                    {ageGroups.map((ageGroup) => (
                      <option key={ageGroup} value={ageGroup}>
                        {ageGroup}
                      </option>
                    ))}
                  </Form.Select>
                </div>
              </Col>

              <Col md={6}>
                <div className="image-upload-section">
                  <div className="image-upload-area">
                    <input
                      type="file"
                      id="imageUpload"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="image-upload-input"
                    />
                    <label htmlFor="imageUpload" className="image-upload-label">
                      <Upload size={24} className="upload-icon" />
                      <span className="upload-text">Click to upload image</span>
                    </label>
                  </div>
                </div>

                {/* Create - Save Course Button */}
                <div className="save-section mt-4">
                  {courseID?.trim() !== "" ? (
                    <Button className="create-button" onClick={handleSaveCourse}>
                      <Save size={16} className="me-2" />
                      Save Course Details
                    </Button>
                  ) : (
                    <Button className="create-button" onClick={handleCreateCourse}>
                      <Plus size={16} className="me-2" />
                      Create New Course
                    </Button>
                  )}
                </div>
              </Col>
            </Row>
          </div>

          {/* Tab Content for Modules */}
          <div className="tab-content-area">
            {/* {activeTab === "module" && ( */}
              <div className="module-section">
                <div className="add-module-section mb-4 d-flex justify-content-between align-items-center">
                  <Button className="add-module-btn" onClick={handleAddModule} disabled={!courseID}>
                    <Plus size={16} className="me-1" />
                    Add New Module
                  </Button>

                  <Button
                    className="btn btn-danger" // Using danger variant for 'unavailable' action
                    onClick={handleMarkSelectedUnavailable}
                    // Disable if no courseID, no modules selected, or API call is in progress
                    disabled={!courseID || selectedModuleIds.length === 0 || loadingPutModulesStatus}
                  >
                    Mark Selected Unavailable ({selectedModuleIds.length})
                  </Button>
                </div>

                <div className="modules-list">
                  {modules.length === 0 ? (
                    <p className="text-center text-muted">No modules added yet. Add a module to get started!</p>
                  ) : (
                    modules.map((module) => (
                      <Card
                        key={module.moduleID}
                        className={`module-card mb-3 d-flex flex-row align-items-center ${module.status === 'UNAVAILABLE' ? 'module-unavailable' : ''}`}
                      >
                        <Card.Body className="d-flex flex-grow-1 align-items-center">
                          {/* Checkbox for selection */}
                          <Form.Check
                            type="checkbox"
                            className="me-3"
                            checked={selectedModuleIds.includes(module.moduleID)}
                            onChange={() => handleToggleModuleSelection(module.moduleID)}
                            disabled={module.status === 'UNAVAILABLE'} // Disable checkbox if already unavailable
                          />
                          <div className="module-content flex-grow-1">
                            <h5 className="module-title mb-0">
                              {module.moduleName}
                              {module.status === 'UNAVAILABLE' && (
                                <span className="badge bg-warning text-dark ms-2">Unavailable</span>
                              )}
                            </h5>
                          </div>
                          <div className="module-actions ms-auto">
                            <Button
                              variant="link"
                              className="edit-module-btn"
                              onClick={() => handleEditModule(module.moduleID)}
                              disabled={module.status === 'UNAVAILABLE'} // Disable edit if unavailable
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
            {/* )} */}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default CourseCreation;
