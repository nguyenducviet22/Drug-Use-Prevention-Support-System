import { useState, useRef, useEffect } from "react"
import { Container, Form, Button, Row, Col, Alert } from "react-bootstrap"
import { Save, Eye, Upload, ImageIcon } from "lucide-react"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"
import "./BlogCreation.css"
import useFetch from "../hooks/useFetch"
import { useAuth } from "../hooks/useAuth"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"

const BlogCreation = () => {

  const { user } = useAuth()
  const username = user?.username
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    blogName: "",
    blogType: "",
    author: username,
    ageGroup: "",
    description: "",
    content: "",
    image: null,
  })
  const [imagePreview, setImagePreview] = useState(null)
  const [showAlert, setShowAlert] = useState({ show: false, message: "", blogType: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef(null)
  const [types, setTypes] = useState([])
  const [ageGroups, setAgeGroups] = useState([])

  const { error: errorBlogTypes, loading: loadingBlogTypes, get: getBlogTypes } = useFetch();
  const { error: errorAgeGroup, loading: loadingAgeGroups, get: getAgeGroups } = useFetch();
  const { error: errorBlog, loading: loadingBlog, post: postBlog } = useFetch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const typesData = await getBlogTypes("http://localhost:8080/api/blog/type");
        setTypes(typesData);

        const ageGroupsData = await getAgeGroups("http://localhost:8080/api/course/age-group");
        setAgeGroups(ageGroupsData);
      } catch (err) {
        console.error("Fetch error in BlogList:", err);
        // Có thể set lỗi vào state để hiển thị ErrorMessage
      }
    };

    fetchData();
  }, [getBlogTypes, getAgeGroups]);

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
        toast.error("Image size should be less than 5MB", "danger")
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
      toast.error("Please enter an blog name", "danger")
      return false
    }
    if (!formData.blogType) {
      toast.error("Please select a type", "danger")
      return false
    }
    if (!formData.description.trim()) {
      toast.error("Please enter a description", "danger")
      return false
    }
    if (!formData.content.trim() || formData.content === "<p><br></p>") {
      toast.error("Please enter blog content", "danger")
      return false
    }
    return true
  }

  const handleSave = async () => {
    if (!username) {
      toast.error("Vui lòng đăng nhập để đăng bài blog của bạn.");
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

      await postBlog(blogData, {}, "http://localhost:8080/api/blog");
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success("Blog saved as draft successfully!", "success")
      console.log("Saving blog:", formData)
    } catch (error) {
      // toast.error("Error saving blog. Please try again.", "danger")
      console.error("Error saving blog. Please try again.", error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to create blog. Please try again.");
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePreview = () => {
    if (!validateForm()) return
    // Open preview in new window or modal
    console.log("Preview blog:", formData)
    showAlertMessage("Opening preview...", "info")
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

      await postBlog(blogData, {}, "http://localhost:8080/api/blog");
      await new Promise((resolve) => setTimeout(resolve, 1500))
      toast.success("Blog published successfully!", "success")
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
      toast.error("Error publishing blog. Please try again.", "danger")
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
            <h1 className="display-4 fw-bold mb-3">Create Your Own Blog</h1>
            <p className="lead">Sharing knowledge and experience in drug prevention</p>
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
                    placeholder="Enter Blog Name"
                    value={formData.blogName}
                    onChange={(e) => handleInputChange("blogName", e.target.value)}
                    className="blog-name-input"
                  />
                </div>

                {/* Type and Target AgeGroup */}
                <Row className="mb-4">
                  <Col md={4}>
                    <Form.Select
                      value={formData.blogType}
                      onChange={(e) => handleInputChange("blogType", e.target.value)}
                      className="filter-select-new"
                    >
                      <option value="">Select Topic</option>
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
                      <option value="">Select Age Group</option>
                      {ageGroups.map((ageGroup) => (
                        <option key={ageGroup} value={ageGroup}>
                          {ageGroup}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={4} className="d-flex align-items-center">
                    <span className="author-text">by {formData.author}</span>
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
                          <span>Click to change image</span>
                        </div>
                      </div>
                    ) : (
                      <div className="upload-placeholder-new">
                        <ImageIcon size={48} className="upload-icon-new" />
                        <span className="upload-text-new">Click to upload image</span>
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
                  <Form.Label className="section-title-new">Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Write a brief description of the blog content"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="form-textarea-new"
                  />
                </div>

                {/* Blog Content */}
                <div className="form-section-new mb-5">
                  <Form.Label className="section-title-new">Blog Content</Form.Label>
                  <div className="quill-container-new">
                    <ReactQuill
                      theme="snow"
                      value={formData.content}
                      onChange={(content) => handleInputChange("content", content)}
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder="Start writing your blog..."
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
                    Save
                  </Button>
                  <Button
                    variant="info"
                    className="action-btn-new view-btn-new me-3"
                    onClick={handlePreview}
                    disabled={isSubmitting}
                  >
                    <Eye size={18} className="me-2" />
                    View
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
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Upload size={18} className="me-2" />
                        Publish
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
