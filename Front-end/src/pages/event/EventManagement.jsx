import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Card,
  Button,
  Table,
  Badge,
  Modal,
  Form,
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
  const { t } = useTranslation("eventManagement");

  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("");

  const [statuses, setStatuses] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // State for Edit Status modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  const { get, put } = useFetch();

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

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = event.eventName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        selectedStatus === "" || event.status === selectedStatus;
      const matchesAgeGroup =
        selectedAgeGroup === "" || event.ageGroup === selectedAgeGroup;
      return matchesSearch && matchesStatus && matchesAgeGroup;
    });
  }, [events, searchTerm, selectedStatus, selectedAgeGroup]);

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEvents = filteredEvents.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    document
      .querySelector(".events-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFilterChange = (filterType, value) => {
    setCurrentPage(1);
    switch (filterType) {
      case "searchTerm":
        setSearchTerm(value);
        break;
      case "status":
        setSelectedStatus(value);
        break;
      case "ageGroup":
        setSelectedAgeGroup(value);
        break;
      default:
        break;
    }
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedStatus("");
    setSelectedAgeGroup("");
    setCurrentPage(1);
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

  return (
    <div className="event-management-content">
      <h1>{t("eventManagementTitle")}</h1>

      <SearchFilter
        filterFor="events"
        searchTerm={searchTerm}
        selectedStatus={selectedStatus}
        selectedAgeGroup={selectedAgeGroup}
        onSearchChange={(value) => handleFilterChange("searchTerm", value)}
        onStatusChange={(value) => handleFilterChange("status", value)}
        onAgeGroupChange={(value) => handleFilterChange("ageGroup", value)}
        statusOptions={statusOptions}
        ageGroupOptions={ageGroupOptions}
        placeholder={t("searchEventPlaceholder")}
      />

      {(searchTerm !== "" ||
        selectedStatus !== "" ||
        selectedAgeGroup !== "") && (
        <div className="d-flex justify-content-center mt-3">
          <Button variant="outline-primary" onClick={clearAllFilters}>
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
                                ["APPROVED", "NOT_STARTED", "ONGOING"].includes(
                                  event.status
                                )
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
                                onClick={() => handleViewEvent(event.eventID)}
                              >
                                {t("view")}
                              </Button>

                              {user?.role === "STAFF" && (
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  className="fw-bold"
                                  onClick={() => handleEditEvent(event.eventID)}
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
    </div>
  );
}

export default EventManagement;
