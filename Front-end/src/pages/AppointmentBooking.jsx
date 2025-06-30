import { useEffect, useRef, useState } from "react"
import { Container, Row, Col, Card, Button, Form, Modal, Dropdown } from "react-bootstrap"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import "./AppointmentBooking.css"
import useFetch from "../hooks/useFetch"
import { toast } from "react-toastify"
import { format } from 'date-fns'

const AppointmentBooking = () => {
    const [calendarView, setCalendarView] = useState("timeGridWeek")
    const calendarRef = useRef(null)
    const [selectedConsultant, setSelectedConsultant] = useState(null)
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)
    const [appointmentNote, setAppointmentNote] = useState("")
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [showConsultantDropdown, setShowConsultantDropdown] = useState(false)
    const [consultants, setConsultants] = useState([])
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const [currentViewRange, setCurrentViewRange] = useState({
        start: format(today, 'yyyy-MM-dd'),
        end: format(nextWeek, 'yyyy-MM-dd'),
    });
    const { loading: loadingConsultants, error: errorConsultants, get: getConsultants } = useFetch()
    const { loading: loadingAvailabilities, error: errorAvailabilities, get: getAvailabilities } = useFetch()
    const { loading: loadingNewAppointment, error: errorNewAppointment, post: postNewAppointment } = useFetch()
    const [calendarEvents, setCalendarEvents] = useState([])

    const transformToCalendarEvents = (rawData, consultantID) => {
        if (!rawData || !Array.isArray(rawData)) {
            console.warn("Invalid rawData format:", rawData);
            return [];
        }

        const now = new Date();

        return rawData.map(timeString => {
            const slotStart = new Date(timeString);
            const slotEnd = new Date(slotStart);
            slotEnd.setHours(slotStart.getHours() + 1);

            const id = `${consultantID}-${slotStart.toISOString()}`;
            const isAvailableForBooking = slotStart > now; // Only check if in the past

            return {
                id: id,
                title: isAvailableForBooking ? "Available" : "Past/Unavailable",
                start: slotStart.toISOString(),
                end: slotEnd.toISOString(),
                backgroundColor: isAvailableForBooking ? "#28a745" : "#6c757d",
                borderColor: isAvailableForBooking ? "#28a745" : "#6c757d",
                textColor: "#ffffff",
                extendedProps: {
                    consultantID: consultantID,
                    available: isAvailableForBooking,
                    type: "available-slot",
                },
            };
        });
    };

    const handleDatesSet = (dateInfo) => {
        const newStartDate = format(dateInfo.start, 'yyyy-MM-dd');
        const newEndDate = format(dateInfo.end, 'yyyy-MM-dd');
        setCurrentViewRange({
            start: newStartDate,
            end: newEndDate,
        });

        if (selectedConsultant) {
            fetchConsultantAvailabilities(selectedConsultant.username, newStartDate, newEndDate);
        }
    };

    const fetchConsultantAvailabilities = async (username, fromDate, toDate) => {
        try {
            const specificConsultantAvailabilities = await getAvailabilities(
                `http://localhost:8080/api/appointment/available?username=${username}&from=${fromDate}&to=${toDate}`
            );
            console.log("Raw availabilities from backend:", specificConsultantAvailabilities);
            const transformedEvents = transformToCalendarEvents(specificConsultantAvailabilities, username);
            setCalendarEvents(transformedEvents);
        } catch (error) {
            console.error("Error fetching consultant's availabilities:", error);
            setCalendarEvents([]);
            toast.error("Failed to load consultant's available slots.", "danger");
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const consultantsData = await getConsultants("http://localhost:8080/api/user/consultants");
                setConsultants(consultantsData)
            } catch (error) {
                console.error("Fetch error in Appointment Booking:", error);
            }
        }

        fetchData()
    }, [getConsultants])
    console.log(consultants);

    const handleConsultantSelect = async (consultant) => {
        setSelectedConsultant(consultant)
        setShowConsultantDropdown(false)
        setSelectedTimeSlot(null) // Reset time slot when consultant changes

        fetchConsultantAvailabilities(consultant.username, currentViewRange.start, currentViewRange.end);
    }
    console.log(calendarEvents);

    const handleEventClick = (clickInfo) => {
        const event = clickInfo.event

        // Only handle available slots
        if (event.extendedProps.type === "available-slot" && event.extendedProps.available) {
            // Clear previous selection
            const updatedEvents = calendarEvents.map(evt => {
                if (evt.backgroundColor === "#4285f4") {
                    return { ...evt, backgroundColor: "#28a745", borderColor: "#28a745", title: "Available" };
                }
                return evt;
            });

            // Find and update the clicked event
            const clickedEventIndex = updatedEvents.findIndex(evt => evt.id === event.id);
            if (clickedEventIndex > -1) {
                updatedEvents[clickedEventIndex] = {
                    ...updatedEvents[clickedEventIndex],
                    backgroundColor: "#4285f4",
                    borderColor: "#4285f4",
                    title: "Selected"
                };
            }

            // Set selected time slot
            setSelectedTimeSlot({
                id: event.id,
                start: event.start,
                end: event.end,
                consultant: selectedConsultant,
                formattedDate: event.start.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                }),
                formattedTime: event.start.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                }),
            })

            setCalendarEvents(updatedEvents);
        } else {
            // Updated info message for unavailable slots
            toast.info("This slot is not available for booking (it might be in the past or already booked).");
        }
    }

    const handleSubmit = () => {
        if (!selectedConsultant || !selectedTimeSlot) {
            toast.error("Please select a consultant and time slot.");
            return
        }
        const now = new Date();
        if (selectedTimeSlot.start <= now) {
            toast.error("Cannot book an appointment in the past. Please select an upcoming slot.");
            setShowConfirmModal(false);
            return;
        }
        setShowConfirmModal(true)
    }

    const handleConfirmBooking = async () => {
        try {
            const now = new Date();
            if (selectedTimeSlot.start <= now) {
                toast.error("The selected time slot has passed. Please choose another one.");
                setShowConfirmModal(false);
                setSelectedConsultant(null);
                setSelectedTimeSlot(null);
                setAppointmentNote("");
                setCalendarEvents([]); // Clear calendar or refetch
                return;
            }

            const appointmentData = {
                consultantID: selectedConsultant.username,
                appointmentDateTime: selectedTimeSlot.start.toISOString(),
                note: appointmentNote,
            }
            console.log("Booking confirmed:", appointmentData)

            const response = await postNewAppointment(appointmentData, {}, "http://localhost:8080/api/appointment")
            console.log("response:", response)

            if (response) {
                setShowConfirmModal(false)
                setSelectedConsultant(null)
                setSelectedTimeSlot(null)
                setAppointmentNote("")
                if (selectedConsultant) {
                    fetchConsultantAvailabilities(selectedConsultant.username, currentViewRange.start, currentViewRange.end);
                } else {
                    setCalendarEvents([]);
                }
                toast.success("Booked appointment successfully")
            } else {
                toast.error("Error booking appointment: " + (response?.message || "Unknown error"));
            }
        } catch (error) {
            console.error("Error booking appointment:", error);
            toast.error("Error booking appointment. Please try again.");
        }
    }

    const calendarOptions = {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        initialView: calendarView,
        headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
        },
        height: 600,
        slotMinTime: "08:00:00",
        slotMaxTime: "18:00:00",
        businessHours: {
            daysOfWeek: [1, 2, 3, 4, 5],
            startTime: "09:00",
            endTime: "17:00",
        },
        weekends: false,
        eventClick: handleEventClick,
        eventMouseEnter: (info) => {
            if (info.event.extendedProps.available) {
                info.el.style.cursor = "pointer";
            } else {
                info.el.style.cursor = "not-allowed";
            }
        },
        eventDidMount: (info) => {
            const { available } = info.event.extendedProps;
            if (!available) {
                // If unavailable (past or booked)
                info.el.style.backgroundColor = "#6c757d"; // Darker grey
                info.el.style.borderColor = "#6c757d";
                info.el.style.color = "#ffffff";
                info.el.style.opacity = "0.7";
                info.el.style.cursor = "not-allowed";
                if (info.event.title !== "Past/Unavailable") {
                    info.event.setProp('title', "Past/Unavailable");
                }
            } else {
                // Available slot
                info.el.style.backgroundColor = "#28a745"; // Default green
                info.el.style.borderColor = "#28a745";
                info.el.style.color = "#ffffff";
                info.el.style.opacity = "1";
                info.el.style.cursor = "pointer";
                if (info.event.title === "Past/Unavailable") {
                    info.event.setProp('title', "Available");
                }
            }
        },
        dayHeaderFormat: { weekday: "short", day: "numeric" },
        slotLabelFormat: {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        },
        eventTimeFormat: {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        },
        datesSet: handleDatesSet,
    }

    return (
        <div className="appointment-booking-page">
            {/* Header Section */}
            <div className="booking-header">
                <Container>
                    <div className="text-center text-white py-5">
                        <h1 className="display-5 fw-bold mb-3">Book Consultation Appointment</h1>
                        <p className="lead">Schedule your session with our certified drug prevention specialists</p>
                    </div>
                </Container>
            </div>

            {/* Main Booking Section */}
            <Container className="py-5">
                <Row>
                    {/* Consultant Selection Sidebar */}
                    <Col lg={3} className="mb-4">
                        <Card className="consultant-card">
                            <Card.Body>
                                <Dropdown show={showConsultantDropdown} onToggle={setShowConsultantDropdown}>
                                    <Dropdown.Toggle
                                        variant="outline-primary"
                                        className="consultant-dropdown w-100 d-flex justify-content-between align-items-center"
                                        onClick={() => setShowConsultantDropdown(!showConsultantDropdown)}
                                    >
                                        <span>{selectedConsultant ? selectedConsultant.username : "Choose Consultant"}</span>
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu className="w-100 consultant-menu">
                                        {consultants.map((consultant) => (
                                            <div
                                                key={consultant.username}
                                                className="consultant-item"
                                                onClick={() => handleConsultantSelect(consultant)}
                                            >
                                                <div className="d-flex align-items-center">
                                                    <div
                                                        className="consultant-color-indicator me-2"
                                                        style={{ backgroundColor: consultant.color }}
                                                    ></div>
                                                    <div>
                                                        <div className="consultant-name">{consultant.username}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Calendar Section */}
                    <Col lg={9}>
                        <Card className="calendar-card">
                            <Card.Body>
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <h4 className="mb-0 text-primary fw-bold">Available Time Slots</h4>
                                </div>
                                {selectedConsultant ? (
                                    <div className="fullcalendar-container">
                                        <FullCalendar ref={calendarRef} {...calendarOptions} events={calendarEvents} />
                                    </div>
                                ) : (
                                    <div className="calendar-placeholder">
                                        <div className="text-center py-5">
                                            <div className="mb-3">
                                                <i className="fas fa-calendar-alt fa-3x text-muted"></i>
                                            </div>
                                            <h5 className="text-muted">Select a consultant to view available appointments</h5>
                                        </div>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>

                        {/* Appointment Information */}
                        {selectedTimeSlot && (
                            <Card className="appointment-info-card mt-4">
                                <Card.Body>
                                    <h4 className="text-primary fw-bold mb-4">Appointment Information</h4>

                                    <div className="selected-slot-info mb-4 p-3 bg-light rounded">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <strong>Consultant:</strong> {selectedTimeSlot.consultant.username}
                                            </div>
                                            <div className="col-md-6">
                                                <strong>Date:</strong> {selectedTimeSlot.formattedDate}
                                            </div>
                                            <div className="col-12 mt-2">
                                                <strong>Time:</strong> {selectedTimeSlot.formattedTime}
                                            </div>
                                        </div>
                                    </div>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="note-label">Note (Optional)</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={4}
                                            placeholder="Please share any specific concerns or topics you'd like to discuss..."
                                            value={appointmentNote}
                                            onChange={(e) => setAppointmentNote(e.target.value)}
                                            className="note-textarea"
                                        />
                                    </Form.Group>

                                    <div className="text-center">
                                        <Button variant="primary" size="lg" className="submit-btn" onClick={handleSubmit}>
                                            Submit
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        )}
                    </Col>
                </Row>
            </Container>

            {/* Confirmation Modal */}
            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
                <Modal.Body className="confirmation-modal">
                    <h4 className="modal-title mb-4">Book Summary</h4>

                    <div className="booking-details">
                        <div className="detail-row">
                            <span className="detail-label">Consultant:</span>
                            <span className="detail-value">{selectedConsultant?.username}</span>
                        </div>

                        <div className="detail-row">
                            <span className="detail-label">Date Time:</span>
                            <span className="detail-value">
                                {selectedTimeSlot?.formattedDate} at {selectedTimeSlot?.formattedTime}
                            </span>
                        </div>

                        {appointmentNote && (
                            <div className="detail-row">
                                <span className="detail-label">Note:</span>
                                <span className="detail-value">{appointmentNote}</span>
                            </div>
                        )}
                    </div>

                    <div className="text-center mt-4">
                        <Button variant="primary" size="lg" className="confirm-btn" onClick={handleConfirmBooking}>
                            Confirm
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    )
}

export default AppointmentBooking