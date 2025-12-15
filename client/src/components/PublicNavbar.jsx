// client/src/components/PublicNavbar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

const PublicNavbar = () => {
  return (
    <nav className="public-nav">
      {/* LEFT */}
      <div className="nav-left">
        <NavLink to="/main-home" className="nav-brand">
          Hotel Mate
        </NavLink>
      </div>

      {/* RIGHT */}
      <div className="nav-right">
        {/* MAIN HOME */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            "nav-link" + (isActive ? " active" : "")
          }
        >
          Home
        </NavLink>

        {/* ABOUT */}
        <NavLink
          to="/about-us"
          className={({ isActive }) =>
            "nav-link" + (isActive ? " active" : "")
          }
        >
          About Us
        </NavLink>

        {/* LOGIN */}
        <NavLink
          to="/login"
          end
          className={({ isActive }) =>
            "nav-link" + (isActive ? " active" : "")
          }
        >
          Login
        </NavLink>

        {/* REGISTER */}
        <NavLink
          to="/register"
          className={({ isActive }) =>
            "nav-link" + (isActive ? " active" : "")
          }
        >
          Register
        </NavLink>
      </div>

      {/* STYLES */}
      <style>{`
        .public-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(139, 106, 47, 0.25);
          z-index: 1000;
        }

        .nav-brand {
          font-weight: 900;
          letter-spacing: 0.18em;
          color: #5a3a1a;
          text-decoration: none;
          text-transform: uppercase;
        }

        .nav-right {
          display: flex;
          gap: 18px;
          align-items: center;
        }

        .nav-link {
          font-size: 0.9rem;
          font-weight: 700;
          color: #8b6a2f;
          cursor: pointer;
          text-decoration: none;
          padding: 8px 12px;
          border-radius: 999px;
          transition: background 0.15s ease, color 0.15s ease;
        }

        .nav-link:hover {
          background: rgba(201, 162, 77, 0.12);
          color: #5a3a1a;
        }

        .nav-link.active {
          background: rgba(201, 162, 77, 0.22);
          color: #5a3a1a;
        }
      `}</style>
    </nav>
  );
};

export default PublicNavbar;
