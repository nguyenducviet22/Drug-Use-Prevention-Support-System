import { useState } from "react"
import { Container, Row, Col } from "react-bootstrap"
import { useAuth } from "../hooks/useAuth"
import { User, Home, BarChart2, Users, Info, ChevronRight, ArrowLeft } from "lucide-react"
import "./MyProfile.css"
import AccountOverview from "../components/AccountOverview"
import UserDetails from "../components/UserDetails"
import FamilyInformation from "../components/FamilyInformation"
import Reports from "../components/Reports"

const MyProfile = () => {
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState("account-overview")

  const navigationItems = [
    {
      id: "account-overview",
      label: "Account Overview",
      icon: <Info size={18} className="me-2" />,
    },
    {
      id: "user-details",
      label: "User Details",
      icon: <User size={18} className="me-2" />,
    },
    {
      id: "family-information",
      label: "Family Information",
      icon: <Users size={18} className="me-2" />,
    },
    {
      id: "reports",
      label: "Reports",
      icon: <BarChart2 size={18} className="me-2" />,
    },
    {
      id: "back-home",
      label: "Back Home",
      icon: <Home size={18} className="me-2" />,
      link: "/",
    },
  ]

  const renderAccountOverview = () => <AccountOverview />

  const renderUserDetails = () => <UserDetails />

  const renderFamilyInformation = () => <FamilyInformation />

  const renderReports = () => <Reports />

  const renderContent = () => {
    switch (activeSection) {
      case "account-overview":
        return renderAccountOverview()
      case "user-details":
        return renderUserDetails()
      case "family-information":
        return renderFamilyInformation()
      case "reports":
        return renderReports()
      default:
        return renderAccountOverview()
    }
  }

  return (
    <div className="profile-page">
      <Container className="py-5">
        <h1 className="account-center-title mb-4">Account Center</h1>
        <Row>
          {/* Left Sidebar Navigation */}
          <Col lg={3} md={4} className="mb-4">
            <div className="profile-sidebar">
              {navigationItems.map((item) => (
                <div
                  key={item.id}
                  className={`sidebar-item d-flex align-items-center ${
                    activeSection === item.id ? "active" : ""
                  }`}
                  onClick={() => (item.link ? (window.location.href = item.link) : setActiveSection(item.id))}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {!item.link && <ChevronRight size={16} className="ms-auto" />}
                  {item.link && <ArrowLeft size={16} className="ms-auto" />}
                </div>
              ))}
            </div>
          </Col>

          {/* Right Content Area */}
          <Col lg={9} md={8}>
            {renderContent()}
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default MyProfile
