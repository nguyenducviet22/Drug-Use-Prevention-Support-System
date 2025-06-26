import { Container, Row, Col, Button } from "react-bootstrap"
import { Calendar, User, Clock, PencilLine, Trash } from "lucide-react"
import "./BlogDetails.css"
import useFetch from "../hooks/useFetch"
import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import Recommendation from "../components/Recommendation"
import ErrorMessage from "../components/ErrorMessage"
import BackButton from "../components/BackButton"
import NotFound from "./NotFound"
import LoadingSpinner from "../components/LoadingSpinner"
import { toast } from "react-toastify"

const BlogDetails = () => {

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
    }, [id])
    console.log(blogDetails);

    const handleEditBlog = () => {
        navigate(`/blogs/create/${id}`);
    };

    const handleDeleteBlog = async () => {
        try {
            const blogID = blogDetails?.blogID
            console.log(blogID);
            if (blogID) {
                const response = await putBlogStatus({}, {}, `http://localhost:8080/api/blog/${blogID}/status`);
                console.log("Blog status updated to unavailable:", response);
                toast.success("Blog deleted successfully!", "success");
                navigate("/blogs")
            } else {
                console.warn("Cannot delete: Blog ID is undefined or null.");
                toast.error("Blog ID not found for deletion. Please refresh.", "warning");
            }
        } catch (error) {
            toast.error("Error deleting blog. Please try again.", "danger")
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
                code="📚"
                title="Blog Not Found"
                message="We couldn't find the blog you're looking for."
                backLink="/blogs"
                backText="Back to Blogs"
            />
        )
    }

    return (
        <div className="blog-details-page">
            <Container className="blog-details-container py-5">
                <Row className="justify-content-center">
                    <Col lg={8} md={10}>
                        <div className="d-flex justify-content-between align-items-center">
                            <BackButton label="Back" />
                            <div className="d-flex gap-2">
                                <Button className="rounded-pill shadow-sm custom-button-action" onClick={handleEditBlog}>
                                    <PencilLine className="me-1" size={18} /> Edit
                                </Button>
                                <Button variant="danger" className="rounded-pill shadow-sm custom-button-action" onClick={handleDeleteBlog}>
                                    <Trash className="me-1" size={18} /> Delete
                                </Button>
                            </div>
                        </div>

                        {/* Blog Header */}
                        <div className="blog-header text-center mb-5">
                            <h1 className="blog-detail-title mb-3">{blogDetails.blogName}</h1>
                            <p className="blog-author mb-4">by {blogDetails.member.username}</p>

                            {/* Meta Information */}
                            <div className="blog-meta d-flex justify-content-center align-items-center mb-4">
                                <span className="category-badge me-4">{blogDetails.blogType}</span>
                                <span className="meta-info">
                                    <Clock size={16} className="meta-icon" />
                                    {blogDetails.readingTime} mins
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
                            <span className="hashtag">#Recovery</span>
                            <span className="hashtag">#TrueStory</span>
                            <span className="hashtag">#Detox</span>
                            <span className="hashtag">#Hope</span>
                            <span className="hashtag">#LifeJourney</span>
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
                                <h2 className="section-title mb-3">Introduction</h2>
                                <p className="section-text">{blogDetails.description}</p>
                            </section>

                            {/* Main Content - You can expand this based on your blog structure */}
                            <section className="content-section mb-5">
                                <h2 className="section-title mb-3">Main Content</h2>
                                <div
                                    className="section-text quill-content" // Add a class for potential styling
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