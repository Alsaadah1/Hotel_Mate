// src/pages/ManagementOverview.jsx

import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import useLocation from "../utils/useLocation";
import { useSelector } from "react-redux";

const ManagementOverview = () => {
  const { placeInfo, error } = useLocation();
  const user = useSelector((state) => state.users.user);
  const API_URL = process.env.REACT_APP_SERVER_URL;

  const [roomsCount, setRoomsCount] = useState(0);
  const [confirmedBookings, setConfirmedBookings] = useState(0);
  const [pendingBookings, setPendingBookings] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    // ✅ Allow both owner and staff to see this dashboard
    if (!user || (user.role !== "owner" && user.role !== "staff")) return;

    const fetchDashboardData = async () => {
      try {
        // 1) Rooms owned/managed by this user
        const roomsRes = await fetch(`${API_URL}/api/rooms/manager/${user._id}`);
        if (roomsRes.ok) {
          const roomsData = await roomsRes.json();
          if (Array.isArray(roomsData)) {
            setRoomsCount(roomsData.length);
          }
        } else {
          console.error("Failed to fetch rooms, status:", roomsRes.status);
          setRoomsCount(0);
        }

        // 2) Bookings related to this manager/owner
        const bookingsRes = await fetch(
          `${API_URL}/api/bookings/owner/${user._id}`
        );

        if (!bookingsRes.ok) {
          console.error("Failed to fetch bookings, status:", bookingsRes.status);
          setConfirmedBookings(0);
          setPendingBookings(0);
          setTotalRevenue(0);
          return;
        }

        const bookingsData = await bookingsRes.json();

        if (Array.isArray(bookingsData)) {
          let confirmed = 0;
          let pending = 0;
          let revenue = 0;

          bookingsData.forEach((booking) => {
            const status = (booking.status || "").toLowerCase();

            if (status === "approved") {
              confirmed += 1;
              const amount = Number(booking.totalCost) || 0;
              revenue += amount;
            } else if (status === "pending") {
              pending += 1;
            }
          });

          setConfirmedBookings(confirmed);
          setPendingBookings(pending);
          setTotalRevenue(revenue);
        }
      } catch (err) {
        console.error("Error loading management overview data:", err);
      }
    };

    fetchDashboardData();
  }, [API_URL, user]);

  const totalBookings = confirmedBookings + pendingBookings;
  const bookingsBase = totalBookings > 0 ? totalBookings : 1;

  const confirmedPercent = Math.round((confirmedBookings / bookingsBase) * 100);
  const pendingPercent = Math.round((pendingBookings / bookingsBase) * 100);

  const revenueGoal = Math.max(500, totalRevenue * 1.3);
  const revenueRatio = revenueGoal > 0 ? Math.min(totalRevenue / revenueGoal, 1) : 0;

  const roleLabel =
    user?.role === "owner" ? "Owner" : user?.role === "staff" ? "Staff" : "Manager";

  return (
    <>
      <Navbar />
      <div style={styles.page}>
        {/* Top band */}
        <section style={styles.band}>
          <div style={styles.bandInner}>
            <div>
              <p style={styles.bandLabel}>Hotel Mate – Management Hub</p>
              <h1 style={styles.title}>Property Management Overview</h1>
              <p style={styles.subtitle}>
                Monitor your rooms, bookings, and revenue performance in one place.
              </p>
            </div>

            {user && (
              <div style={styles.userCard}>
                <div style={styles.userRole}>{roleLabel}</div>
                <div style={styles.userEmail}>{user.email}</div>
                <div style={styles.userHint}>Signed in to management console</div>
              </div>
            )}
          </div>
        </section>

        <div style={styles.wrapper}>
          {/* Summary cards */}
          <section style={styles.cardsGrid}>
            <div style={{ ...styles.card, ...styles.cardAccentRooms }}>
              <h3 style={styles.cardLabel}>Rooms listed</h3>
              <div style={styles.metric}>{roomsCount}</div>
              <p style={styles.cardHint}>
                Total rooms currently available in your Hotel Mate property.
              </p>
            </div>

            <div style={{ ...styles.card, ...styles.cardAccentConfirmed }}>
              <h3 style={styles.cardLabel}>Confirmed bookings</h3>
              <div style={styles.metric}>{confirmedBookings}</div>
              <p style={styles.cardHint}>
                Bookings that have been approved and confirmed.
              </p>
            </div>

            <div style={{ ...styles.card, ...styles.cardAccentPending }}>
              <h3 style={styles.cardLabel}>Pending requests</h3>
              <div style={styles.metric}>{pendingBookings}</div>
              <p style={styles.cardHint}>
                New booking requests waiting for your review.
              </p>
            </div>

            <div style={{ ...styles.card, ...styles.cardAccentRevenue }}>
              <h3 style={styles.cardLabel}>Total room revenue</h3>
              <div style={styles.metric}>OMR {totalRevenue.toFixed(2)}</div>
              <p style={styles.cardHint}>
                Calculated from all approved bookings.
              </p>
            </div>
          </section>

          {/* Bottom row: graphs + location */}
          <section style={styles.bottomRow}>
            {/* Graphs panel */}
            <div style={styles.graphPanel}>
              <h2 style={styles.panelTitle}>Booking & revenue insights</h2>
              <p style={styles.panelSubtitle}>
                A quick visual snapshot of your booking mix and revenue progress.
              </p>

              {/* Bookings mix graph */}
              <div style={styles.graphBlock}>
                <div style={styles.graphHeaderRow}>
                  <h3 style={styles.graphTitle}>Bookings mix</h3>
                  <span style={styles.graphTag}>{totalBookings} total bookings</span>
                </div>
                <p style={styles.graphHint}>
                  Confirmed vs pending booking requests.
                </p>

                <div style={styles.legendRow}>
                  <span style={{ ...styles.legendDot, ...styles.legendDotConfirmed }} />
                  <span style={styles.legendLabel}>Confirmed</span>
                  <span style={{ ...styles.legendDot, ...styles.legendDotPending }} />
                  <span style={styles.legendLabel}>Pending</span>
                </div>

                <div style={styles.barShell}>
                  <div
                    style={{
                      ...styles.barSegmentConfirmed,
                      width: `${confirmedPercent}%`,
                    }}
                  >
                    {confirmedBookings > 0 && (
                      <span style={styles.barLabel}>{confirmedPercent}%</span>
                    )}
                  </div>
                  <div
                    style={{
                      ...styles.barSegmentPending,
                      width: `${pendingPercent}%`,
                    }}
                  >
                    {pendingBookings > 0 && (
                      <span style={styles.barLabel}>{pendingPercent}%</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Revenue progress graph */}
              <div style={styles.graphBlock}>
                <div style={styles.graphHeaderRow}>
                  <h3 style={styles.graphTitle}>Revenue progress</h3>
                  <span style={styles.graphTagMuted}>
                    Soft goal: OMR {revenueGoal.toFixed(0)}
                  </span>
                </div>
                <p style={styles.graphHint}>
                  How your current revenue compares to a projected target.
                </p>

                <div style={styles.revenueLabelRow}>
                  <span style={styles.revenueNow}>
                    Current: OMR {totalRevenue.toFixed(2)}
                  </span>
                  <span style={styles.revenuePercent}>
                    {Math.round(revenueRatio * 100)}% of goal
                  </span>
                </div>

                <div style={styles.revenueBarShell}>
                  <div
                    style={{
                      ...styles.revenueBarFill,
                      width: `${revenueRatio * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Location panel */}
            <div style={styles.sidePanel}>
              <h2 style={styles.panelTitle}>Hotel location snapshot</h2>
              <p style={styles.panelSubtitle}>
                Helps personalise booking context and guest summaries.
              </p>

              {error && <p style={styles.error}>{error}</p>}

              {placeInfo ? (
                <div style={styles.locationBox}>
                  <p>
                    <strong>City:</strong> {placeInfo.city || "—"}
                  </p>
                  <p>
                    <strong>Region:</strong> {placeInfo.region || "—"}
                  </p>
                  <p>
                    <strong>Country:</strong> {placeInfo.country || "—"}
                  </p>
                </div>
              ) : !error ? (
                <p style={styles.loadingText}>Detecting hotel location…</p>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f3f6fb",
    backgroundImage:
      "radial-gradient(circle at top right, rgba(148,163,253,0.35), transparent 55%), " +
      "radial-gradient(circle at bottom left, rgba(56,189,248,0.18), transparent 55%)",
  },
  band: {
    backgroundImage: "linear-gradient(135deg, #0a3d91, #1e5fe0)",
    padding: "18px 16px 22px",
    borderBottom: "1px solid rgba(15,23,42,0.08)",
    boxShadow: "0 10px 24px rgba(15,23,42,0.18)",
  },
  bandInner: {
    maxWidth: "1120px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "18px",
    flexWrap: "wrap",
    color: "#f9fafb",
  },
  bandLabel: {
    margin: 0,
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.16em",
    color: "#bfdbfe",
  },
  title: {
    margin: "4px 0 4px",
    fontSize: "24px",
    fontWeight: 800,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "#f9fafb",
  },
  subtitle: {
    margin: 0,
    fontSize: "13px",
    color: "#e5e7eb",
    opacity: 0.95,
  },
  userCard: {
    padding: "10px 14px",
    borderRadius: "16px",
    backgroundColor: "rgba(15,23,42,0.92)",
    border: "1px solid rgba(248,250,252,0.18)",
    minWidth: "220px",
    boxShadow: "0 12px 26px rgba(15,23,42,0.6)",
  },
  userRole: {
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.16em",
    color: "#bfdbfe",
    marginBottom: "2px",
  },
  userEmail: {
    fontSize: "13px",
    color: "#e5f2ff",
    fontWeight: 600,
  },
  userHint: {
    marginTop: "4px",
    fontSize: "11px",
    color: "#e5e7eb",
    opacity: 0.9,
  },
  wrapper: {
    maxWidth: "1120px",
    margin: "0 auto",
    padding: "22px 16px 40px",
  },
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "14px",
    marginBottom: "26px",
  },
  card: {
    borderRadius: "18px",
    padding: "16px 16px 14px",
    backgroundColor: "#ffffff",
    border: "1px solid rgba(15,23,42,0.06)",
    boxShadow: "0 12px 24px rgba(15,23,42,0.08)",
    color: "#0b1a33",
  },
  cardAccentRooms: {
    boxShadow: "0 18px 32px rgba(37,99,235,0.18)",
  },
  cardAccentConfirmed: {
    boxShadow: "0 18px 32px rgba(34,197,94,0.18)",
  },
  cardAccentPending: {
    boxShadow: "0 18px 32px rgba(234,179,8,0.22)",
  },
  cardAccentRevenue: {
    boxShadow: "0 18px 32px rgba(30,64,175,0.28)",
  },
  cardLabel: {
    margin: 0,
    marginBottom: "6px",
    fontSize: "0.9rem",
    color: "#6b7280",
    opacity: 0.95,
    fontWeight: 600,
  },
  metric: {
    fontSize: "1.7rem",
    fontWeight: 900,
    color: "#0b1a33",
    letterSpacing: "0.04em",
  },
  cardHint: {
    marginTop: "8px",
    fontSize: "0.8rem",
    color: "#6b7280",
    opacity: 0.9,
  },
  bottomRow: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 2.2fr) minmax(0, 1.2fr)",
    gap: "18px",
  },
  graphPanel: {
    borderRadius: "20px",
    border: "1px solid rgba(15,23,42,0.06)",
    padding: "18px 18px 16px",
    backgroundImage:
      "radial-gradient(circle at top, rgba(148,163,253,0.18), transparent 55%), " +
      "linear-gradient(145deg, #ffffff, #e8f1ff)",
    boxShadow: "0 18px 40px rgba(15,23,42,0.10)",
    color: "#0b1a33",
  },
  sidePanel: {
    borderRadius: "20px",
    border: "1px solid rgba(15,23,42,0.06)",
    padding: "18px 18px 16px",
    backgroundImage:
      "radial-gradient(circle at top, rgba(191,219,254,0.3), transparent 55%), " +
      "linear-gradient(145deg, #ffffff, #f5f7ff)",
    boxShadow: "0 18px 40px rgba(15,23,42,0.10)",
    color: "#0b1a33",
  },
  panelTitle: {
    margin: 0,
    marginBottom: "4px",
    fontSize: "1rem",
    fontWeight: 800,
    color: "#0b1a33",
  },
  panelSubtitle: {
    marginTop: "4px",
    marginBottom: "14px",
    fontSize: "0.85rem",
    color: "#6b7280",
    opacity: 0.95,
  },
  graphBlock: {
    marginTop: "10px",
    padding: "12px 12px 10px",
    borderRadius: "14px",
    backgroundColor: "#ffffff",
    border: "1px solid rgba(15,23,42,0.06)",
  },
  graphHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
  },
  graphTitle: {
    margin: 0,
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "#0b1a33",
  },
  graphTag: {
    fontSize: "0.75rem",
    padding: "4px 8px",
    borderRadius: "999px",
    backgroundColor: "rgba(22,163,74,0.08)",
    color: "#166534",
    fontWeight: 600,
  },
  graphTagMuted: {
    fontSize: "0.75rem",
    padding: "4px 8px",
    borderRadius: "999px",
    backgroundColor: "rgba(148,163,253,0.12)",
    color: "#1e293b",
    fontWeight: 500,
  },
  graphHint: {
    marginTop: "4px",
    marginBottom: "10px",
    fontSize: "0.8rem",
    color: "#6b7280",
    opacity: 0.9,
  },
  legendRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
    fontSize: "0.78rem",
  },
  legendDot: {
    width: "9px",
    height: "9px",
    borderRadius: "999px",
  },
  legendDotConfirmed: {
    backgroundColor: "#4ade80",
  },
  legendDotPending: {
    backgroundColor: "#facc15",
  },
  legendLabel: {
    color: "#4b5563",
  },
  barShell: {
    width: "100%",
    height: "24px",
    borderRadius: "999px",
    backgroundColor: "#e5edff",
    border: "1px solid rgba(15,23,42,0.08)",
    overflow: "hidden",
    display: "flex",
  },
  barSegmentConfirmed: {
    backgroundImage: "linear-gradient(135deg, #22c55e, #16a34a)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.7rem",
    color: "#022c22",
    fontWeight: 700,
  },
  barSegmentPending: {
    backgroundImage: "linear-gradient(135deg, #facc15, #eab308)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.7rem",
    color: "#451a03",
    fontWeight: 700,
  },
  barLabel: {
    padding: "0 6px",
  },
  revenueLabelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
    marginBottom: "6px",
  },
  revenueNow: {
    fontSize: "0.8rem",
    color: "#0b1a33",
  },
  revenuePercent: {
    fontSize: "0.78rem",
    color: "#0a3d91",
    fontWeight: 600,
  },
  revenueBarShell: {
    width: "100%",
    height: "20px",
    borderRadius: "999px",
    backgroundColor: "#e5edff",
    border: "1px solid rgba(15,23,42,0.08)",
    overflow: "hidden",
  },
  revenueBarFill: {
    height: "100%",
    borderRadius: "999px",
    backgroundImage: "linear-gradient(135deg, #0a3d91, #1e5fe0)",
    boxShadow: "0 10px 22px rgba(37,99,235,0.45)",
    transition: "width 0.3s ease",
  },
  locationBox: {
    marginTop: "4px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "12px 12px",
    fontSize: "0.9rem",
    color: "#0b1a33",
    border: "1px solid rgba(15,23,42,0.08)",
  },
  loadingText: {
    fontSize: "0.85rem",
    color: "#6b7280",
  },
  error: {
    fontSize: "0.85rem",
    color: "#b91c1c",
    marginBottom: "8px",
  },
};

export default ManagementOverview;
