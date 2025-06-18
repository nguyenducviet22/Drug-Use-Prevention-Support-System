import { Container, Row, Col } from "react-bootstrap"
import { Calendar, User, Clock } from "lucide-react"
import "./BlogDetails.css"
import useFetch from "../hooks/useFetch"
import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import Recommendation from "../components/Recommendation"
import ErrorMessage from "../components/ErrorMessage"
import BackButton from "../components/BackButton"
import NotFound from "./NotFound"

const BlogDetails = () => {

    const { id } = useParams()
    const [blog, setBlog] = useState(null)
    const { loading, error, get } = useFetch()
    const navigate = useNavigate()

    useEffect(() => {
        const fetchBLogs = async () => {
            try {
                const blogData = await get(`http://localhost:8080/api/blog/${id}`)
                setBlog(blogData)
            } catch (err) {
                console.error("Fetch error in BlogsDetails:", err)
            }
        }

        fetchBLogs()
    }, [id])
    console.log(blog);

    <Container className="py-5" >
        <LoadingSpinner loading={loading} />
        <ErrorMessage error={error} />
    </Container >

    if (!blog) {
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
                        <BackButton label="Back" />

                        {/* Blog Header */}
                        <div className="blog-header text-center mb-5">
                            <h1 className="blog-detail-title mb-3">{blog.blogName}</h1>
                            <p className="blog-author mb-4">by {blog.member.username}</p>

                            {/* Meta Information */}
                            <div className="blog-meta d-flex justify-content-center align-items-center mb-4">
                                <span className="category-badge me-4">{blog.blogType}</span>
                                <span className="meta-info">
                                    <Clock size={16} className="meta-icon" />
                                    {blog.readingTime} mins
                                </span>
                                <span className="meta-info me-3">
                                    <Calendar size={16} className="meta-icon me-1" />
                                    {blog.createdAt}
                                </span>
                                <span className="meta-info">
                                    <User size={16} className="meta-icon me-1" />
                                    {blog.member.username}
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
                                src={blog.img}
                                alt={blog.blogName}
                                className="featured-image"
                            />
                        </div>

                        {/* Blog Content */}
                        <div className="blog-content">
                            {/* Introduction Section */}
                            <section className="content-section mb-5">
                                <h2 className="section-title mb-3">Introduction</h2>
                                <p className="section-text">{blog.description}</p>
                            </section>

                            {/* Main Content - You can expand this based on your blog structure */}
                            <section className="content-section mb-5">
                                <p className="section-text">{blog.content}</p>
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