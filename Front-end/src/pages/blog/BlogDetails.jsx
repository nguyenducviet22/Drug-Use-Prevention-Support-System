import { Container, Row, Col, Button } from "react-bootstrap"
import { Calendar, User, Clock, PencilLine, Trash } from "lucide-react"
import "./BlogDetails.css"
import useFetch from "../../hooks/useFetch"
import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import Recommendation from "../../components/others/Recommendation"
import ErrorMessage from "../../components/ErrorMessage"
import BackButton from "../../components/BackButton"
import NotFound from "../not-found/NotFound"
import LoadingSpinner from "../../components/LoadingSpinner"
import { toast } from "react-toastify"
import { useTranslation } from "react-i18next" // Import useTranslation
import { useAuth } from "../../hooks/useAuth"

const BlogDetails = () => {
    const { user } = useAuth()
    const { t } = useTranslation("blogDetails");// Khai báo useTranslation với namespace 'blogDetails'

    const { id } = useParams()
    const [blogDetails, setBlogDetails] = useState(null)
    const { loading: loadingBlogDetails, error: errorBlogDetails, get: getBlogDetails } = useFetch()
    const { loading: loadingBlogStatus, error: errorBlogStatus, put: putBlogStatus } = useFetch()
    const navigate = useNavigate()

    useEffect(() => {
        const fetchBLogs = async () => {
            try {
                if (id) {
                    const blogDetailsData = await getBlogDetails(`http://localhost:8080/api/blog/${id}`)
                    setBlogDetails(blogDetailsData)
                }
            } catch (err) {
                console.error("Fetch error in BlogsDetails:", err)
            }
        }

        fetchBLogs()
    }, [id, getBlogDetails]) // Thêm getBlogDetails vào dependency array
    console.log(blogDetails);

    const handleEditBlog = () => {
        navigate(`/blogs/create/${id}`);
    };

    const handleDeleteBlog = async () => {
        try {
            const blogID = blogDetails?.blogID
            console.log(blogID);
            if (blogID) {
                const response = await putBlogStatus({}, {}, `http://localhost:8080/api/blog/${blogID}/status/UNAVAILABLE`);
                console.log("Blog status updated to unavailable:", response);
                toast.success(t("toastMessages.deleteSuccess"), "success");
                navigate("/blogs")
            } else {
                console.warn("Cannot delete: Blog ID is undefined or null.");
                toast.error(t("toastMessages.blogIdNotFound"), "warning");
            }
        } catch (error) {
            toast.error(t("toastMessages.deleteError"), "danger")
            console.log("Error in handleDeleteBlog:", error);
        }
    };

    if (loadingBlogDetails) {
        return (
            <Container className="py-5">
                <LoadingSpinner loading={loadingBlogDetails} />
            </Container>
        )
    }

    if (errorBlogDetails) {
        return (
            <Container className="py-5">
                <ErrorMessage error={errorBlogDetails} />
            </Container>
        )
    }

    if (!blogDetails) {
        return (
            <NotFound
                code={t("blogNotFound.code")}
                title={t("blogNotFound.title")}
                message={t("blogNotFound.message")}
                backLink="/blogs"
                backText={t("blogNotFound.backLinkText")}
            />
        )
    }

    return (
        <div className="blog-details-page">
            <Container className="blog-details-container py-5">
                <Row className="justify-content-center">
                    <Col lg={8} md={10}>
                        <div className="d-flex justify-content-between align-items-center">
                            <BackButton label={t("backButton")} />
                            {user?.username === blogDetails?.member?.username && (
                                <div className="d-flex gap-2">
                                    <Button className="rounded-pill shadow-sm custom-button-action" onClick={handleEditBlog}>
                                        <PencilLine className="me-1" size={18} /> {t("editButton")}
                                    </Button>
                                    <Button variant="danger" className="rounded-pill shadow-sm custom-button-action" onClick={handleDeleteBlog}>
                                        <Trash className="me-1" size={18} /> {t("deleteButton")}
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Blog Header */}
                        <div className="blog-header text-center mb-5">
                            <h1 className="blog-detail-title mb-3">{blogDetails.blogName}</h1>
                            <p className="blog-author mb-4">{t("byPrefix")} {blogDetails.member.username}</p>

                            {/* Meta Information */}
                            <div className="blog-meta d-flex justify-content-center align-items-center mb-4">
                                <span className="category-badge me-4">{blogDetails.blogType}</span>
                                <span className="meta-info">
                                    <Clock size={16} className="meta-icon" />
                                    {blogDetails.readingTime} {t("minsReading")}
                                </span>
                                <span className="meta-info me-3">
                                    <Calendar size={16} className="meta-icon me-1" />
                                    {blogDetails.createdAt}
                                </span>
                                <span className="meta-info">
                                    <User size={16} className="meta-icon me-1" />
                                    {blogDetails.member.username}
                                </span>
                            </div>
                        </div>

                        {/* Hashtags */}
                        <div className="hashtags-container mt-4">
                            <span className="hashtag">{t("hashtags.recovery")}</span>
                            <span className="hashtag">{t("hashtags.trueStory")}</span>
                            <span className="hashtag">{t("hashtags.detox")}</span>
                            <span className="hashtag">{t("hashtags.hope")}</span>
                            <span className="hashtag">{t("hashtags.lifeJourney")}</span>
                        </div>

                        {/* Featured Image */}
                        <div className="featured-image-container mb-5">
                            <img
                                src={blogDetails.img}
                                alt={blogDetails.blogName}
                                className="featured-image"
                            />
                        </div>

                        {/* Blog Content */}
                        <div className="blog-content">
                            {/* Introduction Section */}
                            <section className="content-section mb-5">
                                <h2 className="section-title mb-3">{t("sections.introductionTitle")}</h2>
                                <p className="section-text">{blogDetails.description}</p>
                            </section>

                            {/* Main Content - You can expand this based on your blog structure */}
                            <section className="content-section mb-5">
                                <h2 className="section-title mb-3">{t("sections.mainContentTitle")}</h2>
                                <div
                                    className="section-text quill-content"
                                    dangerouslySetInnerHTML={{ __html: blogDetails.content }}
                                />
                            </section>
                        </div>
                    </Col>
                </Row>
            </Container>
            {/* Related Blogs Section */}
            <Recommendation type="blog" />
        </div>
    )
}

export default BlogDetails