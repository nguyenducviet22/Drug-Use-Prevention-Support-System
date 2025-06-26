import { Col, Container, Row } from "react-bootstrap"
import "./Recommendation.css"
import { useEffect, useState } from "react"
import useFetch from "../hooks/useFetch"
import { useAuth } from "../hooks/useAuth"
import RecommendationCard from "./RecommendationCard"
import { useNavigate } from "react-router-dom"

const getRandomItems = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

const Recommendation = ({ type }) => {
  const { user, authLoading } = useAuth();
  const navigate = useNavigate()

  const [recommendations, setRecommendations] = useState([])
  const endpointMap = {
    blog: `http://localhost:8080/api/blog/age-group/${user?.ageGroup}`,
    course: `http://localhost:8080/api/course/age-group/${user?.ageGroup}`,
    event: `http://localhost:8080/api/event/age-group/${user?.ageGroup}`
  };

  const { loading, error, get } = useFetch(user?.ageGroup ? endpointMap[type] : null);

  useEffect(() => {
    if (get) {
      get()
        .then((data) => {
          setRecommendations(getRandomItems(data, 3))
        })
        .catch(() => { })
    }
  }, [get]);
  console.log(recommendations);

  const handleViewDetails = (id) => {
    if (type === "blog") navigate(`/blogs/${id}`);
    else if (type === "course") navigate(`/courses/${id}`);
    else if (type === "event") navigate(`/events/${id}`);
  }

  if (authLoading || loading) {
    return (
      <Container className="my-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    )
  }

  return (
    <Container className="recommendations-section mt-5">
      <h3 className="recommendations-title text-center mb-4">
        Recommended {type.charAt(0).toUpperCase() + type.slice(1)}s
      </h3>
      <div className="recommendations-divider mb-4"></div>
      <Row className="g-4">
        {recommendations.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted">No recommendations found fitting your age.</p>
          </div>
        ) : (
          <>
            {recommendations.map((recommendation) => (
              <Col key={recommendation[`${type}ID`]} md={4} sm={12}>
                <RecommendationCard recommendation={recommendation} type={type}
                  onViewClick={() => handleViewDetails(recommendation[`${type}ID`])} />
              </Col>
            ))}
          </>
        )}
      </Row>
    </Container>
  )
}

export default Recommendation