import { Row, Col, Card, Modal, Form, Button } from "react-bootstrap"
import { useAuth } from "../../hooks/useAuth"
import "./UserDetails.css"
import { useTranslation } from "react-i18next" // Import useTranslation
import { useEffect, useState } from "react"
import { Briefcase, Calendar, Edit3, MapPin, Phone, Save, User, Users, X } from "lucide-react"
import useFetch from "../../hooks/useFetch"
import { format, parseISO } from 'date-fns'
import { toast } from "react-toastify"

const UserDetails = () => {
  const { t } = useTranslation("userDetails") // Initialize useTranslation
  const { user, fetchUser } = useAuth()
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    gender: '',
    phoneNumber: '',
    job: '',
    address: ''
  });
  const [errors, setErrors] = useState({})
  const [genders, setGenders] = useState([])
  const { get: getGenders } = useFetch()
  const { put: putUserDetails } = useFetch()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const gendersData = await getGenders("http://localhost:8080/api/user/gender")
        setGenders(gendersData)
      } catch (error) {
        console.error("Fetch error in UserDetails:", error);
      }
    }
    fetchData()
  }, [getGenders])

  const handleShowModal = () => {
    setFormData({
      ...user,
      dob: user?.dob || ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }

    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const dataToSend = {
        ...formData,
        dob: formData.dob || null
      };

      console.log("Data to send:", dataToSend);
      try {
        const updatedUser = await putUserDetails(dataToSend, {}, `http://localhost:8080/api/user/${user?.username}`);
        console.log("Update successful:", updatedUser);

        if (updatedUser) {
          await fetchUser();
          toast.success(t("form.alert.success"));
        } else {
          toast.error(t("form.alert.failure"));
        }
        handleCloseModal();
      } catch (error) {
        console.error("Error updating user details:", error);
        toast.error(t("form.alert.failure"));
      }
    }
  };

  const userData = {
    fullName: user?.fullName,
    dob: user?.dob,
    gender: user?.gender,
    phoneNumber: user?.phoneNumber,
    job: user?.job,
    address: user?.address
  }
  console.log(userData);

  return (
    <div className="user-details">
      <Card className="user-details-card">
        <Card.Header className="d-flex justify-content-between align-items-center bg-white">
          <h5 className="mb-0">{t("title")}</h5>
          <Button
            variant="light"
            className="edit-btn text-white"
            onClick={handleShowModal}
          >
            <Edit3 size={16} className="me-2" />
            Edit
          </Button>
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
              {user?.dob ? format(parseISO(user.dob), 'yyyy-MM-dd') : ''}
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
          <Row className="mb-3">
            <Col md={3} className="details-label">
              {t("job")}
            </Col>
            <Col md={9} className="details-value">
              {userData.job}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton className="modal-header">
          <Modal.Title>
            <Edit3 size={20} className="me-2" />
            Edit Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label">
                    <User size={16} />
                    Full Name
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    isInvalid={!!errors.fullName}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.fullName}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label">
                    <Users size={16} />
                    Gender
                  </Form.Label>
                  <Form.Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    isInvalid={!!errors.gender}
                  >
                    <option value="">Select gender</option>
                    {genders.map((gender) => (
                      <option key={gender} value={gender}>
                        {gender}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.gender}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label">
                    <Calendar size={16} />
                    Date of Birth
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="dob"
                    value={formData.dob ? format(parseISO(formData.dob), 'yyyy-MM-dd') : ''}
                    onChange={handleChange}
                    isInvalid={!!errors.dob}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.dob}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label">
                    <Phone size={16} />
                    Phone Number
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    isInvalid={!!errors.phoneNumber}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.phoneNumber}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="form-label">
                <Briefcase size={16} />
                Job
              </Form.Label>
              <Form.Control
                type="text"
                name="job"
                value={formData.job}
                onChange={handleChange}
                placeholder="Enter your job title"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="form-label">
                <MapPin size={16} />
                Address
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your address"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            <X size={16} className="me-2" />
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            <Save size={16} className="me-2" />
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default UserDetails