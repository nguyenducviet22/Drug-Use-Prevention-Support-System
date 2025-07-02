import { useEffect, useState } from "react";
import { Container, Button } from "react-bootstrap";
import { useAuth } from "../../hooks/useAuth";
import HomeMe from "../../components/home/HomeMe";
import HomeExplore from "../../components/home/HomeExplore";
import "./Home.css";
import { MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next"; // Import useTranslation
import useFetch from "../../hooks/useFetch";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("explore");
  const { t } = useTranslation("home"); // Khởi tạo hook useTranslation

  const [assessment, setAssessment] = useState({})
  const { get: getCrafftAssessment } = useFetch()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const assessmentResponse = await getCrafftAssessment("http://localhost:8080/api/assessment/type/CRAFFT")
        setAssessment(assessmentResponse)
      } catch (error) {
        console.error("Fetch error in BlogList:", error);
      }
    }

    fetchData()
  }, [getCrafftAssessment])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/")
      return
    }
    const { scope } = jwtDecode(token)
    console.log(scope);
    if (scope === "MEMBER" || scope === "") navigate("/");
    if (scope === "STAFF") navigate("/staff");
    if (scope === "MANAGER") navigate("/manager");
    if (scope === "CONSULTANT") navigate("/consultant");
  }, [])

  const handleChatClick = () => {
    console.log("Chat button clicked");
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <Container className="my-4">
        <div className="hero-section rounded-4 p-5 text-center text-white position-relative overflow-hidden">
          <div className="hero-content">
            <h1 className="display-4 fw-bold mb-3">{t("heroSection.title")}</h1>
            <p className="lead mb-4">{t("heroSection.subtitle")}</p>
          </div>
        </div>
      </Container>

      {/* Navigation Section */}
      {isAuthenticated ? (
        /* Tab Navigation for Logged-in Members */
        <Container className="text-center mb-5">
          <div className="tab-navigation d-flex justify-content-center gap-3">
            <Button
              variant={activeTab === "me" ? "primary" : "outline-secondary"}
              size="lg"
              className="px-5 tab-nav-button"
              onClick={() => setActiveTab("me")}
            >
              {t("loggedInNavigation.meTab")}
            </Button>
            <Button
              variant={activeTab === "explore" ? "primary" : "outline-secondary"}
              size="lg"
              className="px-5 tab-nav-button"
              onClick={() => setActiveTab("explore")}
            >
              {t("loggedInNavigation.exploreTab")}
            </Button>
          </div>
        </Container>
      ) : (
        /* Single Explore Button and Small Test for Non-Members */
        <>
          <Container className="text-center mb-4">
            <p className="text-muted mb-3">{t("loggedOutSection.smallTestText")}</p>
            <Button variant="dark" size="lg" className="px-4 logged-out-explore-button"
              onClick={() => window.open(assessment.linkTest)}
            >
              {t("loggedOutSection.smallTestButton")}
            </Button>
          </Container>

          {/* Explore Section Header for Non-Members */}
          <Container className="mb-5">
            <div className="text-center mb-4">
              <h2 className="fw-bold text-dark">{t("loggedOutSection.exploreNowTitle")}</h2>
              <div className="explore-section-underline mx-auto"></div>
            </div>
          </Container>
        </>
      )}

      {/* Content Based on Active Tab */}
      {isAuthenticated ? activeTab === "me" ? <HomeMe /> : <HomeExplore /> : <HomeExplore />}

      {/* Floating Chat Button for Non-logged-in Users */}
      {!isAuthenticated && (
        <div className="floating-chat-container" onClick={handleChatClick}>
          <Button
            variant="primary"
            className="chat-float-button"
            size="lg"
            aria-label={t("chatButton.ariaLabel")}
          >
            <MessageCircle size={24} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Home;