import { useEffect, useState } from "react"
import { Container, Row, Col, Form, Button } from "react-bootstrap"
import { Plus, Save } from "lucide-react"
import "./LessonCreation.css"
import ReactQuill from "react-quill"
import useFetch from "../../hooks/useFetch"
import { toast } from "react-toastify"
import { useNavigate, useParams } from "react-router-dom"
import BackButton from "../../components/BackButton"
import { useTranslation } from "react-i18next"; // Import useTranslation

const LessonCreation = () => {
  const { t } = useTranslation("lessonCreation"); // Khai báo useTranslation

  const { courseID } = useParams()
  const { moduleID } = useParams()
  console.log("moduleID", moduleID);
  const { lessonID: paramLessonID } = useParams()
  const [lessonID, setLessonID] = useState(paramLessonID || "")
  const navigate = useNavigate()
  const [module, setModule] = useState({})
  const { loading: loadingPostLesson, error: errorPostLesson, post: postNewLesson } = useFetch()
  const { loading: loadingPutLesson, error: errorPutLesson, put: putLesson } = useFetch()
  const { loading: loadingLesson, error: errorLesson, get: getLesson } = useFetch()
  const { loading: loadingModule, error: errorModule, get: getModule } = useFetch()

  const [formData, setFormData] = useState({
    lessonName: "",
    objective: "",
    resource: "",
    content: ""
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (moduleID) {
          const moduleData = await getModule(`http://localhost:8080/api/module/${moduleID}`);
          setModule(moduleData);
        }

        if (lessonID) {
          const lessonData = await getLesson(`http://localhost:8080/api/lesson/${lessonID}`)
          setFormData(lessonData)
        }
      } catch (error) {
        console.error("Fetch error in Lesson Creation:", error);
        toast.error(t("toastMessages.fetchError"), "danger")
      }
    }

    fetchData()
  }, [getModule, getLesson, lessonID, moduleID, t]) // Thêm t vào dependency array

  console.log("module", module);

  // React Quill modules configuration
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "code-block"],
      ["link", "image"],
      ["clean"],
    ],
  }

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "list",
    "bullet",
    "blockquote",
    "code-block",
    "link",
    "image",
  ]

  const handleCreateLesson = async () => {
    try {
      const lessonData = {
        lessonName: formData.lessonName,
        objective: formData.objective,
        resource: formData.resource,
        content: formData.content,
        moduleID
      }
      console.log(lessonData);

      const response = await postNewLesson(lessonData, {}, "http://localhost:8080/api/lesson")
      toast.success(t("toastMessages.createSuccess"), "success")
      console.log("Created lesson:", response)
      navigate(`/courses/${courseID}/module/${moduleID}/update`)
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        console.log(error);
        toast.error(t("toastMessages.createError"));
      }
    }
  }

  const handleSaveLesson = async () => {
    try {
      const lessonData = {
        lessonName: formData.lessonName,
        objective: formData.objective,
        resource: formData.resource,
        content: formData.content,
        moduleID
      }
      console.log(lessonData);

      const response = await putLesson(lessonData, {}, `http://localhost:8080/api/lesson/${lessonID}`)
      toast.success(t("toastMessages.saveSuccess"), "success")
      console.log("Saved lesson:", response)
      navigate(`/courses/${courseID}/module/${moduleID}/update`)
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        console.log(error);
        toast.error(t("toastMessages.saveError"));
      }
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Container className="lesson-creation-container">
      <Row className="justify-content-center">
        <Col lg={10} md={12}>
          <BackButton label={t("backButton")} />
          {/* Module Header */}
          <div className="module-header-section">
            <h1 className="module-title">{t("moduleHeader", { moduleName: module.moduleName })}</h1>
          </div>

          {/* Lesson Creation Form */}
          <div className="lesson-form-content">
            {/* Lesson Name Input */}
            <Form.Group className="mb-4">
              <Form.Control
                type="text"
                placeholder={t("form.lessonNamePlaceholder")}
                value={formData.lessonName}
                onChange={(e) => handleInputChange("lessonName", e.target.value)}
                className="lesson-name-input"
              />
            </Form.Group>

            {/* Objective Text Area */}
            <Form.Group className="mb-4">
              <Form.Control
                as="textarea"
                rows={4}
                placeholder={t("form.objectivePlaceholder")}
                value={formData.objective}
                onChange={(e) => handleInputChange("objective", e.target.value)}
                className="objective-input"
              />
            </Form.Group>

            {/* Resource Text Area */}
            <Form.Group className="mb-4">
              <Form.Control
                as="textarea"
                rows={4}
                placeholder={t("form.resourcePlaceholder")}
                value={formData.resource}
                onChange={(e) => handleInputChange("resource", e.target.value)}
                className="objective-input"
              />
            </Form.Group>

            {/* Lesson Content Section */}
            <div className="lesson-content-section">
              <div className="mb-4">
                <Form.Label className="section-title-new">{t("form.contentLabel")}</Form.Label>
                <div className="quill-container-new">
                  <ReactQuill
                    theme="snow"
                    value={formData.content}
                    onChange={(content) => handleInputChange("content", content)}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder={t("form.contentPlaceholder")}
                    className="article-editor-new"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="save-section">
              {lessonID?.trim() !== "" ? (
                <Button className="save-lesson-btn" onClick={handleSaveLesson}>
                  <Save size={16} className="me-2" />
                  {t("form.saveButton")}
                </Button>
              ) : (
                <Button className="save-lesson-btn" onClick={handleCreateLesson}>
                  <Plus size={16} className="me-2" />
                  {t("form.createButton")}
                </Button>
              )}
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default LessonCreation