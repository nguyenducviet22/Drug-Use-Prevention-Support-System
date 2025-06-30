import { useEffect, useMemo, useState } from "react";
import { Container, Button, Tabs, Tab } from "react-bootstrap";
import SearchFilter from "../components/SearchFilter";
import EventCard from "../components/EventCard";
import Pagination from "../components/Pagination";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { useAuth } from "../hooks/useAuth";
import Recommendation from "../components/Recommendation";
import NotFound from "./NotFound";
import { useNavigate } from "react-router-dom";
import "./EventList.css";

const ITEMS_PER_PAGE = 3;

const MyEventList = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [eventStatuses, setEventStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("__default__");
  const [selectedDuration, setSelectedDuration] = useState("__default__");
  const [activeTab, setActiveTab] = useState("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const ageGroupOptions = [
    { label: "All", value: "ALL" },
    { label: "Adolescent", value: "ADOLESCENT" },
    { label: "Adult", value: "ADULT" },
    { label: "Senior", value: "SENIOR" },
    { label: "Everyone", value: "EVERYONE" },
  ];

  const durationOptions = [
    { label: "All Durations", value: "" },
    { label: "Under 30 mins", value: "SHORT" },
    { label: "30 - 60 mins", value: "MEDIUM" },
    { label: "Over 60 mins", value: "LONG" },
  ];

  const fetchEvents = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8080/api/event/my-events/${user.username}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await res.json();
      setEvents(Array.isArray(result) ? result : result.data || []);
      setError(null);
    } catch (err) {
      setError("Failed to fetch your registered events.");
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
    if (user) fetchEvents();
  }, [user, activeTab]);

  useEffect(() => {
    if (events.length > 0) {
      fetchStatuses(events);
    }
  }, [events]);

  const filteredEvents = useMemo(() => {
    const now = new Date();

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
      if (!response.ok)
        throw new Error(result.message || "Registration failed.");
      alert(result.data || "Successfully registered!");
      fetchStatuses(events);
    } catch (err) {
      alert(err.message || "Registration failed!");
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
        title="No Events Found"
        message="We're really sorry for this inconvenience."
        backLink="/"
        backText="Back Home"
      />
    );
  }

  return (
    <div className="event-list-page">
      <Container className="my-4">
        <div className="page-header text-center mb-5">
          <h1 className="display-5 fw-bold text-dark mb-3">Upcoming Events</h1>
          <p className="lead text-muted">
            Join our community events and workshops for drug prevention
            awareness
          </p>
        </div>

        <SearchFilter
          searchTerm={searchTerm}
          selectedAgeGroup={selectedAgeGroup}
          selectedDuration={selectedDuration}
          onSearchChange={setSearchTerm}
          onAgeGroupChange={setSelectedAgeGroup}
          onDurationChange={setSelectedDuration}
          placeholder="Search events..."
          ageGroupOptions={ageGroupOptions}
          durationOptions={durationOptions}
        />
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
                <Tab eventKey="ALL" title="ALL" />
                <Tab eventKey="ONGOING" title="ONGOING" />
              </Tabs>
            </div>

            {filteredEvents.length > 0 && (
              <p className="text-muted mt-3">
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + ITEMS_PER_PAGE, filteredEvents.length)}{" "}
                of {filteredEvents.length} events
              </p>
            )}
          </div>

          {currentEvents.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">
                No events found matching your criteria.
              </p>
              <Button variant="outline-primary" onClick={clearAllFilters}>
                Clear Filters
              </Button>
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
              <Recommendation type="event" />
      </Container>
    </div>
    
  );
};

export default MyEventList;
