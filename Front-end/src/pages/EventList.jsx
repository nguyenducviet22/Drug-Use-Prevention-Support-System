import { useEffect, useMemo, useState } from "react"
import { Container, Button } from "react-bootstrap"
import { Calendar, Clock, MapPin } from "lucide-react"
import "./EventList.css"
import useFetch from "../hooks/useFetch"
import SearchFilter from "../components/SearchFilter"
import EventCard from "../components/EventCard"
import Pagination from "../components/Pagination"

const EventList = () => {

  // const [events, setEvents] = useState([])
  // const { data, isLoading, error, get } = useFetch("http://localhost:8080/api/event");

  // useEffect(() => {
  //   get();
  // }, [get]);

  // useEffect(() => {
  //   if (data) {
  //     setEvents(data);
  //   }
  // });

  const [events] = useState([
    {
      eventId: 1,
      eventName: "Say No To Drugs – Start With Yourself",
      startDate: "04/06/2025",
      time: "8:00 - 11:30",
      location: "FPT University HCM",
      description:
        "A practical sharing session from a psychologist and former addict, helping participants understand the early signs, how to prevent and handle drug-related situations in the school environment.",
      image: "data:image/jpeg;base64,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",
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
      image: "data:image/jpeg;base64,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",
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
      image: "data:image/jpeg;base64,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",
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
  const [selectedObject, setSelectedObject] = useState("")
  const [selectedTopic, setSelectedTopic] = useState("")
  const [selectedDuration, setSelectedDuration] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(3) // Show 3 blog posts per page

  // Filter options
  const objectOptions = [
    { value: "Student", label: "Student" },
    { value: "Everyone", label: "Everyone" },
    { value: "Post-Addiction", label: "Post-Addiction" },
    { value: "Community", label: "Community" },
    { value: "Wellness", label: "Wellness" },
    { value: "Family", label: "Family" },
  ]

  const topicOptions = [
    { value: "Student", label: "Student" },
    { value: "Everyone", label: "Everyone" },
    { value: "Post-Addiction", label: "Post-Addiction" },
    { value: "Community", label: "Community" },
    { value: "Wellness", label: "Wellness" },
    { value: "Family", label: "Family" },
  ]

  const durationOptions = [
    { value: "2", label: "2-3 hours" },
    { value: "4", label: "4-6 hours" },
    { value: "8", label: "8-12 hours" },
    { value: "14", label: "14+ hours" },
  ]

  const handleJoinEvent = (eventId) => {
    console.log(`Joining event ${eventId}`)
    // Handle event registration logic
  }

  const handleViewDetails = (eventId) => {
    console.log(`Viewing details for event ${eventId}`)
    // Handle navigation to event details
  }

  const handleSearch = (filters) => {
    setCurrentPage(1) // Reset to first page when searching
    console.log("Searching with:", filters)
  }

  // Filter events based on search criteria
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      return (
        event.eventName && event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedObject === "" || event.ageGroup === selectedObject) &&
        (selectedTopic === "" || event.ageGroup === selectedTopic) &&
        (selectedDuration === "" || event.duration.includes(selectedDuration))
      )
    })
  }, [events, searchTerm, selectedObject, selectedTopic, selectedDuration])

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

  // Reset to first page when filters change
  const handleFilterChange = (filterType, value) => {
    setCurrentPage(1)
    switch (filterType) {
      case "object":
        setSelectedObject(value)
        break
      case "topic":
        setSelectedTopic(value)
        break
      case "duration":
        setSelectedDuration(value)
        break
      default:
        break
    }
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    setSelectedObject("")
    setSelectedTopic("")
    setSelectedDuration("")
    setCurrentPage(1)
  }

  // if (loading) {
  //   return (
  //     <Container className="my-5">
  //       <div className="text-center">
  //         <div className="spinner-border text-primary" role="status">
  //           <span className="visually-hidden">Loading...</span>
  //         </div>
  //       </div>
  //     </Container>
  //   )
  // }

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
          selectedObject={selectedObject}
          selectedTopic={selectedTopic}
          selectedDuration={selectedDuration}
          onSearchChange={setSearchTerm}
          onObjectChange={(value) => handleFilterChange("object", value)}
          onTopicChange={(value) => handleFilterChange("topic", value)}
          onDurationChange={(value) => handleFilterChange("duration", value)}
          onSearch={handleSearch}
          objectOptions={objectOptions}
          topicOptions={topicOptions}
          durationOptions={durationOptions}
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
