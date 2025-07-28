// import React, { useState, useEffect, useMemo } from "react";
// import {
//   Container,
//   Card,
//   Button,
//   Table,
//   Badge,
//   Modal,
//   Form,
// } from "react-bootstrap";
// import { useNavigate } from "react-router-dom";
// import useFetch from "../../hooks/useFetch";
// import SearchFilter from "../../components/others/SearchFilter";
// import Pagination from "../../components/others/Pagination";
// import { PlusCircle } from "lucide-react";
// import { useAuth } from "../../hooks/useAuth";
// import { toast } from "react-toastify";
// import { useTranslation } from "react-i18next";

// function EventManagement() {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const { t } = useTranslation("eventManagement");

//   const [events, setEvents] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedStatus, setSelectedStatus] = useState("");
//   const [selectedAgeGroup, setSelectedAgeGroup] = useState("");

//   const [statuses, setStatuses] = useState([]);
//   const [ageGroups, setAgeGroups] = useState([]);

//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;

//   // State for Edit Status modal
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [selectedEventId, setSelectedEventId] = useState(null);
//   const [newStatus, setNewStatus] = useState("");

//   const { get, put } = useFetch();

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const eventsData = await get("http://localhost:8080/api/event");
//         setEvents(eventsData?.data || eventsData || []);
//         const statusesData = await get(
//           "http://localhost:8080/api/event/status"
//         );
//         setStatuses(statusesData?.data || statusesData || []);
//         const ageGroupsData = await get(
//           "http://localhost:8080/api/user/age-group"
//         );
//         setAgeGroups(ageGroupsData?.data || ageGroupsData || []);
//       } catch (error) {
//         console.error("Fetch error in EventManagement:", error);
//         toast.error(
//           t("fetchError", {
//             defaultValue: "Failed to fetch data. Please try again.",
//           })
//         );
//       }
//     };
//     fetchData();
//   }, [get, t]);

//   const statusOptions = statuses.map((status) => ({
//     value: status,
//     label: status,
//   }));

//   const ageGroupOptions = ageGroups.map((ageGroup) => ({
//     value: ageGroup,
//     label: ageGroup,
//   }));

//   const filteredEvents = useMemo(() => {
//     return events.filter((event) => {
//       const matchesSearch = event.eventName
//         .toLowerCase()
//         .includes(searchTerm.toLowerCase());
//       const matchesStatus =
//         selectedStatus === "" || event.status === selectedStatus;
//       const matchesAgeGroup =
//         selectedAgeGroup === "" || event.ageGroup === selectedAgeGroup;
//       return matchesSearch && matchesStatus && matchesAgeGroup;
//     });
//   }, [events, searchTerm, selectedStatus, selectedAgeGroup]);

//   const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const endIndex = startIndex + itemsPerPage;
//   const currentEvents = filteredEvents.slice(startIndex, endIndex);

//   const handlePageChange = (page) => {
//     setCurrentPage(page);
//     document
//       .querySelector(".events-section")
//       ?.scrollIntoView({ behavior: "smooth" });
//   };

//   const handleFilterChange = (filterType, value) => {
//     setCurrentPage(1);
//     switch (filterType) {
//       case "searchTerm":
//         setSearchTerm(value);
//         break;
//       case "status":
//         setSelectedStatus(value);
//         break;
//       case "ageGroup":
//         setSelectedAgeGroup(value);
//         break;
//       default:
//         break;
//     }
//   };

//   const clearAllFilters = () => {
//     setSearchTerm("");
//     setSelectedStatus("");
//     setSelectedAgeGroup("");
//     setCurrentPage(1);
//   };

//   const handleViewEvent = (eventID) => {
//     console.log(`Xem sự kiện với ID: ${eventID}`);
//     navigate(`/events/${eventID}`);
//   };

//   const handleEditEvent = (eventID) => {
//     console.log(`Chỉnh sửa sự kiện với ID: ${eventID}`);
//     navigate(`/events/edit/${eventID}`);
//   };

//   const handleEditStatus = (eventID, currentStatus) => {
//     setSelectedEventId(eventID);
//     setNewStatus(currentStatus);
//     setShowEditModal(true);
//   };

//   const handleStatusUpdate = async () => {
//     if (!selectedEventId || !newStatus) {
//       toast.error(
//         t("invalidStatusUpdate", { defaultValue: "Invalid event or status" })
//       );
//       return;
//     }
//     try {
//       await put(
//         {},
//         {},
//         `http://localhost:8080/api/event/${selectedEventId}/${newStatus}`
//       );
//       setEvents((prevEvents) =>
//         prevEvents.map((event) =>
//           event.eventID === selectedEventId
//             ? { ...event, status: newStatus }
//             : event
//         )
//       );
//       toast.success(t("successfullyUpdatedStatus", { status: newStatus }));
//       setShowEditModal(false);
//       setSelectedEventId(null);
//       setNewStatus("");
//     } catch (error) {
//       console.error(
//         `Error updating event status for ID ${selectedEventId}:`,
//         error
//       );
//       toast.error(
//         t("failedToUpdateStatus", {
//           defaultValue: "Failed to update event status",
//         })
//       );
//     }
//   };

//   const handleApproveEvent = async (eventId) => {
//     if (window.confirm(`Are you sure you want to approve event ${eventId}?`)) {
//       try {
//         await put({}, {}, `http://localhost:8080/api/event/${eventId}/approve`);
//         setEvents((prevEvents) =>
//           prevEvents.map((event) =>
//             event.eventID === eventId ? { ...event, status: "APPROVED" } : event
//           )
//         );
//         toast.success(t("successfullyApproved"));
//       } catch (error) {
//         console.error(`Error approving event ${eventId}:`, error);
//         toast.error(t("failedToApprove"));
//       }
//     }
//   };

//   const handleRejectEvent = async (eventId) => {
//     if (window.confirm(`Are you sure you want to reject event ${eventId}?`)) {
//       try {
//         await put({}, {}, `http://localhost:8080/api/event/${eventId}/reject`);
//         setEvents((prevEvents) =>
//           prevEvents.map((event) =>
//             event.eventID === eventId ? { ...event, status: "REJECTED" } : event
//           )
//         );
//         toast.success(t("successfullyRejected"));
//       } catch (error) {
//         console.error(`Error rejecting event ${eventId}:`, error);
//         toast.error(t("failedToReject"));
//       }
//     }
//   };

//   const formatDateTime = (isoString) => {
//     if (!isoString) return "N/A";
//     try {
//       return new Date(isoString).toLocaleString();
//     } catch (e) {
//       console.error("Invalid date string:", isoString, e);
//       return "Invalid Date";
//     }
//   };

//   // Filter statuses for the Edit Status modal
//   const allowedStatuses = statuses.filter(
//     (status) => status !== "DRAFT" && status !== "PENDING_APPROVAL"
//   );

//   return (
//     <div className="event-management-content">
//       <h1>{t("eventManagementTitle")}</h1>

//       <SearchFilter
//         filterFor="events"
//         searchTerm={searchTerm}
//         selectedStatus={selectedStatus}
//         selectedAgeGroup={selectedAgeGroup}
//         onSearchChange={(value) => handleFilterChange("searchTerm", value)}
//         onStatusChange={(value) => handleFilterChange("status", value)}
//         onAgeGroupChange={(value) => handleFilterChange("ageGroup", value)}
//         statusOptions={statusOptions}
//         ageGroupOptions={ageGroupOptions}
//         placeholder={t("searchEventPlaceholder")}
//       />

//       {(searchTerm !== "" ||
//         selectedStatus !== "" ||
//         selectedAgeGroup !== "") && (
//         <div className="d-flex justify-content-center mt-3">
//           <Button variant="outline-primary" onClick={clearAllFilters}>
//             {t("clearFilters")}
//           </Button>
//         </div>
//       )}

//       <div className="d-flex align-items-center mb-4">
//         <Button
//           variant="outline-success"
//           size="sm"
//           onClick={() => navigate("/events/create")}
//           className="ms-auto"
//         >
//           <PlusCircle size={16} className="me-1" /> {t("addEvent")}
//         </Button>
//       </div>

//       <Container className="mb-5 events-section">
//         {filteredEvents.length > 0 ? (
//           <>
//             <Card>
//               <Card.Header>
//                 {t("eventList")}{" "}
//                 <Badge bg="secondary">{filteredEvents.length}</Badge>
//               </Card.Header>
//               <Card.Body style={{ padding: 0 }}>
//                 <div style={{ maxHeight: "150vh", position: "relative" }}>
//                   <Table
//                     bordered
//                     hover
//                     className="table-sticky-header"
//                     style={{ marginBottom: 0 }}
//                   >
//                     <thead>
//                       <tr>
//                         <th>{t("STT")}</th>
//                         <th>{t("eventName")}</th>
//                         <th>{t("location")}</th>
//                         <th>{t("startDate")}</th>
//                         <th>{t("endDate")}</th>
//                         <th>{t("status")}</th>
//                         <th>{t("ageGroup")}</th>
//                         <th>{t("fee")}</th>
//                         <th>{t("createdBy")}</th>
//                         <th>{t("createdAt")}</th>
//                         <th>{t("actions")}</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {currentEvents.map((event, index) => (
//                         <tr key={event.eventID}>
//                           <td>{startIndex + index + 1}</td>
//                           <td>{event.eventName}</td>
//                           <td>{event.location}</td>
//                           <td>{formatDateTime(event.startDate)}</td>
//                           <td>{formatDateTime(event.endDate)}</td>
//                           <td>
//                             <Badge
//                               bg={
//                                 ["APPROVED", "NOT_STARTED", "ONGOING"].includes(
//                                   event.status
//                                 )
//                                   ? "success"
//                                   : ["DRAFT", "PENDING_APPROVAL"].includes(
//                                       event.status
//                                     )
//                                   ? "warning"
//                                   : "danger"
//                               }
//                             >
//                               {event.status}
//                             </Badge>
//                           </td>
//                           <td>{event.ageGroup}</td>
//                           <td>
//                             {event.fee != null && event.fee !== 0
//                               ? `${Number(event.fee).toLocaleString(
//                                   "vi-VN"
//                                 )} VND`
//                               : t("free")}
//                           </td>
//                           <td>
//                             {event.createdByStaff
//                               ? event.createdByStaff.fullName
//                               : "N/A"}
//                           </td>
//                           <td>{formatDateTime(event.createdAt)}</td>
//                           <td>
//                             <div className="d-flex align-items-center gap-2 flex-shrink-0">
//                               <Button
//                                 variant="outline-primary"
//                                 size="sm"
//                                 className="fw-bold"
//                                 onClick={() => handleViewEvent(event.eventID)}
//                               >
//                                 {t("view")}
//                               </Button>

//                               {user?.role === "STAFF" &&
//                                 !["ONGOING", "NOT_STARTED"].includes(
//                                   event.status
//                                 ) && (
//                                   <Button
//                                     variant="outline-success"
//                                     size="sm"
//                                     className="fw-bold"
//                                     onClick={() => handleEditEvent(event.eventID)}
//                                   >
//                                     {t("edit")}
//                                   </Button>
//                                 )}

//                               {user?.role === "MANAGER" && (
//                                 <Button
//                                   variant="outline-warning"
//                                   size="sm"
//                                   className="fw-bold"
//                                   onClick={() =>
//                                     handleEditStatus(
//                                       event.eventID,
//                                       event.status
//                                     )
//                                   }
//                                 >
//                                   {t("editStatus")}
//                                 </Button>
//                               )}

//                               {event.status === "PENDING_APPROVAL" &&
//                                 user?.role === "MANAGER" && (
//                                   <>
//                                     <Button
//                                       variant="outline-success"
//                                       size="sm"
//                                       className="fw-bold"
//                                       onClick={() =>
//                                         handleApproveEvent(event.eventID)
//                                       }
//                                     >
//                                       {t("approve")}
//                                     </Button>
//                                     <Button
//                                       variant="outline-danger"
//                                       size="sm"
//                                       className="fw-bold"
//                                       onClick={() =>
//                                         handleRejectEvent(event.eventID)
//                                       }
//                                     >
//                                       {t("reject")}
//                                     </Button>
//                                   </>
//                                 )}
//                             </div>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </Table>
//                 </div>
//               </Card.Body>
//             </Card>

//             <Pagination
//               currentPage={currentPage}
//               totalPages={totalPages}
//               onPageChange={handlePageChange}
//               itemsPerPage={itemsPerPage}
//             />
//           </>
//         ) : (
//           <div className="text-center py-5">
//             <p className="text-muted">{t("noMatchingEvents")}</p>
//           </div>
//         )}
//       </Container>

//       {/* Modal for Editing Status */}
//       <Modal
//         show={showEditModal}
//         onHide={() => setShowEditModal(false)}
//         centered
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>{t("editEventStatus")}</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Form.Group controlId="statusSelect">
//               <Form.Label>{t("selectStatus")}</Form.Label>
//               <Form.Select
//                 value={newStatus}
//                 onChange={(e) => setNewStatus(e.target.value)}
//               >
//                 <option value="">{t("selectStatusPlaceholder")}</option>
//                 {allowedStatuses.map((status) => (
//                   <option key={status} value={status}>
//                     {status}
//                   </option>
//                 ))}
//               </Form.Select>
//             </Form.Group>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowEditModal(false)}>
//             {t("cancel")}
//           </Button>
//           <Button
//             variant="primary"
//             onClick={handleStatusUpdate}
//             disabled={!newStatus}
//           >
//             {t("save")}
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// }

// export default EventManagement;

import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Card,
  Button,
  Table,
  Badge,
  Modal,
  Form,
  Tabs,
  Tab,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import SearchFilter from "../../components/others/SearchFilter";
import Pagination from "../../components/others/Pagination";
import { PlusCircle } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

function EventManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, i18n } = useTranslation("eventManagement");

  const [events, setEvents] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [searchTermEvents, setSearchTermEvents] = useState("");
  const [selectedStatusEvents, setSelectedStatusEvents] = useState("");
  const [selectedAgeGroupEvents, setSelectedAgeGroupEvents] = useState("");
  const [searchTermSurveys, setSearchTermSurveys] = useState("");
  const [selectedStatusSurveys, setSelectedStatusSurveys] = useState("");

  const [statuses, setStatuses] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // State for Edit Status modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  // State for Add/Edit Survey modal
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [surveyEventId, setSurveyEventId] = useState(null);
  const [surveyId, setSurveyId] = useState(null);
  const [formLink, setFormLink] = useState("");
  const [surveyType, setSurveyType] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  const { get, put, post } = useFetch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsData = await get("http://localhost:8080/api/event");
        setEvents(eventsData?.data || eventsData || []);
        const statusesData = await get(
          "http://localhost:8080/api/event/status"
        );
        setStatuses(statusesData?.data || statusesData || []);
        const ageGroupsData = await get(
          "http://localhost:8080/api/user/age-group"
        );
        setAgeGroups(ageGroupsData?.data || ageGroupsData || []);
        const surveysData = await get("http://localhost:8080/api/surveys");
        setSurveys(surveysData?.data || surveysData || []);
      } catch (error) {
        console.error("Fetch error in EventManagement:", error);
        toast.error(
          t("fetchError", {
            defaultValue: "Failed to fetch data. Please try again.",
          })
        );
      }
    };
    fetchData();
  }, [get, t]);

  const statusOptions = statuses.map((status) => ({
    value: status,
    label: status,
  }));

  const ageGroupOptions = ageGroups.map((ageGroup) => ({
    value: ageGroup,
    label: ageGroup,
  }));

  // Filter for Events tab
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = event.eventName
        .toLowerCase()
        .includes(searchTermEvents.toLowerCase());
      const matchesStatus =
        selectedStatusEvents === "" || event.status === selectedStatusEvents;
      const matchesAgeGroup =
        selectedAgeGroupEvents === "" ||
        event.ageGroup === selectedAgeGroupEvents;
      return matchesSearch && matchesStatus && matchesAgeGroup;
    });
  }, [events, searchTermEvents, selectedStatusEvents, selectedAgeGroupEvents]);

  // Filter for Surveys tab
  const filteredSurveyEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = event.eventName
        .toLowerCase()
        .includes(searchTermSurveys.toLowerCase());
      const matchesStatus =
        selectedStatusSurveys === "" || event.status === selectedStatusSurveys;
      return matchesSearch && matchesStatus;
    });
  }, [events, searchTermSurveys, selectedStatusSurveys]);

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEvents = filteredEvents.slice(startIndex, endIndex);
  const currentSurveyEvents = filteredSurveyEvents.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    document
      .querySelector(".events-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFilterChange = (tab, filterType, value) => {
    setCurrentPage(1);
    if (tab === "events") {
      switch (filterType) {
        case "searchTerm":
          setSearchTermEvents(value);
          break;
        case "status":
          setSelectedStatusEvents(value);
          break;
        case "ageGroup":
          setSelectedAgeGroupEvents(value);
          break;
        default:
          break;
      }
    } else if (tab === "surveys") {
      switch (filterType) {
        case "searchTerm":
          setSearchTermSurveys(value);
          break;
        case "status":
          setSelectedStatusSurveys(value);
          break;
        default:
          break;
      }
    }
  };

  const clearAllFilters = (tab) => {
    setCurrentPage(1);
    if (tab === "events") {
      setSearchTermEvents("");
      setSelectedStatusEvents("");
      setSelectedAgeGroupEvents("");
    } else if (tab === "surveys") {
      setSearchTermSurveys("");
      setSelectedStatusSurveys("");
    }
  };

  const handleViewEvent = (eventID) => {
    console.log(`Xem sự kiện với ID: ${eventID}`);
    navigate(`/events/${eventID}`);
  };

  const handleEditEvent = (eventID) => {
    console.log(`Chỉnh sửa sự kiện với ID: ${eventID}`);
    navigate(`/events/edit/${eventID}`);
  };

  const handleEditStatus = (eventID, currentStatus) => {
    setSelectedEventId(eventID);
    setNewStatus(currentStatus);
    setShowEditModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedEventId || !newStatus) {
      toast.error(
        t("invalidStatusUpdate", { defaultValue: "Invalid event or status" })
      );
      return;
    }
    try {
      await put(
        {},
        {},
        `http://localhost:8080/api/event/${selectedEventId}/${newStatus}`
      );
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.eventID === selectedEventId
            ? { ...event, status: newStatus }
            : event
        )
      );
      toast.success(t("successfullyUpdatedStatus", { status: newStatus }));
      setShowEditModal(false);
      setSelectedEventId(null);
      setNewStatus("");
    } catch (error) {
      console.error(
        `Error updating event status for ID ${selectedEventId}:`,
        error
      );
      toast.error(
        t("failedToUpdateStatus", {
          defaultValue: "Failed to update event status",
        })
      );
    }
  };

  const handleApproveEvent = async (eventId) => {
    if (window.confirm(`Are you sure you want to approve event ${eventId}?`)) {
      try {
        await put({}, {}, `http://localhost:8080/api/event/${eventId}/approve`);
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.eventID === eventId ? { ...event, status: "APPROVED" } : event
          )
        );
        toast.success(t("successfullyApproved"));
      } catch (error) {
        console.error(`Error approving event ${eventId}:`, error);
        toast.error(t("failedToApprove"));
      }
    }
  };

  const handleRejectEvent = async (eventId) => {
    if (window.confirm(`Are you sure you want to reject event ${eventId}?`)) {
      try {
        await put({}, {}, `http://localhost:8080/api/event/${eventId}/reject`);
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.eventID === eventId ? { ...event, status: "REJECTED" } : event
          )
        );
        toast.success(t("successfullyRejected"));
      } catch (error) {
        console.error(`Error rejecting event ${eventId}:`, error);
        toast.error(t("failedToReject"));
      }
    }
  };

  const handleAddSurvey = (eventID, type) => {
    setSurveyEventId(eventID);
    setSurveyId(null);
    setFormLink("");
    setSurveyType(type);
    setIsEditMode(false);
    setShowSurveyModal(true);
  };

  const handleEditSurvey = (surveyId, formLink, surveyType) => {
    const survey = surveys.find((s) => s.surveyID === surveyId);
    if (survey) {
      setSurveyId(surveyId);
      setSurveyEventId(survey.eventID); // Gán eventID từ survey
      setFormLink(formLink);
      setSurveyType(surveyType); // Giữ nguyên type từ survey
      setIsEditMode(true);
      setShowSurveyModal(true);
    }
  };

  const handleSurveySubmit = async () => {
    console.log("Submitting survey:", {
      surveyEventId,
      formLink,
      surveyType,
      isEditMode,
    });
    if (!formLink) {
      // Chỉ kiểm tra formLink khi chỉnh sửa
      toast.error(
        t("invalidSurveyInput", {
          defaultValue: "Please provide all survey details",
        })
      );
      return;
    }
    try {
      if (isEditMode) {
        const response = await put(
          {
            formLink: formLink,
            type: surveyType,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
          `http://localhost:8080/api/surveys/${surveyId}`
        );
        setSurveys((prevSurveys) =>
          prevSurveys.map((survey) =>
            survey.surveyID === surveyId
              ? { ...survey, formLink, type: surveyType }
              : survey
          )
        );
        toast.success(t("surveyUpdated"));
      } else {
        if (!surveyEventId || !surveyType) {
          toast.error(
            t("invalidSurveyInput", {
              defaultValue: "Please provide all survey details",
            })
          );
          return;
        }
        const response = await post(
          {
            eventID: surveyEventId,
            formLink: formLink,
            type: surveyType,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
          "http://localhost:8080/api/surveys"
        );
        console.log("API response:", response);
        setSurveys((prevSurveys) => [
          ...prevSurveys,
          {
            surveyID: response.surveyID,
            eventID: surveyEventId,
            formLink: response.formLink,
            type: response.type,
          },
        ]);
        toast.success(t("surveyCreated", { id: response.surveyID }));
      }
      setShowSurveyModal(false);
      setSurveyEventId(null);
      setSurveyId(null);
      setFormLink("");
      setSurveyType("");
      setIsEditMode(false);
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} survey:`,
        error
      );
      toast.error(
        error.response?.data ||
          (isEditMode
            ? t("failedToUpdateSurvey", {
                defaultValue: "Failed to update survey",
              })
            : t("failedToCreateSurvey", {
                defaultValue: "Failed to create survey",
              }))
      );
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return "N/A";
    try {
      return new Date(isoString).toLocaleString();
    } catch (e) {
      console.error("Invalid date string:", isoString, e);
      return "Invalid Date";
    }
  };

  // Filter statuses for the Edit Status modal
  const allowedStatuses = statuses.filter(
    (status) => status !== "DRAFT" && status !== "PENDING_APPROVAL"
  );

  // Filter surveys for a specific event
  const getSurveysForEvent = (eventId) => {
    return surveys.filter((survey) => survey.eventID === eventId);
  };

  // Hàm rút gọn link để hiển thị
  const shortenLink = (link) => {
    if (!link) return "N/A";
    const url = new URL(link);
    return `${url.hostname}/...`;
  };

  return (
    <div className="event-management-content">
      <h1>{t("eventManagementTitle")}</h1>

      <Tabs
        defaultActiveKey="events"
        id="event-management-tabs"
        className="mb-4"
        onSelect={(tab) => setCurrentPage(1)} // Reset page when switching tabs
      >
        <Tab eventKey="events" title={t("eventsTab")}>
          <SearchFilter
            filterFor="events"
            searchTerm={searchTermEvents}
            selectedStatus={selectedStatusEvents}
            selectedAgeGroup={selectedAgeGroupEvents}
            onSearchChange={(value) =>
              handleFilterChange("events", "searchTerm", value)
            }
            onStatusChange={(value) =>
              handleFilterChange("events", "status", value)
            }
            onAgeGroupChange={(value) =>
              handleFilterChange("events", "ageGroup", value)
            }
            statusOptions={statusOptions}
            ageGroupOptions={ageGroupOptions}
            placeholder={t("searchEventPlaceholder")}
          />

          {(searchTermEvents !== "" ||
            selectedStatusEvents !== "" ||
            selectedAgeGroupEvents !== "") && (
            <div className="d-flex justify-content-center mt-3">
              <Button
                variant="outline-primary"
                onClick={() => clearAllFilters("events")}
              >
                {t("clearFilters")}
              </Button>
            </div>
          )}

          <div className="d-flex align-items-center mb-4">
            <Button
              variant="outline-success"
              size="sm"
              onClick={() => navigate("/events/create")}
              className="ms-auto"
            >
              <PlusCircle size={16} className="me-1" /> {t("addEvent")}
            </Button>
          </div>

          <Container className="mb-5 events-section">
            {filteredEvents.length > 0 ? (
              <>
                <Card>
                  <Card.Header>
                    {t("eventList")}{" "}
                    <Badge bg="secondary">{filteredEvents.length}</Badge>
                  </Card.Header>
                  <Card.Body style={{ padding: 0 }}>
                    <div style={{ maxHeight: "150vh", position: "relative" }}>
                      <Table
                        bordered
                        hover
                        className="table-sticky-header"
                        style={{ marginBottom: 0 }}
                      >
                        <thead>
                          <tr>
                            <th>{t("STT")}</th>
                            <th>{t("eventName")}</th>
                            <th>{t("location")}</th>
                            <th>{t("startDate")}</th>
                            <th>{t("endDate")}</th>
                            <th>{t("status")}</th>
                            <th>{t("ageGroup")}</th>
                            <th>{t("fee")}</th>
                            <th>{t("createdBy")}</th>
                            <th>{t("createdAt")}</th>
                            <th>{t("actions")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentEvents.map((event, index) => (
                            <tr key={event.eventID}>
                              <td>{startIndex + index + 1}</td>
                              <td>{event.eventName}</td>
                              <td>{event.location}</td>
                              <td>{formatDateTime(event.startDate)}</td>
                              <td>{formatDateTime(event.endDate)}</td>
                              <td>
                                <Badge
                                  bg={
                                    [
                                      "APPROVED",
                                      "NOT_STARTED",
                                      "ONGOING",
                                    ].includes(event.status)
                                      ? "success"
                                      : ["DRAFT", "PENDING_APPROVAL"].includes(
                                          event.status
                                        )
                                      ? "warning"
                                      : "danger"
                                  }
                                >
                                  {event.status}
                                </Badge>
                              </td>
                              <td>{event.ageGroup}</td>
                              <td>
                                {event.fee != null && event.fee !== 0
                                  ? `${Number(event.fee).toLocaleString(
                                      "vi-VN"
                                    )} VND`
                                  : t("free")}
                              </td>
                              <td>
                                {event.createdByStaff
                                  ? event.createdByStaff.fullName
                                  : "N/A"}
                              </td>
                              <td>{formatDateTime(event.createdAt)}</td>
                              <td>
                                <div className="d-flex align-items-center gap-2 flex-shrink-0">
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="fw-bold"
                                    onClick={() =>
                                      handleViewEvent(event.eventID)
                                    }
                                  >
                                    {t("view")}
                                  </Button>

                                  {user?.role === "STAFF" &&
                                    !["ONGOING", "NOT_STARTED"].includes(
                                      event.status
                                    ) && (
                                      <Button
                                        variant="outline-success"
                                        size="sm"
                                        className="fw-bold"
                                        onClick={() =>
                                          handleEditEvent(event.eventID)
                                        }
                                      >
                                        {t("edit")}
                                      </Button>
                                    )}

                                  {user?.role === "MANAGER" && (
                                    <Button
                                      variant="outline-warning"
                                      size="sm"
                                      className="fw-bold"
                                      onClick={() =>
                                        handleEditStatus(
                                          event.eventID,
                                          event.status
                                        )
                                      }
                                    >
                                      {t("editStatus")}
                                    </Button>
                                  )}

                                  {event.status === "PENDING_APPROVAL" &&
                                    user?.role === "MANAGER" && (
                                      <>
                                        <Button
                                          variant="outline-success"
                                          size="sm"
                                          className="fw-bold"
                                          onClick={() =>
                                            handleApproveEvent(event.eventID)
                                          }
                                        >
                                          {t("approve")}
                                        </Button>
                                        <Button
                                          variant="outline-danger"
                                          size="sm"
                                          className="fw-bold"
                                          onClick={() =>
                                            handleRejectEvent(event.eventID)
                                          }
                                        >
                                          {t("reject")}
                                        </Button>
                                      </>
                                    )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  itemsPerPage={itemsPerPage}
                />
              </>
            ) : (
              <div className="text-center py-5">
                <p className="text-muted">{t("noMatchingEvents")}</p>
              </div>
            )}
          </Container>
        </Tab>

        <Tab eventKey="surveys" title={t("surveysTab")}>
          <SearchFilter
            filterFor="surveys"
            searchTerm={searchTermSurveys}
            selectedStatus={selectedStatusSurveys}
            onSearchChange={(value) =>
              handleFilterChange("surveys", "searchTerm", value)
            }
            onStatusChange={(value) =>
              handleFilterChange("surveys", "status", value)
            }
            statusOptions={statusOptions}
            placeholder={t("searchEventPlaceholder")}
          />

          {(searchTermSurveys !== "" || selectedStatusSurveys !== "") && (
            <div className="d-flex justify-content-center mt-3">
              <Button
                variant="outline-primary"
                onClick={() => clearAllFilters("surveys")}
              >
                {t("clearFilters")}
              </Button>
            </div>
          )}

          <Container className="mb-5 surveys-section">
            <Card>
              <Card.Header>
                {t("surveyList")}{" "}
                <Badge bg="secondary">{filteredSurveyEvents.length}</Badge>
              </Card.Header>
              <Card.Body style={{ padding: 0 }}>
                <div style={{ maxHeight: "150vh", position: "relative" }}>
                  <Table
                    bordered
                    hover
                    className="table-sticky-header"
                    style={{ marginBottom: 0 }}
                  >
                    <thead>
                      <tr>
                        <th>{t("STT")}</th>
                        <th>{t("eventName")}</th>
                        <th>{t("status")}</th>
                        <th style={{ maxWidth: "150px" }}>{t("preSurvey")}</th>
                        <th style={{ maxWidth: "150px" }}>{t("postSurvey")}</th>
                        <th>{t("actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentSurveyEvents.map((event, index) => {
                        const eventSurveys = getSurveysForEvent(event.eventID);
                        const preSurvey = eventSurveys.find(
                          (s) => s.type === "PRE_EVENT"
                        );
                        const postSurvey = eventSurveys.find(
                          (s) => s.type === "POST_EVENT"
                        );
                        const eventName =
                          i18n.language === "vi" && event.eventNameVi
                            ? event.eventNameVi
                            : event.eventName;
                        return (
                          <tr key={event.eventID}>
                            <td>{startIndex + index + 1}</td>
                            <td>{eventName}</td>
                            <td>
                              <Badge
                                bg={
                                  [
                                    "APPROVED",
                                    "NOT_STARTED",
                                    "ONGOING",
                                  ].includes(event.status)
                                    ? "success"
                                    : ["DRAFT", "PENDING_APPROVAL"].includes(
                                        event.status
                                      )
                                    ? "warning"
                                    : "danger"
                                }
                              >
                                {event.status}
                              </Badge>
                            </td>
                            <td
                              style={{
                                maxWidth: "150px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {preSurvey ? (
                                <a
                                  href={preSurvey.formLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={preSurvey.formLink}
                                >
                                  {shortenLink(preSurvey.formLink)}
                                </a>
                              ) : (
                                "N/A"
                              )}
                            </td>
                            <td
                              style={{
                                maxWidth: "150px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {postSurvey ? (
                                <a
                                  href={postSurvey.formLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={postSurvey.formLink}
                                >
                                  {shortenLink(postSurvey.formLink)}
                                </a>
                              ) : (
                                "N/A"
                              )}
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-2 flex-shrink-0">
                                {user?.role === "STAFF" &&
                                  [
                                    "APPROVED",
                                    "NOT_STARTED",
                                    "ONGOING",
                                  ].includes(event.status) && (
                                    <>
                                      {!preSurvey && (
                                        <Button
                                          variant="outline-info"
                                          size="sm"
                                          className="fw-bold"
                                          onClick={() =>
                                            handleAddSurvey(
                                              event.eventID,
                                              "PRE_EVENT"
                                            )
                                          }
                                        >
                                          {t("addPreSurvey")}
                                        </Button>
                                      )}
                                      {preSurvey && (
                                        <Button
                                          variant="outline-warning"
                                          size="sm"
                                          className="fw-bold"
                                          onClick={() =>
                                            handleEditSurvey(
                                              preSurvey.surveyID,
                                              preSurvey.formLink,
                                              preSurvey.type
                                            )
                                          }
                                        >
                                          {t("editPreSurvey")}
                                        </Button>
                                      )}
                                      {!postSurvey && (
                                        <Button
                                          variant="outline-info"
                                          size="sm"
                                          className="fw-bold"
                                          onClick={() =>
                                            handleAddSurvey(
                                              event.eventID,
                                              "POST_EVENT"
                                            )
                                          }
                                        >
                                          {t("addPostSurvey")}
                                        </Button>
                                      )}
                                      {postSurvey && (
                                        <Button
                                          variant="outline-warning"
                                          size="sm"
                                          className="fw-bold"
                                          onClick={() =>
                                            handleEditSurvey(
                                              postSurvey.surveyID,
                                              postSurvey.formLink,
                                              postSurvey.type
                                            )
                                          }
                                        >
                                          {t("editPostSurvey")}
                                        </Button>
                                      )}
                                    </>
                                  )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>

            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredSurveyEvents.length / itemsPerPage)}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
            />
          </Container>
        </Tab>
      </Tabs>

      {/* Modal for Editing Status */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{t("editEventStatus")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="statusSelect">
              <Form.Label>{t("selectStatus")}</Form.Label>
              <Form.Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="">{t("selectStatusPlaceholder")}</option>
                {allowedStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={handleStatusUpdate}
            disabled={!newStatus}
          >
            {t("save")}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for Adding/Editing Survey */}
      <Modal
        show={showSurveyModal}
        onHide={() => setShowSurveyModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditMode ? t("editSurveyTitle") : t("addSurveyTitle")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formLink" className="mb-3">
              <Form.Label>{t("surveyUrlLabel")}</Form.Label>
              <Form.Control
                type="url"
                placeholder={t("surveyUrlPlaceholder")}
                value={formLink}
                onChange={(e) => setFormLink(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSurveyModal(false)}>
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={handleSurveySubmit}
            disabled={!formLink || !surveyType}
          >
            {t("save")}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default EventManagement;
