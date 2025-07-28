import React, { useState, useEffect, useRef, useCallback } from "react";
import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import axios from "axios";
import {
  ActivityIcon,
  ClockIcon,
  TagIcon,
  CalendarIcon,
  MapPinIcon,
  UserIcon,
} from "lucide-react";
import { parseISO, addMinutes, formatISO, format } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import HeaderSection from "../../components/card/event/HeaderSection";
import EventNameSubtitleForm from "../../components/card/event/EventNameSubtitleForm";
import ImageUpload from "../../components/card/event/ImageUpload";
import EventContentSection from "../../components/card/event/EventContentSection";
import ActionButtons from "../../components/card/event/ActionButtons";
import EventOptionCards from "../../components/card/event/EventOptionCards";
import EventDetailCards from "../../components/card/event/EventDetailCards";

// Static data
const optionCardsData = [
  {
    id: 1,
    title: "limitSlot",
    icon: "👥",
    description: "Set participant limit",
    key: "quantity",
    inputType: "number",
    placeholder: "Enter maximum participants",
    unit: "people",
  },
  {
    id: 2,
    title: "groupAge",
    icon: "🎯",
    description: "Define age range",
    key: "ageGroup",
    inputType: "select",
    placeholder: "Select age group",
    unit: "",
    options: ["Adolescent", "Adult", "Senior", "Everyone"],
  },
  {
    id: 3,
    title: "duration",
    icon: "⏱️",
    description: "Event duration",
    key: "duration",
    inputType: "number",
    placeholder: "Enter duration in minutes",
    unit: "minutes",
  },
  {
    id: 4,
    title: "fee",
    icon: "💰",
    description: "Ticket pricing",
    key: "fee",
    inputType: "number",
    placeholder: "Enter ticket price",
    unit: "VND",
  },
];

const detailCardsData = [
  {
    icon: <CalendarIcon size={24} />,
    label: "dateTime",
    placeholder: "selectDateTime",
    color: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    key: "dateTime",
    inputType: "datetime-local",
  },
  {
    icon: <MapPinIcon size={24} />,
    label: "location",
    placeholder: "selectLocation",
    color: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    key: "location",
    inputType: "map",
  },
  {
    icon: <UserIcon size={24} />,
    label: "capacity",
    placeholder: "maxAttendees",
    color: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
    key: "capacity",
    inputType: "number",
  },
];

const EventCreatePage = () => {
  const { t } = useTranslation("createEventPage"); // Sử dụng namespace createEventPage
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(
    localStorage.getItem("createEvent_imageUrl") || ""
  );
  const [imagePreview, setImagePreview] = useState(
    localStorage.getItem("createEvent_imagePreview") || ""
  );
  const [eventStatus, setEventStatus] = useState("NONE");
  const [eventId, setEventId] = useState(null);
  const [eventName, setEventName] = useState(
    localStorage.getItem("createEvent_eventName") || ""
  );
  const [subTitle, setSubTitle] = useState(
    localStorage.getItem("createEvent_subTitle") || ""
  );
  const [description, setDescription] = useState(
    localStorage.getItem("createEvent_description") || ""
  );
  const [details, setDetails] = useState(
    localStorage.getItem("createEvent_details") || ""
  );
  const [optionData, setOptionData] = useState(() => {
    try {
      const storedOptionData = localStorage.getItem("createEvent_optionData");
      return storedOptionData
        ? JSON.parse(storedOptionData)
        : { limitSlot: "", ageGroup: "", duration: "", fee: "", quantity: "" };
    } catch (e) {
      console.error("Failed to parse optionData from localStorage", e);
      return {
        limitSlot: "",
        ageGroup: "",
        duration: "",
        fee: "",
        quantity: "",
      };
    }
  });
  const [eventDetails, setEventDetails] = useState(() => {
    try {
      const storedEventDetails = localStorage.getItem(
        "createEvent_eventDetails"
      );
      return storedEventDetails
        ? JSON.parse(storedEventDetails)
        : { dateTime: "", location: "", capacity: "" };
    } catch (e) {
      console.error("Failed to parse eventDetails from localStorage", e);
      return { dateTime: "", location: "", capacity: "" };
    }
  });
  const [calculatedEndTime, setCalculatedEndTime] = useState("");
  const [mapLocation, setMapLocation] = useState("");
  const isSyncingRef = useRef(false);
  const dateTimeRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found. Denying access.");
      navigate("/login");
      return;
    }
    try {
      const decodedToken = jwtDecode(token);
      const userRole = decodedToken.scope;
      if (userRole !== "STAFF" && userRole !== "MANAGER") {
        console.log(`User role '${userRole}' is not 'STAFF'. Denying access.`);
        navigate("/unauthorized");
      }
    } catch (error) {
      console.error("Error decoding token or invalid token:", error);
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    console.log("Map API Key:", import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
  }, []);

  useEffect(() => {
    const fetchEventStatus = async () => {
      if (eventId) {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
          const response = await axios.get(
            `http://localhost:8080/api/event/${eventId}/status`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (response.data && response.data.status) {
            setEventStatus(response.data.status);
          } else {
            setEventStatus("NONE");
          }
        } catch (error) {
          console.error("Error fetching event status:", error);
          setEventStatus(error.response?.status === 404 ? "NONE" : "ERROR");
        }
      } else {
        setEventStatus("NONE");
      }
    };
    fetchEventStatus();
  }, [eventId]);

  useEffect(() => {
    localStorage.setItem("createEvent_eventName", eventName);
    localStorage.setItem("createEvent_subTitle", subTitle);
    localStorage.setItem("createEvent_description", description);
    localStorage.setItem("createEvent_details", details);
    localStorage.setItem("createEvent_imageUrl", imageUrl);
    localStorage.setItem("createEvent_imagePreview", imagePreview);
    localStorage.setItem("createEvent_optionData", JSON.stringify(optionData));
    localStorage.setItem(
      "createEvent_eventDetails",
      JSON.stringify(eventDetails)
    );
  }, [
    eventName,
    subTitle,
    description,
    details,
    imageUrl,
    imagePreview,
    optionData,
    eventDetails,
  ]);

  useEffect(() => {
    if (isSyncingRef.current) return;
    if (
      optionData.quantity !== undefined &&
      optionData.quantity !== eventDetails.capacity
    ) {
      isSyncingRef.current = true;
      handleEventDetailChange("capacity", optionData.quantity);
    }
  }, [optionData.quantity, eventDetails.capacity]);

  useEffect(() => {
    if (isSyncingRef.current) {
      isSyncingRef.current = false;
      return;
    }
    if (
      eventDetails.capacity !== undefined &&
      eventDetails.capacity !== optionData.quantity
    ) {
      isSyncingRef.current = true;
      setOptionData((prev) => ({ ...prev, quantity: eventDetails.capacity }));
    }
  }, [eventDetails.capacity, optionData.quantity]);

  useEffect(() => {
    const startTimeISO = eventDetails.dateTime;
    const durationMinutes = parseInt(optionData.duration, 10);
    if (startTimeISO && !isNaN(durationMinutes) && durationMinutes > 0) {
      try {
        const startDate = parseISO(startTimeISO);
        if (isNaN(startDate.getTime())) {
          setCalculatedEndTime("");
          return;
        }
        const zonedStartDate = toZonedTime(startDate, "Asia/Ho_Chi_Minh");
        const endDate = addMinutes(zonedStartDate, durationMinutes);
        const zonedEndDate = fromZonedTime(endDate, "Asia/Ho_Chi_Minh");
        setCalculatedEndTime(
          formatISO(zonedEndDate, { representation: "complete" }).slice(0, 19)
        );
      } catch (error) {
        console.error("Error calculating end time:", error);
        setCalculatedEndTime("");
      }
    } else {
      setCalculatedEndTime("");
    }
  }, [eventDetails.dateTime, optionData.duration]);

  const handleCardClick = (card) => {
    setSelectedCard(card);
    setShowModal(true);
  };

  const handleInputChange = (value) => {
    if (selectedCard.inputType === "number") {
      if (value === "" || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
        setOptionData((prev) => ({ ...prev, [selectedCard.key]: value }));
      } else if (parseInt(value) < 0) {
        toast.error(t("quantityNonNegative"));
      } else {
        toast.error(
          t("Invalid input for {{title}}. Please enter a number.", {
            title: t(selectedCard.title),
          })
        );
      }
    } else {
      setOptionData((prev) => ({ ...prev, [selectedCard.key]: value }));
    }
  };

  const handleEventDetailChange = useCallback(
    (key, value) => {
      if (key === "dateTime") {
        const selectedDate = new Date(value);
        const now = new Date();
        now.setSeconds(0);
        now.setMilliseconds(0);
        if (selectedDate.getTime() < now.getTime()) {
          toast.error(t("errorPastDate"));
          return;
        }
        setEventDetails((prev) => ({
          ...prev,
          [key]: value,
        }));
      } else if (key === "location") {
        setEventDetails((prev) => ({
          ...prev,
          [key]: value,
        }));
      } else if (key === "capacity") {
        if (value === "" || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
          setEventDetails((prev) => ({ ...prev, [key]: value }));
        } else if (parseInt(value) < 0) {
          toast.error(t("capacityNonNegative"));
        } else {
          toast.error(t("Invalid input for Capacity. Please enter a number."));
        }
      } else {
        setEventDetails((prev) => ({ ...prev, [key]: value }));
      }
    },
    [t, toast]
  ); // Thêm dependencies cần thiết

  const handleMapLocationSelect = useCallback((location) => {
    setMapLocation(location);
    setEventDetails((prev) => ({
      ...prev,
      location: location,
    }));
  }, []);

  const handleDateTimeClick = () => {
    if (dateTimeRef.current) {
      dateTimeRef.current.showPicker();
    }
  };

  const formatDateTimeDisplay = (dateTime) => {
    if (!dateTime) return "";
    try {
      const date = parseISO(dateTime);
      const zonedDate = toZonedTime(date, "Asia/Ho_Chi_Minh");
      return (
        format(zonedDate, "EEE, MMM d, yyyy, hh:mm a", { locale: enUS }) +
        " (+07:00)"
      );
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  const handleSaveOption = () => {
    setShowModal(false);
    setSelectedCard(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCard(null);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      const uploadedUrl = await uploadImageToCloudinaryViaBackend(file);
      if (uploadedUrl) {
        setImageUrl(uploadedUrl);
        localStorage.setItem("createEvent_imageUrl", uploadedUrl);
      }
    } else {
      setImageFile(null);
      setImagePreview("");
      setImageUrl("");
      localStorage.setItem("createEvent_imageUrl", "");
      localStorage.setItem("createEvent_imagePreview", "");
    }
    e.target.value = null;
  };

  const uploadImageToCloudinaryViaBackend = useCallback(async (file) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    try {
      toast.info(t("Uploading image..."));
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:8080/api/image/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(t("uploadSuccess"));
      return response.data;
    } catch (error) {
      console.error("Error uploading image to backend:", error);
      const errorMessage = error.response?.data || t("uploadFail");
      toast.error(t("uploadFail", { error: errorMessage }));
      return null;
    }
  }, []);

  const clearLocalStorageAndResetStates = useCallback(() => {
    localStorage.removeItem("createEvent_eventName");
    localStorage.removeItem("createEvent_subTitle");
    localStorage.removeItem("createEvent_description");
    localStorage.removeItem("createEvent_details");
    localStorage.removeItem("createEvent_imageUrl");
    localStorage.removeItem("createEvent_imagePreview");
    localStorage.removeItem("createEvent_optionData");
    localStorage.removeItem("createEvent_eventDetails");
    setEventName("");
    setSubTitle("");
    setDescription("");
    setDetails("");
    setImageFile(null);
    setImagePreview("");
    setImageUrl("");
    setOptionData({
      limitSlot: "",
      ageGroup: "",
      duration: "",
      fee: "",
      quantity: "",
    });
    setEventDetails({ dateTime: "", location: "", capacity: "" });
    setCalculatedEndTime("");
    setEventStatus("NONE");
    setEventId(null);
    setMapLocation("");
  }, []);

  const handleSaveAsDraft = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error(t("loginRequired"));
        navigate("/login");
        return;
      }
      if (!eventName || eventName.trim() === "") {
        toast.error(t("eventNameRequired"));
        return;
      }
      if (
        optionData.duration &&
        (isNaN(parseInt(optionData.duration)) ||
          parseInt(optionData.duration) <= 0)
      ) {
        toast.error(t("durationPositive"));
        return;
      }
      if (
        optionData.quantity &&
        (isNaN(parseInt(optionData.quantity)) ||
          parseInt(optionData.quantity) < 0)
      ) {
        toast.error(t("quantityNonNegative"));
        return;
      }
      if (
        optionData.fee &&
        (isNaN(parseFloat(optionData.fee)) || parseFloat(optionData.fee) < 0)
      ) {
        toast.error(t("feeNonNegative"));
        return;
      }
      if (
        eventDetails.capacity &&
        (isNaN(parseInt(eventDetails.capacity)) ||
          parseInt(eventDetails.capacity) < 0)
      ) {
        toast.error(t("capacityNonNegative"));
        return;
      }
      if (eventDetails.dateTime) {
        const selectedDate = new Date(
          eventDetails.dateTime +
            (eventDetails.dateTime.endsWith("Z") ||
            eventDetails.dateTime.includes("+07:00")
              ? ""
              : "+07:00")
        );
        const now = new Date();
        now.setSeconds(0);
        now.setMilliseconds(0);
        if (selectedDate.getTime() < now.getTime()) {
          toast.error(t("pastDateError"));
          return;
        }
      }
      let finalImageUrl = imageUrl;
      if (
        imageFile &&
        (imageFile.name !== imageUrl.split("/").pop() || !imageUrl)
      ) {
        const uploadedUrl = await uploadImageToCloudinaryViaBackend();
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
          setImageUrl(uploadedUrl);
        } else {
          toast.error(t("Could not upload image. Draft not saved."));
          return;
        }
      }
      const requestBody = {
        eventName,
        subTitle: subTitle || null,
        duration: parseInt(optionData.duration) || null,
        quantity: parseInt(optionData.quantity) || null,
        description: description || null,
        image: finalImageUrl || null,
        ageGroup: optionData.ageGroup.toUpperCase() || null,
        startDate: eventDetails.dateTime || null,
        endDate: calculatedEndTime || null,
        location: eventDetails.location || null,
        fee: parseFloat(optionData.fee) || null,
        details: details || null,
      };
      const response = await fetch("http://localhost:8080/api/event/draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });
      const result = await response.json();
      if (response.ok) {
        toast.success(t("successDraft"));
        if (result.eventId) {
          setEventId(result.eventId);
          setEventStatus("DRAFT");
        }
      } else {
        toast.error(t("failDraft"));
        console.error("Save as draft failed:", result);
      }
    } catch (error) {
      console.error("An error occurred during save as draft:", error);
      toast.error(t("An unexpected error occurred. Please try again."));
    }
  };

  const handlePublishEvent = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error(t("loginRequired"));
        navigate("/login");
        return;
      }
      if (!imageUrl) {
        toast.error(t("imageRequired"));
        return;
      }
      const requestBody = {
        eventName,
        subTitle,
        duration: parseInt(optionData.duration),
        quantity: parseInt(optionData.quantity),
        description,
        image: imageUrl,
        ageGroup: optionData.ageGroup.toUpperCase(),
        startDate: eventDetails.dateTime,
        endDate: calculatedEndTime,
        location: eventDetails.location,
        fee: parseFloat(optionData.fee),
        details,
      };
      const method = eventId ? "PUT" : "POST";
      const url = eventId
        ? `http://localhost:8080/api/event/${eventId}/publish`
        : "http://localhost:8080/api/event/publish";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });
      const result = await response.json();
      if (response.ok) {
        toast.success(t("successPublish"));
        clearLocalStorageAndResetStates();
        navigate("/staff"); // Chuyển hướng về homepage staff
      } else {
        toast.error(t("failPublish"));
        console.error("Publish event failed:", result);
      }
    } catch (error) {
      console.error("An error occurred during publish event:", error);
      toast.error(t("An unexpected error occurred. Please try again."));
    }
  };

  const getStatusDisplay = (status) => {
    let text = t("none");
    let bgColor = "#e2e8f0";
    let textColor = "#475569";
    let iconColor = "text-secondary";
    let gradient = "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)";
    switch (status) {
      case "DRAFT":
        text = t("draft");
        bgColor = "#dbeafe";
        textColor = "#1d4ed8";
        iconColor = "text-primary";
        gradient = "linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)";
        break;
      case "PENDING_APPROVAL":
        text = t("pending");
        bgColor = "#fef3c7";
        textColor = "#b45309";
        iconColor = "text-warning";
        gradient = "linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)";
        break;
      case "APPROVED":
        text = t("approved");
        bgColor = "#dcfce7";
        textColor = "#15803d";
        iconColor = "text-success";
        gradient = "linear-gradient(135deg, #dcfce7 0%, #86efac 100%)";
        break;
    }
    return { text, bgColor, textColor, iconColor, gradient };
  };

  const {
    text: statusText,
    bgColor: statusBgColor,
    textColor: statusTextColor,
    iconColor: statusIconColor,
    gradient: statusGradient,
  } = getStatusDisplay(eventStatus);

  return (
    <>
      <HeaderSection t={t}>
        <Row className="g-4 mb-5">
          <EventOptionCards
            optionCardsData={optionCardsData.map((card) => ({
              ...card,
              title: t(card.title),
              description: card.description,
            }))}
            optionData={optionData}
            showModal={showModal}
            selectedCard={selectedCard}
            handleCardClick={handleCardClick}
            handleInputChange={handleInputChange}
            handleSaveOption={handleSaveOption}
            handleCloseModal={handleCloseModal}
          />
        </Row>
        <Row className="justify-content-center">
          <Col xs={12} lg={8}>
            <EventNameSubtitleForm
              eventName={eventName}
              setEventName={setEventName}
              subTitle={subTitle}
              setSubTitle={setSubTitle}
              t={t}
            />
          </Col>
        </Row>
      </HeaderSection>
      <Container fluid className="py-5">
        <Row className="g-4">
          <Col xs={12} lg={8}>
            <div className="d-flex flex-column gap-4">
              <ImageUpload
                imagePreview={imagePreview}
                handleFileChange={handleFileChange}
                t={t}
              />
              <EventContentSection
                title={t("introduction")}
                icon="📝"
                gradient="linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)"
                value={description}
                onChange={setDescription}
              />
              <EventContentSection
                title={t("details")}
                icon="📑"
                gradient="linear-gradient(135deg, #f97316 0%, #ea580c 100%)"
                value={details}
                onChange={setDetails}
              />
              <ActionButtons
                handleSaveAsDraft={handleSaveAsDraft}
                handlePublishEvent={handlePublishEvent}
                previewData={{
                  eventName,
                  subTitle,
                  description,
                  details,
                  image: imageUrl || imagePreview,
                  fee: optionData.fee,
                  ageGroup: optionData.ageGroup,
                  duration: optionData.duration,
                  quantity: optionData.quantity,
                  startDate: eventDetails.dateTime,
                  endDate: calculatedEndTime,
                  location: eventDetails.location,
                  capacity: eventDetails.capacity,
                }}
                navigate={navigate}
                t={t} // Truyền t để dịch trong ActionButtons
              />
            </div>
          </Col>
          <Col xs={12} lg={4}>
            <div>
              <h3 className="fs-4 fw-bold text-dark mb-3">
                {t("eventDetails")}
              </h3>
              <EventDetailCards
                detailCardsData={detailCardsData.map((card) => ({
                  ...card,
                  label: t(card.label),
                  placeholder: t(card.placeholder),
                }))}
                eventDetails={eventDetails}
                calculatedEndTime={calculatedEndTime}
                dateTimeRef={dateTimeRef}
                handleEventDetailChange={handleEventDetailChange}
                formatDateTimeDisplay={formatDateTimeDisplay}
                handleDateTimeClick={handleDateTimeClick}
                handleMapLocationSelect={handleMapLocationSelect}
                mapApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
              />
              <Card
                className="border-0 shadow mt-4"
                style={{ background: statusGradient }}
              >
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <p className="fw-semibold text-dark mb-2">
                        {t("eventStatus")}
                      </p>
                      <div className="d-flex align-items-center">
                        {eventStatus === "APPROVED" && (
                          <ActivityIcon
                            size={20}
                            className={statusIconColor + " me-2"}
                          />
                        )}
                        {eventStatus === "PENDING_APPROVAL" && (
                          <ClockIcon
                            size={20}
                            className={statusIconColor + " me-2"}
                          />
                        )}
                        {eventStatus === "DRAFT" && (
                          <TagIcon
                            size={20}
                            className={statusIconColor + " me-2"}
                          />
                        )}
                        {eventStatus === "NONE" && (
                          <TagIcon
                            size={20}
                            className={statusIconColor + " me-2"}
                          />
                        )}
                        <Badge
                          style={{
                            backgroundColor: statusBgColor,
                            color: statusTextColor,
                          }}
                          className="bg-opacity-25 text-success border-0"
                        >
                          {statusText}
                        </Badge>
                      </div>
                    </div>
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: "48px",
                        height: "48px",
                        backgroundColor: statusBgColor,
                      }}
                    >
                      <span className={statusTextColor + " fs-4"}>✨</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default EventCreatePage;
