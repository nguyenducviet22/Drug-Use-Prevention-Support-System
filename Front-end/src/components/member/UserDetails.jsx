import { Row, Col, Card, Modal, Form, Button } from "react-bootstrap";
import { useAuth } from "../../hooks/useAuth";
import "./UserDetails.css";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import {
  Briefcase,
  Calendar,
  Edit3,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
  Users,
  X,
} from "lucide-react";
import useFetch from "../../hooks/useFetch";
import { format, parseISO } from "date-fns";
import { toast } from "react-toastify";

const UserDetails = () => {
  const { t } = useTranslation("userDetails");
  const { user, fetchUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    gender: "",
    phoneNumber: "",
    email: "", // Added email to formData state
    job: "",
    address: "",
  });
  const [errors, setErrors] = useState({});
  const [genders, setGenders] = useState([]);
  const { get: getGenders } = useFetch();
  const { put: putUserDetails } = useFetch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const gendersData = await getGenders(
          "http://localhost:8080/api/user/gender"
        );
        setGenders(gendersData);
      } catch (error) {
        console.error("Fetch error in UserDetails:", error);
      }
    };
    fetchData();
  }, [getGenders]);

  const handleShowModal = () => {
    setFormData({
      ...user,
      dob: user?.dob || "",
      email: user?.email || "", // Ensure email is initialized
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Regex: chỉ cho chữ cái và khoảng trắng
    const nameJobRegex = /^[A-Za-zÀ-ỹ\s]+$/;

    // Full Name
    if (!formData.fullName.trim()) {
      newErrors.fullName = t("form.validation.fullNameRequired");
    } else if (!nameJobRegex.test(formData.fullName)) {
      newErrors.fullName = t("form.validation.fullNameInvalid");
    }
    // Job
    if (!formData.job.trim()) {
      newErrors.job = t("form.validation.jobTitleRequired");
    } else if (!nameJobRegex.test(formData.job)) {
      newErrors.job = t("form.validation.jobTitleInvalid");
    }

    const phoneRegexList = [
      /^\d{3}-\d{3}-\d{4}$/, // 086-288-6128
      /^\d{3}-\d{4}-\d{4}$/, // 091-2345-6789
    ];

    const isValidPhoneNumber = (number) =>
      phoneRegexList.some((regex) => regex.test(number.trim()));

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = t("form.validation.phoneNumberRequired");
    } else if (!isValidPhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = t("form.validation.phoneNumberInvalidFormat");
    }

    // DOB
    if (!formData.dob) {
      newErrors.dob = t("form.validation.dobRequired");
    } else {
      const dobDate = new Date(formData.dob);
      const today = new Date();
      const age = today.getFullYear() - dobDate.getFullYear();
      const isBeforeBirthday =
        today.getMonth() < dobDate.getMonth() ||
        (today.getMonth() === dobDate.getMonth() &&
          today.getDate() < dobDate.getDate());
      const actualAge = isBeforeBirthday ? age - 1 : age;
      if (actualAge < 6) {
        newErrors.dob = t("form.validation.dobTooYoung");
      }
    }

    // Gender
    if (!formData.gender) {
      newErrors.gender = t("form.validation.genderRequired");
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = t("form.validation.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("form.validation.emailInvalid");
    } else {
      const [localPart, domainPart] = formData.email.split("@");

      if (/[^a-zA-Z0-9._-]/.test(localPart)) {
        newErrors.email = t("form.validation.emailLocalInvalid");
      }

      // Nếu domain là gmail.com, không cho phép ký tự sau .com (vd: abc@gmail.com!#)
      if (
        domainPart?.startsWith("gmail.com") &&
        /[^a-zA-Z0-9.-]/.test(domainPart.replace("gmail.com", ""))
      ) {
        newErrors.email = t("form.validation.emailDomainInvalid");
      }
    }

    // Address
    if (!formData.address.trim()) {
      newErrors.address = t("form.validation.addressRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const dataToSend = {
        ...formData,
        // Ensure dob is null if empty string, otherwise keep existing
        dob: formData.dob || null,
      };

      console.log("Data to send:", dataToSend);
      try {
        const updatedUser = await putUserDetails(
          dataToSend,
          {},
          `http://localhost:8080/api/user/${user?.username}`
        );
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
    email: user?.email, // Added email to userData
    job: user?.job,
    address: user?.address,
  };
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
            {t("editButton")}
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
              {user?.dob ? format(parseISO(user.dob), "yyyy-MM-dd") : ""}
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
              {t("email")}
            </Col>
            <Col md={9} className="details-value">
              {userData.email}
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
            {t("modal.title")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label">
                    <User size={16} />
                    {t("form.fullNameLabel")}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder={t("form.fullNamePlaceholder")}
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
                    {t("form.genderLabel")}
                  </Form.Label>
                  <Form.Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    isInvalid={!!errors.gender}
                  >
                    <option value="">
                      {t("form.selectGenderPlaceholder")}
                    </option>
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
                    {t("form.dateOfBirthLabel")}
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="dob"
                    value={
                      formData.dob
                        ? format(parseISO(formData.dob), "yyyy-MM-dd")
                        : ""
                    }
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
                    {t("form.phoneNumberLabel")}
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder={t("form.phoneNumberPlaceholder")}
                    isInvalid={!!errors.phoneNumber}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.phoneNumber}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            {/* Email Field - Added isInvalid and Feedback */}
            <Form.Group className="mb-3">
              <Form.Label className="form-label">
                <Mail size={16} />
                {t("form.emailLabel")}
              </Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t("form.emailPlaceholder")}
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Job Field - Added isInvalid and Feedback */}
            <Form.Group className="mb-3">
              <Form.Label className="form-label">
                <Briefcase size={16} />
                {t("form.jobLabel")}
              </Form.Label>
              <Form.Control
                type="text"
                name="job"
                value={formData.job}
                onChange={handleChange}
                placeholder={t("form.jobPlaceholder")}
                isInvalid={!!errors.job}
              />
              <Form.Control.Feedback type="invalid">
                {errors.job}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Address Field - Added isInvalid and Feedback */}
            <Form.Group className="mb-3">
              <Form.Label className="form-label">
                <MapPin size={16} />
                {t("form.addressLabel")}
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder={t("form.addressPlaceholder")}
                isInvalid={!!errors.address}
              />
              <Form.Control.Feedback type="invalid">
                {errors.address}
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            <X size={16} className="me-2" />
            {t("modal.cancelButton")}
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            <Save size={16} className="me-2" />
            {t("modal.saveChangesButton")}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserDetails;
