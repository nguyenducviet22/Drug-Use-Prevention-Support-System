import React from 'react'
import { Container, Row, Col, Button } from "react-bootstrap"
import { Facebook, Twitter, Instagram, Linkedin, Youtube, MapPin, Phone, Mail } from "lucide-react"
import "./Footer.css"

export default function Footer() {

    const socialLinks = [
        { icon: <Facebook size={20} />, href: "#", label: "Facebook" },
        { icon: <Twitter size={20} />, href: "#", label: "Twitter" },
        { icon: <Instagram size={20} />, href: "#", label: "Instagram" },
        { icon: <Linkedin size={20} />, href: "#", label: "LinkedIn" },
        { icon: <Youtube size={20} />, href: "#", label: "YouTube" },
    ]

    const quickLinks = [
        { text: "About Us", href: "#" },
        { text: "Prevention Programs", href: "#" },
        { text: "Support Groups", href: "#" },
        { text: "Resources", href: "#" },
        { text: "Contact", href: "#" },
    ]
    return (
        <footer className="footer bg-light py-5 mt-5">
            <Container>
                <Row>
                    {/* Social Media Section */}
                    <Col lg={3} md={6} className="mb-4">
                        <div className="social-media-section">
                            <div className="d-flex gap-3 mb-4">
                                {socialLinks.map((social, index) => (
                                    <a
                                        key={index}
                                        href={social.href}
                                        className="social-link d-flex align-items-center justify-content-center"
                                        aria-label={social.label}
                                    >
                                        {social.icon}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </Col>

                    {/* Quick Links Section */}
                    <Col lg={3} md={6} className="mb-4">
                        <h5 className="footer-title fw-bold text-dark mb-3">QUICK LINKS</h5>
                        <ul className="list-unstyled">
                            {quickLinks.map((link, index) => (
                                <li key={index} className="mb-2">
                                    <a href={link.href} className="footer-link text-decoration-none text-muted">
                                        ▸ {link.text}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </Col>

                    {/* Contact Info Section */}
                    <Col lg={3} md={6} className="mb-4">
                        <h5 className="footer-title fw-bold text-dark mb-3">CONTACT INFO</h5>
                        <div className="contact-info">
                            <div className="d-flex align-items-start mb-3">
                                <MapPin size={16} className="text-muted me-2 mt-1 flex-shrink-0" />
                                <span className="text-muted">FPT University Ho Chi Minh City Campus, District 9, Ho Chi Minh City</span>
                            </div>
                            <div className="d-flex align-items-center mb-3">
                                <Phone size={16} className="text-muted me-2" />
                                <span className="text-muted">(123) 456-7890</span>
                            </div>
                            <div className="d-flex align-items-center mb-3">
                                <Mail size={16} className="text-muted me-2" />
                                <a href="mailto:info@renewme.com" className="text-muted text-decoration-none">
                                    info@renewme.com
                                </a>
                            </div>
                        </div>
                    </Col>

                    {/* About Section */}
                    <Col lg={3} md={6} className="mb-4">
                        <h5 className="footer-title fw-bold text-dark mb-3">ABOUT RENEWME</h5>
                        <p className="text-muted mb-3">
                            Dedicated to drug use prevention and community support. Protect yourself, protect the community.
                        </p>
                        <p className="text-muted small mb-3">Join our mission</p>
                        <Button variant="dark" className="px-4">
                            Get Involved
                        </Button>
                    </Col>
                </Row>

                {/* Footer Bottom */}
                <hr className="my-4" />
                <Row className="align-items-center">
                    <Col md={6}>
                        <p className="text-muted mb-0">© 2025 ReNewMe. All Rights Reserved.</p>
                    </Col>
                    <Col md={6} className="text-md-end">
                        <p className="text-muted mb-0">Prevention | Support | Recovery | Community</p>
                    </Col>
                </Row>
            </Container>
        </footer>
    )
}
