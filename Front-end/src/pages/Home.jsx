import { useState } from "react"
import { Container, Button } from "react-bootstrap"
import { useAuth } from "../hooks/useAuth"
import HomeMe from "../components/HomeMe"
import HomeExplore from "../components/HomeExplore"
import "./Home.css"
import { MessageCircle } from "lucide-react"

const Home = () => {
  const { isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState("explore")

  const handleChatClick = () => {
    // Handle chat/support functionality
    console.log("Chat button clicked")
    // You can integrate with a chat service like Intercom, Zendesk, etc.
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <Container className="my-4">
        <div className="hero-section rounded-4 p-5 text-center text-white position-relative overflow-hidden">
          <div className="hero-content">
            <h1 className="display-4 fw-bold mb-3">Welcome to ReNewMe</h1>
            <p className="lead mb-4">Drug Use Prevention Support System - Protect yourself, protect the community</p>
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
              className="px-5 tab-button"
              onClick={() => setActiveTab("me")}
            >
              Me
            </Button>
            <Button
              variant={activeTab === "explore" ? "primary" : "outline-secondary"}
              size="lg"
              className="px-5 tab-button"
              onClick={() => setActiveTab("explore")}
            >
              EXPLORE
            </Button>
          </div>
        </Container>
      ) : (
        /* Single Explore Button and Small Test for Non-Members */
        <>
          <Container className="text-center mb-4">
            <p className="text-muted mb-3">Take if you're new</p>
            <Button variant="dark" size="lg" className="px-4 mb-4">
              Small Test
            </Button>
          </Container>

          {/* Explore Section Header for Non-Members */}
          <Container className="mb-5">
            <div className="text-center mb-4">
              <h2 className="fw-bold text-dark">EXPLORE NOW</h2>
              <div className="explore-underline mx-auto"></div>
            </div>
          </Container>
        </>
      )}

      {/* Content Based on Active Tab */}
      {isAuthenticated ? activeTab === "me" ? <HomeMe /> : <HomeExplore /> : <HomeExplore />}

      {/* Floating Chat Button for Non-logged-in Users */}
      {!isAuthenticated && (
        <div className="floating-chat-button" onClick={handleChatClick}>
          <Button variant="primary" className="chat-button" size="lg" aria-label="Open chat support">
            <MessageCircle size={24} />
          </Button>
        </div>
      )}
    </div>
  )
}

export default Home
