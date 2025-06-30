import { Row, Col, Card } from "react-bootstrap"
import { useAuth } from "../../hooks/useAuth"
import "./UserDetails.css"
import { useTranslation } from "react-i18next" // Import useTranslation

const UserDetails = () => {
  const { t } = useTranslation("userDetails") // Initialize useTranslation
  const { user } = useAuth();

  const userData = {
    fullName: user?.fullName,
    dob: user?.dob,
    gender: user?.gender,
    phoneNumber: user?.phoneNumber,
    job: user?.job,
    address: user?.address
  }

  return (
    <div className="user-details">
      <Card className="user-details-card">
        <Card.Header className="bg-white">
          <h5 className="mb-0">{t("title")}</h5>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={3} className="details-label">
              {t("fullName")}
            </Col>
            <Col md={9} className="details-value">
              {userData.fullName}
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={3} className="details-label">
              {t("gender")}
            </Col>
            <Col md={9} className="details-value">
              {userData.gender}
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={3} className="details-label">
              {t("dateOfBirth")}
            </Col>
            <Col md={9} className="details-value">
              {userData.dob}
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={3} className="details-label">
              {t("phoneNumber")}
            </Col>
            <Col md={9} className="details-value">
              {userData.phoneNumber}
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={3} className="details-label">
              {t("address")}
            </Col>
            <Col md={9} className="details-value">
              {userData.address}
            </Col>
          </Row>
          <Row>
            <Col md={3} className="details-label">
              {t("job")}
            </Col>
            <Col md={9} className="details-value">
              {userData.job}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  )
}

export default UserDetails