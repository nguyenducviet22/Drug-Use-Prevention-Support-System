import React from 'react'
import { Navbar as BootstrapNavbar, Button, Container, Dropdown, Nav } from "react-bootstrap"
import { Link, useNavigate, useLocation } from "react-router-dom"
import "./Navbar.css"
import { useAuth } from '../../hooks/useAuth';
import { LogOut, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { t, i18n } = useTranslation("navbar");
  const location = useLocation();

  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const role = user?.role;
  let homePath = "/"; // default
  if (role === "STAFF") homePath = "/staff";
  else if (role === "MANAGER") homePath = "/manager";

  const navItems = [
    { name: t("home"), path: homePath },
    { name: t("blogs"), path: "/blogs" },
    { name: t("events"), path: "/events" },
    { name: t("courses"), path: "/courses" },
    { name: t("assessment"), path: "/assessment" },
  ];

  const handleLanguageChange = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const UserAvatar = () => (
    <div className="user-avatar">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="avatar-icon">
        <circle cx="16" cy="16" r="16" fill="#6c757d" />
        <circle cx="16" cy="12" r="5" fill="white" />
        <path d="M6 26c0-5.5 4.5-10 10-10s10 4.5 10 10" fill="white" />
      </svg>
    </div>
  );

  return (
    <BootstrapNavbar bg="light" expand="lg" className="py-3">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <div className="logo-icon me-2">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M8 8L24 24M24 8L8 24" stroke="#333" strokeWidth="3" strokeLinecap="round" />
              <path d="M16 4L28 16L16 28L4 16L16 4Z" stroke="#333" strokeWidth="2" fill="none" />
            </svg>
          </div>
          <span className="fw-bold fs-4 text-dark">ReNewMe</span>
        </BootstrapNavbar.Brand>

        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto align-items-center">
            {navItems.map((item) => (
              <Nav.Link
                key={item.name}
                as={Link}
                to={item.path}
                className={`nav-item-custom mx-2 ${location.pathname === item.path ? "active" : ""}`}
              >
                {item.name}
              </Nav.Link>
            ))}

            <LanguageSwitcher
              currentLanguage={i18n.language}
              onChangeLanguage={handleLanguageChange}
            />
          </Nav>

          <div className="d-flex align-items-center">
            {isAuthenticated ? (
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="link"
                  id="user-dropdown"
                  className="user-dropdown-toggle p-0 border-0 shadow-none"
                >
                  <UserAvatar />
                </Dropdown.Toggle>

                <Dropdown.Menu className="user-dropdown-menu">
                  <div className="dropdown-header">
                    <div className="user-info">
                      <div className="user-name">{user?.username || t("userPlaceholder")}</div>
                    </div>
                  </div>
                  <Dropdown.Divider />
                  <Dropdown.Item as={Link} to="/profile" className="dropdown-item-custom">
                    <User size={16} className="me-2" />
                    {t("myProfile")}
                  </Dropdown.Item>
                  <Dropdown.Item onClick={handleLogout} className="dropdown-item-custom">
                    <LogOut size={16} className="me-2" />
                    {t("logout")}
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <div className="d-flex gap-2">
                <Button variant="outline-primary" size="sm" as={Link} to="/login">
                  {t("login")}
                </Button>
                <Button variant="primary" size="sm" as={Link} to="/login">
                  {t("register")}
                </Button>
              </div>
            )}
          </div>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
}