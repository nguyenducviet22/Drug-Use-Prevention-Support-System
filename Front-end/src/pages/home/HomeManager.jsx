import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import {
  Users,
  Calendar,
  BookOpen,
  FileText,
  MessageSquare,
  UserCheck,
  Award,
  Target,
  ChevronRight,
} from "lucide-react";
import "./HomeManager.css";
import StatusCard from "../../components/dashboard/StatusCard";
import PendingCard from "../../components/dashboard/PendingCard";
import LineChart from "../../components/dashboard/LineChart";
import AnalyticsPreview from "../../components/dashboard/AnalyticsPreview";
import useFetch from "../../hooks/useFetch";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next"; // Import useTranslation

function HomeManager() {
  const { t } = useTranslation("homeManager"); // Initialize useTranslation with the 'homeManager' namespace
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user } = useAuth();
  const navigate = useNavigate();
  const [itemsPerPage] = useState(3);

  // --- State phân trang riêng biệt cho từng khu vực ---
  const [blogCurrentPage, setBlogCurrentPage] = useState(1);
  const [courseCurrentPage, setCourseCurrentPage] = useState(1);
  const [eventCurrentPage, setEventCurrentPage] = useState(1);

  // --- State lưu trữ dữ liệu ---
  const [staffPendingBlogs, setStaffPendingBlogs] = useState([]);
  const { get: getStaffPendingBlogs, put: putApproveStaffBlog, put: putRejectStaffBlog } = useFetch();

  const [pendingCourses, setPendingCourses] = useState([]);
  const { get: getPendingCourses, put: putApproveCourse, put: putRejectCourse } = useFetch();

  const [pendingEvents, setPendingEvents] = useState([]);
  const {
    get: getPendingEvents,
    put: putApproveEvent,
    put: putRejectEvent,
  } = useFetch();

  const [stat, setStat] = useState({});
  const { get: getStat } = useFetch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stats
        const statResponse = await getStat("http://localhost:8080/api/report");
        console.log("Stat Response:", statResponse);
        setStat(statResponse?.data || statResponse || {});

        // Fetch pending courses
        const pendingCoursesResponse = await getPendingCourses(
          "http://localhost:8080/api/course/status/PENDING"
        );
        console.log("Pending Courses Response:", pendingCoursesResponse);
        setPendingCourses(pendingCoursesResponse?.data || []);

        // Fetch pending blogs (if user is authenticated)
        if (user) {
          const staffPendingBlogsResponse = await getStaffPendingBlogs(
            `http://localhost:8080/api/blog/status/PENDING/role/STAFF`
          );
          console.log(
            "Staff Pending Blogs Response:",
            staffPendingBlogsResponse
          );
          setStaffPendingBlogs(staffPendingBlogsResponse?.data || []);
        } else {
          setStaffPendingBlogs([]);
        }

        // Fetch pending events
        const pendingEventsResponse = await getPendingEvents(
          "http://localhost:8080/api/event/status/PENDING_APPROVAL"
        );
        const events =
          pendingEventsResponse?.data ?? pendingEventsResponse ?? [];
        console.log("✅ Fetched Events:", events);

        setPendingEvents(events);
      } catch (error) {
        console.error("Fetch error in HomeManager:", error);
      }
    };

    fetchData();
  }, [
    getStat,
    getPendingCourses,
    getStaffPendingBlogs,
    getPendingEvents,
    user,
  ]);
  console.log("Pendinggg Events", pendingEvents);
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
  const totalEventPages = Math.ceil(pendingEvents.length / itemsPerPage);
  const currentEventItems = pendingEvents.slice(
    (eventCurrentPage - 1) * itemsPerPage,
    eventCurrentPage * itemsPerPage
  );

  const handleView = (id, type) => {
    if (type === "blog") navigate(`/blogs/${id}`);
    if (type === "course") navigate(`/courses/${id}`);
    if (type === "event") navigate(`/events/${id}`);
  };

  const handleApprove = async (id, type) => {
    try {
      if (type === "blog") {
        await putApproveStaffBlog(
          {},
          {},
          `http://localhost:8080/api/blog/${id}/PUBLISHED`
        );
        setStaffPendingBlogs((prevBlogs) =>
          prevBlogs.filter((blog) => blog.blogID !== id)
        );
      } else if (type === "course") {
        await putApproveCourse(
          {},
          {},
          `http://localhost:8080/api/course/${id}/AVAILABLE`
        );
        setPendingCourses((prevCourses) =>
          prevCourses.filter((course) => course.courseID !== id)
        );
      } else if (type === "event") {
        await putApproveEvent(
          {},
          {},
          `http://localhost:8080/api/event/${id}/approve`
        );
        setPendingEvents((prevEvents) =>
          prevEvents.filter((event) => event.eventID !== id)
        );
      }

      toast.success(t("successfullyApproved", { type: type, id: id }));
    } catch (error) {
      console.error(`Error approving ${type} with ID ${id}:`, error);
      toast.error(t("failedToApprove", { type: type, id: id }));
    }
  };

  const handleReject = async (id, type) => {
    try {
      if (type === "blog") {
        await putRejectStaffBlog(
          {},
          {},
          `http://localhost:8080/api/blog/${id}/REJECTED`
        );
        setStaffPendingBlogs((prevBlogs) =>
          prevBlogs.filter((blog) => blog.blogID !== id)
        );
      } else if (type === "course") {
        await putRejectCourse(
          {},
          {},
          `http://localhost:8080/api/course/${id}/REJECTED`
        );
        setPendingCourses((prevCourses) =>
          prevCourses.filter((course) => course.courseID !== id)
        );
      } else if (type === "event") {
        await putRejectEvent(
          {},
          {},
          `http://localhost:8080/api/event/${id}/reject`
        );
        setPendingEvents((prevEvents) =>
          prevEvents.filter((event) => event.eventID !== id)
        );
      }

      toast.success(t("successfullyRejected", { type: type, id: id }));
    } catch (error) {
      console.error(`Error rejecting ${type} with ID ${id}:`, error);
      toast.error(t("failedToReject", { type: type, id: id }));
    }
  };

  return (
    <div style={{ minHeight: "100vh" }}>
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
                  title={t("totalMembers")}
                  value={stat.totalMembers}
                  change={12}
                  icon={Users}
                  gradientClass="icon-gradient-primary"
                />
              </Col>
              <Col xs={3} lg={6}>
                <StatusCard
                  title={t("staffMembers")}
                  value={stat.staffMembers}
                  change={8}
                  icon={UserCheck}
                  gradientClass="icon-gradient-success"
                />
              </Col>
              <Col xs={3} lg={6}>
                <StatusCard
                  title={t("consultants")}
                  value={stat.consultants}
                  change={5}
                  icon={Award}
                  gradientClass="icon-gradient-secondary"
                />
              </Col>
              <Col xs={3} lg={6}>
                <StatusCard
                  title={t("monthlyConsultations")}
                  value={stat.monthlyConsultations}
                  change={15}
                  icon={MessageSquare}
                  gradientClass="icon-gradient-warning"
                />
              </Col>
              <Col xs={3} lg={6}>
                <StatusCard
                  title={t("activeCourses")}
                  value={stat.activeCourses}
                  change={-2}
                  icon={BookOpen}
                  gradientClass="icon-gradient-info"
                />
              </Col>
              <Col xs={3} lg={6}>
                <StatusCard
                  title={t("blogs")}
                  value={stat.blogs}
                  change={18}
                  icon={FileText}
                  gradientClass="icon-gradient-dark"
                />
              </Col>
              <Col xs={3} lg={6}>
                <StatusCard
                  title={t("events")}
                  value={stat.events}
                  change={22}
                  icon={Calendar}
                  gradientClass="icon-gradient-success"
                />
              </Col>
              <Col xs={3} lg={6}>
                <StatusCard
                  title={t("courses")}
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
              title={t("pendingBlogs")}
              type="blog" // Add type prop
              count={staffPendingBlogs.length}
              items={currentBlogItems}
              onView={(id) => handleView(id, "blog")}
              onApprove={(id) => handleApprove(id, "blog")}
              onReject={(id) => handleReject(id, "blog")}
            />
            <Link to="/blog-management">
              <button className="btn btn-primary mt-3">
                {t('viewAllBlogs')}
              </button>
            </Link>
          </Col>
          <Col lg={4} className="d-flex flex-column">
            <PendingCard
              title={t("pendingCourses")}
              type="course" // Add type prop
              count={pendingCourses.length}
              items={currentCourseItems}
              onView={(id) => handleView(id, "course")}
              onApprove={(id) => handleApprove(id, "course")}
              onReject={(id) => handleReject(id, "course")}
            />
            <Link to="/course-management">
              <button className="btn btn-primary mt-3">
                {t('viewAllCourses')}
              </button>
            </Link>
          </Col>
          <Col lg={4} className="d-flex flex-column">
            <PendingCard
              title={t("pendingEvents")}
              type="event" // Add type prop
              count={pendingEvents.length}
              items={currentEventItems}
              onView={(id) => handleView(id, "event")}
              onApprove={(id) => handleApprove(id, "event")}
              onReject={(id) => handleReject(id, "event")}
            />
            <Link to="/event-management">
              <button className="btn btn-primary mt-3">
                {t("viewAllEvents")}
              </button>
            </Link>
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
                <h5 className="fw-bold text-dark mb-0">
                  {t("userManagement")}
                </h5>
              </div>
              <p className="text-muted mb-4">{t("manageUsersDescription")}</p>
              <div className="d-flex align-items-center text-primary fw-semibold">
                {t("accessDashboard")}{" "}
                <ChevronRight size={16} className="ms-1" />
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
