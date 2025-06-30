import { Row, Col, Card } from "react-bootstrap"
import { useAuth } from "../hooks/useAuth"
import "./UserDetails.css"

const UserDetails = () => {
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
          <h5 className="mb-0">User Details</h5>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={3} className="details-label">
              Full Name
            </Col>
            <Col md={9} className="details-value">
              {userData.fullName}
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={3} className="details-label">
              Gender
            </Col>
            <Col md={9} className="details-value">
              {userData.gender}
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={3} className="details-label">
              Date of birth
            </Col>
            <Col md={9} className="details-value">
              {userData.dob}
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={3} className="details-label">
              Phone Number
            </Col>
            <Col md={9} className="details-value">
              {userData.phoneNumber}
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={3} className="details-label">
              Address
            </Col>
            <Col md={9} className="details-value">
              {userData.address}
            </Col>
          </Row>
          <Row>
            <Col md={3} className="details-label">
              Job
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
