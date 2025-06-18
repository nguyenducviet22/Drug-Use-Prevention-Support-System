import { useEffect, useMemo, useState } from "react";
import { Container, Button } from "react-bootstrap";
import { Calendar, Clock, MapPin } from "lucide-react";
import "./EventList.css";
import useFetch from "../hooks/useFetch";
import SearchFilter from "../components/SearchFilter";
import EventCard from "../components/EventCard";
import Pagination from "../components/Pagination";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import NotFound from "./NotFound";

const EventList = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // const [events, setEvents] = useState([])
  // const { loading, error, get } = useFetch("http://localhost:8080/api/event");

  // useEffect(() => {
  //   get().then(setEvents).catch(() => { });
  // }, [get]);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:8080/api/event");
        const result = await response.json();
        console.log(result.data);
        setEvents(result.data);
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setError("Failed to fetch events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3); // Show 3 blog posts per page

  const handleJoinEvent = (eventId) => {
    console.log(`Joining event ${eventId}`);
    // Handle event registration logic
  };

  const handleViewDetails = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  const handleSearch = (filters) => {
    setCurrentPage(1); // Reset to first page when searching
    console.log("Searching with:", filters);
  };

  // Filter events based on search criteria
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      return (
        event.eventName &&
        event.eventName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [events, searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEvents = filteredEvents.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of events section
    document
      .querySelector(".events-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  <Container className="py-5">
    <LoadingSpinner loading={loading} />
    <ErrorMessage error={error} />
  </Container>;

  if (events.length === 0) {
    return (
      <NotFound
        code="📅"
        title="No Events Found"
        message="We are realy sorry for this inconvinience."
        backLink="/"
        backText="Back Home"
      />
    );
  }

  return (
    <div className="event-list-page">
      {/* Header Section */}
      <Container className="my-4">
        <div className="page-header text-center mb-5">
          <h1 className="display-5 fw-bold text-dark mb-3">Upcoming Events</h1>
          <p className="lead text-muted">
            Join our community events and workshops for drug prevention
            awareness
          </p>
        </div>

        {/* Search Filter Section */}
        <SearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={handleSearch}
          placeholder="Search events..."
        />
      </Container>

      {/* Events List */}
      <Container className="mb-5">
        <div className="event-section">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-dark">Events</h2>
            <div className="events-underline mx-auto"></div>
            {filteredEvents.length > 0 && (
              <p className="text-muted mt-3">
                Showing {""}
                {Math.min(endIndex, filteredEvents.length)} of{" "}
                {filteredEvents.length} events
              </p>
            )}
          </div>

          {currentEvents.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">
                No events found matching your criteria.
              </p>
              <Button
                variant="outline-primary"
                onClick={clearAllFilters}
                className="mt-3"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              {currentEvents.map((event) => (
                <EventCard
                  key={event.eventID}
                  event={event}
                  onJoinEvent={handleJoinEvent}
                  onViewDetails={handleViewDetails}
                />
              ))}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
              />
            </>
          )}
        </div>
      </Container>
    </div>
  );
};

export default EventList;
