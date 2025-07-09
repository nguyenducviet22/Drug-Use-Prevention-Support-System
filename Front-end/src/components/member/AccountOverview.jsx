import { useState } from "react"
import { Row, Col, Card, Button } from "react-bootstrap"
import { Eye, EyeOff } from "lucide-react"
import { useAuth } from "../../hooks/useAuth"
import "./AccountOverview.css"
import { useTranslation } from "react-i18next" // Import useTranslation
import { useNavigate } from "react-router-dom"

const AccountOverview = () => {
  const { t } = useTranslation("accountOverview") // Khai báo useTranslation

  const { user } = useAuth();
  const navigate = useNavigate()
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
    navigate('/forgot-password')
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
    </div>
  )
}

export default AccountOverview