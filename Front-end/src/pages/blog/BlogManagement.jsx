import React, { useState, useEffect, useMemo } from "react";
import { Container, Card, Button, Table, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import SearchFilter from "../../components/others/SearchFilter";
import Pagination from "../../components/others/Pagination";
import { PlusCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import { useTranslation } from "react-i18next";

function BlogManagement() {
    const navigate = useNavigate();
    const { user } = useAuth()
    const { t } = useTranslation('blogManagement');

    const [blogs, setBlogs] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [types, setTypes] = useState([]);
    const [selectedType, setSelectedType] = useState("");
    const [ageGroups, setAgeGroups] = useState([]);
    const [selectedAgeGroup, setSelectedAgeGroup] = useState("");
    const [statuses, setStatuses] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const { get, put } = useFetch();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const blogsData = await get(
                    user?.role === 'STAFF'
                        ? 'http://localhost:8080/api/blog'
                        : 'http://localhost:8080/api/blog/role/STAFF'
                );
                setBlogs(blogsData);
                const typesData = await get("http://localhost:8080/api/blog/type");
                setTypes(typesData);
                const ageGroupsData = await get("http://localhost:8080/api/user/age-group");
                setAgeGroups(ageGroupsData);
                const statusesData = await get("http://localhost:8080/api/blog/status");
                setStatuses(statusesData);
            } catch (error) {
                console.error("Fetch error in BlogManagement:", error);
            }
        };
        fetchData();
    }, [user, get]);
    console.log('blogs', blogs);

    const typeOptions = types.map(type => ({
        value: type,
        label: type
    }));

    const ageGroupOptions = ageGroups.map(ageGroup => ({
        value: ageGroup,
        label: ageGroup
    }));

    const statusOptions = statuses.map(status => ({
        value: status,
        label: status
    }));

    // Filter blogs based on search criteria
    const filteredBlogs = useMemo(() => {
        return blogs.filter((blog) => {
            const matchesName = blog.blogName && blog.blogName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesAgeGroup = selectedAgeGroup === "" || blog.ageGroup === selectedAgeGroup;
            const matchesType = selectedType === "" || blog.blogType === selectedType;
            const matchesStatus = selectedStatus === "" || blog.blogStatus === selectedStatus;
            return matchesName && matchesAgeGroup && matchesType && matchesStatus;
        });
    }, [blogs, searchTerm, selectedType, selectedAgeGroup, selectedStatus]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentBlogs = filteredBlogs.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        document.querySelector(".blogs-section")?.scrollIntoView({ behavior: "smooth" });
    };

    // Reset to first page when filters change
    const handleFilterChange = (filterType, value) => {
        setCurrentPage(1);
        switch (filterType) {
            case "searchTerm":
                setSearchTerm(value);
                break;
            case "ageGroup":
                setSelectedAgeGroup(value);
                break;
            case "type":
                setSelectedType(value);
                break;
            case "status":
                setSelectedStatus(value);
                break;
            default:
                break;
        }
    };

    const clearAllFilters = () => {
        setSearchTerm("");
        setSelectedAgeGroup("");
        setSelectedType("");
        setSelectedStatus("");
        setCurrentPage(1);
    };

    const handleAddBlog = () => {
        navigate("/blogs/create");
    };

    const handleViewBlog = (blogId) => {
        console.log(`Viewing blog with ID: ${blogId}`);
        navigate(`/blogs/${blogId}`);
    };

    const handleApproveBlog = async (blogId) => {
        if (window.confirm(`Are you sure you want to approve blog ${blogId}?`)) {
            try {
                await put({}, {}, `http://localhost:8080/api/blog/${blogId}/PUBLISHED`);
                setBlogs(prevBlogs =>
                    prevBlogs.map(blog =>
                        blog.blogID === blogId ? { ...blog, blogStatus: 'PUBLISHED' } : blog
                    )
                );
                toast.success(t('successfullyApproved'));
            } catch (error) {
                console.error(`Error approving`, error);
                toast.error(t('failedToApprove'));
            }
        }
    };

    const handleRejectBlog = async (blogId) => {
        if (window.confirm(`Are you sure you want to reject blog ${blogId}?`)) {
            try {
                await put({}, {}, `http://localhost:8080/api/blog/${blogId}/REJECTED`);
                setBlogs(prevBlogs =>
                    prevBlogs.map(blog =>
                        blog.blogID === blogId ? { ...blog, blogStatus: 'REJECTED' } : blog
                    )
                );
                console.log(`Rejected blog with ID: ${blogId}`);
                toast.success(t('successfullyRejected'));
            } catch (error) {
                console.error(`Error rejecting:`, error);
                toast.error(t('failedToReject'));
            }
        }
    };

    return (
        <div className="blog-management-content">
            <h1>{t("blogManagementTitle")}</h1>

            <SearchFilter
                filterFor="blogs"
                searchTerm={searchTerm}
                selectedAgeGroup={selectedAgeGroup}
                selectedType={selectedType}
                selectedStatus={selectedStatus}
                onSearchChange={(value) => handleFilterChange("searchTerm", value)}
                onAgeGroupChange={(value) => handleFilterChange("ageGroup", value)}
                onTypeChange={(value) => handleFilterChange("type", value)}
                onStatusChange={(value) => handleFilterChange("status", value)}
                ageGroupOptions={ageGroupOptions}
                typeOptions={typeOptions}
                statusOptions={statusOptions}
                placeholder={t("searchFilter.placeholder")}
            />

            {(searchTerm !== "" || selectedAgeGroup !== "" || selectedType !== "" || selectedStatus !== "") && (
                <div className="d-flex justify-content-center mt-3">
                    <Button variant="outline-primary" onClick={clearAllFilters}>
                        {t("blogsSection.clearFilters")}
                    </Button>
                </div>
            )}

            <div className="d-flex align-items-center mb-4">
                <Button variant="outline-success" size="sm" onClick={handleAddBlog} className="ms-auto">
                    <PlusCircle size={16} className="me-1" /> Add
                </Button>
            </div>

            <Container className="mb-5 blogs-section">
                {filteredBlogs.length > 0 ? (
                    <>
                        <Card>
                            <Card.Header>
                                {t("blogList")} <Badge bg="secondary">{filteredBlogs.length}</Badge>
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
                                                <th>{t("stt")}</th>
                                                <th>{t("blogName")}</th>
                                                <th>{t("author")}</th>
                                                <th>{t("readingTime")}</th>
                                                <th>{t("blogType")}</th>
                                                <th>{t("blogStatus")}</th>
                                                <th>{t("ageGroup")}</th>
                                                <th>{t("createdAt")}</th>
                                                <th>{t("updatedAt")}</th>
                                                <th>{t("actions")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentBlogs.map((blog, index) => (
                                                <tr key={blog.blogID}>
                                                    <td>{startIndex + index + 1}</td>
                                                    <td>{blog.blogName}</td>
                                                    <td>{blog.member ? blog.member.fullName : "N/A"}</td>
                                                    <td>{blog.readingTime ? `${blog.readingTime} ${t("minutes")}` : "N/A"}</td>
                                                    <td>{blog.blogType}</td>
                                                    <td>
                                                        <Badge
                                                            bg={

                                                                blog.blogStatus === "PUBLISHED"
                                                                    ? "success"
                                                                    : (['DRAFT', 'PENDING'].includes(blog.blogStatus))
                                                                        ? "warning"
                                                                        : "danger"
                                                            }
                                                        >
                                                            {blog.blogStatus}
                                                        </Badge>
                                                    </td>
                                                    <td>{blog.ageGroup}</td>
                                                    <td>{new Date(blog.createdAt).toLocaleString()}</td>
                                                    <td>{new Date(blog.updatedAt).toLocaleString()}</td>
                                                    <td>
                                                        <div className="d-flex align-items-center gap-2 flex-shrink-0">
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                className="fw-bold"
                                                                onClick={() => handleViewBlog(blog.blogID)}
                                                            >
                                                                View
                                                            </Button>

                                                            {(['PENDING', 'UNAVAILABLE', 'REJECTED'].includes(blog.blogStatus)) &&
                                                                (['STAFF', 'MANAGER'].includes(blog.member.role)) && (
                                                                    <Button
                                                                        variant="outline-success"
                                                                        size="sm"
                                                                        className="fw-bold"
                                                                        onClick={() => handleApproveBlog(blog.blogID)}
                                                                    >
                                                                        Approve
                                                                    </Button>
                                                                )}

                                                            {(['PENDING', 'PUBLISHED'].includes(blog.blogStatus)) &&
                                                                (['STAFF', 'MANAGER'].includes(blog.member.role)) && (
                                                                    <Button
                                                                        variant="outline-danger"
                                                                        size="sm"
                                                                        className="fw-bold"
                                                                        onClick={() => handleRejectBlog(blog.blogID)}
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

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            itemsPerPage={itemsPerPage}
                        />
                    </>
                ) : (
                    <div className="text-center py-5">
                        <p className="text-muted">{t("blogsSection.noMatchingBlogs")}</p>
                    </div>
                )}
            </Container>
        </div>
    );
}

export default BlogManagement;