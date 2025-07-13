import { Col, Container, Row } from "react-bootstrap";
import "./Recommendation.css";
import { useEffect, useState } from "react";
import useFetch from "../../hooks/useFetch";
import { useAuth } from "../../hooks/useAuth";
import RecommendationCard from "../card/RecommendationCard";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next"; // Import useTranslation

const getRandomItems = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const Recommendation = ({ type }) => {
  const { t } = useTranslation("recommendation"); // Initialize useTranslation
  const { user, authLoading } = useAuth();
  const navigate = useNavigate();

  const [joinedEventIds, setJoinedEventIds] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const endpointMap = {
    blog: `http://localhost:8080/api/blog/age-group/${user?.ageGroup}`,
    course: `http://localhost:8080/api/course/age-group/${user?.ageGroup}`,
    event: `http://localhost:8080/api/event/age-group/${user?.ageGroup}`,
  };

  const endpoint = user?.ageGroup ? endpointMap[type] : null;
  const { loading, error, get } = useFetch(endpoint);

  // 🧠 Lấy danh sách các sự kiện đã đăng ký
  useEffect(() => {
    const fetchJoinedEvents = async () => {
      if (type !== "event" || !user) return;

      const token = localStorage.getItem("token");
      try {
        const res = await fetch(
          `http://localhost:8080/api/event/my-events/${user.username}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const result = await res.json();
        const joinedIds = Array.isArray(result)
          ? result.map((e) => e.eventID)
          : result?.data?.map((e) => e.eventID) || [];
        setJoinedEventIds(joinedIds);
      } catch (error) {
        console.warn("Failed to fetch joined events:", error);
      }
    };

    fetchJoinedEvents();
  }, [type, user]);

  // 🎯 Gọi API lấy recommendation
  useEffect(() => {
    if (!authLoading && user?.ageGroup && get) {
      get(endpoint)
        .then((data) => {
          if (type === "event") {
            // 🔎 Bỏ các event đã tham gia khỏi đề xuất
            const filtered = (data || []).filter(
              (item) => !joinedEventIds.includes(item.eventID)
            );
            setRecommendations(filtered);
          } else {
            setRecommendations(getRandomItems(data || [], 3));
          }
        })
        .catch((error) => {
          console.error("Failed to fetch recommendations:", error);
        });
    }
  }, [authLoading, user?.ageGroup, get, endpoint, joinedEventIds, type]);

  const handleViewDetails = (id) => {
    if (type === "blog") navigate(`/blogs/${id}`);
    else if (type === "course") navigate(`/courses/${id}`);
    else if (type === "event") navigate(`/events/${id}`);
  };

  const getRecommendationTitle = () => {
    switch (type) {
      case "blog":
        return t("recommendedBlogs");
      case "course":
        return t("recommendedCourses");
      case "event":
        return t("recommendedEvents");
      default:
        return "";
    }
  };

  if (authLoading || loading) {
    return (
      <Container className="my-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t("loading")}</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="recommendations-section mt-5">
      <h3 className="recommendations-title text-center mb-4">
        {getRecommendationTitle()}
      </h3>
      <div className="recommendations-divider mb-4"></div>
      <Row className="g-4">
        {recommendations.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted">{t("noRecommendationsFound")}</p>
          </div>
        ) : (
          <>
            {recommendations.map((recommendation) => (
              <Col key={recommendation[`${type}ID`]} md={4} sm={12}>
                <RecommendationCard
                  recommendation={recommendation}
                  type={type}
                  onViewClick={() =>
                    handleViewDetails(recommendation[`${type}ID`])
                  }
                />
              </Col>
            ))}
          </>
        )}
      </Row>
    </Container>
  );
};

export default Recommendation;
