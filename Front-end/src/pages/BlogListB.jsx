import { useState, useEffect, useMemo } from "react"
import { Container, Row, Col, Button } from "react-bootstrap"
import BlogCard from "../components/BlogCard"
import "./BlogList.css"
import Pagination from "../components/Pagination"
import useFetch from "../hooks/useFetch"
import SearchFilter from "../components/SearchFilter"

const BlogListB = () => {

  const [blogs, setBlogs] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedObject, setSelectedObject] = useState("")
  const [selectedTopic, setSelectedTopic] = useState("")
  const [selectedDuration, setSelectedDuration] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(3) // Show 3 blog posts per page

  const { data, error, loading, get } = useFetch("http://localhost:8080/api/blog");

  useEffect(() => {
    get();
  }, [get]);

  useEffect(() => {
    if (data) {
      setBlogs(data);
    }
  }, [data]);
  console.log("BLogs: ", blogs);

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

  const categories = ["Recovery", "Family", "Education", "Expert"]
  const popularTags = ["#antidrug", "#daily", "#knowledge", "#success", "#friends"]
  const topics = ["all", "recovery", "family", "education", "expert", "prevention", "support"]

  const handleSearch = (filters) => {
    setCurrentPage(1) // Reset to first page when searching
    console.log("Searching with:", filters)
  }

  // Filter blogs based on search criteria
  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      return (
        blog.blogName && blog.blogName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedObject === "" || blog.ageGroup === selectedObject) &&
        (selectedTopic === "" || blog.ageGroup === selectedTopic) &&
        (selectedDuration === "" || blog.duration.includes(selectedDuration))
      )
    })
  }, [blogs, searchTerm, selectedObject, selectedTopic, selectedDuration])

  // Calculate pagination
  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentBlogs = filteredBlogs.slice(startIndex, endIndex)

  const handlePageChange = (page) => {
    setCurrentPage(page)
    // Scroll to top of blogs section
    document.querySelector(".blogs-section")?.scrollIntoView({ behavior: "smooth" })
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

  const handleReadMore = (blogId) => {
    // Navigate to individual blog post
    console.log(`Navigate to blog ${blogId}`)
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
    <div className="blog-list-page">
      <Container className="my-5">
        {/* Header Section */}
        <div className="blog-header text-center mb-5">
          <h1 className="display-5 fw-bold text-primary mb-3">
            Stories & Experiences
            <br />
            On Drug Prevention
          </h1>
          <p className="lead text-muted mb-4">
            Explore real-life experiences, advice, and perspective
            <br />
            from the community in the journey of drug prevention.
          </p>
        </div>

        <Row>
          {/* Main Content */}
          <Col lg={8}>
            {/* Search and Filter Controls */}
            <Row className="mb-4">
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
                placeholder="Search blogs..."
              />
            </Row>

            {/* Blog Posts */}
            <div className="blog-posts">
              {currentBlogs.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">No blogs found matching your criteria.</p>
                  <Button variant="outline-primary" onClick={clearAllFilters} className="mt-3">
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <>
                  {currentBlogs.map((blog) => (
                    <BlogCard key={blog.blogID} blog={blog} onReadClick={handleReadMore} />
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
          </Col>

          {/* Sidebar */}
          <Col lg={4}>
            <div className="blog-sidebar">
              {/* Categories */}
              <div className="sidebar-section mb-4">
                <h5 className="sidebar-title">Category</h5>
                <div className="sidebar-content">
                  <div className="category-buttons">
                    {categories.map((category) => (
                      <button key={category} className="category-button" onClick={() => handleCategoryFilter(category)}>
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Current Blogs */}
              <div className="sidebar-section mb-4">
                <h5 className="sidebar-title">Current Blogs</h5>
                <div className="sidebar-content">
                  {blogs.slice(0, 3).map((blog) => (
                    <div key={blog.blogID} className="sidebar-blog-item">
                      <h6 className="mb-1">
                        <a
                          href="#"
                          className="text-decoration-none"
                          onClick={(e) => {
                            e.preventDefault()
                            handleReadMore(blog.blogID)
                          }}
                        >
                          {blog.blogName}
                        </a>
                      </h6>
                      <small className="text-muted d-block mb-2">{blog.createdAt}</small>
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular Tags */}
              <div className="sidebar-section">
                <h5 className="sidebar-title">Popular Tags</h5>
                <div className="sidebar-content">
                  <div className="popular-tags">
                    {popularTags.map((tag) => (
                      <button key={tag} className="tag-button" onClick={() => handleTagFilter(tag)}>
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default BlogListB
