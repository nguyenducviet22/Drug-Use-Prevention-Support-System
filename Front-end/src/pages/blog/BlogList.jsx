import { useState, useEffect, useMemo } from "react"
import { Container, Row, Col, Button, Tab, Nav, Alert } from "react-bootstrap" // Import Alert
import BlogCard from "../../components/card/BlogCard"
import "./BlogList.css"
import Pagination from "../../components/others/Pagination"
import useFetch from "../../hooks/useFetch"
import SearchFilter from "../../components/others/SearchFilter"
import { useNavigate } from "react-router-dom"
import LoadingSpinner from "../../components/LoadingSpinner"
import ErrorMessage from "../../components/ErrorMessage"
import { useAuth } from "../../hooks/useAuth"
import { CirclePlus } from "lucide-react"
import { useTranslation } from "react-i18next"

const BlogList = () => {
  const { t } = useTranslation("blogList")

  const { user } = useAuth()
  const [mainTabKey, setMainTabKey] = useState('all');
  const [myBlogsSubTabKey, setMyBlogsSubTabKey] = useState('published');
  const [blogs, setBlogs] = useState([])
  const [types, setTypes] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(3)
  const navigate = useNavigate()

  const { error: errorBlogs, loading: loadingBlogs, get: getBlogs } = useFetch();
  const { loading: loadingMyBlogs, error: errorMyBlogs, get: getMyBlogs } = useFetch();
  const { loading: loadingMyDrafts, error: errorMyDrafts, get: getMyDrafts } = useFetch();
  const { loading: loadingMyPending, error: errorMyPending, get: getMyPending } = useFetch();
  const { error: errorBlogTypes, loading: loadingBlogTypes, get: getBlogTypes } = useFetch();
  const popularTags = ["#antidrug", "#daily", "#knowledge", "#success", "#friends"]

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch blog types always
        const typesData = await getBlogTypes("http://localhost:8080/api/blog/type");
        setTypes(typesData);

        if (mainTabKey === 'all') {
          let blogsData;
          // Check if user is logged in and has an ageGroup
          if (user && user.ageGroup) {
            blogsData = await getBlogs(`http://localhost:8080/api/blog/age-group/${user.ageGroup}`);
          } else {
            // If user is null or ageGroup is null/empty, fetch for EVERYONE
            blogsData = await getBlogs(`http://localhost:8080/api/blog/age-group/EVERYONE`);
          }
          setBlogs(blogsData);
        } else if (mainTabKey === 'myBlogs' && user) {
          let userBlogsData = [];
          if (myBlogsSubTabKey === 'published') {
            userBlogsData = await getMyBlogs(`http://localhost:8080/api/blog/my-list/${user.username}/status/PUBLISHED`);
          } else if (myBlogsSubTabKey === 'drafts') {
            userBlogsData = await getMyDrafts(`http://localhost:8080/api/blog/my-list/${user.username}/status/DRAFT`);
          } else if (myBlogsSubTabKey === 'pending') {
            userBlogsData = await getMyPending(`http://localhost:8080/api/blog/my-list/${user.username}/status/PENDING`);
          }
          setBlogs(userBlogsData);
        }
      } catch (error) {
        console.error("Fetch error in BlogList:", error);
        // Optionally set error to a state to display ErrorMessage component
      }
    };

    fetchData();
  }, [user, mainTabKey, myBlogsSubTabKey, getBlogs, getMyBlogs, getMyDrafts, getMyPending, getBlogTypes]);

  // Filter options
  const typeOptions = types.map(type => ({
    value: type,
    label: type
  }));

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

  const handleReadMore = (blogID) => {
    navigate(`/blogs/${blogID}`)
  }

  const handleCreateBlog = () => {
    navigate('/blogs/create');
  };

  const handleCategoryFilter = (type) => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  const handleTagFilter = (tag) => {
    setSearchTerm(tag.replace('#', ''));
    setCurrentPage(1);
  };


  const clearAllFilters = () => {
    setSearchTerm("")
    setSelectedType("")
    setCurrentPage(1)
  }

  // Centralized loading and error handling for main content
  const isLoading = loadingBlogs || loadingBlogTypes || (mainTabKey === 'myBlogs' && (loadingMyBlogs || loadingMyDrafts || loadingMyPending));
  const hasError = errorBlogs || errorBlogTypes || (mainTabKey === 'myBlogs' && (errorMyBlogs || errorMyDrafts || errorMyPending));

  if (isLoading) {
    return (
      <Container className="py-5">
        <LoadingSpinner />
      </Container>
    );
  }

  if (hasError) {
    return (
      <Container className="py-5">
        <ErrorMessage error={hasError} />
      </Container>
    );
  }

  // Determine if the age group message should be shown
  const showAgeGroupMessage = mainTabKey === 'all' && user && (!user.ageGroup || user.ageGroup.trim() === '');

  return (
    <div className="blog-list-page">
      <Container className="my-5">
        {/* Header Section */}
        <div className="blog-header text-center mb-5">
          <h1 className="display-5 fw-bold text-primary mb-3">
            {t("header.titlePart1")}
            <br />
            {t("header.titlePart2")}
          </h1>
          <p className="lead text-muted mb-4">
            {t("header.subtitle")}
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
              placeholder={t("searchFilter.placeholder")}
            />

            {/* Blog Posts */}
            <div className="blog-posts">
              <div className="text-center mb-5">
                <h2 className="fw-bold text-dark">{t("tabs.blogsTitle")}</h2>
                <div className="blogs-underline mx-auto"></div>

                <Tab.Container id="main-blog-tabs" activeKey={mainTabKey} onSelect={(k) => {
                  setMainTabKey(k);
                  setCurrentPage(1); // Reset page when main tab changes
                  setBlogs([]); // Clear blogs while new data is fetched
                }}>
                  <Nav variant="pills" className="mb-3">
                    <Row className="w-100 d-flex justify-content-around align-items-center m-0">
                      <Col xs={12} md={4} className="mb-2 mb-md-0">
                        <Nav.Item className="w-100">
                          <Nav.Link eventKey="all" className="w-100 rounded-pill shadow-sm custom-button">
                            {t("tabs.allBlogs")}
                          </Nav.Link>
                        </Nav.Item>
                      </Col>
                      {user && (
                        <>
                          <Col xs={12} md={4} className="mb-2 mb-md-0">
                            <Nav.Item className="w-100">
                              <Nav.Link eventKey="myBlogs" className="w-100 rounded-pill shadow-sm custom-button">
                                {t("tabs.myBlogs")}
                              </Nav.Link>
                            </Nav.Item>
                          </Col>
                        </>
                      )}
                    </Row>
                  </Nav>

                  <Tab.Content>
                    <Tab.Pane eventKey="all">
                      {/* Conditional message for ageGroup */}
                      {showAgeGroupMessage && (
                        <Alert variant="info" className="mb-4 text-center">
                          {t("ageGroupMessage")}
                        </Alert>
                      )}
                    </Tab.Pane>
                    {user && (
                      <Tab.Pane eventKey="myBlogs">
                        {/* Nested Tab for My Blogs (Published, Drafts, Pending) */}
                        <Tab.Container id="my-blogs-sub-tabs" activeKey={myBlogsSubTabKey} onSelect={(k) => {
                          setMyBlogsSubTabKey(k);
                          setCurrentPage(1); // Reset page when sub-tab changes
                          setBlogs([]); // Clear blogs while new data is fetched
                        }}>
                          <Nav variant="pills" className="mb-3 d-flex justify-content-around">
                            <Nav.Item>
                              <Nav.Link eventKey="published" className="rounded-pill shadow-sm custom-button-small">
                                {t("tabs.myPublished")}
                              </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                              <Nav.Link eventKey="drafts" className="rounded-pill shadow-sm custom-button-small">
                                {t("tabs.myDrafts")}
                              </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                              <Nav.Link eventKey="pending" className="rounded-pill shadow-sm custom-button-small">
                                {t("tabs.myPending")}
                              </Nav.Link>
                            </Nav.Item>
                            <Button className="rounded-pill shadow-sm custom-button-small" onClick={handleCreateBlog}>
                              <CirclePlus /> {t("tabs.createBlog")}
                            </Button>
                          </Nav>
                        </Tab.Container>
                      </Tab.Pane>
                    )}
                  </Tab.Content>
                </Tab.Container>

                {/* Common display area for blogs based on current state */}
                <div className="blogs-section mt-4">
                  {(loadingBlogs || loadingMyBlogs || loadingMyDrafts || loadingMyPending) && <LoadingSpinner />}
                  {(errorBlogs || errorMyBlogs || errorMyDrafts || errorMyPending) && <ErrorMessage error={errorBlogs || errorMyBlogs || errorMyDrafts || errorMyPending} />}

                  {!isLoading && !hasError && currentBlogs.length === 0 ? (
                    <div className="text-center py-5">
                      <p className="text-muted">{t("noBlogsFound.message")}</p>
                      <Button variant="outline-primary" onClick={clearAllFilters} className="mt-3">
                        {t("noBlogsFound.clearFilters")}
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
              </div>
            </div>
          </Col>

          {/* Sidebar */}
          <Col lg={4}>
            <div className="blog-sidebar">
              {/* Categories */}
              <div className="sidebar-section mb-4">
                <h5 className="sidebar-title">{t("sidebar.commonTypesTitle")}</h5>
                <div className="sidebar-content">
                  <div className="type-buttons">
                    {types.map((type) => (
                      <button key={type} className={`type-button ${selectedType === type ? 'active' : ''}`} onClick={() => handleCategoryFilter(type)}>
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Popular Blogs */}
              <div className="sidebar-section mb-4">
                <h5 className="sidebar-title">{t("sidebar.popularBlogsTitle")}</h5>
                <div className="sidebar-content">
                  {/* Fetch popular blogs separately or sort the 'all' blogs data */}
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
                      <small className="text-muted d-block mb-2">
                        {new Date(blog.createdAt).toLocaleDateString()} - {new Date(blog.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </small>
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular Tags */}
              <div className="sidebar-section">
                <h5 className="sidebar-title">{t("sidebar.favoriteTagsTitle")}</h5>
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
