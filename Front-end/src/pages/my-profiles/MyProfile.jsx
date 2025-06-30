import { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { User, Home, BarChart2, Users, Info, ChevronRight, ArrowLeft } from "lucide-react";
import "./MyProfile.css";
import AccountOverview from "../../components/member/AccountOverview";
import UserDetails from "../../components/member/UserDetails";
import FamilyInformation from "../../components/member/FamilyInformation";
import Reports from "../../components/member/Reports";
import { useTranslation } from "react-i18next"; // Import useTranslation

const MyProfile = () => {
  const { t } = useTranslation("myProfile"); // Khai báo useTranslation

  const [activeSection, setActiveSection] = useState("account-overview");

  const navigationItems = [
    {
      id: "account-overview",
      label: t("navigation.accountOverview"),
      icon: <Info size={18} className="me-2" />,
    },
    {
      id: "user-details",
      label: t("navigation.userDetails"),
      icon: <User size={18} className="me-2" />,
    },
    {
      id: "family-information",
      label: t("navigation.familyInformation"),
      icon: <Users size={18} className="me-2" />,
    },
    {
      id: "reports",
      label: t("navigation.reports"),
      icon: <BarChart2 size={18} className="me-2" />,
    },
    {
      id: "back-home",
      label: t("navigation.backHome"),
      icon: <Home size={18} className="me-2" />,
      link: "/",
    },
  ];

  const renderAccountOverview = () => <AccountOverview />;

  const renderUserDetails = () => <UserDetails />;

  const renderFamilyInformation = () => <FamilyInformation />;

  const renderReports = () => <Reports />;

  const renderContent = () => {
    switch (activeSection) {
      case "account-overview":
        return renderAccountOverview();
      case "user-details":
        return renderUserDetails();
      case "family-information":
        return renderFamilyInformation();
      case "reports":
        return renderReports();
      default:
        return renderAccountOverview();
    }
  };

  return (
    <div className="profile-page">
      <Container className="py-5">
        <h1 className="profile-page-title mb-4">{t("accountCenterTitle")}</h1>
        <Row>
          {/* Left Sidebar Navigation */}
          <Col lg={3} md={4} className="mb-4">
            <div className="profile-sidebar">
              {navigationItems.map((item) => (
                <div
                  key={item.id}
                  className={`sidebar-nav-item d-flex align-items-center ${
                    activeSection === item.id ? "active" : ""
                  }`}
                  onClick={() =>
                    item.link ? (window.location.href = item.link) : setActiveSection(item.id)
                  }
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
  );
};

export default MyProfile;