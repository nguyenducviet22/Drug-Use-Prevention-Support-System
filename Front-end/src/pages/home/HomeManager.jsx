import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Users, Calendar, BookOpen, FileText, MessageSquare, UserCheck, Award, Target, ChevronRight } from 'lucide-react';
import StatusCard from '../../components/StatusCard';
import PendingCard from '../../components/PendingCard';
import LineChart from '../../components/LineChart';
import AnalyticsPreview from '../../components/AnalyticsPreview';
import useFetch from '../../hooks/useFetch';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Pagination from '../../components/others/Pagination';
import { toast } from 'react-toastify';

function HomeManager() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user } = useAuth()
  const navigate = useNavigate()
  const [itemsPerPage] = useState(4) // Show 4 items per page.

  // --- State phân trang riêng biệt cho từng khu vực ---
  const [blogCurrentPage, setBlogCurrentPage] = useState(1);
  const [courseCurrentPage, setCourseCurrentPage] = useState(1);
  const [eventCurrentPage, setEventCurrentPage] = useState(1);

  // --- State lưu trữ dữ liệu ---
  const [staffPendingBlogs, setStaffPendingBlogs] = useState([]);
  const { get: getStaffPendingBlogs, put: putApproveStaffBlog } = useFetch();

  const [pendingCourses, setPendingCourses] = useState([]);
  const { get: getPendingCourses, put: putApproveCourse } = useFetch();

  const [stat, setStat] = useState({})
  const { get: getStat } = useFetch()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statData = await getStat("http://localhost:8080/api/report")
        setStat(statData)

        const pendingCoursesData = await getPendingCourses("http://localhost:8080/api/course/status/PENDING");
        setPendingCourses(pendingCoursesData || []);

        if (user) {
          const staffPendingBlogsData = await getStaffPendingBlogs(`http://localhost:8080/api/blog/status/PENDING/role/STAFF`);
          setStaffPendingBlogs(staffPendingBlogsData || []);
        }
      } catch (error) {
        console.error("Fetch error in HomeManager:", error);
      }
    }

    fetchData()
  }, [getStat, getPendingCourses, getStaffPendingBlogs, user]);
  console.log(stat);
  console.log(staffPendingBlogs);
  console.log(pendingCourses);

  // --- Logic phân trang cho Blog ---
  const totalBlogPages = Math.ceil(staffPendingBlogs.length / itemsPerPage);
  const currentBlogItems = staffPendingBlogs.slice(
    (blogCurrentPage - 1) * itemsPerPage,
    blogCurrentPage * itemsPerPage
  );

  // --- Logic phân trang cho Course ---
  const totalCoursePages = Math.ceil(pendingCourses.length / itemsPerPage);
  const currentCourseItems = pendingCourses.slice(
    (courseCurrentPage - 1) * itemsPerPage,
    courseCurrentPage * itemsPerPage
  );

  // --- Logic phân trang cho Event ---
  // const activeEventList = eventData[eventActiveTab] || [];
  // const totalEventPages = Math.ceil(activeEventList.length / itemsPerPage);
  // const currentEventItems = activeEventList.slice(
  //   (eventCurrentPage - 1) * itemsPerPage,
  //   eventCurrentPage * itemsPerPage
  // );

  const handleView = (id, type) => {
    if (type === 'blog') navigate(`/blogs/${id}`);
    if (type === 'course') navigate(`/courses/${id}`);
  };

  const handleApprove = async (id, type) => {
    try {
      if (type === 'blog') {
        await putApproveStaffBlog({}, {}, `http://localhost:8080/api/blog/staff-list/${id}/status/PUBLISHED`);
        setStaffPendingBlogs(prevBlogs => prevBlogs.filter(blog => blog.blogID !== id));
      } else if (type === 'course') {
        await putApproveCourse({}, {}, `http://localhost:8080/api/course/${id}/AVAILABLE`);
        setPendingCourses(prevCourses => prevCourses.filter(course => course.courseID !== id));
      }

      toast.success(`Successfully approved ${type} with ID: ${id}`);
    } catch (error) {
      console.error(`Error approving ${type} with ID ${id}:`, error);
      toast.error(`Failed to approve ${type} with ID: ${id}`);
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>

      <Container fluid className="px-4 py-4">
        {/* Top Section: Chart on left, Stats on right */}
        <Row className="g-4 mb-4">
          {/* Chart takes 2/3 of the width */}
          <Col lg={8}>
            <LineChart />
          </Col>

          {/* Stats cards take 1/3 of the width, arranged vertically */}
          <Col lg={4}>
            <Row className="g-3">
              <Col xs={3} lg={6}>
                <StatusCard
                  title="Total Members"
                  value={stat.totalMembers}
                  change={12}
                  icon={Users}
                  gradientClass="icon-gradient-primary"
                />
              </Col>
              <Col xs={3} lg={6}>
                <StatusCard
                  title="Staff Members"
                  value={stat.staffMembers}
                  change={8}
                  icon={UserCheck}
                  gradientClass="icon-gradient-success"
                />
              </Col>
              <Col xs={3} lg={6}>
                <StatusCard
                  title="Consultants"
                  value={stat.consultants}
                  change={5}
                  icon={Award}
                  gradientClass="icon-gradient-secondary"
                />
              </Col>
              <Col xs={3} lg={6}>
                <StatusCard
                  title="Monthly Consultations"
                  value={stat.monthlyConsultations}
                  change={15}
                  icon={MessageSquare}
                  gradientClass="icon-gradient-warning"
                />
              </Col>
              <Col xs={3} lg={6}>
                <StatusCard
                  title="Active Courses"
                  value={stat.activeCourses}
                  change={-2}
                  icon={BookOpen}
                  gradientClass="icon-gradient-info"
                />
              </Col>
              <Col xs={3} lg={6}>
                <StatusCard
                  title="Blogs"
                  value={stat.blogs}
                  change={18}
                  icon={FileText}
                  gradientClass="icon-gradient-dark"
                />
              </Col>
              <Col xs={3} lg={6}>
                <StatusCard
                  title="Events"
                  value={stat.events}
                  change={22}
                  icon={Calendar}
                  gradientClass="icon-gradient-success"
                />
              </Col>
              <Col xs={3} lg={6}>
                <StatusCard
                  title="Courses"
                  value={stat.courses}
                  change={10}
                  icon={Target}
                  gradientClass="icon-gradient-warning"
                />
              </Col>
            </Row>
          </Col>
        </Row>

        {/* Pending Content Cards */}
        <Row className="g-4 mb-4">
          <Col lg={4} className="d-flex flex-column">
            <PendingCard
              title="Blogs"
              count={staffPendingBlogs.length}
              items={currentBlogItems}
              onView={(id) => handleView(id, 'blog')}
              onApprove={(id) => handleApprove(id, 'blog')}
            />
            {totalBlogPages > 1 && (
              <Pagination
                currentPage={blogCurrentPage}
                totalPages={totalBlogPages}
                onPageChange={setBlogCurrentPage}
              />
            )}
          </Col>

          <Col lg={4} className="d-flex flex-column">
            <PendingCard
              title="Courses"
              count={pendingCourses.length}
              items={currentCourseItems}
              onView={(id) => handleView(id, 'course')}
              onApprove={(id) => handleApprove(id, 'course')}
            />
            {totalCoursePages > 1 && (
              <Pagination
                currentPage={courseCurrentPage}
                totalPages={totalCoursePages}
                onPageChange={setCourseCurrentPage}
              />
            )}
          </Col>

          <Col lg={4} className="d-flex flex-column">
            <PendingCard
              title="Events"
              count={3}
              items={[
                { title: "Community Drug Prevention Summit 2024", author: "Event Team", date: "3 hours ago" },
                { title: "Youth Leadership Workshop", author: "Amanda Rodriguez", date: "6 hours ago" },
                { title: "Parent-Teacher Drug Awareness Meeting", author: "School District", date: "1 day ago" }
              ]}
            />
            {/* {totalEventPages > 1 && (
              <Pagination
                currentPage={eventCurrentPage}
                totalPages={totalEventPages}
                onPageChange={setEventCurrentPage}
              />
            )} */}
          </Col>
        </Row>

        {/* Quick Access Tools */}
        <Row className="g-4">
          <Col md={6}>
            <div className="pending-card h-100 p-4">
              <div className="d-flex align-items-center mb-4">
                <div className="icon-gradient-primary p-3 rounded-3 text-white me-3">
                  <Users size={24} />
                </div>
                <h5 className="fw-bold text-dark mb-0">User Management</h5>
              </div>
              <p className="text-muted mb-4">Manage members, staff, and consultants with comprehensive tools</p>
              <div className="d-flex align-items-center text-primary fw-semibold">
                Access Dashboard <ChevronRight size={16} className="ms-1" />
              </div>
            </div>
          </Col>

          <Col md={6}>
            <AnalyticsPreview />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default HomeManager;