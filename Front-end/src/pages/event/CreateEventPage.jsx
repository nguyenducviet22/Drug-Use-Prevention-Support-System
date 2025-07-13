import React, { useState, useRef, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Badge,
  Modal,
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

const EventCreatePage = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

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

  const [eventName, setEventName] = useState(
    localStorage.getItem("createEvent_eventName") || ""
  );
  const [subTitle, setSubTitle] = useState(
    localStorage.getItem("createEvent_subTitle") || ""
  );
  // Đổi tên state từ 'introduction' thành 'description'
  const [description, setDescription] = useState(
    localStorage.getItem("createEvent_description") || "" // Cập nhật localStorage key
  );

  // Đổi tên state từ 'eventDetailsContent' thành 'details'
  const [details, setDetails] = useState(
    localStorage.getItem("createEvent_details") || "" // Cập nhật localStorage key
  );

  const [image, setImage] = useState(
    localStorage.getItem("createEvent_image") || ""
  );
  const [optionData, setOptionData] = useState(() => {
    try {
      const storedOptionData = localStorage.getItem("createEvent_optionData");
      return storedOptionData
        ? JSON.parse(storedOptionData)
        : {
            limitSlot: "",
            groupAge: "",
            duration: "",
            fee: "",
            quantity: "",
          };
    } catch (e) {
      console.error("Failed to parse optionData from localStorage", e);
      return {
        limitSlot: "",
        groupAge: "",
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
            dateTime: "", // Đây sẽ là ngày và giờ BẮT ĐẦU
            location: "",
            capacity: "",
            // Không cần endTime ở đây, chúng ta sẽ tính toán nó
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

  // Thêm state để lưu thời gian kết thúc đã tính toán
  const [calculatedEndTime, setCalculatedEndTime] = useState("");

  const isSyncingRef = useRef(false);

  // useEffect để lưu state vào Local Storage
  useEffect(() => {
    localStorage.setItem("createEvent_eventName", eventName);
    localStorage.setItem("createEvent_subTitle", subTitle);
    localStorage.setItem("createEvent_description", description); // Cập nhật key và giá trị
    localStorage.setItem(
      "createEvent_details",
      details // Cập nhật key và giá trị
    );
    localStorage.setItem("createEvent_image", image);
    localStorage.setItem("createEvent_optionData", JSON.stringify(optionData));
    localStorage.setItem(
      "createEvent_eventDetails",
      JSON.stringify(eventDetails)
    );
  }, [
    eventName,
    subTitle,
    description, // Thay đổi thành description
    details, // Thay đổi thành details
    image,
    optionData,
    eventDetails,
  ]);

  // Logic đồng bộ quantity và capacity
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

  // === MỚI: useEffect để tính toán thời gian kết thúc ===
  useEffect(() => {
    const startTimeISO = eventDetails.dateTime;
    const durationMinutes = parseInt(optionData.duration, 10); // Lấy duration từ optionData

    if (startTimeISO && !isNaN(durationMinutes) && durationMinutes > 0) {
      const startDate = new Date(startTimeISO);
      if (!isNaN(startDate.getTime())) {
        // Kiểm tra ngày hợp lệ
        const endDate = new Date(
          startDate.getTime() + durationMinutes * 60 * 1000
        );
        setCalculatedEndTime(endDate.toISOString()); // Lưu dưới dạng ISO string
      } else {
        setCalculatedEndTime(""); // Reset nếu ngày không hợp lệ
      }
    } else {
      setCalculatedEndTime(""); // Reset nếu thiếu startTime hoặc duration
    }
  }, [eventDetails.dateTime, optionData.duration]); // Phụ thuộc vào dateTime và duration

  // Ref cho datetime input
  const dateTimeRef = useRef(null);

  const optionCards = [
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
      key: "groupAge",
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
      key: "duration", // Key này dùng cho duration
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

  const detailCards = [
    {
      icon: <CalendarIcon size={24} />,
      label: "Date & Time", // Nhãn vẫn là Date & Time vì input này bao gồm cả 2
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

  const handleCardClick = (card) => {
    setSelectedCard(card);
    setShowModal(true);
  };

  const handleInputChange = (value) => {
    setOptionData((prev) => ({
      ...prev,
      [selectedCard.key]: value,
    }));
  };

  const handleEventDetailChange = (key, value) => {
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

  // Hàm định dạng chỉ hiển thị cho CreateEventPage, không phải cho trang preview
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

  const renderCardContent = (card) => {
    const hasValue =
      optionData[card.key] && optionData[card.key].toString().trim() !== "";

    return (
      <Card.Body className="p-4">
        <div className="fs-1 mb-3">{card.icon}</div>
        <Card.Title className="fw-bold text-dark fs-5 mb-2">
          {card.title}
        </Card.Title>
        <Card.Text className="text-muted small mb-2">
          {card.description}
        </Card.Text>

        {hasValue && (
          <div className="mt-3">
            <Badge
              bg="primary"
              className="border-0 px-3 py-2 text-white"
              style={{ fontSize: "0.875rem", backgroundColor: "#3b82f6" }}
            >
              {optionData[card.key]} {card.unit}
            </Badge>
          </div>
        )}

        {!hasValue && (
          <div className="mt-3">
            <small className="text-primary fw-semibold">Click to set</small>
          </div>
        )}
      </Card.Body>
    );
  };

  // Function to handle image file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImage("");
    }
    // Reset the input value to allow selecting the same file again
    e.target.value = null;
  };

  // Cấu hình toolbar cho React-Quill
  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }], // Tiêu đề
      ["bold", "italic", "underline", "strike", "blockquote"], // Định dạng cơ bản
      [{ list: "ordered" }, { list: "bullet" }], // Danh sách
      [{ indent: "-1" }, { indent: "+1" }], // Thụt lề
      ["link", "image"], // Liên kết và hình ảnh
      [{ color: [] }, { background: [] }], // Màu chữ và màu nền
      [{ align: [] }], // Căn chỉnh
      ["clean"], // Xóa định dạng
    ],
  };

  // Định dạng có sẵn để hiển thị trong toolbar (không bắt buộc, nhưng tốt để biết)
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
            {optionCards.map((card) => (
              <Col key={card.id} xs={12} md={6} lg={3}>
                <Card
                  className="h-100 border-0 shadow text-center"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(8px)",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                  onClick={() => handleCardClick(card)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-8px)";
                    e.currentTarget.style.boxShadow =
                      "0 1rem 3rem rgba(0,0,0,0.175)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 0.5rem 1rem rgba(0,0,0,0.15)";
                  }}
                >
                  {renderCardContent(card)}
                </Card>
              </Col>
            ))}
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
                    {image ? (
                      <img
                        src={image}
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
                    </h2>{" "}
                    {/* Đổi nhãn */}
                  </div>

                  <div
                    className="bg-light rounded border"
                    style={{ minHeight: "250px" }}
                  >
                    <ReactQuill
                      theme="snow"
                      value={description}
                      onChange={setDescription} // Sử dụng state description mới
                      modules={modules}
                      formats={formats}
                      placeholder="Provide a general introduction to your event..." // Cập nhật placeholder
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
                          "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", // Màu sắc khác để dễ phân biệt
                      }}
                    >
                      <span>📑</span>
                    </div>
                    <h2 className="fs-3 fw-bold text-dark mb-0">
                      Event Content - Details
                    </h2>{" "}
                    {/* Đổi nhãn */}
                  </div>

                  <div
                    className="bg-light rounded border"
                    style={{ minHeight: "250px" }}
                  >
                    <ReactQuill
                      theme="snow"
                      value={details} // Sử dụng state details mới
                      onChange={setDetails} // Sử dụng state details mới
                      modules={modules}
                      formats={formats}
                      placeholder="Provide more in-depth details about your event, such as agenda, speakers, etc." // Cập nhật placeholder
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
                      description, // Truyền description (tên mới)
                      details, // Truyền details (tên mới)
                      image,
                      fee: optionData.fee,
                      groupAge: optionData.groupAge,
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
                >
                  Publish Event
                </Button>
              </div>
            </div>
          </Col>

          {/* Right Sidebar */}
          <Col xs={12} lg={4}>
            <div className="d-flex flex-column gap-4">
              <div>
                <h3 className="fs-4 fw-bold text-dark mb-3">Event Details</h3>
                <div className="d-flex flex-column gap-3">
                  {detailCards.map((card, index) => (
                    <Card key={index} className="border-0 shadow-sm">
                      <Card.Body className="p-3">
                        <div className="d-flex align-items-center mb-3">
                          <div
                            className="me-3 rounded text-white d-flex align-items-center justify-content-center"
                            style={{
                              width: "40px",
                              height: "40px",
                              background: card.color,
                            }}
                          >
                            {card.icon}
                          </div>
                          <span className="fw-semibold text-dark">
                            {card.label}
                          </span>
                        </div>

                        {card.key === "dateTime" ? (
                          <div className="position-relative">
                            <Form.Control
                              ref={dateTimeRef}
                              type="datetime-local"
                              value={eventDetails[card.key] || ""}
                              onChange={(e) =>
                                handleEventDetailChange(
                                  card.key,
                                  e.target.value
                                )
                              }
                              className="border-2"
                              style={{
                                borderColor: "#dee2e6",
                                borderRadius: "8px",
                                opacity: eventDetails[card.key] ? 1 : 0,
                              }}
                            />
                            {!eventDetails[card.key] && (
                              <div
                                className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center px-3 text-muted"
                                style={{
                                  cursor: "pointer",
                                  backgroundColor: "white",
                                  border: "2px solid #dee2e6",
                                  borderRadius: "8px",
                                }}
                                onClick={handleDateTimeClick}
                              >
                                {card.placeholder}
                              </div>
                            )}
                          </div>
                        ) : (
                          <Form.Control
                            type={card.inputType || "text"}
                            placeholder={card.placeholder}
                            value={eventDetails[card.key] || ""}
                            onChange={(e) =>
                              handleEventDetailChange(card.key, e.target.value)
                            }
                            className="border-2"
                            style={{
                              borderColor: "#dee2e6",
                              borderRadius: "8px",
                            }}
                          />
                        )}

                        {/* HIỂN THỊ THỜI GIAN ĐÃ CHỌN VÀ THỜI GIAN KẾT THÚC (MỚI) */}
                        {card.key === "dateTime" && (
                          <div className="mt-2">
                            {eventDetails[card.key] && (
                              <small className="text-muted d-block">
                                📅 Bắt đầu:{" "}
                                {formatDateTimeDisplay(eventDetails[card.key])}
                              </small>
                            )}
                            {calculatedEndTime && (
                              <small className="text-muted d-block">
                                ⏰ Kết thúc:{" "}
                                {formatDateTimeDisplay(calculatedEndTime)}
                              </small>
                            )}
                            {!eventDetails[card.key] && !calculatedEndTime && (
                              <small className="text-muted d-block">
                                Chưa có thời gian
                              </small>
                            )}
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Status */}
              <Card
                className="border-0 shadow"
                style={{
                  background:
                    "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
                }}
              >
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <p className="fw-semibold text-dark mb-2">Event Status</p>
                      <div className="d-flex align-items-center">
                        <ActivityIcon size={20} className="text-success me-2" />
                        <Badge
                          bg="success"
                          className="bg-opacity-25 text-success border-0"
                        >
                          Draft
                        </Badge>
                      </div>
                    </div>
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: "48px",
                        height: "48px",
                        backgroundColor: "#dcfce7",
                      }}
                    >
                      <span className="text-success fs-4">✨</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Modal for Option Input */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center">
            <span className="me-2 fs-4">{selectedCard?.icon}</span>
            {selectedCard?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <p className="text-muted mb-3">{selectedCard?.description}</p>
            <Form.Group>
              <Form.Label className="fw-semibold">
                {selectedCard?.title}{" "}
                {selectedCard?.unit && `(${selectedCard.unit})`}
              </Form.Label>
              {selectedCard?.inputType === "select" ? (
                <Form.Select
                  value={optionData[selectedCard?.key] || ""}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="border-2"
                  style={{ borderRadius: "8px" }}
                  autoFocus
                >
                  {!optionData[selectedCard?.key] && (
                    <option value="">{selectedCard?.placeholder}</option>
                  )}
                  {selectedCard?.options?.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </Form.Select>
              ) : (
                <Form.Control
                  type={selectedCard?.inputType || "text"}
                  placeholder={selectedCard?.placeholder}
                  value={optionData[selectedCard?.key] || ""}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="border-2"
                  style={{ borderRadius: "8px" }}
                  autoFocus
                />
              )}
            </Form.Group>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveOption}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EventCreatePage;