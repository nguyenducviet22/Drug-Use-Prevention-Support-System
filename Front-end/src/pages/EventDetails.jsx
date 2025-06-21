// import { useState, useEffect } from "react";
// import { Container, Row, Col, Button } from "react-bootstrap";
// import { useParams } from "react-router-dom";
// import { Clock, MapPin, Users, CircleDot } from "lucide-react";
// import "./EventDetails.css";
// import useFetch from "../hooks/useFetch";
// import Recommendation from "../components/Recommendation";
// import ErrorMessage from "../components/ErrorMessage";
// import BackButton from "../components/BackButton";
// import LoadingSpinner from "../components/LoadingSpinner";
// import NotFound from "./NotFound";

// const EventDetails = () => {
//   const { id } = useParams();
//   const [event, setEvent] = useState(null);
//   // const { loading, error, get } = useFetch()
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchEvent = async () => {
//       setLoading(true);
//       try {
//         const response = await fetch(`http://localhost:8080/api/event/${id}`);
//         const result = await response.json();
//         setEvent(result.data);
//       } catch (error) {
//         setError("Failed to fetch event details");
//         console.error("Fetch event error:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchEvent();
//   }, [id]);

//   console.log(event);

//   // <Container className="py-5">
//   //   <LoadingSpinner loading={loading} />
//   //   <ErrorMessage error={error} />
//   // </Container>;

//   if (loading) {
//     return (
//       <Container className="py-5">
//         <LoadingSpinner loading={true} />
//       </Container>
//     );
//   }

//   if (error) {
//     return (
//       <Container className="py-5">
//         <ErrorMessage error={error} />
//       </Container>
//     );
//   }

//   if (!event) {
//     return (
//       <NotFound
//         code="📅"
//         title="Event Not Found"
//         message="We couldn't find the event you're looking for."
//         backLink="/events"
//         backText="Back to Events"
//       />
//     );
//   }

//   return (
//     <Container className="event-details-container py-4">
//       <BackButton label="Back" />

//       <h1 className="event-title text-center">{event.title}</h1>
//       <p className="event-subtitle text-center text-muted mb-4">
//         {event.subtitle}
//       </p>

//       <Row className="event-stats mb-4">
//         <Col xs={6} md={3}>
//           <div className="stat-card">
//             <div className="stat-value">{event.participants}</div>
//             <div className="stat-label">Participants</div>
//           </div>
//         </Col>
//         <Col xs={6} md={3}>
//           <div className="stat-card">
//             <div className="stat-value">{event.ageGroup}</div>
//             <div className="stat-label">&nbsp;</div>
//           </div>
//         </Col>
//         <Col xs={6} md={3}>
//           <div className="stat-card">
//             <div className="stat-value">{event.duration}</div>
//             <div className="stat-label">&nbsp;</div>
//           </div>
//         </Col>
//         <Col xs={6} md={3}>
//           <div className="stat-card">
//             <div className="stat-value">{event.price}</div>
//             <div className="stat-label">&nbsp;</div>
//           </div>
//         </Col>
//       </Row>

//       <Row>
//         <Col lg={8} className="mb-4">
//           <div className="event-image-container mb-4">
//             <img
//               src={event.image || "/placeholder.svg?height=300&width=300"}
//               alt={event.title}
//               className="event-image"
//             />
//           </div>

//           <div className="event-content">
//             <h2 className="content-heading">Introduction</h2>
//             <p>{event.introduction}</p>

//             <h2 className="content-heading">
//               Program content (What you will learn)
//             </h2>
//             <p>The event includes:</p>
//             <ul className="program-list">
//               {event.programContent.map((item, index) => (
//                 <li key={index}>{item}</li>
//               ))}
//             </ul>
//           </div>
//         </Col>

//         <Col lg={4}>
//           <div className="event-sidebar">
//             <Button
//               variant="primary"
//               size="lg"
//               className="register-button w-100 mb-4"
//             >
//               Register
//             </Button>

//             <h3 className="sidebar-heading text-center mb-3">Details</h3>

//             <div className="detail-card mb-3">
//               <div className="detail-label">Time:</div>
//               <div className="detail-value">
//                 <Clock size={18} className="detail-icon" />
//                 <span>{event.time}</span>
//               </div>
//             </div>

//             <div className="detail-card mb-3">
//               <div className="detail-label">Location:</div>
//               <div className="detail-value">
//                 <MapPin size={18} className="detail-icon" />
//                 <span>{event.location}</span>
//               </div>
//             </div>

//             <div className="detail-card mb-3">
//               <div className="detail-label">Capacity:</div>
//               <div className="detail-value">
//                 <Users size={18} className="detail-icon" />
//                 <span>{event.capacity}</span>
//               </div>
//             </div>

//             <div className="detail-card">
//               <div className="detail-label">Status:</div>
//               <div className="detail-value status-available">
//                 <CircleDot size={18} className="detail-icon" />
//                 <span>{event.status}</span>
//               </div>
//             </div>
//           </div>
//         </Col>
//       </Row>

//       {/* Related Events Section */}
//       <Recommendation type="event" />
//     </Container>
//   );
// };

// export default EventDetails;

import { useState, useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { Clock, MapPin, Users, CircleDot } from "lucide-react";
import "./EventDetails.css";
import Recommendation from "../components/Recommendation";
import ErrorMessage from "../components/ErrorMessage";
import BackButton from "../components/BackButton";
import LoadingSpinner from "../components/LoadingSpinner";
import NotFound from "./NotFound";
import { formatEventDateAndTimeRange } from "../utils/dateUtils.js";

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8080/api/event/${id}`);
        const result = await response.json();
        setEvent(result.data);
      } catch (error) {
        setError("Failed to fetch event details");
        console.error("Fetch event error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  let dateStr = "",
    timeStr = "";
  if (event) {
    const formatted = formatEventDateAndTimeRange(
      event.startDate,
      event.endDate
    );
    dateStr = formatted.dateStr;
    timeStr = formatted.timeStr;
  }

  if (loading) {
    return (
      <Container className="py-5">
        <LoadingSpinner loading={true} />
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

  if (!event) {
    return (
      <NotFound
        code="📅"
        title="Event Not Found"
        message="We couldn't find the event you're looking for."
        backLink="/events"
        backText="Back to Events"
      />
    );
  }

  return (
    <Container className="event-details-container py-4">
      <BackButton label="Back" />

      <h1 className="event-title text-center">{event.eventName}</h1>
      <p className="event-subtitle text-center text-muted mb-4">
        {event.subTitle}
      </p>

      <Row className="event-stats mb-4">
        <Col xs={6} md={3}>
          <div className="stat-card">
            <div className="stat-value">{event.quantity}</div>
            <div className="stat-label">Participants</div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="stat-card">
            <div className="stat-value">{event.ageGroup}</div>
            <div className="stat-label">Age Group</div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="stat-card">
            <div className="stat-value">{event.duration} mins</div>
            <div className="stat-label">Duration</div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="stat-card">
            <div className="stat-value">
              {event.fee != null && event.fee === 0 ? "FREE" : `$${event.fee}`}
            </div>
            <div className="stat-label">Fee</div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={8} className="mb-4">
          <div className="event-image-container mb-4">
            <img
              src={event.img || "/placeholder.svg?height=300&width=300"}
              alt={event.eventName}
              className="event-image"
            />
          </div>

          <div className="event-content">
            <h2 className="content-heading">Introduction</h2>
            <p>{event.description}</p>

            <h2 className="content-heading">
              Program content (What you will learn)
            </h2>
            <p>{event.details}</p>
          </div>
        </Col>

        <Col lg={4}>
          <div className="event-sidebar">
            <Button
              variant="primary"
              size="lg"
              className="register-button w-100 mb-4"
            >
              Register
            </Button>

            <h3 className="sidebar-heading text-center mb-3">Details</h3>

            <div className="detail-card mb-3">
              <div className="detail-label">Time:</div>
              <div className="detail-value">
                <Clock size={18} className="detail-icon" />
                <span>
                  <div>{dateStr}</div>
                  <div>{timeStr}</div>
                </span>
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
                <span>{event.quantity}</span>
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

      <Recommendation type="event" />
    </Container>
  );
};

export default EventDetails;
