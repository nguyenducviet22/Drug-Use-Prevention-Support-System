import { Card, Button } from "react-bootstrap"
import { Calendar, Clock, User } from "lucide-react"
import "./BlogCard.css"
import { useTranslation } from "react-i18next"; // Import useTranslation

const BlogCard = ({ blog, status, onReadClick }) => {
  const { t } = useTranslation("blogCard"); // Initialize useTranslation

  return (
    <Card
      className="blog-card mb-4"
      style={{
        backgroundImage: `url(${blog.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="blog-card-overlay">
        <div className="blog-card-content p-4">
          <div className="d-flex align-items-center mb-3">
            <span className="category-badge">{blog.blogType}</span>
            <div className="ms-auto d-flex align-items-center">
              <span className="meta-info">
                <Clock size={16} className="meta-icon" />
                {blog.readingTime} {t("readingTimeSuffix")}
              </span>
              <span className="meta-info">
                <Calendar size={16} className="meta-icon" />
                {new Date(blog.createdAt).toLocaleDateString()} - {new Date(blog.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="meta-info ms-3">
                <User size={16} className="meta-icon" />
                {blog.member.username}
              </span>
            </div>
          </div>

          <h2 className="blog-title mb-3">{blog.blogName}</h2>

          <p className="blog-excerpt mb-4">{blog.description}</p>

          {status !== 'draft' && (
            <div className="d-flex justify-content-end mt-2">
              <Button variant="primary" className="read-button"
                onClick={() => onReadClick(blog.blogID)}>
                {t("readButton")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export default BlogCard;