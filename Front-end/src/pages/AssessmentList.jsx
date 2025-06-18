import { Container, Row, Col, Card } from "react-bootstrap"
import { TrendingUp, Target, MessageSquare, Shield } from "lucide-react"
import AssessmentCard from "../components/AssessmentCard"
import "./AssessmentList.css"
import { useEffect, useState } from "react"
import useFetch from "../hooks/useFetch"
import LoadingSpinner from "../components/LoadingSpinner"
import ErrorMessage from "../components/ErrorMessage"
import NotFound from "./NotFound"

const AssessmentList = () => {
  // Assessment data
  const [assessments, setAssessments] = useState([])
  const { loading, error, get } = useFetch("http://localhost:8080/api/assessment")

  useEffect(() => {
    get().then(setAssessments).catch(() => { })
  }, [get])
  console.log(assessments);

  // Benefits data
  const benefits = [
    {
      icon: <TrendingUp size={32} className="text-success" />,
      title: "Early Detection",
      description:
        "Identify risk signs before they become serious problems, allowing for timely and effective intervention.",
    },
    {
      icon: <Target size={32} className="text-info" />,
      title: "Objective Assessment",
      description: "Utilize scientifically researched and tested tools to deliver accurate and reliable results.",
    },
    {
      icon: <MessageSquare size={32} className="text-warning" />,
      title: "Personal Advice",
      description:
        "Get recommendations tailored to your specific situation, from taking a course to in-depth consultation.",
    },
    {
      icon: <Shield size={32} className="text-danger" />,
      title: "Proactive Health Protection",
      description:
        "Proactively detect and prevent substance use risks before problems occur, protecting your mental and physical health.",
    },
  ]
  console.log(benefits);

  <Container className="py-5">
    <LoadingSpinner loading={loading} />
    <ErrorMessage error={error} />
  </Container>

  if (assessments.length === 0) {
    return (
      <NotFound
        code="📝"
        title="No Assessments Found"
        message="We are realy sorry for this inconvinience."
        backLink="/"
        backText="Back Home"
      />
    )
  }

  return (
    <div className="assessment-list-page">
      <Container className="py-5">
        {/* Header Section */}
        <div className="text-center mb-5">
          <div className="assessment-steps d-flex justify-content-center align-items-center mb-4">
            <div className="step-circle active">1</div>
            <div className="step-line"></div>
            <div className="step-circle">2</div>
          </div>
          <h2 className="fw-bold text-dark mb-3">Choose Your Assessment</h2>
          <p className="text-muted">Select the assessment that best fits your age group and needs</p>
        </div>

        {/* Assessment Cards */}
        <Row className="justify-content-center mb-5">
          {assessments.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No assessments found.</p>
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
            <h3 className="fw-bold text-dark mb-3">Why Conduct an Assessment?</h3>
            <p className="text-muted">Understanding the benefits of taking a risk assessment</p>
          </div>

          <Row>
            {benefits.map((benefit, index) => (
              <Col lg={6} className="mb-4" key={index}>
                <Card className="benefit-card h-100 border-0 shadow-sm">
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-start">
                      <div className="benefit-icon me-3">{benefit.icon}</div>
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

export default AssessmentList
