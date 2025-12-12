// src/pages/BookingRequests.jsx

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';

const BookingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');

  const user = useSelector((state) => state.users.user);
  const API_URL = process.env.REACT_APP_SERVER_URL;

  const isManagerLike =
    user && (user.role === 'owner' || user.role === 'staff'); // ✅ owner OR staff

  // 🔹 Fetch bookings for this owner/staff (by ownerId)
  const fetchRequests = async (ownerId) => {
    if (!ownerId) return;

    try {
      const res = await fetch(`${API_URL}/api/bookings/owner/${ownerId}`);

      if (!res.ok) {
        console.error('Failed to fetch booking requests, status:', res.status);
        setRequests([]);
        setFilteredRequests([]);
        return;
      }

      const data = await res.json();
      const arr = Array.isArray(data) ? data : [];
      setRequests(arr);
      setFilteredRequests(arr);
    } catch (error) {
      console.error('Error fetching booking requests:', error);
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
      title: 'Are you sure?',
      text: `You want to ${newStatus.toLowerCase()} this booking?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1e5fe0', // 🔵 blue theme
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Yes, ${newStatus}!`,
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_URL}/api/bookings/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });

        const data = await res.json();
        if (res.ok) {
          Swal.fire('Updated', 'Guest booking status updated.', 'success');
          // 🔁 reload bookings for this owner
          if (user?._id) {
            fetchRequests(user._id);
          }
        } else {
          Swal.fire(
            'Error',
            data.message || 'Error updating booking.',
            'error'
          );
        }
      } catch (error) {
        console.error('Error updating booking:', error);
        Swal.fire('Error', 'Error updating booking.', 'error');
      }
    }
  };

  const handleFilterChange = (e) => {
    const status = e.target.value;
    setFilterStatus(status);

    if (status === 'all') {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(
        requests.filter(
          (req) => (req.status || '').toLowerCase() === status
        )
      );
    }
  };

  const getStatusBadgeStyle = (statusRaw) => {
    const status = (statusRaw || '').toLowerCase();
    if (status === 'approved') {
      return { ...styles.badge, ...styles.badgeApproved };
    }
    if (status === 'rejected') {
      return { ...styles.badge, ...styles.badgeRejected };
    }
    return { ...styles.badge, ...styles.badgePending };
  };

  const formatStatus = (statusRaw) => {
    if (!statusRaw) return 'Pending';
    return (
      statusRaw.charAt(0).toUpperCase() +
      statusRaw.slice(1).toLowerCase()
    );
  };

  const total = requests.length;
  const pendingCount = requests.filter(
    (r) => (r.status || '').toLowerCase() === 'pending'
  ).length;
  const approvedCount = requests.filter(
    (r) => (r.status || '').toLowerCase() === 'approved'
  ).length;
  const rejectedCount = requests.filter(
    (r) => (r.status || '').toLowerCase() === 'rejected'
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
                              {req.image && (
                                <img
                                  src={`${API_URL}/assets/images/${req.image}`}
                                  alt={req.roomName}
                                  style={styles.image}
                                />
                              )}
                            </div>
                            <div>
                              <div style={styles.roomName}>{req.roomName}</div>
                              <div style={styles.roomMeta}>
                                Booking ID: {req._id?.slice(-6) || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* backend adds customerName in getBookingsByOwner */}
                        <td style={styles.td}>
                          <span style={styles.guestName}>
                            {req.customerName || 'Guest'}
                          </span>
                        </td>

                        <td style={styles.tdCenter}>{req.stayDuration}</td>

                        <td style={styles.tdCenter}>
                          <span style={styles.amountChip}>
                            {Number(req.totalCost || 0).toFixed(2)} OMR
                          </span>
                        </td>

                        <td style={styles.tdCenter}>
                          <span style={getStatusBadgeStyle(req.status)}>
                            {formatStatus(req.status)}
                          </span>
                        </td>

                        <td style={styles.tdCenter}>
                          {(req.status || '').toLowerCase() === 'pending' ? (
                            <div style={styles.actionButtons}>
                              <button
                                style={{
                                  ...styles.smallBtn,
                                  ...styles.smallBtnApprove,
                                }}
                                type="button"
                                onClick={() =>
                                  handleUpdateStatus(req._id, 'Approved')
                                }
                              >
                                Approve
                              </button>
                              <button
                                style={{
                                  ...styles.smallBtn,
                                  ...styles.smallBtnReject,
                                }}
                                type="button"
                                onClick={() =>
                                  handleUpdateStatus(req._id, 'Rejected')
                                }
                              >
                                Reject
                              </button>
                            </div>
                          ) : (req.status || '').toLowerCase() === 'approved' ? (
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
  title: {
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

  filterBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 12px',
    borderRadius: '999px',
    backgroundColor: '#eff6ff',
    border: '1px solid rgba(37,99,235,0.35)',
  },
  filterLabel: {
    fontSize: '0.78rem',
    color: '#1e3a8a',
  },
  select: {
    padding: '6px 10px',
    borderRadius: '999px',
    border: 'none',
    backgroundColor: '#1e40af',
    color: '#f9fafb',
    fontSize: '0.8rem',
    outline: 'none',
    cursor: 'pointer',
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
  cardPending: {
    backgroundImage:
      'radial-gradient(circle at top, rgba(254,240,138,0.55), transparent 55%), ' +
      'linear-gradient(145deg, #ffffff, #fefce8)',
  },
  cardApproved: {
    backgroundImage:
      'radial-gradient(circle at top, rgba(187,247,208,0.65), transparent 55%), ' +
      'linear-gradient(145deg, #ffffff, #ecfdf5)',
  },
  cardRejected: {
    backgroundImage:
      'radial-gradient(circle at top, rgba(254,202,202,0.6), transparent 55%), ' +
      'linear-gradient(145deg, #ffffff, #fef2f2)',
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

  // Panel + table
  panel: {
    borderRadius: '20px',
    border: '1px solid rgba(15,23,42,0.06)',
    padding: '16px 16px 14px',
    backgroundColor: '#ffffff',
    boxShadow: '0 18px 40px rgba(15,23,42,0.12)',
    color: '#0b1a33',
  },
  panelHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '10px',
    flexWrap: 'wrap',
  },
  panelTitle: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 800,
  },
  panelSubtitle: {
    marginTop: '4px',
    marginBottom: 0,
    fontSize: '0.85rem',
    color: '#6b7280',
    opacity: 0.95,
  },
  queueChip: {
    borderRadius: '999px',
    padding: '6px 12px',
    backgroundColor: '#eff6ff',
    border: '1px solid rgba(37,99,235,0.35)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.8rem',
  },
  queueChipLabel: {
    color: '#1e3a8a',
  },
  queueChipNumber: {
    fontWeight: 800,
    color: '#1d4ed8',
  },

  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
    marginTop: '6px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    borderRadius: '14px',
    overflow: 'hidden',
  },
  thRoom: {
    textAlign: 'left',
    padding: '10px 12px',
    fontSize: '0.8rem',
    color: '#e5f0ff',
    borderBottom: '1px solid rgba(148,163,184,0.4)',
    backgroundColor: '#0f172a',
  },
  th: {
    textAlign: 'left',
    padding: '10px 12px',
    fontSize: '0.8rem',
    color: '#e5f0ff',
    borderBottom: '1px solid rgba(148,163,184,0.4)',
    backgroundColor: '#0f172a',
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

  tdRoom: {
    padding: '10px 12px',
    borderBottom: '1px solid rgba(148,163,184,0.25)',
    verticalAlign: 'middle',
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

  roomCellInner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  imageShell: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    border: '1px solid rgba(148,163,184,0.7)',
    overflow: 'hidden',
    backgroundColor: '#e5edff',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  roomName: {
    fontWeight: 700,
    fontSize: '0.92rem',
    color: '#0f172a',
  },
  roomMeta: {
    fontSize: '0.78rem',
    color: '#6b7280',
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

  // Badges
  badge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '999px',
    fontSize: '0.78rem',
    fontWeight: 700,
  },
  badgePending: {
    backgroundColor: 'rgba(254,240,138,0.6)',
    color: '#92400e',
  },
  badgeApproved: {
    backgroundColor: 'rgba(187,247,208,0.7)',
    color: '#166534',
  },
  badgeRejected: {
    backgroundColor: 'rgba(254,202,202,0.7)',
    color: '#b91c1c',
  },

  // Action buttons
  actionButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '6px',
    flexWrap: 'wrap',
  },
  smallBtn: {
    padding: '6px 12px',
    borderRadius: '999px',
    border: '1px solid transparent',
    fontSize: '0.8rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
  smallBtnApprove: {
    background:
      'linear-gradient(135deg,rgba(34,197,94,0.16),rgba(34,197,94,0.26))',
    borderColor: 'rgba(22,163,74,0.9)',
    color: '#14532d',
  },
  smallBtnReject: {
    background:
      'linear-gradient(135deg,rgba(239,68,68,0.16),rgba(239,68,68,0.26))',
    borderColor: 'rgba(220,38,38,0.9)',
    color: '#7f1d1d',
  },
  statusIconOK: {
    fontSize: '1.2rem',
    color: '#16a34a',
  },
  statusIconReject: {
    fontSize: '1.2rem',
    color: '#dc2626',
  },

  // Empty + notice
  emptyState: {
    padding: '26px 12px 12px',
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
};

export default BookingRequests;
