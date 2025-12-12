// src/pages/CustomerReservations.jsx

import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useSelector } from 'react-redux';

const CustomerReservations = () => {
  const [reservations, setReservations] = useState([]);
  const user = useSelector((state) => state.users.user);
  const API_URL = process.env.REACT_APP_SERVER_URL;

  useEffect(() => {
    if (!user?._id) return;

    const fetchReservations = async () => {
      try {
        // ✅ Use the backend route: /api/bookings/customer/:customerId
        const res = await fetch(`${API_URL}/api/bookings/customer/${user._id}`);

        if (!res.ok) {
          console.error('Failed to fetch reservations, status:', res.status);
          setReservations([]);
          return;
        }

        const data = await res.json();
        console.log('📦 Customer reservations:', data);
        setReservations(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching reservations:', error);
        setReservations([]);
      }
    };

    fetchReservations();
  }, [user, API_URL]);

  const formatStatus = (status) => {
    if (!status) return 'Pending';
    const s = status.toString().toLowerCase();
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const getStatusStyle = (status) => {
    const s = status?.toString().toLowerCase();
    if (s === 'approved' || s === 'completed') return styles.statusApproved;
    if (s === 'rejected' || s === 'cancelled') return styles.statusRejected;
    return styles.statusPending;
  };

  const isApproved = (status) =>
    (status || '').toString().toLowerCase() === 'approved';

  return (
    <>
      <Navbar />

      <div style={styles.page}>
        {/* HEADER BAND */}
        <div style={styles.headerBand}>
          <div style={styles.headerInner}>
            <div>
              <p style={styles.kicker}>Your stays</p>
              <h1 style={styles.title}>My reservations</h1>
              <p style={styles.subtitle}>
                Track all your past and upcoming stays in one elegant view.
              </p>
            </div>
            {user && (
              <div style={styles.userChip}>
                <span style={styles.userChipLabel}>Guest</span>
                <span style={styles.userChipEmail}>{user.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <main style={styles.main}>
          {!user ? (
            <div style={styles.emptyBox}>
              <p style={styles.emptyIcon}>🔑</p>
              <p style={styles.emptyTitle}>Please log in</p>
              <p style={styles.emptyText}>
                Log in to view your reservations.
              </p>
            </div>
          ) : reservations.length === 0 ? (
            <div style={styles.emptyBox}>
              <p style={styles.emptyIcon}>🛏️</p>
              <p style={styles.emptyTitle}>No reservations yet</p>
              <p style={styles.emptyText}>
                Once you book a room, your reservations will appear here.
              </p>
            </div>
          ) : (
            <section style={styles.tableShell}>
              <header style={styles.tableHeaderRow}>
                <div style={styles.tableHeaderCellWide}>Room</div>
                <div style={styles.tableHeaderCell}>Stay</div>
                <div style={styles.tableHeaderCell}>Booked</div>
                <div style={styles.tableHeaderCell}>Total</div>
                <div style={styles.tableHeaderCell}>Status</div>
              </header>

              {reservations.map((r, index) => (
                <div key={r._id || index} style={styles.tableRow}>
                  {/* ROOM */}
                  <div style={{ ...styles.tableCell, ...styles.roomCell }}>
                    <img
                      src={`${API_URL}/assets/images/${r.image}`}
                      alt={r.roomName}
                      style={styles.image}
                    />
                    <div style={styles.roomText}>
                      <div style={styles.roomName}>{r.roomName}</div>
                      <div style={styles.roomMeta}>
                        Reservation ID: {r._id?.slice(-6) || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* STAY */}
                  <div style={styles.tableCell}>
                    <span style={styles.stayChip}>{r.stayDuration}</span>
                  </div>

                  {/* BOOKED ON */}
                  <div style={styles.tableCell}>
                    {r.bookingDate
                      ? new Date(r.bookingDate).toLocaleDateString()
                      : 'N/A'}
                  </div>

                  {/* TOTAL */}
                  <div style={styles.tableCell}>
                    <strong>
                      {Number(r.totalCost || 0).toFixed(2)} OMR
                    </strong>
                  </div>

                  {/* STATUS */}
                  <div style={styles.tableCell}>
                    <div style={styles.statusCellInner}>
                      <span style={getStatusStyle(r.status)}>
                        {formatStatus(r.status)}
                      </span>

                      {isApproved(r.status) && (
                        <div style={styles.statusMessage}>
                          Your room is confirmed. Please pay at check-in.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </section>
          )}
        </main>
      </div>
    </>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#E8F1FF',
    backgroundImage:
      'radial-gradient(circle at top left, rgba(37,99,235,0.16), transparent 55%), ' +
      'radial-gradient(circle at bottom right, rgba(59,130,246,0.18), transparent 55%)',
    color: '#0B1A33',
  },

  headerBand: {
    padding: '22px 16px 24px',
  },

  headerInner: {
    maxWidth: '1100px',
    margin: '0 auto',
    borderRadius: '26px',
    padding: '18px 22px 18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap',
    border: '1px solid rgba(148,163,184,0.5)',
    backgroundImage:
      'radial-gradient(circle at top left, rgba(191,219,254,0.95), transparent 70%), ' +
      'radial-gradient(circle at bottom right, rgba(219,234,254,0.95), transparent 70%), ' +
      'linear-gradient(135deg, #FFFFFF, #EFF6FF)',
    boxShadow: '0 18px 45px rgba(15,23,42,0.12)',
  },

  kicker: {
    margin: 0,
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    color: '#1D4ED8',
  },

  title: {
    margin: '4px 0 2px',
    fontSize: '24px',
    fontWeight: 800,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: '#0B1A33',
  },

  subtitle: {
    marginTop: '4px',
    marginBottom: 0,
    fontSize: '13px',
    color: '#4B5563',
  },

  userChip: {
    padding: '8px 12px',
    borderRadius: '999px',
    backgroundColor: '#FFFFFF',
    border: '1px solid rgba(191,219,254,0.95)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    boxShadow: '0 8px 20px rgba(15,23,42,0.12)',
  },

  userChipLabel: {
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#6B7280',
  },

  userChipEmail: {
    fontSize: '13px',
    color: '#0B1A33',
  },

  main: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '24px 18px 40px',
  },

  emptyBox: {
    borderRadius: '20px',
    border: '1px solid rgba(209,213,219,0.9)',
    padding: '32px 24px',
    textAlign: 'center',
    maxWidth: '480px',
    margin: '40px auto 0',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 18px 40px rgba(15,23,42,0.08)',
    color: '#0B1A33',
  },

  emptyIcon: {
    fontSize: '32px',
    margin: 0,
  },

  emptyTitle: {
    margin: '10px 0 4px',
    fontSize: '18px',
    fontWeight: 700,
  },

  emptyText: {
    margin: 0,
    fontSize: '14px',
    color: '#4B5563',
  },

  tableShell: {
    borderRadius: '20px',
    border: '1px solid rgba(209,213,219,0.9)',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 18px 40px rgba(15,23,42,0.08)',
  },

  tableHeaderRow: {
    display: 'grid',
    gridTemplateColumns: '2.4fr 1.1fr 1.1fr 1fr 1.1fr',
    backgroundColor: '#0A3D91',
    color: '#E5E7EB',
    fontSize: '13px',
    fontWeight: 600,
    borderBottom: '1px solid rgba(15,23,42,0.25)',
  },

  tableHeaderCellWide: {
    padding: '12px 16px',
    borderRight: '1px solid rgba(15,23,42,0.25)',
  },

  tableHeaderCell: {
    padding: '12px 16px',
    borderRight: '1px solid rgba(15,23,42,0.25)',
    textAlign: 'center',
  },

  tableRow: {
    display: 'grid',
    gridTemplateColumns: '2.4fr 1.1fr 1.1fr 1fr 1.1fr',
    fontSize: '13px',
    color: '#111827',
    borderTop: '1px solid rgba(229,231,235,0.9)',
    backgroundColor: '#F9FAFB',
    transition: 'background-color 0.15s ease, transform 0.1s ease',
  },

  tableCell: {
    padding: '12px 14px',
    borderRight: '1px solid rgba(229,231,235,0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  roomCell: {
    justifyContent: 'flex-start',
    gap: '10px',
  },

  image: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    objectFit: 'cover',
    border: '1px solid rgba(209,213,219,0.9)',
    backgroundColor: '#E5E7EB',
  },

  roomText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },

  roomName: {
    fontWeight: 700,
    fontSize: '13px',
    color: '#0B1A33',
  },

  roomMeta: {
    fontSize: '11px',
    color: '#6B7280',
    opacity: 0.9,
  },

  stayChip: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '999px',
    backgroundColor: '#EFF6FF',
    color: '#1D4ED8',
    fontSize: '11px',
    fontWeight: 600,
  },

  statusCellInner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
  },

  statusMessage: {
    fontSize: '11px',
    color: '#166534',
    backgroundColor: '#DCFCE7',
    padding: '4px 10px',
    borderRadius: '999px',
    fontWeight: 600,
    textAlign: 'center',
    maxWidth: '180px',
  },

  statusPending: {
    padding: '6px 12px',
    borderRadius: '999px',
    backgroundColor: '#FEF3C7',
    border: '1px solid #FACC15',
    color: '#92400E',
    fontWeight: 700,
    fontSize: '11px',
  },

  statusApproved: {
    padding: '6px 12px',
    borderRadius: '999px',
    backgroundColor: '#DCFCE7',
    border: '1px solid #22C55E',
    color: '#166534',
    fontWeight: 700,
    fontSize: '11px',
  },

  statusRejected: {
    padding: '6px 12px',
    borderRadius: '999px',
    backgroundColor: '#FEE2E2',
    border: '1px solid #F97373',
    color: '#B91C1C',
    fontWeight: 700,
    fontSize: '11px',
  },
};

export default CustomerReservations;
