import React, { useState, useEffect, useMemo } from "react";
import { Container, Card, Button, Table, Badge } from "react-bootstrap";
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

  const { get, put } = useFetch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsData = await get("http://localhost:8080/api/event");
        setEvents(eventsData);
        const statusesData = await get(
          "http://localhost:8080/api/event/status"
        );
        setStatuses(statusesData);
        const ageGroupsData = await get(
          "http://localhost:8080/api/user/age-group"
        );
        setAgeGroups(ageGroupsData);
      } catch (error) {
        console.error("Fetch error in EventManagement:", error);
      }
    };
    fetchData();
  }, [get]);

  // Tạo options cho SearchFilter từ dữ liệu fetch được
  const statusOptions = statuses.map((status) => ({
    value: status,
    label: status,
  }));

  const ageGroupOptions = ageGroups.map((ageGroup) => ({
    value: ageGroup,
    label: ageGroup,
  }));

  // Lọc sự kiện dựa trên tiêu chí tìm kiếm và bộ lọc (sử dụng useMemo để tối ưu hiệu suất)
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = event.eventName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        selectedStatus === "" || event.status === selectedStatus; // Sử dụng selectedStatus
      const matchesAgeGroup =
        selectedAgeGroup === "" || event.ageGroup === selectedAgeGroup; // Sử dụng selectedAgeGroup

      return matchesSearch && matchesStatus && matchesAgeGroup;
    });
  }, [events, searchTerm, selectedStatus, selectedAgeGroup]);

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEvents = filteredEvents.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Cuộn lên đầu phần sự kiện khi chuyển trang
    document
      .querySelector(".events-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  // Xử lý thay đổi bộ lọc (bao gồm cả tìm kiếm)
  const handleFilterChange = (filterType, value) => {
    setCurrentPage(1); // Reset về trang đầu tiên khi bộ lọc thay đổi
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
    setCurrentPage(1); // Reset về trang đầu tiên
  };

  const handleViewEvent = (eventId) => {
    console.log(`Xem sự kiện với ID: ${eventId}`);
    navigate(`/events/${eventId}`);
  };

  const handleEditEvent = (eventId) => {
    console.log(`Chỉnh sửa sự kiện với ID: ${eventId}`);
    navigate(`/events/edit/${eventId}`);
  };

  const handleAddEvent = () => {
    navigate("/events/create");
  };

  const handleApproveEvent = async (eventId) => {
    if (window.confirm(`Are you sure you want to approve event ${eventId}?`)) {
      try {
        await put(
          {},
          {},
          `http://localhost:8080/api/event/${eventId}/APPROVED`
        );
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.eventID === eventId
              ? { ...event, status: "AVAILABLE" }
              : event
          )
        );
        toast.success(t("successfullyApproved"));
      } catch (error) {
        console.error(`Error approving`, error);
        toast.error(t("failedToApprove"));
      }
    }
  };

  const handleRejectEvent = async (eventId) => {
    if (window.confirm(`Are you sure you want to reject event ${eventId}?`)) {
      try {
        await put(
          {},
          {},
          `http://localhost:8080/api/event/${eventId}/REJECTED`
        );
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.eventID === eventId ? { ...event, status: "REJECTED" } : event
          )
        );
        console.log(`Rejected event with ID: ${eventId}`);
        toast.success(t("successfullyRejected"));
      } catch (error) {
        console.error(`Error rejecting:`, error);
        toast.error(t("failedToReject"));
      }
    }
  };

  // Hàm định dạng ngày giờ để hiển thị
  const formatDateTime = (isoString) => {
    if (!isoString) return "N/A";
    try {
      return new Date(isoString).toLocaleString();
    } catch (e) {
      console.error("Invalid date string:", isoString, e);
      return "Invalid Date";
    }
  };

  return (
    <div className="event-management-content">
      <h1>{t("eventManagementTitle")}</h1>

      {/* Thay thế Card chứa Form bằng SearchFilter component */}
      <SearchFilter
        filterFor="events" // Loại đối tượng đang lọc
        searchTerm={searchTerm}
        selectedStatus={selectedStatus}
        selectedAgeGroup={selectedAgeGroup}
        onSearchChange={(value) => handleFilterChange("searchTerm", value)}
        onStatusChange={(value) => handleFilterChange("status", value)}
        onAgeGroupChange={(value) => handleFilterChange("ageGroup", value)}
        statusOptions={statusOptions} // Truyền options
        ageGroupOptions={ageGroupOptions} // Truyền options
        placeholder={t("searchEventPlaceholder")}
      />

      {/* Nút Clear Filters hiển thị có điều kiện */}
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
          onClick={handleAddEvent}
          className="ms-auto"
        >
          <PlusCircle size={16} className="me-1" /> Add
        </Button>
      </div>

      <Container className="mb-5 events-section">
        {" "}
        {/* Thêm class để cuộn */}
        {filteredEvents.length > 0 ? (
          <>
            <Card>
              <Card.Header>
                {t("eventList")}{" "}
                <Badge bg="secondary">{filteredEvents.length}</Badge>
              </Card.Header>
              <Card.Body style={{ padding: 0 }}>
                <div
                  style={{
                    maxHeight: "150vh",
                    position: "relative",
                  }}
                >
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
                      {currentEvents.map(
                        (
                          event,
                          index // Sử dụng currentEvents cho rendering
                        ) => (
                          <tr key={event.eventID}>
                            <td>{startIndex + index + 1}</td>{" "}
                            {/* Chỉ số đúng cho trang hiện tại */}
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
                                  onClick={() => handleViewEvent(event.eventID)}
                                >
                                  View
                                </Button>

                                {user?.role === "STAFF" && (
                                  <Button
                                    variant="outline-success"
                                    size="sm"
                                    className="fw-bold"
                                    onClick={() =>
                                      handleEditEvent(event.eventID)
                                    }
                                  >
                                    Edit
                                  </Button>
                                )}

                                {[
                                  "PENDING_APPROVAL",
                                  "CANCELLED",
                                  "REJECTED",
                                ].includes(event.status) &&
                                  user?.role === "MANAGER" && (
                                    <Button
                                      variant="outline-success"
                                      size="sm"
                                      className="fw-bold"
                                      onClick={() =>
                                        handleApproveEvent(event.eventID)
                                      }
                                    >
                                      Approve
                                    </Button>
                                  )}

                                {[
                                  "PENDING_APPROVAL",
                                  "APPROVED",
                                  "NOT_STARTED",
                                  "ONGOING",
                                ].includes(event.status) &&
                                  user?.role === "MANAGER" && (
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      className="fw-bold"
                                      onClick={() =>
                                        handleRejectEvent(event.eventID)
                                      }
                                    >
                                      Reject
                                    </Button>
                                  )}
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>

            {/* Component phân trang */}
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
    </div>
  );
}

export default EventManagement;
