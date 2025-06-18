import { Container, Row, Col, Card } from "react-bootstrap"
import { Check, User, FileText, AlertTriangle, Calendar, BookOpen, MessageCircle, Users } from "lucide-react"
import "./AssessmentResult.css"
import Recommendation from "../components/Recommendation"
import { useEffect, useState } from "react"
import useFetch from "../hooks/useFetch"
import { useAuth } from "../hooks/useAuth"
import { useParams } from "react-router-dom"
import LoadingSpinner from "../components/LoadingSpinner"
import ErrorMessage from "../components/ErrorMessage"
import NotFound from "./NotFound"

const AssessmentResult = () => {

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
        code="📊"
        title="Assessment Result Not Found"
        message="We couldn't find the result you're looking for."
        backLink="/assessment"
        backText="Back to Assessments"
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
              <span className="step-number">1</span>
            </div>
            <div className="step-line"></div>
            <div className="step active">
              <span className="step-number">2</span>
            </div>
          </div>

          {/* Main Result Card */}
          <Card className="result-card">
            <div className="result-header">
              <div className="check-icon-container">
                <Check size={40} className="check-icon" />
              </div>
              <h1 className="completion-title">Completed</h1>
              <p className="completion-subtitle">Here is the result !</p>
            </div>

            {/* Results Details */}
            <div className="results-details">
              <div className="detail-item">
                <User size={18} className="detail-icon" />
                <span className="detail-label">User:</span>
                <span className="detail-value">{resultData.username}</span>
              </div>

              <div className="detail-item">
                <FileText size={18} className="detail-icon" />
                <span className="detail-label">Assessment Score:</span>
                <span className="detail-value">{resultData.score}</span>
              </div>

              <div className="detail-item">
                <AlertTriangle size={18} className="detail-icon" />
                <span className="detail-label">Risk Level:</span>
                <span className={`detail-value risk-${resultData.riskLevel.toLowerCase()}`}>{resultData.riskLevel}</span>
              </div>

              <div className="detail-item">
                <Calendar size={18} className="detail-icon" />
                <span className="detail-label">Completed Date Time:</span>
                <span className="detail-value">{resultData.completedTime}</span>
              </div>
            </div>

            {/* Warning Section */}
            <div className="warning-section">
              <div className="warning-header">
                <AlertTriangle size={20} className="warning-icon" /><span className="warning-text">Warning: Possible relapse risk detected</span>
              </div>

              <div className="next-steps">
                <h4 className="next-steps-title">Next step to do:</h4>

                <div className="recommendation-item">
                  <BookOpen size={18} className="recommendation-icon" />
                  <div className="recommendation-content">
                    <strong>Take a recomemded Course below:</strong> The system will recommend courses that are appropriate for your high
                    risk level.
                  </div>
                </div>

                <div className="recommendation-item">
                  <MessageCircle size={18} className="recommendation-icon" />
                  <div className="recommendation-content">
                    <strong>Receive Advice:</strong> Make an appointment with highly trained consultants.
                  </div>
                </div>

                <div className="recommendation-item">
                  <Users size={18} className="recommendation-icon" />
                  <div className="recommendation-content">
                    <strong>Engage Community Events:</strong> Connect with relevant educational programs and community
                    activities.
                  </div>
                </div>
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

export default AssessmentResult