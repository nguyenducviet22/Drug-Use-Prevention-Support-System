import { useEffect, useRef, useState } from "react"
import { Container, Row, Col, Card, Button, Form, Modal, Dropdown } from "react-bootstrap"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import "./AppointmentBooking.css"
import useFetch from "../../hooks/useFetch"
import { toast } from "react-toastify"
import { format } from 'date-fns'
import { useTranslation } from "react-i18next" // Import useTranslation
import BackButton from "../../components/BackButton"
import { useAuth } from "../../hooks/useAuth"

const AppointmentBooking = () => {
    const { t } = useTranslation('appointmentBooking') // Sử dụng namespace 'appointmentBooking'
    const { user } = useAuth()
    const username = user?.username
    const [calendarView, setCalendarView] = useState("timeGridWeek")
    const calendarRef = useRef(null)
    const [selectedConsultant, setSelectedConsultant] = useState(null)
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)
    const [appointmentNote, setAppointmentNote] = useState("")
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [showCancelModal, setShowCancelModal] = useState(false); // New state for cancel confirmation modal
    const [slotToCancel, setSlotToCancel] = useState({}); // New state to store the slot to be cancelled
    const [showConsultantDropdown, setShowConsultantDropdown] = useState(false)
    const [consultants, setConsultants] = useState([])
    const [cancellationReason, setCancellationReason] = useState("");
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const [currentViewRange, setCurrentViewRange] = useState({
        start: format(today, 'yyyy-MM-dd'),
        end: format(nextWeek, 'yyyy-MM-dd'),
    });
    const { loading: loadingConsultants, error: errorConsultants, get: getConsultants } = useFetch()
    const { loading: loadingConsultantScheduledSlots, error: errorConsultantScheduledSlots, get: getConsultantScheduledSlots } = useFetch()
    const { loading: loadingMyScheduledSlots, error: errorMyScheduledSlots, get: getMyScheduledSlots } = useFetch()
    const { loading: loadingMyCancelledSlots, error: errorMyCancelledSlots, get: getMyCancelledSlots } = useFetch()
    const { loading: loadingNewAppointment, error: errorNewAppointment, post: postNewAppointment } = useFetch()
    const { loading: loadingCancelAppointment, error: errorCancelAppointment, put: cancelScheduledAppointment } = useFetch()
    const [calendarEvents, setCalendarEvents] = useState([])

    const transformToCalendarEvents = (rawData, consultantID, type) => {
        if (!rawData || !Array.isArray(rawData)) {
            console.warn("Invalid rawData format:", rawData);
            return [];
        }

        const now = new Date();

        return rawData.map(timeString => {
            const slotStart = new Date(timeString);
            const slotEnd = new Date(slotStart);
            slotEnd.setHours(slotStart.getHours() + 1);

            const id = `${consultantID}-${type}-${slotStart.toISOString()}`;
            const isAvailableForBooking = slotStart > now;
            const isPastSlot = slotStart <= now;

            let eventTitle = "";
            let backgroundColor = "";
            let borderColor = "";

            if (type === "available") {
                eventTitle = isAvailableForBooking ? t("calendarSection.eventTitles.available") : t("calendarSection.eventTitles.pastUnavailable");
                backgroundColor = isAvailableForBooking ? "#28a745" : "#6c757d";
                borderColor = isAvailableForBooking ? "#28a745" : "#6c757d";
            } else if (type === "scheduled") {
                eventTitle = isPastSlot ? t("calendarSection.eventTitles.pastScheduled") : t("calendarSection.eventTitles.scheduled");
                backgroundColor = isPastSlot ? "#6c757d" : "#ffc107";
                borderColor = isPastSlot ? "#6c757d" : "#ffc107";
            } else if (type === "cancelled") {
                eventTitle = t("calendarSection.eventTitles.cancelled");
                backgroundColor = "#dc3545"; // Red for cancelled
                borderColor = "#dc3545";
            }

            return {
                id: id,
                title: eventTitle,
                start: slotStart.toISOString(),
                end: slotEnd.toISOString(),
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                textColor: "#ffffff",
                extendedProps: {
                    consultantID: consultantID,
                    available: isAvailableForBooking,
                    type: type,
                    isPast: isPastSlot,
                    originalTime: timeString,
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
            fetchConsultantScheduledSlots(selectedConsultant.username, user.username, newStartDate, newEndDate);
        } else {
            setCalendarEvents([]);
        }
    };

    const fetchConsultantScheduledSlots = async (consultantID, username, fromDate, toDate) => {
        try {
            //My Cancelled Slots
            const cancelledRawSlots = await getMyCancelledSlots(
                `http://localhost:8080/api/appointment/appointments/CANCELLED?username=${username}&from=${fromDate}&to=${toDate}`
            );
            const transformedCancelledEvents = transformToCalendarEvents(cancelledRawSlots, username, "cancelled");
            const cancelledTimes = new Set(transformedCancelledEvents.map(event => event.extendedProps.originalTime));

            //My Scheduled Slots
            const scheduledRawSlots = await getMyScheduledSlots(
                `http://localhost:8080/api/appointment/appointments/SCHEDULED?username=${username}&from=${fromDate}&to=${toDate}`
            );
            // Filter out any scheduled slots that are also marked as cancelled
            const filteredScheduledRawSlots = scheduledRawSlots.filter(scheduledTime => {
                return !cancelledTimes.has(scheduledTime);
            });
            const transformedScheduledEvents = transformToCalendarEvents(filteredScheduledRawSlots, username, "scheduled");
            const scheduledTimes = new Set(transformedScheduledEvents.map(event => event.extendedProps.originalTime));

            //Consultant scheduled Slots
            const availableRawSlots = await getConsultantScheduledSlots(
                `http://localhost:8080/api/availability/slots/SCHEDULED?username=${consultantID}&from=${fromDate}&to=${toDate}`
            );
            // Filter out available slots that are already scheduled
            const unavailableTimes = new Set([...scheduledTimes, ...cancelledTimes]);

            const filteredAvailableRawSlots = availableRawSlots.filter(availableTime => {
                return !unavailableTimes.has(availableTime);
            });
            const transformedConsultantScheduledEvents = transformToCalendarEvents(filteredAvailableRawSlots, consultantID, "available");

            setCalendarEvents([
                ...transformedCancelledEvents,
                ...transformedScheduledEvents,
                ...transformedConsultantScheduledEvents
            ]);
        } catch (error) {
            console.error("Error fetching my appointments or/and consultant's availabilities:", error);
            setCalendarEvents([]);
            toast.error(t("calendarSection.toastMessages.fetchConsultantsError"));
        }
    };
    console.log(calendarEvents);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const consultantsData = await getConsultants("http://localhost:8080/api/user/consultants");
                setConsultants(consultantsData)

                if (selectedConsultant) {
                    fetchConsultantScheduledSlots(selectedConsultant.username, user.username, currentViewRange.start, currentViewRange.end);
                } else {
                    setCalendarEvents([]);
                }
            } catch (error) {
                console.error("Fetch error in Appointment Booking:", error);
            }
        }

        fetchData()
    }, [getConsultants, selectedConsultant, user, currentViewRange.start, currentViewRange.end])
    console.log(consultants);

    const handleConsultantSelect = async (consultant) => {
        setSelectedConsultant(consultant)
        setShowConsultantDropdown(false)
        setSelectedTimeSlot(null) // Reset time slot when consultant changes

        fetchConsultantScheduledSlots(consultant.username, user.username, currentViewRange.start, currentViewRange.end);
    }

    const handleEventClick = (clickInfo) => {
        const event = clickInfo.event;
        console.log('Event', event);
        const now = new Date();

        if ((event.extendedProps.type === "scheduled" || event.extendedProps.type === "confirmed") && !event.extendedProps.isPast) {
            setSlotToCancel({
                id: event.id,
                start: event.start,
                end: event.end,
                consultantID: event.extendedProps.consultantID, // Use consultantID from extendedProps if available
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
                originalTime: event.extendedProps.originalTime, // Pass the original time for cancellation
            });
            setCancellationReason("");
            setShowCancelModal(true);
            return;
        }

        // Prevent interaction with past events or scheduled/cancelled events that are not cancellable via click
        if (event.extendedProps.isPast || event.extendedProps.type === "scheduled" || event.extendedProps.type === "cancelled") {
            if (event.extendedProps.type === "scheduled") {
                toast.info(t("toasts.scheduledSlotInfo"));
            } else if (event.extendedProps.type === "cancelled") {
                toast.info(t("toasts.cancelledSlotInfo")); // Add a specific toast for cancelled if you don't have one
            }
            else {
                toast.info(t("toasts.unavailableSlotInfo"));
            }
            return;
        }

        // Only allow interaction with available future slots for adding/selecting
        if (event.extendedProps.type === "available" && !event.extendedProps.isPast) { // Ensure it's available and not past
            const clickedSlot = {
                id: event.id,
                start: event.start,
                end: event.end,
                consultant: selectedConsultant, // Use selectedConsultant from state for booking context
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

            const isCurrentlySelected = selectedTimeSlot?.id === clickedSlot.id;

            // Create a copy of calendarEvents to modify
            let updatedCalendarEvents = [...calendarEvents];

            // First, deselect the previously selected slot if it exists and is different from the clicked one
            // and ensure we don't accidentally deselect a scheduled/cancelled slot if clicked.
            if (selectedTimeSlot && selectedTimeSlot.id !== clickedSlot.id) {
                const prevSelectedEventIndex = updatedCalendarEvents.findIndex(evt => evt.id === selectedTimeSlot.id);
                if (prevSelectedEventIndex > -1) {
                    const prevEvent = updatedCalendarEvents[prevSelectedEventIndex];
                    if (prevEvent.extendedProps.type === "available") { // Only reset if it was an available slot
                        updatedCalendarEvents[prevSelectedEventIndex] = {
                            ...prevEvent,
                            backgroundColor: "#28a745",
                            borderColor: "#28a745",
                            title: t("calendarSection.eventTitles.available")
                        };
                    }
                }
            }

            // Find the index of the clicked event in the calendarEvents array
            const clickedEventIndex = updatedCalendarEvents.findIndex(evt => evt.id === event.id);

            if (isCurrentlySelected) {
                // If the clicked slot was already selected, unselect it
                setSelectedTimeSlot(null); // Deselect
                if (clickedEventIndex > -1) {
                    updatedCalendarEvents[clickedEventIndex] = {
                        ...updatedCalendarEvents[clickedEventIndex],
                        backgroundColor: "#28a745",
                        borderColor: "#28a745",
                        title: t("calendarSection.eventTitles.available")
                    };
                }
                toast.info(t("toasts.slotUnselected"));
            } else {
                // If the clicked slot was not selected, select it
                setSelectedTimeSlot(clickedSlot); // Select the new slot
                if (clickedEventIndex > -1) {
                    updatedCalendarEvents[clickedEventIndex] = {
                        ...updatedCalendarEvents[clickedEventIndex],
                        backgroundColor: "#4285f4",
                        borderColor: "#4285f4",
                        title: t("calendarSection.eventTitles.selected")
                    };
                }
                // toast.success(t("toasts.slotSelected"));
            }

            setCalendarEvents(updatedCalendarEvents); // Update the calendar events state
        }
    };

    const handleSubmit = () => {
        if (!selectedConsultant || !selectedTimeSlot) {
            toast.error(t("calendarSection.toastMessages.selectConsultantTimeSlot"));
            return
        }
        const now = new Date();
        if (selectedTimeSlot.start <= now) {
            toast.error(t("calendarSection.infoMessages.pastAppointmentError"));
            setShowConfirmModal(false);
            return;
        }
        setShowConfirmModal(true)
    }

    const handleConfirmBooking = async () => {
        try {
            const now = new Date();
            if (selectedTimeSlot.start <= now) {
                toast.error(t("calendarSection.infoMessages.slotPassedError"));
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
                    fetchConsultantScheduledSlots(selectedConsultant.username, user.username, currentViewRange.start, currentViewRange.end);
                } else {
                    setCalendarEvents([]);
                }
                toast.success(t("calendarSection.toastMessages.bookingSuccess"))
            } else {
                toast.error(t("calendarSection.toastMessages.bookingError", { message: response?.message || "Unknown error" }));
            }
        } catch (error) {
            console.error("Error booking appointment:", error);
            toast.error(t("calendarSection.toastMessages.generalBookingError"));
        }
    }

    const handleConfirmCancellation = async () => {
        if (!slotToCancel || !username) {
            toast.error(t("toasts.cancellationError"));
            setShowCancelModal(false);
            return;
        }

        try {
            const now = new Date();
            if (slotToCancel.start <= now) { // Check if the slot is in the past
                toast.error(t("toasts.cannotCancelPastSlot")); // Add a new translation key if needed
                setShowCancelModal(false);
                return;
            }
            console.log(slotToCancel);

            const requestBody = {
                appointmentDateTime: slotToCancel.start.toISOString(),
                notes: cancellationReason,
                status: 'CANCELLED',
                // consultantID: slotToCancel
            };
            console.log(requestBody);

            const response = await cancelScheduledAppointment(requestBody, {}, "http://localhost:8080/api/appointment/cancel/CANCELLED");

            if (response) {
                toast.success(t("toasts.cancellationSuccess"));
                setShowCancelModal(false);
                setSlotToCancel(null);
                setCancellationReason("");
                if (selectedConsultant) {
                    fetchConsultantScheduledSlots(selectedConsultant.username, user.username, currentViewRange.start, currentViewRange.end);
                } else {
                    setCalendarEvents([]);
                }
            } else {
                toast.error(t("toasts.cancellationError", { message: response?.message || t("toasts.unknownCancellationError") }));
            }
        } catch (error) {
            console.error("Error canceling availability:", error);
            toast.error(t("toasts.unknownCancellationError"));
        }
    };

    const handleCancelBooking = () => {
        setShowConfirmModal(false);
        setSelectedTimeSlot({});
        // Refetch to reset the calendar display if needed
        if (selectedConsultant) {
            fetchConsultantScheduledSlots(selectedConsultant.username, user.username, currentViewRange.start, currentViewRange.end);
        } else {
            setCalendarEvents([]);
        }
        toast.info(t("toasts.bookingCancelled"));
    }

    const handleCloseCancelModal = () => {
        setShowCancelModal(false);
        setSlotToCancel(null);
        setCancellationReason("");
    };

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
            // Cursor behavior based on event type and past status
            const { type, isPast } = info.event.extendedProps;
            // Allow pointer for available and future scheduled/cancelled/confirmed slots
            if ((type === "available" && !isPast) || (type === "scheduled" && !isPast)) {
                info.el.style.cursor = "pointer";
            } else {
                info.el.style.cursor = "not-allowed";
            }
        },
        eventDidMount: (info) => {
            const { type, isPast } = info.event.extendedProps;
            const isCurrentlySelected = selectedTimeSlot?.id === info.event.id;

            if (isPast) {
                // All past events (available, scheduled, or cancelled) become grey
                info.el.style.backgroundColor = "#6c757d"; // Darker grey
                info.el.style.borderColor = "#6c757d";
                info.el.style.color = "#ffffff";
                info.el.style.opacity = "0.3";
                info.el.style.cursor = "not-allowed";
                if (type === "available") {
                    info.event.setProp('title', t("calendarSection.eventTitles.pastUnavailable"));
                } else if (type === "scheduled" || type === "cancelled") { // Past scheduled/cancelled
                    info.event.setProp('title', t("calendarSection.eventTitles.pastScheduled"));
                }
            } else if (type === "scheduled") {
                // Future scheduled events are yellow
                info.el.style.backgroundColor = "#ffc107"; // Yellow for scheduled
                info.el.style.borderColor = "#ffc107";
                info.el.style.color = "#000000"; // Black text for yellow background
                info.el.style.opacity = "0.9";
                info.el.style.cursor = "pointer"; // Allow clicking to cancel
                info.event.setProp('title', t("calendarSection.eventTitles.scheduled"));
            } else if (type === "cancelled") {
                // Future cancelled events are red (distinct from scheduled)
                info.el.style.backgroundColor = "#dc3545"; // Red for cancelled
                info.el.style.borderColor = "#dc3545";
                info.el.style.color = "#ffffff"; // White text for red background
                info.el.style.opacity = "0.9";
                info.el.style.cursor = "not-allowed"; // Typically, you wouldn't click a cancelled slot
                info.event.setProp('title', t("calendarSection.eventTitles.cancelled"));
            } else if (isCurrentlySelected) {
                // If available AND currently selected (future)
                info.el.style.backgroundColor = "#4285f4"; // Blue for selected
                info.el.style.borderColor = "#4285f4";
                info.el.style.color = "#ffffff";
                info.el.style.opacity = "1";
                info.el.style.cursor = "pointer";
                info.event.setProp('title', t("calendarSection.eventTitles.selected"));
            } else {
                // Available slot (not selected, future)
                info.el.style.backgroundColor = "#28a745"; // Default green
                info.el.style.borderColor = "#28a745";
                info.el.style.color = "#ffffff";
                info.el.style.opacity = "1";
                info.el.style.cursor = "pointer";
                info.event.setProp('title', t("calendarSection.eventTitles.available"));
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
                        <h1 className="display-5 fw-bold mb-3">{t("header.title")}</h1>
                        <p className="lead">{t("header.subtitle")}</p>
                    </div>
                </Container>
            </div>

            {/* Main Booking Section */}
            <Container className="py-5">
                <BackButton label={t("backButton")} />
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
                                        <span>{selectedConsultant ? selectedConsultant.username : t("consultantSelection.dropdownPlaceholder")}</span>
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
                                    <h4 className="mb-0 text-primary fw-bold">{t("calendarSection.title")}</h4>
                                </div>
                                {selectedConsultant ? (
                                    <div className="fullcalendar-container">
                                        <FullCalendar ref={calendarRef} {...calendarOptions} events={calendarEvents} />
                                    </div>
                                ) : (
                                    <div className="calendar-placeholder">
                                        <div className="text-center py-5">
                                            <div className="mb-3">
                                                <i className="fas fa-calendar-alt fa-3x text-muted" aria-label={t("calendarSection.placeholderIconAlt")}></i>
                                            </div>
                                            <h5 className="text-muted">{t("calendarSection.placeholderText")}</h5>
                                        </div>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>

                        {/* Appointment Information */}
                        {selectedTimeSlot && (
                            <Card className="appointment-info-card mt-4">
                                <Card.Body>
                                    <h4 className="text-primary fw-bold mb-4">{t("appointmentInformation.cardTitle")}</h4>

                                    <div className="selected-slot-info mb-4 p-3 bg-light rounded">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <strong>{t("appointmentInformation.consultantLabel")}</strong> {selectedTimeSlot.consultant.username}
                                            </div>
                                            <div className="col-md-6">
                                                <strong>{t("appointmentInformation.dateLabel")}</strong> {selectedTimeSlot.formattedDate}
                                            </div>
                                            <div className="col-12 mt-2">
                                                <strong>{t("appointmentInformation.timeLabel")}</strong> {selectedTimeSlot.formattedTime}
                                            </div>
                                        </div>
                                    </div>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="note-label">{t("appointmentInformation.noteLabel")}</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={4}
                                            placeholder={t("appointmentInformation.notePlaceholder")}
                                            value={appointmentNote}
                                            onChange={(e) => setAppointmentNote(e.target.value)}
                                            className="note-textarea"
                                        />
                                    </Form.Group>

                                    <div className="text-center">
                                        <Button variant="primary" size="lg" className="submit-btn" onClick={handleSubmit}>
                                            {t("appointmentInformation.submitButton")}
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
                    <h4 className="modal-title mb-4">{t("confirmationModal.title")}</h4>

                    <div className="booking-details">
                        <div className="detail-row">
                            <span className="detail-label">{t("confirmationModal.consultantLabel")}</span>
                            <span className="detail-value">{selectedConsultant?.username}</span>
                        </div>

                        <div className="detail-row">
                            <span className="detail-label">{t("confirmationModal.dateTimeLabel")}</span>
                            <span className="detail-value">
                                {selectedTimeSlot?.formattedDate} at {selectedTimeSlot?.formattedTime}
                            </span>
                        </div>

                        {appointmentNote && (
                            <div className="detail-row">
                                <span className="detail-label">{t("confirmationModal.noteLabel")}</span>
                                <span className="detail-value">{appointmentNote}</span>
                            </div>
                        )}
                    </div>

                    <div className="text-center mt-4">
                        <Button variant="primary" size="lg" className="confirm-btn me-2" onClick={handleConfirmBooking} disabled={loadingNewAppointment}>
                            {loadingNewAppointment ? t("confirmationModal.confirmingButton") : t("confirmationModal.confirmButton", { count: selectedTimeSlot })}
                        </Button>
                        <Button variant="secondary" size="lg" onClick={handleCancelBooking} disabled={loadingNewAppointment}>
                            {t("confirmationModal.cancelButton")}
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>

            {/* Confirmation Modal for Cancelling Slots */}
            <Modal show={showCancelModal} onHide={handleCloseCancelModal} centered>
                <Modal.Body className="confirmation-modal">
                    <h4 className="modal-title mb-4">{t("cancellationModal.title")}</h4>
                    {slotToCancel && (
                        <div className="booking-details">
                            <p>{t("cancellationModal.message")}</p>
                            <div className="detail-row mb-2">
                                <span className="detail-label">{t("cancellationModal.dateLabel")}</span>
                                <span className="detail-value">
                                    {slotToCancel.formattedDate} at {slotToCancel.formattedTime}
                                </span>
                            </div>
                            <Form.Group className="mb-3" controlId="cancellationReason">
                                <Form.Label>{t("cancellationModal.reasonLabel")}</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={cancellationReason}
                                    onChange={(e) => setCancellationReason(e.target.value)}
                                    placeholder={t("cancellationModal.reasonPlaceholder")}
                                />
                            </Form.Group>
                        </div>
                    )}
                    <div className="text-center mt-4">
                        <Button variant="danger" size="lg" className="confirm-btn me-2" onClick={handleConfirmCancellation} disabled={loadingCancelAppointment}>
                            {loadingCancelAppointment ? t("cancellationModal.cancellingButton") : t("cancellationModal.confirmCancellationButton")}
                        </Button>
                        <Button variant="secondary" size="lg" onClick={handleCloseCancelModal} disabled={loadingCancelAppointment}>
                            {t("cancellationModal.doNotCancelButton")}
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    )
}

export default AppointmentBooking;