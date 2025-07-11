import React, { useEffect, useState, useRef } from 'react';
import { Row, Col, Card, Button, Form, Modal, Badge, Alert } from 'react-bootstrap';
import { Award, Plus, ExternalLink, Calendar, GraduationCap, Building, Upload, ImageIcon, Edit, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import "./Qualifications.css";
import useFetch from '../../hooks/useFetch';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import useUpload from '../../hooks/useUpload';

const Qualifications = () => {
    const { t } = useTranslation('qualifications');
    const { user } = useAuth();
    const [showAddEditModal, setShowAddEditModal] = useState(false);
    const [degrees, setDegrees] = useState([]);
    const [qualifications, setQualifications] = useState([]);
    const { imageUrl: uploadedImageUrl, uploading: isUploadingImage, uploadError: imageUploadError, uploadImage, setImageUrl: setUploadedImageUrl } = useUpload();

    const [formData, setFormData] = useState({
        image: null, // Will store File object or URL string
        name: '',
        year: '',
        degree: '',
        institution: ''
    });
    const [editingQualificationId, setEditingQualificationId] = useState(null);

    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const { get, post, put } = useFetch();

    // Fetch data when component mounts or when user changes
    useEffect(() => {
        const fetchData = async () => {
            try {
                const degreesData = await get("http://localhost:8080/api/qualification/degree");
                setDegrees(degreesData);
                if (user?.username) {
                    const qualificationData = await get(`http://localhost:8080/api/qualification/my-list/${user.username}`);
                    if (qualificationData) {
                        setQualifications(qualificationData);
                    }
                }
            } catch (error) {
                console.error("Error fetching qualification data:", error);
                toast.error(t("errors.fetchQualifications"));
            }
        };
        fetchData();
    }, [user, get, t]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Check file size (e.g., 5MB limit)
            const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
            if (file.size > MAX_FILE_SIZE) {
                toast.error(t("errors.fileSizeExceeded"));
                setImagePreview(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = ''; // Clear the file input
                }
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result); // Display image preview immediately
            };
            reader.readAsDataURL(file);
            uploadImage(file); // Call uploadImage from custom hook to handle the upload
        }
    };

    const handleAddQualificationSubmit = async () => {
        if (!formData.name || !formData.year || !formData.degree || !formData.institution) {
            toast.error(t("errors.fillAllFields"));
            return;
        }

        // Use uploadedImageUrl if a new image was uploaded, otherwise it will be null
        const dataToSend = {
            name: formData.name,
            year: formData.year,
            degree: formData.degree,
            institution: formData.institution,
            image: uploadedImageUrl // This will be the URL from successful upload
        };

        try {
            const response = await post(dataToSend, {}, 'http://localhost:8080/api/qualification');
            if (response) {
                setQualifications(prev => [...prev, response]);
                toast.success(t("messages.addSuccess"));
                handleCloseModal();
            }
        } catch (error) {
            console.error("Error adding qualification:", error);
            toast.error(t("errors.addQualification"));
        }
    };

    const handleEditQualification = (qualificationId) => {
        const qualToEdit = qualifications.find(q => q.qualificationID === qualificationId);
        if (qualToEdit) {
            setEditingQualificationId(qualificationId);
            setFormData({
                image: qualToEdit.image, // Keep existing URL for preview and send to backend if no new file
                name: qualToEdit.name,
                year: qualToEdit.year,
                degree: qualToEdit.degree,
                institution: qualToEdit.institution
            });
            setImagePreview(qualToEdit.image);
            setUploadedImageUrl(qualToEdit.image); // Set the uploadedImageUrl for existing image
            setShowAddEditModal(true);
        }
    };

    const handleUpdateQualificationSubmit = async () => {
        if (!editingQualificationId) return;

        if (!formData.name || !formData.year || !formData.degree || !formData.institution) {
            toast.error(t("errors.fillAllFields"));
            return;
        }

        const dataToSend = {
            name: formData.name,
            year: formData.year,
            degree: formData.degree,
            institution: formData.institution,
            image: uploadedImageUrl // This will be the new URL if uploaded, or existing URL
        };

        try {
            const response = await put(dataToSend, {}, `http://localhost:8080/api/qualification/${editingQualificationId}`);
            if (response) {
                setQualifications(prev => prev.map(q => q.qualificationID === editingQualificationId ? response : q));
                toast.success(t("messages.updateSuccess"));
                handleCloseModal();
            }
        } catch (error) {
            console.error("Error updating qualification:", error);
            toast.error(t("errors.updateQualification"));
        }
    };

    const handleDeleteQualification = async (qualificationId) => {
        if (window.confirm(t("confirm.deleteQualification"))) {
            try {
                await put({}, {}, `http://localhost:8080/api/qualification/status/${qualificationId}`);
                setQualifications(prev => prev.filter(q => q.qualificationID !== qualificationId));
                toast.success(t("messages.deleteSuccess"));
            } catch (error) {
                console.error("Error deleting qualification:", error);
                toast.error(t("errors.deleteQualification"));
            }
        }
    };

    const handleCloseModal = () => {
        setShowAddEditModal(false);
        setEditingQualificationId(null);
        setFormData({
            image: null,
            name: '',
            year: '',
            degree: '',
            institution: ''
        });
        setImagePreview(null);
        setUploadedImageUrl(null); // Clear uploaded image URL on close
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const isEditing = editingQualificationId !== null;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            <Card className="shadow-sm border-0">
                <Card.Body className="p-4">
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <h4 className="fw-bold text-dark mb-0">{t("qualificationsTitle")}</h4>
                        <Button
                            variant="primary"
                            className="d-flex align-items-center"
                            onClick={() => {
                                setEditingQualificationId(null);
                                setShowAddEditModal(true);
                                setImagePreview(null);
                                setUploadedImageUrl(null); // Clear uploaded image URL when adding new
                                setFormData({ // Reset form data for new entry
                                    image: null,
                                    name: '',
                                    year: '',
                                    degree: '',
                                    institution: ''
                                });
                            }}
                        >
                            <Plus size={18} className="me-2" />
                            {t("addQualificationButton")}
                        </Button>
                    </div>

                    <div className="qualifications-section">
                        {qualifications.length === 0 ? (
                            <p className="text-muted text-center">{t("noQualificationsAdded")}</p>
                        ) : (
                            qualifications.map((qualification, index) => (
                                <Card key={qualification.qualificationID} className="mb-4 border-0 shadow-sm">
                                    <Card.Body className="p-4">
                                        <div className="d-flex align-items-start justify-content-between mb-3">
                                            <div className="d-flex align-items-center">
                                                <div className="icon-gradient-primary p-2 rounded-3 text-white me-3">
                                                    <Award size={20} />
                                                </div>
                                                <h6 className="fw-bold text-dark mb-1">{t("qualificationNumber", { number: index + 1 })}</h6>
                                            </div>
                                            <div className="member-actions d-flex align-items-center">
                                                {qualification.image && (
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        href={qualification.image}
                                                        target="_blank"
                                                        className="d-flex align-items-center me-2"
                                                    >
                                                        <ExternalLink size={14} className="me-1" />
                                                        {t("viewButton")}
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => handleEditQualification(qualification.qualificationID)}
                                                >
                                                    <Edit size={14} />
                                                </Button>
                                                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteQualification(qualification.qualificationID)}>
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </div>

                                        <Row className="g-3">
                                            <Col md={6}>
                                                <div className="qualification-field">
                                                    <label className="text-muted small fw-medium mb-1 d-flex align-items-center">
                                                        <Award size={14} className="me-1" />
                                                        {t("qualificationName")}
                                                    </label>
                                                    <p className="fw-semibold text-dark mb-0">{qualification.name}</p>
                                                </div>
                                            </Col>
                                            <Col md={3}>
                                                <div className="qualification-field">
                                                    <label className="text-muted small fw-medium mb-1 d-flex align-items-center">
                                                        <Calendar size={14} className="me-1" />
                                                        {t("yearAchieved")}
                                                    </label>
                                                    <p className="fw-semibold text-dark mb-0">{qualification.year}</p>
                                                </div>
                                            </Col>
                                            <Col md={3}>
                                                <div className="qualification-field">
                                                    <label className="text-muted small fw-medium mb-1 d-flex align-items-center">
                                                        <GraduationCap size={14} className="me-1" />
                                                        {t("degreeType")}
                                                    </label>
                                                    <p className="fw-semibold text-dark mb-0">{qualification.degree}</p>
                                                </div>
                                            </Col>
                                            <Col md={12}>
                                                <div className="qualification-field">
                                                    <label className="text-muted small fw-medium mb-1 d-flex align-items-center">
                                                        <Building size={14} className="me-1" />
                                                        {t("institution")}
                                                    </label>
                                                    <p className="fw-semibold text-dark mb-0">{qualification.institution}</p>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            ))
                        )}
                    </div>
                </Card.Body>
            </Card>

            <Modal show={showAddEditModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton className="modal-header-custom">
                    <Modal.Title>
                        {isEditing ? t("editQualificationModalTitle") : t("addQualificationModalTitle")}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className="p-4">
                    <Form>
                        <Row className="mb-4">
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-medium">
                                        {t("form.qualificationName")} <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder={t("form.qualificationNamePlaceholder")}
                                        required
                                        className="border-2"
                                        style={{ borderRadius: '8px' }}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-medium">
                                        {t("form.yearAchieved")} <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="year"
                                        value={formData.year}
                                        onChange={handleInputChange}
                                        placeholder={t("form.yearAchievedPlaceholder")}
                                        required
                                        className="border-2"
                                        style={{ borderRadius: '8px' }}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-4">
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-medium">
                                        {t("form.degreeType")} <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Select
                                        name="degree"
                                        value={formData.degree}
                                        onChange={handleInputChange}
                                        required
                                        className="border-2"
                                        style={{ borderRadius: '8px' }}
                                    >
                                        <option value="">{t("form.selectDegreeType")}</option>
                                        {degrees.map((degree) => (
                                            <option key={degree} value={degree}>
                                                {degree}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-medium">
                                        {t("form.institution")} <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="institution"
                                        value={formData.institution}
                                        onChange={handleInputChange}
                                        placeholder={t("form.institutionPlaceholder")}
                                        required
                                        className="border-2"
                                        style={{ borderRadius: '8px' }}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-4">
                            <Form.Label className="fw-medium">{t("form.certificateImage")}</Form.Label>
                            <div className="form-section-new mb-4">
                                <div
                                    className="image-upload-area-new"
                                    onClick={() => fileInputRef.current?.click()}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            fileInputRef.current?.click();
                                        }
                                    }}
                                >
                                    {(imagePreview || uploadedImageUrl) ? (
                                        <div className="image-preview-new">
                                            <img
                                                src={imagePreview || uploadedImageUrl || "/placeholder.svg"}
                                                alt={t("form.imageUpload.altText")}
                                                className="preview-image-new"
                                            />
                                            <div className="image-overlay-new">
                                                <Upload size={24} />
                                                <span>{t("form.imageUpload.clickToChange")}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="upload-placeholder-new">
                                            <ImageIcon size={48} className="upload-icon-new" />
                                            <span className="upload-text-new">{t("form.imageUpload.clickToUpload")}</span>
                                        </div>
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="d-none"
                                />
                                {isUploadingImage && <Alert variant="info" className="mt-2">{t("form.imageUpload.uploading")}</Alert>}
                                {imageUploadError && <Alert variant="danger" className="mt-2">{t("form.imageUpload.error", { error: imageUploadError })}</Alert>}
                            </div>
                        </Form.Group>
                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        {t("cancelButton")}
                    </Button>
                    <Button
                        variant="primary"
                        className="btn-custom btn-primary-custom"
                        onClick={isEditing ? handleUpdateQualificationSubmit : handleAddQualificationSubmit}
                    >
                        {isEditing ? t("updateQualificationButton") : t("addQualificationButtonModal")}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Qualifications;