import React, { useEffect, useState } from "react";
import { Card, Table, Form, Button, Row, Col, Badge } from "react-bootstrap";
import { FaSearch, FaEdit, FaTrash, FaLock, FaUnlock } from "react-icons/fa";
import axios from "axios";
import "./admin.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaFileExcel } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [users, setUsers] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const token = localStorage.getItem("token");
  const { t } = useTranslation("userManagement");

  // Fetch users from backend based on selected role
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let url = "http://localhost:8080/api/user/no-admin";

        if (userFilter !== "all") {
          const roleMap = {
            user: "MEMBER",
            consultant: "CONSULTANT",
            manager: "MANAGER",
            staff: "STAFF",
          };
          const selectedRole = roleMap[userFilter];
          url = `http://localhost:8080/api/user/role/${selectedRole}`;
        }

        const res = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUsers(res.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setUsers([]);
      }
    };

    fetchUsers();
  }, [userFilter]);

  // Filter users by name/email
  const filteredUsers = users.filter((user) => {
    const name = user.fullName || "";
    const email = user.email || "";

    const matchSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === "all" || user.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const [toggleInProgress, setToggleInProgress] = useState(false);

  const handleToggleStatus = async (username) => {
    if (toggleInProgress) return;

    setToggleInProgress(true);
    try {
      await axios.put(
        `http://localhost:8080/api/user/toggleStatus/${username}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.username === username
            ? {
                ...user,
                status: user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
              }
            : user
        )
      );

      toast.success(t("successToggle"));
    } catch (error) {
      console.error("Failed to toggle status:", error);
      toast.error(t("failToggle"));
    } finally {
      setToggleInProgress(false);
    }
  };

  const handleDeleteUser = async (username) => {
    if (!window.confirm(t("confirmDelete", { username }))) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/api/user/admin/${username}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.username !== username)
      );

      toast.success(t("successDelete"));
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error(t("failDelete"));
    }
  };

  const exportToExcel = () => {
    const data = filteredUsers.map((user, index) => ({
      [t("stt")]: index + 1,
      [t("username")]: user.username,
      [t("fullName")]: user.fullName,
      [t("email")]: user.email,
      [t("role")]: user.role,
      [t("status")]: user.status,
      [t("gender")]: user.gender,
      [t("ageGroup")]: user.ageGroup,
      [t("dob")]: user.dob,
      [t("phone")]: user.phoneNumber,
      [t("job")]: user.job,
      [t("address")]: user.address,
      [t("createdAt")]: new Date(user.createdAt).toLocaleString(),
      [t("updatedAt")]: new Date(user.updatedAt).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `user_list_${new Date().toISOString()}.xlsx`);
  };

  return (
    <div className="user-management-content">
      <h1>{t("title")}</h1>

      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-end">
            <Col lg={4} className="mb-3">
              <Form.Label>{t("searchLabel")}</Form.Label>
              <Form.Control
                type="text"
                value={searchTerm}
                placeholder={t("searchPlaceholder")}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col lg={3} className="mb-3">
              <Form.Label>{t("filterRoleLabel")}</Form.Label>
              <Form.Select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
              >
                <option value="all">{t("allRoles")}</option>
                <option value="user">{t("members")}</option>
                <option value="consultant">{t("consultants")}</option>
                <option value="manager">{t("managers")}</option>
                <option value="staff">{t("staff")}</option>
              </Form.Select>
            </Col>

            <Col lg={3} className="mb-3">
              <Form.Label>{t("filterStatusLabel")}</Form.Label>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">{t("allStatus")}</option>
                <option value="ACTIVE">{t("active")}</option>
                <option value="INACTIVE">{t("inactive")}</option>
              </Form.Select>
            </Col>

            <Col lg={2} className="mb-3 d-flex align-items-end">
              <Button
                variant="success"
                onClick={exportToExcel}
                className="w-100"
              >
                <FaFileExcel className="me-2" />
                {t("exportExcel")}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          {t("userList")} <Badge bg="secondary">{filteredUsers.length}</Badge>
        </Card.Header>
        <Card.Body style={{ padding: 0 }}>
          <div
            style={{
              maxHeight: "500px",
              overflowY: "auto",
              position: "relative",
            }}
          >
            <Table
              bordered
              hover
              className="table-sticky-header"
              style={{ marginBottom: 0 }}
            >
              <thead>
                <tr>
                  <th>{t("stt")}</th>
                  <th>{t("username")}</th>
                  <th>{t("fullName")}</th>
                  <th>{t("email")}</th>
                  <th>{t("role")}</th>
                  <th>{t("status")}</th>
                  <th>{t("gender")}</th>
                  <th>{t("ageGroup")}</th>
                  <th>{t("dob")}</th>
                  <th>{t("phone")}</th>
                  <th>{t("job")}</th>
                  <th>{t("address")}</th>
                  <th>{t("createdAt")}</th>
                  <th>{t("updatedAt")}</th>
                  <th>{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr key={user.username}>
                    <td>{index + 1}</td>
                    <td>{user.username}</td>
                    <td>{user.fullName}</td>
                    <td>{user.email}</td>
                    <td>
                      <Badge bg="info">{user.role}</Badge>
                    </td>
                    <td>
                      <Badge
                        bg={user.status === "ACTIVE" ? "success" : "danger"}
                      >
                        {user.status}
                      </Badge>
                    </td>
                    <td>{user.gender}</td>
                    <td>{user.ageGroup}</td>
                    <td>{user.dob}</td>
                    <td>{user.phoneNumber}</td>
                    <td>{user.job}</td>
                    <td>{user.address}</td>
                    <td>{new Date(user.createdAt).toLocaleString()}</td>
                    <td>{new Date(user.updatedAt).toLocaleString()}</td>
                    <td>
                      <Button
                        size="sm"
                        variant={
                          user.status === "ACTIVE"
                            ? "outline-warning"
                            : "outline-success"
                        }
                        onClick={() => handleToggleStatus(user.username)}
                      >
                        {user.status === "ACTIVE" ? <FaLock /> : <FaUnlock />}
                      </Button>{" "}
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDeleteUser(user.username)}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default UserManagement;
