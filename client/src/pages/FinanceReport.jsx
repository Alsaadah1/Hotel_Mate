// src/pages/FinanceReport.jsx

import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { jsPDF } from 'jspdf';
import { Bar } from 'react-chartjs-2';
import Swal from 'sweetalert2';
import 'chart.js/auto';
import { useSelector } from 'react-redux';

const FinanceReport = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showChart, setShowChart] = useState(false);

  const user = useSelector((state) => state.users.user);
  const API_URL = process.env.REACT_APP_SERVER_URL;

  const fetchBillingData = useCallback(async () => {
    if (!user?._id) return;

    try {
      // ✅ Use bookings API and owner id
      const res = await fetch(`${API_URL}/api/bookings/owner/${user._id}`);

      if (!res.ok) {
        console.error('Failed to fetch bookings for finance, status:', res.status);
        setBookings([]);
        setFilteredBookings([]);
        return;
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : [];

      // ✅ Only count APPROVED / confirmed stays
      const approvedBookings = list.filter(
        (booking) => (booking.status || '').toLowerCase() === 'approved'
      );

      setBookings(approvedBookings);
      setFilteredBookings(approvedBookings);
    } catch (error) {
      console.error('Error fetching finance data:', error);
      Swal.fire('Error', 'Could not fetch finance data.', 'error');
    }
  }, [API_URL, user]);

  useEffect(() => {
    if (user?.role === 'owner') {
      fetchBillingData();
    }
  }, [user, fetchBillingData]);

  const handleFilter = () => {
    if (!fromDate || !toDate) {
      Swal.fire('Missing dates', 'Please select both From and To dates!', 'warning');
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

  const calculateTotalEarnings = () =>
    filteredBookings.reduce(
      (total, booking) => total + Number(booking.totalCost || 0),
      0
    );

  const totalEarnings = calculateTotalEarnings();
  const totalCount = filteredBookings.length;

  const handleDownloadPDF = () => {
    if (filteredBookings.length === 0) {
      Swal.fire('No data', 'There are no bookings in the selected range.', 'info');
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Hotel Mate – Finance Report', 10, 12);

    doc.setFontSize(11);
    doc.text(`Manager: ${user?.name || 'N/A'}`, 10, 20);
    if (fromDate && toDate) {
      doc.text(`Period: ${fromDate} to ${toDate}`, 10, 26);
    }

    let y = 36;
    filteredBookings.forEach((booking, index) => {
      const line =
        `${index + 1}. Room: ${booking.roomName} | ` +
        `${Number(booking.totalCost || 0).toFixed(2)} OMR | ` +
        `${
          booking.bookingDate
            ? new Date(booking.bookingDate).toLocaleDateString()
            : 'N/A'
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
    doc.save('finance_report.pdf');

    Swal.fire('Downloaded!', 'Finance report PDF has been saved.', 'success');
  };

  // ✅ Chart uses roomName + totalCost
  const chartData = {
    labels: filteredBookings.map((booking) => booking.roomName),
    datasets: [
      {
        label: 'Revenue per Room (OMR)',
        data: filteredBookings.map((booking) =>
          Number(booking.totalCost || 0).toFixed(2)
        ),
        backgroundColor: 'rgba(56, 189, 248, 0.6)',
        borderColor: 'rgba(56, 189, 248, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          font: { size: 11 },
          color: '#e5e7eb',
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#e5e7eb', font: { size: 10 } },
        grid: { color: 'rgba(148,163,184,0.3)' },
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#e5e7eb', font: { size: 10 } },
        grid: { color: 'rgba(148,163,184,0.3)' },
      },
    },
  };

  // Guard: only owners / hotel managers
  if (!user || user.role !== 'owner') {
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
            <button
              style={styles.headerBtn}
              type="button"
              onClick={handleDownloadPDF}
            >
              <span style={styles.headerBtnIcon}>⬇</span>
              <span>Download PDF report</span>
            </button>
          </header>

          {/* Summary cards */}
          <section style={styles.cardsGrid}>
            <div style={{ ...styles.card, ...styles.cardTotal }}>
              <p style={styles.cardLabel}>Confirmed stays</p>
              <div style={styles.metric}>{bookings.length}</div>
            </div>
            <div style={{ ...styles.card, ...styles.cardFiltered }}>
              <p style={styles.cardLabel}>Stays in view</p>
              <div style={styles.metric}>{totalCount}</div>
            </div>
            <div style={{ ...styles.card, ...styles.cardRevenue }}>
              <p style={styles.cardLabel}>Total revenue</p>
              <div style={styles.metric}>OMR {totalEarnings.toFixed(2)}</div>
            </div>
            <div style={{ ...styles.card, ...styles.cardAverage }}>
              <p style={styles.cardLabel}>Average per booking</p>
              <div style={styles.metric}>
                {totalCount > 0 ? (totalEarnings / totalCount).toFixed(2) : '0.00'} OMR
              </div>
            </div>
          </section>

          {/* Filter panel */}
          <section style={styles.panel}>
            <div style={styles.filterRow}>
              <div>
                <label style={styles.label}>From</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  style={styles.dateInput}
                />
              </div>

              <div>
                <label style={styles.label}>To</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  style={styles.dateInput}
                />
              </div>

              <button style={styles.primaryBtn} onClick={handleFilter}>
                Apply filter
              </button>

              <div style={styles.actionsRight}>
                <button
                  style={styles.chartBtn}
                  onClick={() => setShowChart(true)}
                  type="button"
                >
                  View revenue chart
                </button>
              </div>
            </div>
          </section>

          {/* Total line */}
          <div style={styles.totalBox}>
            <span style={styles.totalLabel}>Total revenue (current view)</span>
            <span style={styles.totalValue}>OMR {totalEarnings.toFixed(2)}</span>
          </div>

          {/* Bookings Table */}
          <section style={styles.panel}>
            <h2 style={styles.panelTitle}>Confirmed guest stays</h2>
            <p style={styles.panelSubtitle}>
              Only bookings with status <strong>Approved</strong> are included in this
              finance overview.
            </p>

            {filteredBookings.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={styles.emptyTitle}>No confirmed stays in selected range</p>
                <p style={styles.emptyText}>
                  Try adjusting the date range or wait until more guest bookings are
                  confirmed.
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
                        key={index}
                        style={index % 2 === 0 ? styles.rowEven : styles.rowOdd}
                      >
                        <td style={styles.td}>{booking.roomName}</td>
                        <td style={styles.td}>
                          <span style={styles.guestName}>
                            {booking.customerName || 'Guest'}
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
                            : 'N/A'}
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
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHead}>
              <h3 style={styles.modalTitle}>Revenue by room</h3>
              <button
                style={styles.modalClose}
                type="button"
                onClick={() => setShowChart(false)}
              >
                ✕
              </button>
            </div>
            <div style={styles.modalBody}>
              {filteredBookings.length === 0 ? (
                <p style={styles.emptyText}>
                  No data to display. Try changing the filter dates.
                </p>
              ) : (
                <div style={styles.chartShell}>
                  <Bar data={chartData} options={chartOptions} />
                </div>
              )}
            </div>
            <div style={styles.modalFoot}>
              <button
                style={styles.secondaryBtn}
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
    minHeight: '100vh',
    backgroundColor: '#f3f6fb',
    backgroundImage:
      'radial-gradient(circle at top right, rgba(148,163,253,0.35), transparent 55%), ' +
      'radial-gradient(circle at bottom left, rgba(56,189,248,0.18), transparent 55%)',
  },
  wrapper: {
    maxWidth: '1120px',
    margin: '0 auto',
    padding: '22px 16px 40px',
  },

  // Header band
  headerBand: {
    marginBottom: '18px',
    padding: '16px 16px 14px',
    borderRadius: '18px',
    border: '1px solid rgba(15,23,42,0.06)',
    backgroundImage:
      'radial-gradient(circle at top, rgba(148,163,253,0.28), transparent 55%), ' +
      'linear-gradient(145deg, #0a3d91, #1e5fe0)',
    boxShadow: '0 18px 38px rgba(15,23,42,0.22)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    color: '#f9fafb',
    flexWrap: 'wrap',
  },
  headerKicker: {
    margin: 0,
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    color: '#bfdbfe',
  },
  heading: {
    margin: '4px 0 4px',
    fontSize: '22px',
    fontWeight: 800,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: '#f9fafb',
  },
  subtitle: {
    margin: 0,
    fontSize: '13px',
    color: '#e5e7eb',
    opacity: 0.95,
  },
  headerBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 16px',
    borderRadius: '999px',
    border: 'none',
    background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
    color: '#f9fafb',
    fontWeight: 700,
    fontSize: '0.85rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    boxShadow: '0 12px 26px rgba(37,99,235,0.45)',
  },
  headerBtnIcon: {
    fontSize: '0.9rem',
  },

  // Cards
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '14px',
    marginBottom: '20px',
  },
  card: {
    borderRadius: '16px',
    padding: '14px 14px 12px',
    border: '1px solid rgba(15,23,42,0.06)',
    boxShadow: '0 10px 22px rgba(15,23,42,0.12)',
    color: '#0b1a33',
    backgroundColor: '#ffffff',
  },
  cardTotal: {
    backgroundImage:
      'radial-gradient(circle at top, rgba(191,219,254,0.45), transparent 55%), ' +
      'linear-gradient(145deg, #ffffff, #f5f7ff)',
  },
  cardFiltered: {
    backgroundImage:
      'radial-gradient(circle at top, rgba(221,214,254,0.55), transparent 55%), ' +
      'linear-gradient(145deg, #ffffff, #f5f3ff)',
  },
  cardRevenue: {
    backgroundImage:
      'radial-gradient(circle at top, rgba(191,219,254,0.68), transparent 55%), ' +
      'linear-gradient(145deg, #ffffff, #eff6ff)',
  },
  cardAverage: {
    backgroundImage:
      'radial-gradient(circle at top, rgba(187,247,208,0.65), transparent 55%), ' +
      'linear-gradient(145deg, #ffffff, #ecfdf5)',
  },
  cardLabel: {
    margin: 0,
    marginBottom: '4px',
    fontSize: '0.78rem',
    color: '#4b5563',
    opacity: 0.9,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  metric: {
    fontSize: '1.7rem',
    fontWeight: 900,
    color: '#0f172a',
  },

  // Panel + filter row
  panel: {
    borderRadius: '20px',
    border: '1px solid rgba(15,23,42,0.06)',
    padding: '16px 16px 14px',
    backgroundColor: '#ffffff',
    boxShadow: '0 18px 40px rgba(15,23,42,0.12)',
    color: '#0b1a33',
    marginBottom: '20px',
  },
  filterRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  label: {
    display: 'block',
    marginBottom: '4px',
    fontSize: '0.8rem',
    color: '#374151',
    fontWeight: 600,
  },
  dateInput: {
    padding: '8px 10px',
    borderRadius: '10px',
    border: '1px solid rgba(148,163,184,0.7)',
    fontSize: '0.9rem',
    outline: 'none',
    backgroundColor: '#ffffff',
    color: '#111827',
  },
  actionsRight: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  primaryBtn: {
    padding: '9px 16px',
    borderRadius: '999px',
    border: 'none',
    background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
    color: '#ffffff',
    fontWeight: 700,
    fontSize: '0.9rem',
    cursor: 'pointer',
    boxShadow: '0 10px 22px rgba(37,99,235,0.35)',
  },
  secondaryBtn: {
    padding: '9px 16px',
    borderRadius: '999px',
    border: '1px solid #dbe2f0',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontWeight: 600,
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  chartBtn: {
    padding: '9px 16px',
    borderRadius: '999px',
    border: 'none',
    background: 'linear-gradient(135deg,#0ea5e9,#0369a1)',
    color: '#ffffff',
    fontWeight: 700,
    fontSize: '0.9rem',
    cursor: 'pointer',
    boxShadow: '0 10px 22px rgba(14,165,233,0.4)',
  },

  // Panel titles
  panelTitle: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 800,
  },
  panelSubtitle: {
    marginTop: '4px',
    marginBottom: '12px',
    fontSize: '0.85rem',
    color: '#6b7280',
    opacity: 0.95,
  },

  // Total box
  totalBox: {
    margin: '10px 0 18px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderRadius: '12px',
    padding: '10px 14px',
    border: '1px solid rgba(37,99,235,0.25)',
  },
  totalLabel: {
    fontSize: '0.9rem',
    color: '#1e3a8a',
    fontWeight: 600,
  },
  totalValue: {
    fontSize: '1.05rem',
    fontWeight: 800,
    color: '#1d4ed8',
  },

  // Table
  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    borderRadius: '14px',
    overflow: 'hidden',
  },
  th: {
    textAlign: 'left',
    padding: '10px 12px',
    fontSize: '0.8rem',
    color: '#e5f0ff',
    borderBottom: '1px solid rgba(148,163,184,0.4)',
    backgroundColor: '#0f172a',
    whiteSpace: 'nowrap',
  },
  thCenter: {
    textAlign: 'center',
    padding: '10px 12px',
    fontSize: '0.8rem',
    color: '#e5f0ff',
    borderBottom: '1px solid rgba(148,163,184,0.4)',
    backgroundColor: '#0f172a',
    whiteSpace: 'nowrap',
  },
  rowEven: {
    backgroundColor: '#f9fafb',
  },
  rowOdd: {
    backgroundColor: '#eff6ff',
  },
  td: {
    padding: '10px 12px',
    borderBottom: '1px solid rgba(148,163,184,0.25)',
    verticalAlign: 'middle',
    fontSize: '0.88rem',
    color: '#0f172a',
  },
  tdCenter: {
    padding: '10px 12px',
    borderBottom: '1px solid rgba(148,163,184,0.25)',
    verticalAlign: 'middle',
    fontSize: '0.88rem',
    color: '#0f172a',
    textAlign: 'center',
  },
  guestName: {
    fontWeight: 600,
    color: '#111827',
  },
  amountChip: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '999px',
    backgroundColor: 'rgba(37,99,235,0.08)',
    color: '#1d4ed8',
    fontSize: '0.8rem',
    fontWeight: 700,
  },

  // Empty + notice
  emptyState: {
    padding: '22px 10px 10px',
    textAlign: 'center',
  },
  emptyTitle: {
    margin: 0,
    fontWeight: 800,
    color: '#0f172a',
    fontSize: '1rem',
  },
  emptyText: {
    marginTop: '6px',
    fontSize: '0.85rem',
    color: '#6b7280',
    opacity: 0.95,
  },
  noticeBox: {
    maxWidth: '520px',
    margin: '60px auto 0',
    backgroundColor: '#ffffff',
    borderRadius: '18px',
    border: '1px solid rgba(15,23,42,0.12)',
    padding: '24px 20px',
    textAlign: 'center',
    boxShadow: '0 30px 80px rgba(15,23,42,0.20)',
    color: '#0b1a33',
  },
  noticeTitle: {
    margin: 0,
    fontSize: '1.2rem',
    fontWeight: 800,
  },
  noticeText: {
    marginTop: '8px',
    fontSize: '0.9rem',
    color: '#4b5563',
    opacity: 0.95,
  },

  // Modal
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(15,23,42,0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '12px',
  },
  modal: {
    width: 'min(720px, 100%)',
    backgroundColor: '#020617',
    borderRadius: '18px',
    border: '1px solid rgba(148,163,184,0.6)',
    boxShadow: '0 32px 80px rgba(0,0,0,0.9)',
    overflow: 'hidden',
    color: '#f9fafb',
  },
  modalHead: {
    padding: '12px 16px',
    borderBottom: '1px solid rgba(148,163,184,0.5)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 700,
  },
  modalClose: {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '1rem',
    color: '#e5e7eb',
  },
  modalBody: {
    padding: '16px',
  },
  chartShell: {
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderRadius: '14px',
    padding: '12px',
  },
  modalFoot: {
    padding: '12px 16px',
    borderTop: '1px solid rgba(148,163,184,0.5)',
    display: 'flex',
    justifyContent: 'flex-end',
  },
};

export default FinanceReport;
