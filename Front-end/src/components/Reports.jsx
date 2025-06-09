"use client"

import { useState } from "react"
import { Row, Col, Card, Button, Badge, ProgressBar } from "react-bootstrap"
import { BookOpen, GraduationCap, ClipboardCheck, Calendar, Award, TrendingUp, Download, Eye } from "lucide-react"
import "./Reports.css"

const Reports = () => {
  const [activeTab, setActiveTab] = useState("finished-activities")

  // Mock data for finished activities
  const finishedActivities = {
    blogs: [
      {
        id: 1,
        title: "5 Warning Signs of Drug Addiction",
        completedDate: "2024-12-15",
        readingTime: "8 minutes",
        category: "Prevention",
      },
      {
        id: 2,
        title: "Success Story: Overcoming Addiction",
        completedDate: "2024-12-10",
        readingTime: "12 minutes",
        category: "Recovery",
      },
      {
        id: 3,
        title: "How to recognize peer pressure",
        completedDate: "2024-12-05",
        readingTime: "6 minutes",
        category: "Education",
      },
    ],
    courses: [
      {
        id: 1,
        title: "School Drug Prevention",
        completedDate: "2024-12-20",
        duration: "4 hours",
        score: 95,
        certificate: true,
      },
      {
        id: 2,
        title: "Awareness of synthetic drugs",
        completedDate: "2024-12-01",
        duration: "3 hours",
        score: 88,
        certificate: true,
      },
    ],
    assessments: [
      {
        id: 1,
        title: "CRAFFT Screening Test",
        completedDate: "2024-12-22",
        score: 6,
        riskLevel: "High Risk",
        recommendations: ["Schedule counseling", "Family support", "Regular monitoring"],
      },
      {
        id: 2,
        title: "Mental Health Assessment",
        completedDate: "2024-12-18",
        score: 12,
        riskLevel: "Moderate Risk",
        recommendations: ["Stress management", "Regular exercise", "Counseling sessions"],
      },
    ],
  }

  const stats = {
    totalBlogs: finishedActivities.blogs.length,
    totalCourses: finishedActivities.courses.length,
    totalAssessments: finishedActivities.assessments.length,
    averageCourseScore: Math.round(
      finishedActivities.courses.reduce((sum, course) => sum + course.score, 0) / finishedActivities.courses.length,
    ),
    certificatesEarned: finishedActivities.courses.filter((course) => course.certificate).length,
  }

  const getRiskLevelColor = (riskLevel) => {
    const colors = {
      "Low Risk": "success",
      "Moderate Risk": "warning",
      "High Risk": "danger",
    }
    return colors[riskLevel] || "secondary"
  }

  const handleDownloadReport = () => {
    console.log("Download report clicked")
    // Implement report download functionality
  }

  const handleViewDetails = (type, id) => {
    console.log(`View details for ${type}:`, id)
    // Implement view details functionality
  }

  return (
    <div className="reports">
      <Card className="reports-card">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Reports</h5>
          <Button variant="outline-primary" size="sm" onClick={handleDownloadReport}>
            <Download size={16} className="me-1" />
            Download Report
          </Button>
        </Card.Header>
        <Card.Body>
          {/* Statistics Overview */}
          <div className="stats-overview mb-4">
            <Row>
              <Col md={3} className="mb-3">
                <div className="stat-card text-center p-3">
                  <BookOpen size={32} className="text-primary mb-2" />
                  <h4 className="mb-1">{stats.totalBlogs}</h4>
                  <small className="text-muted">Blogs Read</small>
                </div>
              </Col>
              <Col md={3} className="mb-3">
                <div className="stat-card text-center p-3">
                  <GraduationCap size={32} className="text-success mb-2" />
                  <h4 className="mb-1">{stats.totalCourses}</h4>
                  <small className="text-muted">Courses Completed</small>
                </div>
              </Col>
              <Col md={3} className="mb-3">
                <div className="stat-card text-center p-3">
                  <ClipboardCheck size={32} className="text-warning mb-2" />
                  <h4 className="mb-1">{stats.totalAssessments}</h4>
                  <small className="text-muted">Assessments Taken</small>
                </div>
              </Col>
              <Col md={3} className="mb-3">
                <div className="stat-card text-center p-3">
                  <Award size={32} className="text-info mb-2" />
                  <h4 className="mb-1">{stats.certificatesEarned}</h4>
                  <small className="text-muted">Certificates Earned</small>
                </div>
              </Col>
            </Row>
          </div>

          {/* Finished Activities Section */}
          <div className="finished-activities">
            <h6 className="section-title mb-4">
              <TrendingUp size={20} className="me-2" />
              Finished Activities
            </h6>

            {/* Blogs Section */}
            <div className="activity-section mb-4">
              <h6 className="activity-title mb-3">Blogs</h6>
              {finishedActivities.blogs.length === 0 ? (
                <p className="text-muted">No blogs completed yet.</p>
              ) : (
                <div className="activity-list">
                  {finishedActivities.blogs.map((blog) => (
                    <div
                      key={blog.id}
                      className="activity-item d-flex justify-content-between align-items-center p-3 mb-2"
                    >
                      <div className="activity-info">
                        <h6 className="mb-1">{blog.title}</h6>
                        <div className="activity-meta">
                          <small className="text-muted me-3">
                            <Calendar size={14} className="me-1" />
                            {new Date(blog.completedDate).toLocaleDateString()}
                          </small>
                          <small className="text-muted me-3">
                            <BookOpen size={14} className="me-1" />
                            {blog.readingTime}
                          </small>
                          <Badge bg="secondary" className="category-badge">
                            {blog.category}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="outline-primary" size="sm" onClick={() => handleViewDetails("blog", blog.id)}>
                        <Eye size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Courses Section */}
            <div className="activity-section mb-4">
              <h6 className="activity-title mb-3">Courses</h6>
              {finishedActivities.courses.length === 0 ? (
                <p className="text-muted">No courses completed yet.</p>
              ) : (
                <div className="activity-list">
                  {finishedActivities.courses.map((course) => (
                    <div
                      key={course.id}
                      className="activity-item d-flex justify-content-between align-items-center p-3 mb-2"
                    >
                      <div className="activity-info flex-grow-1">
                        <h6 className="mb-1">{course.title}</h6>
                        <div className="activity-meta mb-2">
                          <small className="text-muted me-3">
                            <Calendar size={14} className="me-1" />
                            {new Date(course.completedDate).toLocaleDateString()}
                          </small>
                          <small className="text-muted me-3">
                            <GraduationCap size={14} className="me-1" />
                            {course.duration}
                          </small>
                          {course.certificate && (
                            <Badge bg="success" className="certificate-badge">
                              <Award size={12} className="me-1" />
                              Certified
                            </Badge>
                          )}
                        </div>
                        <div className="score-progress">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <small className="text-muted">Score</small>
                            <small className="fw-bold text-primary">{course.score}%</small>
                          </div>
                          <ProgressBar variant="primary" now={course.score} style={{ height: "6px" }} />
                        </div>
                      </div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="ms-3"
                        onClick={() => handleViewDetails("course", course.id)}
                      >
                        <Eye size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Assessment Section */}
            <div className="activity-section">
              <h6 className="activity-title mb-3">Assessment</h6>
              {finishedActivities.assessments.length === 0 ? (
                <p className="text-muted">No assessments completed yet.</p>
              ) : (
                <div className="activity-list">
                  {finishedActivities.assessments.map((assessment) => (
                    <div key={assessment.id} className="activity-item p-3 mb-2">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="activity-info">
                          <h6 className="mb-1">{assessment.title}</h6>
                          <div className="activity-meta">
                            <small className="text-muted me-3">
                              <Calendar size={14} className="me-1" />
                              {new Date(assessment.completedDate).toLocaleDateString()}
                            </small>
                            <small className="text-muted me-3">Score: {assessment.score}</small>
                            <Badge bg={getRiskLevelColor(assessment.riskLevel)} className="risk-badge">
                              {assessment.riskLevel}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleViewDetails("assessment", assessment.id)}
                        >
                          <Eye size={14} />
                        </Button>
                      </div>
                      <div className="recommendations">
                        <small className="text-muted fw-bold">Recommendations:</small>
                        <ul className="recommendation-list mt-1">
                          {assessment.recommendations.map((rec, index) => (
                            <li key={index} className="recommendation-item">
                              <small>{rec}</small>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}

export default Reports
