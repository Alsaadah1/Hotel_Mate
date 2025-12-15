// src/pages/BookingRequests.jsx

import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar"; // ✅ ALWAYS use your Navbar.jsx
import Swal from "sweetalert2";
import { useSelector } from "react-redux";

const BookingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");

  const user = useSelector((state) => state.users.user);
  const API_URL = process.env.REACT_APP_SERVER_URL;

  const isManagerLike = user && (user.role === "owner" || user.role === "staff");

  // 🔹 Fetch bookings for this owner/staff (by ownerId)
  const fetchRequests = async (ownerId) => {
    if (!ownerId) return;

    try {
      const res = await fetch(`${API_URL}/api/bookings/owner/${ownerId}`);

      if (!res.ok) {
        console.error("Failed to fetch booking requests, status:", res.status);
        setRequests([]);
        setFilteredRequests([]);
        return;
      }

      const data = await res.json();
      const arr = Array.isArray(data) ? data : [];
      setRequests(arr);
      setFilteredRequests(arr);
    } catch (error) {
      console.error("Error fetching booking requests:", error);
      setRequests([]);
      setFilteredRequests([]);
    }
  };

  useEffect(() => {
    if (isManagerLike && user?._id) {
      fetchRequests(user._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isManagerLike, user?._id]);

  const handleUpdateStatus = async (id, newStatus) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You want to ${String(newStatus).toLowerCase()} this booking?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d4af37", // ✅ gold theme
      cancelButtonColor: "#7a4a2e",
      confirmButtonText: `Yes, ${newStatus}!`,
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_URL}/api/bookings/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });

        const data = await res.json();
        if (res.ok) {
          Swal.fire("Updated", "Guest booking status updated.", "success");
          if (user?._id) fetchRequests(user._id);
        } else {
          Swal.fire("Error", data.message || "Error updating booking.", "error");
        }
      } catch (error) {
        console.error("Error updating booking:", error);
        Swal.fire("Error", "Error updating booking.", "error");
      }
    }
  };

  const handleFilterChange = (e) => {
    const status = e.target.value;
    setFilterStatus(status);

    if (status === "all") {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(
        requests.filter((req) => (req.status || "").toLowerCase() === status)
      );
    }
  };

  const getStatusBadgeStyle = (statusRaw) => {
    const status = (statusRaw || "").toLowerCase();
    if (status === "approved") return { ...styles.badge, ...styles.badgeApproved };
    if (status === "rejected") return { ...styles.badge, ...styles.badgeRejected };
    return { ...styles.badge, ...styles.badgePending };
  };

  const formatStatus = (statusRaw) => {
    if (!statusRaw) return "Pending";
    return statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1).toLowerCase();
  };

  const total = requests.length;
  const pendingCount = requests.filter(
    (r) => (r.status || "").toLowerCase() === "pending"
  ).length;
  const approvedCount = requests.filter(
    (r) => (r.status || "").toLowerCase() === "approved"
  ).length;
  const rejectedCount = requests.filter(
    (r) => (r.status || "").toLowerCase() === "rejected"
  ).length;

  // ❌ If not logged in or not owner/staff
  if (!user || !isManagerLike) {
    return (
      <>
        <Navbar />
        <div style={styles.page}>
          <div style={styles.wrapper}>
            <div style={styles.noticeBox}>
              <h2 style={styles.noticeTitle}>Manager or staff access required</h2>
              <p style={styles.noticeText}>
                The booking requests page is only available for hotel managers and staff.
                Please log in with a manager or staff account.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div style={styles.page}>
        <div style={styles.wrapper}>
          {/* Header band */}
          <header style={styles.headerBand}>
            <div>
              <p style={styles.headerKicker}>Hotel Mate · Requests</p>
              <h1 style={styles.title}>Guest booking requests</h1>
              <p style={styles.subtitle}>
                Review, approve, or reject incoming stay requests for your rooms.
              </p>
            </div>

            {/* Filter */}
            <div style={styles.filterBox}>
              <label style={styles.filterLabel}>Filter by status</label>
              <select
                style={styles.select}
                value={filterStatus}
                onChange={handleFilterChange}
              >
                <option value="all">All bookings</option>
                <option value="approved">Confirmed (Approved)</option>
                <option value="pending">New requests (Pending)</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </header>

          {/* Summary cards */}
          <section style={styles.cardsGrid}>
            <div style={{ ...styles.card, ...styles.cardTotal }}>
              <p style={styles.cardLabel}>Total requests</p>
              <div style={styles.metric}>{total}</div>
            </div>

            <div style={{ ...styles.card, ...styles.cardPending }}>
              <p style={styles.cardLabel}>Pending</p>
              <div style={styles.metric}>{pendingCount}</div>
            </div>

            <div style={{ ...styles.card, ...styles.cardApproved }}>
              <p style={styles.cardLabel}>Approved</p>
              <div style={styles.metric}>{approvedCount}</div>
            </div>

            <div style={{ ...styles.card, ...styles.cardRejected }}>
              <p style={styles.cardLabel}>Rejected</p>
              <div style={styles.metric}>{rejectedCount}</div>
            </div>
          </section>

          {/* Table panel */}
          <section style={styles.panel}>
            <div style={styles.panelHeaderRow}>
              <div>
                <h2 style={styles.panelTitle}>Booking queue</h2>
                <p style={styles.panelSubtitle}>
                  Update the status to confirm or decline a guest&apos;s stay.
                </p>
              </div>

              <div style={styles.queueChip}>
                <span style={styles.queueChipLabel}>Awaiting action</span>
                <span style={styles.queueChipNumber}>{pendingCount}</span>
              </div>
            </div>

            {filteredRequests.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={styles.emptyTitle}>No booking requests yet</p>
                <p style={styles.emptyText}>
                  Once guests start booking your rooms, their requests will appear here.
                </p>
              </div>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.thRoom}>Room</th>
                      <th style={styles.th}>Guest</th>
                      <th style={styles.thCenter}>Stay</th>
                      <th style={styles.thCenter}>Total amount</th>
                      <th style={styles.thCenter}>Status</th>
                      <th style={styles.thCenter}>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRequests.map((req, idx) => (
                      <tr
                        key={req._id}
                        style={idx % 2 === 0 ? styles.rowEven : styles.rowOdd}
                      >
                        {/* Room + image */}
                        <td style={styles.tdRoom}>
                          <div style={styles.roomCellInner}>
                            <div style={styles.imageShell}>
                              {req.image ? (
                                <img
                                  src={`${API_URL}/assets/images/${req.image}`}
                                  alt={req.roomName || "Room"}
                                  style={styles.image}
                                />
                              ) : (
                                <div style={styles.noImg}>No photo</div>
                              )}
                            </div>
                            <div>
                              <div style={styles.roomName}>{req.roomName || "Room"}</div>
                              <div style={styles.roomMeta}>
                                Booking ID: {req._id?.slice(-6) || "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Guest */}
                        <td style={styles.td}>
                          <span style={styles.guestName}>{req.customerName || "Guest"}</span>
                        </td>

                        {/* Stay */}
                        <td style={styles.tdCenter}>{req.stayDuration || "—"}</td>

                        {/* Amount */}
                        <td style={styles.tdCenter}>
                          <span style={styles.amountChip}>
                            {Number(req.totalCost || 0).toFixed(2)} OMR
                          </span>
                        </td>

                        {/* Status */}
                        <td style={styles.tdCenter}>
                          <span style={getStatusBadgeStyle(req.status)}>
                            {formatStatus(req.status)}
                          </span>
                        </td>

                        {/* Action */}
                        <td style={styles.tdCenter}>
                          {(req.status || "").toLowerCase() === "pending" ? (
                            <div style={styles.actionButtons}>
                              <button
                                style={{ ...styles.smallBtn, ...styles.smallBtnApprove }}
                                type="button"
                                onClick={() => handleUpdateStatus(req._id, "Approved")}
                              >
                                Approve
                              </button>
                              <button
                                style={{ ...styles.smallBtn, ...styles.smallBtnReject }}
                                type="button"
                                onClick={() => handleUpdateStatus(req._id, "Rejected")}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (req.status || "").toLowerCase() === "approved" ? (
                            <span style={styles.statusIconOK}>✔</span>
                          ) : (
                            <span style={styles.statusIconReject}>✕</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#faf6f1",
    backgroundImage:
      "radial-gradient(circle at top right, rgba(226, 184, 44, 0.35), transparent 55%), " +
      "radial-gradient(circle at bottom left, rgba(212,175,55,0.25), transparent 55%)",
  },
  wrapper: {
    maxWidth: "1120px",
    margin: "0 auto",
    padding: "22px 16px 40px",
  },

  // Header band
  headerBand: {
    marginBottom: "18px",
    padding: "16px 16px 14px",
    borderRadius: "18px",
    border: "1px solid rgba(212,175,55,0.35)",
    backgroundImage:
      "radial-gradient(circle at top, rgba(245,210,122,0.28), transparent 55%), " +
      "linear-gradient(145deg, #8a5a24, #5e3418)",
    boxShadow: "0 18px 38px rgba(61,42,20,0.18)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    color: "#fffaf3",
    flexWrap: "wrap",
  },
  headerKicker: {
    margin: 0,
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.16em",
    color: "#f5d27a",
  },
  title: {
    margin: "4px 0 4px",
    fontSize: "22px",
    fontWeight: 900,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "#fffaf3",
  },
  subtitle: {
    margin: 0,
    fontSize: "13px",
    color: "#f3e6d8",
    opacity: 0.95,
  },

  filterBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 12px",
    borderRadius: "999px",
    backgroundColor: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(245,210,122,0.35)",
    backdropFilter: "blur(6px)",
  },
  filterLabel: {
    fontSize: "0.78rem",
    color: "#fffaf3",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },
  select: {
    padding: "6px 10px",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.18)",
    backgroundColor: "rgba(61,42,20,0.55)",
    color: "#fffaf3",
    fontSize: "0.82rem",
    outline: "none",
    cursor: "pointer",
    fontWeight: 800,
  },

  // Cards
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "14px",
    marginBottom: "20px",
  },
  card: {
    borderRadius: "16px",
    padding: "14px 14px 12px",
    border: "1px solid rgba(212,175,55,0.24)",
    boxShadow: "0 10px 22px rgba(61,42,20,0.10)",
    color: "#3d2a14",
    backgroundColor: "#ffffff",
  },
  cardTotal: {
    backgroundImage:
      "radial-gradient(circle at top, rgba(212,175,55,0.22), transparent 55%), " +
      "linear-gradient(145deg, #ffffff, #fffaf3)",
  },
  cardPending: {
    backgroundImage:
      "radial-gradient(circle at top, rgba(234,179,8,0.22), transparent 55%), " +
      "linear-gradient(145deg, #ffffff, #fff7e6)",
  },
  cardApproved: {
    backgroundImage:
      "radial-gradient(circle at top, rgba(34,197,94,0.16), transparent 55%), " +
      "linear-gradient(145deg, #ffffff, #f3fff7)",
  },
  cardRejected: {
    backgroundImage:
      "radial-gradient(circle at top, rgba(239,68,68,0.16), transparent 55%), " +
      "linear-gradient(145deg, #ffffff, #fff5f5)",
  },
  cardLabel: {
    margin: 0,
    marginBottom: "4px",
    fontSize: "0.78rem",
    color: "#6b5a3c",
    opacity: 0.95,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight: 900,
  },
  metric: {
    fontSize: "1.7rem",
    fontWeight: 900,
    color: "#3d2a14",
  },

  // Panel + table
  panel: {
    borderRadius: "20px",
    border: "1px solid rgba(212,175,55,0.24)",
    padding: "16px 16px 14px",
    backgroundColor: "#ffffff",
    boxShadow: "0 18px 40px rgba(61,42,20,0.10)",
    color: "#3d2a14",
  },
  panelHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "10px",
    flexWrap: "wrap",
  },
  panelTitle: {
    margin: 0,
    fontSize: "1rem",
    fontWeight: 900,
    color: "#3d2a14",
  },
  panelSubtitle: {
    marginTop: "4px",
    marginBottom: 0,
    fontSize: "0.85rem",
    color: "#6b5a3c",
    opacity: 0.95,
    fontWeight: 700,
  },
  queueChip: {
    borderRadius: "999px",
    padding: "6px 12px",
    backgroundColor: "rgba(212,175,55,0.14)",
    border: "1px solid rgba(212,175,55,0.24)",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "0.8rem",
  },
  queueChipLabel: {
    color: "#6b5a3c",
    fontWeight: 900,
  },
  queueChipNumber: {
    fontWeight: 900,
    color: "#5a3a1a",
  },

  tableWrapper: { width: "100%", overflowX: "auto", marginTop: "6px" },
  table: { width: "100%", borderCollapse: "collapse", borderRadius: "14px", overflow: "hidden" },

  thRoom: {
    textAlign: "left",
    padding: "10px 12px",
    fontSize: "0.8rem",
    color: "#fffaf3",
    borderBottom: "1px solid rgba(245,210,122,0.22)",
    backgroundColor: "#5a3a1a",
  },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    fontSize: "0.8rem",
    color: "#fffaf3",
    borderBottom: "1px solid rgba(245,210,122,0.22)",
    backgroundColor: "#5a3a1a",
  },
  thCenter: {
    textAlign: "center",
    padding: "10px 12px",
    fontSize: "0.8rem",
    color: "#fffaf3",
    borderBottom: "1px solid rgba(245,210,122,0.22)",
    backgroundColor: "#5a3a1a",
    whiteSpace: "nowrap",
  },

  rowEven: { backgroundColor: "#faf6f1" },
  rowOdd: { backgroundColor: "#f3e6d8" },

  tdRoom: {
    padding: "10px 12px",
    borderBottom: "1px solid rgba(212,175,55,0.22)",
    verticalAlign: "middle",
  },
  td: {
    padding: "10px 12px",
    borderBottom: "1px solid rgba(212,175,55,0.22)",
    verticalAlign: "middle",
    fontSize: "0.88rem",
    color: "#3d2a14",
    fontWeight: 700,
  },
  tdCenter: {
    padding: "10px 12px",
    borderBottom: "1px solid rgba(212,175,55,0.22)",
    verticalAlign: "middle",
    fontSize: "0.88rem",
    color: "#3d2a14",
    textAlign: "center",
    fontWeight: 700,
  },

  roomCellInner: { display: "flex", alignItems: "center", gap: "10px" },
  imageShell: {
    width: "56px",
    height: "56px",
    borderRadius: "12px",
    border: "1px solid rgba(212,175,55,0.30)",
    overflow: "hidden",
    backgroundColor: "#f3e6d8",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  image: { width: "100%", height: "100%", objectFit: "cover" },
  noImg: { fontSize: "0.75rem", color: "#7a4a2e", fontWeight: 800 },

  roomName: { fontWeight: 900, fontSize: "0.92rem", color: "#3d2a14" },
  roomMeta: { fontSize: "0.78rem", color: "#8c7a55", fontWeight: 700 },

  guestName: { fontWeight: 900, color: "#3d2a14" },

  amountChip: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "999px",
    backgroundColor: "rgba(212,175,55,0.18)",
    border: "1px solid rgba(212,175,55,0.24)",
    color: "#5a3a1a",
    fontSize: "0.8rem",
    fontWeight: 900,
  },

  // Badges
  badge: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "0.78rem",
    fontWeight: 900,
    border: "1px solid rgba(0,0,0,0.06)",
  },
  badgePending: { backgroundColor: "rgba(234,179,8,0.22)", color: "#7c2d12" },
  badgeApproved: { backgroundColor: "rgba(34,197,94,0.16)", color: "#14532d" },
  badgeRejected: { backgroundColor: "rgba(239,68,68,0.16)", color: "#7f1d1d" },

  // Action buttons
  actionButtons: {
    display: "flex",
    justifyContent: "center",
    gap: "6px",
    flexWrap: "wrap",
  },
  smallBtn: {
    padding: "6px 12px",
    borderRadius: "999px",
    border: "1px solid rgba(212,175,55,0.30)",
    fontSize: "0.8rem",
    fontWeight: 900,
    cursor: "pointer",
    backgroundColor: "#ffffff",
    color: "#3d2a14",
  },
  smallBtnApprove: {
    backgroundImage: "linear-gradient(135deg, rgba(34,197,94,0.12), rgba(212,175,55,0.14))",
    borderColor: "rgba(34,197,94,0.35)",
    color: "#14532d",
  },
  smallBtnReject: {
    backgroundImage: "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(212,175,55,0.14))",
    borderColor: "rgba(239,68,68,0.35)",
    color: "#7f1d1d",
  },
  statusIconOK: { fontSize: "1.2rem", color: "#16a34a", fontWeight: 900 },
  statusIconReject: { fontSize: "1.2rem", color: "#dc2626", fontWeight: 900 },

  emptyState: { padding: "26px 12px 12px", textAlign: "center" },
  emptyTitle: { margin: 0, fontWeight: 900, color: "#3d2a14", fontSize: "1rem" },
  emptyText: { marginTop: "6px", fontSize: "0.85rem", color: "#6b5a3c", fontWeight: 700, opacity: 0.95 },

  noticeBox: {
    maxWidth: "520px",
    margin: "60px auto 0",
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    border: "1px solid rgba(212,175,55,0.30)",
    padding: "24px 20px",
    textAlign: "center",
    boxShadow: "0 30px 80px rgba(61,42,20,0.20)",
    color: "#3d2a14",
  },
  noticeTitle: { margin: 0, fontSize: "1.2rem", fontWeight: 900 },
  noticeText: { marginTop: "8px", fontSize: "0.9rem", color: "#6b5a3c", fontWeight: 700, opacity: 0.95 },

  // Responsive fixes
  "@media (max-width: 980px)": {},
};

export default BookingRequests;
