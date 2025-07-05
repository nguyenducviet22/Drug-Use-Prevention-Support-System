import { Container, Row, Col, Card } from "react-bootstrap"
import { TrendingUp, Target, MessageSquare, Shield } from "lucide-react"
import AssessmentCard from "../../components/card/AssessmentCard"
import "./AssessmentList.css"
import { useEffect, useState } from "react"
import useFetch from "../../hooks/useFetch"
import LoadingSpinner from "../../components/LoadingSpinner"
import ErrorMessage from "../../components/ErrorMessage"
import NotFound from "../not-found/NotFound"
import { useTranslation } from "react-i18next" // Import useTranslation

const AssessmentList = () => {
  const { t } = useTranslation('assessmentList') // Sử dụng namespace 'assessmentList'

  // Assessment data
  const [assessments, setAssessments] = useState([])
  const { loading, error, get } = useFetch("http://localhost:8080/api/assessment")

  useEffect(() => {
    get().then(setAssessments).catch(() => { })
  }, [get])
  console.log(assessments);

  // Benefits data - Lấy từ file JSON
  // Không cần định nghĩa biến `benefits` cứng ở đây nữa
  // Sẽ truy cập trực tiếp bằng t('whyConductAssessmentSection.benefits')

  <Container className="py-5">
    <LoadingSpinner loading={loading} />
    <ErrorMessage error={error} />
  </Container>

  if (assessments.length === 0) {
    return (
      <NotFound
        code={t("noAssessments.notFound.code")}
        title={t("noAssessments.notFound.title")}
        message={t("noAssessments.notFound.message")}
        backLink="/"
        backText={t("noAssessments.notFound.backText")}
      />
    )
  }

  return (
    <div className="assessment-list-page">
      <Container className="py-5">
        {/* Header Section */}
        <div className="text-center mb-5">
          <div className="assessment-steps d-flex justify-content-center align-items-center mb-4">
            <div className="step-circle active">{t("header.step1")}</div>
            <div className="step-line"></div>
            <div className="step-circle">{t("header.step2")}</div>
          </div>
          <h2 className="fw-bold text-dark mb-3">{t("header.title")}</h2>
          <p className="text-muted">{t("header.subtitle")}</p>
        </div>

        {/* Assessment Cards */}
        <Row className="justify-content-center mb-5">
          {assessments.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">{t("noAssessments.message")}</p>
            </div>
          ) : (
            <>
              {assessments.map((assessment) => (
                <Col lg={5} md={6} key={assessment.assessmentID} className="mb-4">
                  <AssessmentCard assessment={assessment} />
                </Col>
              ))}
            </>
          )}
        </Row>

        {/* Why Conduct Assessment Section */}
        <div className="why-assessment-section">
          <div className="text-center mb-5">
            <h3 className="fw-bold text-dark mb-3">{t("whyConductAssessmentSection.title")}</h3>
            <p className="text-muted">{t("whyConductAssessmentSection.subtitle")}</p>
          </div>

          <Row>
            {t("whyConductAssessmentSection.benefits", { returnObjects: true }).map((benefit, index) => (
              <Col lg={6} className="mb-4" key={index}>
                <Card className="benefit-card h-100 border-0 shadow-sm">
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-start">
                      <div className="benefit-icon me-3">
                        {/* Dựa vào title để chọn icon. Hoặc bạn có thể thêm key 'iconName' vào JSON */}
                        {benefit.title === "Early Detection" && <TrendingUp size={32} className="text-success" />}
                        {benefit.title === "Objective Assessment" && <Target size={32} className="text-info" />}
                        {benefit.title === "Personal Advice" && <MessageSquare size={32} className="text-warning" />}
                        {benefit.title === "Proactive Health Protection" && <Shield size={32} className="text-danger" />}
                      </div>
                      <div>
                        <h5 className="fw-bold text-primary mb-2">{benefit.title}</h5>
                        <p className="text-muted mb-0">{benefit.description}</p>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </Container>
    </div>
  )
}

export default AssessmentList;