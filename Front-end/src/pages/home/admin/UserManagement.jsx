import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Form,
  Button,
  Row,
  Col,
  Badge,
  Modal,
} from "react-bootstrap";
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaLock,
  FaUnlock,
  FaUser,
  FaFileExcel,
} from "react-icons/fa";
import axios from "axios";
import "./admin.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useTranslation } from "react-i18next";

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [users, setUsers] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    username: "",
    password: "",
    rePassword: "",
    role: "MEMBER",
  });
  const [createLoading, setCreateLoading] = useState(false);
  const token = localStorage.getItem("token");
  const { t } = useTranslation("userManagement");
  const TOAST_CONTAINER_ID = "user-toast";
  const [showUpdateRoleModal, setShowUpdateRoleModal] = useState(false);
  const [currentUserToUpdate, setCurrentUserToUpdate] = useState(null); // User object being updated
  const [newRole, setNewRole] = useState(""); // New role selected in the modal
  const [updateRoleLoading, setUpdateRoleLoading] = useState(false); // Loading state for update operation

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

      const successMessage = t("successToggle");
      toast.success(successMessage, { containerId: TOAST_CONTAINER_ID });
    } catch (error) {
      console.error("Failed to toggle status:", error);
      const failMessage = t("failToggle");
      toast.error(failMessage, { containerId: TOAST_CONTAINER_ID });
    } finally {
      setToggleInProgress(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!currentUserToUpdate || !newRole) {
      toast.error(
        t("selectUserAndRole") || "Please select a user and a new role.",
        { containerId: TOAST_CONTAINER_ID }
      );
      return;
    }

    setUpdateRoleLoading(true);
    try {
      await axios.put(
        `http://localhost:8080/api/user/${currentUserToUpdate.username}/role`,
        newRole, // Send the new role directly as the request body
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json", // Important for sending raw string as body
          },
        }
      );

      toast.success(
        t("updateRoleSuccess") || "User role updated successfully!",
        { containerId: TOAST_CONTAINER_ID }
      );
      setShowUpdateRoleModal(false); // Close the modal
      setNewRole(""); // Reset the selected role

      // Refresh users list after successful update
      // You can re-fetch all users or update the specific user in the state
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
        }
      };
      fetchUsers();
    } catch (error) {
      console.error("Failed to update user role:", error);
      const errorMessage =
        error.response?.data?.message ||
        t("updateRoleFailed") ||
        "Failed to update user role.";
      toast.error(errorMessage, { containerId: TOAST_CONTAINER_ID });
    } finally {
      setUpdateRoleLoading(false);
    }
  };

  const handleOpenUpdateRoleModal = (user) => {
    setCurrentUserToUpdate(user);
    setNewRole(user.role); // Pre-fill with current role
    setShowUpdateRoleModal(true);
  };

  const handleCloseUpdateRoleModal = () => {
    setShowUpdateRoleModal(false);
    setCurrentUserToUpdate(null);
    setNewRole("");
  };

  const handleDeleteUser = async (username) => {
    const confirmMessage = t("confirmDelete", { username });
    if (!window.confirm(confirmMessage)) {
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

      const successMessage = t("successDelete");
      toast.success(successMessage, { containerId: TOAST_CONTAINER_ID });
    } catch (error) {
      console.error("Failed to delete user:", error);
      const failMessage = t("failDelete");
      toast.error(failMessage, { containerId: TOAST_CONTAINER_ID });
    }
  };

  const handleCreateUser = async () => {
    // Validate form
    if (
      !createForm.username ||
      !createForm.password ||
      !createForm.rePassword
    ) {
      toast.error(t("fillAllFields") || "Please fill in all fields", {
        containerId: TOAST_CONTAINER_ID,
      });
      return;
    }

    const usernameRegex = /^[\w\s-]+$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,255}$/;

    if (!usernameRegex.test(createForm.username)) {
      toast.error(
        t("invalidUsername") ||
          "Username can only contain letters, numbers, spaces, and hyphens!",
        {
          containerId: TOAST_CONTAINER_ID,
        }
      );
      return;
    }

    if (!passwordRegex.test(createForm.password)) {
      toast.error(
        t("invalidPassword") ||
          "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
        { containerId: TOAST_CONTAINER_ID }
      );
      return;
    }

    if (createForm.password !== createForm.rePassword) {
      toast.error(t("passwordMismatch") || "Passwords do not match", {
        containerId: TOAST_CONTAINER_ID,
      });
      return;
    }

    setCreateLoading(true);
    try {
      const userData = {
        username: createForm.username,
        password: createForm.password,
        role: createForm.role,
      };

      await axios.post(
        "http://localhost:8080/api/user/admin/create",
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(t("createUserSuccess") || "User created successfully", {
        containerId: TOAST_CONTAINER_ID,
      });
      setShowCreateModal(false);
      setCreateForm({
        username: "",
        password: "",
        rePassword: "",
        role: "MEMBER",
      });

      // Refresh users list
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
        }
      };

      fetchUsers();
    } catch (error) {
      console.error("Failed to create user:", error);
      const errorMessage =
        error.response?.data?.message ||
        t("createUserFailed") ||
        "Failed to create user";
      toast.error(errorMessage, { containerId: TOAST_CONTAINER_ID });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setCreateForm({
      username: "",
      password: "",
      rePassword: "",
      role: "MEMBER",
    });
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
            <Col lg={3} className="mb-3">
              <Form.Label>{t("searchLabel")}</Form.Label>
              <Form.Control
                type="text"
                value={searchTerm}
                placeholder={t("searchPlaceholder")}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col lg={2} className="mb-3">
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

            <Col lg={2} className="mb-3">
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

            <Col lg={2} className="mb-3">
              <Button
                variant="primary"
                onClick={() => setShowCreateModal(true)}
                className="w-100 h-100 d-flex align-items-center justify-content-center"
              >
                <FaUser className="me-2" />
                {t("createUser")}
              </Button>
            </Col>

            <Col lg={2} className="mb-3">
              <Button
                variant="success"
                onClick={exportToExcel}
                className="w-100 h-100 d-flex align-items-center justify-content-center mh-48"
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
                        variant="outline-info" // Or another suitable color
                        onClick={() => handleOpenUpdateRoleModal(user)}
                        className="me-2" // Add some margin
                      >
                        <FaEdit /> {t("updateRole")}
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

      {/* Create User Modal */}
      <Modal show={showCreateModal} onHide={handleCloseCreateModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaUser className="me-2" />
            {t("createUser") || "Create User"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>{t("username") || "Username"} *</Form.Label>
              <Form.Control
                type="text"
                value={createForm.username}
                onChange={(e) =>
                  setCreateForm({ ...createForm, username: e.target.value })
                }
                placeholder={t("enterUsername") || "Enter username"}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t("password") || "Password"} *</Form.Label>
              <Form.Control
                type="password"
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm({ ...createForm, password: e.target.value })
                }
                placeholder={t("enterPassword") || "Enter password"}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                {t("rePassword") || "Re-enter Password"} *
              </Form.Label>
              <Form.Control
                type="password"
                value={createForm.rePassword}
                onChange={(e) =>
                  setCreateForm({ ...createForm, rePassword: e.target.value })
                }
                placeholder={t("reEnterPassword") || "Re-enter password"}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t("role") || "Role"} *</Form.Label>
              <Form.Select
                value={createForm.role}
                onChange={(e) =>
                  setCreateForm({ ...createForm, role: e.target.value })
                }
              >
                <option value="MEMBER">{t("member") || "Member"}</option>
                <option value="CONSULTANT">
                  {t("consultant") || "Consultant"}
                </option>
                <option value="STAFF">{t("staff") || "Staff"}</option>
                <option value="MANAGER">{t("manager") || "Manager"}</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary mh-48" onClick={handleCloseCreateModal}>
            {t("cancel") || "Cancel"}
          </Button>
          <Button
            variant="primary"
            onClick={handleCreateUser}
            disabled={createLoading}
          >
            {createLoading
              ? t("creating") || "Creating..."
              : t("createUser") || "Create User"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Update User Role Modal */}
      <Modal
        show={showUpdateRoleModal}
        onHide={handleCloseUpdateRoleModal}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaEdit className="me-2" />
            {t("updateRole") || "Update User Role"}{" "}
          </Modal.Title>{" "}
        </Modal.Header>{" "}
        <Modal.Body>
          {" "}
          {currentUserToUpdate && (
            <p>
              {t("updateRoleFor") || "Updating role for:"}{" "}
              <strong>{currentUserToUpdate.username}</strong> (
              {t("currentRole") || "Current"}: {currentUserToUpdate.role}){" "}
            </p>
          )}{" "}
          <Form.Group className="mb-3">
            <Form.Label>{t("newRole") || "New Role"} *</Form.Label>{" "}
            <Form.Select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            >
              {" "}
              <option value="MEMBER">{t("member") || "Member"}</option>{" "}
              <option value="CONSULTANT">
                {t("consultant") || "Consultant"}{" "}
              </option>{" "}
              <option value="STAFF">{t("staff") || "Staff"}</option>
              <option value="MANAGER">{t("manager") || "Manager"}</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseUpdateRoleModal}>
            {t("cancel") || "Cancel"}
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateRole}
            disabled={updateRoleLoading}
          >
            {updateRoleLoading
              ? t("updating") || "Updating..."
              : t("update") || "Update"}
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        containerId={TOAST_CONTAINER_ID}
      />
    </div>
  );
};

export default UserManagement;
