import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Form, Modal, Badge } from 'react-bootstrap';
import { Award, Plus, ExternalLink, Calendar, GraduationCap, Building, } from 'lucide-react';
import "./Qualifications.css";
import useFetch from '../../hooks/useFetch';
import { useAuth } from '../../hooks/useAuth';

const Qualifications = () => {
    const { user } = useAuth()
    const [showAddModal, setShowAddModal] = useState(false);
    const [qualifications, setQualifications] = useState([]);
    const { get: getQualifications } = useFetch()

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (user) {
                    const qualificationData = await getQualifications(`http://localhost:8080/api/qualification/my-list/${user?.username}`)
                    setQualifications(qualificationData)
                }
            } catch (error) {
                console.error("Fetch error in Qualifications:", err);
            }
        }
        fetchData()
    }, [user, getQualifications])

    const [newQualification, setNewQualification] = useState({
        link: '',
        name: '',
        year: '',
        degree: '',
        institution: ''
    });
    const [editingQualification, setEditingQualification] = useState(null);

    const handleAddQualification = () => {
        if (newQualification.name && newQualification.year && newQualification.degree && newQualification.institution) {
            setQualifications([
                ...qualifications,
                {
                    id: Date.now(),
                    ...newQualification
                }
            ]);
            setNewQualification({
                link: '',
                name: '',
                year: '',
                degree: '',
                institution: ''
            });
            setShowAddModal(false);
        }
    };

    const handleEditQualification = (qualification) => {
        setEditingQualification(qualification);
        setShowAddModal(true);
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setEditingQualification(null);
    };

    const getDegreeColor = (degree) => {
        switch (degree.toLowerCase()) {
            case 'certification':
                return 'success';
            case "master's degree":
                return 'primary';
            case "bachelor's degree":
                return 'info';
            case 'doctorate':
                return 'warning';
            default:
                return 'secondary';
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            {/* Main Content */}
            <Card className="shadow-sm border-0">
                <Card.Body className="p-4">
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <h4 className="fw-bold text-dark mb-0">Consultant Qualifications</h4>
                        <Button
                            variant="primary"
                            className="d-flex align-items-center"
                            onClick={() => setShowAddModal(true)}
                        >
                            <Plus size={18} className="me-2" />
                            Add Qualification
                        </Button>
                    </div>

                    {/* Qualifications List */}
                    <div className="qualifications-section">
                        {qualifications.map((qualification, index) => (
                            <Card key={qualification.qualificationID} className="mb-4 border-0 shadow-sm">
                                <Card.Body className="p-4">
                                    <div className="d-flex align-items-start justify-content-between mb-3">
                                        <div className="d-flex align-items-center">
                                            <div className="icon-gradient-primary p-2 rounded-3 text-white me-3">
                                                <Award size={20} />
                                            </div>
                                            <div>
                                                <h6 className="fw-bold text-dark mb-1">Qualification #{index + 1}</h6>
                                                <Badge bg={getDegreeColor(qualification.degree)} className="px-2 py-1">
                                                    {qualification.degree}
                                                </Badge>
                                            </div>
                                        </div>
                                        {qualification.link && (
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                href={qualification.link}
                                                target="_blank"
                                                className="d-flex align-items-center"
                                            >
                                                <ExternalLink size={14} className="me-1" />
                                                View
                                            </Button>
                                        )}
                                    </div>

                                    <Row className="g-3">
                                        <Col md={6}>
                                            <div className="qualification-field">
                                                <label className="text-muted small fw-medium mb-1 d-flex align-items-center">
                                                    <Award size={14} className="me-1" />
                                                    Name
                                                </label>
                                                <p className="fw-semibold text-dark mb-0">{qualification.description}</p>
                                            </div>
                                        </Col>
                                        <Col md={3}>
                                            <div className="qualification-field">
                                                <label className="text-muted small fw-medium mb-1 d-flex align-items-center">
                                                    <Calendar size={14} className="me-1" />
                                                    Year
                                                </label>
                                                <p className="fw-semibold text-dark mb-0">{qualification.year}</p>
                                            </div>
                                        </Col>
                                        <Col md={3}>
                                            <div className="qualification-field">
                                                <label className="text-muted small fw-medium mb-1 d-flex align-items-center">
                                                    <GraduationCap size={14} className="me-1" />
                                                    Degree
                                                </label>
                                                <p className="fw-semibold text-dark mb-0">{qualification.degree}</p>
                                            </div>
                                        </Col>
                                        <Col md={12}>
                                            <div className="qualification-field">
                                                <label className="text-muted small fw-medium mb-1 d-flex align-items-center">
                                                    <Building size={14} className="me-1" />
                                                    Institution
                                                </label>
                                                <p className="fw-semibold text-dark mb-0">{qualification.institution}</p>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        ))}
                    </div>
                </Card.Body>
            </Card>

            {/* Add Qualification Modal */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
                <Modal.Header closeButton className="modal-header-custom">
                    <Modal.Title>
                        {editingQualification ? 'Edit Qualification' : 'Add New Qualification'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Title *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="e.g., Doctor of Psychology"
                                        defaultValue={editingQualification?.title || ''}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Degree Level *</Form.Label>
                                    <Form.Select defaultValue={editingQualification?.degree || ''}>
                                        <option value="">Select degree level</option>
                                        <option value="DOCTORAL">Doctoral</option>
                                        <option value="MASTER">Master's</option>
                                        <option value="BACHELOR">Bachelor's</option>
                                        <option value="ASSOCIATE">Associate</option>
                                        <option value="CERTIFICATION">Certification</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Institution *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="e.g., Stanford University"
                                        defaultValue={editingQualification?.institution || ''}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Location</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="e.g., Stanford, CA"
                                        defaultValue={editingQualification?.location || ''}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Year Obtained *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="e.g., 2018"
                                        defaultValue={editingQualification?.year || ''}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Credential ID</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="e.g., PSY-2018-4521"
                                        defaultValue={editingQualification?.credentialId || ''}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Brief description of the qualification..."
                                defaultValue={editingQualification?.description || ''}
                            />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Certificate Image URL</Form.Label>
                                    <Form.Control
                                        type="url"
                                        placeholder="https://example.com/certificate.jpg"
                                        defaultValue={editingQualification?.imageUrl || ''}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Expiry Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        defaultValue={editingQualification?.expiryDate !== 'Lifetime' ? editingQualification?.expiryDate : ''}
                                    />
                                    <Form.Text className="text-muted">
                                        Leave empty if the qualification doesn't expire
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Cancel
                    </Button>
                    <Button variant="primary" className="btn-custom btn-primary-custom">
                        {editingQualification ? 'Update Qualification' : 'Add Qualification'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Qualifications;