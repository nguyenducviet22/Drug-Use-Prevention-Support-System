"use client"

import { Container, Row, Col, Button, Card } from "react-bootstrap"
import { Syringe, LinkIcon, CheckCircle, Eye, MapPin, Clock, Users, Video, User, BookOpen, ShieldX } from "lucide-react"
import "./HomeExplore.css"

const HomeExplore = () => {
  const blogPosts = [
    {
      id: 1,
      title: "5 Warning Signs of Drug Addiction",
      description: "Early detection for timely intervention",
      author: "Ainsworth Hulters",
      timeAgo: "1 days ago",
      views: 122,
      icon: <Syringe size={32} />,
    },
    {
      id: 2,
      title: "Success Story: Overcoming Addiction",
      description: "Early detection for timely intervention",
      author: "Henrick Sawyer",
      timeAgo: "5 hours ago",
      views: 43,
      icon: <CheckCircle size={32} />,
    },
  ]

  const events = [
    {
      id: 1,
      title: "Drug Awareness Week 2025",
      time: "July 10-15, 2025",
      location: "FPT University – Ho Chi Minh City Campus",
      description: "A week to raise awareness about the harmful effects of drugs through a series of activities:",
      activities: [
        "Photo exhibition 'Dark corners of life'",
        "Talkshow 'Try once, pay for life'",
        "Interact with people who have successfully recovered",
        "Minigame and distribute propaganda leaflets",
      ],
    },
    {
      id: 2,
      title: "Workshop: Refusal Skills & Coping with Pressure",
      time: "03/08/2025 – 14:00 to 16:00",
      platform: "Zoom (Online Event)",
      speaker: "Dr. Elias William - School psychology expert",
      contents: [
        "How to recognize drug invitations",
        "Skills to say 'No' while maintaining relationships",
        "The role of healthy friendship groups",
        "Q&A with experts",
      ],
    },
  ]

  const popularCourses = [
    {
      id: 1,
      title: "Awareness of synthetic drugs",
      description: "Learn about common drugs and their effects",
      icon: <BookOpen size={32} />,
    },
    {
      id: 2,
      title: "Prevention skills in the university environment",
      description: "Learn to protect yourself in a new environment",
      icon: <ShieldX size={32} />,
    },
    {
      id: 3,
      title: "A Guide to Talking to Your Kids About Drugs",
      description: "Sensitive and effective approach to children",
      icon: <Users size={32} />,
    },
  ]

  return (
    <div className="home-explore">
      {/* New Blogs Section */}
      <Container className="mb-5">
        <div className="bg-light rounded-4 p-4">
          <h3 className="fw-bold text-dark mb-4">New Blogs</h3>
          <Row>
            {blogPosts.map((post) => (
              <Col md={6} key={post.id} className="mb-4">
                <Card className="h-100 border-0 shadow-sm blog-card">
                  <div className="blog-icon-section bg-primary bg-opacity-25 p-4 text-center">
                    <div className="text-dark">
                      {post.icon}
                      <LinkIcon size={24} className="ms-2" />
                    </div>
                  </div>
                  <Card.Body>
                    <Card.Title className="fw-bold text-dark mb-2">{post.title}</Card.Title>
                    <Card.Text className="text-muted mb-3">{post.description}</Card.Text>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <small className="text-muted">
                        by {post.author} • {post.timeAgo}
                      </small>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center text-muted">
                        <Eye size={16} className="me-1" />
                        <small>{post.views}</small>
                      </div>
                      <Button variant="primary" size="sm">
                        Read now
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </Container>

      {/* Events Section */}
      <Container className="mb-5">
        <div className="bg-light rounded-4 p-4">
          <h3 className="fw-bold text-dark mb-4">Events</h3>
          <Row>
            {events.map((event) => (
              <Col md={6} key={event.id} className="mb-4">
                <Card className="h-100 border-0 shadow-sm event-card">
                  <Card.Body className="p-4">
                    <Card.Title className="fw-bold text-dark mb-3 fs-5">{event.title}</Card.Title>

                    <div className="mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <Clock size={16} className="text-danger me-2" />
                        <span className="text-danger fw-semibold">Time:</span>
                        <span className="ms-1">{event.time}</span>
                      </div>

                      {event.location && (
                        <div className="d-flex align-items-center mb-2">
                          <MapPin size={16} className="text-danger me-2" />
                          <span className="text-danger fw-semibold">Location:</span>
                          <span className="ms-1">{event.location}</span>
                        </div>
                      )}

                      {event.platform && (
                        <div className="d-flex align-items-center mb-2">
                          <Video size={16} className="text-danger me-2" />
                          <span className="text-danger fw-semibold">Platform:</span>
                          <span className="ms-1">{event.platform}</span>
                        </div>
                      )}

                      {event.speaker && (
                        <div className="d-flex align-items-center mb-2">
                          <User size={16} className="text-danger me-2" />
                          <span className="text-danger fw-semibold">Speaker:</span>
                          <span className="ms-1">{event.speaker}</span>
                        </div>
                      )}
                    </div>

                    {event.description && (
                      <div className="mb-3">
                        <span className="text-danger fw-semibold">Description:</span>
                        <p className="mb-2 mt-1">{event.description}</p>
                      </div>
                    )}

                    {event.activities && (
                      <ul className="mb-3 ps-3">
                        {event.activities.map((activity, index) => (
                          <li key={index} className="mb-1">
                            {activity}
                          </li>
                        ))}
                      </ul>
                    )}

                    {event.contents && (
                      <div className="mb-3">
                        <span className="text-danger fw-semibold">Contents:</span>
                        <ul className="mb-0 mt-1 ps-3">
                          {event.contents.map((content, index) => (
                            <li key={index} className="mb-1">
                              {content}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="text-center mt-4">
                      <Button variant="primary" className="px-4">
                        Attend
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </Container>

      {/* Popular Courses Section */}
      <Container className="mb-5">
        <div className="bg-light rounded-4 p-4">
          <h3 className="fw-bold text-dark mb-4">Popular Courses</h3>
          <Row>
            {popularCourses.map((course) => (
              <Col md={4} key={course.id} className="mb-4">
                <Card className="h-100 border-0 shadow-sm course-card">
                  <div className="course-icon-section bg-primary bg-opacity-25 p-4 text-center">
                    <div className="text-dark">{course.icon}</div>
                  </div>
                  <Card.Body className="p-4 text-center">
                    <Card.Title className="fw-bold text-dark mb-3 fs-6">{course.title}</Card.Title>
                    <Card.Text className="text-muted mb-4 fst-italic">{course.description}</Card.Text>
                    <Button variant="primary" className="px-4">
                      Register
                    </Button>
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

export default HomeExplore
