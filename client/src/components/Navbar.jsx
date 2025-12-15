// client/src/components/Navbar.jsx

import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../Store/usersSlice";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.users.user);

  // ✅ Auto-hide by default (collapsed). User can open when needed.
  const [isOpen, setIsOpen] = useState(false);

  // ✅ Close sidebar on route change (keeps it from showing every time)
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const handleBrandClick = () => {
    if (!user) {
      navigate("/");
      return;
    }

    if (user.role === "owner" || user.role === "staff") {
      navigate("/management-overview");
    } else {
      navigate("/home");
    }
  };

  const isActive = (path) => location.pathname === path;

  const roleLabel =
    user?.role === "owner"
      ? "Owner"
      : user?.role === "staff"
      ? "Staff"
      : "Customer";

  const initials = useMemo(() => {
    const email = (user?.email || "").trim();
    if (!email) return "HM";
    const left = email.split("@")[0] || "";
    const parts = left.split(/[._-]/).filter(Boolean);
    const a = (parts[0] || left)[0] || "H";
    const b = (parts[1] || left)[0] || left[1] || "M";
    return (a + b).toUpperCase();
  }, [user]);

  const menuItems = useMemo(() => {
    if (!user) return [];

    if (user.role === "customer") {
      return [
        { label: "Rooms", path: "/home" },
        { label: "My Bookings", path: "/booking-cart" },
        { label: "My Reservations", path: "/reservations" },
        { label: "Profile", path: "/profile" },
      ];
    }

    if (user.role === "owner") {
      return [
        { label: "Overview", path: "/management-overview" },
        { label: "Rooms & Inventory", path: "/room-inventory" },
        { label: "Booking Requests", path: "/booking-requests" },
        { label: "Finance Report", path: "/finance-report" },
        { label: "Team & Users", path: "/user-management" },
        { label: "Profile", path: "/profile" },
      ];
    }

    if (user.role === "staff") {
      return [
        { label: "Overview", path: "/management-overview" },
        { label: "Rooms & Inventory", path: "/room-inventory" },
        { label: "Booking Requests", path: "/booking-requests" },
        { label: "Profile", path: "/profile" },
      ];
    }

    return [{ label: "Profile", path: "/profile" }];
  }, [user]);

  const go = (path) => {
    navigate(path);
  };

  const showFloatingOpenBtn = user && !isOpen;

  return (
    <>
      {/* Top Bar: brand + toggle (NO LINKS) */}
      <nav style={styles.topbar}>
        <div style={styles.brand} onClick={handleBrandClick}>
          <div style={styles.brandLogoWrap}>
            <img src="/logo.png" alt="Hotel Mate logo" style={styles.brandLogo} />
          </div>
          <div>
            <div style={styles.brandTitle}>Hotel Mate</div>
            <div style={styles.brandSub}>Boutique Stays &amp; Room Management</div>
          </div>
        </div>

        {/* Toggle only */}
        {user && (
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            style={styles.toggleBtn}
            aria-label={isOpen ? "Collapse menu" : "Expand menu"}
          >
            {isOpen ? "× Close" : "☰ Menu"}
          </button>
        )}
      </nav>

      {/* Backdrop (click to close) */}
      {user && isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          style={styles.backdrop}
          aria-label="Close menu"
        />
      )}

      {/* LEFT SIDEBAR */}
      {user && (
        <aside
          style={{
            ...styles.sidebar,
            ...(isOpen ? styles.sidebarOpen : styles.sidebarClosed),
          }}
        >
          {/* Profile header */}
          <div style={styles.sideProfile}>
            <div style={styles.sideAvatar}>{initials}</div>
            <div style={styles.sideMeta}>
              <div style={styles.sideRole}>{roleLabel}</div>
              <div style={styles.sideEmail}>{user?.email || "—"}</div>
            </div>
          </div>

          {/* Menu */}
          <div style={styles.sideMenu}>
            {menuItems.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => {
                    go(item.path);
                    setIsOpen(false);
                  }}
                  style={{
                    ...styles.sideLink,
                    ...(active ? styles.sideLinkActive : {}),
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Footer logout */}
          <div style={styles.sideFooter}>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              style={styles.sideLogout}
            >
              Log out
            </button>
            <div style={styles.sideNote}>Hotel Mate • Management Console</div>
          </div>
        </aside>
      )}

      {/* Floating open button when collapsed */}
      {showFloatingOpenBtn && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={styles.floatingOpen}
          aria-label="Open menu"
        >
          ☰
        </button>
      )}
    </>
  );
};

const styles = {
  /* ===== Top bar ===== */
  topbar: {
    position: "sticky",
    top: 0,
    zIndex: 60,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 24px",
    backgroundColor: "rgba(255,255,255,0.92)",
    backgroundImage:
      "linear-gradient(135deg, rgba(255,250,235,0.98), rgba(247,241,230,0.98))",
    borderBottom: "1px solid rgba(139, 106, 47, 0.25)",
    boxShadow: "0 10px 30px rgba(61, 42, 20, 0.12)",
    backdropFilter: "blur(12px)",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
  },
  brandLogoWrap: {
    width: "36px",
    height: "36px",
    borderRadius: "999px",
    overflow: "hidden",
    display: "grid",
    placeItems: "center",
    backgroundImage: "linear-gradient(135deg, #5a3a1a, #c9a24d)",
    boxShadow: "0 10px 20px rgba(61,42,20,0.25)",
  },
  brandLogo: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    display: "block",
    filter: "brightness(1.05)",
  },
  brandTitle: {
    fontSize: "17px",
    fontWeight: 900,
    color: "#5a3a1a",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
  },
  brandSub: {
    fontSize: "11px",
    color: "#6b5a3c",
  },

  toggleBtn: {
    cursor: "pointer",
    border: "1px solid rgba(139,106,47,0.28)",
    background: "rgba(201,162,77,0.10)",
    color: "#5a3a1a",
    fontWeight: 900,
    padding: "7px 12px",
    borderRadius: "999px",
    boxShadow: "0 10px 20px rgba(61,42,20,0.10)",
    whiteSpace: "nowrap",
  },

  /* Backdrop */
  backdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 54,
    border: "none",
    padding: 0,
    margin: 0,
    background: "rgba(43,26,18,0.38)",
    cursor: "pointer",
  },

  /* ===== Sidebar ===== */
  sidebar: {
    position: "fixed",
    top: 64,
    left: 0,
    height: "calc(100vh - 64px)",
    width: 290,
    background: "linear-gradient(145deg, #ffffff, #fbf6ec)",
    borderRight: "1px solid rgba(139,106,47,0.22)",
    boxShadow: "0 30px 60px rgba(0,0,0,0.14)",
    zIndex: 55,
    display: "flex",
    flexDirection: "column",
    padding: 14,
    transition: "transform 0.22s ease",
  },
  sidebarOpen: {
    transform: "translateX(0)",
  },
  sidebarClosed: {
    transform: "translateX(-105%)",
  },

  sideProfile: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 10px",
    borderRadius: 14,
    background: "rgba(201,162,77,0.10)",
    border: "1px solid rgba(139,106,47,0.22)",
  },
  sideAvatar: {
    width: 44,
    height: 44,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    letterSpacing: "0.06em",
    color: "#ffffff",
    backgroundImage: "linear-gradient(135deg, #5a3a1a, #c9a24d)",
    boxShadow: "0 12px 24px rgba(61,42,20,0.22)",
    flex: "0 0 auto",
  },
  sideMeta: {
    minWidth: 0,
  },
  sideRole: {
    fontSize: 11,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: "#5a3a1a",
    fontWeight: 900,
    marginBottom: 2,
  },
  sideEmail: {
    fontSize: 12,
    color: "#6b5a3c",
    fontWeight: 800,
    wordBreak: "break-word",
    lineHeight: 1.2,
  },

  sideMenu: {
    marginTop: 14,
    display: "grid",
    gap: 10,
    padding: "6px 2px",
    overflowY: "auto",
  },

  sideLink: {
    textAlign: "left",
    border: "1px solid rgba(139,106,47,0.14)",
    background: "#ffffff",
    color: "#8b6a2f",
    padding: "10px 12px",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: 900,
    transition: "transform 0.12s ease, background 0.12s ease, color 0.12s ease",
  },
  sideLinkActive: {
    background: "rgba(201,162,77,0.18)",
    borderColor: "rgba(139,106,47,0.22)",
    color: "#5a3a1a",
  },

  sideFooter: {
    marginTop: "auto",
    paddingTop: 12,
    borderTop: "1px solid rgba(139,106,47,0.18)",
    display: "grid",
    gap: 10,
  },
  sideLogout: {
    border: "none",
    borderRadius: 999,
    cursor: "pointer",
    padding: "10px 12px",
    fontWeight: 900,
    color: "#ffffff",
    backgroundImage: "linear-gradient(135deg, #5a3a1a, #c9a24d)",
    boxShadow: "0 14px 30px rgba(61,42,20,0.22)",
  },
  sideNote: {
    textAlign: "center",
    fontSize: 12,
    color: "#8c7a55",
    fontWeight: 700,
  },

  /* Floating open btn when sidebar is hidden */
  floatingOpen: {
    position: "fixed",
    left: 14,
    bottom: 14,
    zIndex: 70,
    width: 52,
    height: 52,
    borderRadius: 16,
    border: "1px solid rgba(139,106,47,0.25)",
    background: "rgba(255,255,255,0.92)",
    color: "#5a3a1a",
    fontWeight: 900,
    boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
    cursor: "pointer",
  },
};

export default Navbar;
