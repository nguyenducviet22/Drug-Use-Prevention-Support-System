import React from 'react'
import { Navbar as BootstrapNavbar, Button, Container, Dropdown, Nav } from "react-bootstrap"
import { Link, useNavigate } from "react-router-dom"
import "./Navbar.css"
import { useAuth } from '../hooks/useAuth';
import { LogOut, User } from 'lucide-react';

export default function Navbar() {

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Blogs", path: "/blogs" },
    { name: "Events", path: "/events" },
    { name: "Courses", path: "/courses" },
    { name: "Assessment", path: "/assessment" },
  ]

  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  }

  const UserAvatar = () => (
    <div className="user-avatar">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="avatar-icon">
        <circle cx="16" cy="16" r="16" fill="#6c757d" />
        <circle cx="16" cy="12" r="5" fill="white" />
        <path d="M6 26c0-5.5 4.5-10 10-10s10 4.5 10 10" fill="white" />
      </svg>
    </div>
  )

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
          <Nav className="mx-auto">
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
                      <div className="user-name">{user?.username || "User"}</div>
                    </div>
                  </div>
                  <Dropdown.Divider />
                  <Dropdown.Item as={Link} to="/profile" className="dropdown-item-custom">
                    <User size={16} className="me-2" />
                    My Profile
                  </Dropdown.Item>
                  <Dropdown.Item onClick={handleLogout} className="dropdown-item-custom">
                    <LogOut size={16} className="me-2" />
                    Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <div className="d-flex gap-2">
                <Button variant="outline-primary" size="sm" as={Link} to="/login">
                  Log In
                </Button>
                <Button variant="primary" size="sm" as={Link} to="/login">
                  Register
                </Button>
              </div>
            )}
          </div>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>

  )
}
