import { useEffect, useState } from "react";
import { Row, Col, Card, Button, Modal, Form } from "react-bootstrap";
import { Users, Plus, Edit, Trash2 } from "lucide-react";
import "./FamilyInformation.css";
import { useAuth } from "../../hooks/useAuth";
import useFetch from "../../hooks/useFetch";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const FamilyInformation = () => {
  const { t } = useTranslation("familyInformation");
  const { user } = useAuth();
  const { error, loading, get, post, put } = useFetch();
  const [familyMembers, setFamilyMembers] = useState([]);

  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    relationship: "",
    address: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user) {
          const familyMembersData = await get(
            `http://localhost:8080/api/user-details/my-list/${user?.username}`
          );
          if (familyMembersData) {
            setFamilyMembers(familyMembersData);
          }
        }
      } catch (error) {
        console.error("Fetch error in FamilyInfomation:", error);
        toast.error(t("errorMessage", { message: error.message }));
      }
    };
    fetchData();
  }, [user, get, t]);
  console.log(familyMembers);

  // Handle input changes in the form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Open Modal for adding a new member
  const handleAddMember = () => {
    setEditingMemberId(null); // Set to null to indicate new addition
    setFormData({
      fullName: "",
      phoneNumber: "",
      relationship: "",
      address: "",
    }); // Reset form
    setShowAddEditModal(true);
  };

  // Open Modal for editing a member
  const handleEditMember = (detailID) => {
    const memberToEdit = familyMembers.find((member) => member.detailID === detailID);
    if (memberToEdit) {
      setEditingMemberId(detailID);
      setFormData({
        fullName: memberToEdit.fullName,
        phoneNumber: memberToEdit.phoneNumber,
        relationship: memberToEdit.relationship,
        address: memberToEdit.address,
      });
      setShowAddEditModal(true);
    }
  };

  // Handle form submission (add new or update)
  const handleSubmit = async () => {
    if (
      !formData.fullName ||
      !formData.phoneNumber ||
      !formData.relationship ||
      !formData.address
    ) {
      toast.error(t("form.validation.allFieldsRequired"));
      return;
    }

    try {
      if (editingMemberId) {
        // Update member
        const response = await put(formData, {}, `http://localhost:8080/api/user-details/${editingMemberId}`);
        if (response) {
          setFamilyMembers((prev) =>
            prev.map((member) =>
              member.detailID === editingMemberId ? response : member // Changed from member.id to member.detailID
            )
          );
          toast.success(t("form.success.memberUpdated"));
        }
      } else {
        // Add new member
        const dataToSend = { ...formData, username: user?.username }; // Include username
        const response = await post(dataToSend, {}, "http://localhost:8080/api/user-details");
        if (response) {
          setFamilyMembers((prev) => [...prev, response]);
          toast.success(t("form.success.memberAdded"));
        }
      }
      handleCloseModal(); // Close modal on success
    } catch (apiError) {
      console.error("API Error:", apiError);
      toast.error(
        t("form.error.submitFailed", { message: apiError.message })
      );
    }
  };

  // Handle deleting a member
  const handleDeleteMember = async (detailID) => {
    if (window.confirm(t("deleteConfirm"))) {
      try {
        // Assuming this PUT endpoint deactivates or "soft-deletes" the user detail
        await put({}, {}, `http://localhost:8080/api/user-details/status/${detailID}`);
        setFamilyMembers((prev) => prev.filter((member) => member.detailID !== detailID));
        toast.success(t("form.success.memberDeleted"));
      } catch (apiError) {
        console.error("API Error:", apiError);
        toast.error(
          t("form.error.deleteFailed", { message: apiError.message })
        );
      }
    }
  };

  // Close Modal and reset state
  const handleCloseModal = () => {
    setShowAddEditModal(false);
    setEditingMemberId(null);
    setFormData({
      fullName: "",
      phoneNumber: "",
      relationship: "",
      address: "",
    });
  };

  const getRelationshipColor = (relationship) => {
    const colors = {
      Father: "#2196f3",
      Mother: "#e91e63",
      Brother: "#4caf50",
      Sister: "#ff9800",
      Son: "#9c27b0",
      Daughter: "#f44336",
      Spouse: "#795548",
      Other: "#607d8b",
    };
    return colors[relationship] || colors.Other;
  };

  if (loading) return <p>{t("loadingMessage")}</p>;
  if (error)
    return <p style={{ color: "red" }}>{t("errorMessage", { message: error.message })}</p>;

  return (
    <div className="family-information">
      <Card className="family-card">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">{t("header")}</h5>
          <Button variant="outline-primary" size="sm" onClick={handleAddMember}>
            <Plus size={16} className="me-1" />
            {t("addMemberButton")}
          </Button>
        </Card.Header>

        <Card.Body>
          {familyMembers.length === 0 ? (
            <div className="text-center py-5">
              <Users size={48} className="text-muted mb-3" />
              <p className="text-muted">{t("noMembersAddedTitle")}</p>
            </div>
          ) : (
            <div className="family-members">
              {familyMembers.map((member, index) => (
                <div key={member.detailID} className="family-member-card mb-4">
                  {" "}
                  {/* Using member.detailID as key */}
                  <div className="member-header d-flex justify-content-between align-items-center mb-3">
                    <h6 className="member-title mb-0">
                      {t("memberTitle", { index: index + 1 })}
                    </h6>
                    <div className="member-actions">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEditMember(member.detailID)}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteMember(member.detailID)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>

                  <Row className="mb-3">
                    <Col md={3} className="family-label">
                      {t("labels.fullName")}
                    </Col>
                    <Col md={9} className="family-value">
                      {member.fullName}
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={3} className="family-label">
                      {t("labels.phoneNumber")}
                    </Col>
                    <Col md={9} className="family-value phone-number">
                      {member.phoneNumber}
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={3} className="family-label">
                      {t("labels.relationship")}
                    </Col>
                    <Col md={9} className="family-value">
                      <span
                        className="relationship-badge"
                        style={{
                          backgroundColor: getRelationshipColor(
                            member.relationship
                          ),
                        }}
                      >
                        {t(`relationships.${member.relationship}`)}
                      </span>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={3} className="family-label">
                      {t("labels.address")}
                    </Col>
                    <Col md={9} className="family-value address">
                      {member.address}
                    </Col>
                  </Row>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Family Member Modal */}
      <Modal show={showAddEditModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingMemberId
              ? t("modal.editMemberTitle")
              : t("modal.addMemberTitle")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formFullName">
              <Form.Label>{t("form.fullNameLabel")}</Form.Label>
              <Form.Control
                type="text"
                placeholder={t("form.fullNamePlaceholder")}
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPhoneNumber">
              <Form.Label>{t("form.phoneNumberLabel")}</Form.Label>
              <Form.Control
                type="text"
                placeholder={t("form.phoneNumberPlaceholder")}
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formRelationship">
              <Form.Label>{t("form.relationshipLabel")}</Form.Label>
              <Form.Select
                name="relationship"
                value={formData.relationship}
                onChange={handleInputChange}
                required
              >
                <option value="">{t("form.selectRelationshipPlaceholder")}</option>
                <option value="Father">{t("relationships.Father")}</option>
                <option value="Mother">{t("relationships.Mother")}</option>
                <option value="Brother">{t("relationships.Brother")}</option>
                <option value="Sister">{t("relationships.Sister")}</option>
                <option value="Son">{t("relationships.Son")}</option>
                <option value="Daughter">{t("relationships.Daughter")}</option>
                <option value="Spouse">{t("relationships.Spouse")}</option>
                <option value="Other">{t("relationships.Other")}</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formAddress">
              <Form.Label>{t("form.addressLabel")}</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder={t("form.addressPlaceholder")}
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            {t("modal.cancelButton")}
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {editingMemberId
              ? t("modal.saveChangesButton")
              : t("modal.addMemberButton")}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FamilyInformation;