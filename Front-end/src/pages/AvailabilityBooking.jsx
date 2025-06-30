import { useEffect, useRef, useState } from "react"
import { Container, Row, Col, Card, Button, Form, Modal, Dropdown } from "react-bootstrap"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import "./AvailabilityBooking.css"
import useFetch from "../hooks/useFetch"
import { toast } from "react-toastify"
import { format } from 'date-fns'
import { useAuth } from "../hooks/useAuth"

const AvailabilityBooking = () => {
    const { user } = useAuth()
    const consultantID = user?.username
    const [calendarView, setCalendarView] = useState("timeGridWeek")
    const calendarRef = useRef(null)
    const [selectedTimeSlots, setSelectedTimeSlots] = useState([])
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const [currentViewRange, setCurrentViewRange] = useState({
        start: format(today, 'yyyy-MM-dd'),
        end: format(nextWeek, 'yyyy-MM-dd'),
    });
    const { loading: loadingConsultantAvailableSlots, error: errorConsultantAvailableSlots, get: getConsultantAvailableSlots } = useFetch()
    const { loading: loadingNewAvailabilities, error: errorNewAvailabilities, post: postNewAvailabilities } = useFetch()
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
        fetchConsultantAvailableSlots(consultantID, newStartDate, newEndDate);
    };

    const fetchConsultantAvailableSlots = async (consultantID, fromDate, toDate) => {
        if (!consultantID || !fromDate || !toDate) {
            console.warn("Cannot fetch availabilities: missing consultantID, fromDate, or toDate.");
            return;
        }
        try {
            const consultantAvailableSlots = await getConsultantAvailableSlots(
                `http://localhost:8080/api/availability/available-slots?username=${consultantID}&from=${fromDate}&to=${toDate}`
            );
            const transformedEvents = transformToCalendarEvents(consultantAvailableSlots, consultantID);
            setCalendarEvents(transformedEvents);
        } catch (error) {
            console.error("Error fetching consultant's available slots:", error);
            setCalendarEvents([]);
            toast.error("Failed to load consultant's available slots.", "danger");
        }
    }

    useEffect(() => {
        if (consultantID) {
            fetchConsultantAvailableSlots(consultantID, currentViewRange.start, currentViewRange.end);
        }
    }, [consultantID, getConsultantAvailableSlots, currentViewRange.start, currentViewRange.end]);

    const handleEventClick = (clickInfo) => {
        const event = clickInfo.event;
        const now = new Date();

        if (event.extendedProps.type === "available-slot" && event.extendedProps.available) {
            const clickedSlot = {
                id: event.id,
                start: event.start,
                end: event.end,
                consultant: consultantID, // Thêm consultantID vào đây
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
            };

            // Kiểm tra xem slot đã được chọn chưa
            const isSelected = selectedTimeSlots.some(slot => slot.id === clickedSlot.id);

            let updatedSelectedSlots;
            let updatedCalendarEvents = [...calendarEvents];
            const eventIndexInCalendar = updatedCalendarEvents.findIndex(evt => evt.id === event.id);

            if (isSelected) {
                // Nếu đã chọn, bỏ chọn (xóa khỏi mảng và đổi màu về mặc định)
                updatedSelectedSlots = selectedTimeSlots.filter(slot => slot.id !== clickedSlot.id);
                if (eventIndexInCalendar > -1) {
                    updatedCalendarEvents[eventIndexInCalendar] = {
                        ...updatedCalendarEvents[eventIndexInCalendar],
                        backgroundColor: "#28a745", // Màu xanh mặc định
                        borderColor: "#28a745",
                        title: "Available"
                    };
                }
                toast.info("Availability slot unselected.");
            } else {
                // Nếu chưa chọn, thêm vào (thêm vào mảng và đổi màu thành đã chọn)
                if (clickedSlot.start <= now) {
                    toast.error("Cannot select an availability in the past.");
                    return;
                }
                updatedSelectedSlots = [...selectedTimeSlots, clickedSlot];
                if (eventIndexInCalendar > -1) {
                    updatedCalendarEvents[eventIndexInCalendar] = {
                        ...updatedCalendarEvents[eventIndexInCalendar],
                        backgroundColor: "#4285f4", // Màu xanh dương đã chọn
                        borderColor: "#4285f4",
                        title: "Selected"
                    };
                }
                toast.success("Availability slot selected.");
            }

            setSelectedTimeSlots(updatedSelectedSlots);
            setCalendarEvents(updatedCalendarEvents);
        } else {
            toast.info("This slot is not available for booking (it might be in the past or already booked).");
        }
    }

    const handleSubmit = () => {
        if (selectedTimeSlots.length === 0) {
            toast.warn("Please select at least one availability slot.");
            return;
        }

        const now = new Date();
        const futureSlots = selectedTimeSlots.filter(slot => slot.start > now);

        if (futureSlots.length !== selectedTimeSlots.length) {
            toast.error("Some selected slots are in the past and cannot be booked. Please review your selection.");
        }

        setShowConfirmModal(true);
    }

    const handleConfirmBooking = async () => {
        try {
            const now = new Date();
            const slotsToBook = selectedTimeSlots.filter(slot => slot.start > now);

            if (slotsToBook.length === 0) {
                toast.error("No valid upcoming slots selected for booking.");
                setShowConfirmModal(false);
                setSelectedTimeSlots([]);
                // Refetch to clear any potentially stale selections
                if (consultantID) {
                    fetchConsultantAvailableSlots(consultantID, currentViewRange.start, currentViewRange.end);
                }
                return;
            }

            // Tạo mảng các chuỗi ISO datetime từ các slot đã chọn
            const availabilityDateTimes = slotsToBook.map(slot => slot.start.toISOString());

            const availabilitiesData = {
                availabilityDateTimes: availabilityDateTimes
            }
            console.log("Booking availabilities confirmed:", availabilitiesData)

            const response = await postNewAvailabilities(availabilitiesData, {}, "http://localhost:8080/api/availability");
            console.log("response:", response)

            if (response) {
                setShowConfirmModal(false)
                setSelectedTimeSlots([]) // Clear selected slots
                if (user) {
                    // Refetch availabilities to update the calendar display
                    fetchConsultantAvailableSlots(user.username, currentViewRange.start, currentViewRange.end);
                } else {
                    setCalendarEvents([]);
                }
                toast.success("Booked availability successfully")
            } else {
                toast.error("Error booking availability: " + (response?.message || "Unknown error"));
            }
        } catch (error) {
            console.error("Error booking availability:", error);
            toast.error("Error booking availability. Please try again.");
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
            const isCurrentlySelected = selectedTimeSlots.some(slot => slot.id === info.event.id);

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
            } else if (isCurrentlySelected) {
                // If available AND currently selected
                info.el.style.backgroundColor = "#4285f4"; // Màu xanh dương đã chọn
                info.el.style.borderColor = "#4285f4";
                info.el.style.color = "#ffffff";
                info.el.style.opacity = "1";
                info.el.style.cursor = "pointer";
                info.event.setProp('title', "Selected");
            }
            else {
                // Available slot (not selected)
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
                        <h1 className="display-5 fw-bold mb-3">Book Availabilities</h1>
                        <p className="lead">Schedule your session with our certified drug prevention specialists</p>
                    </div>
                </Container>
            </div>

            {/* Main Booking Section */}
            <Container className="py-5">
                <Row>

                    {/* Calendar Section */}
                    <Col lg={12}>
                        <Card className="calendar-card">
                            <Card.Body>
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <h4 className="mb-0 text-primary fw-bold">Available Time Slots</h4>
                                </div>
                                {consultantID ? (
                                    <div className="fullcalendar-container">
                                        <FullCalendar ref={calendarRef} {...calendarOptions} events={calendarEvents} />
                                    </div>
                                ) : (
                                    <div className="calendar-placeholder">
                                        <div className="text-center py-5">
                                            <div className="mb-3">
                                                <i className="fas fa-calendar-alt fa-3x text-muted"></i>
                                            </div>
                                            <h5 className="text-muted">Loading available availabilitys</h5>
                                        </div>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>

                        {/* Availability Information */}
                        {selectedTimeSlots.length > 0 && (
                            <Card className="appointment-info-card mt-4">
                                <Card.Body>
                                    <h4 className="text-primary fw-bold mb-4">Selected Availability Slots</h4>

                                    <div className="selected-slot-info mb-4 p-3 bg-light rounded">
                                        {selectedTimeSlots.map((slot, index) => (
                                            <div key={slot.id} className="row mb-2">
                                                <div className="col-md-6">
                                                    <strong>Date:</strong> {slot.formattedDate}
                                                </div>
                                                <div className="col-md-6">
                                                    <strong>Time:</strong> {slot.formattedTime}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="text-center">
                                        <Button variant="primary" size="lg" className="submit-btn" onClick={handleSubmit}>
                                            Submit Selected Availabilities ({selectedTimeSlots.length})
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
                        {selectedTimeSlots.map((slot, index) => (
                            <div key={index} className="detail-row mb-2">
                                <span className="detail-label">Slot {index + 1}:</span>
                                <span className="detail-value">
                                    {slot.formattedDate} at {slot.formattedTime}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-4">
                        <Button variant="primary" size="lg" className="confirm-btn" onClick={handleConfirmBooking}>
                            Confirm Booking ({selectedTimeSlots.length} slots)
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    )
}

export default AvailabilityBooking