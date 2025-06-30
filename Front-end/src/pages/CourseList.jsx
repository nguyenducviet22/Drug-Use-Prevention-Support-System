import { useState, useMemo, useEffect } from "react"
import { Container, Row, Col, Button } from "react-bootstrap"
import CourseCard from "../components/CourseCard"
import Pagination from "../components/Pagination"
import "./CourseList.css"
import useFetch from "../hooks/useFetch"
import SearchFilter from "../components/SearchFilter"
import { useNavigate } from "react-router-dom"
import LoadingSpinner from "../components/LoadingSpinner"
import ErrorMessage from "../components/ErrorMessage"
import NotFound from "./NotFound"

const CourseList = () => {

  const [courses, setCourses] = useState([])
  const [ageGroups, setAgeGroups] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("")
  const [selectedDuration, setSelectedDuration] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6 // Show 6 courses per page (2 rows of 3)
  const navigate = useNavigate()

  const { error: errorCourses, loading: loadingCourses, get: getcourses } = useFetch("http://localhost:8080/api/course");
  const { error: errorAgeGroup, loading: loadingAgeGroups, get: getAgeGroups } = useFetch("http://localhost:8080/api/course/age-group");

  useEffect(() => {
    getcourses().then(setCourses).catch(() => { });
    getAgeGroups().then(setAgeGroups).catch(() => { });
  }, [getcourses, getAgeGroups]);

  // Filter options
  const ageGroupOptions = ageGroups.map(ageGroup => ({
    value: ageGroup,
    label: ageGroup
  }))

  const durationOptions = [
    { value: 3, label: "Less than 3 hours" },
    { value: 5, label: "Less than 6 hours" },
    { value: 9, label: "Less than 9 hours" },
    { value: 10, label: "9+ hours" },
  ]

  const handleSearch = (filters) => {
    setCurrentPage(1) // Reset to first page when searching
    console.log("Searching with:", filters)
  }

  // Filter courses based on search criteria
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesName = course.courseName && course.courseName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAgeGroup = selectedAgeGroup === "" || course.ageGroup === selectedAgeGroup;
      const duration = course.duration;
      let matchesDuration = true;
      if (selectedDuration !== "") {
        const selected = Number(selectedDuration);
        if (selected === 3) {
          matchesDuration = duration <= 3;
        } else if (selected === 5) {
          matchesDuration = duration <= 6;
        } else if (selected === 9) {
          matchesDuration = duration <= 9;
        } else if (selected === 10) {
          matchesDuration = duration > 9;
        } else {
          matchesDuration = true;
        }
      }
      return matchesName && matchesAgeGroup && matchesDuration;
    })
  }, [courses, searchTerm, selectedAgeGroup, selectedDuration])

  // Calculate pagination
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentCourses = filteredCourses.slice(startIndex, endIndex)

  const handlePageChange = (page) => {
    setCurrentPage(page)
    // Scroll to top of courses section
    document.querySelector(".courses-section")?.scrollIntoView({ behavior: "smooth" })
  }

  // Reset to first page when filters change
  const handleFilterChange = (filterType, value) => {
    setCurrentPage(1)
    switch (filterType) {
      case "ageGroup":
        setSelectedAgeGroup(value)
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
    setSelectedAgeGroup("")
    setSelectedDuration("")
    setCurrentPage(1)
  }

  const handleEnroll = (courseId) => {
    navigate(`/courses/lesson/${courseId}`)
  }

  const handleDetails = (courseId) => {
    navigate(`/courses/${courseId}`)
  }

  <Container className="py-5">
    <LoadingSpinner loading={loadingCourses || loadingAgeGroups} />
    <ErrorMessage error={errorCourses || errorAgeGroup} />
  </Container>

  if (courses.length === 0) {
    return (
      <NotFound
        code="📘"
        title="No Courses Found"
        message="We are realy sorry for this inconvinience."
        backLink="/"
        backText="Back Home"
      />
    )
  }

  return (
    <div className="course-list-page">
      {/* Header Section */}
      <Container className="my-5">
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-dark mb-3">Training Courses</h1>
          <p className="lead text-muted">Explore an inspiring learning journey with us</p>
        </div>

        {/* Search Filter Section */}
        <SearchFilter
          searchTerm={searchTerm}
          selectedAgeGroup={selectedAgeGroup}
          selectedDuration={selectedDuration}
          onSearchChange={setSearchTerm}
          onAgeGroupChange={(value) => handleFilterChange("ageGroup", value)}
          onDurationChange={(value) => handleFilterChange("duration", value)}
          onSearch={handleSearch}
          ageGroupOptions={ageGroupOptions}
          durationOptions={durationOptions}
          placeholder="Search courses..."
        />
      </Container>

      {/* Courses Section */}
      <Container className="mb-5 courses-section">
        <div className="text-center mb-5">
          <h2 className="fw-bold text-dark">Courses</h2>
          <div className="courses-underline mx-auto"></div>
          {filteredCourses.length > 0 && (
            <p className="text-muted mt-3">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredCourses.length)} of {filteredCourses.length} courses
            </p>
          )}
        </div>

        {currentCourses.length > 0 ? (
          <>
            <Row>
              {currentCourses.map((course) => (
                <Col md={6} lg={4} key={course.courseID} className="mb-4">
                  <CourseCard key={course.courseID}
                    course={course}
                    onEnrollClick={handleEnroll}
                    onDetailsClick={handleDetails} />
                </Col>
              ))}
            </Row>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
            />
          </>
        ) : (
          <div className="text-center py-5">
            <p className="text-muted">No courses found matching your criteria.</p>
            <Button variant="outline-primary" onClick={clearAllFilters} className="mt-3">
              Clear Filters
            </Button>
          </div>
        )}
      </Container>
    </div >
  )
}

export default CourseList
