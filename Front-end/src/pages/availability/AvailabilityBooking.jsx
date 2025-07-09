import { useEffect, useRef, useState } from "react"
import { Container, Row, Col, Card, Button, Form, Modal, Dropdown } from "react-bootstrap"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import "./AvailabilityBooking.css"
import useFetch from "../../hooks/useFetch"
import { toast } from "react-toastify"
import { format } from 'date-fns'
import { useAuth } from "../../hooks/useAuth"
import { useTranslation } from "react-i18next"
import BackButton from "../../components/BackButton"

const AvailabilityBooking = () => {
    const { t } = useTranslation('availabilityBooking') // Initialize useTranslation

    const { user } = useAuth()
    const consultantID = user?.username
    const [calendarView, setCalendarView] = useState("timeGridWeek")
    const calendarRef = useRef(null)
    const [selectedTimeSlots, setSelectedTimeSlots] = useState([])
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [showCancelModal, setShowCancelModal] = useState(false); // New state for cancel confirmation modal
    const [slotToCancel, setSlotToCancel] = useState({}); // New state to store the slot to be cancelled
    const [cancellationReason, setCancellationReason] = useState("");
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const [currentViewRange, setCurrentViewRange] = useState({
        start: format(today, 'yyyy-MM-dd'),
        end: format(nextWeek, 'yyyy-MM-dd'),
    });
    const { loading: loadingConsultantAvailableSlots, error: errorConsultantAvailableSlots, get: getConsultantAvailableSlots } = useFetch()
    const { loading: loadingConsultantScheduledSlots, error: errorConsultantScheduledSlots, get: getConsultantScheduledSlots } = useFetch()
    const { loading: loadingConsultantCancelledSlots, error: errorConsultantCancelledSlots, get: getConsultantCancelledSlots } = useFetch()
    const { loading: loadingConsultantConfirmedSlots, error: errorConsultantConfirmedSlots, get: getConsultantConfirmedSlots } = useFetch()
    const { loading: loadingNewAvailabilities, error: errorNewAvailabilities, post: postNewAvailabilities } = useFetch()
    const { loading: loadingCancelAvailability, error: errorCancelAvailability, put: cancelScheduledSlots } = useFetch()
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
            } else if (type === "confirmed") {
                eventTitle = t("calendarSection.eventTitles.confirmed");
                backgroundColor = "#6c757d"; // Dark Grey for confirmed
                borderColor = "#6c757d";
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
        fetchConsultantSlots(consultantID, newStartDate, newEndDate);
    };

    const fetchConsultantSlots = async (consultantID, fromDate, toDate) => {
        if (!consultantID || !fromDate || !toDate) {
            console.warn("Cannot fetch availabilities: missing consultantID, fromDate, or toDate.");
            return;
        }
        try {
            //Cancelled Slots
            const cancelledRawSlots = await getConsultantCancelledSlots(
                `http://localhost:8080/api/availability/slots/CANCELLED?username=${consultantID}&from=${fromDate}&to=${toDate}`
            );
            const transformedCancelledEvents = transformToCalendarEvents(cancelledRawSlots, consultantID, "cancelled");
            const cancelledTimes = new Set(transformedCancelledEvents.map(event => event.extendedProps.originalTime));

            //Confirmed Slots
            const confirmedRawSlots = await getConsultantConfirmedSlots(
                `http://localhost:8080/api/availability/slots/CONFIRMED?username=${consultantID}&from=${fromDate}&to=${toDate}`
            );
            // Filter out any scheduled slots that are also marked as cancelled
            const filteredConfirmedRawSlots = confirmedRawSlots.filter(confirmedTime => {
                return !cancelledTimes.has(confirmedTime);
            });
            const transformedConfirmedEvents = transformToCalendarEvents(filteredConfirmedRawSlots, consultantID, "confirmed");
            const confirmedTimes = new Set(transformedConfirmedEvents.map(event => event.extendedProps.originalTime));

            //Scheduled Slots
            const scheduledRawSlots = await getConsultantScheduledSlots(
                `http://localhost:8080/api/availability/slots/SCHEDULED?username=${consultantID}&from=${fromDate}&to=${toDate}`
            );
            // Filter out any scheduled slots that are also marked as cancelled
            const filteredScheduledRawSlots = scheduledRawSlots.filter(scheduledTime => {
                return !confirmedTimes.has(scheduledTime);
            });
            const transformedScheduledEvents = transformToCalendarEvents(filteredScheduledRawSlots, consultantID, "scheduled");
            const scheduledTimes = new Set(transformedScheduledEvents.map(event => event.extendedProps.originalTime));

            //Available Slots
            const availableRawSlots = await getConsultantAvailableSlots(
                `http://localhost:8080/api/availability/available-slots?username=${consultantID}&from=${fromDate}&to=${toDate}`
            );
            // Filter out available slots that are already scheduled or cancelled
            const combinedUnavailableTimes = new Set([...cancelledTimes, ...confirmedTimes, ...scheduledTimes]);

            const filteredAvailableRawSlots = availableRawSlots.filter(availableTime => {
                return !combinedUnavailableTimes.has(availableTime);
            });
            const transformedAvailableEvents = transformToCalendarEvents(filteredAvailableRawSlots, consultantID, "available");

            setCalendarEvents([
                ...transformedAvailableEvents,
                ...transformedScheduledEvents,
                ...transformedCancelledEvents,
                ...transformedConfirmedEvents
            ]);

        } catch (error) {
            console.error("Error fetching consultant's slots:", error);
            setCalendarEvents([]);
            toast.error(t("toasts.fetchError"));
        }
    }

    useEffect(() => {
        if (consultantID) {
            fetchConsultantSlots(consultantID, currentViewRange.start, currentViewRange.end);
        }
    }, [consultantID, currentViewRange.start, currentViewRange.end]);

    const handleEventClick = (clickInfo) => {
        const event = clickInfo.event;
        const now = new Date();

        // If it's a future scheduled slot, open the cancellation modal
        if ((event.extendedProps.type === "scheduled" || event.extendedProps.type === "confirmed") && !event.extendedProps.isPast) {
            setSlotToCancel({
                id: event.id,
                start: event.start,
                end: event.end,
                consultant: consultantID,
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
                originalTime: event.extendedProps.originalTime, // Pass the original time for deletion
            });
            setCancellationReason("");
            setShowCancelModal(true);
            return;
        }

        // Prevent interaction with past events or scheduled events (that are not future and thus not cancellable)
        if (event.extendedProps.isPast || event.extendedProps.type === "scheduled") {
            if (event.extendedProps.type === "scheduled") {
                toast.info(t("toasts.scheduledSlotInfo"));
            } else {
                toast.info(t("toasts.unavailableSlotInfo"));
            }
            return;
        }

        // Only allow interaction with available future slots for adding
        if (event.extendedProps.type === "available" && event.extendedProps.available) {
            const clickedSlot = {
                id: event.id,
                start: event.start,
                end: event.end,
                consultant: consultantID,
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

            const isSelected = selectedTimeSlots.some(slot => slot.id === clickedSlot.id);

            let updatedSelectedSlots;
            let updatedCalendarEvents = [...calendarEvents];
            const eventIndexInCalendar = updatedCalendarEvents.findIndex(evt => evt.id === event.id);

            if (isSelected) {
                updatedSelectedSlots = selectedTimeSlots.filter(slot => slot.id !== clickedSlot.id);
                if (eventIndexInCalendar > -1) {
                    updatedCalendarEvents[eventIndexInCalendar] = {
                        ...updatedCalendarEvents[eventIndexInCalendar],
                        backgroundColor: "#28a745",
                        borderColor: "#28a745",
                        title: t("calendarSection.eventTitles.available")
                    };
                }
                toast.info(t("toasts.slotUnselected"));
            } else {
                updatedSelectedSlots = [...selectedTimeSlots, clickedSlot];
                if (eventIndexInCalendar > -1) {
                    updatedCalendarEvents[eventIndexInCalendar] = {
                        ...updatedCalendarEvents[eventIndexInCalendar],
                        backgroundColor: "#4285f4",
                        borderColor: "#4285f4",
                        title: t("calendarSection.eventTitles.selected")
                    };
                }
                toast.success(t("toasts.slotSelected"));
            }

            setSelectedTimeSlots(updatedSelectedSlots);
            setCalendarEvents(updatedCalendarEvents);
        }
    }

    const handleSubmit = () => {
        if (selectedTimeSlots.length === 0) {
            toast.warn(t("toasts.selectSlotWarning"));
            return;
        }

        setShowConfirmModal(true);
    }

    const handleConfirmBooking = async () => {
        try {
            const now = new Date();
            const slotsToBook = selectedTimeSlots.filter(slot => slot.start > now); // Ensure only future slots are booked
            console.log(slotsToBook);

            if (slotsToBook.length === 0) {
                toast.error(t("toasts.noValidSlotsError"));
                setShowConfirmModal(false);
                setSelectedTimeSlots([]);
                if (consultantID) {
                    fetchConsultantSlots(consultantID, currentViewRange.start, currentViewRange.end);
                }
                return;
            }

            const availabilityDateTimes = slotsToBook.map(slot => slot.start.toISOString());

            const availabilitiesData = {
                availabilityDateTimes: availabilityDateTimes
            }
            console.log("Booking availabilities confirmed:", availabilitiesData)

            const response = await postNewAvailabilities(availabilitiesData, {}, "http://localhost:8080/api/availability");
            console.log("response:", response)

            if (response) {
                setShowConfirmModal(false)
                setSelectedTimeSlots([])
                if (user) {
                    fetchConsultantSlots(user.username, currentViewRange.start, currentViewRange.end);
                } else {
                    setCalendarEvents([]);
                }
                toast.success(t("toasts.bookingSuccess"))
            } else {
                toast.error(t("toasts.bookingError", { message: response?.message || t("toasts.unknownBookingError") }));
            }
        } catch (error) {
            console.error("Error booking availability:", error);
            toast.error(t("toasts.unknownBookingError"));
        }
    }

    const handleConfirmCancellation = async () => {
        if (!slotToCancel || !consultantID) {
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

            const requestBody = {
                availabilityDateTime: slotToCancel.start.toISOString(),
                // from: format(slotToCancel.start, 'yyyy-MM-dd'),
                // to: format(slotToCancel.end, 'yyyy-MM-dd'),
                reason: cancellationReason
            };
            console.log(requestBody);

            const response = await cancelScheduledSlots(requestBody, {}, "http://localhost:8080/api/availability/CANCELLED");

            if (response) {
                toast.success(t("toasts.cancellationSuccess"));
                setShowCancelModal(false);
                setSlotToCancel(null);
                setCancellationReason("");
                if (consultantID) {
                    fetchConsultantSlots(consultantID, currentViewRange.start, currentViewRange.end);
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
        setSelectedTimeSlots([]);
        // Refetch to reset the calendar display if needed
        if (consultantID) {
            fetchConsultantSlots(consultantID, currentViewRange.start, currentViewRange.end);
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
            if ((type === "available" && !isPast) || (type === "scheduled" && !isPast) || (type === "confirmed" && !isPast)) {
                info.el.style.cursor = "pointer";
            } else {
                info.el.style.cursor = "not-allowed";
            }
        },
        eventDidMount: (info) => {
            const { type, isPast } = info.event.extendedProps;
            const isCurrentlySelected = selectedTimeSlots.some(slot => slot.id === info.event.id);

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
            } else if (type === "confirmed") {
                // Future confirmed events are dark grey (distinct from scheduled)
                info.el.style.backgroundColor = "#6c757d"; // Darker grey for confirmed
                info.el.style.borderColor = "#6c757d";
                info.el.style.color = "#ffffff"; // White text for darker grey background
                info.el.style.opacity = "0.9";
                info.el.style.cursor = "pointer"; // Typically, you would click to cancel a slot
                info.event.setProp('title', t("calendarSection.eventTitles.confirmed"));
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
                    {/* Calendar Section */}
                    <Col lg={12}>
                        <Card className="calendar-card">
                            <Card.Body>
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <h4 className="mb-0 text-primary fw-bold">{t("calendarSection.availableTimeSlotsTitle")}</h4>
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
                                            <h5 className="text-muted">{t("calendarSection.placeholderLoading")}</h5>
                                        </div>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>

                        {/* Availability Information */}
                        {selectedTimeSlots.length > 0 && (
                            <Card className="appointment-info-card mt-4">
                                <Card.Body>
                                    <h4 className="text-primary fw-bold mb-4">{t("selectedSlotsSection.title")}</h4>

                                    <div className="selected-slot-info mb-4 p-3 bg-light rounded">
                                        {selectedTimeSlots.map((slot, index) => (
                                            <div key={slot.id} className="row mb-2">
                                                <div className="col-md-6">
                                                    <strong>{t("selectedSlotsSection.dateLabel")}</strong> {slot.formattedDate}
                                                </div>
                                                <div className="col-md-6">
                                                    <strong>{t("selectedSlotsSection.timeLabel")}</strong> {slot.formattedTime}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="text-center">
                                        <Button variant="primary" size="lg" className="submit-btn" onClick={handleSubmit}>
                                            {t("selectedSlotsSection.submitButton", { count: selectedTimeSlots.length })}
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        )}
                    </Col>
                </Row>
            </Container>

            {/* Confirmation Modal for Adding Slots */}
            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
                <Modal.Body className="confirmation-modal">
                    <h4 className="modal-title mb-4">{t("confirmationModal.title")}</h4>
                    <div className="booking-details">
                        {selectedTimeSlots.map((slot, index) => (
                            <div key={index} className="detail-row mb-2">
                                <span className="detail-label">{t("confirmationModal.slotLabel", { index: index + 1 })}</span>
                                <span className="detail-value">
                                    {slot.formattedDate} at {slot.formattedTime}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-4">
                        <Button variant="primary" size="lg" className="confirm-btn me-2" onClick={handleConfirmBooking} disabled={loadingNewAvailabilities}>
                            {loadingNewAvailabilities ? t("confirmationModal.confirmingButton") : t("confirmationModal.confirmButton", { count: selectedTimeSlots.length })}
                        </Button>
                        <Button variant="secondary" size="lg" onClick={handleCancelBooking} disabled={loadingNewAvailabilities}>
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
                        <Button variant="danger" size="lg" className="confirm-btn me-2" onClick={handleConfirmCancellation} disabled={loadingCancelAvailability}>
                            {loadingCancelAvailability ? t("cancellationModal.cancellingButton") : t("cancellationModal.confirmCancellationButton")}
                        </Button>
                        <Button variant="secondary" size="lg" onClick={handleCloseCancelModal} disabled={loadingCancelAvailability}>
                            {t("cancellationModal.doNotCancelButton")}
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    )
}

export default AvailabilityBooking