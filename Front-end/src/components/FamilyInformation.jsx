import { useEffect, useState } from "react"
import { Row, Col, Card, Button } from "react-bootstrap"
import { Users, Plus, Edit, Trash2 } from "lucide-react"
import "./FamilyInformation.css"
import { useAuth } from "../hooks/useAuth"
import useFetch from "../hooks/useFetch"

const FamilyInformation = () => {
  const { user } = useAuth();

  const username = user?.username;
  const { data, error, loading, get } = useFetch(`http://localhost:8080/api/user-details/my-list/${username}`);
  console.log(data);

  const [familyMembers, setFamilyMembers] = useState(data);
  console.log(familyMembers);

  useEffect(() => {
    get();
  }, [get]);

  useEffect(() => {
    if (data) {
      setFamilyMembers(data);
    }
  }, [data]);


  const handleAddMember = () => {
    console.log("Add family member clicked")
    // Implement add family member functionality
  }

  const handleEditMember = (id) => {
    console.log("Edit family member:", id)
    // Implement edit family member functionality
  }

  const handleDeleteMember = (id) => {
    console.log("Delete family member:", id)
    // Implement delete family member functionality
    setFamilyMembers(familyMembers.filter((member) => member.id !== id))
  }

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
    }
    return colors[relationship] || colors.Other
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error.message}</p>;

  return (
    <div className="family-information">
      <Card className="family-card">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Family Information</h5>
          <Button variant="outline-primary" size="sm" onClick={handleAddMember}>
            <Plus size={16} className="me-1" />
            Add Member
          </Button>
        </Card.Header>
        <Card.Body>
          {familyMembers.length === 0 ? (
            <div className="text-center py-5">
              <Users size={48} className="text-muted mb-3" />
              <p className="text-muted">No family members added yet.</p>
              <Button variant="primary" onClick={handleAddMember}>
                <Plus size={16} className="me-1" />
                Add First Family Member
              </Button>
            </div>
          ) : (
            <div className="family-members">
              {familyMembers.map((member, index) => (
                <div key={index} className="family-member-card mb-4">
                  <div className="member-header d-flex justify-content-between align-items-center mb-3">
                    <h6 className="member-title mb-0">Person {index + 1}</h6>
                    <div className="member-actions">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEditMember(member.id)}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDeleteMember(member.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>

                  <Row className="mb-3">
                    <Col md={3} className="family-label">
                      Full Name
                    </Col>
                    <Col md={9} className="family-value">
                      {member.fullName}
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={3} className="family-label">
                      Phone Number
                    </Col>
                    <Col md={9} className="family-value phone-number">
                      {member.phoneNumber}
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={3} className="family-label">
                      Relationship
                    </Col>
                    <Col md={9} className="family-value">
                      <span
                        className="relationship-badge"
                        style={{ backgroundColor: getRelationshipColor(member.relationship) }}
                      >
                        {member.relationship}
                      </span>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={3} className="family-label">
                      Address
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
    </div>
  )
}

export default FamilyInformation
