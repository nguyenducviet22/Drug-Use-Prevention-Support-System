import { Button, Card } from "react-bootstrap"
import { Clock, User, Calendar } from "lucide-react"
import "./CourseCard.css"

const CourseCard = ({ course }) => {
    const getCategoryColor = (category) => {
        const colors = {
            Student: "category-student",
            Recovery: "category-recovery",
            Community: "category-community",
            Wellness: "category-wellness",
            Family: "category-family",
        }
        return colors[category] || "category-default"
    }

    return (
        <Card
            className="course-card mb-4"
            style={{
                backgroundImage: `url('https://www.njspotlightnews.org/wp-content/uploads/sites/123/2018/07/assets1807112022-600x400.jpg')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            <div className="course-card-overlay">
                <div className="course-card-content">
                    {/* Top Section */}
                    <div className="course-header">
                        <span className={`category-tag ${getCategoryColor(course.ageGroup)}`}>{course.ageGroup}</span>
                        <div className="course-meta-info">
                            <Clock size={16} className="meta-icon" />
                            <span className="meta-text">{course.duration}</span>
                        </div>
                    </div>

                    {/* Main Title */}
                    <h3 className="course-title">{course.courseName}</h3>

                    {/* Description */}
                    <p className="course-description">{course.description}</p>

                    {/* Date and Author */}
                    <div className="course-details">
                        <div className="detail-item">
                            <Calendar size={14} className="detail-icon" />
                            <span className="detail-text">{course.createdAt}</span>
                        </div>
                        <div className="detail-item">
                            <User size={14} className="detail-icon" />
                            <span className="detail-text">{course.author}</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="course-actions">
                        <Button className="enroll-button">Enroll</Button>
                        <Button variant="outline-secondary" className="details-button">
                            Details
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    )
}

export default CourseCard
