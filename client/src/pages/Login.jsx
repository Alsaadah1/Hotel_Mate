// client/src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../Store/usersSlice";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const API_URL = process.env.REACT_APP_SERVER_URL;

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessageType("success");
        setMessage("✔ " + (data.message || "Login successful"));

        dispatch(loginSuccess(data.user));
        localStorage.setItem("user", JSON.stringify(data.user));

        const role = data.user?.role;
        let target = "/home";

        if (role === "customer") {
          target = "/home";
        } else if (role === "owner" || role === "staff") {
          target = "/management-overview";
        }

        setTimeout(() => {
          navigate(target);
        }, 800);
      } else {
        setMessageType("error");
        setMessage("❌ " + (data.message || "Invalid login credentials"));
      }
    } catch (err) {
      setMessageType("error");
      setMessage("❌ Unable to login. Please try again.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-overlay" />

      <main className="login-shell">
        {/* LEFT PANEL – brand + image */}
        <section className="login-hero">
          <div className="login-hero-inner">
            <h1 className="login-brand">Hotel Mate</h1>
            <p className="login-tagline">Modern stays with classic comfort.</p>
            <p className="login-description">
              Manage reservations, guests, and room details from one elegant
              dashboard whether you are a hotel manager or a returning guest.
            </p>

            <div className="login-highlights">
              <div className="highlight-pill">✓ Fast check-in</div>
              <div className="highlight-pill">✓ Smart reservations</div>
              <div className="highlight-pill">✓ Manager tools</div>
            </div>

            <div className="login-footer-note">
              Crafted for boutique hotels, resorts, and city stays.
            </div>
          </div>
        </section>

        {/* RIGHT PANEL – form card */}
        <section className="login-card-wrap">
          <div className="login-card">
            <h2 className="login-card-title">Welcome back</h2>
            <p className="login-card-subtitle">
              Sign in to your Hotel Mate account.
            </p>

            {message && (
              <div
                className={`alert ${
                  messageType === "success" ? "alert-success" : "alert-error"
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleLogin} noValidate>
              <label className="login-label" htmlFor="email">
                Email
              </label>
              <input
                className="login-input"
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <label className="login-label" htmlFor="password">
                Password
              </label>
              <div className="login-input-wrap">
                <input
                  className="login-input login-input-password"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <button className="login-btn" type="submit">
                Sign in
              </button>

              <div className="login-actions">
                <span
                  className="login-link"
                  onClick={() => navigate("/register")}
                >
                  New guest? Create an account
                </span>
              </div>
            </form>
          </div>
        </section>
      </main>

      <style>{`
        :root {
          --blue-deep: #47300eff;
          --blue-primary: #694f20ff;
          --blue-soft: #cec1a8ff;
          --blue-mid: #9b690bff;
          --blue-dark: #644408ff;

          --bg-page: #f3f6fb;
          --bg-overlay: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.7),
            rgba(232, 241, 255, 0.85)
          );

          --text-main: #000000ff;
          --text-muted: #060505ff;
          --text-subtle: #050506ff;

          --card-bg: #9b690bff;
          --card-border: rgba(15, 23, 42, 0.06);

          --input-border: rgba(15, 23, 42, 0.18);
          --input-bg: #ffffff;
          --ring: #9b690bff;
        }

        .login-page {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: stretch;
          justify-content: center;
          padding: 24px;
          color: var(--text-main);

          background-image: url("/BG.JPG");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        .login-overlay {
          position: fixed;
          inset: 0;
          background: var(--bg-overlay);
          pointer-events: none;
          z-index: 0;
        }

       
        .login-shell{
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 980px;

          display: flex;
          flex-direction: column;
          gap: 24px;
          align-items: center;
        }

         
        .login-hero{
          width: 100%;
          max-width: 900px;

          border-radius: 0px;
          padding: 25px 15px 25px;
          border: 3px solid #9b690bff;
          background:
            radial-gradient(circle at top left, #ddbc80ff, transparent 55%),
            radial-gradient(circle at bottom right, #f1e1c5ff, transparent 60%),
            linear-gradient(145deg, #ffffff, #d8c7aaff);
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.12);
          display: flex;
        }

        .login-hero-inner {
          margin: auto 0;
        }

        .login-brand {
          font-size: 2rem;
          font-weight: 900;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          margin: 0 0 10px;
          color: var(--brown-deep);
        }

        .login-tagline {
          margin: 0 0 12px;
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--blue-dark);
        }

        .login-description {
          margin: 0 0 18px;
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--text-subtle);
        }

        .login-highlights {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 18px;
        }

        .highlight-pill {
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 600;
          background: #c5a972ff;
          border: 1px solid #3b2b0cff;
          color: var(--blue-deep);
        }

        .login-footer-note {
          font-size: 0.8rem;
          color: var(--text-subtle);
          opacity: 0.95;
        }

        .login-card-wrap{
          width: 100%;
          max-width: 900px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .login-card{
          width: 100%;
          max-width: 520px;
          background:
            radial-gradient(circle at top, #eadec8ff),
            linear-gradient(145deg, #ffffff, #f5f7ff);
          border-radius: 0px;
          padding: 26px 28px 24px;
          border: 0px solid var(--card-border);
         
          backdrop-filter: blur(10px);
        }

        .login-card-title {
          margin: 0 0 4px;
          font-size: 1.4rem;
          font-weight: 800;
          letter-spacing: 0.03em;
          color: var(--blue-dark);
        }

        .login-card-subtitle {
          margin: 0 0 16px;
          font-size: 0.9rem;
          color: var(--text-subtle);
        }

        .login-label {
          display: block;
          font-size: 0.85rem;
          color: var(--text-muted);
          margin: 12px 0 6px;
        }

        .login-input-wrap {
          position: relative;
          width: 100%;
        }

        .login-input {
          width: 100%;
          border-radius: 12px;
          border: 1px solid var(--input-border);
          background: var(--input-bg);
          height: 44px;
          padding: 0 14px;
          font-size: 0.95rem;
          color: var(--text-main);
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
        }

        .login-input-password {
          padding-right: 42px;
        }

        .login-input::placeholder {
          color: #f7eedeff;
        }

        .login-input:focus {
          border-color: var(--blue-mid);
          box-shadow: 0 0 0 3px var(--ring);
          background-color: #f9fafb;
        }

        .password-toggle-btn {
          position: absolute;
          top: 50%;
          right: 10px;
          transform: translateY(-50%);
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 1.1rem;
          line-height: 1;
          padding: 0;
          color: var(--text-subtle);
        }

        .password-toggle-btn:hover {
          color: var(--blue-mid);
        }

        .login-btn {
          width: 100%;
          height: 46px;
          border-radius: 999px;
          margin-top: 20px;
          border: none;
          font-size: 0.98rem;
          font-weight: 700;
          color: #9b690bff;
          cursor: pointer;
          background-image: linear-gradient(135deg, var(--blue-deep), var(--blue-primary));
          box-shadow: 0 14px 30px rgba(15, 23, 42, 0.35);
          transition: transform 0.12s ease, box-shadow 0.12s ease, filter 0.12s ease;
        }

        .login-btn:hover {
          filter: brightness(1.05);
          transform: translateY(-1px);
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.45);
        }

        .login-btn:active {
          transform: translateY(0);
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.35);
        }

        .login-actions {
          text-align: center;
          margin-top: 16px;
        }

        .login-link {
          color: var(--blue-primary);
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .login-link:hover {
          color: var(--blue-mid);
        }

        .alert {
          padding: 10px 12px;
          border-radius: 10px;
          margin-bottom: 12px;
          font-size: 0.85rem;
          text-align: center;
        }

        .alert-success {
          background: rgba(22, 163, 74, 0.08);
          color: #166534;
          border: 1px solid rgba(34, 197, 94, 0.35);
        }

        .alert-error {
          background: rgba(248, 113, 113, 0.08);
          color: #b91c1c;
          border: 1px solid rgba(248, 113, 113, 0.5);
        }

       
        @media (max-width: 900px) {
          .login-shell{
            max-width: 640px;
            gap: 18px;
          }

          .login-page{
            padding: 18px;
          }

          .login-hero,
          .login-card-wrap{
            max-width: 640px;
          }

          .login-card{
            max-width: 520px;
          }
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 22px 18px 18px;
          }

          .login-card-title {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
