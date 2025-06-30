import { Card } from "react-bootstrap";
import "./RecommendationCard.css";

const RecommendationCard = ({ recommendation, type, onViewClick }) => {
  return (
    <Card
      className="recommendation-card"
      onClick={() => onViewClick(recommendation[`${type}ID`])}
    >
      <Card.Img
        variant="top"
        src={recommendation.img}
        alt={recommendation[`${type}Name`]}
        className="recommendation-image"
      />
      <Card.Body className="d-flex flex-column">
        <Card.Title className="recommendation-title">
          {recommendation[`${type}Name`]}
        </Card.Title>
        <Card.Text className="flex-grow-1">{recommendation.description}</Card.Text>
      </Card.Body>
    </Card>
  );
};

export default RecommendationCard;