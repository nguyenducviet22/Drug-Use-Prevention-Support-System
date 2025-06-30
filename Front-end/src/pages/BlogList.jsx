import { useState, useEffect, useMemo } from "react"
import { Container, Row, Col, Button, Tab, Nav } from "react-bootstrap"
import BlogCard from "../components/BlogCard"
import "./BlogList.css"
import Pagination from "../components/Pagination"
import useFetch from "../hooks/useFetch"
import SearchFilter from "../components/SearchFilter"
import { useNavigate } from "react-router-dom"
import LoadingSpinner from "../components/LoadingSpinner"
import ErrorMessage from "../components/ErrorMessage"
import NotFound from "./NotFound"
import { useAuth } from "../hooks/useAuth"

const BlogList = () => {

  const { user } = useAuth()
  const [key, setKey] = useState('all')
  const [blogs, setBlogs] = useState([])
  const [types, setTypes] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(3) // Show 3 blog posts per page
  const navigate = useNavigate()

  const { error: errorBlogs, loading: loadingBlogs, get: getBlogs } = useFetch();
  const { loading: loadingMyBlogs, error: errorMyBlogs, get: getMyBlogs } = useFetch();
  const { error: errorBlogTypes, loading: loadingBlogTypes, get: getBlogTypes } = useFetch();
  const popularTags = ["#antidrug", "#daily", "#knowledge", "#success", "#friends"]

  useEffect(() => {
    const fetchData = async () => {
      try {
        const blogsData = await getBlogs("http://localhost:8080/api/blog");
        setBlogs(blogsData);

        // Fetch my blogs if user is logged in
        if (user && key === 'myBlogs') {
          const myBlogsData = await getMyBlogs(`http://localhost:8080/api/blog/my-list/${user.username}`);
          setBlogs(myBlogsData);
        }

        const typesData = await getBlogTypes("http://localhost:8080/api/blog/type");
        setTypes(typesData);
      } catch (err) {
        console.error("Fetch error in BlogList:", err);
        // Có thể set lỗi vào state để hiển thị ErrorMessage
      }
    };

    fetchData();
  }, [user, key, getBlogs, getBlogTypes, getMyBlogs]);

  // Filter options
  const typeOptions = types.map(type => ({
    value: type,
    label: type
  }));
  console.log(typeOptions);
  console.log(blogs);

  const handleSearch = (filters) => {
    setCurrentPage(1) // Reset to first page when searching
    console.log("Searching with:", filters)
  }

  // Filter blogs based on search criteria
  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      return (
        blog.blogName && blog.blogName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedType === "" || blog.blogType === selectedType)
      )
    })
  }, [blogs, searchTerm, selectedType])

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
      case "type":
        setSelectedType(value)
        break
      default:
        break
    }
  }

  const handleReadMore = (blogId) => {
    navigate(`/blogs/${blogId}`)
  }

  const handleCreateBlogs = () => {
    navigate('/blogs/create');
  };

  const clearAllFilters = () => {
    setSearchTerm("")
    setSelectedType("")
    setCurrentPage(1)
  }

  <Container className="py-5">
    <LoadingSpinner loading={loadingBlogs || loadingBlogTypes} />
    <ErrorMessage error={errorBlogs || errorBlogTypes} />
  </Container>

  if (blogs.length === 0) {
    return (
      <NotFound
        code="📚"
        title="No Blogs Found"
        message="We are realy sorry for this inconvinience."
        backLink="/"
        backText="Back Home"
      />
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
            {/* Search Filter Section */}
            <SearchFilter
              searchTerm={searchTerm}
              selectedType={selectedType}
              onSearchChange={setSearchTerm}
              onTypeChange={(value) => handleFilterChange("type", value)}
              onSearch={handleSearch}
              typeOptions={typeOptions}
              placeholder="Search blogs..."
            />

            {/* Blog Posts */}
            <div className="blog-posts">
              <div className="text-center mb-5">
                <h2 className="fw-bold text-dark">Blogs</h2>
                <div className="blogs-underline mx-auto"></div>
                <Tab.Container id="blog-tabs" activeKey={key} onSelect={(k) => setKey(k)}>
                  <Nav variant="pills" className="mb-3">
                    {user && (
                      <Row className="w-100 d-flex justify-content-around align-items-center m-0"> {/* w-100 để chiếm hết chiều rộng, m-0 để bỏ margin mặc định của Row */}
                        <Col xs={12} md={3} className="mb-2 mb-md-0">
                          <Nav.Item className="w-100"> {/* w-100 để Nav.Item chiếm hết Col */}
                            <Nav.Link eventKey="all" className="w-100 rounded-pill shadow-sm custom-button">
                              All Blogs
                            </Nav.Link>
                          </Nav.Item>
                        </Col>
                        <Col xs={12} md={3} className="mb-2 mb-md-0">
                          <Nav.Item className="w-100">
                            <Nav.Link eventKey="myBlogs" className="w-100 rounded-pill shadow-sm custom-button">
                              My Blogs
                            </Nav.Link>
                          </Nav.Item>
                        </Col>
                        <Col xs={12} md={2} className="mb-2 mb-md-0">
                          <Button variant="info" className="w-100 rounded-pill shadow-sm custom-button" onClick={handleCreateBlogs}>
                            Create
                          </Button>
                        </Col>
                      </Row>
                    )}
                  </Nav>
                  <Tab.Content>
                    <Tab.Pane eventKey="all">
                      {loadingBlogs && <p>Loading Blogs...</p>}
                    </Tab.Pane>
                    <Tab.Pane eventKey="myBlogs">
                      {loadingMyBlogs && <p>Loading My Blogs...</p>}
                    </Tab.Pane>
                  </Tab.Content>
                </Tab.Container>
                {filteredBlogs.length > 0 && (
                  <p className="text-muted mt-3">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredBlogs.length)} of {filteredBlogs.length} events
                  </p>
                )}
              </div>

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
                <h5 className="sidebar-title">Common Types</h5>
                <div className="sidebar-content">
                  <div className="type-buttons">
                    {types.map((type) => (
                      <button key={type} className="type-button" onClick={() => handleCategoryFilter(type)}>
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Current Blogs */}
              <div className="sidebar-section mb-4">
                <h5 className="sidebar-title">Popular Blogs</h5>
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
                <h5 className="sidebar-title">Favorite Tags</h5>
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

export default BlogList
