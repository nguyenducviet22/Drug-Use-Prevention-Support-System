import { useState, useMemo, useEffect } from "react"
import { Container, Row, Col, Button } from "react-bootstrap"
import CourseCard from "../components/CourseCard"
import Pagination from "../components/Pagination"
import "./CourseList.css"
import useFetch from "../hooks/useFetch"
import SearchFilter from "../components/SearchFilter"

const CourseList = () => {

  const [courses, setCourses] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedObject, setSelectedObject] = useState("")
  const [selectedTopic, setSelectedTopic] = useState("")
  const [selectedDuration, setSelectedDuration] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6 // Show 6 courses per page (2 rows of 3)

  const { data, error, loading, get } = useFetch("http://localhost:8080/api/course");

  useEffect(() => {
    get();
  }, [get]);

  useEffect(() => {
    if (data) {
      setCourses(data);
    }
  }, [data]);

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

  const handleSearch = (filters) => {
    setCurrentPage(1) // Reset to first page when searching
    console.log("Searching with:", filters)
  }

  // Filter courses based on search criteria
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      return (
        course.courseName && course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedObject === "" || course.ageGroup === selectedObject) &&
        (selectedTopic === "" || course.ageGroup === selectedTopic) &&
        (selectedDuration === "" || course.duration.includes(selectedDuration))
      )
    })
  }, [courses, searchTerm, selectedObject, selectedTopic, selectedDuration])

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

  if (loading) {
    return (
      <Container className="my-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
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
                  <CourseCard course={course} />
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
