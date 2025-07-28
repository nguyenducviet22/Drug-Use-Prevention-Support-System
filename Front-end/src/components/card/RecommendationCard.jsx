import { Card } from "react-bootstrap";
import DOMPurify from "dompurify";
import "./RecommendationCard.css";

const RecommendationCard = ({ recommendation, type, onViewClick }) => {
  // Làm sạch HTML trước khi render
  const cleanDescription = DOMPurify.sanitize(recommendation.description);

  return (
    <Card
      style={{ width: "18rem", cursor: "pointer" }}
      onClick={() => onViewClick(recommendation.id)}
    >
      <Card.Img
        variant="top"
        src={recommendation.image}
        alt={recommendation[`${type}Name`]}
        className="card-img-fixed"
      />
      <Card.Body>
        <Card.Title>{recommendation[`${type}Name`]}</Card.Title>
        <Card.Text
          dangerouslySetInnerHTML={{ __html: cleanDescription }}
        />
      </Card.Body>
    </Card>
  );
};

export default RecommendationCard;