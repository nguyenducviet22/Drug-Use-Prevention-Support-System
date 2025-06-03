import { useState } from "react"
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap"
import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import useLogin from '../hooks/useLogin';
import "./Login.css"
import { useAuth } from "../hooks/useAuth"

export default function Login() {

    // const { login } = useLogin();
    const { login, register, authLoading, error } = useAuth();

    const API_GOOGLE_LOGIN_URL = 'http://localhost:8080/oauth2/authorization/google';

    const [activeTab, setActiveTab] = useState("login")
    const [loginData, setLoginData] = useState({
        username: "",
        password: "",
        rememberMe: false,
    })
    const [registerData, setRegisterData] = useState({
        username: "",
        password: "",
        confirmPassword: "",
    })

    const handleLoginChange = (e) => {
        const { name, value, type, checked } = e.target
        setLoginData({
            ...loginData,
            [name]: type === "checkbox" ? checked : value,
        })
    }

    const handleRegisterChange = (e) => {
        const { name, value } = e.target
        setRegisterData({
            ...registerData,
            [name]: value,
        })
    }

    const handleLoginSubmit = async (e) => {
        e.preventDefault()
        await login(loginData.username, loginData.password);
        console.log("Login attempt:", loginData)
    }

    const handleRegisterSubmit = async (e) => {
        e.preventDefault()
        if (registerData.password !== registerData.confirmPassword) {
            alert("Passwords do not match!")
            return
        }
        await register(registerData.username, registerData.password, registerData.confirmPassword);
        console.log("Register attempt:", registerData)
    }

    const handleGoogleLogin = () => {
        window.location.href = API_GOOGLE_LOGIN_URL;
    }

    // if (isLoading) {
    //     return <p>Loading...</p>
    // }

    // if (authLoading) {
    //     return <p>Loading...</p>;
    // }


    return (
        <div className="login-page">
            <Container fluid className="h-100">
                <Row className="h-100 justify-content-center align-items-center">
                    <Col lg={10} xl={8} className="h-100">
                        <Card className="login-card border-0 shadow-lg h-100">
                            <Row className="g-0 h-100">
                                {/* Left Side - Branding */}
                                <Col md={6} className="login-brand-section d-flex align-items-center justify-content-center">
                                    <div className="text-center text-white">
                                        <div className="brand-logo mb-4">
                                            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mb-3">
                                                <path d="M16 16L48 48M48 16L16 48" stroke="white" strokeWidth="4" strokeLinecap="round" />
                                                <path d="M32 8L56 32L32 56L8 32L32 8Z" stroke="white" strokeWidth="3" fill="none" />
                                            </svg>
                                            <h1 className="brand-title fw-bold mb-3">ReNewMe</h1>
                                            <p className="brand-subtitle">Community Drug Use Prevention Support System</p>
                                        </div>
                                    </div>
                                </Col>

                                {/* Right Side - Login/Register Form */}
                                <Col md={6} className="login-form-section d-flex align-items-center">
                                    <div className="w-100 p-5">
                                        {/* Back Button */}
                                        <div className="mb-3">
                                            <Link to="/" className="back-link text-muted text-decoration-none d-flex align-items-center">
                                                <ArrowLeft size={16} className="me-2" />
                                                Back
                                            </Link>
                                        </div>

                                        {/* Tab Buttons */}
                                        <div className="login-tabs mb-4">
                                            <div className="d-flex gap-2">
                                                <Button
                                                    variant={activeTab === "login" ? "primary" : "outline-secondary"}
                                                    className="flex-fill"
                                                    onClick={() => setActiveTab("login")}
                                                >
                                                    Login
                                                </Button>
                                                <Button
                                                    variant={activeTab === "register" ? "primary" : "outline-secondary"}
                                                    className="flex-fill"
                                                    onClick={() => setActiveTab("register")}
                                                >
                                                    Register
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Google Login Button */}
                                        <Button
                                            variant="outline-danger"
                                            className="w-100 mb-4 google-login-btn"
                                            onClick={handleGoogleLogin}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" className="me-2">
                                                <path
                                                    fill="#4285F4"
                                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                />
                                                <path
                                                    fill="#34A853"
                                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                />
                                                <path
                                                    fill="#FBBC05"
                                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                />
                                                <path
                                                    fill="#EA4335"
                                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                />
                                            </svg>
                                            Login with Google
                                        </Button>

                                        {/* Divider */}
                                        <div className="divider mb-4">
                                            <span className="divider-text text-muted">or</span>
                                        </div>

                                        {/* Login Form */}
                                        {activeTab === "login" && (
                                            <Form onSubmit={handleLoginSubmit}>
                                                {error && <div className="text-danger mt-2">{error}</div>}
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-semibold text-dark">Username</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="username"
                                                        placeholder="Enter Username"
                                                        value={loginData.username}
                                                        onChange={handleLoginChange}
                                                        className="form-control-custom"
                                                        required
                                                    />
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-semibold text-dark">Password</Form.Label>
                                                    <Form.Control
                                                        type="password"
                                                        name="password"
                                                        placeholder="Enter Password"
                                                        value={loginData.password}
                                                        onChange={handleLoginChange}
                                                        className="form-control-custom"
                                                        required
                                                    />
                                                </Form.Group>

                                                <Form.Group className="mb-4">
                                                    <Form.Check
                                                        type="checkbox"
                                                        name="rememberMe"
                                                        label="Remember me"
                                                        checked={loginData.rememberMe}
                                                        onChange={handleLoginChange}
                                                        className="text-muted"
                                                    />
                                                </Form.Group>

                                                <Button type="submit" variant="primary" className="w-100 login-submit-btn mb-3">
                                                    Login
                                                </Button>

                                                <div className="text-center">
                                                    <Link to="/forgot-password" className="text-muted text-decoration-none small">
                                                        Forgot password?
                                                    </Link>
                                                </div>
                                            </Form>
                                        )}

                                        {/* Register Form */}
                                        {activeTab === "register" && (
                                            <Form onSubmit={handleRegisterSubmit}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-semibold text-dark">Username</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="username"
                                                        placeholder="Enter Username"
                                                        value={registerData.username}
                                                        onChange={handleRegisterChange}
                                                        className="form-control-custom"
                                                        required
                                                    />
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-semibold text-dark">Password</Form.Label>
                                                    <Form.Control
                                                        type="password"
                                                        name="password"
                                                        placeholder="Enter Password"
                                                        value={registerData.password}
                                                        onChange={handleRegisterChange}
                                                        className="form-control-custom"
                                                        required
                                                    />
                                                </Form.Group>

                                                <Form.Group className="mb-4">
                                                    <Form.Label className="fw-semibold text-dark">Confirm Password</Form.Label>
                                                    <Form.Control
                                                        type="password"
                                                        name="confirmPassword"
                                                        placeholder="Confirm Password"
                                                        value={registerData.confirmPassword}
                                                        onChange={handleRegisterChange}
                                                        className="form-control-custom"
                                                        required
                                                    />
                                                </Form.Group>

                                                <Button type="submit" variant="primary" className="w-100 login-submit-btn mb-3">
                                                    Register
                                                </Button>
                                            </Form>
                                        )}
                                    </div>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}
