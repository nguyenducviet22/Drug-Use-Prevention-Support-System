import { useState, useEffect } from "react"
import { Container, Row, Col, Button } from "react-bootstrap"
import { useParams } from "react-router-dom"
import { Clock, MapPin, Users, CircleDot } from "lucide-react"
import "./EventDetails.css"
import useFetch from "../../hooks/useFetch"
import Recommendation from "../../components/others/Recommendation"
import ErrorMessage from "../../components/ErrorMessage"
import BackButton from "../../components/BackButton"
import LoadingSpinner from "../../components/LoadingSpinner"
import NotFound from "../not-found/NotFound"

const EventDetails = () => {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  // const { loading, error, get } = useFetch()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Mock data for development/preview
  // useEffect(() => {
  //   const fetchEvents = async () => {
  //     try {
  //       const eventData = await get(`http://localhost:8080/api/event/${id}`)
  //       setEvent(eventData)
  //     } catch (error) {
  //       console.error("Fetch error in BlogsDetails:", error)
  //     }
  //   }

  //   fetchEvents()
  // }, [id])

  useEffect(() => {
    if (process.env.NODE_ENV === "development" && !event) {
      setEvent({
        id: id,
        title: "Say No to Drugs – Start with Yourself",
        subtitle: "Community Education Program on Drug Prevention",
        participants: 182,
        ageGroup: "All Ages",
        duration: "3 hours",
        price: "Free",
        image: "https://img.freepik.com/free-vector/flat-international-day-against-drug-abuse-illicit-trafficking-banner_23-2149420846.jpg?ga=GA1.1.1117822287.1749529273&semt=ais_hybrid&w=740",
        introduction:
          "'Say No to Drugs – Start with Yourself' is a special workshop for young people, with the aim of raising awareness and building skills to refuse drugs confidently and effectively in real-life situations.",
        programContent: [
          "Identify high-risk situations that lead to drug use",
          "Practice assertive refusal skills while maintaining social relationships",
          "Hear real-life stories from former addicts and those who have successfully recovered",
          "Understand your role in preventing drug use for yourself and your community",
          "How to be a positive influence in your group",
        ],
        time: "Oct/15/2023 · 14:00-16:30",
        location: "FPT University Ho Chi Minh City",
        capacity: "70 people",
        status: "Available",
      })
      setLoading(false)
    }
  }, [id, event])

  console.log(event);

  <Container className="py-5" >
    <LoadingSpinner loading={loading} />
    <ErrorMessage error={error} />
  </Container >

  if (!event) {
    return (
      <NotFound
        code="📅"
        title="Event Not Found"
        message="We couldn't find the event you're looking for."
        backLink="/events"
        backText="Back to Events"
      />
    )
  }

  return (
    <Container className="event-details-container py-4">
      <BackButton label="Back" />

      <h1 className="event-title text-center">{event.title}</h1>
      <p className="event-subtitle text-center text-muted mb-4">{event.subtitle}</p>

      <Row className="event-stats mb-4">
        <Col xs={6} md={3}>
          <div className="stat-card">
            <div className="stat-value">{event.participants}</div>
            <div className="stat-label">Participants</div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="stat-card">
            <div className="stat-value">{event.ageGroup}</div>
            <div className="stat-label">&nbsp;</div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="stat-card">
            <div className="stat-value">{event.duration}</div>
            <div className="stat-label">&nbsp;</div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="stat-card">
            <div className="stat-value">{event.price}</div>
            <div className="stat-label">&nbsp;</div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={8} className="mb-4">
          <div className="event-image-container mb-4">
            <img
              src={event.image || "/placeholder.svg?height=300&width=300"}
              alt={event.title}
              className="event-image"
            />
          </div>

          <div className="event-content">
            <h2 className="content-heading">Introduction</h2>
            <p>{event.introduction}</p>

            <h2 className="content-heading">Program content (What you will learn)</h2>
            <p>The event includes:</p>
            <ul className="program-list">
              {event.programContent.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </Col>

        <Col lg={4}>
          <div className="event-sidebar">
            <Button variant="primary" size="lg" className="register-button w-100 mb-4">
              Register
            </Button>

            <h3 className="sidebar-heading text-center mb-3">Details</h3>

            <div className="detail-card mb-3">
              <div className="detail-label">Time:</div>
              <div className="detail-value">
                <Clock size={18} className="detail-icon" />
                <span>{event.time}</span>
              </div>
            </div>

            <div className="detail-card mb-3">
              <div className="detail-label">Location:</div>
              <div className="detail-value">
                <MapPin size={18} className="detail-icon" />
                <span>{event.location}</span>
              </div>
            </div>

            <div className="detail-card mb-3">
              <div className="detail-label">Capacity:</div>
              <div className="detail-value">
                <Users size={18} className="detail-icon" />
                <span>{event.capacity}</span>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-label">Status:</div>
              <div className="detail-value status-available">
                <CircleDot size={18} className="detail-icon" />
                <span>{event.status}</span>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Related Events Section */}
      <Recommendation type="event" />
    </Container>
  )
}

export default EventDetails
