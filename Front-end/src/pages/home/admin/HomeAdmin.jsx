import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col } from "react-bootstrap";
import {
  FaUsers,
  FaBlog,
  FaGraduationCap,
  FaCalendarAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

import StatsCard from "../../../components/dashboard/admin/StatsCard";
import ChartCard from "../../../components/dashboard/admin/ChartCard";
import "./admin.css";

const HomeAdmin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found. Denying access.");
      navigate("/login");
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      const userRole = decodedToken.scope || decodedToken.role;

      if (userRole !== "ADMIN") {
        console.log(`User role '${userRole}' is not 'ADMIN'. Denying access.`);
        navigate("/unauthorized");
      }
    } catch (error) {
      console.error("Error decoding token or invalid token:", error);
      navigate("/login");
    }
  }, [navigate]);

  const stats = {
    totalUsers: 1247,
    consultants: 24,
    managers: 8,
    staff: 15,
    regularUsers: 1200,
    blogPosts: 45,
    pendingPosts: 12,
    courses: 28,
    activeCourses: 23,
    appointments: 156,
    highRiskUsers: 87,
  };

  return (
    <div className="dashboard-content">
      <h1>Dashboard Overview</h1>

      <Row className="stats-row">
        <Col xl={3} lg={6} md={6} className="mb-4">
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<FaUsers />}
            subtitle={`${stats.consultants} consultants, ${stats.managers} managers`}
            trend="+12%"
            trendType="positive"
          />
        </Col>
        <Col xl={3} lg={6} md={6} className="mb-4">
          <StatsCard
            title="Blog Posts"
            value={stats.blogPosts}
            icon={<FaBlog />}
            subtitle={`${stats.pendingPosts} pending approval`}
            trend="+8%"
            trendType="positive"
          />
        </Col>
        <Col xl={3} lg={6} md={6} className="mb-4">
          <StatsCard
            title="Training Courses"
            value={stats.courses}
            icon={<FaGraduationCap />}
            subtitle={`${stats.activeCourses} currently active`}
            trend="+15%"
            trendType="positive"
          />
        </Col>
        <Col xl={3} lg={6} md={6} className="mb-4">
          <StatsCard
            title="Appointments"
            value={stats.appointments}
            icon={<FaCalendarAlt />}
            subtitle="This month"
            trend="+5%"
            trendType="positive"
          />
        </Col>
      </Row>

      <Row>
        <Col lg={8} className="mb-4">
          <StatsCard
            title="High Risk Users"
            value={stats.highRiskUsers}
            icon={<FaExclamationTriangle />}
            subtitle="From CRAFFT/ASSIST assessments"
            variant="warning"
            trend="-3%"
            trendType="negative"
          />
        </Col>
      </Row>

      <Row>
        <Col xl={8} lg={12} className="mb-4">
          <ChartCard title="System Access Analytics" type="line" />
        </Col>
        <Col xl={4} lg={6} className="mb-4">
          <ChartCard title="User Demographics" type="doughnut" />
        </Col>
        <Col lg={6} className="mb-4">
          <ChartCard title="Course Completion Rate" type="bar" />
        </Col>
        <Col lg={6} className="mb-4">
          <ChartCard title="Health Assessment Results" type="bar" />
        </Col>
      </Row>
    </div>
  );
};

export default HomeAdmin;
