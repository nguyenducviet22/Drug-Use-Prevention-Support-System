import React, { useState, useEffect } from "react";
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
import axios from "axios";

import StatsCard from "../../../components/dashboard/admin/StatsCard";
import ChartCard from "../../../components/dashboard/admin/ChartCard";
import "./admin.css";

const HomeAdmin = () => {
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState(null);
  const [highRiskStats, setHighRiskStats] = useState(null);
  const [blogStats, setBlogStats] = useState(null);
  const [courseStats, setCourseStats] = useState(null);
  const [appointmentStats, setAppointmentStats] = useState(null);
  const [userDemographics, setUserDemographics] = useState(null);
  const [assessmentData, setAssessmentData] = useState(null);
  const [completionByAgeData, setCompletionByAgeData] = useState({ labels: [], data: [] });

  /////////Kiểm tra token quyền truy cập/////////
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
  /////////////////////////////////FETCH DATA///////////////////
  /////////////Fetch user stats
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:8080/api/user/admin/stats/users",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUserStats(response.data);
        console.log("User stats fetched successfully:", response.data);
      } catch (error) {
        console.error("Failed to fetch user stats:", error);
      }
    };

    fetchUserStats();
  }, []);
  ///////////////////////HIGH RISK USERS///////////////////
  useEffect(() => {
    const fetchHighRiskStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:8080/api/assessment-result/high-risk",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("High Risk Stats:", res.data);
        setHighRiskStats(res.data);
      } catch (err) {
        console.error("Failed to fetch high risk stats:", err);
      }
    };

    fetchHighRiskStats();
  }, []);

  /////////FETCH BLOG STATS
  useEffect(() => {
    const fetchBlogStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:8080/api/blog/admin/stats/blogs",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setBlogStats(response.data);
      } catch (error) {
        console.error("Failed to fetch blog stats:", error);
      }
    };
    fetchBlogStats();
  }, []);

  /////////////FETCH COURSE STATS
  useEffect(() => {
    const fetchCourseStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:8080/api/course/admin/stats/courses",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Course Stats:", res.data);
        setCourseStats(res.data);
      } catch (err) {
        console.error("Failed to fetch course stats:", err);
      }
    };
    fetchCourseStats();
  }, []);

  /////////////FETCH APPOINTMENT STATS
  useEffect(() => {
    const fetchAppointmentStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:8080/api/appointment/admin/stats/appointments",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAppointmentStats(response.data);
      } catch (error) {
        console.error("Failed to fetch appointment stats:", error);
      }
    };
    fetchAppointmentStats();
  }, []);

  /////FETCH USER DEMOGRAPHICS
  useEffect(() => {
    const fetchUserDemographics = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:8080/api/user/admin/user-demographics",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUserDemographics(res.data);
      } catch (err) {
        console.error("Failed to fetch user demographics", err);
      }
    };

    fetchUserDemographics();
  }, []);

  //////FETCH ASSESSMENT CHART
  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get(
        "http://localhost:8080/api/assessment-result/admin/assessment-risk-stats",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        const { labels, data } = res.data;
        setAssessmentData({ labels, data });
      })
      .catch((err) => {
        console.error("Failed to fetch assessment risk stats", err);
      });
  }, []);


 ////FETCH COURSE COMPLETION BY AGE GROUP
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("/api/course-stats/completion-by-age-group", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setCompletionByAgeData(res.data))
      .catch((err) => console.error("Error fetching age stats", err));
  }, []);

  return (
    <div className="dashboard-content">
      <h1>Dashboard Overview</h1>

      <Row className="stats-row">
        <Col xl={3} lg={6} md={6} className="mb-4">
          {userStats && (
            <StatsCard
              title="Total Users"
              value={userStats.totalUsers}
              icon={<FaUsers />}
              subtitle={
                <>
                  {userStats.consultants} consultants
                  <br />
                  {userStats.managers} managers
                </>
              }
              trend={`+${userStats.growthPercent}%`}
              trendType="positive"
            />
          )}
        </Col>
        <Col xl={3} lg={6} md={6} className="mb-4">
          {blogStats && (
            <StatsCard
              title="Blog Posts"
              value={blogStats.totalBlogs}
              icon={<FaBlog />}
              subtitle={`${blogStats.pendingBlogs} pending approval`}
              trend={`+${blogStats.growthPercent}%`}
              trendType="positive"
            />
          )}
        </Col>
        <Col xl={3} lg={6} md={6} className="mb-4">
          {courseStats && (
            <StatsCard
              title="Training Courses"
              value={courseStats.totalCourses}
              icon={<FaGraduationCap />}
              subtitle={`${courseStats.activeCourses} currently active`}
              trend={`+${courseStats.growthPercent}%`}
              trendType="positive"
            />
          )}
        </Col>
        <Col xl={3} lg={6} md={6} className="mb-4">
          {appointmentStats && (
            <StatsCard
              title="Appointments"
              value={appointmentStats.totalAppointments}
              icon={<FaCalendarAlt />}
              subtitle="This month"
              trend={`${appointmentStats.growthPercent > 0 ? "+" : ""}${
                appointmentStats.growthPercent
              }%`}
              trendType={
                appointmentStats.growthPercent >= 0 ? "positive" : "negative"
              }
            />
          )}
        </Col>
      </Row>

      <Row>
        <Col lg={8} className="mb-4">
          {highRiskStats && (
            <StatsCard
              title="High Risk Users"
              value={highRiskStats.highRiskUsers}
              icon={<FaExclamationTriangle />}
              subtitle="From CRAFFT/ASSIST assessments"
              variant="warning"
              trend={`${highRiskStats.growthPercent > 0 ? "+" : ""}${
                highRiskStats.growthPercent
              }%`}
              trendType={
                highRiskStats.growthPercent >= 0 ? "positive" : "negative"
              }
            />
          )}
        </Col>
      </Row>

      <Row>
        <Col xl={8} lg={12} className="mb-4">
          <ChartCard title="System Access Analytics" type="line" />
        </Col>
        <Col xl={4} lg={6} className="mb-4">
          {userDemographics && (
            <ChartCard
              title="User Demographics"
              type="doughnut"
              data={userDemographics}
            />
          )}
        </Col>
        <Col lg={6} className="mb-4">
          <ChartCard
            title="Completed Courses by Age Group"
            type="bar"
            data={completionByAgeData}
          />
        </Col>

        <Col lg={6} className="mb-4">
          <ChartCard
            title="Health Assessment Results"
            type="bar"
            data={assessmentData}
          />
        </Col>
      </Row>
    </div>
  );
};

export default HomeAdmin;
