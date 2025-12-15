// src/pages/Home.jsx

import React, { useState, useEffect } from 'react';
import EquipmentCard from '../components/EquipmentCard';
import Navbar from '../components/Navbar';
import Swal from 'sweetalert2';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart } from '../Store/cartSlice';
import useLocation from '../utils/useLocation';

const Home = () => {
  // Rooms list (normalized from backend)
  const [roomList, setRoomList] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // 🔹 New booking fields
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guestCount, setGuestCount] = useState(1);

  const { placeInfo, error: locationError } = useLocation();
  const user = useSelector((state) => state.users.user);
  const dispatch = useDispatch();
  const API_URL = process.env.REACT_APP_SERVER_URL;

  // 🔹 Today in YYYY-MM-DD for <input type="date" min="...">
  const todayISO = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch(`${API_URL}/api/rooms`);
        const data = await res.json();

        // ✅ Normalise backend fields:
        // title/roomName -> name
        // nightlyRate -> price
        // photo/image -> image
        // managerId/ownerId -> ownerId
        // capacity -> capacity
        const normalized = (Array.isArray(data) ? data : []).map((room) => ({
          ...room,
          name: room.roomName || room.title || 'Unnamed room',
          price: room.nightlyRate ?? room.price ?? 0,
          image: room.image || room.photo || 'no-image.jpg',
          ownerId: room.ownerId || room.managerId,
          capacity: room.capacity ?? null,
        }));

        setRoomList(normalized);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };

    fetchRooms();
  }, [API_URL]);

  const handleRentNow = (item) => {
    if (!user || user.role !== 'customer') {
      Swal.fire({
        icon: 'info',
        title: 'Login required',
        text: 'Please login as a customer to book a room.',
        confirmButtonColor: '#7a4a2e',
      });
      return;
    }

    setSelectedRoom(item);
    setCheckInDate('');
    setCheckOutDate('');
    setGuestCount(1);
  };

  const handleAddToCart = () => {
    if (!checkInDate || !checkOutDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Select dates',
        text: 'Please choose your check-in and check-out dates.',
        confirmButtonColor: '#7a4a2e',
      });
      return;
    }

    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid dates',
        text: 'Please select valid dates for your stay.',
        confirmButtonColor: '#7a4a2e',
      });
      return;
    }

    // 🔒 Normalize to midnight and block past dates (only today & future allowed)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDay = new Date(start);
    startDay.setHours(0, 0, 0, 0);

    const endDay = new Date(end);
    endDay.setHours(0, 0, 0, 0);

    if (startDay < today || endDay < today) {
      Swal.fire({
        icon: 'error',
        title: 'Past dates not allowed',
        text: 'You can only book from today onwards. Please choose valid future dates.',
        confirmButtonColor: '#7a4a2e',
      });
      return;
    }

    if (endDay <= startDay) {
      Swal.fire({
        icon: 'error',
        title: 'Check-out must be later',
        text: 'Check-out date must be after check-in date.',
        confirmButtonColor: '#7a4a2e',
      });
      return;
    }

    const numericGuestCount = Number(guestCount);

    if (!numericGuestCount || numericGuestCount < 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Number of guests',
        text: 'Please enter at least 1 guest.',
        confirmButtonColor: '#7a4a2e',
      });
      return;
    }

    // 🔴 HARD RULE: respect room capacity if defined
    if (
      selectedRoom &&
      typeof selectedRoom.capacity === 'number' &&
      selectedRoom.capacity > 0 &&
      numericGuestCount > selectedRoom.capacity
    ) {
      Swal.fire({
        icon: 'error',
        title: 'Too many guests',
        text: `This room allows up to ${selectedRoom.capacity} guest(s). Please reduce the number of persons or choose another room.`,
        confirmButtonColor: '#7a4a2e',
      });
      return;
    }

    const stayLabel = `${checkInDate} to ${checkOutDate}`;

    const cartItem = {
      name: selectedRoom.name,
      price: selectedRoom.price, // nightly rate
      image: selectedRoom.image, // filename

      // Legacy naming still used by booking flow
      rentalDuration: stayLabel,
      equipmentId: selectedRoom._id, // still used as ID in cart/booking flow
      ownerId: selectedRoom.ownerId, // manager/owner id

      // 🔹 New fields carried through to booking
      fromDate: checkInDate,
      toDate: checkOutDate,
      guestCount: numericGuestCount,
    };

    dispatch(addToCart(cartItem));

    Swal.fire({
      icon: 'success',
      title: 'Room added to your bookings',
      text: `${selectedRoom.name} has been added to your stay plan.`,
      confirmButtonColor: '#7a4a2e',
    });

    setSelectedRoom(null);
  };

  return (
    <div style={styles.page}>
      <Navbar />

      {/* HERO BAND */}
      <div style={styles.heroBand}>
        <div style={styles.heroInner}>
          <div style={styles.heroTextBlock}>
            <p style={styles.heroKicker}>Hotel Mate · Guest Portal</p>
            <h1 style={styles.heroTitle}>Find your perfect stay</h1>
            <p style={styles.heroSubtitle}>
              Browse available rooms and suites, then reserve your stay in just a few clicks.
            </p>

            {placeInfo && (
              <div style={styles.heroLocationChip}>
                <span style={{ marginRight: 6 }}>📍</span>
                <span>
                  Searching from{' '}
                  <strong>
                    {placeInfo.city}, {placeInfo.region}, {placeInfo.country}
                  </strong>
                </span>
              </div>
            )}

            {locationError && (
              <div style={styles.heroLocationChipError}>
                ⚠️ Unable to detect location: {locationError}
              </div>
            )}
          </div>

          {user?.role === 'customer' && (
            <div style={styles.heroBadgeCard}>
              <p style={styles.heroBadgeLabel}>Logged in as</p>
              <p style={styles.heroBadgeEmail}>{user.email}</p>
              <p style={styles.heroBadgeHint}>
                You can book rooms and view your reservations.
              </p>

              <div style={styles.heroBadgeLine} />
              <div style={styles.heroBadgeMini}>
                Luxury stays • Secure bookings • Instant confirmation
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ROOM LIST */}
      <div style={styles.container}>
        <header style={styles.headerRow}>
          <div>
            <h2 style={styles.heading}>Available rooms</h2>
            <p style={styles.subHeading}>
              Choose from the rooms below and continue to confirm your reservation.
            </p>
          </div>
        </header>

        {/* GRID SECTION */}
        <section style={styles.gridSection}>
          {roomList.length === 0 ? (
            <div style={styles.emptyState}>
              <h3 style={styles.emptyTitle}>No rooms listed yet</h3>
              <p style={styles.emptyText}>
                Once the hotel adds rooms, they will appear here.
              </p>
            </div>
          ) : (
            <div style={styles.cardGridWrapper}>
              <div style={styles.cardGrid}>
                {roomList.map((item) => (
                  <EquipmentCard
                    key={item._id || item.name}
                    name={item.name}
                    price={item.price}
                    image={item.image}
                    onRentNowClick={() => handleRentNow(item)}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* BOOKING MODAL */}
      {selectedRoom && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalTop}>
              <div>
                <p style={styles.modalKicker}>Room selection</p>
                <h3 style={styles.modalTitle}>{selectedRoom.name}</h3>
              </div>

              <button
                type="button"
                style={styles.modalClose}
                onClick={() => setSelectedRoom(null)}
                aria-label="Close"
                title="Close"
              >
                ✕
              </button>
            </div>

            <div style={styles.modalMedia}>
              <img
                src={`${API_URL}/assets/images/${selectedRoom.image}`}
                alt={selectedRoom.name}
                style={styles.modalImage}
              />
              <div style={styles.modalPricePill}>
                <span style={styles.modalPriceMain}>{selectedRoom.price}</span>
                <span style={styles.modalPriceSub}> OMR / night</span>
              </div>
            </div>

            <div style={styles.modalMetaGrid}>
              <div style={styles.modalMetaItem}>
                <span style={styles.modalMetaLabel}>Price per night</span>
                <span style={styles.modalMetaValue}>{selectedRoom.price} OMR</span>
              </div>

              {selectedRoom.capacity && (
                <div style={styles.modalMetaItem}>
                  <span style={styles.modalMetaLabel}>Max guests</span>
                  <span style={styles.modalMetaValue}>{selectedRoom.capacity}</span>
                </div>
              )}
            </div>

            {selectedRoom.description && (
              <p style={styles.modalDescription}>
                <strong>Room details:</strong> {selectedRoom.description}
              </p>
            )}

            {/* 🔹 New booking fields inside modal box */}
            <div style={styles.modalFieldRow}>
              <div style={styles.modalField}>
                <label style={styles.label}>From (Check-in)</label>
                <input
                  type="date"
                  style={styles.input}
                  value={checkInDate}
                  min={todayISO}
                  onChange={(e) => setCheckInDate(e.target.value)}
                />
              </div>
              <div style={styles.modalField}>
                <label style={styles.label}>To (Check-out)</label>
                <input
                  type="date"
                  style={styles.input}
                  value={checkOutDate}
                  min={checkInDate || todayISO}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                />
              </div>
            </div>

            <div style={styles.modalHintRow}>
              <span style={styles.helperText}>You can book from today onwards only.</span>
            </div>

            <div style={{ marginTop: '10px', textAlign: 'left' }}>
              <label style={styles.label}>No. of persons</label>
              <input
                type="number"
                min="1"
                max={selectedRoom.capacity || undefined}
                style={styles.input}
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
              />
              {selectedRoom.capacity && (
                <span style={styles.helperText}>
                  Max allowed for this room: {selectedRoom.capacity}
                </span>
              )}
            </div>

            <button style={styles.primaryButton} onClick={handleAddToCart}>
              Add to My Bookings
            </button>

            <button
              style={styles.secondaryButton}
              onClick={() => setSelectedRoom(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ======================
   HOTEL MATE THEME STYLES (BROWN / GOLD LUXURY)
   ====================== */

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f7f1e6',
    backgroundImage:
      'radial-gradient(circle at top left, rgba(212,175,55,0.18), transparent 55%), ' +
      'radial-gradient(circle at bottom right, rgba(122,74,46,0.16), transparent 55%)',
    color: '#2b1a12',
  },

  heroBand: {
    padding: '22px 16px 28px',
  },

  heroInner: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    gap: '24px',
    flexWrap: 'wrap',
    borderRadius: '26px',
    padding: '22px 22px 24px',
    border: '1px solid rgba(122,74,46,0.16)',
    backgroundImage:
      'radial-gradient(circle at top left, rgba(212,175,55,0.22), transparent 70%), ' +
      'radial-gradient(circle at bottom right, rgba(122,74,46,0.18), transparent 70%), ' +
      'linear-gradient(135deg, rgba(255,255,255,0.92), rgba(255,248,225,0.78))',
    boxShadow: '0 18px 46px rgba(43,26,18,0.18)',
  },

  heroTextBlock: {
    maxWidth: '660px',
  },

  heroKicker: {
    margin: 0,
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    color: '#7a4a2e',
    fontWeight: 800,
  },

  heroTitle: {
    margin: '6px 0 0',
    fontSize: '32px',
    fontWeight: 900,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#2b1a12',
  },

  heroSubtitle: {
    marginTop: '10px',
    marginBottom: '16px',
    fontSize: '14px',
    color: 'rgba(43,26,18,0.78)',
    lineHeight: 1.6,
  },

  heroLocationChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '7px 12px',
    borderRadius: '999px',
    backgroundColor: 'rgba(212,175,55,0.12)',
    border: '1px solid rgba(212,175,55,0.35)',
    fontSize: '13px',
    color: '#2b1a12',
  },

  heroLocationChipError: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '7px 12px',
    borderRadius: '999px',
    backgroundColor: 'rgba(185,28,28,0.08)',
    border: '1px solid rgba(185,28,28,0.25)',
    fontSize: '13px',
    color: '#b91c1c',
    marginTop: '6px',
  },

  heroBadgeCard: {
    minWidth: '260px',
    padding: '14px 16px',
    borderRadius: '18px',
    backgroundColor: 'rgba(255,255,255,0.82)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(122,74,46,0.16)',
    boxShadow: '0 14px 30px rgba(43,26,18,0.14)',
    alignSelf: 'center',
  },

  heroBadgeLabel: {
    margin: 0,
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    color: 'rgba(43,26,18,0.68)',
    fontWeight: 800,
  },

  heroBadgeEmail: {
    margin: '6px 0 4px',
    fontSize: '14px',
    fontWeight: 800,
    color: '#2b1a12',
    wordBreak: 'break-all',
  },

  heroBadgeHint: {
    margin: 0,
    fontSize: '12px',
    color: 'rgba(43,26,18,0.72)',
    lineHeight: 1.5,
  },

  heroBadgeLine: {
    height: 1,
    width: '100%',
    marginTop: 12,
    background:
      'linear-gradient(90deg, transparent, rgba(212,175,55,0.7), transparent)',
  },

  heroBadgeMini: {
    marginTop: 10,
    fontSize: '12px',
    color: 'rgba(43,26,18,0.62)',
  },

  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '18px 20px 40px',
  },

  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px',
  },

  heading: {
    margin: 0,
    fontSize: '22px',
    fontWeight: 900,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: '#2b1a12',
  },

  subHeading: {
    marginTop: '6px',
    marginBottom: 0,
    fontSize: '14px',
    color: 'rgba(43,26,18,0.72)',
    lineHeight: 1.55,
  },

  gridSection: {
    backgroundColor: 'rgba(255,255,255,0.82)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderRadius: '22px',
    padding: '18px 18px 22px',
    boxShadow: '0 16px 44px rgba(43,26,18,0.14)',
    border: '1px solid rgba(122,74,46,0.14)',
  },

  cardGridWrapper: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },

  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    justifyContent: 'center',
    gap: '22px',
    width: '100%',
    maxWidth: '1040px',
  },

  emptyState: {
    textAlign: 'center',
    padding: '30px 10px',
  },
  emptyTitle: {
    margin: 0,
    marginBottom: 8,
    color: '#2b1a12',
    fontWeight: 900,
    letterSpacing: '0.02em',
  },
  emptyText: {
    margin: 0,
    color: 'rgba(43,26,18,0.72)',
    fontSize: '0.95rem',
    lineHeight: 1.6,
  },

  /* MODAL */
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(43,26,18,0.55)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '16px',
  },

 modal: {
  width: '100%',
  maxWidth: '460px',
  backgroundColor: 'rgba(255,255,255,0.90)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  padding: '18px 18px 18px',
  borderRadius: '22px',
  textAlign: 'left',
  boxShadow: '0 22px 60px rgba(0,0,0,0.35)',
  border: '1px solid rgba(212,175,55,0.28)',
  color: '#2b1a12',

  // ✅ NEW (prevents content going out)
  maxHeight: 'calc(100vh - 40px)',
  overflowY: 'auto',
},

  modalTop: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '10px',
  },

  modalKicker: {
    margin: 0,
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    color: '#7a4a2e',
    fontWeight: 900,
  },

  modalTitle: {
    margin: '4px 0 0',
    fontSize: '20px',
    fontWeight: 900,
    color: '#2b1a12',
  },

  modalClose: {
    border: '1px solid rgba(122,74,46,0.18)',
    background: 'rgba(255,255,255,0.72)',
    width: 36,
    height: 36,
    borderRadius: 12,
    cursor: 'pointer',
    fontWeight: 900,
    color: 'rgba(43,26,18,0.85)',
    boxShadow: '0 10px 18px rgba(43,26,18,0.10)',
  },

  modalMedia: {
    position: 'relative',
    borderRadius: '14px',
    overflow: 'hidden',
    border: '1px solid rgba(122,74,46,0.14)',
    boxShadow: '0 14px 30px rgba(43,26,18,0.14)',
  },

  modalImage: {
    width: '100%',
    height: '210px',
    objectFit: 'cover',
    display: 'block',
    filter: 'contrast(1.02) saturate(1.02)',
  },

  modalPricePill: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    padding: '8px 12px',
    borderRadius: '999px',
    backgroundImage: 'linear-gradient(135deg, #7a4a2e, #d4af37)',
    border: '1px solid rgba(212,175,55,0.35)',
    display: 'inline-flex',
    alignItems: 'baseline',
    boxShadow: '0 14px 28px rgba(43,26,18,0.28)',
  },

  modalPriceMain: {
    fontWeight: 900,
    fontSize: '14px',
    color: '#fff8e1',
  },

  modalPriceSub: {
    marginLeft: 5,
    color: 'rgba(255,248,225,0.92)',
    fontSize: '12px',
  },

  modalMetaGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginTop: '12px',
  },

  modalMetaItem: {
    borderRadius: '14px',
    padding: '10px 12px',
    backgroundColor: 'rgba(212,175,55,0.10)',
    border: '1px solid rgba(212,175,55,0.20)',
  },

  modalMetaLabel: {
    display: 'block',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    color: 'rgba(43,26,18,0.70)',
    fontWeight: 900,
  },

  modalMetaValue: {
    display: 'block',
    marginTop: 4,
    fontSize: '13px',
    fontWeight: 900,
    color: '#2b1a12',
  },

  modalDescription: {
    margin: '10px 0 0',
    fontSize: '13px',
    color: 'rgba(43,26,18,0.78)',
    lineHeight: 1.55,
  },

  // 🔹 row for From / To fields, side by side INSIDE modal box
 modalFieldRow: {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '14px',
  marginTop: '16px',
  width: '100%',
  flexWrap: 'wrap', // ✅ NEW
},

modalField: {
  flex: 1,
  minWidth: '180px', // ✅ NEW (forces wrap on small width)
},


  modalHintRow: {
    marginTop: '6px',
    textAlign: 'left',
  },

  label: {
    fontWeight: 900,
    display: 'block',
    marginBottom: '6px',
    fontSize: '12px',
    color: 'rgba(43,26,18,0.88)',
    letterSpacing: '0.02em',
  },

  helperText: {
    fontSize: '11px',
    color: 'rgba(43,26,18,0.62)',
  },

input: {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '12px',
  border: '1px solid rgba(122,74,46,0.20)',
  marginBottom: '0px', // ✅ change from 4px
  fontSize: '14px',
  backgroundColor: 'rgba(255,255,255,0.86)',
  color: '#2b1a12',
  outline: 'none',
  boxSizing: 'border-box', // ✅ NEW (prevents overflow)
},


  primaryButton: {
    width: '100%',
    padding: '11px',
    backgroundImage: 'linear-gradient(135deg, #7a4a2e, #d4af37)',
    border: '1px solid rgba(212,175,55,0.35)',
    borderRadius: '999px',
    fontWeight: 900,
    cursor: 'pointer',
    marginTop: '14px',
    color: '#fff8e1',
    boxShadow: '0 14px 30px rgba(43,26,18,0.22)',
    letterSpacing: '0.02em',
  },

  secondaryButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: 'transparent',
    borderRadius: '999px',
    border: '1px solid rgba(122,74,46,0.28)',
    color: '#7a4a2e',
    fontWeight: 900,
    cursor: 'pointer',
    marginTop: '8px',
  },
};

export default Home;
