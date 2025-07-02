import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Modal } from 'react-bootstrap'; // Import Modal
import {
  Calendar,
  Video,
  TrendingUp,
  FileText,
  AlertTriangle,
  Plus,
  Heart, // Import Heart icon
  Calendar as CalendarIcon // Alias Calendar for the modal section if needed
} from 'lucide-react';
import './HomeConsultant.css';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import { useTranslation } from "react-i18next"; // Import useTranslation

function HomeConsultant() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation("homeConsultant"); // Use the new namespace

  const [todayAppointments, setTodayAppointments] = useState([]);
  const [totalAppointmentsAndMembers, setTotalAppointmentsAndMembers] = useState({});
  const [totalMembers, setTotalMembers] = useState([]);
  const { get: getTodayAppointments, get: getTotalAppointmentsAndMembers, get: getTotalMembers } = useFetch();

  // State for the Health Status Modal
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [selectedMemberHealth, setSelectedMemberHealth] = useState(null); // To store data for the modal

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user) {
          const todayAppointmentsResponse = await getTodayAppointments(`http://localhost:8080/api/appointment/today/consultant/${user?.username}`);
          setTodayAppointments(todayAppointmentsResponse);
          const totalAppointmentsAndMembersResponse = await getTotalAppointmentsAndMembers(`http://localhost:8080/api/appointment/count-appointments-members/consultant/${user?.username}`);
          setTotalAppointmentsAndMembers(totalAppointmentsAndMembersResponse);
          const totalMembersResponse = await getTotalMembers(`http://localhost:8080/api/user/${user?.username}/members`);
          setTotalMembers(totalMembersResponse);
        }
      } catch (error) {
        console.error('Fetch error in HomeConsultant:', error);
      }
    };

    fetchData();
  }, [user, getTodayAppointments, getTotalAppointmentsAndMembers, getTotalMembers]);
  console.log(totalMembers);
  console.log(todayAppointments);
  console.log(totalAppointmentsAndMembers);

  // Function to open the modal
  const handleViewDetails = (member) => {
    setSelectedMemberHealth(member.healthData); // Assuming member object has healthData
    setShowHealthModal(true);
  };

  // Function to close the modal
  const handleCloseHealthModal = () => {
    setShowHealthModal(false);
    setSelectedMemberHealth(null); // Clear selected member data
  };

  const handleClickCalendar = () => {
    navigate('/availability')
  }

  return (
    <div className="min-vh-100">
      <Container className="py-4">
        {/* Enhanced Welcome Header */}
        <div className="welcome-header">
          <Row className="align-items-center">
            <Col md={8}>
              <h2 className="mb-2">{t('goodMorning', { username: user?.username })}</h2>
              <p className="text-muted mb-0">
                {t('todayIs', {
                  date: new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                })}
              </p>
            </Col>
            <Col md={4} className="text-end">
              <Button variant="primary" className="btn-custom btn-primary-custom me-2"
                onClick={() => handleClickCalendar()}>
                <Calendar className="me-2" size={16} />
                {t('viewFullAvailability')}
              </Button>
            </Col>
          </Row>
        </div>

        {/* Enhanced Stats Overview */}
        <Row className="mb-4">
          <Col md={4}>
            <Card className="stats-card">
              <div className="stats-number">{todayAppointments.length}</div>
              <div className="stats-label">{t('todaysAppointments')}</div>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="stats-card">
              <div className="stats-number">{totalAppointmentsAndMembers.totalMembersOfConsultant}</div>
              <div className="stats-label">{t('totalAdvisedClients')}</div>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="stats-card">
              <div className="stats-number">{totalAppointmentsAndMembers.totalConsultantAppointments}</div>
              <div className="stats-label">{t('totalAppointments')}</div>
            </Card>
          </Col>
        </Row>

        <Row>
          {/* Enhanced Today's Appointments */}
          <Col lg={6} className="mb-4">
            <Card className="card-custom h-100">
              <Card.Header className="card-header-custom">
                <h5 className="mb-0">
                  <Calendar className="me-2" size={20} />
                  {t('todaysAppointments')}
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                {todayAppointments.length > 0 ? (
                  todayAppointments.filter(appointment => new Date(appointment.appointmentDateTime) >= new Date()
                  ).map((appointment) => (
                    <div key={appointment.id} className="appointment-item">
                      <div className="appointment-info bg-light rounded-3 p-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <h6 className="fw-bold text-dark mb-1">{appointment.member.username}</h6>
                          </div>
                          <span className="badge bg-warning text-dark">{appointment.status}</span>
                        </div>
                        <div className="appointment-time mt-3">
                          <div className="fw-semibold text-primary">{appointment.appointmentDateTime}</div>
                        </div>
                      </div>
                      <Row className="mt-3">
                        <Col>
                          <Button
                            variant="primary"
                            size="sm"
                            className="btn-custom btn-primary-custom"
                            onClick={() => window.open(appointment.link)}
                          >
                            <Video size={14} className="me-1" />
                            {t('joinMeeting')}
                          </Button>
                        </Col>
                      </Row>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-muted">{t('noAppointmentsToday')}</div>
                )}
                <div className="p-3 text-center border-top">
                  <Button variant="primary" className="btn-custom btn-primary-custom">
                    <Plus className="me-2" size={16} />
                    {t('viewAllAppointments')}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Enhanced Member Progress Tracker */}
          <Col lg={6} className="mb-4">
            <Card className="card-custom h-100">
              <Card.Header className="card-header-custom">
                <h5 className="mb-0">
                  <TrendingUp className="me-2" size={20} />
                  {t('memberTracker')}
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                {totalMembers.map((member) => (
                  <div key={member.id} className="progress-item">
                    <Row className="align-items-center">
                      <Col md={4}>
                        <div className="fw-bold mb-1">{member.username}</div>
                      </Col>
                      <Col md={4}>
                        <div className="small text-muted mb-2">{t('lastAppointment', { date: member.lastSession })}</div>
                      </Col>
                      <Col md={4}>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="btn-outline-custom me-2"
                          onClick={() => handleViewDetails(member)} // Call handler to open modal
                        >
                          <FileText size={14} className="me-1" />
                          {t('viewDetails')}
                        </Button>
                      </Col>
                    </Row>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Health Status Modal */}
      <Modal show={showHealthModal} onHide={handleCloseHealthModal} centered>
        <Modal.Header closeButton className="card-header-custom bg-primary text-white">
          <Modal.Title className="d-flex align-items-center">
            <Heart size={24} className="me-2" />
            {t('healthStatusDetails')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedMemberHealth ? (
            <>
              <div className="health-item mb-3">
                <div className="d-flex align-items-center mb-2">
                  <div className="health-icon mental-health me-2"></div>
                  <span className="health-label">{t('mentalHealth')}</span>
                  <span className="health-value ms-1">{selectedMemberHealth.mentalHealth}</span>
                </div>
              </div>

              <div className="health-item mb-3">
                <div className="d-flex align-items-center mb-2">
                  <div className="health-icon physical-health me-2"></div>
                  <span className="health-label">{t('physicalHealth')}</span>
                  <span className="health-value ms-1">{selectedMemberHealth.physicalHealth}</span>
                </div>
              </div>

              <div className="health-item mb-3">
                <div className="d-flex align-items-center mb-2">
                  <div className="health-icon drug-use me-2"></div>
                  <span className="health-label text-danger">{t('lastDrugUse')}</span>
                  <span className="health-value ms-1">{selectedMemberHealth.lastDrugUse}</span>
                </div>
              </div>

              <div className="health-item mb-3">
                <div className="d-flex align-items-center mb-2">
                  <div className="health-icon crafft-score me-2"></div>
                  <span className="health-label text-danger">{t('crafftScore')}</span>
                  <span className="health-value ms-1">{selectedMemberHealth.crafftScore}</span>
                </div>
              </div>

              <div className="health-item mb-3">
                <div className="d-flex align-items-center mb-2">
                  <div className="health-icon counseling me-2"></div>
                  <span className="health-label text-danger">{t('lastCounseling')}</span>
                  <span className="health-value ms-1">{selectedMemberHealth.lastCounseling}</span>
                </div>
              </div>

              <div className="warning-section mb-3">
                <div className="d-flex align-items-center mb-2">
                  <AlertTriangle size={16} className="text-warning me-2" />
                  <span className="health-label text-warning">{t('warning')}</span>
                  <span className="health-value ms-1">{selectedMemberHealth.warning}</span>
                </div>
              </div>

              <div className="action-section">
                <div className="d-flex align-items-center">
                  <CalendarIcon size={16} className="text-primary me-2" />
                  <span className="health-label text-primary">{t('action')}</span>
                  <span className="health-value ms-1">{selectedMemberHealth.action}</span>
                </div>
              </div>
            </>
          ) : (
            <p>{t('noHealthDataAvailable')}</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseHealthModal}>
            {t('close')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default HomeConsultant;