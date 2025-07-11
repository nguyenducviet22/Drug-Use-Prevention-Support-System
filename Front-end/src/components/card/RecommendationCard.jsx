import { Card } from "react-bootstrap";
import "./RecommendationCard.css";

const RecommendationCard = ({ recommendation, type, onViewClick }) => {
  return (
        <Card style={{ width: '18rem', cursor: 'pointer' }} onClick={() => onViewClick(recommendation.id)}>
            <Card.Img
                variant="top"
                src={recommendation.image}
                alt={recommendation[`${type}Name`]}
                className="card-img-fixed"
            />
            <Card.Body>
                <Card.Title>{recommendation[`${type}Name`]}</Card.Title>
                <Card.Text>
                    {recommendation.description}
                </Card.Text>
            </Card.Body>
        </Card>
    )
};

export default RecommendationCard
