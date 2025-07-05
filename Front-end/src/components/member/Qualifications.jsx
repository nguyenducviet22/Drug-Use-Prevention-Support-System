import React, { useEffect, useState, useRef } from 'react';
import { Row, Col, Card, Button, Form, Modal, Badge } from 'react-bootstrap';
import { Award, Plus, ExternalLink, Calendar, GraduationCap, Building, Upload, ImageIcon, Edit, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import "./Qualifications.css";
import useFetch from '../../hooks/useFetch';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const Qualifications = () => {
    const { t } = useTranslation('qualifications'); // Specify the namespace
    const { user } = useAuth();
    const [showAddEditModal, setShowAddEditModal] = useState(false);
    const [degrees, setDegrees] = useState([]);
    const [qualifications, setQualifications] = useState([]);
    const [dragActive, setDragActive] = useState(false);

    const [formData, setFormData] = useState({
        link: null, // Will store File object or URL string
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

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error(t("errors.fileSizeExceeded"));
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                setImagePreview(null);
                setFormData(prev => ({ ...prev, link: null }));
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
                setFormData((prev) => ({
                    ...prev,
                    link: file, // Store the File object
                }));
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
            setFormData(prev => ({ ...prev, link: null }));
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            const event = { target: { files: [file] } };
            handleFileChange(event);
        }
    };

    const handleAddQualificationSubmit = async () => {
        if (!formData.name || !formData.year || !formData.degree || !formData.institution) {
            toast.error(t("errors.fillAllFields"));
            return;
        }

        const dataToSend = new FormData();
        dataToSend.append('name', formData.name);
        dataToSend.append('year', formData.year);
        dataToSend.append('degree', formData.degree);
        dataToSend.append('institution', formData.institution);
        if (formData.link instanceof File) {
            dataToSend.append('img', formData.link); // Append the File object
        } else if (typeof formData.link === 'string' && formData.link !== null) {
             // If it's an existing URL (e.g., during edit without new file upload),
             // you might need to handle this based on your backend.
             // For now, let's assume if it's a string, it means no new file is being uploaded for add.
             // For add, 'link' should usually be a File or null initially.
        }


        try {
            const response = await post(dataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Important for file uploads
                },
            }, 'http://localhost:8080/api/qualification');
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
                link: qualToEdit.link, // Keep existing URL for preview and send to backend if no new file
                name: qualToEdit.name,
                year: qualToEdit.year,
                degree: qualToEdit.degree,
                institution: qualToEdit.institution
            });
            setImagePreview(qualToEdit.link);
            setShowAddEditModal(true);
        }
    };

    const handleUpdateQualificationSubmit = async () => {
        if (!editingQualificationId) return;

        if (!formData.name || !formData.year || !formData.degree || !formData.institution) {
            toast.error(t("errors.fillAllFields"));
            return;
        }

        const dataToSend = new FormData();
        dataToSend.append('name', formData.name);
        dataToSend.append('year', formData.year);
        dataToSend.append('degree', formData.degree);
        dataToSend.append('institution', formData.institution);

        // Handle image: if it's a new File object, append it. Otherwise, keep the existing link (URL string)
        if (formData.link instanceof File) {
            dataToSend.append('img', formData.link); // New file to upload
        } else if (typeof formData.link === 'string' && formData.link !== null) {
            // If it's a string, it's an existing image URL. Your backend might expect this
            // to indicate no change to the image, or you might need to explicitly send it.
            // If your backend handles `multipart/form-data` and knows to keep existing
            // image if 'img' field is not present or is an empty string, then you don't need this.
            // If it expects the URL, you might do:
            // dataToSend.append('img', formData.link);
            // This depends on your backend API for updates.
        }


        try {
            const response = await put(dataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Important for file uploads
                },
            }, `http://localhost:8080/api/qualification/${editingQualificationId}`);
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
            link: null,
            name: '',
            year: '',
            degree: '',
            institution: ''
        });
        setImagePreview(null);
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
                                setFormData({ // Reset form data for new entry
                                    link: null,
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
                                                {qualification.link && (
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        href={qualification.link}
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
                            <div className="form-section-new">
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
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    {imagePreview ? (
                                        <div className="image-preview-new">
                                            <img
                                                src={imagePreview}
                                                alt="Certificate preview"
                                                className="preview-image-new"
                                            />
                                            <div className="image-overlay-new">
                                                <Upload size={24} />
                                                <span>
                                                    {t("form.clickToChange")}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="upload-placeholder-new">
                                            <ImageIcon size={48} className="upload-icon-new" />
                                            <span className="upload-text-new">
                                                {t("form.clickToUpload")}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={handleFileChange}
                                    className="d-none"
                                />
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