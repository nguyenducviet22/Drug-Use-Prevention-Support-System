import { Card, Button } from "react-bootstrap"
import { Calendar, Clock, User } from "lucide-react"
import "./BlogCard.css"

const BlogCard = ({ blog, status, onReadClick }) => {

  return (
    <Card
      className="blog-card mb-4"
      style={{
        backgroundImage: `url(${blog.img})`,
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
                {blog.readingTime} mins
              </span>
              <span className="meta-info">
                <Calendar size={16} className="meta-icon" />
                {blog.createdAt}
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
            <Button variant="primary" className="read-button" onClick={() => onReadClick(blog.blogID)}>
              Read
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

export default BlogCard
