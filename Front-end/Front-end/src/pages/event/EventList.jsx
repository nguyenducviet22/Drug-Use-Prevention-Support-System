import { useEffect, useMemo, useState } from "react"
import { Container, Button } from "react-bootstrap"
import { Calendar, Clock, MapPin } from "lucide-react"
import "./EventList.css"
import useFetch from "../../hooks/useFetch"
import SearchFilter from "../../components/others/SearchFilter"
import EventCard from "../../components/card/EventCard"
import Pagination from "../../components/others/Pagination"
import { useNavigate } from "react-router-dom"
import LoadingSpinner from "../../components/LoadingSpinner"
import ErrorMessage from "../../components/ErrorMessage"
import NotFound from "../not-found/NotFound"

const EventList = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // const [events, setEvents] = useState([])
  // const { loading, error, get } = useFetch("http://localhost:8080/api/event");

  // useEffect(() => {
  //   get().then(setEvents).catch(() => { });
  // }, [get]);

  const [events] = useState([
    {
      eventId: 1,
      eventName: "Say No To Drugs – Start With Yourself",
      startDate: "04/06/2025",
      time: "8:00 - 11:30",
      location: "FPT University HCM",
      description:
        "A practical sharing session from a psychologist and former addict, helping participants understand the early signs, how to prevent and handle drug-related situations in the school environment.",
      image: "https://img.freepik.com/free-vector/hand-drawn-international-day-against-drug-abuse-illicit-trafficking-illustration_23-2149412954.jpg?ga=GA1.1.1117822287.1749529273&semt=ais_hybrid&w=740",
      imagePosition: "left",
    },
    {
      eventId: 2,
      eventName: "Behind The Smoke – The Truth About The New Addictive Drug",
      startDate: "04/06/2025",
      time: "8:00 - 11:30",
      location: "FPT University HCM",
      description:
        "Interactive talk show with doctors, legal experts and experienced young people. Together we debunk common misconceptions about synthetic drugs and 'ecstasy' that are spreading rapidly among young people.",
      image: "https://img.freepik.com/free-vector/flat-international-day-against-drug-abuse-illicit-trafficking-illustration_23-2149420843.jpg?ga=GA1.1.1117822287.1749529273&semt=ais_hybrid&w=740",
      imagePosition: "right",
    },
    {
      eventId: 3,
      eventName: '"Live Positively – No Drugs" Campaign',
      startDate: "21/05/2025",
      time: "9:00 - 15:00",
      location: "FPT University HCM",
      description:
        "Including activities: propaganda minigame, '30 days no stimulants' challenge, photo exhibition, livestream with experts.",
      image: "https://img.freepik.com/free-vector/hand-drawn-international-day-against-drug-abuse-illicit-trafficking-illustration_23-2149425247.jpg?ga=GA1.1.1117822287.1749529273&semt=ais_hybrid&w=740",
      imagePosition: "left",
    },
    {
      eventId: 4,
      eventName: "Behind The Smoke – The Truth About The New Addictive Drug",
      startDate: "04/06/2025",
      time: "8:00 - 11:30",
      location: "FPT University HCM",
      description:
        "Interactive talk show with doctors, legal experts and experienced young people. Together we debunk common misconceptions about synthetic drugs and 'ecstasy' that are spreading rapidly among young people.",
      image: "/placeholder.svg?height=300&width=400",
      imagePosition: "right",
    },
    {
      eventId: 5,
      eventName: '"Live Positively – No Drugs" Campaign',
      startDate: "21/05/2025",
      time: "9:00 - 15:00",
      location: "FPT University HCM",
      description:
        "Including activities: propaganda minigame, '30 days no stimulants' challenge, photo exhibition, livestream with experts.",
      image: "/placeholder.svg?height=300&width=400",
      imagePosition: "left",
    },
  ])
  console.log(events);

  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(3) // Show 3 blog posts per page

  const handleJoinEvent = (eventId) => {
    console.log(`Joining event ${eventId}`)
    // Handle event registration logic
  }

  const handleViewDetails = (eventId) => {
    navigate(`/events/${eventId}`)
  }

  const handleSearch = (filters) => {
    setCurrentPage(1) // Reset to first page when searching
    console.log("Searching with:", filters)
  }

  // Filter events based on search criteria
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      return (
        event.eventName && event.eventName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })
  }, [events, searchTerm])

  // Calculate pagination
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentEvents = filteredEvents.slice(startIndex, endIndex)

  const handlePageChange = (page) => {
    setCurrentPage(page)
    // Scroll to top of events section
    document.querySelector(".events-section")?.scrollIntoView({ behavior: "smooth" })
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    setCurrentPage(1)
  }

  <Container className="py-5">
    <LoadingSpinner loading={loading} />
    <ErrorMessage error={error} />
  </Container>

  if (events.length === 0) {
    return (
      <NotFound
        code="📅"
        title="No Events Found"
        message="We are realy sorry for this inconvinience."
        backLink="/"
        backText="Back Home"
      />
    )
  }

  return (
    <div className="event-list-page">
      {/* Header Section */}
      <Container className="my-4">
        <div className="page-header text-center mb-5">
          <h1 className="display-5 fw-bold text-dark mb-3">Upcoming Events</h1>
          <p className="lead text-muted">Join our community events and workshops for drug prevention awareness</p>
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
                Showing {startIndex + 1}-{Math.min(endIndex, filteredEvents.length)} of {filteredEvents.length} events
              </p>
            )}
          </div>

          {currentEvents.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No events found matching your criteria.</p>
              <Button variant="outline-primary" onClick={clearAllFilters} className="mt-3">
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              {currentEvents.map((event) => (
                <EventCard key={event.eventId} event={event} onJoinEvent={handleJoinEvent} onViewDetails={handleViewDetails} />
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
  )
}

export default EventList
