import React, { useState, useEffect, useMemo } from "react";
import { Container, Card, Button, Table, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import useFetch from "../../hooks/useFetch";
import SearchFilter from "../../components/others/SearchFilter";
import Pagination from "../../components/others/Pagination";
import { PlusCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import { useTranslation } from "react-i18next";

function CourseManagement() {
    const navigate = useNavigate(); // Initialize useNavigate hook
    const { user } = useAuth()
    const { t } = useTranslation('courseManagement');

    const [courses, setCourses] = useState([]);
    const [ageGroups, setAgeGroups] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAgeGroup, setSelectedAgeGroup] = useState("");
    const [selectedDuration, setSelectedDuration] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const { get, put } = useFetch(); // Destructure 'del' for delete operations

    useEffect(() => {
        const fetchData = async () => {
            try {
                const coursesData = await get('http://localhost:8080/api/course');
                setCourses(coursesData);
                const ageGroupsData = await get("http://localhost:8080/api/user/age-group");
                setAgeGroups(ageGroupsData);
                const statusesData = await get("http://localhost:8080/api/course/status");
                setStatuses(statusesData);
            } catch (error) {
                console.error("Fetch error in CourseManagement:", error);
                toast.error(t('fetchError')); // Generic fetch error toast
            }
        };
        fetchData();
    }, [get]);
    console.log('courses', courses);

    // Filter options
    const ageGroupOptions = ageGroups.map(ageGroup => ({
        value: ageGroup,
        label: ageGroup
    }));

    const statusOptions = statuses.map(status => ({
        value: status,
        label: status
    }));

    const durationOptions = [
        { value: 10, label: t("durationOptions.lessThan10Mins") },
        { value: 20, label: t("durationOptions.lessThan20Mins") },
        { value: 30, label: t("durationOptions.lessThan30Mins") },
        { value: 31, label: t("durationOptions.moreThan30Mins") },
    ];

    // Filter courses based on search criteria
    const filteredCourses = useMemo(() => {
        return courses.filter((course) => {
            const matchesName = course.courseName && course.courseName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesAgeGroup = selectedAgeGroup === "" || course.ageGroup === selectedAgeGroup;
            const matchesStatus = selectedStatus === "" || course.status === selectedStatus;
            const duration = course.duration;
            let matchesDuration = true;
            if (selectedDuration !== "") {
                const selected = Number(selectedDuration);
                if (selected === 10) {
                    matchesDuration = duration <= 10;
                } else if (selected === 20) {
                    matchesDuration = duration <= 20;
                } else if (selected === 30) {
                    matchesDuration = duration <= 30;
                } else if (selected === 31) {
                    matchesDuration = duration > 30;
                } else {
                    matchesDuration = true;
                }
            }
            return matchesName && matchesAgeGroup && matchesDuration && matchesStatus;
        });
    }, [courses, searchTerm, selectedAgeGroup, selectedDuration, selectedStatus]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentCourses = filteredCourses.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        // Scroll to top of courses section
        document.querySelector(".courses-section")?.scrollIntoView({ behavior: "smooth" });
    };

    // Reset to first page when filters change
    const handleFilterChange = (filterType, value) => {
        setCurrentPage(1); // Reset to first page when filters change
        switch (filterType) {
            case "ageGroup":
                setSelectedAgeGroup(value);
                break;
            case "duration":
                setSelectedDuration(value);
                break;
            case "status":
                setSelectedStatus(value);
                break;
            case "searchTerm": // Added for search term
                setSearchTerm(value);
                break;
            default:
                break;
        }
    };

    const clearAllFilters = () => {
        setSearchTerm("");
        setSelectedAgeGroup("");
        setSelectedDuration("");
        setSelectedStatus("");
        setCurrentPage(1);
    };

    const handleAddCourse = () => {
        navigate(`/courses/create`);
    };

    const handleViewCourse = (courseId) => {
        console.log(`Viewing course with ID: ${courseId}`);
        navigate(`/courses/${courseId}`);
    };

    const handleEditCourse = (courseId) => {
        console.log(`Viewing course with ID: ${courseId}`);
        navigate(`/courses/${courseId}/update`);
    }

    const handleApproveCourse = async (courseId) => {
        if (window.confirm(`Are you sure you want to approve course ${courseId}?`)) {
            try {
                await put({}, {}, `http://localhost:8080/api/course/${courseId}/AVAILABLE`);
                setCourses(prevCourses =>
                    prevCourses.map(course =>
                        course.courseID === courseId ? { ...course, status: 'AVAILABLE' } : course
                    )
                );
                toast.success(t('successfullyApproved'));
            } catch (error) {
                console.error(`Error approving`, error);
                toast.error(t('failedToApprove'));
            }
        }
    };

    const handleRejectCourse = async (courseId) => {
        if (window.confirm(`Are you sure you want to reject course ${courseId}?`)) {
            try {
                await put({}, {}, `http://localhost:8080/api/course/${courseId}/REJECTED`);
                setCourses(prevCourses =>
                    prevCourses.map(course =>
                        course.courseID === courseId ? { ...course, status: 'REJECTED' } : course
                    )
                );
                console.log(`Rejected course with ID: ${courseId}`);
                toast.success(t('successfullyRejected'));
            } catch (error) {
                console.error(`Error rejecting:`, error);
                toast.error(t('failedToReject'));
            }
        }
    };

    return (
        <div className="course-management-content">
            <Container className="mb-5 courses-section">
                <h1>{t("courseManagementTitle")}</h1>

                {/* Search Filter Section */}
                <SearchFilter
                    searchTerm={searchTerm}
                    selectedAgeGroup={selectedAgeGroup}
                    selectedDuration={selectedDuration}
                    selectedStatus={selectedStatus}
                    onSearchChange={(value) => handleFilterChange("searchTerm", value)} // Updated to use handleFilterChange
                    onAgeGroupChange={(value) => handleFilterChange("ageGroup", value)}
                    onDurationChange={(value) => handleFilterChange("duration", value)}
                    onStatusChange={(value) => handleFilterChange("status", value)}
                    ageGroupOptions={ageGroupOptions}
                    durationOptions={durationOptions}
                    statusOptions={statusOptions}
                    placeholder={t("searchFilter.placeholder")}
                    filterFor="courses"
                />

                {(searchTerm !== "" || selectedAgeGroup !== "" || selectedDuration !== "" || selectedStatus !== "") && (
                    <div className="d-flex justify-content-center mt-3">
                        <Button variant="outline-primary" onClick={clearAllFilters}>
                            {t("coursesSection.clearFilters")}
                        </Button>
                    </div>
                )}

                {/* Courses Section */}
                <div className="d-flex align-items-center mb-4">
                    <Button variant="outline-success" size="sm" onClick={handleAddCourse} className="ms-auto">
                        <PlusCircle size={16} className="me-1" /> Add
                    </Button>
                </div>

                {filteredCourses.length > 0 ? (
                    <>
                        <Card>
                            <Card.Header>
                                {t("courseList")} <Badge bg="secondary">{filteredCourses.length}</Badge>
                            </Card.Header>
                            <Card.Body style={{ padding: 0 }}>
                                <div
                                    style={{
                                        maxHeight: "150vh",
                                        position: "relative",
                                    }}
                                >
                                    <Table bordered hover className="table-sticky-header" style={{ marginBottom: 0 }}>
                                        <thead>
                                            <tr>
                                                <th>{t("no.")}</th>
                                                <th>{t("courseName")}</th>
                                                <th>{t("quantity")}</th>
                                                <th>{t("duration")}</th>
                                                <th>{t("ageGroup")}</th>
                                                <th>{t("status")}</th>
                                                <th>{t("createdAt")}</th>
                                                <th>{t("updatedAt")}</th>
                                                <th>{t("actions")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentCourses.map((course, index) => (
                                                <tr key={course.courseID}>
                                                    <td>{startIndex + index + 1}</td>
                                                    <td>{course.courseName}</td>
                                                    <td>{course.quantity}</td>
                                                    <td>{course.duration}</td>
                                                    <td>{course.ageGroup}</td>
                                                    <td>
                                                        <Badge
                                                            bg={
                                                                course.status === "AVAILABLE"
                                                                    ? "success"
                                                                    : course.status === "PENDING"
                                                                        ? "warning"
                                                                        : "danger"
                                                            }
                                                        >
                                                            {course.status}
                                                        </Badge>
                                                    </td>
                                                    <td>{new Date(course.createdAt).toLocaleString()}</td>
                                                    <td>{new Date(course.updatedAt).toLocaleString()}</td>
                                                    <td>
                                                        <div className="d-flex align-items-center gap-2 flex-shrink-0">
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                className="fw-bold"
                                                                onClick={() => handleViewCourse(course.courseID)}
                                                            >
                                                                View
                                                            </Button>

                                                            {user?.role === 'STAFF' && (
                                                                <Button
                                                                    variant="outline-success"
                                                                    size="sm"
                                                                    className="fw-bold"
                                                                    onClick={() => handleEditCourse(course.courseID)}
                                                                >
                                                                    Edit
                                                                </Button>
                                                            )}

                                                            {(['PENDING', 'UNAVAILABLE', 'REJECTED'].includes(course.status)) &&
                                                                user?.role === 'MANAGER' && (
                                                                    <Button
                                                                        variant="outline-success"
                                                                        size="sm"
                                                                        className="fw-bold"
                                                                        onClick={() => handleApproveCourse(course.courseID)}
                                                                    >
                                                                        Approve
                                                                    </Button>
                                                                )}

                                                            {(['PENDING', 'AVAILABLE'].includes(course.status)) &&
                                                                user?.role === 'MANAGER' && (
                                                                    <Button
                                                                        variant="outline-danger"
                                                                        size="sm"
                                                                        className="fw-bold"
                                                                        onClick={() => handleRejectCourse(course.courseID)}
                                                                    >
                                                                        Reject
                                                                    </Button>
                                                                )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </Card.Body>
                        </Card>

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
    );
}

export default CourseManagement;