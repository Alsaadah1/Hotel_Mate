// src/pages/RoomInventory.jsx

import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar"; // ✅ ALWAYS use your Navbar.jsx from now on
import Swal from "sweetalert2";
import { useSelector } from "react-redux";

const RoomInventory = () => {
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);

  const [newRoom, setNewRoom] = useState({
    title: "",
    nightlyRate: "",
    capacity: "",
    summary: "",
    imageFile: null,
  });

  const user = useSelector((state) => state.users.user);
  const API_URL = process.env.REACT_APP_SERVER_URL;

  const isManagerLike = user && (user.role === "owner" || user.role === "staff");

  useEffect(() => {
    if (isManagerLike) fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchRooms = async () => {
    try {
      // 🔹 Fetch ALL rooms (no filter by managerId)
      const res = await fetch(`${API_URL}/api/rooms`);
      const data = await res.json();
      setRooms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const handleEdit = (room) => {
    setCurrentRoom(room);
    setEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete this room?",
      text: "This room will no longer be bookable by guests.",
      icon: "warning",
      showCancelButton: true, // ✅ fixed (was duplicated)
      confirmButtonColor: "#d4af37",
      cancelButtonColor: "#7a4a2e",
      confirmButtonText: "Yes, delete it",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_URL}/api/rooms/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (res.ok) {
          Swal.fire("Deleted", "Room removed from inventory.", "success");
          fetchRooms();
        } else {
          Swal.fire("Error", data.message || "Error deleting room", "error");
        }
      } catch (error) {
        console.error("Error deleting room:", error);
        Swal.fire("Error", "Error deleting room", "error");
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/rooms/${currentRoom._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: currentRoom.title,
          nightlyRate: currentRoom.nightlyRate,
          summary: currentRoom.summary,
          capacity: currentRoom.capacity,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        Swal.fire("Updated", "Room details saved successfully.", "success");
        setEditModalOpen(false);
        fetchRooms();
      } else {
        Swal.fire("Error", data.message || "Error updating room", "error");
      }
    } catch (error) {
      console.error("Error updating room:", error);
      Swal.fire("Error", "Error updating room", "error");
    }
  };

  const handleFileChange = (e) => {
    setNewRoom({ ...newRoom, imageFile: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newRoom.imageFile) {
      Swal.fire("Missing image", "Please upload a room photo.", "warning");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", newRoom.title);
      formData.append("nightlyRate", newRoom.nightlyRate);
      formData.append("summary", newRoom.summary);
      formData.append("capacity", newRoom.capacity);
      formData.append("managerId", user._id);
      formData.append("photo", newRoom.imageFile);

      const res = await fetch(`${API_URL}/api/rooms`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        Swal.fire("Room added", "Room added to your inventory.", "success");
        setShowModal(false);
        setNewRoom({
          title: "",
          nightlyRate: "",
          capacity: "",
          summary: "",
          imageFile: null,
        });
        fetchRooms();
      } else {
        Swal.fire("Error", data.message || "Error adding room", "error");
      }
    } catch (error) {
      console.error("Error adding room:", error);
      Swal.fire("Error", "Error adding room", "error");
    }
  };

  // ❌ Not logged in / not owner-staff
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
    if (!cap) return "—";
    return `${cap} guest${Number(cap) > 1 ? "s" : ""}`;
  };

  return (
    <>
      <Navbar />

      <div style={styles.page}>
        <div style={styles.wrapper}>
          {/* Header */}
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

          <section style={styles.mainLayout}>
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
                    Click <strong>&ldquo;Add new room&rdquo;</strong> to create your first listing.
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
                          <td style={styles.tdRoom}>
                            <div style={styles.roomCellInner}>
                              <div style={styles.imageShell}>
                                {room.photo ? (
                                  <img
                                    src={`${API_URL}/assets/images/${room.photo}`}
                                    alt={room.title}
                                    style={styles.image}
                                  />
                                ) : (
                                  <div style={styles.noImg}>No photo</div>
                                )}
                              </div>

                              <div>
                                <div style={styles.roomTitle}>{room.title}</div>
                                <div style={styles.roomMeta}>
                                  ID: {room._id?.slice(-6) || "N/A"}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td style={styles.tdPrice}>
                            <span style={styles.priceChip}>{room.nightlyRate} OMR</span>
                          </td>

                          <td style={styles.tdCapacity}>
                            <span style={styles.capacityPill}>{getCapacityLabel(room)}</span>
                          </td>

                          <td style={styles.tdDescription}>
                            {room.summary?.length > 70 ? room.summary.slice(0, 70) + "…" : room.summary}
                          </td>

                          <td style={styles.tdActions}>
                            <button
                              style={styles.smallBtn}
                              type="button"
                              onClick={() => handleEdit(room)}
                            >
                              Edit
                            </button>

                            {user.role === "owner" && (
                              <button
                                style={{ ...styles.smallBtn, ...styles.smallBtnDanger }}
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

            <aside style={styles.sideCard}>
              <h3 style={styles.sideTitle}>Inventory snapshot</h3>
              <p style={styles.sideText}>
                Keep photos, pricing, and descriptions up to date. Well-presented rooms are more likely to be booked.
              </p>

              <div style={styles.sideStatRow}>
                <span style={styles.sideStatLabel}>Rooms listed</span>
                <span style={styles.sideStatValue}>{rooms.length}</span>
              </div>

              <p style={styles.sideHint}>
                Tip: Use bright landscape images and mention bed type, view, facilities, and capacity.
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
              <button type="button" style={styles.modalClose} onClick={() => setShowModal(false)}>
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
                    onChange={(e) => setNewRoom({ ...newRoom, title: e.target.value })}
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
                    onChange={(e) => setNewRoom({ ...newRoom, nightlyRate: e.target.value })}
                    style={styles.input}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Room capacity (persons)</label>
                  <input
                    type="number"
                    placeholder="e.g. 2"
                    value={newRoom.capacity}
                    onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })}
                    style={styles.input}
                    min="1"
                    step="1"
                    required
                  />
                  <p style={styles.hint}>How many guests can comfortably stay in this room?</p>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Description</label>
                  <textarea
                    placeholder="Bed type, view, key facilities"
                    value={newRoom.summary}
                    onChange={(e) => setNewRoom({ ...newRoom, summary: e.target.value })}
                    style={{ ...styles.input, height: "90px", resize: "vertical" }}
                    required
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Room photo</label>
                  <input type="file" onChange={handleFileChange} style={styles.input} accept="image/*" required />
                  <p style={styles.hint}>Use a clear horizontal photo with good lighting.</p>
                </div>

                <div style={styles.modalFoot}>
                  <button type="button" style={styles.secondaryBtn} onClick={() => setShowModal(false)}>
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
              <button type="button" style={styles.modalClose} onClick={() => setEditModalOpen(false)}>
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
                    onChange={(e) => setCurrentRoom({ ...currentRoom, title: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Price per night (OMR)</label>
                  <input
                    type="number"
                    value={currentRoom.nightlyRate}
                    onChange={(e) => setCurrentRoom({ ...currentRoom, nightlyRate: e.target.value })}
                    style={styles.input}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Room capacity (persons)</label>
                  <input
                    type="number"
                    value={currentRoom.capacity ?? currentRoom.maxGuests ?? currentRoom.roomCapacity ?? ""}
                    onChange={(e) => setCurrentRoom({ ...currentRoom, capacity: e.target.value })}
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
                    onChange={(e) => setCurrentRoom({ ...currentRoom, summary: e.target.value })}
                    style={{ ...styles.input, height: "90px", resize: "vertical" }}
                    required
                  />
                </div>

                <div style={styles.modalFoot}>
                  <button type="button" style={styles.secondaryBtn} onClick={() => setEditModalOpen(false)}>
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

  mainLayout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 2.4fr) minmax(260px, 1fr)",
    gap: "18px",
  },

  panel: {
    borderRadius: "20px",
    border: "1px solid rgba(212,175,55,0.30)",
    padding: "16px 16px 14px",
    backgroundColor: "#ffffff",
    boxShadow: "0 18px 40px rgba(61,42,20,0.10)",
    color: "#4a2c1d",
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
    color: "#7a4a2e",
    opacity: 0.95,
  },

  badgeCount: {
    borderRadius: "999px",
    padding: "6px 12px",
    backgroundColor: "#fdf4e3",
    border: "1px solid rgba(212,175,55,0.30)",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "0.8rem",
  },
  badgeCountLabel: { color: "#7a4a2e", fontWeight: 800 },
  badgeCountNumber: { fontWeight: 900, color: "#c9a24d" },

  addBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 18px",
    borderRadius: "999px",
    border: "none",
    cursor: "pointer",
    backgroundImage: "linear-gradient(135deg,#7a4a2e,#d4af37)",
    color: "#fffaf3",
    fontWeight: 900,
    boxShadow: "0 14px 32px rgba(61,42,20,0.22)",
    fontSize: "0.9rem",
    whiteSpace: "nowrap",
  },
  addBtnIcon: { fontSize: "1.1rem", marginTop: "-1px" },

  tableWrapper: { width: "100%", overflowX: "auto", marginTop: "6px" },
  table: { width: "100%", borderCollapse: "collapse", borderRadius: "14px", overflow: "hidden" },

  th: {
    textAlign: "left",
    padding: "10px 12px",
    fontSize: "0.8rem",
    backgroundColor: "rgba(212,175,55,0.14)",
    color: "#7a4a2e",
    borderBottom: "1px solid rgba(212,175,55,0.24)",
  },
  thPrice: {
    textAlign: "right",
    padding: "10px 12px",
    fontSize: "0.8rem",
    backgroundColor: "rgba(212,175,55,0.14)",
    color: "#7a4a2e",
    borderBottom: "1px solid rgba(212,175,55,0.24)",
    whiteSpace: "nowrap",
  },
  thCapacity: {
    textAlign: "center",
    padding: "10px 12px",
    fontSize: "0.8rem",
    backgroundColor: "rgba(212,175,55,0.14)",
    color: "#7a4a2e",
    borderBottom: "1px solid rgba(212,175,55,0.24)",
    whiteSpace: "nowrap",
  },
  thDescription: {
    textAlign: "left",
    padding: "10px 12px",
    fontSize: "0.8rem",
    backgroundColor: "rgba(212,175,55,0.14)",
    color: "#7a4a2e",
    borderBottom: "1px solid rgba(212,175,55,0.24)",
  },
  thActions: {
    textAlign: "center",
    padding: "10px 12px",
    fontSize: "0.8rem",
    backgroundColor: "rgba(212,175,55,0.14)",
    color: "#7a4a2e",
    borderBottom: "1px solid rgba(212,175,55,0.24)",
    whiteSpace: "nowrap",
  },

  rowEven: { backgroundColor: "#faf6f1" },
  rowOdd: { backgroundColor: "#f3e6d8" },

  tdRoom: {
    padding: "10px 12px",
    borderBottom: "1px solid rgba(212,175,55,0.22)",
    verticalAlign: "middle",
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

  roomTitle: { fontSize: "0.92rem", fontWeight: 900, color: "#3d2a14" },
  roomMeta: { fontSize: "0.75rem", color: "#8c7a55", fontWeight: 700 },

  tdPrice: {
    padding: "10px 12px",
    borderBottom: "1px solid rgba(212,175,55,0.22)",
    textAlign: "right",
    verticalAlign: "middle",
  },
  priceChip: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "999px",
    backgroundColor: "rgba(212,175,55,0.22)",
    border: "1px solid rgba(212,175,55,0.30)",
    color: "#5a3a1a",
    fontSize: "0.8rem",
    fontWeight: 900,
  },

  tdCapacity: {
    padding: "10px 12px",
    borderBottom: "1px solid rgba(212,175,55,0.22)",
    textAlign: "center",
    verticalAlign: "middle",
  },
  capacityPill: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "999px",
    backgroundColor: "rgba(34,197,94,0.10)",
    border: "1px solid rgba(34,197,94,0.20)",
    fontSize: "0.78rem",
    color: "#166534",
    fontWeight: 900,
  },

  tdDescription: {
    padding: "10px 12px",
    borderBottom: "1px solid rgba(212,175,55,0.22)",
    verticalAlign: "top",
    fontSize: "0.82rem",
    color: "#6b5a3c",
    fontWeight: 700,
  },

  tdActions: {
    padding: "10px 12px",
    borderBottom: "1px solid rgba(212,175,55,0.22)",
    textAlign: "center",
    verticalAlign: "middle",
    whiteSpace: "nowrap",
  },

  smallBtn: {
    padding: "6px 12px",
    borderRadius: "999px",
    border: "1px solid rgba(212,175,55,0.30)",
    backgroundColor: "#ffffff",
    color: "#3d2a14",
    fontWeight: 900,
    fontSize: "0.78rem",
    cursor: "pointer",
    marginRight: "6px",
  },
  smallBtnDanger: {
    borderColor: "rgba(248,113,113,0.55)",
    backgroundImage: "linear-gradient(135deg, rgba(248,113,113,0.10), rgba(212,175,55,0.14))",
    color: "#b91c1c",
  },

  sideCard: {
    borderRadius: "20px",
    border: "1px solid rgba(212,175,55,0.30)",
    padding: "16px 16px 14px",
    backgroundImage:
      "radial-gradient(circle at top, rgba(212,175,55,0.20), transparent 55%), " +
      "linear-gradient(145deg, #ffffff, #fffaf3)",
    boxShadow: "0 18px 40px rgba(61,42,20,0.10)",
    color: "#3d2a14",
  },
  sideTitle: { margin: 0, fontSize: "0.95rem", fontWeight: 900 },
  sideText: { marginTop: "6px", fontSize: "0.82rem", color: "#6b5a3c", fontWeight: 700 },
  sideStatRow: {
    marginTop: "12px",
    padding: "8px 10px",
    borderRadius: "12px",
    backgroundColor: "rgba(212,175,55,0.10)",
    border: "1px solid rgba(212,175,55,0.22)",
    display: "flex",
    justifyContent: "space-between", // ✅ fixed
    alignItems: "center",
    fontSize: "0.82rem",
  },
  sideStatLabel: { color: "#6b5a3c", fontWeight: 800 },
  sideStatValue: { fontWeight: 900, color: "#3d2a14" },
  sideHint: { marginTop: "10px", fontSize: "0.78rem", color: "#8c7a55", fontWeight: 700 },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(61,42,20,0.40)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "12px",
  },
  modal: {
    width: "min(520px, 100%)",
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    border: "1px solid rgba(212,175,55,0.35)",
    boxShadow: "0 30px 80px rgba(61,42,20,0.28)",
    overflow: "hidden",
    color: "#3d2a14",
  },
  modalHead: {
    padding: "12px 16px",
    borderBottom: "1px solid rgba(212,175,55,0.22)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    backgroundImage: "linear-gradient(145deg, #fffaf3, #ffffff)",
  },
  modalTitle: { margin: 0, fontSize: "1rem", fontWeight: 900, color: "#3d2a14" },
  modalClose: { border: "none", background: "transparent", cursor: "pointer", fontSize: "1rem", color: "#6b5a3c" },
  modalBody: { padding: "14px 16px 12px" },
  modalFoot: {
    marginTop: "12px",
    paddingTop: "12px",
    borderTop: "1px solid rgba(212,175,55,0.22)",
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
  },

  fieldGroup: { marginBottom: "12px" },
  label: { display: "block", marginBottom: "4px", fontSize: "0.8rem", fontWeight: 900, color: "#5a3a1a" },
  input: {
    width: "100%",
    padding: "9px 10px",
    borderRadius: "10px",
    border: "1px solid rgba(212,175,55,0.30)",
    backgroundColor: "#fbf8f3",
    color: "#3d2a14",
    fontSize: "0.9rem",
    outline: "none",
    boxSizing: "border-box",
  },
  hint: { marginTop: "4px", fontSize: "0.78rem", color: "#8c7a55", fontWeight: 700 },

  primaryBtn: {
    padding: "9px 18px",
    borderRadius: "999px",
    border: "none",
    backgroundImage: "linear-gradient(135deg,#7a4a2e,#d4af37)",
    color: "#fffaf3",
    boxShadow: "0 14px 32px rgba(61,42,20,0.22)",
    fontWeight: 900,
    fontSize: "0.9rem",
    cursor: "pointer",
  },
  secondaryBtn: {
    padding: "9px 16px",
    borderRadius: "999px",
    border: "1px solid rgba(212,175,55,0.45)",
    backgroundColor: "transparent",
    color: "#6b5a3c",
    fontWeight: 900,
    fontSize: "0.9rem",
    cursor: "pointer",
  },

  emptyState: { padding: "28px 12px 14px", textAlign: "center" },
  emptyTitle: { margin: 0, fontWeight: 900, color: "#3d2a14", fontSize: "1rem" },
  emptyText: { marginTop: "6px", fontSize: "0.85rem", color: "#6b5a3c", fontWeight: 700 },

  noticeBox: {
    maxWidth: "520px",
    margin: "60px auto 0",
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    border: "1px solid rgba(212,175,55,0.35)",
    padding: "24px 20px",
    textAlign: "center",
    boxShadow: "0 30px 80px rgba(61,42,20,0.20)",
    color: "#3d2a14",
  },
  noticeTitle: { margin: 0, fontSize: "1.2rem", fontWeight: 900 },
  noticeText: { marginTop: "8px", fontSize: "0.9rem", color: "#6b5a3c", fontWeight: 700 },
};

export default RoomInventory;
