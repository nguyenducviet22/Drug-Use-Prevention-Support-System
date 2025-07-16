import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert
} from 'react-bootstrap';
import {
  Check,
  User,
  FileText,
  AlertTriangle,
  Calendar,
  BookOpen,
  Users,
  TrendingUp,
  Shield,
  Clock,
  Target,
  ArrowRight,
  Download,
  RefreshCw,
  Heart,
  Activity,
  GraduationCap,
  Stethoscope,
  HelpCircle,
  Zap,
  Award,
  Brain
} from 'lucide-react';
import './AssessmentResult2.css';
import useFetch from "../../hooks/useFetch";
import { useAuth } from "../../hooks/useAuth";
import { useLocation, useParams } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import NotFound from "../not-found/NotFound";
import { useTranslation } from "react-i18next";

const AssessmentResult = () => {
  const { t } = useTranslation("assessmentResult");
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const {
    loading: loadingAssessmentResult,
    error,
    get,
  } = useFetch(`http://localhost:8080/api/assessment-result/${id}`);

  // Animation states
  const [isVisible, setIsVisible] = useState(false);
  const [animateCards, setAnimateCards] = useState(false);

  useEffect(() => {
    if (id !== "temp") {
      get()
        .then(setResult)
        .catch(() => {});
    }
    const timer1 = setTimeout(() => setIsVisible(true), 200);
    const timer2 = setTimeout(() => setAnimateCards(true), 800);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
    // eslint-disable-next-line
  }, [get, id]);

  // Guest logic
  if (id === "temp" && location.state) {
    const { score, riskLevel, suggestedAction } = location.state;
    return (
      <Container className="assessment-container py-5">
        <Row className="justify-content-center">
          <Col lg={8} md={10}>
            <div className="progress-indicator mb-4">
              <div className="step completed">
                <span className="step-number">
                  {t("progressIndicator.step1")}
                </span>
              </div>
              <div className="step-line"></div>
              <div className="step active">
                <span className="step-number">
                  {t("progressIndicator.step2")}
                </span>
              </div>
            </div>
            <Card className="result-card">
              <div className="result-header">
                <h1 className="completion-title">
                  {t("mainResultCard.completionTitle")}
                </h1>
                <p className="completion-subtitle">
                  {t("mainResultCard.completionSubtitle")}
                </p>
              </div>
              <div className="results-details">
                <div className="detail-item">
                  <span className="detail-label">
                    {t("mainResultCard.details.assessmentScoreLabel")}
                  </span>
                  <span className="detail-value">{score}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">
                    {t("mainResultCard.details.riskLevelLabel")}
                  </span>
                  <span
                    className={`detail-value risk-${riskLevel?.toLowerCase()}`}
                  >
                    {riskLevel}
                  </span>
                </div>
              </div>
              <div className="warning-section">
                <div className="warning-header">
                  <span className="warning-text">
                    {t("mainResultCard.warningSection.warningText")}
                  </span>
                </div>
                <div className="next-steps">
                  <h4 className="next-steps-title">
                    {t("mainResultCard.warningSection.nextStepsTitle")}
                  </h4>
                  <div className="recommendation-content">
                    <strong>
                      {t("mainResultCard.details.suggestedActionLabel")}
                    </strong>{" "}
                    {suggestedAction}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // Loading & error
  if (authLoading || loadingAssessmentResult) {
    return (
      <Container className="py-5">
        <LoadingSpinner loading />
      </Container>
    );
  }
  if (error) {
    return (
      <Container className="py-5">
        <ErrorMessage error={error} />
      </Container>
    );
  }

  // Not found
  if (!result || !user) {
    return (
      <NotFound
        code={t("notFound.code")}
        title={t("notFound.title")}
        message={t("notFound.message")}
        backLink="/assessment"
        backText={t("notFound.backLinkText")}
      />
    );
  }

  // Data mapping
  const assessmentData = {
    username: user?.username,
    score: result?.score,
    maxScore: result?.maxScore || 6,
    riskLevel: result?.riskLevel,
    assessmentType: result?.assessmentType || "CRAFFT",
    completedTime: result?.completedTime,
    suggestedAction: result?.suggestedAction,
    totalQuestions: result?.totalQuestions || 6,
    yesAnswers: result?.yesAnswers || result?.score,
    ageGroup: result?.ageGroup || "",
    riskFactors: result?.riskFactors || []
  };

  // Recommendations from translation or API
  const recommendations = t("mainResultCard.warningSection.recommendations", {
    returnObjects: true,
  });

  // Prevention tips (có thể lấy từ i18n hoặc hardcode)
  const preventionTips = [
    t("mainResultCard.preventionTips.0", "Build positive relationships with family and friends"),
    t("mainResultCard.preventionTips.1", "Participate in healthy sports and recreational activities"),
    t("mainResultCard.preventionTips.2", "Learn to manage stress and pressure effectively"),
    t("mainResultCard.preventionTips.3", "Avoid environments with drug exposure risks"),
    t("mainResultCard.preventionTips.4", "Seek support when facing life difficulties"),
    t("mainResultCard.preventionTips.5", "Increase knowledge about drug harm and addiction"),
  ];

  // Helper functions
  const getRiskVariant = (risk) => {
    switch ((risk || '').toLowerCase()) {
      case 'low': return 'success';
      case 'moderate': return 'primary';
      case 'high': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="main-container">
      {/* Floating Background Elements */}
      <div className="floating-elements">
        <div className="floating-circle"></div>
        <div className="floating-circle"></div>
        <div className="floating-circle"></div>
        <div className="floating-circle"></div>
      </div>

      <Container fluid className="py-5 position-relative">
        {/* Progress Indicator */}
        <Row className="justify-content-center mb-5">
          <Col xs="auto">
            <div className="progress-indicator d-flex align-items-center">
              <div className="text-center me-4">
                <div className="progress-step completed">
                  <Check size={28} />
                </div>
                <small className="text-white fw-bold mt-2 d-block">{t("progressIndicator.step1")}</small>
              </div>
              <div className="progress-connector" style={{ width: '100px' }}></div>
              <div className="text-center ms-4">
                <div className="progress-step active">
                  <Activity size={28} />
                </div>
                <small className="text-white fw-bold mt-2 d-block">{t("progressIndicator.step2")}</small>
              </div>
            </div>
          </Col>
        </Row>

        <Container style={{ maxWidth: '70%' }}>
          {/* Main Result Card */}
          <Card className={`glass-card ${isVisible ? 'animated-card' : ''}`}>
            {/* Header Section */}
            <Card.Header className="gradient-header text-white text-center py-4 border-0">
              <div className="position-relative">
                <div className="hero-icon">
                  <Heart size={48} />
                </div>
                <h1 className="display-5 fw-bold mb-2">{t("mainResultCard.completionTitle")}</h1>
                <p className="lead mb-0 opacity-90">
                  {t("mainResultCard.completionSubtitle")}
                </p>
              </div>
            </Card.Header>

            {/* Quick Stats */}
            <div className="stats-card">
              <Row className="text-center g-3">
                <Col md={4}>
                  <div className="d-flex flex-column align-items-center">
                    <div className="metric-icon bg-primary bg-gradient mb-1">
                      <TrendingUp size={24} className="text-white" />
                    </div>
                    <h4 className="text-primary fw-bold mb-1">{assessmentData.score}/{assessmentData.maxScore}</h4>
                    <small className="text-muted fw-medium">{t("mainResultCard.details.assessmentScoreLabel")}</small>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="d-flex flex-column align-items-center">
                    <div className="metric-icon bg-info bg-gradient mb-1">
                      <Award size={24} className="text-white" />
                    </div>
                    <h4 className="text-info fw-bold mb-1">{assessmentData.assessmentType}</h4>
                    <small className="text-muted fw-medium">{t("mainResultCard.details.assessmentTypeLabel", "Assessment Type")}</small>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="d-flex flex-column align-items-center">
                    <div className="metric-icon bg-warning bg-gradient mb-1">
                      <Shield size={24} className="text-white" />
                    </div>
                    <h4 className={`text-${getRiskVariant(assessmentData.riskLevel)} fw-bold mb-1`}>
                      {assessmentData.riskLevel}
                    </h4>
                    <small className="text-muted fw-medium">{t("mainResultCard.details.riskLevelLabel")}</small>
                  </div>
                </Col>
              </Row>
            </div>

            <Card.Body className="p-4">

              {/* CRAFFT Scoring Explanation */}
              <Alert className={`alert-beautiful mb-4 ${isVisible ? 'stagger-animation' : ''}`}>
                <div className="d-flex align-items-start">
                  <div className="metric-icon bg-primary bg-gradient me-3 flex-shrink-0" style={{ width: '45px', height: '45px' }}>
                    <HelpCircle size={18} />
                  </div>
                  <div>
                    <h6 className="fw-bold text-primary mb-2">
                      <Zap size={18} className="me-2" />
                      {t("mainResultCard.scoringExplanationTitle", "CRAFFT Scoring Explanation")}
                    </h6>
                    <div className="bg-light bg-opacity-50 rounded-3 p-2 mb-2">
                      <p className="mb-1 fw-medium text-primary" style={{ fontSize: '0.9rem' }}>
                        {t("mainResultCard.scoringExplanationHow", "How CRAFFT Scoring Works:")}
                      </p>
                      <p className="mb-0 text-dark" style={{ fontSize: '0.85rem' }}>
                        {t("mainResultCard.scoringExplanationContent", "Each \"Yes\" answer in Part B of the CRAFFT assessment counts as 1 point. The total possible score is 6 points. Your score of")} <strong className="text-primary">{assessmentData.score} {t("mainResultCard.scoringExplanationOutOf", "out of")} {assessmentData.maxScore}</strong> {t("mainResultCard.scoringExplanationIndicates", "indicates a")} <strong className="text-warning">{assessmentData.riskLevel?.toLowerCase()}</strong> {t("mainResultCard.scoringExplanationRiskLevel", "risk level for substance use problems.")} 
                      </p>
                    </div>
                  </div>
                </div>
              </Alert>

              {/* Assessment Details */}
              <Card className={`metric-card border-0 mb-4 ${isVisible ? 'stagger-animation' : ''}`}>
                <Card.Body>
                  <h5 className="d-flex align-items-center mb-3 text-primary">
                    <FileText className="me-2" size={24} />
                    {t("mainResultCard.details.detailsTitle", "Assessment Details")}
                  </h5>
                  
                  <Row className="g-3">
                    <Col md={6}>
                      <div className="list-group-item-beautiful p-2 d-flex align-items-center">
                        <div className="metric-icon bg-success bg-gradient me-2" style={{ width: '35px', height: '35px' }}>
                          <User size={16} />
                        </div>
                        <div>
                          <small className="text-muted fw-medium" style={{ fontSize: '0.8rem' }}>{t("mainResultCard.details.userLabel")}</small>
                          <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{assessmentData.username}</div>
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="list-group-item-beautiful p-2 d-flex align-items-center">
                        <div className="metric-icon bg-warning bg-gradient me-2" style={{ width: '35px', height: '35px' }}>
                          <Clock size={16} />
                        </div>
                        <div>
                          <small className="text-muted fw-medium" style={{ fontSize: '0.8rem' }}>{t("mainResultCard.details.completedDateTimeLabel")}</small>
                          <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>
                            {assessmentData.completedTime ? new Date(assessmentData.completedTime).toLocaleString() : ""}
                          </div>
                        </div>
                      </div>
                    </Col>
                    {assessmentData.ageGroup && (
                      <Col md={6}>
                        <div className="list-group-item-beautiful p-2 d-flex align-items-center">
                          <div className="metric-icon bg-info bg-gradient me-2" style={{ width: '35px', height: '35px' }}>
                            <GraduationCap size={16} />
                          </div>
                          <div>
                            <small className="text-muted fw-medium" style={{ fontSize: '0.8rem' }}>{t("mainResultCard.details.ageGroupLabel", "Age Group")}</small>
                            <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{assessmentData.ageGroup}</div>
                          </div>
                        </div>
                      </Col>
                    )}
                    <Col md={6}>
                      <div className="list-group-item-beautiful p-2 d-flex align-items-center">
                        <div className="metric-icon bg-primary bg-gradient me-2" style={{ width: '35px', height: '35px' }}>
                          <Check size={16} />
                        </div>
                        <div>
                          <small className="text-muted fw-medium" style={{ fontSize: '0.8rem' }}>{t("mainResultCard.details.yesAnswersLabel", "Yes Answers")}</small>
                          <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{assessmentData.yesAnswers} {t("mainResultCard.details.outOf", "out of")} {assessmentData.totalQuestions}</div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Recommended Actions */}
              <Alert className={`alert-beautiful mb-4 ${isVisible ? 'stagger-animation' : ''}`}>
                <div className="d-flex align-items-start">
                  <div className="metric-icon bg-success bg-gradient me-3 flex-shrink-0" style={{ width: '45px', height: '45px' }}>
                    <Target size={18} />
                  </div>
                  <div>
                    <h6 className="fw-bold text-success mb-2">
                      <ArrowRight size={18} className="me-2" />
                      {t("mainResultCard.warningSection.nextStepsTitle")}
                    </h6>
                    <p className="mb-0 text-dark" style={{ fontSize: '0.9rem' }}>
                      {assessmentData.suggestedAction || t("mainResultCard.warningSection.warningText")}
                    </p>
                  </div>
                </div>
              </Alert>

              {/* Recommendations */}
              {Array.isArray(recommendations) && recommendations.length > 0 && (
                <Card className={`metric-card border-0 mb-4 ${isVisible ? 'stagger-animation' : ''}`}>
                  <Card.Body>
                    <h5 className="d-flex align-items-center mb-3 text-primary">
                      <BookOpen className="me-2" size={24} />
                      {t("mainResultCard.warningSection.recommendationsTitle", "Recommendations")}
                    </h5>
                    <Row className="g-3">
                      {recommendations.map((rec, idx) => (
                        <Col md={12} key={idx}>
                          <div className="d-flex align-items-start mb-2">
                            <div className="metric-icon bg-gradient bg-primary me-2 flex-shrink-0" style={{ width: '30px', height: '30px' }}>
                              {rec.title?.includes("Course") && <BookOpen size={18} />}
                              {rec.title?.includes("Advice") && <Stethoscope size={18} />}
                              {rec.title?.includes("Community") && <Users size={18} />}
                              {rec.title?.includes("Education") && <Brain size={18} />}
                            </div>
                            <div>
                              <strong>{rec.title}</strong>{" "}
                              <span>{rec.description}</span>
                            </div>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </Card.Body>
                </Card>
              )}

              {/* Prevention Tips */}
              <Card className={`metric-card border-0 mb-4 ${isVisible ? 'stagger-animation' : ''}`}>
                <Card.Body>
                  <h5 className="d-flex align-items-center mb-3 text-primary">
                    <Shield className="me-2" size={24} />
                    {t("mainResultCard.preventionTipsTitle", "Prevention Tips & Strategies")}
                  </h5>
                  <Row className="g-3">
                    {preventionTips.map((tip, index) => (
                      <Col md={6} key={index}>
                        <div className={`prevention-tip ${animateCards ? 'stagger-animation' : ''}`}>
                          <div className="d-flex align-items-start">
                            <div className="metric-icon bg-gradient bg-primary me-2 flex-shrink-0" style={{ width: '30px', height: '30px' }}>
                              <span className="fw-bold" style={{ fontSize: '12px' }}>{index + 1}</span>
                            </div>
                            <p className="mb-0 text-dark fw-medium" style={{ fontSize: '0.9rem' }}>{tip}</p>
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>

              {/* Action Buttons */}
              <div className="border-top pt-4">
                <Row className="g-3">
                  <Col md={4}>
                    <Button className="btn-beautiful btn-primary-beautiful w-100 d-flex align-items-center justify-content-center">
                      <Download size={18} className="me-2" />
                      {t("mainResultCard.downloadReport", "Download Detailed Report")}
                    </Button>
                  </Col>
                  <Col md={4}>
                    <Button className="btn-beautiful btn-outline-beautiful w-100 d-flex align-items-center justify-content-center">
                      <Calendar size={18} className="me-2" />
                      {t("mainResultCard.scheduleConsultation", "Schedule Consultation")}
                    </Button>
                  </Col>
                  <Col md={4}>
                    <Button className="btn-beautiful btn-outline-beautiful w-100 d-flex align-items-center justify-content-center">
                      <RefreshCw size={18} className="me-2" />
                      {t("mainResultCard.retakeAssessment", "Retake Assessment")}
                    </Button>
                  </Col>
                </Row>
              </div>
            </Card.Body>
          </Card>
        </Container>
      </Container>
    </div>
  );
};

export default AssessmentResult;