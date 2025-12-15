// client/src/pages/CustomerReservations.jsx

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
        const res = await fetch(`${API_URL}/api/bookings/customer/${user._id}`);

        if (!res.ok) {
          console.error('Failed to fetch reservations, status:', res.status);
          setReservations([]);
          return;
        }

        const data = await res.json();
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

  const formatOMR = (amount) => `OMR ${Number(amount || 0).toFixed(2)}`;

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
                <span style={styles.userChipDot} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={styles.userChipLabel}>Guest</span>
                  <span style={styles.userChipEmail}>{user.email}</span>
                </div>
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
              <p style={styles.emptyText}>Log in to view your reservations.</p>
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
            <>
              {/* Desktop table */}
              <section style={styles.tableShell}>
                <header style={styles.tableHeaderRow}>
                  <div style={styles.tableHeaderCellWide}>Room</div>
                  <div style={styles.tableHeaderCell}>Stay</div>
                  <div style={styles.tableHeaderCell}>Booked</div>
                  <div style={styles.tableHeaderCell}>Total</div>
                  <div style={styles.tableHeaderCell}>Status</div>
                </header>

                {reservations.map((r, index) => {
                  const booked = r.bookingDate
                    ? new Date(r.bookingDate).toLocaleDateString()
                    : 'N/A';

                  return (
                    <div key={r._id || index} style={styles.tableRow}>
                      {/* ROOM */}
                      <div style={{ ...styles.tableCell, ...styles.roomCell }}>
                        <div style={styles.roomThumbWrap}>
                          <img
                            src={`${API_URL}/assets/images/${r.image}`}
                            alt={r.roomName}
                            style={styles.image}
                          />
                          <span style={styles.roomBadge}>#{(index + 1).toString().padStart(2, '0')}</span>
                        </div>
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
                      <div style={styles.tableCell}>{booked}</div>

                      {/* TOTAL */}
                      <div style={styles.tableCell}>
                        <strong style={styles.totalText}>{formatOMR(r.totalCost)}</strong>
                      </div>

                      {/* STATUS */}
                      <div style={styles.tableCell}>
                        <div style={styles.statusCellInner}>
                          <span style={getStatusStyle(r.status)}>
                            {formatStatus(r.status)}
                          </span>

                          {isApproved(r.status) && (
                            <div style={styles.statusMessage}>
                              Confirmed • Pay at check-in
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </section>

              {/* Mobile cards */}
              <section style={styles.mobileList}>
                {reservations.map((r, index) => {
                  const booked = r.bookingDate
                    ? new Date(r.bookingDate).toLocaleDateString()
                    : 'N/A';

                  return (
                    <article key={r._id || index} style={styles.mobileCard}>
                      <div style={styles.mobileTop}>
                        <div style={styles.mobileThumbWrap}>
                          <img
                            src={`${API_URL}/assets/images/${r.image}`}
                            alt={r.roomName}
                            style={styles.mobileThumb}
                          />
                          <span style={styles.mobileIndexPill}>
                            Room {(index + 1).toString().padStart(2, '0')}
                          </span>
                        </div>

                        <div style={styles.mobileTitleBlock}>
                          <div style={styles.mobileRoomName}>{r.roomName}</div>
                          <div style={styles.mobileSub}>
                            ID: {r._id?.slice(-6) || 'N/A'}
                          </div>
                        </div>

                        <div style={styles.mobileStatus}>
                          <span style={getStatusStyle(r.status)}>
                            {formatStatus(r.status)}
                          </span>
                        </div>
                      </div>

                      <div style={styles.mobileGrid}>
                        <div style={styles.mobileField}>
                          <div style={styles.mobileLabel}>Stay</div>
                          <div>
                            <span style={styles.stayChip}>{r.stayDuration}</span>
                          </div>
                        </div>

                        <div style={styles.mobileField}>
                          <div style={styles.mobileLabel}>Booked</div>
                          <div style={styles.mobileValue}>{booked}</div>
                        </div>

                        <div style={styles.mobileField}>
                          <div style={styles.mobileLabel}>Total</div>
                          <div style={styles.mobileValueStrong}>{formatOMR(r.totalCost)}</div>
                        </div>
                      </div>

                      {isApproved(r.status) && (
                        <div style={styles.mobileApprovedNote}>
                          ✅ Your room is confirmed. Please pay at check-in.
                        </div>
                      )}
                    </article>
                  );
                })}
              </section>
            </>
          )}
        </main>
      </div>
    </>
  );
};

const styles = {
  /* ===== PAGE THEME (MATCH BOOKINGCART LUXURY: BROWN / GOLD) ===== */
  page: {
    minHeight: '100vh',
    backgroundColor: '#f7f1e6',
    backgroundImage:
      'radial-gradient(circle at top left, rgba(212,175,55,0.18), transparent 55%), ' +
      'radial-gradient(circle at bottom right, rgba(122,74,46,0.16), transparent 55%)',
    color: '#2b1a12',
  },

  headerBand: {
    padding: '20px 16px 18px',
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
    border: '1px solid rgba(122,74,46,0.16)',
    backgroundImage:
      'radial-gradient(circle at top left, rgba(212,175,55,0.22), transparent 70%), ' +
      'radial-gradient(circle at bottom right, rgba(122,74,46,0.18), transparent 70%), ' +
      'linear-gradient(135deg, rgba(255,255,255,0.92), rgba(255,248,225,0.78))',
    boxShadow: '0 18px 46px rgba(43,26,18,0.18)',
  },

  kicker: {
    margin: 0,
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    color: '#7a4a2e',
    fontWeight: 900,
  },

  title: {
    margin: '4px 0 2px',
    fontSize: '24px',
    fontWeight: 900,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: '#2b1a12',
  },

  subtitle: {
    marginTop: '6px',
    marginBottom: 0,
    fontSize: '13px',
    color: 'rgba(43,26,18,0.72)',
  },

  userChip: {
    padding: '10px 12px',
    borderRadius: '18px',
    backgroundColor: 'rgba(255,255,255,0.82)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(122,74,46,0.14)',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    boxShadow: '0 12px 28px rgba(43,26,18,0.14)',
  },

  userChipDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#d4af37',
    boxShadow: '0 0 0 4px rgba(212,175,55,0.18)',
  },

  userChipLabel: {
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    color: 'rgba(43,26,18,0.62)',
    fontWeight: 900,
  },

  userChipEmail: {
    fontSize: '13px',
    color: '#2b1a12',
    fontWeight: 900,
    wordBreak: 'break-all',
  },

  main: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '22px 18px 40px',
  },

  emptyBox: {
    borderRadius: '22px',
    border: '1px solid rgba(122,74,46,0.14)',
    padding: '34px 26px',
    textAlign: 'center',
    maxWidth: '520px',
    margin: '40px auto 0',
    backgroundColor: 'rgba(255,255,255,0.84)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    boxShadow: '0 18px 46px rgba(43,26,18,0.12)',
    color: '#2b1a12',
  },

  emptyIcon: {
    fontSize: '34px',
    margin: 0,
  },

  emptyTitle: {
    margin: '10px 0 4px',
    fontSize: '18px',
    fontWeight: 900,
  },

  emptyText: {
    margin: 0,
    fontSize: '14px',
    color: 'rgba(43,26,18,0.70)',
    lineHeight: 1.6,
  },

  /* ===== DESKTOP TABLE ===== */
  tableShell: {
    borderRadius: '22px',
    border: '1px solid rgba(122,74,46,0.14)',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.84)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    boxShadow: '0 18px 46px rgba(43,26,18,0.12)',
  },

  tableHeaderRow: {
    display: 'grid',
    gridTemplateColumns: '2.4fr 1.1fr 1.1fr 1fr 1.1fr',
    backgroundImage: 'linear-gradient(135deg, #7a4a2e, #d4af37)',
    color: '#fff8e1',
    fontSize: '12px',
    fontWeight: 900,
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    borderBottom: '1px solid rgba(0,0,0,0.18)',
  },

  tableHeaderCellWide: {
    padding: '14px 16px',
    borderRight: '1px solid rgba(0,0,0,0.18)',
  },

  tableHeaderCell: {
    padding: '14px 16px',
    borderRight: '1px solid rgba(0,0,0,0.18)',
    textAlign: 'center',
  },

  tableRow: {
    display: 'grid',
    gridTemplateColumns: '2.4fr 1.1fr 1.1fr 1fr 1.1fr',
    fontSize: '13px',
    color: '#2b1a12',
    borderTop: '1px solid rgba(122,74,46,0.10)',
    backgroundColor: 'rgba(255,255,255,0.55)',
  },

  tableCell: {
    padding: '14px 14px',
    borderRight: '1px solid rgba(122,74,46,0.10)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  roomCell: {
    justifyContent: 'flex-start',
    gap: '12px',
  },

  roomThumbWrap: {
    position: 'relative',
    width: 58,
    height: 58,
    flex: '0 0 58px',
  },

  image: {
    width: '58px',
    height: '58px',
    borderRadius: '14px',
    objectFit: 'cover',
    border: '1px solid rgba(122,74,46,0.16)',
    backgroundColor: '#efe7da',
    boxShadow: '0 12px 22px rgba(43,26,18,0.12)',
  },

  roomBadge: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '10px',
    padding: '4px 10px',
    borderRadius: '999px',
    backgroundColor: 'rgba(255,255,255,0.82)',
    border: '1px solid rgba(122,74,46,0.18)',
    color: '#7a4a2e',
    fontWeight: 900,
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap',
  },

  roomText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },

  roomName: {
    fontWeight: 900,
    fontSize: '13px',
    color: '#2b1a12',
  },

  roomMeta: {
    fontSize: '11px',
    color: 'rgba(43,26,18,0.62)',
  },

  stayChip: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 10px',
    borderRadius: '999px',
    backgroundColor: 'rgba(255,255,255,0.78)',
    border: '1px solid rgba(122,74,46,0.18)',
    color: '#7a4a2e',
    fontSize: '11px',
    fontWeight: 900,
  },

  totalText: {
    color: '#7a4a2e',
    fontWeight: 900,
  },

  statusCellInner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },

  statusMessage: {
    fontSize: '11px',
    color: '#14532d',
    backgroundColor: 'rgba(34,197,94,0.12)',
    border: '1px solid rgba(34,197,94,0.35)',
    padding: '5px 10px',
    borderRadius: '999px',
    fontWeight: 900,
    textAlign: 'center',
    maxWidth: '200px',
  },

  statusPending: {
    padding: '7px 12px',
    borderRadius: '999px',
    backgroundColor: 'rgba(250,204,21,0.18)',
    border: '1px solid rgba(250,204,21,0.55)',
    color: '#92400e',
    fontWeight: 900,
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },

  statusApproved: {
    padding: '7px 12px',
    borderRadius: '999px',
    backgroundColor: 'rgba(34,197,94,0.14)',
    border: '1px solid rgba(34,197,94,0.55)',
    color: '#14532d',
    fontWeight: 900,
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },

  statusRejected: {
    padding: '7px 12px',
    borderRadius: '999px',
    backgroundColor: 'rgba(185,28,28,0.10)',
    border: '1px solid rgba(185,28,28,0.35)',
    color: '#b91c1c',
    fontWeight: 900,
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },

  /* ===== MOBILE CARDS (NO MEDIA QUERIES NEEDED; WE HIDE/SHOW VIA INLINE) ===== */
  mobileList: {
    marginTop: 14,
    display: 'none', // will be enabled by your global CSS media query (add below)
    flexDirection: 'column',
    gap: 12,
  },

  mobileCard: {
    borderRadius: '22px',
    border: '1px solid rgba(122,74,46,0.14)',
    backgroundColor: 'rgba(255,255,255,0.84)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    boxShadow: '0 18px 46px rgba(43,26,18,0.12)',
    padding: 12,
  },

  mobileTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },

  mobileThumbWrap: {
    position: 'relative',
    width: 64,
    height: 64,
    flex: '0 0 64px',
  },

  mobileThumb: {
    width: 64,
    height: 64,
    borderRadius: 16,
    objectFit: 'cover',
    border: '1px solid rgba(122,74,46,0.16)',
    backgroundColor: '#efe7da',
    boxShadow: '0 12px 22px rgba(43,26,18,0.12)',
  },

  mobileIndexPill: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '10px',
    padding: '4px 10px',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.82)',
    border: '1px solid rgba(122,74,46,0.18)',
    color: '#7a4a2e',
    fontWeight: 900,
    whiteSpace: 'nowrap',
  },

  mobileTitleBlock: {
    flex: 1,
    minWidth: 0,
  },

  mobileRoomName: {
    fontWeight: 900,
    color: '#2b1a12',
    fontSize: 13,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  mobileSub: {
    marginTop: 4,
    fontSize: 11,
    color: 'rgba(43,26,18,0.62)',
  },

  mobileStatus: {
    flex: '0 0 auto',
  },

  mobileGrid: {
    marginTop: 14,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
  },

  mobileField: {
    borderRadius: 16,
    padding: '10px 12px',
    backgroundColor: 'rgba(212,175,55,0.10)',
    border: '1px solid rgba(212,175,55,0.20)',
  },

  mobileLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    fontWeight: 900,
    color: 'rgba(43,26,18,0.62)',
    marginBottom: 6,
  },

  mobileValue: {
    fontSize: 12,
    color: 'rgba(43,26,18,0.78)',
    fontWeight: 800,
  },

  mobileValueStrong: {
    fontSize: 12,
    color: '#7a4a2e',
    fontWeight: 900,
  },

  mobileApprovedNote: {
    marginTop: 12,
    borderRadius: 16,
    padding: '10px 12px',
    backgroundColor: 'rgba(34,197,94,0.12)',
    border: '1px solid rgba(34,197,94,0.35)',
    color: '#14532d',
    fontWeight: 900,
    fontSize: 12,
    lineHeight: 1.45,
  },
};

export default CustomerReservations;

/*
✅ IMPORTANT (ONE TIME): add this CSS in your global file (e.g. client/src/index.css)

@media (max-width: 820px) {
  .reservationsTable { display: none !important; }
  .reservationsMobile { display: flex !important; }
}

Then in the JSX, add:
- style={styles.tableShell} -> also add className="reservationsTable"
- style={styles.mobileList} -> also add className="reservationsMobile"
*/
