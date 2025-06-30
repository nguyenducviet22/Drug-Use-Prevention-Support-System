import { Container, Row, Col, Card } from "react-bootstrap"
import { Check, User, FileText, AlertTriangle, Calendar, BookOpen, MessageCircle, Users } from "lucide-react"
import "./AssessmentResult.css"
import Recommendation from "../../components/others/Recommendation"
import { useEffect, useState } from "react"
import useFetch from "../../hooks/useFetch"
import { useAuth } from "../../hooks/useAuth"
import { useParams } from "react-router-dom"
import LoadingSpinner from "../../components/LoadingSpinner"
import ErrorMessage from "../../components/ErrorMessage"
import NotFound from "../not-found/NotFound"
import { useTranslation } from "react-i18next" // Import useTranslation

const AssessmentResult = () => {
  const { t } = useTranslation('assessmentResult') // Sử dụng namespace 'assessmentResult'

  const { user, loading: authLoading } = useAuth()
  const { id } = useParams()
  const [result, setResult] = useState(null)
  const { loading: loadingAssessmentResult, error, get } = useFetch(`http://localhost:8080/api/assessment-result/${id}`)

  useEffect(() => {
    get().then(setResult).catch(() => { })
  }, [get])

  const resultData = {
    username: user?.username,
    score: result?.score,
    riskLevel: result?.riskLevel,
    completedTime: result?.completedTime
  }
  console.log(resultData);

  <Container className="py-5" >
    <LoadingSpinner loading={authLoading || loadingAssessmentResult} />
    <ErrorMessage error={error} />
  </Container >

  if (!result || !user) {
    return (
      <NotFound
        code={t("notFound.code")}
        title={t("notFound.title")}
        message={t("notFound.message")}
        backLink="/assessment"
        backText={t("notFound.backLinkText")}
      />
    )
  }

  return (
    <Container className="assessment-container py-5">
      <Row className="justify-content-center">
        <Col lg={8} md={10}>
          {/* Progress Indicator */}
          <div className="progress-indicator mb-4">
            <div className="step completed">
              <span className="step-number">{t("progressIndicator.step1")}</span>
            </div>
            <div className="step-line"></div>
            <div className="step active">
              <span className="step-number">{t("progressIndicator.step2")}</span>
            </div>
          </div>

          {/* Main Result Card */}
          <Card className="result-card">
            <div className="result-header">
              <div className="check-icon-container">
                <Check size={40} className="check-icon" />
              </div>
              <h1 className="completion-title">{t("mainResultCard.completionTitle")}</h1>
              <p className="completion-subtitle">{t("mainResultCard.completionSubtitle")}</p>
            </div>

            {/* Results Details */}
            <div className="results-details">
              <div className="detail-item">
                <User size={18} className="detail-icon" />
                <span className="detail-label">{t("mainResultCard.details.userLabel")}</span>
                <span className="detail-value">{resultData.username}</span>
              </div>

              <div className="detail-item">
                <FileText size={18} className="detail-icon" />
                <span className="detail-label">{t("mainResultCard.details.assessmentScoreLabel")}</span>
                <span className="detail-value">{resultData.score}</span>
              </div>

              <div className="detail-item">
                <AlertTriangle size={18} className="detail-icon" />
                <span className="detail-label">{t("mainResultCard.details.riskLevelLabel")}</span>
                <span className={`detail-value risk-${resultData.riskLevel.toLowerCase()}`}>{resultData.riskLevel}</span>
              </div>

              <div className="detail-item">
                <Calendar size={18} className="detail-icon" />
                <span className="detail-label">{t("mainResultCard.details.completedDateTimeLabel")}</span>
                <span className="detail-value">{resultData.completedTime}</span>
              </div>
            </div>

            {/* Warning Section */}
            <div className="warning-section">
              <div className="warning-header">
                <AlertTriangle size={20} className="warning-icon" /><span className="warning-text">{t("mainResultCard.warningSection.warningText")}</span>
              </div>

              <div className="next-steps">
                <h4 className="next-steps-title">{t("mainResultCard.warningSection.nextStepsTitle")}</h4>

                {t("mainResultCard.warningSection.recommendations", { returnObjects: true }).map((recommendation, index) => (
                  <div className="recommendation-item" key={index}>
                    {recommendation.title.includes("Course") && <BookOpen size={18} className="recommendation-icon" />}
                    {recommendation.title.includes("Advice") && <MessageCircle size={18} className="recommendation-icon" />}
                    {recommendation.title.includes("Community") && <Users size={18} className="recommendation-icon" />}
                    <div className="recommendation-content">
                      <strong>{recommendation.title}</strong> {recommendation.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Courses Section */}
            <Recommendation />
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default AssessmentResult;