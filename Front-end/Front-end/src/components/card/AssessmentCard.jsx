import { Card, Button } from "react-bootstrap";
import { FileText, Shield, Users, Clock, Target, MessageSquare } from "lucide-react";
import "./AssessmentCard.css";
import { useTranslation } from "react-i18next"; // Import useTranslation

const AssessmentCard = ({ assessment }) => {
  const { t } = useTranslation("assessmentCard"); // Initialize useTranslation

  // Determine which icon to use based on assessment type
  const renderIcon = () => {
    switch (assessment.assessmentType) {
      case "ASSIST":
        return <Shield size={48} className="text-primary" />;
      case "CRAFFT":
        return <Shield size={48} className="text-primary" />;
      default:
        return <FileText size={48} className="text-primary" />;
    }
  };

  return (
    <Card className="assessment-card h-100 border-0 shadow-sm">
      <Card.Body className="text-center p-4">
        <div className="assessment-icon mb-3">{renderIcon()}</div>
        <h4 className="fw-bold mb-3">{assessment.assessmentType}</h4>
        <p className="text-muted mb-4">{assessment.description}</p>
        <div className="assessment-details text-start mb-4">
          {assessment.details}
        </div>

        <Button variant="primary" size="lg" className="px-4" onClick={() => window.open(assessment.linkTest)}>
          {t("takeButton")}
        </Button>
      </Card.Body>
    </Card>
  );
};

export default AssessmentCard;