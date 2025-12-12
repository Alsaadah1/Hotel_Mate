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
        confirmButtonColor: '#0A3D91',
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
        confirmButtonColor: '#0A3D91',
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
        confirmButtonColor: '#0A3D91',
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
        confirmButtonColor: '#0A3D91',
      });
      return;
    }

    if (endDay <= startDay) {
      Swal.fire({
        icon: 'error',
        title: 'Check-out must be later',
        text: 'Check-out date must be after check-in date.',
        confirmButtonColor: '#0A3D91',
      });
      return;
    }

    const numericGuestCount = Number(guestCount);

    if (!numericGuestCount || numericGuestCount < 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Number of guests',
        text: 'Please enter at least 1 guest.',
        confirmButtonColor: '#0A3D91',
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
        confirmButtonColor: '#0A3D91',
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
      confirmButtonColor: '#0A3D91',
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
            <h3 style={styles.modalTitle}>{selectedRoom.name}</h3>

            <img
              src={`${API_URL}/assets/images/${selectedRoom.image}`}
              alt={selectedRoom.name}
              style={styles.modalImage}
            />

            <p style={styles.modalMeta}>
              <strong>Price per night:</strong> {selectedRoom.price} OMR
            </p>

            {selectedRoom.capacity && (
              <p style={styles.modalMeta}>
                <strong>Max guests:</strong> {selectedRoom.capacity}
              </p>
            )}

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
   HOTEL MATE THEME STYLES (BLUE & WHITE FOR NOW)
   ====================== */

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#E8F1FF',
    backgroundImage:
      'radial-gradient(circle at top left, rgba(37,99,235,0.15), transparent 55%), ' +
      'radial-gradient(circle at bottom right, rgba(59,130,246,0.18), transparent 55%)',
    color: '#0B1A33',
  },

  heroBand: {
    padding: '24px 16px 32px',
  },

  heroInner: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '24px',
    flexWrap: 'wrap',
    borderRadius: '26px',
    padding: '22px 22px 24px',
    border: '1px solid rgba(148,163,184,0.5)',
    backgroundImage:
      'radial-gradient(circle at top left, rgba(191,219,254,0.9), transparent 70%), ' +
      'radial-gradient(circle at bottom right, rgba(191,219,254,0.85), transparent 70%), ' +
      'linear-gradient(135deg, #FFFFFF, #EFF6FF)',
    boxShadow: '0 18px 45px rgba(15,23,42,0.18)',
  },

  heroTextBlock: {
    maxWidth: '620px',
  },

  heroKicker: {
    margin: 0,
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    color: '#1D4ED8',
  },

  heroTitle: {
    margin: '4px 0 0',
    fontSize: '30px',
    fontWeight: 800,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#0B1A33',
  },

  heroSubtitle: {
    marginTop: '10px',
    marginBottom: '16px',
    fontSize: '14px',
    color: '#1F2937',
  },

  heroLocationChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '6px 12px',
    borderRadius: '999px',
    backgroundColor: '#EFF6FF',
    border: '1px solid rgba(129,140,248,0.7)',
    fontSize: '13px',
    color: '#0B1A33',
  },

  heroLocationChipError: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 12px',
    borderRadius: '999px',
    backgroundColor: '#FEF2F2',
    border: '1px solid #FCA5A5',
    fontSize: '13px',
    color: '#B91C1C',
    marginTop: '6px',
  },

  heroBadgeCard: {
    minWidth: '240px',
    padding: '14px 16px',
    borderRadius: '18px',
    backgroundColor: '#FFFFFF',
    border: '1px solid rgba(148,163,184,0.45)',
    boxShadow: '0 14px 30px rgba(15,23,42,0.12)',
  },

  heroBadgeLabel: {
    margin: 0,
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: '#6B7280',
  },

  heroBadgeEmail: {
    margin: '4px 0 2px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#0B1A33',
    wordBreak: 'break-all',
  },

  heroBadgeHint: {
    margin: 0,
    fontSize: '12px',
    color: '#4B5563',
  },

  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px 20px 40px',
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
    fontWeight: 800,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: '#0B1A33',
  },

  subHeading: {
    marginTop: '4px',
    marginBottom: 0,
    fontSize: '14px',
    color: '#4B5563',
  },

  gridSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: '20px',
    padding: '18px 18px 22px',
    boxShadow: '0 16px 38px rgba(15,23,42,0.12)',
    border: '1px solid rgba(209,213,219,0.9)',
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
    gap: '24px',
    width: '100%',
    maxWidth: '1000px',
  },

  emptyState: {
    textAlign: 'center',
    padding: '30px 10px',
  },
  emptyTitle: {
    margin: 0,
    marginBottom: 8,
    color: '#111827',
    fontWeight: 700,
  },
  emptyText: {
    margin: 0,
    color: '#6B7280',
    fontSize: '0.9rem',
  },

  /* MODAL */
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(15,23,42,0.45)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '16px',
  },

  modal: {
    width: '100%',
    maxWidth: '440px',
    backgroundColor: '#FFFFFF',
    padding: '22px 20px 20px',
    borderRadius: '20px',
    textAlign: 'left',
    boxShadow: '0 20px 55px rgba(15,23,42,0.3)',
    border: '1px solid rgba(191,219,254,0.9)',
    color: '#0B1A33',
  },

  modalTitle: {
    margin: '0 0 10px',
    fontSize: '20px',
    fontWeight: 700,
    color: '#0B1A33',
    textAlign: 'center',
  },

  modalImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '12px',
    marginBottom: '10px',
  },

  modalMeta: {
    margin: '4px 0',
    fontSize: '14px',
    color: '#111827',
  },

  modalDescription: {
    margin: '4px 0',
    fontSize: '13px',
    color: '#4B5563',
  },

  // 🔹 row for From / To fields, side by side INSIDE modal box
  modalFieldRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
    marginTop: '16px',
    width: '100%',
  },

  modalField: {
    flex: 1,
    minWidth: 0,
  },

  modalHintRow: {
    marginTop: '6px',
    textAlign: 'left',
  },

  label: {
    fontWeight: 600,
    display: 'block',
    marginBottom: '6px',
    fontSize: '13px',
    color: '#0B1A33',
  },

  helperText: {
    fontSize: '11px',
    color: '#6B7280',
  },

  input: {
    width: '100%',
    padding: '9px 10px',
    borderRadius: '10px',
    border: '1px solid #CBD5F5',
    marginBottom: '4px',
    fontSize: '14px',
    backgroundColor: '#F9FAFB',
    color: '#0B1A33',
    outline: 'none',
  },

  primaryButton: {
    width: '100%',
    padding: '11px',
    backgroundImage: 'linear-gradient(135deg, #0A3D91, #1E5FE0)',
    border: 'none',
    borderRadius: '999px',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: '14px',
    color: '#F9FAFF',
    boxShadow: '0 10px 24px rgba(37,99,235,0.55)',
  },

  secondaryButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: 'transparent',
    borderRadius: '999px',
    border: '1px solid #CBD5F5',
    color: '#0A3D91',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '8px',
  },
};

export default Home;
