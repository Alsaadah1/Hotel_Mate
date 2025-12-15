// client/src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../Store/usersSlice";
import PublicNavbar from "../components/PublicNavbar";

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
    <>
      <PublicNavbar />

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
                    {showPassword ? "🙈" : "👁"}
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

        {/* INLINE STYLES – Brown & Gold theme (matches Register) */}
        <style>{`
          :root {
            /* Brown & Gold luxury hotel theme */
            --blue-deep: #5a3a1a;
            --blue-primary: #c9a24d;
            --blue-soft: #f7f1e6;
            --blue-mid: #8b6a2f;
            --blue-dark: #e6c87a;

            --bg-page: #fbf8f3;
            --bg-overlay: linear-gradient(
              135deg,
              rgba(255, 250, 235, 0.8),
              rgba(247, 241, 230, 0.95)
            );

            --text-main: #3d2a14;
            --text-muted: #6b5a3c;
            --text-subtle: #8c7a55;

            --card-bg: #ffffff;
            --card-border: rgba(90, 58, 26, 0.18);

            --input-border: rgba(139, 106, 47, 0.35);
            --input-bg: #ffffff;
            --ring: rgba(201, 162, 77, 0.45);
          }

          .login-page {
            position: relative;
            min-height: 100vh;
            display: flex;
            align-items: stretch;
            justify-content: center;

            /* ✅ Navbar is fixed (64px). Push content down. */
            padding: 88px 24px 24px;

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

          .login-shell {
            position: relative;
            z-index: 1;
            width: 100%;
            max-width: 980px;
            display: grid;
            grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
            gap: 32px;
            align-items: stretch;
          }

          /* LEFT HERO */
          .login-hero {
            border-radius: 26px;
            padding: 26px 26px 28px;
            border: 1px solid rgba(90, 58, 26, 0.10);
            background:
              radial-gradient(circle at top left, rgba(201, 162, 77, 0.16), transparent 55%),
              radial-gradient(circle at bottom right, rgba(230, 200, 122, 0.18), transparent 60%),
              linear-gradient(145deg, #ffffff, var(--blue-soft));
            box-shadow: 0 18px 45px rgba(61, 42, 20, 0.18);
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
            color: var(--blue-deep);
          }

          .login-tagline {
            margin: 0 0 12px;
            font-size: 1.05rem;
            font-weight: 600;
            color: var(--blue-mid);
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
            background: rgba(201, 162, 77, 0.10);
            border: 1px solid rgba(139, 106, 47, 0.35);
            color: var(--blue-deep);
          }

          .login-footer-note {
            font-size: 0.8rem;
            color: var(--text-subtle);
            opacity: 0.95;
          }

          /* RIGHT – CARD */
          .login-card-wrap {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .login-card {
            width: 100%;
            max-width: 420px;
            background:
              radial-gradient(circle at top, rgba(201, 162, 77, 0.10), transparent 55%),
              linear-gradient(145deg, #ffffff, #fbf6ec);
            border-radius: 24px;
            padding: 26px 26px 24px;
            border: 1px solid var(--card-border);
            box-shadow: 0 20px 45px rgba(61, 42, 20, 0.22);
            backdrop-filter: blur(10px);
          }

          .login-card-title {
            margin: 0 0 4px;
            font-size: 1.4rem;
            font-weight: 800;
            letter-spacing: 0.03em;
            color: var(--blue-deep);
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
            color: rgba(184, 179, 148, 0.9);
          }

          .login-input:focus {
            border-color: var(--blue-mid);
            box-shadow: 0 0 0 3px var(--ring);
            background-color: #fffdf8;
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
            color: #f9fafb;
            cursor: pointer;
            background-image: linear-gradient(135deg, var(--blue-deep), var(--blue-primary));
            box-shadow: 0 14px 30px rgba(61, 42, 20, 0.35);
            transition: transform 0.12s ease, box-shadow 0.12s ease, filter 0.12s ease;
          }

          .login-btn:hover {
            filter: brightness(1.05);
            transform: translateY(-1px);
            box-shadow: 0 18px 40px rgba(61, 42, 20, 0.45);
          }

          .login-btn:active {
            transform: translateY(0);
            box-shadow: 0 8px 18px rgba(61, 42, 20, 0.35);
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

          /* Responsive */
          @media (max-width: 900px) {
            .login-shell {
              grid-template-columns: minmax(0, 1fr);
              max-width: 640px;
            }

            .login-hero {
              display: none;
            }

            .login-page {
              padding: 82px 18px 18px;
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
    </>
  );
};

export default Login;
