import { useState } from "react"
import { Row, Col, Card, Button } from "react-bootstrap"
import { Eye, EyeOff } from "lucide-react"
import { useAuth } from "../../hooks/useAuth"
import "./AccountOverview.css"
import { useTranslation } from "react-i18next" // Import useTranslation

const AccountOverview = () => {
  const { t } = useTranslation("accountOverview") // Khai báo useTranslation

  const { user } = useAuth();
  console.log(user);
  const [showPassword, setShowPassword] = useState(false);

  const userData = {
    username: user?.username,
    email: user?.email,
    phoneNumber: user?.phoneNumber,
    role: user?.role,
    password: "************",
  }
  console.log(userData);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleChangePassword = () => {
    console.log("Change password clicked")
    // Implement password change functionality
  }

  const handleLinkGoogle = () => {
    console.log("Link Google account clicked")
    // Implement Google account linking
  }

  return (
    <div className="account-overview">
      {/* Personal Information Section */}
      <Card className="mb-4 account-card">
        <Card.Header className="bg-white">
          <h5 className="mb-0">{t("personalInformation.header")}</h5>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={3} className="account-label">
              {t("personalInformation.username")}
            </Col>
            <Col md={9} className="account-value">
              {userData.username}
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={3} className="account-label">
              {t("personalInformation.email")}
            </Col>
            <Col md={9} className="account-value">
              {userData.email}
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={3} className="account-label">
              {t("personalInformation.phoneNumber")}
            </Col>
            <Col md={9} className="account-value">
              {userData.phoneNumber}
            </Col>
          </Row>
          <Row>
            <Col md={3} className="account-label">
              {t("personalInformation.role")}
            </Col>
            <Col md={9} className="account-value">
              {userData.role}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Password and Security Section */}
      <Card className="mb-4 account-card">
        <Card.Header className="bg-white">
          <h5 className="mb-0">{t("passwordSecurity.header")}</h5>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3 align-items-center">
            <Col md={3} className="account-label">
              {t("passwordSecurity.password")}
            </Col>
            <Col md={9} className="account-value position-relative">
              <div className="password-field d-flex align-items-center">
                <span className="me-2">{showPassword ? t("passwordSecurity.secretPhrase") : userData.password}</span>
                <Button variant="link" className="p-0 text-muted password-toggle" onClick={togglePasswordVisibility}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </div>
            </Col>
          </Row>
          <Button variant="info" size="sm" className="change-password-btn" onClick={handleChangePassword}>
            {t("passwordSecurity.changeButton")}
          </Button>
        </Card.Body>
      </Card>

      {/* Link Account Section */}
      <Card className="account-card">
        <Card.Header className="bg-white">
          <h5 className="mb-0">{t("linkAccount.header")}</h5>
        </Card.Header>
        <Card.Body>
          <Row className="align-items-center">
            <Col xs="auto">
              <div className="google-icon">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </div>
            </Col>
            <Col>
              <span className="text-muted">-</span>
            </Col>
            <Col xs="auto">
              <Button variant="outline-primary" size="sm" onClick={handleLinkGoogle}>
                {t("linkAccount.linkButton")}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  )
}

export default AccountOverview