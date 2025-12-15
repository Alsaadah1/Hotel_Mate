// src/pages/UserManagement.jsx

import React, { useEffect, useState, useMemo } from "react";
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
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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
      Swal.fire("Error", "Failed to load users. Please try again later.", "error");
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
      Swal.fire("Validation", "Password must be at least 6 characters.", "warning");
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
        Swal.fire("Error", data?.message || "Failed to create user.", "error");
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
        Swal.fire("Error", data?.message || "Failed to update user.", "error");
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
    const newStatus = !(user.isActive !== false);

    const confirmResult = await Swal.fire({
      title: newStatus ? "Activate this user?" : "Deactivate this user?",
      text: newStatus
        ? "User will be able to login."
        : "User will be blocked from logging in.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#d4af37",
      cancelButtonColor: "#7a4a2e",
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
        Swal.fire("Error", data?.message || "Failed to update status.", "error");
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

  // Role badge label
  const getRoleLabel = (role) => {
    if (role === "owner") return "Owner";
    if (role === "staff") return "Staff";
    return "Customer";
  };

  const roleBadgeStyle = (role) => {
    if (role === "owner") {
      return { ...styles.roleBadge, ...styles.roleOwner };
    }
    if (role === "staff") {
      return { ...styles.roleBadge, ...styles.roleStaff };
    }
    return { ...styles.roleBadge, ...styles.roleCustomer };
  };

  const totalUsers = users.length;
  const staffCount = useMemo(
    () => users.filter((u) => (u.role || "").toLowerCase() === "staff").length,
    [users]
  );
  const customerCount = useMemo(
    () => users.filter((u) => (u.role || "").toLowerCase() === "customer").length,
    [users]
  );

  return (
    <>
      <Navbar />

      <div style={styles.page}>
        <div style={styles.wrapper}>
          {/* Header band */}
          <header style={styles.headerBand}>
            <div>
              <p style={styles.headerKicker}>Hotel Mate · Admin</p>
              <h1 style={styles.title}>User management</h1>
              <p style={styles.subtitle}>
                View all accounts, add staff, and control who can log in.
              </p>
            </div>

            {isAdmin && (
              <button
                style={styles.primaryButton}
                onClick={() => {
                  resetAddForm();
                  setShowAddModal(true);
                }}
                type="button"
              >
                <span style={styles.primaryButtonIcon}>＋</span>
                <span>Add staff user</span>
              </button>
            )}
          </header>

          {!isAdmin && (
            <div style={styles.noticeBox}>
              <h3 style={styles.noticeTitle}>Admin access required</h3>
              <p style={styles.noticeText}>
                This page is only available to admin users. Please login with an admin
                (owner) account to manage staff.
              </p>
            </div>
          )}

          {isAdmin && (
            <>
              {/* Summary cards */}
              <section style={styles.cardsGrid}>
                <div style={{ ...styles.card, ...styles.cardTotal }}>
                  <p style={styles.cardLabel}>Total users</p>
                  <div style={styles.metric}>{totalUsers}</div>
                </div>
                <div style={{ ...styles.card, ...styles.cardStaff }}>
                  <p style={styles.cardLabel}>Staff</p>
                  <div style={styles.metric}>{staffCount}</div>
                </div>
                <div style={{ ...styles.card, ...styles.cardCustomers }}>
                  <p style={styles.cardLabel}>Customers</p>
                  <div style={styles.metric}>{customerCount}</div>
                </div>
                <div style={{ ...styles.card, ...styles.cardHint }}>
                  <p style={styles.cardLabel}>Tip</p>
                  <div style={styles.tipText}>
                    Keep staff accounts active only while they are working.
                  </div>
                </div>
              </section>

              {/* Table panel */}
              <section style={styles.panel}>
                <div style={styles.panelHeaderRow}>
                  <div>
                    <h2 style={styles.panelTitle}>All accounts</h2>
                    <p style={styles.panelSubtitle}>
                      Owner account is protected from edits and status changes.
                    </p>
                  </div>
                  <div style={styles.countChip}>
                    <span style={styles.countChipLabel}>Records</span>
                    <span style={styles.countChipValue}>{users.length}</span>
                  </div>
                </div>

                {loading ? (
                  <div style={styles.loadingBox}>Loading users…</div>
                ) : users.length === 0 ? (
                  <div style={styles.emptyBox}>
                    <p style={styles.emptyIcon}>👥</p>
                    <p style={styles.emptyTitle}>No users yet</p>
                    <p style={styles.emptyText}>
                      As users register and you add staff, they will appear here.
                    </p>
                  </div>
                ) : (
                  <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Name</th>
                          <th style={styles.th}>Email</th>
                          <th style={styles.thCenter}>Role</th>
                          <th style={styles.thCenter}>Status</th>
                          <th style={{ ...styles.th, textAlign: "right" }}>
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {users.map((u, idx) => {
                          const isOwnerRow = (u.role || "").toLowerCase() === "owner";
                          const active = u.isActive !== false;

                          return (
                            <tr
                              key={u._id}
                              style={idx % 2 === 0 ? styles.rowEven : styles.rowOdd}
                            >
                              <td style={styles.td}>{u.name || "-"}</td>
                              <td style={styles.td}>{u.email || "-"}</td>
                              <td style={styles.tdCenter}>
                                <span style={roleBadgeStyle((u.role || "").toLowerCase())}>
                                  {getRoleLabel((u.role || "").toLowerCase())}
                                </span>
                              </td>
                              <td style={styles.tdCenter}>
                                <span style={active ? styles.statusActive : styles.statusInactive}>
                                  {active ? "Active" : "Inactive"}
                                </span>
                              </td>
                              <td style={{ ...styles.td, textAlign: "right" }}>
                                {!isOwnerRow ? (
                                  <>
                                    <button
                                      style={styles.smallButton}
                                      type="button"
                                      onClick={() => {
                                        if ((u.role || "").toLowerCase() !== "staff") {
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
                                        active
                                          ? styles.smallDangerButton
                                          : styles.smallActivateButton
                                      }
                                      type="button"
                                      onClick={() => handleToggleActive(u)}
                                    >
                                      {active ? "Deactivate" : "Activate"}
                                    </button>
                                  </>
                                ) : (
                                  <span style={styles.ownerLock}>Protected</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}
        </div>

        {/* ADD USER MODAL */}
        {showAddModal && (
          <div style={styles.modalOverlay} role="dialog" aria-modal="true">
            <div style={styles.modal}>
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>Add staff user</h3>
                <button
                  style={styles.modalClose}
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  aria-label="Close"
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

              <div style={styles.modalFoot}>
                <button
                  style={styles.modalSecondaryBtn}
                  type="button"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button style={styles.modalPrimaryBtn} type="button" onClick={handleAddUser}>
                  Create staff user
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT USER MODAL */}
        {showEditModal && (
          <div style={styles.modalOverlay} role="dialog" aria-modal="true">
            <div style={styles.modal}>
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>Edit staff user</h3>
                <button
                  style={styles.modalClose}
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    resetEditForm();
                  }}
                  aria-label="Close"
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

              <div style={styles.modalFoot}>
                <button
                  style={styles.modalSecondaryBtn}
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    resetEditForm();
                  }}
                >
                  Cancel
                </button>
                <button
                  style={styles.modalPrimaryBtn}
                  type="button"
                  onClick={handleSaveEditUser}
                >
                  Save changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

/* ======================
   STYLES – BROWN/GOLD THEME + FIXED BUGS
   ====================== */

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#faf6f1",
    backgroundImage:
      "radial-gradient(circle at top right, rgba(226,184,44,0.28), transparent 55%), " +
      "radial-gradient(circle at bottom left, rgba(212,175,55,0.20), transparent 55%)",
    color: "#3d2a14",
    paddingBottom: 40,
  },
  wrapper: {
    maxWidth: 1120,
    margin: "0 auto",
    padding: "22px 16px 40px",
  },

  headerBand: {
    marginBottom: 18,
    padding: "16px 16px 14px",
    borderRadius: 18,
    border: "1px solid rgba(212,175,55,0.35)",
    backgroundImage:
      "radial-gradient(circle at top, rgba(245,210,122,0.28), transparent 55%), " +
      "linear-gradient(145deg, #8a5a24, #5e3418)",
    boxShadow: "0 18px 38px rgba(61,42,20,0.18)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    color: "#fffaf3",
    flexWrap: "wrap",
  },
  headerKicker: {
    margin: 0,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.16em",
    color: "#f5d27a",
    fontWeight: 900,
  },
  title: {
    margin: "4px 0 4px",
    fontSize: 22,
    fontWeight: 900,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "#fffaf3",
  },
  subtitle: {
    margin: 0,
    fontSize: 13,
    color: "#f3e6d8",
    opacity: 0.95,
    fontWeight: 700,
    maxWidth: 680,
  },

  primaryButton: {
    padding: "10px 16px",
    borderRadius: 999,
    border: "none",
    backgroundImage: "linear-gradient(135deg,#7a4a2e,#d4af37)",
    color: "#fffaf3",
    fontWeight: 900,
    fontSize: 13,
    cursor: "pointer",
    boxShadow: "0 14px 32px rgba(15,23,42,0.18)",
    whiteSpace: "nowrap",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },
  primaryButtonIcon: { fontSize: 16, lineHeight: "16px" },

  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 14,
    marginBottom: 20,
  },
  card: {
    borderRadius: 16,
    padding: "14px 14px 12px",
    border: "1px solid rgba(212,175,55,0.22)",
    boxShadow: "0 10px 22px rgba(61,42,20,0.10)",
    color: "#3d2a14",
    backgroundColor: "#ffffff",
  },
  cardTotal: {
    backgroundImage:
      "radial-gradient(circle at top, rgba(212,175,55,0.18), transparent 55%), " +
      "linear-gradient(145deg, #ffffff, #fffaf3)",
  },
  cardStaff: {
    backgroundImage:
      "radial-gradient(circle at top, rgba(245,210,122,0.20), transparent 55%), " +
      "linear-gradient(145deg, #ffffff, #fff7e6)",
  },
  cardCustomers: {
    backgroundImage:
      "radial-gradient(circle at top, rgba(148,163,184,0.16), transparent 55%), " +
      "linear-gradient(145deg, #ffffff, #f9fafb)",
  },
  cardHint: {
    backgroundImage:
      "radial-gradient(circle at top, rgba(34,197,94,0.10), transparent 55%), " +
      "linear-gradient(145deg, #ffffff, #f3fff7)",
  },
  cardLabel: {
    margin: 0,
    marginBottom: 4,
    fontSize: "0.78rem",
    color: "#6b5a3c",
    opacity: 0.95,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight: 900,
  },
  metric: {
    fontSize: "1.55rem",
    fontWeight: 900,
    color: "#3d2a14",
  },
  tipText: {
    marginTop: 6,
    fontSize: "0.88rem",
    color: "#3d2a14",
    fontWeight: 800,
  },

  panel: {
    borderRadius: 20,
    border: "1px solid rgba(212,175,55,0.22)",
    padding: "16px 16px 14px",
    backgroundColor: "#ffffff",
    boxShadow: "0 18px 40px rgba(61,42,20,0.10)",
    color: "#3d2a14",
  },
  panelHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  panelTitle: { margin: 0, fontSize: "1rem", fontWeight: 900, color: "#3d2a14" },
  panelSubtitle: { marginTop: 4, marginBottom: 0, fontSize: "0.85rem", color: "#6b5a3c", fontWeight: 700, opacity: 0.95 },

  countChip: {
    borderRadius: 999,
    padding: "6px 12px",
    backgroundColor: "rgba(212,175,55,0.14)",
    border: "1px solid rgba(212,175,55,0.22)",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  countChipLabel: { color: "#6b5a3c", fontWeight: 900, fontSize: "0.82rem" },
  countChipValue: { color: "#5a3a1a", fontWeight: 900, fontSize: "0.88rem" },

  loadingBox: {
    padding: "18px 10px",
    textAlign: "center",
    fontSize: 13,
    color: "#6b5a3c",
    fontWeight: 700,
  },

  emptyBox: { padding: "24px 10px", textAlign: "center" },
  emptyIcon: { fontSize: 30, margin: 0 },
  emptyTitle: { margin: "8px 0 4px", fontSize: 16, fontWeight: 900, color: "#3d2a14" },
  emptyText: { margin: 0, fontSize: 13, color: "#6b5a3c", fontWeight: 700, opacity: 0.95 },

  tableWrapper: { width: "100%", overflowX: "auto", marginTop: 6 },
  table: { width: "100%", borderCollapse: "collapse", borderRadius: 14, overflow: "hidden" },

  th: {
    textAlign: "left",
    padding: "10px 12px",
    fontSize: 12,
    fontWeight: 900,
    color: "#fffaf3",
    backgroundColor: "#5a3a1a",
    borderBottom: "1px solid rgba(245,210,122,0.22)",
    whiteSpace: "nowrap",
  },
  thCenter: {
    textAlign: "center",
    padding: "10px 12px",
    fontSize: 12,
    fontWeight: 900,
    color: "#fffaf3",
    backgroundColor: "#5a3a1a",
    borderBottom: "1px solid rgba(245,210,122,0.22)",
    whiteSpace: "nowrap",
  },

  rowEven: { backgroundColor: "#faf6f1" },
  rowOdd: { backgroundColor: "#f3e6d8" },

  td: {
    padding: "10px 12px",
    fontSize: 13,
    color: "#3d2a14",
    borderBottom: "1px solid rgba(212,175,55,0.20)",
    verticalAlign: "middle",
    fontWeight: 800,
  },
  tdCenter: {
    padding: "10px 12px",
    fontSize: 13,
    color: "#3d2a14",
    borderBottom: "1px solid rgba(212,175,55,0.20)",
    verticalAlign: "middle",
    textAlign: "center",
    fontWeight: 800,
  },

  roleBadge: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 900,
    border: "1px solid rgba(212,175,55,0.22)",
  },
  roleOwner: { backgroundColor: "rgba(245,210,122,0.35)", color: "#7a4a2e" },
  roleStaff: { backgroundColor: "rgba(212,175,55,0.18)", color: "#5a3a1a" },
  roleCustomer: { backgroundColor: "rgba(148,163,184,0.18)", color: "#3d2a14" },

  statusActive: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 999,
    backgroundColor: "rgba(34,197,94,0.14)",
    border: "1px solid rgba(34,197,94,0.25)",
    color: "#166534",
    fontSize: 11,
    fontWeight: 900,
  },
  statusInactive: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 999,
    backgroundColor: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.22)",
    color: "#7f1d1d",
    fontSize: 11,
    fontWeight: 900,
  },

  smallButton: {
    padding: "6px 12px",
    borderRadius: 999,
    border: "1px solid rgba(212,175,55,0.30)",
    backgroundColor: "#ffffff",
    color: "#3d2a14",
    fontSize: 12,
    fontWeight: 900,
    cursor: "pointer",
    marginLeft: 6,
  },
  smallDangerButton: {
    padding: "6px 12px",
    borderRadius: 999,
    border: "1px solid rgba(239,68,68,0.30)",
    backgroundImage:
      "linear-gradient(135deg,rgba(212,175,55,0.14),rgba(239,68,68,0.10))",
    color: "#7f1d1d",
    fontSize: 12,
    fontWeight: 900,
    cursor: "pointer",
    marginLeft: 6,
  },
  smallActivateButton: {
    padding: "6px 12px",
    borderRadius: 999,
    border: "1px solid rgba(34,197,94,0.25)",
    backgroundColor: "rgba(34,197,94,0.10)",
    color: "#166534",
    fontSize: 12,
    fontWeight: 900,
    cursor: "pointer",
    marginLeft: 6,
  },
  ownerLock: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    backgroundColor: "rgba(148,163,184,0.16)",
    border: "1px solid rgba(148,163,184,0.20)",
    color: "#6b5a3c",
    fontWeight: 900,
    fontSize: 12,
  },

  noticeBox: {
    maxWidth: 520,
    margin: "18px auto 0",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    border: "1px solid rgba(212,175,55,0.30)",
    padding: "24px 20px",
    textAlign: "center",
    boxShadow: "0 30px 80px rgba(61,42,20,0.20)",
    color: "#3d2a14",
  },
  noticeTitle: { margin: 0, fontSize: "1.2rem", fontWeight: 900 },
  noticeText: { marginTop: 8, fontSize: "0.9rem", color: "#6b5a3c", fontWeight: 700, opacity: 0.95 },

  // Modals
  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(61,42,20,0.55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: 16,
  },
  modal: {
    width: "100%",
    maxWidth: 440,
    borderRadius: 20,
    padding: "18px 20px 18px",
    backgroundColor: "#ffffff",
    boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
    border: "1px solid rgba(212,175,55,0.30)",
    color: "#3d2a14",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },
  modalTitle: { margin: 0, fontSize: 16, fontWeight: 900, color: "#3d2a14" },
  modalClose: { border: "none", background: "transparent", fontSize: 22, cursor: "pointer", color: "#6b5a3c", fontWeight: 900 },

  modalField: { marginTop: 10 },
  label: { display: "block", marginBottom: 6, fontSize: 12, fontWeight: 900, color: "#6b5a3c" },
  input: {
    width: "100%",
    padding: "9px 10px",
    borderRadius: 12,
    border: "1px solid rgba(212,175,55,0.30)",
    fontSize: 13,
    backgroundColor: "#f9fafb",
    color: "#3d2a14",
    outline: "none",
    boxSizing: "border-box",
    fontWeight: 800,
  },

  fixedRoleBadge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    backgroundColor: "rgba(212,175,55,0.18)",
    border: "1px solid rgba(212,175,55,0.22)",
    color: "#5a3a1a",
    fontSize: 11,
    fontWeight: 900,
    marginTop: 2,
  },

  switchRow: { display: "flex", alignItems: "center", gap: 8, marginTop: 4 },
  switchLabel: { fontSize: 12, color: "#6b5a3c", fontWeight: 800 },

  modalFoot: {
    marginTop: 14,
    paddingTop: 12,
    borderTop: "1px solid rgba(212,175,55,0.20)",
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  },
  modalPrimaryBtn: {
    padding: "10px 16px",
    borderRadius: 999,
    border: "none",
    backgroundImage: "linear-gradient(135deg,#7a4a2e,#d4af37)",
    color: "#fffaf3",
    fontWeight: 900,
    fontSize: 13,
    cursor: "pointer",
    boxShadow: "0 12px 26px rgba(61,42,20,0.18)",
  },
  modalSecondaryBtn: {
    padding: "10px 14px",
    borderRadius: 999,
    border: "1px solid rgba(212,175,55,0.30)",
    backgroundColor: "transparent",
    color: "#3d2a14",
    fontWeight: 900,
    fontSize: 13,
    cursor: "pointer",
  },
};

export default UserManagement;
