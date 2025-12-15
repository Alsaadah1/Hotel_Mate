// src/pages/FinanceReport.jsx

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Navbar from "../components/Navbar";
import { jsPDF } from "jspdf";
import { Bar } from "react-chartjs-2";
import Swal from "sweetalert2";
import "chart.js/auto";
import { useSelector } from "react-redux";

const FinanceReport = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showChart, setShowChart] = useState(false);

  const user = useSelector((state) => state.users.user);
  const API_URL = process.env.REACT_APP_SERVER_URL;

  const fetchBillingData = useCallback(async () => {
    if (!user?._id) return;

    try {
      // ✅ Use bookings API and owner id
      const res = await fetch(`${API_URL}/api/bookings/owner/${user._id}`);

      if (!res.ok) {
        console.error(
          "Failed to fetch bookings for finance, status:",
          res.status
        );
        setBookings([]);
        setFilteredBookings([]);
        return;
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : [];

      // ✅ Only count APPROVED / confirmed stays
      const approvedBookings = list.filter(
        (booking) => (booking.status || "").toLowerCase() === "approved"
      );

      setBookings(approvedBookings);
      setFilteredBookings(approvedBookings);
    } catch (error) {
      console.error("Error fetching finance data:", error);
      Swal.fire("Error", "Could not fetch finance data.", "error");
    }
  }, [API_URL, user]);

  useEffect(() => {
    if (user?.role === "owner") {
      fetchBillingData();
    }
  }, [user, fetchBillingData]);

  const handleFilter = () => {
    if (!fromDate || !toDate) {
      Swal.fire(
        "Missing dates",
        "Please select both From and To dates!",
        "warning"
      );
      return;
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    const filtered = bookings.filter((booking) => {
      if (!booking.bookingDate) return false;
      const bookingDt = new Date(booking.bookingDate);
      return bookingDt >= from && bookingDt <= to;
    });

    setFilteredBookings(filtered);
  };

  const totalEarnings = useMemo(() => {
    return filteredBookings.reduce(
      (total, booking) => total + Number(booking.totalCost || 0),
      0
    );
  }, [filteredBookings]);

  const totalCount = filteredBookings.length;

  const handleDownloadPDF = () => {
    if (filteredBookings.length === 0) {
      Swal.fire("No data", "There are no bookings in the selected range.", "info");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Hotel Mate – Finance Report", 10, 12);

    doc.setFontSize(11);
    doc.text(`Manager: ${user?.name || user?.email || "N/A"}`, 10, 20);
    if (fromDate && toDate) {
      doc.text(`Period: ${fromDate} to ${toDate}`, 10, 26);
    }

    let y = 36;
    filteredBookings.forEach((booking, index) => {
      const line =
        `${index + 1}. Room: ${booking.roomName || "N/A"} | ` +
        `${Number(booking.totalCost || 0).toFixed(2)} OMR | ` +
        `${
          booking.bookingDate
            ? new Date(booking.bookingDate).toLocaleDateString()
            : "N/A"
        }`;
      doc.text(line, 10, y);
      y += 8;
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });

    doc.setFontSize(12);
    doc.text(
      `Total Earnings: ${totalEarnings.toFixed(2)} OMR`,
      10,
      y + 8 > 280 ? 280 : y + 8
    );

    doc.save("finance_report.pdf");
    Swal.fire("Downloaded!", "Finance report PDF has been saved.", "success");
  };

  // ✅ Chart uses roomName + totalCost
  const chartData = useMemo(() => {
    return {
      labels: filteredBookings.map((booking) => booking.roomName || "Room"),
      datasets: [
        {
          label: "Revenue per Room (OMR)",
          data: filteredBookings.map((booking) =>
            Number(booking.totalCost || 0).toFixed(2)
          ),
          backgroundColor: "rgba(212,175,55,0.45)",
          borderColor: "rgba(212,175,55,0.95)",
          borderWidth: 1,
        },
      ],
    };
  }, [filteredBookings]);

  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            font: { size: 11 },
            color: "#fffaf3",
          },
        },
      },
      scales: {
        x: {
          ticks: { color: "#fffaf3", font: { size: 10 } },
          grid: { color: "rgba(245,210,122,0.18)" },
        },
        y: {
          beginAtZero: true,
          ticks: { color: "#fffaf3", font: { size: 10 } },
          grid: { color: "rgba(245,210,122,0.18)" },
        },
      },
    };
  }, []);

  // Guard: only owners / hotel managers
  if (!user || user.role !== "owner") {
    return (
      <>
        <Navbar />
        <div style={styles.page}>
          <div style={styles.wrapper}>
            <div style={styles.noticeBox}>
              <h2 style={styles.noticeTitle}>Manager access required</h2>
              <p style={styles.noticeText}>
                This finance overview is only available for hotel managers. Please log in
                with a manager account.
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
              <p style={styles.headerKicker}>Hotel Mate · Finance</p>
              <h1 style={styles.heading}>Earnings & revenue overview</h1>
              <p style={styles.subtitle}>
                Analyse confirmed stays, view revenue trends, and export a PDF snapshot
                for your records.
              </p>
            </div>

            <div style={styles.headerActions}>
              <button
                style={styles.headerBtnSoft}
                type="button"
                onClick={() => setShowChart(true)}
              >
                View chart
              </button>

              <button
                style={styles.headerBtn}
                type="button"
                onClick={handleDownloadPDF}
              >
                <span style={styles.headerBtnIcon}>⬇</span>
                <span>Download PDF</span>
              </button>
            </div>
          </header>

          {/* Summary cards */}
          <section style={styles.cardsGrid}>
            <div style={{ ...styles.card, ...styles.cardTotal }}>
              <p style={styles.cardLabel}>Confirmed stays</p>
              <div style={styles.metric}>{bookings.length}</div>
              <div style={styles.cardHint}>Approved bookings only</div>
            </div>

            <div style={{ ...styles.card, ...styles.cardFiltered }}>
              <p style={styles.cardLabel}>Stays in view</p>
              <div style={styles.metric}>{totalCount}</div>
              <div style={styles.cardHint}>Based on selected dates</div>
            </div>

            <div style={{ ...styles.card, ...styles.cardRevenue }}>
              <p style={styles.cardLabel}>Total revenue</p>
              <div style={styles.metric}>OMR {totalEarnings.toFixed(2)}</div>
              <div style={styles.cardHint}>Current filtered view</div>
            </div>

            <div style={{ ...styles.card, ...styles.cardAverage }}>
              <p style={styles.cardLabel}>Average / booking</p>
              <div style={styles.metric}>
                {totalCount > 0 ? (totalEarnings / totalCount).toFixed(2) : "0.00"}{" "}
                OMR
              </div>
              <div style={styles.cardHint}>Mean earnings per stay</div>
            </div>
          </section>

          {/* Filter panel */}
          <section style={styles.panel}>
            <div style={styles.panelTop}>
              <div>
                <h2 style={styles.panelTitle}>Filter by booking date</h2>
                <p style={styles.panelSubtitle}>
                  Pick a date range to calculate revenue and export a report.
                </p>
              </div>

              <div style={styles.totalChip}>
                <span style={styles.totalChipLabel}>Total (view)</span>
                <span style={styles.totalChipValue}>OMR {totalEarnings.toFixed(2)}</span>
              </div>
            </div>

            <div style={styles.filterRow}>
              <div style={styles.field}>
                <label style={styles.label}>From</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  style={styles.dateInput}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>To</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  style={styles.dateInput}
                />
              </div>

              <button style={styles.primaryBtn} onClick={handleFilter} type="button">
                Apply filter
              </button>

              <button
                style={styles.secondaryBtn}
                type="button"
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                  setFilteredBookings(bookings);
                }}
              >
                Reset
              </button>
            </div>
          </section>

          {/* Bookings Table */}
          <section style={styles.panel}>
            <div style={styles.tableHead}>
              <div>
                <h2 style={styles.panelTitle}>Confirmed guest stays</h2>
                <p style={styles.panelSubtitle}>
                  Only bookings with status <strong>Approved</strong> are included.
                </p>
              </div>

              <div style={styles.tableChip}>
                <span style={styles.tableChipLabel}>Rows</span>
                <span style={styles.tableChipValue}>{totalCount}</span>
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={styles.emptyTitle}>No confirmed stays in selected range</p>
                <p style={styles.emptyText}>
                  Try adjusting the date range or wait until more bookings are confirmed.
                </p>
              </div>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Room</th>
                      <th style={styles.th}>Guest</th>
                      <th style={styles.thCenter}>Total amount</th>
                      <th style={styles.thCenter}>Booking date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking, index) => (
                      <tr
                        key={`${booking._id || "b"}-${index}`}
                        style={index % 2 === 0 ? styles.rowEven : styles.rowOdd}
                      >
                        <td style={styles.td}>{booking.roomName || "—"}</td>
                        <td style={styles.td}>
                          <span style={styles.guestName}>
                            {booking.customerName || "Guest"}
                          </span>
                        </td>
                        <td style={styles.tdCenter}>
                          <span style={styles.amountChip}>
                            OMR {Number(booking.totalCost || 0).toFixed(2)}
                          </span>
                        </td>
                        <td style={styles.tdCenter}>
                          {booking.bookingDate
                            ? new Date(booking.bookingDate).toLocaleDateString()
                            : "N/A"}
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

      {/* Chart Modal */}
      {showChart && (
        <div style={styles.modalOverlay} role="dialog" aria-modal="true">
          <div style={styles.modal}>
            <div style={styles.modalHead}>
              <h3 style={styles.modalTitle}>Revenue by room</h3>
              <button
                style={styles.modalClose}
                type="button"
                onClick={() => setShowChart(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              {filteredBookings.length === 0 ? (
                <p style={styles.modalText}>No data to display. Try changing the filter.</p>
              ) : (
                <div style={styles.chartShell}>
                  <Bar data={chartData} options={chartOptions} />
                </div>
              )}
            </div>

            <div style={styles.modalFoot}>
              <button
                style={styles.secondaryBtnModal}
                type="button"
                onClick={() => setShowChart(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#faf6f1",
    backgroundImage:
      "radial-gradient(circle at top right, rgba(226, 184, 44, 0.30), transparent 55%), " +
      "radial-gradient(circle at bottom left, rgba(212,175,55,0.22), transparent 55%)",
  },
  wrapper: {
    maxWidth: "1120px",
    margin: "0 auto",
    padding: "22px 16px 40px",
  },

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
    fontWeight: 900,
  },
  heading: {
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
    fontWeight: 700,
    maxWidth: 680,
  },
  headerActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  headerBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    borderRadius: "999px",
    border: "none",
    backgroundImage: "linear-gradient(135deg,#7a4a2e,#d4af37)",
    color: "#fffaf3",
    fontWeight: 900,
    fontSize: "0.85rem",
    cursor: "pointer",
    whiteSpace: "nowrap",
    boxShadow: "0 14px 32px rgba(61,42,20,0.22)",
  },
  headerBtnSoft: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.22)",
    backgroundColor: "rgba(255,255,255,0.12)",
    color: "#fffaf3",
    fontWeight: 900,
    fontSize: "0.85rem",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  headerBtnIcon: {
    fontSize: "0.95rem",
  },

  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "14px",
    marginBottom: "20px",
  },
  card: {
    borderRadius: "16px",
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
  cardFiltered: {
    backgroundImage:
      "radial-gradient(circle at top, rgba(245,210,122,0.22), transparent 55%), " +
      "linear-gradient(145deg, #ffffff, #fff7e6)",
  },
  cardRevenue: {
    backgroundImage:
      "radial-gradient(circle at top, rgba(212,175,55,0.20), transparent 55%), " +
      "linear-gradient(145deg, #ffffff, #fffdf8)",
  },
  cardAverage: {
    backgroundImage:
      "radial-gradient(circle at top, rgba(34,197,94,0.10), transparent 55%), " +
      "linear-gradient(145deg, #ffffff, #f3fff7)",
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
    fontSize: "1.55rem",
    fontWeight: 900,
    color: "#3d2a14",
  },
  cardHint: {
    marginTop: 6,
    fontSize: "0.78rem",
    color: "#8c7a55",
    fontWeight: 700,
  },

  panel: {
    borderRadius: "20px",
    border: "1px solid rgba(212,175,55,0.22)",
    padding: "16px 16px 14px",
    backgroundColor: "#ffffff",
    boxShadow: "0 18px 40px rgba(61,42,20,0.10)",
    color: "#3d2a14",
    marginBottom: "20px",
  },
  panelTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  panelTitle: {
    margin: 0,
    fontSize: "1rem",
    fontWeight: 900,
    color: "#3d2a14",
  },
  panelSubtitle: {
    marginTop: 4,
    marginBottom: 0,
    fontSize: "0.85rem",
    color: "#6b5a3c",
    opacity: 0.95,
    fontWeight: 700,
  },

  totalChip: {
    borderRadius: "999px",
    padding: "6px 12px",
    backgroundColor: "rgba(212,175,55,0.14)",
    border: "1px solid rgba(212,175,55,0.22)",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  totalChipLabel: { color: "#6b5a3c", fontWeight: 900, fontSize: "0.82rem" },
  totalChipValue: { color: "#5a3a1a", fontWeight: 900, fontSize: "0.88rem" },

  filterRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    alignItems: "flex-end",
  },
  field: { display: "grid", gap: 6 },
  label: {
    display: "block",
    fontSize: "0.8rem",
    color: "#6b5a3c",
    fontWeight: 900,
  },
  dateInput: {
    padding: "9px 10px",
    borderRadius: "12px",
    border: "1px solid rgba(212,175,55,0.30)",
    fontSize: "0.9rem",
    outline: "none",
    backgroundColor: "#ffffff",
    color: "#3d2a14",
    fontWeight: 800,
  },
  primaryBtn: {
    padding: "10px 16px",
    borderRadius: "999px",
    border: "none",
    backgroundImage: "linear-gradient(135deg,#7a4a2e,#d4af37)",
    color: "#fffaf3",
    fontWeight: 900,
    fontSize: "0.9rem",
    cursor: "pointer",
    boxShadow: "0 12px 26px rgba(61,42,20,0.18)",
    whiteSpace: "nowrap",
  },
  secondaryBtn: {
    padding: "10px 16px",
    borderRadius: "999px",
    border: "1px solid rgba(212,175,55,0.35)",
    backgroundColor: "#ffffff",
    color: "#3d2a14",
    fontWeight: 900,
    fontSize: "0.9rem",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  tableHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  tableChip: {
    borderRadius: "999px",
    padding: "6px 12px",
    backgroundColor: "rgba(245,210,122,0.16)",
    border: "1px solid rgba(212,175,55,0.22)",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  tableChipLabel: { color: "#6b5a3c", fontWeight: 900, fontSize: "0.82rem" },
  tableChipValue: { color: "#5a3a1a", fontWeight: 900, fontSize: "0.88rem" },

  tableWrapper: { width: "100%", overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", borderRadius: 14, overflow: "hidden" },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    fontSize: "0.8rem",
    color: "#fffaf3",
    borderBottom: "1px solid rgba(245,210,122,0.22)",
    backgroundColor: "#5a3a1a",
    whiteSpace: "nowrap",
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
  td: {
    padding: "10px 12px",
    borderBottom: "1px solid rgba(212,175,55,0.20)",
    verticalAlign: "middle",
    fontSize: "0.9rem",
    color: "#3d2a14",
    fontWeight: 800,
  },
  tdCenter: {
    padding: "10px 12px",
    borderBottom: "1px solid rgba(212,175,55,0.20)",
    verticalAlign: "middle",
    fontSize: "0.9rem",
    color: "#3d2a14",
    textAlign: "center",
    fontWeight: 800,
  },
  guestName: { fontWeight: 900, color: "#3d2a14" },
  amountChip: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 999,
    backgroundColor: "rgba(212,175,55,0.18)",
    border: "1px solid rgba(212,175,55,0.22)",
    color: "#5a3a1a",
    fontSize: "0.82rem",
    fontWeight: 900,
  },

  emptyState: { padding: "22px 10px 10px", textAlign: "center" },
  emptyTitle: { margin: 0, fontWeight: 900, color: "#3d2a14", fontSize: "1rem" },
  emptyText: { marginTop: 6, fontSize: "0.85rem", color: "#6b5a3c", fontWeight: 700, opacity: 0.95 },

  noticeBox: {
    maxWidth: 520,
    margin: "60px auto 0",
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

  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(61,42,20,0.65)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 12,
  },
  modal: {
    width: "min(820px, 100%)",
    backgroundColor: "#2b1a0f",
    borderRadius: 18,
    border: "1px solid rgba(245,210,122,0.35)",
    boxShadow: "0 32px 80px rgba(0,0,0,0.75)",
    overflow: "hidden",
    color: "#fffaf3",
  },
  modalHead: {
    padding: "12px 16px",
    borderBottom: "1px solid rgba(245,210,122,0.22)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  modalTitle: { margin: 0, fontSize: "1rem", fontWeight: 900 },
  modalClose: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "1rem",
    color: "#fffaf3",
    fontWeight: 900,
  },
  modalBody: { padding: 16 },
  modalText: { margin: 0, color: "#f3e6d8", fontWeight: 700 },
  chartShell: {
    backgroundColor: "rgba(0,0,0,0.18)",
    borderRadius: 14,
    padding: 12,
    border: "1px solid rgba(245,210,122,0.18)",
  },
  modalFoot: {
    padding: "12px 16px",
    borderTop: "1px solid rgba(245,210,122,0.22)",
    display: "flex",
    justifyContent: "flex-end",
  },
  secondaryBtnModal: {
    padding: "10px 16px",
    borderRadius: 999,
    border: "1px solid rgba(245,210,122,0.30)",
    backgroundColor: "transparent",
    color: "#fffaf3",
    fontWeight: 900,
    cursor: "pointer",
  },

  "@media (max-width: 980px)": {},
};

export default FinanceReport;
