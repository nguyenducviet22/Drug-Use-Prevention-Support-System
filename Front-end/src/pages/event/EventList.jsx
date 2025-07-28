import { useEffect, useMemo, useState } from "react";
import { Container, Button, Tabs, Tab } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import SearchFilter from "../../components/others/SearchFilter";
import EventCard from "../../components/card/EventCard";
import Pagination from "../../components/others/Pagination";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import NotFound from "../not-found/NotFound";
import { useNavigate } from "react-router-dom";
import "./EventList.css";
import { useAuth } from "../../hooks/useAuth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ITEMS_PER_PAGE = 3;

const EventList = () => {
  const { t, i18n } = useTranslation("eventList");
  const [events, setEvents] = useState([]);
  const [eventStatuses, setEventStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("__default__");
  const [selectedDuration, setSelectedDuration] = useState("__default__");
  const [activeTab, setActiveTab] = useState("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const ageGroupOptions = [
    { label: t("all"), value: "ALL" },
    { label: t("adolescent"), value: "ADOLESCENT" },
    { label: t("adult"), value: "ADULT" },
    { label: t("senior"), value: "SENIOR" },
    { label: t("everyone"), value: "EVERYONE" },
  ];

  const durationOptions = [
    { label: t("allDurations"), value: "" },
    { label: t("under30"), value: "SHORT" },
    { label: t("between30and60"), value: "MEDIUM" },
    { label: t("over60"), value: "LONG" },
  ];

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const url =
        activeTab === "ONGOING"
          ? "http://localhost:8080/api/event/upcoming"
          : "http://localhost:8080/api/event/visible";

      const response = await fetch(url);
      const result = await response.json();
      setEvents(result.data);
    } catch (error) {
      setError("Failed to fetch events.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatuses = async (events) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const statusMap = {};
    await Promise.all(
      events.map(async (event) => {
        try {
          const res = await fetch(
            `http://localhost:8080/api/event/${event.eventID}/status`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const result = await res.json();
          statusMap[event.eventID] = result;
        } catch {
          console.warn("Failed to fetch status for event:", event.eventID);
        }
      })
    );
    setEventStatuses(statusMap);
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line
  }, [activeTab, i18n.language]);

  useEffect(() => {
    if (events.length > 0) {
      fetchStatuses(events);
    }
    // eslint-disable-next-line
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events
      .filter((event) =>
        event.eventName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((event) =>
        selectedAgeGroup === "__default__" || selectedAgeGroup === "ALL"
          ? true
          : event.ageGroup === selectedAgeGroup
      )
      .filter((event) => {
        switch (selectedDuration) {
          case "SHORT":
            return event.duration < 30;
          case "MEDIUM":
            return event.duration >= 30 && event.duration <= 60;
          case "LONG":
            return event.duration > 60;
          default:
            return true;
        }
      });
  }, [events, searchTerm, selectedAgeGroup, selectedDuration, activeTab]);

  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentEvents = filteredEvents.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    document
      .querySelector(".event-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedAgeGroup("__default__");
    setSelectedDuration("__default__");
    setCurrentPage(1);
  };

  const handleJoinEvent = async (eventID) => {
    if (!user) {
      toast.warning(<strong>⚠️ {t("pleaseLogin")}</strong>);
      return;
    }

    const targetEvent = events.find((e) => e.eventID === eventID);
    if (!targetEvent) {
      toast.error(<strong>❌ {t("eventNotFound")}</strong>);
      return;
    }

    // Kiểm tra nếu sự kiện có AgeGroup là "EVERYONE"
    if (
      targetEvent.ageGroup !== "EVERYONE" &&
      user.ageGroup !== targetEvent.ageGroup
    ) {
      toast.error(<strong>❌ {t("unsuitableAge")}</strong>);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080/api/event/${eventID}/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.json();

      if (!response.ok) throw new Error(result.message || t("registerFailed"));
      toast.success(<strong>🎉 {t("registerSuccess")}</strong>);
      fetchStatuses(events); // update button
    } catch (error) {
      toast.error(<strong>❌ {error.message || t("registerFailed")}</strong>);
    }
  };

  const handleCancelEvent = async (eventID) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080/api/event/${eventID}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error(t("cancelFailed", "Cancel failed!"));
      toast.success(
        <strong>✅ {t("cancelSuccess", "Cancelled successfully!")}</strong>
      );
      fetchStatuses(events); // update button/status
    } catch (error) {
      toast.error(
        <strong>
          ❌ {error.message || t("cancelFailed", "Cancel failed!")}
        </strong>
      );
    }
  };

  const handleViewDetails = (eventID) => {
    navigate(`/events/${eventID}`);
  };

  if (loading) {
    return (
      <Container className="py-5">
        <LoadingSpinner loading />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <ErrorMessage error={error} />
      </Container>
    );
  }

  if (events.length === 0) {
    return (
      <NotFound
        code="📅"
        title={t("noEventsFound")}
        message={t("noEventsMessage")}
        backLink="/"
        backText={t("backHome")}
      />
    );
  }

  return (
    <div className="event-list-page">
      <Container className="my-4">
        <div className="page-header text-center mb-5">
          <h1 className="display-5 fw-bold text-dark mb-3">
            {t("upcomingEvents")}
          </h1>
          <p className="lead text-muted">{t("intro")}</p>
        </div>

        <SearchFilter
          searchTerm={searchTerm}
          selectedAgeGroup={selectedAgeGroup}
          selectedDuration={selectedDuration}
          onSearchChange={setSearchTerm}
          onAgeGroupChange={setSelectedAgeGroup}
          onDurationChange={setSelectedDuration}
          placeholder={t("searchPlaceholder")}
          ageGroupOptions={ageGroupOptions}
          durationOptions={durationOptions}
          filterFor="events"
        />

        {(searchTerm !== "" || selectedAgeGroup !== "") && (
          <div className="d-flex justify-content-center mt-3">
            <Button variant="outline-primary" onClick={clearAllFilters}>
              {t("clearFilters")}
            </Button>
          </div>
        )}
      </Container>

      <Container className="mb-5">
        <div className="event-section">
          <div className="text-center mb-4">
            <div className="text-center mb-4 custom-tabs">
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => {
                  setActiveTab(k);
                  setCurrentPage(1);
                }}
                className="d-inline-flex"
              >
                <Tab eventKey="ALL" title={t("tabAll")} />
                <Tab eventKey="ONGOING" title={t("tabOngoing")} />
              </Tabs>
            </div>

            {filteredEvents.length > 0 && (
              <p className="text-muted mt-3">
                {t("showing")} {startIndex + 1} {t("to")}{" "}
                {Math.min(startIndex + ITEMS_PER_PAGE, filteredEvents.length)}{" "}
                {t("of")} {filteredEvents.length} {t("events")}
              </p>
            )}
          </div>

          {currentEvents.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">{t("noEventsCriteria")}</p>
            </div>
          ) : (
            <>
              {currentEvents.map((event) => (
                <EventCard
                  key={event.eventID}
                  event={event}
                  statusInfo={eventStatuses[event.eventID]}
                  onJoinEvent={handleJoinEvent}
                  onViewDetails={handleViewDetails}
                  onCancelEvent={handleCancelEvent}
                />
              ))}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={ITEMS_PER_PAGE}
              />
            </>
          )}
        </div>
        <ToastContainer position="top-right" autoClose={3000} />
      </Container>
    </div>
  );
};

export default EventList;
