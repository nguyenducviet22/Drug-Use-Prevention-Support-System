import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { Mail, Lock, Eye, EyeOff, CheckCircle, ArrowLeft, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ForgotResetPassword.css';
import useFetch from '../../hooks/useFetch';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import BackButton from '../../components/BackButton';

const ForgotResetPassword = () => {
    const { t } = useTranslation('forgotResetPassword'); // Initialize useTranslation

    const navigate = useNavigate();
    const [step, setStep] = useState('email'); // Current step: 'email', 'otp', or 'reset'
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        otp: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [apiError, setApiError] = useState('');
    const { post } = useFetch();
    const [expectedOtp, setExpectedOtp] = useState('');

    const validateEmailFormat = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateOTPFormat = (otp) => {
        return /^\d{6}$/.test(otp);
    };

    const validatePasswordFormat = (password) => {
        // Password must be at least 8 characters with uppercase, lowercase, number, and special character
        return password.length >= 8 && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
        if (apiError) {
            setApiError('');
        }
        if (successMessage) {
            setSuccessMessage('');
        }
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setApiError('');
        setSuccessMessage('');

        let currentErrors = {};
        if (!formData.username.trim()) {
            currentErrors.username = t('emailStep.validation.usernameRequired');
        }
        if (!validateEmailFormat(formData.email)) {
            currentErrors.email = t('emailStep.validation.invalidEmail');
        }

        if (Object.keys(currentErrors).length > 0) {
            setErrors(currentErrors);
            return;
        }

        setIsLoading(true);
        try {
            const apiResponse = await post({ email: formData.email }, {}, "http://localhost:8080/api/password/forgot");
            console.log('API Response from useFetch:', apiResponse);

            if (apiResponse) {
                setExpectedOtp(apiResponse.otp);
                setSuccessMessage(t('emailStep.toast.otpSent'));
                setStep('otp');
            } else {
                setApiError(apiResponse.message || t('emailStep.toast.sendOtpFailed'));
            }
        } catch (error) {
            setApiError(error.message || t('emailStep.toast.unexpectedError'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleOTPSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setApiError('');
        setSuccessMessage('');

        if (!validateOTPFormat(formData.otp)) {
            setErrors({ otp: t('otpStep.validation.invalidOtpFormat') });
            return;
        }

        if (formData.otp === expectedOtp) {
            setSuccessMessage(t('otpStep.toast.otpSuccess'));
            setStep('reset');
        } else {
            setErrors({ otp: t('otpStep.validation.invalidOtp') });
            setApiError(t('otpStep.toast.invalidOtpCheck'));
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setErrors({});
        setApiError('');
        setSuccessMessage('');

        let currentErrors = {};
        if (!validatePasswordFormat(formData.newPassword)) {
            currentErrors.newPassword = t('resetStep.validation.passwordRequirements');
        }
        if (formData.newPassword !== formData.confirmPassword) {
            currentErrors.confirmPassword = t('resetStep.validation.passwordsMismatch');
        }

        if (Object.keys(currentErrors).length > 0) {
            setErrors(currentErrors);
            return;
        }

        setIsLoading(true);
        try {
            const resetRequest = {
                email: formData.email,
                username: formData.username,
                otp: formData.otp,
                newPassword: formData.newPassword,
                confirm: formData.confirmPassword
            };
            const response = await post(resetRequest, {}, "http://localhost:8080/api/password/reset");

            // Assuming useFetch handles non-2xx responses by throwing an error
            // If response is null or undefined, it means the fetch might have failed before getting a proper response
            if (!response) {
                throw new Error(t('resetStep.toast.resetFailed'));
            }

            setSuccessMessage(t('resetStep.toast.resetSuccess'));
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            // Check if error.response.data.message exists for specific backend errors
            setApiError(error.response?.data?.message || error.message || t('resetStep.toast.unexpectedError'));
        } finally {
            setIsLoading(false);
        }
    };

    const goBack = () => {
        setErrors({});
        setApiError('');
        setSuccessMessage('');
        if (step === 'otp') {
            setStep('email');
            setFormData(prev => ({ ...prev, otp: '' }));
            setExpectedOtp('');
        } else if (step === 'reset') {
            setStep('otp');
            setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
        } else {
            navigate('/login');
        }
    };

    const renderEmailStep = () => (
        <Card className="border-0 shadow-lg forgot-password-card">
            <BackButton label={t("backButton")} />
            <Card.Body className="p-5">
                <div className="text-center mb-4">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3 icon-circle">
                        <Mail size={40} className="text-primary" />
                    </div>
                    <h2 className="fw-bold text-dark">{t('emailStep.title')}</h2>
                    <p className="text-muted">{t('emailStep.subtitle')}</p>
                </div>

                <Form onSubmit={handleEmailSubmit}>
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold text-dark">{t('emailStep.usernameLabel')}</Form.Label>
                        <InputGroup>
                            <InputGroup.Text className="bg-light border-end-0 input-group-text-rounded">
                                <User size={20} className="text-muted" />
                            </InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder={t('emailStep.usernamePlaceholder')}
                                value={formData.username}
                                onChange={(e) => handleInputChange('username', e.target.value)}
                                isInvalid={!!errors.username}
                                className="border-start-0 ps-0 form-control-rounded-end form-control-no-shadow"
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.username}
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold text-dark">{t('emailStep.emailLabel')}</Form.Label>
                        <InputGroup>
                            <InputGroup.Text className="bg-light border-end-0 input-group-text-rounded">
                                <Mail size={20} className="text-muted" />
                            </InputGroup.Text>
                            <Form.Control
                                type="email"
                                placeholder={t('emailStep.emailPlaceholder')}
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                isInvalid={!!errors.email}
                                className="border-start-0 ps-0 form-control-rounded-end form-control-no-shadow"
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.email}
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>

                    <Button
                        type="submit"
                        className="w-100 py-3 fw-semibold submit-button"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="d-flex align-items-center justify-content-center">
                                <div className="spinner-border spinner-border-sm me-2" role="status" />
                                {t('emailStep.sendingOtpButtonLoading')}
                            </div>
                        ) : (
                            t('emailStep.sendCodeButton')
                        )}
                    </Button>
                </Form>

                <div className="text-center mt-4">
                    <Button variant="link" className="text-decoration-none p-0 back-button" onClick={goBack}>
                        <ArrowLeft size={16} className="me-2" />
                        {t('emailStep.backToLoginButton')}
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );

    const renderOTPStep = () => (
        <Card className="border-0 shadow-lg forgot-password-card">
            <Card.Body className="p-5">
                <div className="text-center mb-4">
                    <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3 icon-circle">
                        <CheckCircle size={40} className="text-success" />
                    </div>
                    <h2 className="fw-bold text-dark">{t('otpStep.title')}</h2>
                    <p className="text-muted">{t('otpStep.subtitle', { email: formData.email })}</p>
                </div>

                <Form onSubmit={handleOTPSubmit}>
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold text-dark">{t('otpStep.otpLabel')}</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder={t('otpStep.otpPlaceholder')}
                            value={formData.otp}
                            onChange={(e) => handleInputChange('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
                            isInvalid={!!errors.otp}
                            className="text-center fs-4 py-3 otp-input"
                            maxLength={6}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.otp}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Button
                        type="submit"
                        className="w-100 py-3 fw-semibold submit-button"
                        disabled={isLoading}
                    >
                        {t('otpStep.continueButton')}
                    </Button>
                </Form>

                <div className="text-center mt-4">
                    <Button variant="link" className="text-decoration-none p-0 back-button" onClick={goBack}>
                        <ArrowLeft size={16} className="me-2" />
                        {t('otpStep.changeEmailButton')}
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );

    const renderResetStep = () => (
        <Card className="border-0 shadow-lg forgot-password-card">
            <Card.Body className="p-5">
                <div className="text-center mb-4">
                    <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3 icon-circle">
                        <Lock size={40} className="text-warning" />
                    </div>
                    <h2 className="fw-bold text-dark">{t('resetStep.title')}</h2>
                    <p className="text-muted">{t('resetStep.subtitle')}</p>
                </div>

                <Form onSubmit={handlePasswordReset}>
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold text-dark">{t('resetStep.newPasswordLabel')}</Form.Label>
                        <InputGroup>
                            <Form.Control
                                type={showPassword ? 'text' : 'password'}
                                placeholder={t('resetStep.newPasswordPlaceholder')}
                                value={formData.newPassword}
                                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                                isInvalid={!!errors.newPassword}
                                className="form-control-rounded-start form-control-no-shadow"
                            />
                            <InputGroup.Text
                                className="bg-light password-toggle-button"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </InputGroup.Text>
                            <Form.Control.Feedback type="invalid">
                                {errors.newPassword}
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold text-dark">{t('resetStep.confirmPasswordLabel')}</Form.Label>
                        <InputGroup>
                            <Form.Control
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder={t('resetStep.confirmPasswordPlaceholder')}
                                value={formData.confirmPassword}
                                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                isInvalid={!!errors.confirmPassword}
                                className="form-control-rounded-start form-control-no-shadow"
                            />
                            <InputGroup.Text
                                className="bg-light password-toggle-button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </InputGroup.Text>
                            <Form.Control.Feedback type="invalid">
                                {errors.confirmPassword}
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>

                    <Button
                        type="submit"
                        className="w-100 py-3 fw-semibold submit-button"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="d-flex align-items-center justify-content-center">
                                <div className="spinner-border spinner-border-sm me-2" role="status" />
                                {t('resetStep.resettingPasswordButtonLoading')}
                            </div>
                        ) : (
                            t('resetStep.resetPasswordButton')
                        )}
                    </Button>
                </Form>

                <div className="text-center mt-4">
                    <Button variant="link" className="text-decoration-none p-0 back-button" onClick={goBack}>
                        <ArrowLeft size={16} className="me-2" />
                        {t('resetStep.backToOtpButton')}
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );

    return (
        <div className="min-vh-100 py-5 d-flex align-items-center justify-content-center app-background">
            <Container>
                <Row className="justify-content-center">
                    <Col md={6} lg={5}>
                        {apiError && (
                            <Alert variant="danger" className="mb-4 border-0 shadow-sm alert-message">
                                <div className="d-flex align-items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-exclamation-triangle-fill me-2" viewBox="0 0 16 16">
                                        <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.989.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                                    </svg>
                                    {apiError}
                                </div>
                            </Alert>
                        )}
                        {successMessage && (
                            <Alert variant="success" className="mb-4 border-0 shadow-sm alert-message">
                                <div className="d-flex align-items-center">
                                    <CheckCircle size={20} className="me-2" />
                                    {successMessage}
                                </div>
                            </Alert>
                        )}

                        {step === 'email' && renderEmailStep()}
                        {step === 'otp' && renderOTPStep()}
                        {step === 'reset' && renderResetStep()}
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ForgotResetPassword;