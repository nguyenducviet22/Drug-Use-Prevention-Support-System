import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Badge,
} from "react-bootstrap";
import {
  ActivityIcon,
  ClockIcon,
  ImageIcon,
  MapPinIcon,
  UserIcon,
  CalendarIcon,
  TagIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import axios from "axios"; // Import axios

// Import the new components
import EventOptionCards from "../../components/card/EventOptionCards";
import EventDetailCards from "../../components/card/EventDetailCards";

// Define static data outside the component
const optionCardsData = [
  {
    id: 1,
    title: "Limit Slot",
    icon: "👥",
    description: "Set participant limit",
    key: "quantity",
    inputType: "number",
    placeholder: "Enter maximum participants",
    unit: "people",
  },
  {
    id: 2,
    title: "Group Age",
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
    title: "Duration",
    icon: "⏱️",
    description: "Event duration",
    key: "duration",
    inputType: "number",
    placeholder: "Enter duration in minutes",
    unit: "minutes",
  },
  {
    id: 4,
    title: "Fee",
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
    label: "Date & Time",
    placeholder: "Select date and time",
    color: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    key: "dateTime",
    inputType: "datetime-local",
  },
  {
    icon: <MapPinIcon size={24} />,
    label: "Location",
    placeholder: "Enter event location",
    color: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    key: "location",
    inputType: "text",
  },
  {
    icon: <UserIcon size={24} />,
    label: "Capacity",
    placeholder: "Maximum attendees",
    color: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
    key: "capacity",
    inputType: "number",
  },
];

const EventCreatePage = () => {
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

  // --- NEW STATE FOR EVENT STATUS ---
  const [eventStatus, setEventStatus] = useState("NONE"); // Default to 'NONE' if no event or status found
  const [eventId, setEventId] = useState(null); // Assuming you might get an event ID from somewhere, e.g., URL params, or after saving a draft

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

      if (userRole !== "STAFF") {
        console.log(`User role '${userRole}' is not 'STAFF'. Denying access.`);
        navigate("/unauthorized");
      }
    } catch (error) {
      console.error("Error decoding token or invalid token:", error);
      navigate("/login");
    }
  }, [navigate]);

  // --- NEW useEffect to fetch event status ---
  useEffect(() => {
    const fetchEventStatus = async () => {
        // You need to determine how the event ID is passed to this page.
        // For example, if it's in the URL like /create-event/:id, you'd use useParams().
        // For now, let's assume if an eventName exists, it might imply an existing draft,
        // or you'd get the ID from a successful draft save operation.
        // For demonstration, we'll try to fetch status if eventId is set.
        if (eventId) { // Only fetch if an event ID is available
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const response = await axios.get(`http://localhost:8080/api/event/${eventId}/status`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (response.data && response.data.status) {
                    setEventStatus(response.data.status);
                } else {
                    setEventStatus("NONE");
                }
            } catch (error) {
                console.error("Error fetching event status:", error);
                if (error.response && error.response.status === 404) {
                    setEventStatus("NONE"); // Event not found
                } else {
                    setEventStatus("ERROR"); // Handle other errors
                }
            }
        } else {
            setEventStatus("NONE"); // No event ID, implies new event or no draft yet
        }
    };

    fetchEventStatus();
  }, [eventId]); // Re-fetch if eventId changes

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
        : {
            limitSlot: "",
            ageGroup: "",
            duration: "",
            fee: "",
            quantity: "",
          };
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
        : {
            dateTime: "",
            location: "",
            capacity: "",
          };
    } catch (e) {
      console.error("Failed to parse eventDetails from localStorage", e);
      return {
        dateTime: "",
        location: "",
        capacity: "",
      };
    }
  });

  const [calculatedEndTime, setCalculatedEndTime] = useState("");

  const isSyncingRef = useRef(false);

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
      const startDate = new Date(startTimeISO);
      if (!isNaN(startDate.getTime())) {
        const endDate = new Date(
          startDate.getTime() + durationMinutes * 60 * 1000
        );
        setCalculatedEndTime(endDate.toISOString().slice(0, 19));
      } else {
        setCalculatedEndTime("");
      }
    } else {
      setCalculatedEndTime("");
    }
  }, [eventDetails.dateTime, optionData.duration]);

  const dateTimeRef = useRef(null);

  const handleCardClick = (card) => {
    setSelectedCard(card);
    setShowModal(true);
  };

  const handleInputChange = (value) => {
    // --- START: NEW VALIDATION FOR NUMBER INPUTS ---
    if (selectedCard.inputType === "number") {
      // Allow empty string for clearing input, but ensure it's a valid number otherwise
      if (value === "" || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
        setOptionData((prev) => ({
          ...prev,
          [selectedCard.key]: value,
        }));
      } else if (parseInt(value) < 0) {
        toast.error(`${selectedCard.title} must be a non-negative number.`);
      } else {
        toast.error(`Invalid input for ${selectedCard.title}. Please enter a number.`);
      }
    } else {
      // Original logic for other input types
      setOptionData((prev) => ({
        ...prev,
        [selectedCard.key]: value,
      }));
    }
    // --- END: NEW VALIDATION FOR NUMBER INPUTS ---
  };

  const handleEventDetailChange = (key, value) => {
    // --- START: NEW VALIDATION FOR DATETIME & CAPACITY ---
    if (key === "dateTime") {
      const selectedDate = new Date(value);
      const now = new Date();
      // Clear seconds and milliseconds for comparison
      now.setSeconds(0);
      now.setMilliseconds(0);

      if (selectedDate.getTime() < now.getTime()) {
        toast.error("Date and Time cannot be in the past.");
        return; // Prevent updating state with past date
      }
    }
    if (key === "capacity") {
        if (value === "" || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
            // Valid positive integer or empty string
        } else if (parseInt(value) < 0) {
            toast.error("Capacity must be a non-negative number.");
            return;
        } else {
            toast.error("Invalid input for Capacity. Please enter a number.");
            return;
        }
    }
    // --- END: NEW VALIDATION FOR DATETIME & CAPACITY ---

    setEventDetails((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleDateTimeClick = () => {
    if (dateTimeRef.current) {
      dateTimeRef.current.showPicker();
    }
  };

  const formatDateTimeDisplay = (dateTime) => {
    if (!dateTime) return "";
    const date = new Date(dateTime);
    return date.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSaveOption = () => {
    setShowModal(false);
    setSelectedCard(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCard(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview("");
      setImageUrl("");
    }
    e.target.value = null;
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      ["link", "image"],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "color",
    "background",
    "align",
  ];

  // UPDATED: Hàm upload ảnh lên Cloudinary thông qua Backend
  const uploadImageToCloudinaryViaBackend = useCallback(async () => {
    if (!imageFile) {
      return null; // No file to upload
    }

    const formData = new FormData();
    formData.append("file", imageFile);

    try {
      toast.info("Uploading image...");
      const token = localStorage.getItem("token"); // Get token if needed for backend upload endpoint
      const response = await axios.post(
        "http://localhost:8080/api/image/upload", // Your backend upload endpoint
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, // Include token if your upload endpoint is secured
          },
        }
      );
      toast.success("Image uploaded!");
      console.log("Backend upload response:", response.data);
      return response.data; // Backend should return the URL directly
    } catch (error) {
      console.error("Error uploading image to backend:", error);
      const errorMessage = error.response?.data || "Failed to upload image.";
      toast.error(`Image upload failed: ${errorMessage}`);
      return null;
    }
  }, [imageFile]);


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
    setEventDetails({
      dateTime: "",
      location: "",
      capacity: "",
    });
    setCalculatedEndTime("");
    setEventStatus("NONE"); // Reset status when clearing all
    setEventId(null); // Reset event ID
  }, []);


  const handleSaveAsDraft = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You need to be logged in to save events.");
        navigate("/login");
        return;
      }

      if (!eventName || eventName.trim() === "") {
        toast.error("Event Name is required even for a draft.");
        return;
      }

      // --- NEW VALIDATION FOR DRAFT ---
      // For draft, numeric fields can be empty, but if present, they must be valid
      if (optionData.duration && (isNaN(parseInt(optionData.duration)) || parseInt(optionData.duration) <= 0)) {
        toast.error("Duration must be a positive integer.");
        return;
      }
      if (optionData.quantity && (isNaN(parseInt(optionData.quantity)) || parseInt(optionData.quantity) < 0)) {
        toast.error("Limit Slot (Quantity) must be a non-negative integer.");
        return;
      }
      if (optionData.fee && (isNaN(parseFloat(optionData.fee)) || parseFloat(optionData.fee) < 0)) {
        toast.error("Fee must be a non-negative number.");
        return;
      }
      if (eventDetails.capacity && (isNaN(parseInt(eventDetails.capacity)) || parseInt(eventDetails.capacity) < 0)) {
        toast.error("Capacity must be a non-negative integer.");
        return;
      }
      // Date and Time validation for draft - only if selected, it must not be in the past
      if (eventDetails.dateTime) {
          const selectedDate = new Date(eventDetails.dateTime);
          const now = new Date();
          now.setSeconds(0);
          now.setMilliseconds(0);
          if (selectedDate.getTime() < now.getTime()) {
              toast.error("Draft Date and Time cannot be in the past.");
              return;
          }
      }
      // --- END: NEW VALIDATION FOR DRAFT ---

      let finalImageUrl = imageUrl;
      // If there's a new image file and it hasn't been uploaded yet (imageUrl is empty or different from the current file)
      // Or if imageFile exists and imageUrl is not set (e.g., first upload attempt)
      if (imageFile && (imageFile.name !== imageUrl.split('/').pop() || !imageUrl)) {
          const uploadedUrl = await uploadImageToCloudinaryViaBackend();
          if (uploadedUrl) {
            finalImageUrl = uploadedUrl;
            setImageUrl(uploadedUrl);
          } else {
            toast.error("Could not upload image. Draft not saved.");
            return;
          }
      }


      const requestBody = {
        eventName: eventName,
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

      console.log("Sending Draft Request:", requestBody);

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
        toast.success(result.message || "Event saved as draft successfully!");
        // --- NEW: Update eventId and status after successful draft save ---
        if (result.eventId) { // Assuming your backend returns the eventId on success
            setEventId(result.eventId);
            setEventStatus("DRAFT");
        }
        // clearLocalStorageAndResetStates(); // Might not want to clear immediately if user is still editing
      } else {
        const errorMessage = result.message || "Failed to save event as draft.";
        toast.error(`Error: ${errorMessage}`);
        console.error("Save as draft failed:", result);
      }
    } catch (error) {
      console.error("An error occurred during save as draft:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const handlePublishEvent = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You need to be logged in to publish events.");
        navigate("/login");
        return;
      }

      // Image is required for publishing
      if (!imageFile && !imageUrl) {
        toast.error("Please upload an event image to publish.");
        return;
      }

      let finalImageUrl = imageUrl;
      // Only upload if there's a new imageFile and it's not the one already uploaded
      if (imageFile && (imageFile.name !== imageUrl.split('/').pop() || !imageUrl)) {
          const uploadedUrl = await uploadImageToCloudinaryViaBackend();
          if (uploadedUrl) {
            finalImageUrl = uploadedUrl;
            setImageUrl(uploadedUrl);
          } else {
            toast.error("Could not upload image. Event not published.");
            return;
          }
      }


      // Frontend validation for publishing - ALL required fields must be present
      // --- START: UPDATED VALIDATION FOR PUBLISH ---
      if (
        !eventName || eventName.trim() === "" ||
        !subTitle || subTitle.trim() === "" ||
        !description || description.trim() === "" ||
        !finalImageUrl || finalImageUrl.trim() === "" ||
        !optionData.ageGroup || optionData.ageGroup.trim() === "" ||
        !eventDetails.dateTime || eventDetails.dateTime.trim() === "" ||
        !calculatedEndTime || calculatedEndTime.trim() === "" ||
        !eventDetails.location || eventDetails.location.trim() === "" ||
        !details || details.trim() === ""
      ) {
        toast.error("Please fill in all required text/selection fields to publish the event.");
        return;
      }

      // Numeric field validations
      const duration = parseInt(optionData.duration);
      if (isNaN(duration) || duration <= 0) {
        toast.error("Duration must be a positive integer.");
        return;
      }

      const quantity = parseInt(optionData.quantity);
      if (isNaN(quantity) || quantity <= 0) { // Changed to "> 0" for Limit Slot (quantity)
        toast.error("Limit Slot (Quantity) must be a positive integer.");
        return;
      }

      const fee = parseFloat(optionData.fee);
      if (isNaN(fee) || fee < 0) {
        toast.error("Fee must be a non-negative number.");
        return;
      }

      const capacity = parseInt(eventDetails.capacity);
      if (isNaN(capacity) || capacity <= 0) { // Changed to "> 0" for Capacity
        toast.error("Capacity must be a positive integer.");
        return;
      }

      // Date and Time validation: must be in the future
      const selectedDate = new Date(eventDetails.dateTime);
      const now = new Date();
      now.setSeconds(0); // Clear seconds and milliseconds for accurate comparison
      now.setMilliseconds(0);

      if (selectedDate.getTime() < now.getTime()) {
        toast.error("Date and Time cannot be in the past.");
        return;
      }
      // --- END: UPDATED VALIDATION FOR PUBLISH ---

      const requestBody = {
        eventName: eventName,
        subTitle: subTitle,
        duration: duration, // Use parsed value
        quantity: quantity, // Use parsed value
        description: description,
        image: finalImageUrl, // Gửi URL ảnh đã upload
        ageGroup: optionData.ageGroup.toUpperCase(),
        startDate: eventDetails.dateTime,
        endDate: calculatedEndTime,
        location: eventDetails.location,
        fee: fee, // Use parsed value
        details: details,
      };

      console.log("Sending Publish Request:", requestBody);

      // --- NEW: Add eventId to requestBody if it's an update to an existing draft ---
      const method = eventId ? "PUT" : "POST"; // Use PUT if updating existing, POST if new
      const url = eventId ? `http://localhost:8080/api/event/${eventId}/publish` : "http://localhost:8080/api/event/publish";

      const response = await fetch(url, { // Use dynamic URL
        method: method, // Use dynamic method
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "Event submitted for approval successfully!");
        clearLocalStorageAndResetStates();
        navigate("/dashboard/events");
      } else {
        const errorMessage = result.message || "Failed to publish event.";
        toast.error(`Error: ${errorMessage}`);
        console.error("Publish event failed:", result);
      }
    } catch (error) {
      console.error("An error occurred during publish event:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

    // --- NEW HELPER FUNCTION TO GET STATUS DISPLAY AND STYLES ---
    const getStatusDisplay = (status) => {
        let text = "None";
        let bgColor = "#e2e8f0"; // gray-200
        let textColor = "#475569"; // slate-600
        let iconColor = "text-secondary";
        let gradient = "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)"; // gray gradient

        switch (status) {
            case "DRAFT":
                text = "Draft";
                bgColor = "#dbeafe"; // blue-100
                textColor = "#1d4ed8"; // blue-700
                iconColor = "text-primary";
                gradient = "linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)"; // blue gradient
                break;
            case "PENDING_APPROVAL":
                text = "Pending";
                bgColor = "#fef3c7"; // yellow-100
                textColor = "#b45309"; // amber-700
                iconColor = "text-warning";
                gradient = "linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)"; // yellow gradient
                break;
            case "APPROVED":
                text = "Approved";
                bgColor = "#dcfce7"; // green-100
                textColor = "#15803d"; // green-700
                iconColor = "text-success";
                gradient = "linear-gradient(135deg, #dcfce7 0%, #86efac 100%)"; // green gradient
                break;
            default:
                // "NONE" or any other unhandled status
                text = "None";
                bgColor = "#e2e8f0";
                textColor = "#475569";
                iconColor = "text-secondary";
                gradient = "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)";
                break;
        }
        return { text, bgColor, textColor, iconColor, gradient };
    };

    const { text: statusText, bgColor: statusBgColor, textColor: statusTextColor, iconColor: statusIconColor, gradient: statusGradient } = getStatusDisplay(eventStatus);


  return (
    <>
      <section
        className="position-relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #6366f1 100%)",
          minHeight: "600px",
        }}
      >
        <div
          className="position-absolute w-100 h-100"
          style={{
            backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
              '<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="#ffffff" fill-opacity="0.05"><circle cx="30" cy="30" r="2"/></g></g></svg>'
            )}")`,
            backgroundRepeat: "repeat",
            opacity: 0.3,
          }}
        ></div>

        <Container
          fluid
          style={{ maxWidth: "1400px", position: "relative", zIndex: 10 }}
          className="py-5"
        >
          <div className="text-center mb-5">
            <h1 className="display-1 fw-bold text-white mb-4">
              Create Your Event
            </h1>
            <p
              className="fs-4 text-white-50 mx-auto"
              style={{ maxWidth: "600px" }}
            >
              Bring your vision to life with our intuitive event creation
              platform
            </p>
          </div>

          <Row className="g-4 mb-5">
            {/* Using the new EventOptionCards component */}
            <EventOptionCards
              optionCardsData={optionCardsData}
              optionData={optionData}
              showModal={showModal}
              selectedCard={selectedCard}
              handleCardClick={handleCardClick}
              handleInputChange={handleInputChange}
              handleSaveOption={handleSaveOption}
              handleCloseModal={handleCloseModal}
            />
          </Row>

          {/* Event Name & Subtitle */}
          <Row className="justify-content-center">
            <Col xs={12} lg={8}>
              <Card
                className="border-0 shadow-lg"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(8px)",
                  borderRadius: "24px",
                }}
              >
                <Card.Body className="p-5">
                  <Form>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-dark mb-3">
                        Event Name
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter your amazing event name"
                        className="text-center fw-semibold border-2"
                        style={{
                          height: "64px",
                          fontSize: "1.5rem",
                          borderRadius: "16px",
                          borderColor: "#dee2e6",
                        }}
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label className="fw-semibold text-dark mb-3">
                        Event Subtitle
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Add a compelling subtitle"
                        className="text-center border-2"
                        style={{
                          height: "48px",
                          fontSize: "1.125rem",
                          borderRadius: "12px",
                          borderColor: "#dee2e6",
                        }}
                        value={subTitle}
                        onChange={(e) => setSubTitle(e.target.value)}
                      />
                    </Form.Group>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Event Details Section */}
      <Container fluid className="py-5">
        <Row className="g-4">
          {/* Left Column */}
          <Col xs={12} lg={8}>
            <div className="d-flex flex-column gap-4">
              {/* Image Upload */}
              <Card className="border-0 shadow">
                <Card.Body className="p-0">
                  <div
                    className="position-relative d-flex align-items-center justify-content-center border-2 border-dashed rounded overflow-hidden"
                    style={{
                      height: "320px",
                      background:
                        "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                      borderColor: "#dee2e6",
                      cursor: "pointer",
                    }}
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Event Preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "inherit",
                        }}
                      />
                    ) : (
                      <div className="text-center">
                        <div
                          className="mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center"
                          style={{
                            width: "64px",
                            height: "64px",
                            backgroundColor: "#dbeafe",
                          }}
                        >
                          <ImageIcon size={32} className="text-primary" />
                        </div>
                        <p className="fs-5 fw-semibold text-dark mb-2">
                          Upload Event Image
                        </p>
                        <p className="text-muted small">
                          Drag and drop or click to browse
                        </p>
                      </div>
                    )}
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        opacity: 0,
                        cursor: "pointer",
                        zIndex: 1,
                      }}
                    />
                  </div>
                </Card.Body>
              </Card>

              {/* Event Content - Description Section */}
              <Card className="border-0 shadow">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-4">
                    <div
                      className="me-3 rounded d-flex align-items-center justify-content-center"
                      style={{
                        width: "32px",
                        height: "32px",
                        background:
                          "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
                      }}
                    >
                      <span>📝</span>
                    </div>
                    <h2 className="fs-3 fw-bold text-dark mb-0">
                      Event Content - Introduction
                    </h2>
                  </div>

                  <div
                    className="bg-light rounded border"
                    style={{ minHeight: "250px" }}
                  >
                    <ReactQuill
                      theme="snow"
                      value={description}
                      onChange={setDescription}
                      modules={modules}
                      formats={formats}
                      placeholder="Provide a general introduction to your event..."
                      style={{ height: "206px" }}
                      className="border-0 bg-transparent"
                    />
                  </div>
                </Card.Body>
              </Card>

              {/* MỚI: Event Content - Details Section */}
              <Card className="border-0 shadow">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-4">
                    <div
                      className="me-3 rounded d-flex align-items-center justify-content-center"
                      style={{
                        width: "32px",
                        height: "32px",
                        background:
                          "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                      }}
                    >
                      <span>📑</span>
                    </div>
                    <h2 className="fs-3 fw-bold text-dark mb-0">
                      Event Content - Details
                    </h2>
                  </div>

                  <div
                    className="bg-light rounded border"
                    style={{ minHeight: "250px" }}
                  >
                    <ReactQuill
                      theme="snow"
                      value={details}
                      onChange={setDetails}
                      modules={modules}
                      formats={formats}
                      placeholder="Provide more in-depth details about your event, such as agenda, speakers, etc."
                      style={{ height: "206px" }}
                      className="border-0 bg-transparent"
                    />
                  </div>
                </Card.Body>
              </Card>

              {/* Buttons */}
              <div className="d-flex flex-wrap gap-3 justify-content-center">
                <Button
                  variant="light"
                  className="px-4 fw-semibold"
                  style={{ borderRadius: "12px" }}
                  onClick={handleSaveAsDraft}
                >
                  Save as Draft
                </Button>
                <Button
                  variant="primary"
                  className="px-4 fw-semibold"
                  style={{ borderRadius: "12px" }}
                  onClick={() => {
                    const previewData = {
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
                    };
                    console.log("Preview Data:", previewData);
                    navigate("/events/preview", { state: previewData });
                  }}
                >
                  Preview Event
                </Button>
                <Button
                  variant="success"
                  className="px-4 fw-semibold"
                  style={{ borderRadius: "12px" }}
                  onClick={handlePublishEvent}
                >
                  Publish Event
                </Button>
              </div>
            </div>
          </Col>

          {/* Right Sidebar */}
          <Col xs={12} lg={4}>
            <div>
              <h3 className="fs-4 fw-bold text-dark mb-3">Event Details</h3>
              {/* Using the new EventDetailCards component */}
              <EventDetailCards
                detailCardsData={detailCardsData}
                eventDetails={eventDetails}
                calculatedEndTime={calculatedEndTime}
                dateTimeRef={dateTimeRef}
                handleEventDetailChange={handleEventDetailChange}
                formatDateTimeDisplay={formatDateTimeDisplay}
                handleDateTimeClick={handleDateTimeClick}
              />
            </div>

            {/* Status */}
            <Card
              className="border-0 shadow mt-4"
              style={{
                background: statusGradient, // Use dynamic gradient
              }}
            >
              <Card.Body className="p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="fw-semibold text-dark mb-2">Event Status</p>
                    <div className="d-flex align-items-center">
                      {/* Dynamic Icon based on status */}
                      {eventStatus === "APPROVED" && <ActivityIcon size={20} className={statusIconColor + " me-2"} />}
                      {eventStatus === "PENDING_APPROVAL" && <ClockIcon size={20} className={statusIconColor + " me-2"} />}
                      {eventStatus === "DRAFT" && <TagIcon size={20} className={statusIconColor + " me-2"} />}
                      {eventStatus === "NONE" && <TagIcon size={20} className={statusIconColor + " me-2"} />} {/* Use TagIcon for None/Default */}
                      {/* Dynamic Badge based on status */}
                      <Badge
                        style={{
                            backgroundColor: statusBgColor, // Use dynamic background color
                            color: statusTextColor, // Use dynamic text color
                        }}
                        className="bg-opacity-25 text-success border-0"
                      >
                        {statusText} {/* Use dynamic status text */}
                      </Badge>
                    </div>
                  </div>
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: statusBgColor, // Use dynamic background color
                    }}
                  >
                    <span className={statusTextColor + " fs-4"}>✨</span> {/* Icon in circle, can be dynamic emoji */}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default EventCreatePage;