// src/pages/Profile.jsx

import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Swal from "sweetalert2";
import bgImage from "../assets/images/123.jpg";

const Profile = () => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const user = storedUser || null;

  const [name, setName] = useState(user?.name || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("info"); // "info" | "password"

  const API_URL = process.env.REACT_APP_SERVER_URL;

  const handleUpdateName = async () => {
    if (!user) return;

    if (!name.trim()) {
      return Swal.fire("Warning", "Name cannot be empty", "warning");
    }

    try {
      const res = await fetch(`${API_URL}/api/users/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (res.ok) {
        const updatedUser = { ...user, name };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        Swal.fire(
          "Success!",
          data.message || "Name updated successfully.",
          "success"
        );
      } else {
        Swal.fire("Error", data.message || "Could not update name", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return Swal.fire(
        "Warning",
        "Please fill in all password fields",
        "warning"
      );
    }

    if (newPassword !== confirmPassword) {
      return Swal.fire("Warning", "New passwords do not match", "warning");
    }

    try {
      const res = await fetch(`${API_URL}/api/users/${user._id}/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowOldPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        Swal.fire(
          "Success!",
          data.message || "Password updated successfully.",
          "success"
        );
      } else {
        Swal.fire("Error", data.message || "Password change failed", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div style={styles.page}>
          <div style={styles.centerBox}>
            <h2 style={styles.centerTitle}>Profile</h2>
            <p style={styles.centerText}>
              Please log in to view and update your profile.
            </p>
          </div>
        </div>
      </>
    );
  }

  const initials =
    (user.name || "")
      .split(" ")
      .filter(Boolean)
      .map((p) => p[0]?.toUpperCase())
      .slice(0, 2)
      .join("") || "U";

  return (
    <>
      <Navbar />
      <div style={styles.page}>
        <main style={styles.wrap}>
          {/* HEADER */}
          <div style={styles.header}>
            <div>
              <p style={styles.kicker}>Account</p>
              <h1 style={styles.heading}>Your profile</h1>
              <p style={styles.muted}>
                Manage your personal details and keep your password up to date.
              </p>
            </div>
          </div>

          {/* NEW LAYOUT (Vertical) */}
          <div style={styles.grid}>
            {/* TOP USER CARD (was sidebar) */}
            <aside style={{ ...styles.card, ...styles.topUserCard }}>
              <div style={styles.userTopLeft}>
                <div style={styles.avatar} aria-label="User avatar">
                  <span style={styles.avatarText}>{initials}</span>
                </div>

                <div style={styles.userInfoBlock}>
                  <div style={styles.sideTitle}>Guest details</div>
                  <div style={styles.userName}>{user.name}</div>
                  {user.email && (
                    <div style={styles.userEmail}>{user.email}</div>
                  )}
                  {user.role && <div style={styles.roleBadge}>{user.role}</div>}
                </div>
              </div>

              <div style={styles.sideNote}>
                These details are used for your hotel reservations and receipts.
              </div>
            </aside>

            {/* MAIN CARD WITH NEW TABS STYLE */}
            <section style={styles.card}>
              {/* Tabs */}
              <div style={styles.tabsRow}>
                <button
                  type="button"
                  style={{
                    ...styles.tabBtn,
                    ...(activeTab === "info" ? styles.tabBtnActive : {}),
                  }}
                  onClick={() => setActiveTab("info")}
                >
                  Profile info
                </button>
                <button
                  type="button"
                  style={{
                    ...styles.tabBtn,
                    ...(activeTab === "password" ? styles.tabBtnActive : {}),
                  }}
                  onClick={() => setActiveTab("password")}
                >
                  Password
                </button>
              </div>

              {/* TAB PANES */}
              {activeTab === "info" && (
                <div id="info" style={styles.tabPanel}>
                  <h3 style={styles.sectionTitle}>Profile info</h3>
                  <p style={styles.sectionHint}>
                    Change the display name shown on your reservations and
                    messages.
                  </p>

                  <label style={styles.label}>Full name</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                  />

                  {user.email && (
                    <>
                      <label style={styles.label}>Email (read-only)</label>
                      <input
                        type="email"
                        style={{
                          ...styles.input,
                          backgroundColor: "#f3f4f6",
                          color: "#6b7280",
                          borderColor: "#e5e7eb",
                        }}
                        value={user.email}
                        readOnly
                      />
                    </>
                  )}

                  <div style={styles.actions}>
                    <button
                      type="button"
                      style={styles.ghostBtn}
                      onClick={() => setName(user.name || "")}
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      style={styles.primaryBtn}
                      onClick={handleUpdateName}
                    >
                      Save changes
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "password" && (
                <div id="security" style={styles.tabPanel}>
                  <h3 style={styles.sectionTitle}>Password</h3>
                  <p style={styles.sectionHint}>
                    Use a strong, unique password to keep your Hotel Mate
                    account secure.
                  </p>

                  <label style={styles.label}>Old password</label>
                  <div style={styles.inputWrap}>
                    <input
                      type={showOldPassword ? "text" : "password"}
                      style={{ ...styles.input, paddingRight: "38px" }}
                      placeholder="Current password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      style={styles.passwordToggleBtn}
                      onClick={() => setShowOldPassword((prev) => !prev)}
                      aria-label={
                        showOldPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showOldPassword ? "🙈" : "👁"}
                    </button>
                  </div>

                  <div style={styles.row}>
                    <div>
                      <label style={styles.label}>New password</label>
                      <div style={styles.inputWrap}>
                        <input
                          type={showNewPassword ? "text" : "password"}
                          style={{ ...styles.input, paddingRight: "38px" }}
                          placeholder="New password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          style={styles.passwordToggleBtn}
                          onClick={() => setShowNewPassword((prev) => !prev)}
                          aria-label={
                            showNewPassword
                              ? "Hide new password"
                              : "Show new password"
                          }
                        >
                          {showNewPassword ? "🙈" : "👁"}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label style={styles.label}>Confirm new password</label>
                      <div style={styles.inputWrap}>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          style={{ ...styles.input, paddingRight: "38px" }}
                          placeholder="Repeat new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          style={styles.passwordToggleBtn}
                          onClick={() =>
                            setShowConfirmPassword((prev) => !prev)
                          }
                          aria-label={
                            showConfirmPassword
                              ? "Hide confirm password"
                              : "Show confirm password"
                          }
                        >
                          {showConfirmPassword ? "🙈" : "👁"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={styles.actions}>
                    <button
                      type="button"
                      style={styles.ghostBtn}
                      onClick={() => {
                        setOldPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                        setShowOldPassword(false);
                        setShowNewPassword(false);
                        setShowConfirmPassword(false);
                      }}
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      style={styles.primaryBtn}
                      onClick={handleChangePassword}
                    >
                      Update password
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f3f6fb",
    backgroundImage: `linear-gradient(rgba(245,239,230,0.45), rgba(245,239,230,0.45)),
      radial-gradient(circle at top right, rgba(148,163,253,0.18), transparent 60%),
      radial-gradient(circle at bottom left, rgba(150,130,27,0.18), transparent 60%),
      url(${bgImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
    color: "#0b1a33",
  },

  wrap: {
    maxWidth: "1180px",
    margin: "24px auto 32px",
    padding: "0 20px",
  },
  header: {
    marginBottom: "18px",
  },
  kicker: {
    margin: 0,
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.16em",
    color: "#96821b",
  },
  heading: {
    margin: "4px 0 2px",
    fontSize: "26px",
    fontWeight: 900,
    letterSpacing: "0.02em",
    textTransform: "none",
    color: "#0f172a",
  },
  muted: {
    margin: "4px 0 0",
    fontSize: "13px",
    color: "#4b5563",
  },

  // ✅ NEW GRID: vertical layout
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "18px",
  },

  card: {
    borderRadius: "18px",
    border: "1px solid rgba(15,23,42,0.08)",
    padding: "18px 18px 16px",
    backgroundColor: "rgba(255,255,255,0.92)",
    boxShadow: "0 18px 40px rgba(15,23,42,0.12)",
    color: "#0f172a",
    backdropFilter: "blur(8px)",
  },

  // ✅ Top user card (replaces sidebar)
  topUserCard: {
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  userTopLeft: {
    display: "flex",
    gap: "14px",
    alignItems: "center",
  },

  sideTitle: {
    margin: 0,
    fontSize: "12px",
    fontWeight: 800,
    color: "#111827",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },

  // ✅ Avatar changed to rounded-square
  avatar: {
    width: "72px",
    height: "72px",
    borderRadius: "16px",
    backgroundImage:
      "linear-gradient(135deg, rgba(150,130,27,0.85), rgba(150,130,27,0.55))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 0,
    color: "#f9fafb",
    fontWeight: 900,
    fontSize: "26px",
    boxShadow: "0 12px 26px rgba(150,130,27,0.35)",
  },
  avatarText: {
    lineHeight: 1,
  },

  userInfoBlock: {
    marginTop: 0,
  },
  userName: {
    fontSize: "15px",
    fontWeight: 800,
    color: "#0f172a",
    marginTop: "4px",
  },
  userEmail: {
    fontSize: "12px",
    color: "#4b5563",
    marginTop: "3px",
  },

  roleBadge: {
    display: "inline-block",
    marginTop: "8px",
    padding: "4px 10px",
    borderRadius: "10px",
    fontSize: "11px",
    fontWeight: 800,
    backgroundColor: "rgba(150,130,27,0.14)",
    color: "#5a4d12",
    textTransform: "capitalize",
    border: "1px solid rgba(150,130,27,0.25)",
  },

  sideNote: {
    marginTop: 0,
    fontSize: "12px",
    color: "#6b7280",
    maxWidth: "520px",
    textAlign: "right",
  },

  // ✅ Tabs now underline style
  tabsRow: {
    display: "flex",
    gap: "14px",
    alignItems: "center",
    borderBottom: "2px solid rgba(15,23,42,0.08)",
    paddingBottom: "10px",
    marginBottom: "14px",
  },
  tabBtn: {
    padding: "8px 2px",
    borderRadius: 0,
    border: "none",
    backgroundColor: "transparent",
    color: "#374151",
    fontSize: "13px",
    fontWeight: 800,
    cursor: "pointer",
    borderBottom: "3px solid transparent",
  },
  tabBtnActive: {
    borderBottom: "3px solid rgba(150,130,27,0.85)",
    color: "#5a4d12",
  },

  tabPanel: {
    marginTop: "6px",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 900,
    color: "#0f172a",
  },
  sectionHint: {
    margin: "4px 0 10px",
    fontSize: "13px",
    color: "#6b7280",
  },
  label: {
    display: "block",
    marginTop: "10px",
    marginBottom: "6px",
    fontSize: "13px",
    color: "#374151",
    fontWeight: 600,
  },

  input: {
    width: "100%",
    height: "44px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    padding: "0 12px",
    fontSize: "14px",
    outline: "none",
    display: "block",
    boxSizing: "border-box",
    backgroundColor: "#ffffff",
    color: "#111827",
    transition:
      "border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease",
  },
  inputWrap: {
    position: "relative",
    width: "100%",
  },
  passwordToggleBtn: {
    position: "absolute",
    top: "50%",
    right: "10px",
    transform: "translateY(-50%)",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "18px",
    lineHeight: 1,
    padding: 0,
    color: "#6b7280",
  },

  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginTop: "2px",
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "16px",
    flexWrap: "wrap",
  },

  // ✅ Buttons now rounded-square (different)
  primaryBtn: {
    height: "44px",
    minWidth: "140px",
    padding: "0 18px",
    borderRadius: "12px",
    border: "none",
    backgroundImage:
      "linear-gradient(135deg, rgba(150,130,27,0.95), rgba(150,130,27,0.60))",
    color: "#ffffff",
    fontWeight: 900,
    fontSize: "13px",
    cursor: "pointer",
    boxShadow: "0 12px 26px rgba(150,130,27,0.28)",
  },
  ghostBtn: {
    height: "44px",
    minWidth: "110px",
    padding: "0 16px",
    borderRadius: "12px",
    border: "1px solid rgba(15,23,42,0.16)",
    backgroundColor: "#ffffff",
    color: "#111827",
    fontWeight: 800,
    fontSize: "13px",
    cursor: "pointer",
  },

  divider: {
    margin: "16px 0",
    border: "none",
    borderTop: "1px dashed #e5e7eb",
  },

  centerBox: {
    maxWidth: "460px",
    margin: "60px auto 0",
    textAlign: "center",
    borderRadius: "20px",
    border: "1px solid rgba(15,23,42,0.08)",
    padding: "24px 22px",
    backgroundColor: "rgba(255,255,255,0.92)",
    boxShadow: "0 18px 40px rgba(15,23,42,0.15)",
    color: "#0f172a",
  },
  centerTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 900,
  },
  centerText: {
    marginTop: "10px",
    fontSize: "14px",
    color: "#4b5563",
  },
};

export default Profile;
