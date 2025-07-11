import { useEffect, useState, useRef } from "react";
import { Container, Row, Col, Form, Button, Card, Alert } from "react-bootstrap";
import { Upload, Plus, Save, Edit3, X, ImageIcon } from "lucide-react"; // Import ImageIcon
import "./CourseCreation.css";
import { useNavigate, useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import useUpload from "../../hooks/useUpload";
import { toast } from "react-toastify";
import BackButton from "../../components/BackButton";
import { useTranslation } from "react-i18next";

const CourseCreation = () => {
  const { t } = useTranslation("courseCreation");

  const { courseID: paramCourseID } = useParams();
  const [courseID, setCourseID] = useState(paramCourseID || "");
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);

  const [selectedModuleIds, setSelectedModuleIds] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);
  const fileInputRef = useRef(null);

  const {
    imageUrl: uploadedImageUrl,
    uploading: isUploadingImage,
    uploadError: imageUploadError,
    uploadImage,
    setImageUrl: setUploadedImageUrl,
  } = useUpload();

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

  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ageGroupsData = await getAgeGroups("http://localhost:8080/api/course/age-group");
        setAgeGroups(ageGroupsData);

        if (courseID) {
          const courseData = await getCourse(`http://localhost:8080/api/course/${courseID}`);
          setFormData(courseData);
          if (courseData.image) {
            setImagePreview(courseData.image);
            setUploadedImageUrl(courseData.image);
          }
        }
      } catch (err) {
        console.error("Fetch error in CourseCreation:", err);
        toast.error(t("modulesSection.toastMessages.fetchError"), "danger");
      }
    };

    fetchData();
  }, [getAgeGroups, getCourse, getModules, courseID, t, setUploadedImageUrl]);

  console.log("modules", modules);
  console.log("uploadedImageUrl", uploadedImageUrl);

  const validateCourseForm = () => {
    if (!formData.courseName.trim()) {
      toast.error(t("courseDetails.validation.courseNameRequired"));
      return false;
    }
    if (!formData.description.trim()) {
      toast.error(t("courseDetails.validation.descriptionRequired"));
      return false;
    }
    if (!formData.ageGroup) {
      toast.error(t("courseDetails.validation.ageGroupRequired"));
      return false;
    }
    if (!courseID && !uploadedImageUrl) {
      toast.error(t("courseDetails.validation.imageRequired"));
      return false;
    }
    return true;
  };

  const handleCreateCourse = async () => {
    if (!validateCourseForm()) return;
    if (isUploadingImage) {
      toast.info(t("courseDetails.toastMessages.imageUploading"));
      return;
    }
    if (!uploadedImageUrl) {
      toast.error(t("courseDetails.validation.imageRequired"));
      return;
    }

    try {
      const courseData = {
        courseName: formData.courseName,
        description: formData.description,
        ageGroup: formData.ageGroup,
        image: uploadedImageUrl,
      };
      console.log("Course Data", courseData);

      const response = await postNewCourse(courseData, {}, "http://localhost:8080/api/course");
      const { courseID: newCourseId } = response;
      setCourseID(newCourseId);
      toast.success(t("modulesSection.toastMessages.createSuccess"), "success");
      console.log("Created course:", response);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(t("modulesSection.toastMessages.createError"));
      }
    }
  };

  const handleSaveCourse = async () => {
    if (!validateCourseForm()) return;
    if (isUploadingImage) {
      toast.info(t("courseDetails.toastMessages.imageUploading"));
      return;
    }
    if (!uploadedImageUrl) {
      toast.error(t("courseDetails.validation.imageRequired"));
      return;
    }

    try {
      const courseData = {
        courseName: formData.courseName,
        description: formData.description,
        ageGroup: formData.ageGroup,
        image: uploadedImageUrl,
      };
      console.log("Course Data to save:", courseData);

      const response = await putCourse(courseData, {}, `http://localhost:8080/api/course/${courseID}`);
      toast.success(t("modulesSection.toastMessages.saveSuccess"), "success");
      console.log("Saved course:", response);
      navigate(`/courses/${courseID}`);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(t("modulesSection.toastMessages.saveError"));
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      uploadImage(file);
    }
  };

  const handleAddModule = () => {
    if (courseID) {
      navigate(`/courses/${courseID}/module/create`);
    } else {
      toast.error(t("modulesSection.toastMessages.noCourseIdForModule"));
    }
  };

  const handleEditModule = (moduleID) => {
    navigate(`/courses/${courseID}/module/${moduleID}/update`);
  };

  const handleToggleModuleSelection = (moduleID) => {
    setSelectedModuleIds((prevSelected) =>
      prevSelected.includes(moduleID)
        ? prevSelected.filter((id) => id !== moduleID)
        : [...prevSelected, moduleID]
    );
  };

  const handleMarkSelectedUnavailable = async () => {
    if (selectedModuleIds.length === 0) {
      toast.info(t("modulesSection.toastMessages.selectModulesInfo"));
      return;
    }

    toast.info(t("modulesSection.toastMessages.confirmUnavailable", { count: selectedModuleIds.length }), {
      autoClose: false,
      closeButton: (
        <div className="d-flex gap-2">
          <Button variant="danger" size="sm" onClick={async () => {
            const originalModules = [...modules];
            setModules((prevModules) =>
              prevModules.map((mod) =>
                selectedModuleIds.includes(mod.moduleID)
                  ? { ...mod, status: "UNAVAILABLE" }
                  : mod
              )
            );
            toast.dismiss();

            try {
              const requestBody = { moduleIds: selectedModuleIds, status: "UNAVAILABLE" };
              const response = await putModulesStatus(`http://localhost:8080/api/module/${courseID}/unavailable`, requestBody, {});
              toast.success(t("modulesSection.toastMessages.updateModulesStatusSuccess"));
              console.log("Modules set to unavailable:", response);
              setSelectedModuleIds([]);
            } catch (error) {
              console.error("Failed to update module status:", error);
              toast.error(t("modulesSection.toastMessages.updateModulesStatusError"));
              setModules(originalModules);
              if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message);
              } else {
                toast.error(t("modulesSection.toastMessages.unexpectedError"));
              }
            }
          }}>
            {t("modulesSection.confirmButton")}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => toast.dismiss()}>
            {t("modulesSection.cancelButton")}
          </Button>
        </div>
      ),
    });
  };

  console.log("Current modules:", modules);
  console.log("Selected module IDs:", selectedModuleIds);

  return (
    <Container className="course-creation-container py-5">
      <Row className="justify-content-center">
        <Col lg={10} md={12}>
          <BackButton label={t("backButton")} />
          {/* Course Creation Header */}
          <div className="course-header">
            <Row className="w-100 d-flex justify-content-around align-items-center m-0">
              <Col md={6}>
                <div className="course-form-section">
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="text"
                      placeholder={t("courseDetails.courseNamePlaceholder")}
                      value={formData.courseName}
                      onChange={(e) => handleInputChange("courseName", e.target.value)}
                      className="course-name-input"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Control
                      as="textarea"
                      rows={4}
                      placeholder={t("courseDetails.descriptionPlaceholder")}
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
                    <option value="">{t("courseDetails.ageGroupSelect")}</option>
                    {ageGroups.map((ageGroup) => (
                      <option key={ageGroup} value={ageGroup}>
                        {ageGroup}
                      </option>
                    ))}
                  </Form.Select>
                </div>
              </Col>

              <Col md={6}>
                {/* START: Updated Image Upload Section */}
                <div className="form-section-new mb-4">
                  <div
                    className="image-upload-area-new"
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        fileInputRef.current?.click();
                      }
                    }}
                  >
                    {(imagePreview || uploadedImageUrl) ? (
                      <div className="image-preview-new">
                        <img
                          src={imagePreview || uploadedImageUrl || "/placeholder.svg"}
                          alt={t("form.imageUpload.altText")}
                          className="preview-image-new"
                        />
                        <div className="image-overlay-new">
                          <Upload size={24} />
                          <span>{t("form.imageUpload.clickToChange")}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="upload-placeholder-new">
                        <ImageIcon size={48} className="upload-icon-new" />
                        <span className="upload-text-new">{t("form.imageUpload.clickToUpload")}</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="d-none"
                  />
                  {isUploadingImage && <Alert variant="info" className="mt-2">{t("form.imageUpload.uploading")}</Alert>}
                  {imageUploadError && <Alert variant="danger" className="mt-2">{t("form.imageUpload.error", { error: imageUploadError })}</Alert>}
                </div>
                {/* END: Updated Image Upload Section */}

                {/* Create - Save Course Button */}
                <div className="save-section mt-4">
                  {courseID?.trim() !== "" ? (
                    <Button
                      className="create-button"
                      onClick={handleSaveCourse}
                      disabled={isUploadingImage || loadingPutCourse}
                    >
                      <Save size={16} className="me-2" />
                      {t("courseDetails.saveButton")}
                    </Button>
                  ) : (
                    <Button
                      className="create-button"
                      onClick={handleCreateCourse}
                      disabled={isUploadingImage || loadingPostCourse}
                    >
                      <Plus size={16} className="me-2" />
                      {t("courseDetails.createButton")}
                    </Button>
                  )}
                </div>
              </Col>
            </Row>
          </div>

          {/* Tab Content for Modules */}
          <div className="tab-content-area">
            <div className="module-section">
              <div className="add-module-section mb-4 d-flex justify-content-between align-items-center">
                <Button className="add-module-btn" onClick={handleAddModule} disabled={!courseID}>
                  <Plus size={16} className="me-1" />
                  {t("modulesSection.addModuleButton")}
                </Button>

                <Button
                  className="btn btn-danger"
                  onClick={handleMarkSelectedUnavailable}
                  disabled={!courseID || selectedModuleIds.length === 0 || loadingPutModulesStatus}
                >
                  {t("modulesSection.markUnavailableButton")} ({selectedModuleIds.length})
                </Button>
              </div>

              <div className="modules-list">
                {modules.length === 0 ? (
                  <p className="text-center text-muted">{t("modulesSection.noModules")}</p>
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
                          disabled={module.status === 'UNAVAILABLE'}
                        />
                        <div className="module-content flex-grow-1">
                          <h5 className="module-title mb-0">
                            {module.moduleName}
                            {module.status === 'UNAVAILABLE' && (
                              <span className="badge bg-warning text-dark ms-2">{t("modulesSection.unavailableBadge")}</span>
                            )}
                          </h5>
                        </div>
                        <div className="module-actions ms-auto">
                          <Button
                            variant="link"
                            className="edit-module-btn"
                            onClick={() => handleEditModule(module.moduleID)}
                            disabled={module.status === 'UNAVAILABLE'}
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
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default CourseCreation;
