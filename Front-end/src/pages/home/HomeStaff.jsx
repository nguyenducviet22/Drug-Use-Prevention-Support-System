import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { BookOpen, Calendar, FileText, Play, PlusCircle } from 'lucide-react';
import './HomeStaff.css'
import ManagementCard from '../../components/card/ManagementCard';
import useFetch from '../../hooks/useFetch';
import { useAuth } from '../../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

function HomeStaff() {
  const { t } = useTranslation('homeStaff');
  const { user } = useAuth()
  const navigate = useNavigate()
  const [itemsPerPage] = useState(3)

  const [blogActiveTab, setBlogActiveTab] = useState('me');
  const [blogSubTab, setBlogSubTab] = useState('pending');
  const [courseActiveTab, setCourseActiveTab] = useState('pending');
  const [eventActiveTab, setEventActiveTab] = useState('pending');

  const [blogCurrentPage, setBlogCurrentPage] = useState(1);
  const [courseCurrentPage, setCourseCurrentPage] = useState(1);
  const [eventCurrentPage, setEventCurrentPage] = useState(1);

  const [myPendingBlogs, setMyPendingBlogs] = useState([]);
  const [myApprovedBlogs, setMyApprovedBlogs] = useState([]);
  const [pendingBlogs, setPendingBlogs] = useState([]);
  const [approvedBlogs, setApprovedBlogs] = useState([]);
  const { get: getMyPendingBlogs } = useFetch();
  const { get: getMyApprovedBlogs } = useFetch();
  const { get: getPendingBlogs, put: putApproveBlog } = useFetch();
  const { get: getApprovedBlogs } = useFetch();

  const [pendingCourses, setPendingCourses] = useState([]);
  const [approvedCourses, setApprovedCourses] = useState([]);
  const { get: getPendingCourses } = useFetch();
  const { get: getApprovedCourses } = useFetch();

  const [pendingEvents, setPendingEvents] = useState([]);
  const [approvedEvents, setApprovedEvents] = useState([]);
  const { get: getPendingEvents } = useFetch();
  const { get: getApprovedEvents } = useFetch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pendingCoursesData = await getPendingCourses("http://localhost:8080/api/course/status/PENDING");
        setPendingCourses(pendingCoursesData || []);
        const approvedCoursesData = await getApprovedCourses("http://localhost:8080/api/course/status/AVAILABLE");
        setApprovedCourses(approvedCoursesData || []);

        if (user) {
          const myPendingBlogsData = await getMyPendingBlogs(`http://localhost:8080/api/blog/my-list/${user.username}/status/PENDING`);
          setMyPendingBlogs(myPendingBlogsData || []);
          const myApprovedBlogsData = await getMyApprovedBlogs(`http://localhost:8080/api/blog/my-list/${user.username}/status/PUBLISHED`);
          setMyApprovedBlogs(myApprovedBlogsData || []);
        }

        const pendingBlogsData = await getPendingBlogs("http://localhost:8080/api/blog/status/PENDING/role-except/STAFF");
        setPendingBlogs(pendingBlogsData || []);
        const approvedBlogsData = await getApprovedBlogs("http://localhost:8080/api/blog/status/PUBLISHED/role-except/STAFF");
        setApprovedBlogs(approvedBlogsData || []);

        const pendingEventsData = await getPendingEvents("http://localhost:8080/api/event/status/PENDING_APPROVAL");
        setPendingEvents(pendingEventsData || []);
        const approvedEventsData = await getApprovedEvents("http://localhost:8080/api/event/status/APPROVED");
        setApprovedEvents(approvedEventsData || []);
      } catch (error) {
        console.error("Fetch error in HomeStaff:", error);
      }
    };

    fetchData();
  }, [user, getPendingCourses, getApprovedCourses, getMyPendingBlogs, getMyApprovedBlogs, getPendingBlogs, getApprovedBlogs]);
  console.log(myPendingBlogs);

  const blogData = {
    me: { pending: myPendingBlogs, approved: myApprovedBlogs },
    others: { pending: pendingBlogs, approved: approvedBlogs }
  };

  const courseData = {
    pending: pendingCourses,
    approved: approvedCourses
  };

  const eventData = {
    pending: pendingEvents,
    approved: approvedEvents
  };

  const handleCourseTabChange = (tab) => {
    setCourseActiveTab(tab);
    setCourseCurrentPage(1);
  };

  const handleEventTabChange = (tab) => {
    setEventActiveTab(tab);
    setEventCurrentPage(1);
  };

  const handleBlogTabChange = (tab) => {
    setBlogActiveTab(tab);
    setBlogCurrentPage(1);
  };

  const handleBlogSubTabChange = (subTab) => {
    setBlogSubTab(subTab);
    setBlogCurrentPage(1);
  };

  const activeCourseList = courseData[courseActiveTab] || [];
  const totalCoursePages = Math.ceil(activeCourseList.length / itemsPerPage);
  const currentCourseItems = activeCourseList.slice(
    (courseCurrentPage - 1) * itemsPerPage,
    courseCurrentPage * itemsPerPage
  );

  const activeEventList = eventData[eventActiveTab] || [];
  const totalEventPages = Math.ceil(activeEventList.length / itemsPerPage);
  const currentEventItems = activeEventList.slice(
    (eventCurrentPage - 1) * itemsPerPage,
    eventCurrentPage * itemsPerPage
  );

  const activeBlogList = (blogData[blogActiveTab] && blogData[blogActiveTab][blogSubTab]) ? blogData[blogActiveTab][blogSubTab] : [];
  const totalBlogPages = Math.ceil(activeBlogList.length / itemsPerPage);
  const currentBlogItems = activeBlogList.slice(
    (blogCurrentPage - 1) * itemsPerPage,
    blogCurrentPage * itemsPerPage
  );

  const handleView = (id, type) => {
    if (type === 'blog') navigate(`/blogs/${id}`)
    if (type === 'course') navigate(`/courses/${id}`)
    if (type === 'event') navigate(`/events/${id}`)
  }

  const handleEdit = (id, type) => {
    if (type === 'course') navigate(`/courses/${id}/update`)
  }

  const handleApprove = async (id, type) => {
    try {
      await putApproveBlog({}, {}, `http://localhost:8080/api/blog/${id}/PUBLISHED`);
      setPendingBlogs(prevBlogs => prevBlogs.filter(blog => blog.blogID !== id));
      toast.success(t('successfullyApproved', { type: type, id: id }));
    } catch (error) {
      console.error(`Error approving ${type} with ID ${id}:`, error);
      toast.error(t('failedToApprove', { type: type, id: id }));
    }
  };

  const handleAdd = (type) => {
    navigate(`/${type}/create`);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Container fluid className="px-4 py-4">
        <Row className="g-4">
          {/* Course Management */}
          <Col lg={4} className="d-flex flex-column">
            <ManagementCard
              title={t('courseManagement')}
              icon={BookOpen}
              iconBgClass="bg-primary bg-opacity-10 text-primary"
              data={{ [courseActiveTab]: currentCourseItems }}
              activeTab={courseActiveTab}
              setActiveTab={handleCourseTabChange}
              dataType="course"
              counts={{
                pending: pendingCourses.length,
                approved: approvedCourses.length,
              }}
              onEdit={(id) => handleEdit(id, 'course')}
              onView={(id) => handleView(id, 'course')}
              onAdd={() => handleAdd('courses')}
            />
            <Link to="/course-management">
              <button className="btn btn-primary mt-3">
                {t('viewAllCourses')}
              </button>
            </Link>
          </Col>

          {/* Event Management */}
          <Col lg={4} className="d-flex flex-column">
            <ManagementCard
              title={t('eventManagement')}
              icon={Calendar}
              iconBgClass="bg-danger bg-opacity-10 text-danger"
              data={{ [eventActiveTab]: currentEventItems }}
              activeTab={eventActiveTab}
              setActiveTab={handleEventTabChange}
              dataType="event"
              counts={{
                pending: eventData.pending.length,
                approved: eventData.approved.length,
              }}
              onView={(id) => handleView(id, 'event')}
              onAdd={() => handleAdd('events')}
            />
            <Link to="/event-management">
              <button className="btn btn-primary mt-3">
                {t('viewAllEvents')}
              </button>
            </Link>
          </Col>

          {/* Blog Management */}
          <Col lg={4} className="d-flex flex-column">
            <ManagementCard
              title={t('blogManagement')}
              icon={FileText}
              iconBgClass="bg-success bg-opacity-10 text-success"
              data={{
                [blogActiveTab]: {
                  [blogSubTab]: currentBlogItems,
                },
              }}
              activeTab={blogActiveTab}
              setActiveTab={handleBlogTabChange}
              activeSubTab={blogSubTab}
              setActiveSubTab={handleBlogSubTabChange}
              dataType="blog"
              onView={(id) => handleView(id, 'blog')}
              onApprove={(id) => handleApprove(id, 'blog')}
              counts={{
                me: {
                  pending: myPendingBlogs.length,
                  approved: myApprovedBlogs.length
                },
                others: {
                  pending: pendingBlogs.length,
                  approved: approvedBlogs.length
                }
              }}
              onViewClick={(id, type) => handleView(id, type)}
              onAdd={() => handleAdd('blogs')}
            />
            <Link to="/blog-management">
              <button className="btn btn-primary mt-3">
                {t('viewAllBlogs')}
              </button>
            </Link>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default HomeStaff;
