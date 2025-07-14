import { Button, Card } from "react-bootstrap";
import { Clock, User, Calendar } from "lucide-react";
import "./CourseCard.css";
import { useTranslation } from "react-i18next"; // Import useTranslation

const CourseCard = ({ course, onEnrollClick, onDetailsClick, onContinueClick, status }) => {
  const { t } = useTranslation("courseCard"); // Initialize useTranslation

  const getAgeGroupColor = (ageGroup) => {
    const colors = {
      ADOLESCENT: "ageGroup-adolescent",
      ADULT: "ageGroup-adult",
      SENIOR: "ageGroup-senior",
      EVERYONE: "ageGroup-everyone",
    };
    return colors[ageGroup] || "ageGroup-default";
  };

  return (
    <Card
      className="course-card mb-4"
      style={{
        backgroundImage: `url(${course.img})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="course-card-overlay">
        <div className="course-card-content">
          {/* Top Section */}
          <div className="course-header">
            <span className={`ageGroup-tag ${getAgeGroupColor(course.ageGroup)}`}>
              {t(`ageGroup.${course.ageGroup}`)}
            </span>
            <div className="course-meta-info">
              <Clock size={16} className="meta-icon" />
              <span className="meta-text">{course.duration} {t("durationSuffix")}</span>
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
            {status === "learning" ? (
              <Button
                className="details-button"
                onClick={() => onContinueClick(course.courseID)}
              >
                {t("continueButton")}
              </Button>
            ) : (
              <>
                <Button
                  className="enroll-button"
                  onClick={() => onEnrollClick(course.courseID)}
                >
                  {t("enrollButton")}
                </Button>
                <Button
                  variant="outline-secondary"
                  className="details-button"
                  onClick={() => onDetailsClick(course.courseID)}
                >
                  {t("detailsButton")}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CourseCard;