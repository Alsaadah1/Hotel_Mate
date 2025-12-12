// src/components/Navbar.jsx 

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../Store/usersSlice";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.users.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const handleBrandClick = () => {
    if (!user) {
      navigate("/");
      return;
    }

    // ✅ Owner & Staff: go to management overview
    if (user.role === "owner" || user.role === "staff") {
      navigate("/management-overview");
    } else {
      // default for customer or any other logged-in role
      navigate("/home");
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.navbar}>
      {/* Brand */}
      <div style={styles.brand} onClick={handleBrandClick}>
        <div style={styles.brandLogoWrap}>
          <img src="/logo.png" alt="Hotel Mate logo" style={styles.brandLogo} />
        </div>
        <div>
          <div style={styles.brandTitle}>Hotel Mate</div>
          <div style={styles.brandSub}>
            Boutique Stays &amp; Room Management
          </div>
        </div>
      </div>

      {/* Links */}
      <div style={styles.navLinks}>
        {/* Customer Navigation */}
        {user?.role === "customer" && (
          <>
            <span
              style={{
                ...styles.link,
                ...(isActive("/home") ? styles.linkActive : {}),
              }}
              onClick={() => navigate("/home")}
            >
              Rooms
            </span>
            <span
              style={{
                ...styles.link,
                ...(isActive("/booking-cart") ? styles.linkActive : {}),
              }}
              onClick={() => navigate("/booking-cart")}
            >
              My Bookings
            </span>
            <span
              style={{
                ...styles.link,
                ...(isActive("/reservations") ? styles.linkActive : {}),
              }}
              onClick={() => navigate("/reservations")}
            >
              My Reservations
            </span>
            <span
              style={{
                ...styles.link,
                ...(isActive("/profile") ? styles.linkActive : {}),
              }}
              onClick={() => navigate("/profile")}
            >
              Profile
            </span>
          </>
        )}

        {/* Owner Navigation (full admin) */}
        {user?.role === "owner" && (
          <>
            <span
              style={{
                ...styles.link,
                ...(isActive("/management-overview")
                  ? styles.linkActive
                  : {}),
              }}
              onClick={() => navigate("/management-overview")}
            >
              Overview
            </span>
            <span
              style={{
                ...styles.link,
                ...(isActive("/room-inventory") ? styles.linkActive : {}),
              }}
              onClick={() => navigate("/room-inventory")}
            >
              Rooms &amp; Inventory
            </span>
            <span
              style={{
                ...styles.link,
                ...(isActive("/booking-requests") ? styles.linkActive : {}),
              }}
              onClick={() => navigate("/booking-requests")}
            >
              Booking Requests
            </span>
            <span
              style={{
                ...styles.link,
                ...(isActive("/finance-report") ? styles.linkActive : {}),
              }}
              onClick={() => navigate("/finance-report")}
            >
              Finance Report
            </span>
            <span
              style={{
                ...styles.link,
                ...(isActive("/user-management") ? styles.linkActive : {}),
              }}
              onClick={() => navigate("/user-management")}
            >
              Team &amp; Users
            </span>
            <span
              style={{
                ...styles.link,
                ...(isActive("/profile") ? styles.linkActive : {}),
              }}
              onClick={() => navigate("/profile")}
            >
              Profile
            </span>
          </>
        )}

        {/* Staff Navigation (limited admin) */}
        {user?.role === "staff" && (
          <>
            <span
              style={{
                ...styles.link,
                ...(isActive("/management-overview")
                  ? styles.linkActive
                  : {}),
              }}
              onClick={() => navigate("/management-overview")}
            >
              Overview
            </span>
            <span
              style={{
                ...styles.link,
                ...(isActive("/room-inventory") ? styles.linkActive : {}),
              }}
              onClick={() => navigate("/room-inventory")}
            >
              Rooms &amp; Inventory
            </span>
            <span
              style={{
                ...styles.link,
                ...(isActive("/booking-requests") ? styles.linkActive : {}),
              }}
              onClick={() => navigate("/booking-requests")}
            >
              Booking Requests
            </span>
            <span
              style={{
                ...styles.link,
                ...(isActive("/profile") ? styles.linkActive : {}),
              }}
              onClick={() => navigate("/profile")}
            >
              Profile
            </span>
          </>
        )}

        {/* Logout */}
        {user && (
          <span
            style={{ ...styles.link, ...styles.logout }}
            onClick={handleLogout}
          >
            Logout
          </span>
        )}
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 24px",
    backgroundColor: "rgba(249,250,251,0.98)",
    backgroundImage:
      "linear-gradient(135deg, rgba(239,246,255,0.98), rgba(241,245,249,0.98))",
    borderBottom: "1px solid rgba(15,23,42,0.06)",
    boxShadow: "0 10px 30px rgba(15,23,42,0.1)",
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
    backgroundColor: "#111827",
    boxShadow: "0 10px 20px rgba(15,23,42,0.25)",
  },
  brandLogo: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    display: "block",
  },
  brandTitle: {
    fontSize: "17px",
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
  },
  brandSub: {
    fontSize: "11px",
    color: "#4b5563",
  },
  navLinks: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    fontSize: "13px",
    flexWrap: "wrap",
  },
  link: {
    cursor: "pointer",
    color: "#374151",
    fontWeight: 600,
    padding: "6px 12px",
    borderRadius: "999px",
    border: "1px solid transparent",
    transition:
      "background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease",
  },
  linkActive: {
    backgroundImage: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    borderColor: "rgba(191,219,254,0.9)",
    color: "#f9fafb",
    boxShadow: "0 8px 18px rgba(37,99,235,0.45)",
  },
  logout: {
    backgroundColor: "rgba(248,113,113,0.08)",
    borderColor: "rgba(248,113,113,0.7)",
    color: "#b91c1c",
    fontWeight: 700,
  },
};

export default Navbar;
