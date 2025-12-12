// src/pages/UserManagement.jsx

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import Swal from "sweetalert2";

const UserManagement = () => {
  const API_URL = process.env.REACT_APP_SERVER_URL;
  const currentUser = useSelector((state) => state.users.user);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Add form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newActive, setNewActive] = useState(true);

  // Edit form state
  const [editUserId, setEditUserId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editActive, setEditActive] = useState(true);

  // Simple email validator
  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const resetAddForm = () => {
    setNewName("");
    setNewEmail("");
    setNewPassword("");
    setNewActive(true);
  };

  const resetEditForm = () => {
    setEditUserId(null);
    setEditName("");
    setEditEmail("");
    setEditActive(true);
  };

  // 🔐 Only owner acts as admin here
  const isAdmin = currentUser && currentUser.role === "owner";

  // Fetch ALL users for admin/owner view (owner + staff + customers)
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/users`);
      const data = await res.json();
      if (!Array.isArray(data)) {
        setUsers([]);
      } else {
        setUsers(data); // ✅ show all roles
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      Swal.fire(
        "Error",
        "Failed to load users. Please try again later.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_URL, isAdmin]);

  // Add new user (admin create staff only)
  const handleAddUser = async () => {
    if (!newName.trim()) {
      Swal.fire("Validation", "Please enter a name.", "warning");
      return;
    }
    if (!newEmail.trim() || !isValidEmail(newEmail.trim())) {
      Swal.fire("Validation", "Please enter a valid email.", "warning");
      return;
    }
    if (!newPassword.trim() || newPassword.trim().length < 6) {
      Swal.fire(
        "Validation",
        "Password must be at least 6 characters.",
        "warning"
      );
      return;
    }

    const payload = {
      name: newName.trim(),
      email: newEmail.trim(),
      password: newPassword.trim(),
      role: "staff", // 🔒 HARD-CODED staff
      isActive: newActive,
    };

    try {
      const res = await fetch(`${API_URL}/api/users/admin-create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        Swal.fire(
          "Error",
          data?.message || "Failed to create user.",
          "error"
        );
        return;
      }

      Swal.fire("Success", "Staff user created successfully.", "success");
      setShowAddModal(false);
      resetAddForm();
      fetchUsers();
    } catch (err) {
      console.error("Add user error:", err);
      Swal.fire("Error", "Failed to create user.", "error");
    }
  };

  // Open edit modal with selected user (only intended for staff)
  const openEditModal = (user) => {
    // You can restrict edit only for staff if you want:
    // if (user.role !== "staff") return;
    setEditUserId(user._id);
    setEditName(user.name || "");
    setEditEmail(user.email || "");
    setEditActive(user.isActive !== false);
    setShowEditModal(true);
  };

  // Save edited user (still staff)
  const handleSaveEditUser = async () => {
    if (!editName.trim()) {
      Swal.fire("Validation", "Please enter a name.", "warning");
      return;
    }
    if (!editEmail.trim() || !isValidEmail(editEmail.trim())) {
      Swal.fire("Validation", "Please enter a valid email.", "warning");
      return;
    }

    const payload = {
      name: editName.trim(),
      email: editEmail.trim(),
      role: "staff", // 🔒 keep as staff
      isActive: editActive,
    };

    try {
      const res = await fetch(`${API_URL}/api/users/${editUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        Swal.fire(
          "Error",
          data?.message || "Failed to update user.",
          "error"
        );
        return;
      }

      Swal.fire("Success", "Staff user updated successfully.", "success");
      setShowEditModal(false);
      resetEditForm();
      fetchUsers();
    } catch (err) {
      console.error("Update user error:", err);
      Swal.fire("Error", "Failed to update user.", "error");
    }
  };

  // Toggle active / inactive
  const handleToggleActive = async (user) => {
    const newStatus = !user.isActive;

    const confirmResult = await Swal.fire({
      title: newStatus ? "Activate this user?" : "Deactivate this user?",
      text: newStatus
        ? "User will be able to login."
        : "User will be blocked from logging in.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0A3D91",
      cancelButtonColor: "#EF4444",
      confirmButtonText: newStatus ? "Yes, activate" : "Yes, deactivate",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/api/users/${user._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        Swal.fire(
          "Error",
          data?.message || "Failed to update status.",
          "error"
        );
        return;
      }

      Swal.fire(
        "Success",
        `User has been ${newStatus ? "activated" : "deactivated"}.`,
        "success"
      );
      fetchUsers();
    } catch (err) {
      console.error("Toggle active error:", err);
      Swal.fire("Error", "Failed to update status.", "error");
    }
  };

  // Role badge styling text
  const getRoleLabel = (role) => {
    if (role === "owner") return "Owner";
    if (role === "staff") return "Staff";
    return "Customer";
  };

  const roleBadgeStyle = (role) => {
    if (role === "owner") {
      return {
        ...styles.roleBadge,
        backgroundColor: "#FEF3C7",
        color: "#92400E",
      };
    }
    if (role === "staff") {
      return styles.roleBadge;
    }
    // customer
    return {
      ...styles.roleBadge,
      backgroundColor: "#E5E7EB",
      color: "#374151",
    };
  };

  return (
    <>
      <Navbar />
      <div style={styles.page}>
        <div style={styles.wrapper}>
          <div style={styles.headerRow}>
            <div>
              <p style={styles.kicker}>Admin · User Management</p>
              <h1 style={styles.title}>Users &amp; Staff Access</h1>
              <p style={styles.subtitle}>
                View all users of the system, add new staff accounts, and control who has access.
              </p>
            </div>
            {isAdmin && (
              <button
                style={styles.primaryButton}
                onClick={() => {
                  resetAddForm();
                  setShowAddModal(true);
                }}
              >
                + Add staff user
              </button>
            )}
          </div>

          {!isAdmin && (
            <div style={styles.accessBox}>
              <h3 style={styles.accessTitle}>Admin access required</h3>
              <p style={styles.accessText}>
                This page is only available to admin users. Please login with an admin
                (owner) account to manage staff.
              </p>
            </div>
          )}

          {isAdmin && (
            <div style={styles.card}>
              {loading ? (
                <div style={styles.loadingBox}>Loading users…</div>
              ) : users.length === 0 ? (
                <div style={styles.emptyBox}>
                  <p style={styles.emptyIcon}>👥</p>
                  <p style={styles.emptyTitle}>No users yet</p>
                  <p style={styles.emptyText}>
                    As users register and you add staff, they will appear in this list.
                  </p>
                </div>
              ) : (
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Name</th>
                        <th style={styles.th}>Email</th>
                        <th style={styles.th}>Role</th>
                        <th style={styles.th}>Status</th>
                        <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => {
                        const isOwnerRow = u.role === "owner";
                        return (
                          <tr key={u._id}>
                            <td style={styles.td}>{u.name || "-"}</td>
                            <td style={styles.td}>{u.email || "-"}</td>
                            <td style={styles.td}>
                              <span style={roleBadgeStyle(u.role)}>
                                {getRoleLabel(u.role)}
                              </span>
                            </td>
                            <td style={styles.td}>
                              <span
                                style={
                                  u.isActive !== false
                                    ? styles.statusActive
                                    : styles.statusInactive
                                }
                              >
                                {u.isActive !== false ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td style={{ ...styles.td, textAlign: "right" }}>
                              {/* For safety, you can disable editing/deactivating the owner */}
                              {!isOwnerRow && (
                                <>
                                  <button
                                    style={styles.smallButton}
                                    onClick={() => {
                                      if (u.role !== "staff") {
                                        // Optional: only allow edit for staff
                                        Swal.fire(
                                          "Notice",
                                          "Only staff users can be edited from this panel.",
                                          "info"
                                        );
                                        return;
                                      }
                                      openEditModal(u);
                                    }}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    style={
                                      u.isActive !== false
                                        ? styles.smallDangerButton
                                        : styles.smallActivateButton
                                    }
                                    onClick={() => handleToggleActive(u)}
                                  >
                                    {u.isActive !== false ? "Deactivate" : "Activate"}
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ADD USER MODAL */}
        {showAddModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>Add staff user</h3>
                <button
                  style={styles.modalClose}
                  onClick={() => setShowAddModal(false)}
                >
                  ×
                </button>
              </div>

              <div style={styles.modalField}>
                <label style={styles.label}>Full name</label>
                <input
                  type="text"
                  style={styles.input}
                  placeholder="Name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div style={styles.modalField}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  style={styles.input}
                  placeholder="user@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>

              <div style={styles.modalField}>
                <label style={styles.label}>Password</label>
                <input
                  type="password"
                  style={styles.input}
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div style={styles.modalField}>
                <label style={styles.label}>Role</label>
                <div style={styles.fixedRoleBadge}>Staff</div>
              </div>

              <div style={styles.modalField}>
                <label style={styles.label}>Status</label>
                <div style={styles.switchRow}>
                  <input
                    id="newActive"
                    type="checkbox"
                    checked={newActive}
                    onChange={(e) => setNewActive(e.target.checked)}
                  />
                  <label htmlFor="newActive" style={styles.switchLabel}>
                    {newActive ? "Active" : "Inactive"}
                  </label>
                </div>
              </div>

              <button style={styles.modalPrimaryBtn} onClick={handleAddUser}>
                Create staff user
              </button>
              <button
                style={styles.modalSecondaryBtn}
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* EDIT USER MODAL */}
        {showEditModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>Edit staff user</h3>
                <button
                  style={styles.modalClose}
                  onClick={() => {
                    setShowEditModal(false);
                    resetEditForm();
                  }}
                >
                  ×
                </button>
              </div>

              <div style={styles.modalField}>
                <label style={styles.label}>Full name</label>
                <input
                  type="text"
                  style={styles.input}
                  placeholder="Name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div style={styles.modalField}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  style={styles.input}
                  placeholder="user@example.com"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </div>

              <div style={styles.modalField}>
                <label style={styles.label}>Role</label>
                <div style={styles.fixedRoleBadge}>Staff</div>
              </div>

              <div style={styles.modalField}>
                <label style={styles.label}>Status</label>
                <div style={styles.switchRow}>
                  <input
                    id="editActive"
                    type="checkbox"
                    checked={editActive}
                    onChange={(e) => setEditActive(e.target.checked)}
                  />
                  <label htmlFor="editActive" style={styles.switchLabel}>
                    {editActive ? "Active" : "Inactive"}
                  </label>
                </div>
              </div>

              <button style={styles.modalPrimaryBtn} onClick={handleSaveEditUser}>
                Save changes
              </button>
              <button
                style={styles.modalSecondaryBtn}
                onClick={() => {
                  setShowEditModal(false);
                  resetEditForm();
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

/* ======================
   STYLES – HOTEL MATE ADMIN THEME
   ====================== */

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#E8F1FF",
    backgroundImage:
      "radial-gradient(circle at top left, rgba(37,99,235,0.16), transparent 55%), " +
      "radial-gradient(circle at bottom right, rgba(59,130,246,0.18), transparent 55%)",
    color: "#0B1A33",
    paddingBottom: "40px",
  },
  wrapper: {
    maxWidth: "1140px",
    margin: "0 auto",
    padding: "24px 20px 32px",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "18px",
    alignItems: "center",
    marginBottom: "16px",
    flexWrap: "wrap",
  },
  kicker: {
    margin: 0,
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "#1D4ED8",
  },
  title: {
    margin: "4px 0 4px",
    fontSize: "24px",
    fontWeight: 800,
    color: "#0B1A33",
  },
  subtitle: {
    margin: 0,
    fontSize: "13px",
    color: "#4B5563",
  },
  primaryButton: {
    padding: "9px 16px",
    borderRadius: "999px",
    border: "none",
    backgroundImage: "linear-gradient(135deg, #0A3D91, #1E5FE0)",
    color: "#F9FAFF",
    fontWeight: 700,
    fontSize: "13px",
    cursor: "pointer",
    boxShadow: "0 10px 22px rgba(37,99,235,0.55)",
    whiteSpace: "nowrap",
  },
  card: {
    borderRadius: "20px",
    padding: "16px 14px 18px",
    backgroundColor: "#FFFFFF",
    border: "1px solid rgba(191,219,254,0.95)",
    boxShadow: "0 18px 40px rgba(15,23,42,0.12)",
  },
  accessBox: {
    marginTop: "10px",
    borderRadius: "16px",
    padding: "16px 16px",
    backgroundColor: "#FEF2F2",
  },
  accessTitle: {
    margin: "0 0 4px",
    fontSize: "15px",
    fontWeight: 700,
    color: "#B91C1C",
  },
  accessText: {
    margin: 0,
    fontSize: "13px",
    color: "#7F1D1D",
  },
  loadingBox: {
    padding: "18px 10px",
    textAlign: "center",
    fontSize: "13px",
    color: "#4B5563",
  },
  emptyBox: {
    padding: "24px 10px",
    textAlign: "center",
  },
  emptyIcon: {
    fontSize: "30px",
    margin: 0,
  },
  emptyTitle: {
    margin: "8px 0 4px",
    fontSize: "16px",
    fontWeight: 700,
    color: "#0B1A33",
  },
  emptyText: {
    margin: 0,
    fontSize: "13px",
    color: "#4B5563",
  },
  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "6px",
  },
  th: {
    textAlign: "left",
    padding: "8px 8px",
    fontSize: "12px",
    fontWeight: 700,
    color: "#6B7280",
    // borderBottom: "1px solid "#E5E7EB",
  },
  td: {
    padding: "8px 8px",
    fontSize: "13px",
    color: "#111827",
    borderBottom: "1px solid #F3F4F6",
    verticalAlign: "middle",
  },
  roleBadge: {
    display: "inline-block",
    padding: "3px 8px",
    borderRadius: "999px",
    backgroundColor: "#EFF6FF",
    color: "#1D4ED8",
    fontSize: "11px",
    fontWeight: 600,
  },
  statusActive: {
    display: "inline-block",
    padding: "3px 8px",
    borderRadius: "999px",
    backgroundColor: "#ECFDF3",
    color: "#15803D",
    fontSize: "11px",
    fontWeight: 600,
  },
  statusInactive: {
    display: "inline-block",
    padding: "3px 8px",
    borderRadius: "999px",
    backgroundColor: "#FEF2F2",
    color: "#B91C1C",
    fontSize: "11px",
    fontWeight: 600,
  },
  smallButton: {
    padding: "5px 10px",
    borderRadius: "999px",
    border: "1px solid #CBD5F5",
    backgroundColor: "#EFF6FF",
    color: "#1D4ED8",
    fontSize: "11px",
    fontWeight: 600,
    cursor: "pointer",
    marginLeft: "4px",
  },
  smallDangerButton: {
    padding: "5px 10px",
    borderRadius: "999px",
    border: "1px solid #FCA5A5",
    backgroundColor: "#FEF2F2",
    color: "#B91C1C",
    fontSize: "11px",
    fontWeight: 600,
    cursor: "pointer",
    marginLeft: "6px",
  },
  smallActivateButton: {
    padding: "5px 10px",
    borderRadius: "999px",
    // border: "1px solid "#BBF7D0",
    backgroundColor: "#ECFDF3",
    color: "#15803D",
    fontSize: "11px",
    fontWeight: 600,
    cursor: "pointer",
    marginLeft: "6px",
  },

  // Modals
  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(15,23,42,0.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "16px",
  },
  modal: {
    width: "100%",
    maxWidth: "420px",
    borderRadius: "20px",
    padding: "18px 20px 18px",
    backgroundColor: "#FFFFFF",
    boxShadow: "0 24px 60px rgba(15,23,42,0.3)",
    border: "1px solid rgba(191,219,254,0.95)",
    color: "#0B1A33",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    marginBottom: "10px",
  },
  modalTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 800,
    color: "#0B1A33",
  },
  modalClose: {
    border: "none",
    background: "transparent",
    fontSize: "20px",
    cursor: "pointer",
    color: "#6B7280",
  },
  modalField: {
    marginTop: "8px",
  },
  label: {
    display: "block",
    marginBottom: "4px",
    fontSize: "12px",
    fontWeight: 600,
    color: "#0B1A33",
  },
  input: {
    width: "100%",
    padding: "8px 10px",
    borderRadius: "10px",
    border: "1px solid #CBD5F5",
    fontSize: "13px",
    backgroundColor: "#F9FAFB",
    color: "#0B1A33",
    outline: "none",
    boxSizing: "border-box",
  },
  fixedRoleBadge: {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: "999px",
    backgroundColor: "#EFF6FF",
    color: "#1D4ED8",
    fontSize: "11px",
    fontWeight: 600,
    marginTop: "4px",
  },
  switchRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginTop: "2px",
  },
  switchLabel: {
    fontSize: "12px",
    color: "#4B5563",
  },
  modalPrimaryBtn: {
    width: "100%",
    marginTop: "14px",
    padding: "10px",
    borderRadius: "999px",
    border: "none",
    backgroundImage: "linear-gradient(135deg, #0A3D91, #1E5FE0)",
    color: "#F9FAFF",
    fontWeight: 800,
    fontSize: "13px",
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(37,99,235,0.55)",
  },
  modalSecondaryBtn: {
    width: "100%",
    marginTop: "8px",
    padding: "9px",
    borderRadius: "999px",
    backgroundColor: "transparent",
    color: "#0A3D91",
    fontWeight: 600,
    fontSize: "13px",
    cursor: "pointer",
  },
};

export default UserManagement;
