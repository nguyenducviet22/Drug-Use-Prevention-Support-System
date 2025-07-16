import { useState, useMemo, useEffect } from "react"
import { Container, Row, Col, Button } from "react-bootstrap"
import CourseCard from "../../components/card/CourseCard"
import Pagination from "../../components/others/Pagination"
import "./CourseList.css"
import useFetch from "../../hooks/useFetch"
import SearchFilter from "../../components/others/SearchFilter"
import { useNavigate } from "react-router-dom"
import LoadingSpinner from "../../components/LoadingSpinner"
import ErrorMessage from "../../components/ErrorMessage"
import NotFound from "../not-found/NotFound"
import { useTranslation } from "react-i18next"; // Import useTranslation

const CourseList = () => {
  const { t } = useTranslation("courseList"); // Khai báo useTranslation

  const [courses, setCourses] = useState([])
  const [ageGroups, setAgeGroups] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("")
  const [selectedDuration, setSelectedDuration] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6 // Show 6 courses per page (2 rows of 3)
  const navigate = useNavigate()

  const { error: errorCourses, loading: loadingCourses, get: getcourses } = useFetch();
  const { error: errorAgeGroup, loading: loadingAgeGroups, get: getAgeGroups } = useFetch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesData = await getcourses("http://localhost:8080/api/course/status/AVAILABLE")
        setCourses(coursesData)
        const ageGroupsData = await getAgeGroups("http://localhost:8080/api/user/age-group")
        setAgeGroups(ageGroupsData)
      } catch (error) {
        console.error("Fetch error in CourseList:", error);
      }
    }
    fetchData()
  }, [getcourses, getAgeGroups]);
  console.log(courses);
  console.log(ageGroups);

  // Filter options
  const ageGroupOptions = ageGroups.map(ageGroup => ({
    value: ageGroup,
    label: ageGroup
  }))

  const durationOptions = [
    { value: 3, label: t("durationOptions.lessThan3Hours") },
    { value: 5, label: t("durationOptions.lessThan6Hours") },
    { value: 9, label: t("durationOptions.lessThan9Hours") },
    { value: 10, label: t("durationOptions.moreThan9Hours") },
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

  return (
    <Container className="py-5">
      <LoadingSpinner loading={loadingCourses || loadingAgeGroups} />
      <ErrorMessage error={errorCourses || errorAgeGroup} />

      {courses.length === 0 && !loadingCourses && !errorCourses ? ( // Added !loadingCourses and !errorCourses conditions
        <NotFound
          code={t("noCoursesFound.code")}
          title={t("noCoursesFound.title")}
          message={t("noCoursesFound.message")}
          backLink="/"
          backText={t("noCoursesFound.backText")}
        />
      ) : (
        <div className="course-list-page">
          {/* Header Section */}
          <Container className="my-5">
            <div className="text-center mb-5">
              <h1 className="display-4 fw-bold text-dark mb-3">{t("header.title")}</h1>
              <p className="lead text-muted">{t("header.subtitle")}</p>
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
              placeholder={t("searchFilter.placeholder")}
              filterFor="courses"
            />

            {(searchTerm !== "" || selectedAgeGroup !== "" || selectedDuration !== "") && (
              <div className="d-flex justify-content-center mt-3"> {/* Căn giữa nút */}
                <Button variant="outline-primary" onClick={clearAllFilters}>
                  {t("coursesSection.clearFilters")}
                </Button>
              </div>
            )}
          </Container>

          {/* Courses Section */}
          <Container className="mb-5 courses-section">
            <div className="text-center mb-5">
              <h2 className="fw-bold text-dark">{t("coursesSection.title")}</h2>
              <div className="courses-underline mx-auto"></div>
              {filteredCourses.length > 0 && (
                <p className="text-muted mt-3">
                  {t("coursesSection.showingCourses", { start: startIndex + 1, end: Math.min(endIndex, filteredCourses.length), total: filteredCourses.length })}
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
                <p className="text-muted">{t("coursesSection.noMatchingCourses")}</p>
              </div>
            )}
          </Container>
        </div>
      )}
    </Container>
  )
}

export default CourseList