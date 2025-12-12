// src/pages/RoomInventory.jsx

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';

const RoomInventory = () => {
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);

  const [newRoom, setNewRoom] = useState({
    title: '',
    nightlyRate: '',
    capacity: '',       // 🔹 room capacity
    summary: '',
    imageFile: null,
  });

  const user = useSelector((state) => state.users.user);
  const API_URL = process.env.REACT_APP_SERVER_URL;

  const isManagerLike =
    user && (user.role === 'owner' || user.role === 'staff'); // ✅ owner OR staff

  useEffect(() => {
    if (isManagerLike) {
      fetchRooms();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

const fetchRooms = async () => {
  try {
    // 🔹 Fetch ALL rooms (no filter by managerId)
    const res = await fetch(`${API_URL}/api/rooms`);
    const data = await res.json();
    setRooms(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error('Error fetching rooms:', error);
  }
};


  const handleEdit = (room) => {
    setCurrentRoom(room);
    setEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete this room?',
      text: 'This room will no longer be bookable by guests.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1e5fe0', // blue
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it',
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_URL}/api/rooms/${id}`, {
          method: 'DELETE',
        });
        const data = await res.json();
        if (res.ok) {
          Swal.fire('Deleted', 'Room removed from inventory.', 'success');
          fetchRooms();
        } else {
          Swal.fire('Error', data.message || 'Error deleting room', 'error');
        }
      } catch (error) {
        console.error('Error deleting room:', error);
        Swal.fire('Error', 'Error deleting room', 'error');
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/rooms/${currentRoom._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: currentRoom.title,
          nightlyRate: currentRoom.nightlyRate,
          summary: currentRoom.summary,
          capacity: currentRoom.capacity, // 🔹 send capacity in update
        }),
      });

      const data = await res.json();
      if (res.ok) {
        Swal.fire('Updated', 'Room details saved successfully.', 'success');
        setEditModalOpen(false);
        fetchRooms();
      } else {
        Swal.fire('Error', data.message || 'Error updating room', 'error');
      }
    } catch (error) {
      console.error('Error updating room:', error);
      Swal.fire('Error', 'Error updating room', 'error');
    }
  };

  const handleFileChange = (e) => {
    setNewRoom({ ...newRoom, imageFile: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newRoom.imageFile) {
      Swal.fire('Missing image', 'Please upload a room photo.', 'warning');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', newRoom.title);
      formData.append('nightlyRate', newRoom.nightlyRate);
      formData.append('summary', newRoom.summary);
      formData.append('capacity', newRoom.capacity); // 🔹 send capacity on create
      formData.append('managerId', user._id);
      formData.append('photo', newRoom.imageFile);

      const res = await fetch(`${API_URL}/api/rooms`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        Swal.fire('Room added', 'Room added to your inventory.', 'success');
        setShowModal(false);
        setNewRoom({
          title: '',
          nightlyRate: '',
          capacity: '',
          summary: '',
          imageFile: null,
        });
        fetchRooms();
      } else {
        Swal.fire('Error', data.message || 'Error adding room', 'error');
      }
    } catch (error) {
      console.error('Error adding room:', error);
      Swal.fire('Error', 'Error adding room', 'error');
    }
  };

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
                The room inventory is only available for hotel managers and staff.
                Please log in using your manager or staff account.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  const getCapacityLabel = (room) => {
    const cap = room.capacity ?? room.maxGuests ?? room.roomCapacity;
    if (!cap) return '—';
    return `${cap} guest${Number(cap) > 1 ? 's' : ''}`;
  };

  return (
    <>
      <Navbar />

      <div style={styles.page}>
        <div style={styles.wrapper}>
          {/* Header band inside page */}
          <header style={styles.headerBand}>
            <div>
              <p style={styles.headerKicker}>Hotel Mate · Inventory</p>
              <h1 style={styles.title}>Room Inventory</h1>
              <p style={styles.subtitle}>
                Manage every room that appears in guest searches and bookings.
              </p>
            </div>
            <button style={styles.addBtn} onClick={() => setShowModal(true)}>
              <span style={styles.addBtnIcon}>＋</span>
              <span>Add new room</span>
            </button>
          </header>

          {/* Table + count card */}
          <section style={styles.mainLayout}>
            {/* Left: rooms table */}
            <div style={styles.panel}>
              <div style={styles.panelHeaderRow}>
                <div>
                  <h2 style={styles.panelTitle}>Active room listings</h2>
                  <p style={styles.panelSubtitle}>
                    Guests can book any room that is listed here.
                  </p>
                </div>
                <div style={styles.badgeCount}>
                  <span style={styles.badgeCountLabel}>Total rooms</span>
                  <span style={styles.badgeCountNumber}>{rooms.length}</span>
                </div>
              </div>

              {rooms.length === 0 ? (
                <div style={styles.emptyState}>
                  <p style={styles.emptyTitle}>No rooms in inventory yet</p>
                  <p style={styles.emptyText}>
                    Click <strong>&ldquo;Add new room&rdquo;</strong> to create your
                    first listing.
                  </p>
                </div>
              ) : (
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Room</th>
                        <th style={styles.thPrice}>Rate (OMR / night)</th>
                        <th style={styles.thCapacity}>Capacity</th>
                        <th style={styles.thDescription}>Highlights</th>
                        <th style={styles.thActions}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rooms.map((room, idx) => (
                        <tr
                          key={room._id}
                          style={idx % 2 === 0 ? styles.rowEven : styles.rowOdd}
                        >
                          {/* Room cell with photo + info */}
                          <td style={styles.tdRoom}>
                            <div style={styles.roomCellInner}>
                              <div style={styles.imageShell}>
                                {room.photo && (
                                  <img
                                    src={`${API_URL}/assets/images/${room.photo}`}
                                    alt={room.title}
                                    style={styles.image}
                                  />
                                )}
                              </div>
                              <div>
                                <div style={styles.roomTitle}>{room.title}</div>
                                <div style={styles.roomMeta}>
                                  ID: {room._id?.slice(-6) || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Price */}
                          <td style={styles.tdPrice}>
                            <span style={styles.priceChip}>
                              {room.nightlyRate} OMR
                            </span>
                          </td>

                          {/* Capacity */}
                          <td style={styles.tdCapacity}>
                            <span style={styles.capacityPill}>
                              {getCapacityLabel(room)}
                            </span>
                          </td>

                          {/* Description */}
                          <td style={styles.tdDescription}>
                            {room.summary?.length > 70
                              ? room.summary.slice(0, 70) + '…'
                              : room.summary}
                          </td>

                          {/* Actions */}
                          <td style={styles.tdActions}>
                            <button
                              style={styles.smallBtn}
                              type="button"
                              onClick={() => handleEdit(room)}
                            >
                              Edit
                            </button>

                            {/* ❌ Delete only visible for owner (not staff) */}
                            {user.role === 'owner' && (
                              <button
                                style={{
                                  ...styles.smallBtn,
                                  ...styles.smallBtnDanger,
                                }}
                                type="button"
                                onClick={() => handleDelete(room._id)}
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Right: mini summary card */}
            <aside style={styles.sideCard}>
              <h3 style={styles.sideTitle}>Inventory snapshot</h3>
              <p style={styles.sideText}>
                Keep your room photos, pricing, and descriptions up to date. Well-presented
                rooms are more likely to be booked by guests.
              </p>

              <div style={styles.sideStatRow}>
                <span style={styles.sideStatLabel}>Rooms listed</span>
                <span style={styles.sideStatValue}>{rooms.length}</span>
              </div>

              <p style={styles.sideHint}>
                Tip: Use landscape images with good lighting, and mention bed type, view,
                capacity, and key facilities in the description.
              </p>
            </aside>
          </section>
        </div>
      </div>

      {/* Add Room Modal */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHead}>
              <h3 style={styles.modalTitle}>Add new room</h3>
              <button
                type="button"
                style={styles.modalClose}
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            <div style={styles.modalBody}>
              <form onSubmit={handleSubmit}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Room name</label>
                  <input
                    type="text"
                    placeholder="e.g. Deluxe King Room"
                    value={newRoom.title}
                    onChange={(e) =>
                      setNewRoom({ ...newRoom, title: e.target.value })
                    }
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Price per night (OMR)</label>
                  <input
                    type="number"
                    placeholder="e.g. 45"
                    value={newRoom.nightlyRate}
                    onChange={(e) =>
                      setNewRoom({ ...newRoom, nightlyRate: e.target.value })
                    }
                    style={styles.input}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                {/* Capacity field */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Room capacity (persons)</label>
                  <input
                    type="number"
                    placeholder="e.g. 2"
                    value={newRoom.capacity}
                    onChange={(e) =>
                      setNewRoom({ ...newRoom, capacity: e.target.value })
                    }
                    style={styles.input}
                    min="1"
                    step="1"
                    required
                  />
                  <p style={styles.hint}>
                    How many guests can comfortably stay in this room?
                  </p>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Description</label>
                  <textarea
                    placeholder="Short description (bed type, view, key facilities)"
                    value={newRoom.summary}
                    onChange={(e) =>
                      setNewRoom({ ...newRoom, summary: e.target.value })
                    }
                    style={{ ...styles.input, height: '90px', resize: 'vertical' }}
                    required
                  />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Room photo</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    style={styles.input}
                    accept="image/*"
                    required
                  />
                  <p style={styles.hint}>
                    Use a clear, horizontal photo of the room with good lighting.
                  </p>
                </div>

                <div style={styles.modalFoot}>
                  <button
                    type="button"
                    style={styles.secondaryBtn}
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" style={styles.primaryBtn}>
                    Save room
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {editModalOpen && currentRoom && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHead}>
              <h3 style={styles.modalTitle}>Edit room</h3>
              <button
                type="button"
                style={styles.modalClose}
                onClick={() => setEditModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div style={styles.modalBody}>
              <form onSubmit={handleUpdate}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Room name</label>
                  <input
                    type="text"
                    value={currentRoom.title}
                    onChange={(e) =>
                      setCurrentRoom({
                        ...currentRoom,
                        title: e.target.value,
                      })
                    }
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Price per night (OMR)</label>
                  <input
                    type="number"
                    value={currentRoom.nightlyRate}
                    onChange={(e) =>
                      setCurrentRoom({
                        ...currentRoom,
                        nightlyRate: e.target.value,
                      })
                    }
                    style={styles.input}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                {/* Capacity edit field */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Room capacity (persons)</label>
                  <input
                    type="number"
                    value={
                      currentRoom.capacity ??
                      currentRoom.maxGuests ??
                      currentRoom.roomCapacity ??
                      ''
                    }
                    onChange={(e) =>
                      setCurrentRoom({
                        ...currentRoom,
                        capacity: e.target.value,
                      })
                    }
                    style={styles.input}
                    min="1"
                    step="1"
                    required
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Description</label>
                  <textarea
                    value={currentRoom.summary}
                    onChange={(e) =>
                      setCurrentRoom({
                        ...currentRoom,
                        summary: e.target.value,
                      })
                    }
                    style={{ ...styles.input, height: '90px', resize: 'vertical' }}
                    required
                  />
                </div>

                <div style={styles.modalFoot}>
                  <button
                    type="button"
                    style={styles.secondaryBtn}
                    onClick={() => setEditModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" style={styles.primaryBtn}>
                    Update room
                  </button>
                </div>
              </form>
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

  mainLayout: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 2.4fr) minmax(260px, 1fr)',
    gap: '18px',
  },

  panel: {
    borderRadius: '20px',
    border: '1px solid rgba(15,23,42,0.06)',
    padding: '16px 16px 14px',
    backgroundColor: '#ffffff',
    boxShadow: '0 18px 40px rgba(15,23,42,0.10)',
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

  badgeCount: {
    borderRadius: '999px',
    padding: '6px 12px',
    backgroundColor: '#eff6ff',
    border: '1px solid rgba(37,99,235,0.35)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.8rem',
  },
  badgeCountLabel: {
    color: '#1e3a8a',
  },
  badgeCountNumber: {
    fontWeight: 800,
    color: '#1d4ed8',
  },

  addBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 18px',
    borderRadius: '999px',
    border: 'none',
    cursor: 'pointer',
    backgroundImage: 'linear-gradient(135deg,#0a3d91,#1e5fe0)',
    color: '#f9fafb',
    fontWeight: 800,
    boxShadow: '0 14px 32px rgba(37,99,235,0.45)',
    fontSize: '0.9rem',
    whiteSpace: 'nowrap',
  },
  addBtnIcon: {
    fontSize: '1.1rem',
    marginTop: '-1px',
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
  th: {
    textAlign: 'left',
    padding: '10px 12px',
    fontSize: '0.8rem',
    color: '#e5f0ff',
    borderBottom: '1px solid rgba(148,163,184,0.4)',
    backgroundColor: '#0f172a',
  },
  thPrice: {
    textAlign: 'right',
    padding: '10px 12px',
    fontSize: '0.8rem',
    color: '#e5f0ff',
    borderBottom: '1px solid rgba(148,163,184,0.4)',
    backgroundColor: '#0f172a',
    whiteSpace: 'nowrap',
  },
  thCapacity: {
    textAlign: 'center',
    padding: '10px 12px',
    fontSize: '0.8rem',
    color: '#e5f0ff',
    borderBottom: '1px solid rgba(148,163,184,0.4)',
    backgroundColor: '#0f172a',
    whiteSpace: 'nowrap',
  },
  thDescription: {
    textAlign: 'left',
    padding: '10px 12px',
    fontSize: '0.8rem',
    color: '#e5f0ff',
    borderBottom: '1px solid rgba(148,163,184,0.4)',
    backgroundColor: '#0f172a',
  },
  thActions: {
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
  roomTitle: {
    fontSize: '0.92rem',
    fontWeight: 700,
    color: '#0f172a',
  },
  roomMeta: {
    fontSize: '0.75rem',
    color: '#6b7280',
  },

  tdPrice: {
    padding: '10px 12px',
    borderBottom: '1px solid rgba(148,163,184,0.25)',
    textAlign: 'right',
    verticalAlign: 'middle',
  },
  priceChip: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '999px',
    backgroundColor: 'rgba(37,99,235,0.08)',
    color: '#1d4ed8',
    fontSize: '0.8rem',
    fontWeight: 700,
  },

  tdCapacity: {
    padding: '10px 12px',
    borderBottom: '1px solid rgba(148,163,184,0.25)',
    textAlign: 'center',
    verticalAlign: 'middle',
  },
  capacityPill: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '999px',
    backgroundColor: '#ecfdf5',
    border: '1px solid #22c55e33',
    fontSize: '0.78rem',
    color: '#166534',
    fontWeight: 600,
  },

  tdDescription: {
    padding: '10px 12px',
    borderBottom: '1px solid rgba(148,163,184,0.25)',
    verticalAlign: 'top',
    fontSize: '0.82rem',
    color: '#4b5563',
  },

  tdActions: {
    padding: '10px 12px',
    borderBottom: '1px solid rgba(148,163,184,0.25)',
    textAlign: 'center',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
  },

  smallBtn: {
    padding: '6px 12px',
    borderRadius: '999px',
    border: '1px solid rgba(148,163,184,0.8)',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontWeight: 700,
    fontSize: '0.78rem',
    cursor: 'pointer',
    marginRight: '6px',
  },
  smallBtnDanger: {
    borderColor: 'rgba(248,113,113,0.8)',
    backgroundImage:
      'linear-gradient(135deg,rgba(248,113,113,0.08),rgba(248,113,113,0.18))',
    color: '#b91c1c',
  },

  sideCard: {
    borderRadius: '20px',
    border: '1px solid rgba(15,23,42,0.06)',
    padding: '16px 16px 14px',
    backgroundImage:
      'radial-gradient(circle at top, rgba(191,219,254,0.35), transparent 55%), ' +
      'linear-gradient(145deg, #ffffff, #f5f7ff)',
    boxShadow: '0 18px 40px rgba(15,23,42,0.10)',
    color: '#0b1a33',
  },
  sideTitle: {
    margin: 0,
    fontSize: '0.95rem',
    fontWeight: 800,
  },
  sideText: {
    marginTop: '6px',
    fontSize: '0.82rem',
    color: '#6b7280',
    opacity: 0.95,
  },
  sideStatRow: {
    marginTop: '12px',
    padding: '8px 10px',
    borderRadius: '12px',
    backgroundColor: '#eff6ff',
    border: '1px solid rgba(37,99,235,0.25)',
    display: 'flex',
    justifyContent: 'spaceBetween',
    fontSize: '0.82rem',
  },
  sideStatLabel: {
    color: '#1e3a8a',
  },
  sideStatValue: {
    fontWeight: 800,
    color: '#1d4ed8',
  },
  sideHint: {
    marginTop: '10px',
    fontSize: '0.78rem',
    color: '#6b7280',
    opacity: 0.95,
  },

  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(15,23,42,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '12px',
  },
  modal: {
    width: 'min(480px, 100%)',
    backgroundColor: '#ffffff',
    borderRadius: '18px',
    border: '1px solid rgba(15,23,42,0.12)',
    boxShadow: '0 30px 80px rgba(15,23,42,0.28)',
    overflow: 'hidden',
    color: '#0b1a33',
  },
  modalHead: {
    padding: '12px 16px',
    borderBottom: '1px solid rgba(148,163,184,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },
  modalTitle: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 800,
  },
  modalClose: {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '1rem',
    color: '#6b7280',
  },
  modalBody: {
    padding: '14px 16px 12px',
  },
  modalFoot: {
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid rgba(148,163,184,0.35)',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
  },

  fieldGroup: {
    marginBottom: '12px',
  },
  label: {
    display: 'block',
    marginBottom: '4px',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#374151',
  },
  input: {
    width: '100%',
    padding: '9px 10px',
    borderRadius: '10px',
    border: '1px solid rgba(148,163,184,0.9)',
    backgroundColor: '#f9fafb',
    color: '#0f172a',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  hint: {
    marginTop: '4px',
    fontSize: '0.78rem',
    color: '#6b7280',
  },
  primaryBtn: {
    padding: '9px 18px',
    borderRadius: '999px',
    border: 'none',
    backgroundImage: 'linear-gradient(135deg,#0a3d91,#1e5fe0)',
    color: '#f9fafb',
    fontWeight: 800,
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  secondaryBtn: {
    padding: '9px 16px',
    borderRadius: '999px',
    border: '1px solid rgba(148,163,184,0.9)',
    backgroundColor: 'transparent',
    color: '#374151',
    fontWeight: 600,
    fontSize: '0.9rem',
    cursor: 'pointer',
  },

  emptyState: {
    padding: '28px 12px 14px',
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

export default RoomInventory;
