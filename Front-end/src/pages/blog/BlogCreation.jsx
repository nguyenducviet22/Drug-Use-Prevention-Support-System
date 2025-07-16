import { useState, useRef, useEffect } from "react";
import { Container, Form, Button, Row, Col, Alert } from "react-bootstrap";
import { Save, Eye, Upload, ImageIcon } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./BlogCreation.css";
import useFetch from "../../hooks/useFetch";
import useUpload from "../../hooks/useUpload"; // Import custom hook useUpload
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BackButton from "../../components/BackButton";

const BlogCreation = () => {
  const { t } = useTranslation('blogCreation'); // Khai báo useTranslation với namespace 'blogCreation'

  const { user } = useAuth();
  const username = user?.username;
  const { id: blogID } = useParams();
  const navigate = useNavigate();

  const [imagePreview, setImagePreview] = useState(null); // Vẫn giữ state này cho preview cục bộ
  const [showAlert, setShowAlert] = useState({ show: false, message: "", blogType: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const [types, setTypes] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);

  const { imageUrl: uploadedImageUrl, uploading: isUploadingImage, uploadError: imageUploadError, uploadImage, setImageUrl: setUploadedImageUrl } = useUpload();

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
    image: null, // Trường này sẽ lưu trữ URL ảnh cuối cùng
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const typesData = await getBlogTypes("http://localhost:8080/api/blog/type");
        setTypes(typesData);

        const ageGroupsData = await getAgeGroups("http://localhost:8080/api/user/age-group");
        setAgeGroups(ageGroupsData);

        if (blogID) {
          const blogData = await getDraft(`http://localhost:8080/api/blog/${blogID}`);
          setFormData(blogData);
          // Nếu có ảnh đã lưu, hiển thị preview và set URL vào hook useUpload
          if (blogData.image) {
            setImagePreview(blogData.image);
            setUploadedImageUrl(blogData.image); // Set URL ảnh cũ vào useUpload
          }
        }
      } catch (error) {
        console.error("Fetch error in BlogCreation:", error);
        // Có thể set lỗi vào state để hiển thị ErrorMessage
      }
    };

    fetchData();
  }, [getBlogTypes, getAgeGroups, blogID, getDraft, setUploadedImageUrl]); // Thêm setUploadedImageUrl vào dependencies

  console.log('formData', formData);

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
  };

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
  ];

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
        setImagePreview(e.target.result); // Hiển thị ảnh preview ngay lập tức
      };
      reader.readAsDataURL(file);
      // Gọi hàm uploadImage từ custom hook để xử lý tải lên
      uploadImage(file);
    }
  };

  const showAlertMessage = (message, blogType) => {
    setShowAlert({ show: true, message, blogType });
    setTimeout(() => {
      setShowAlert({ show: false, message: "", blogType: "" });
    }, 5000);
  };

  const validateForm = () => {
    if (!formData.blogName.trim()) {
      toast.error(t("form.alert.validation.blogNameRequired"));
      return false;
    }
    if (!formData.blogType) {
      toast.error(t("form.alert.validation.blogTypeRequired"));
      return false;
    }
    if (!formData.description.trim()) {
      toast.error(t("form.alert.validation.descriptionRequired"));
      return false;
    }
    if (!formData.content.trim() || formData.content === "<p><br></p>") {
      toast.error(t("form.alert.validation.contentRequired"));
      return false;
    }
    // Kiểm tra ảnh: nếu là blog mới HOẶC ảnh hiện tại rỗng VÀ chưa có ảnh được upload (tức là người dùng chưa chọn ảnh)
    if (!blogID && !uploadedImageUrl) {
      toast.error(t("form.alert.validation.imageRequired"));
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!username) {
      toast.error(t("form.alert.loginRequired"));
      navigate('/login');
      return;
    }
    if (!validateForm()) return;

    // Đảm bảo ảnh đã được upload xong trước khi lưu blog
    if (isUploadingImage) {
      toast.info(t("form.alert.imageUploading"));
      return;
    }
    if (!uploadedImageUrl) { // Kiểm tra nếu chưa có ảnh hoặc ảnh upload thất bại
      toast.error(t("form.alert.imageUploadRequired"));
      return;
    }

    setIsSubmitting(true);
    try {
      const blogData = {
        blogName: formData.blogName,
        blogType: formData.blogType,
        image: uploadedImageUrl,
        ageGroup: formData.ageGroup,
        description: formData.description,
        content: formData.content,
        blogStatus: "DRAFT",
      };
      console.log(blogData);

      if (blogID) {
        await putExistingBlog(blogData, {}, `http://localhost:8080/api/blog/${blogID}`);
      } else {
        await postNewBlog(blogData, {}, "http://localhost:8080/api/blog");
      }
      toast.success(t("form.alert.success"));
      console.log("Saving blog:", formData);
      navigate("/blogs");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(t("form.alert.validation.failedToCreate"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = () => {
    if (!validateForm()) return;
    if (!uploadedImageUrl) {
      toast.info(t("form.alert.imageUploadForPreview"));
      return;
    }
    console.log("Preview blog:", formData);
    showAlertMessage(t("form.alert.previewMessage"), "info");
  };

  const handlePublish = async () => {
    if (!validateForm()) return;

    // Đảm bảo ảnh đã được upload xong trước khi xuất bản blog
    if (isUploadingImage) {
      toast.info(t("form.alert.imageUploading"));
      return;
    }
    if (!uploadedImageUrl) { // Kiểm tra nếu chưa có ảnh hoặc ảnh upload thất bại
      toast.error(t("form.alert.imageUploadRequiredPublish"));
      return;
    }

    setIsSubmitting(true);
    try {
      const blogData = {
        blogName: formData.blogName,
        blogType: formData.blogType,
        image: uploadedImageUrl,
        ageGroup: formData.ageGroup,
        description: formData.description,
        content: formData.content,
        blogStatus: "PUBLISHED",
      };
      console.log(blogData);

      if (blogID) {
        const res = await putExistingBlog(blogData, {}, `http://localhost:8080/api/blog/${blogID}`);
        console.log(res);
      } else {
        await postNewBlog(blogData, {}, "http://localhost:8080/api/blog");
      }
      toast.success(t("form.alert.publishSuccess"));
      console.log("Publishing blog:", formData);
      setTimeout(() => {
        setFormData({
          blogName: "",
          blogType: "",
          author: username,
          ageGroup: "",
          description: "",
          content: "",
          image: null,
        });
        setImagePreview(null);
        setUploadedImageUrl(null);
      }, 2000);
      navigate("/blogs");
    } catch (error) {
      toast.error(t("form.alert.publishError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="blog-creation-page-new">
      <div className="creation-header">
        <Container>
          <div className="text-center text-white py-5">
            <h1 className="display-4 fw-bold mb-3">{t("header.title")}</h1>
            <p className="lead">{t("header.subtitle")}</p>
          </div>
        </Container>
      </div>

      <Container className="py-5">
        <BackButton label={t("backButton")} />
        <div className="creation-form-container">
          {showAlert.show && (
            <Alert variant={showAlert.blogType} className="mb-4">
              {showAlert.message}
            </Alert>
          )}

          <Form>
            <Row>
              <Col lg={8} className="mx-auto">
                <div className="form-section-new mb-4">
                  <Form.Control
                    type="text"
                    placeholder={t("form.blogNamePlaceholder")}
                    value={formData.blogName}
                    onChange={(e) => handleInputChange("blogName", e.target.value)}
                    className="blog-name-input"
                  />
                </div>

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
                          {t(`form.typeOptions.${type}`, type)}
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
                          {t(`form.ageGroupOptions.${ageGroup}`, ageGroup)}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={4} className="d-flex align-items-center">
                    <span className="author-text">{t("form.byAuthor", { author: formData.author })}</span>
                  </Col>
                </Row>

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

                <div className="action-buttons-new text-center">
                  <Button
                    variant="secondary"
                    className="action-btn-new save-btn-new me-3"
                    onClick={handleSave}
                    disabled={isSubmitting || isUploadingImage}
                  >
                    <Save size={18} className="me-2" />
                    {t("form.buttons.save")}
                  </Button>
                  {/* <Button
                    variant="info"
                    className="action-btn-new view-btn-new me-3"
                    onClick={handlePreview}
                    disabled={isSubmitting || isUploadingImage}
                  >
                    <Eye size={18} className="me-2" />
                    {t("form.buttons.view")}
                  </Button> */}
                  <Button
                    variant="primary"
                    className="action-btn-new publish-btn-new"
                    onClick={handlePublish}
                    disabled={isSubmitting || isUploadingImage}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
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
  );
};

export default BlogCreation;