import { useState, useRef, useEffect } from "react"
import { Container, Form, Button, Row, Col, Alert } from "react-bootstrap"
import { Save, Eye, Upload, ImageIcon } from "lucide-react"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"
import "./BlogCreation.css"
import useFetch from "../../hooks/useFetch"
import { useAuth } from "../../hooks/useAuth"
import { toast } from "react-toastify"
import { useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next" // Import useTranslation

const BlogCreation = () => {
  const { t } = useTranslation('blogCreation') // Khai báo useTranslation với namespace 'blogCreation'

  const { user } = useAuth()
  const username = user?.username
  const { id: blogID } = useParams()
  const navigate = useNavigate()
  const [imagePreview, setImagePreview] = useState(null)
  const [showAlert, setShowAlert] = useState({ show: false, message: "", blogType: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef(null)
  const [types, setTypes] = useState([])
  const [ageGroups, setAgeGroups] = useState([])

  const { error: errorBlogTypes, loading: loadingBlogTypes, get: getBlogTypes } = useFetch();
  const { error: errorAgeGroup, loading: loadingAgeGroups, get: getAgeGroups } = useFetch();
  const { error: errorNewBlog, loading: loadingNewBlog, post: postNewBlog } = useFetch();
  const { error: errorExistingBlog, loading: loadingExistingBlog, put: putExistingBlog } = useFetch();
  const { loading: loadingDraft, error: errorDraft, get: getDraft } = useFetch();

  const [formData, setFormData] = useState({
    blogName: "",
    blogType: "",
    author: username,
    ageGroup: "",
    description: "",
    content: "",
    image: null,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const typesData = await getBlogTypes("http://localhost:8080/api/blog/type");
        setTypes(typesData);

        const ageGroupsData = await getAgeGroups("http://localhost:8080/api/course/age-group");
        setAgeGroups(ageGroupsData);

        if (blogID) {
          const blogData = await getDraft(`http://localhost:8080/api/blog/${blogID}`);
          setFormData(blogData);
        }
      } catch (err) {
        console.error("Fetch error in BlogCreation:", err);
        // Có thể set lỗi vào state để hiển thị ErrorMessage
      }
    };

    fetchData();
  }, [getBlogTypes, getAgeGroups, blogID, getDraft]);

  console.log('formData', formData);

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

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error(t("form.alert.imageSizeError"), "danger") 
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
        setFormData((prev) => ({
          ...prev,
          image: file,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const showAlertMessage = (message, blogType) => {
    setShowAlert({ show: true, message, blogType })
    setTimeout(() => {
      setShowAlert({ show: false, message: "", blogType: "" })
    }, 5000)
  }

  const validateForm = () => {
    if (!formData.blogName.trim()) {
      toast.error(t("form.alert.validation.blogNameRequired"), "danger") 
      return false
    }
    if (!formData.blogType) {
      toast.error(t("form.alert.validation.blogTypeRequired"), "danger") 
      return false
    }
    if (!formData.description.trim()) {
      toast.error(t("form.alert.validation.descriptionRequired"), "danger") 
      return false
    }
    if (!formData.content.trim() || formData.content === "<p><br></p>") {
      toast.error(t("form.alert.validation.contentRequired"), "danger") 
      return false
    }
    return true
  }

  const handleSave = async () => {
    if (!username) {
      toast.error(t("form.alert.loginRequired")); 
      navigate('/login');
      return;
    }
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const blogData = {
        blogName: formData.blogName,
        blogType: formData.blogType,
        image: formData.image,
        ageGroup: formData.ageGroup,
        description: formData.description,
        content: formData.content,
        blogStatus: "DRAFT",
      };
      console.log(blogData);

      if (blogID) {
        await putExistingBlog(blogData, {}, `http://localhost:8080/api/blog/${blogID}`)
      } else {
        await postNewBlog(blogData, {}, "http://localhost:8080/api/blog")
      }
      toast.success(t("form.alert.success"), "success") 
      console.log("Saving blog:", formData)
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(t("form.alert.validation.failedToCreate")); 
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePreview = () => {
    if (!validateForm()) return
    // Open preview in new window or modal
    console.log("Preview blog:", formData)
    showAlertMessage(t("form.alert.previewMessage"), "info") 
  }

  const handlePublish = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const blogData = {
        blogName: formData.blogName,
        blogType: formData.blogType,
        image: formData.image,
        ageGroup: formData.ageGroup,
        description: formData.description,
        content: formData.content,
        blogStatus: "PUBLISHED",
      };
      console.log(blogData);

      if (blogID) {
        await putExistingBlog(blogData, {}, `http://localhost:8080/api/blog/${blogID}`)
      } else {
        await postNewBlog(blogData, {}, "http://localhost:8080/api/blog")
      }
      toast.success(t("form.alert.publishSuccess"), "success") 
      console.log("Publishing blog:", formData)
      // Reset form after successful publish
      setTimeout(() => {
        setFormData({
          blogName: "",
          blogType: "",
          author: username,
          ageGroup: "",
          description: "",
          content: "",
          image: null,
        })
        setImagePreview(null)
      }, 2000)
    } catch (error) {
      toast.error(t("form.alert.publishError"), "danger") 
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="blog-creation-page-new">
      {/* Header Section */}
      <div className="creation-header">
        <Container>
          <div className="text-center text-white py-5">
            <h1 className="display-4 fw-bold mb-3">{t("header.title")}</h1>
            <p className="lead">{t("header.subtitle")}</p>
          </div>
        </Container>
      </div>

      {/* Form Section */}
      <Container className="py-5">
        <div className="creation-form-container">
          {showAlert.show && (
            <Alert variant={showAlert.blogType} className="mb-4">
              {showAlert.message}
            </Alert>
          )}

          <Form>
            <Row>
              <Col lg={8} className="mx-auto">
                {/* Blog Name */}
                <div className="form-section-new mb-4">
                  <Form.Control
                    type="text"
                    placeholder={t("form.blogNamePlaceholder")}
                    value={formData.blogName}
                    onChange={(e) => handleInputChange("blogName", e.target.value)}
                    className="blog-name-input"
                  />
                </div>

                {/* Type and AgeGroup */}
                <Row className="mb-4">
                  <Col md={4}>
                    <Form.Select
                      value={formData.blogType}
                      onChange={(e) => handleInputChange("blogType", e.target.value)}
                      className="filter-select-new"
                    >
                      <option value="">{t("form.selectTopic")}</option>
                      {types.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={4}>
                    <Form.Select
                      value={formData.ageGroup}
                      onChange={(e) => handleInputChange("ageGroup", e.target.value)}
                      className="filter-select-new"
                    >
                      <option value="">{t("form.selectAgeGroup")}</option>
                      {ageGroups.map((ageGroup) => (
                        <option key={ageGroup} value={ageGroup}>
                          {ageGroup}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={4} className="d-flex align-items-center">
                    <span className="author-text">{t("form.byAuthor", { author: formData.author })}</span>
                  </Col>
                </Row>

                {/* Image Upload */}
                <div className="form-section-new mb-4">
                  <div
                    className="image-upload-area-new"
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        fileInputRef.current?.click()
                      }
                    }}
                  >
                    {imagePreview ? (
                      <div className="image-preview-new">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Blog preview"
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
                    onChange={handleImageUpload}
                    className="d-none"
                  />
                </div>

                {/* Description */}
                <div className="form-section-new mb-4">
                  <Form.Label className="section-title-new">{t("form.descriptionLabel")}</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder={t("form.descriptionPlaceholder")}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="form-textarea-new"
                  />
                </div>

                {/* Blog Content */}
                <div className="form-section-new mb-5">
                  <Form.Label className="section-title-new">{t("form.blogContentLabel")}</Form.Label>
                  <div className="quill-container-new">
                    <ReactQuill
                      theme="snow"
                      value={formData.content}
                      onChange={(content) => handleInputChange("content", content)}
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder={t("form.blogContentPlaceholder")}
                      className="article-editor-new"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="action-buttons-new text-center">
                  <Button
                    variant="secondary"
                    className="action-btn-new save-btn-new me-3"
                    onClick={handleSave}
                    disabled={isSubmitting}
                  >
                    <Save size={18} className="me-2" />
                    {t("form.buttons.save")}
                  </Button>
                  <Button
                    variant="info"
                    className="action-btn-new view-btn-new me-3"
                    onClick={handlePreview}
                    disabled={isSubmitting}
                  >
                    <Eye size={18} className="me-2" />
                    {t("form.buttons.view")}
                  </Button>
                  <Button
                    variant="primary"
                    className="action-btn-new publish-btn-new"
                    onClick={handlePublish}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                        {t("form.buttons.publishing")}
                      </>
                    ) : (
                      <>
                        <Upload size={18} className="me-2" />
                        {t("form.buttons.publish")}
                      </>
                    )}
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </div>
      </Container>
    </div>
  )
}

export default BlogCreation