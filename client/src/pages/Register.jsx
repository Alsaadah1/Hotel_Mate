import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("customer"); // Hotel Mate: this stays "customer"
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [errors, setErrors] = useState({}); // 👈 field-level errors

  const API_URL = process.env.REACT_APP_SERVER_URL;

  const handleRegister = async (e) => {
    e.preventDefault();

    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    const newErrors = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Name validation
    if (!name.trim()) {
      newErrors.name = "Full name is required.";
    } else if (name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters.";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    } else if (!specialCharRegex.test(password)) {
      newErrors.password =
        "Password must contain at least one special character (!,@,#,$,%,^,* etc).";
    }

    // Confirm password
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (password && password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords did not match.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setMessageType("error");
      setMessage("Please correct the highlighted fields.");
      return;
    }

    // Clear previous field errors
    setErrors({});
    setMessage("");
    setMessageType("");

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          role, // stays "customer"
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessageType("success");
        setMessage(data.message || "Account created successfully!");
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setRole("customer");

        setTimeout(() => {
          navigate("/");
        }, 1200);
      } else {
        setMessageType("error");
        setMessage(data.message || "Error registering user.");
      }
    } catch (err) {
      console.error(err);
      setMessageType("error");
      setMessage("Error registering user. Please try again.");
    }
  };

  return (
    <div className="register-page">
      <div className="register-overlay" />

      <main className="register-shell">
        {/* LEFT PANEL – brand & messaging */}
        <section className="register-hero">
          <div className="register-hero-inner">
            <h1 className="register-brand">Hotel Mate</h1>
            <p className="register-tagline">Your key to seamless stays.</p>
            <p className="register-description">
              Create a guest account to book rooms, track upcoming stays, and
              keep all your reservations in one elegant place.
            </p>

            <div className="register-highlights">
              <div className="highlight-pill">✓ Guest-friendly booking</div>
              <div className="highlight-pill">✓ Instant reservation history</div>
              <div className="highlight-pill">✓ Simple sign-in next time</div>
            </div>

            <div className="register-footer-note">
              Already registered as a manager? Use the same login screen to
              access your tools.
            </div>
          </div>
        </section>

        {/* RIGHT PANEL – sign up card */}
        <section className="register-card-wrap">
          <div
            className="register-card"
            role="main"
            aria-labelledby="register-title"
          >
            <h2 id="register-title" className="register-card-title">
              Create your guest account
            </h2>
            <p className="register-card-subtitle">
              Sign up to start booking your next stay with Hotel Mate.
            </p>

            {message && (
              <div
                className={`register-alert ${
                  messageType === "error"
                    ? "register-alert-error"
                    : "register-alert-success"
                }`}
                role="alert"
              >
                {messageType === "error" ? "❌ " : "✅ "}
                {message}
              </div>
            )}

            <form onSubmit={handleRegister} noValidate>
              {/* Email */}
              <label className="register-label" htmlFor="email">
                Email
              </label>
              <input
                className={
                  "register-input" + (errors.email ? " has-error" : "")
                }
                id="email"
                name="email"
                type="email"
                placeholder="guest@example.com"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="field-error-text">{errors.email}</p>
              )}

              {/* Name */}
              <label className="register-label" htmlFor="name">
                Full Name
              </label>
              <input
                className={
                  "register-input" + (errors.name ? " has-error" : "")
                }
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="field-error-text">{errors.name}</p>
              )}

              {/* Password */}
              <label className="register-label" htmlFor="password">
                Password
              </label>
              <div className="register-input-wrap">
                <input
                  className={
                    "register-input register-input-password" +
                    (errors.password ? " has-error" : "")
                  }
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  minLength={6}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!errors.password}
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
              {errors.password && (
                <p className="field-error-text">{errors.password}</p>
              )}

              {/* Confirm Password */}
              <label className="register-label" htmlFor="confirm">
                Confirm Password
              </label>
              <div className="register-input-wrap">
                <input
                  className={
                    "register-input register-input-password" +
                    (errors.confirmPassword ? " has-error" : "")
                  }
                  id="confirm"
                  name="confirm"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  minLength={6}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  aria-invalid={!!errors.confirmPassword}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() =>
                    setShowConfirmPassword((prev) => !prev)
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? "🙈" : "👁"}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="field-error-text">{errors.confirmPassword}</p>
              )}

              <button className="register-btn" type="submit">
                Create Account
              </button>

              <div className="register-actions">
                <span className="register-hint">
                  Already have an account?{" "}
                  <span
                    className="register-link"
                    onClick={() => navigate("/")}
                  >
                    Login
                  </span>
                </span>
              </div>
            </form>
          </div>
        </section>
      </main>

      {/* Scoped CSS – blue & white to match new Login theme + BG.JPG */}
      <style>{`
        :root {
          /* Blue hotel theme */
          --blue-deep: #0a3d91;
          --blue-primary: #1e5fe0;
          --blue-soft: #e8f1ff;
          --blue-mid: #2563eb;
          --blue-dark: #102a43;

          --bg-page: #f3f6fb;
          --bg-overlay: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.75),
            rgba(232, 241, 255, 0.9)
          );

          --text-main: #0b1a33;
          --text-muted: #4b5563;
          --text-subtle: #6b7280;

          --card-bg: #ffffff;
          --card-border: rgba(15, 23, 42, 0.06);

          --input-border: rgba(15, 23, 42, 0.18);
          --input-bg: #ffffff;
          --ring: rgba(37, 99, 235, 0.35);
        }

        .register-page {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: stretch;
          justify-content: center;
          padding: 24px;
          color: var(--text-main);

          /* 🔹 Use BG.JPG from public folder */
          background-image: url("/BG.JPG");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        .register-overlay {
          position: fixed;
          inset: 0;
          background: var(--bg-overlay);
          pointer-events: none;
          z-index: 0;
        }

        .register-shell {
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
        .register-hero {
          border-radius: 26px;
          padding: 26px 26px 28px;
          border: 1px solid rgba(15, 23, 42, 0.06);
          background:
            radial-gradient(circle at top left, rgba(37, 99, 235, 0.15), transparent 55%),
            radial-gradient(circle at bottom right, rgba(56, 189, 248, 0.18), transparent 60%),
            linear-gradient(145deg, #ffffff, #e8f1ff);
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.12);
          display: flex;
        }

        .register-hero-inner {
          margin: auto 0;
        }

        .register-brand {
          font-size: 2rem;
          font-weight: 900;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          margin: 0 0 10px;
          color: var(--blue-deep);
        }

        .register-tagline {
          margin: 0 0 12px;
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--blue-dark);
        }

        .register-description {
          margin: 0 0 18px;
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--text-subtle);
        }

        .register-highlights {
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
          background: rgba(37, 99, 235, 0.06);
          border: 1px solid rgba(37, 99, 235, 0.4);
          color: var(--blue-deep);
        }

        .register-footer-note {
          font-size: 0.8rem;
          color: var(--text-subtle);
          opacity: 0.95;
        }

        /* RIGHT – CARD */
        .register-card-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .register-card {
          width: 100%;
          max-width: 420px;
          background:
            radial-gradient(circle at top, rgba(59, 130, 246, 0.10), transparent 55%),
            linear-gradient(145deg, #ffffff, #f5f7ff);
          border-radius: 24px;
          padding: 26px 26px 24px;
          border: 1px solid var(--card-border);
          box-shadow: 0 20px 45px rgba(15, 23, 42, 0.16);
          backdrop-filter: blur(10px);
        }

        .register-card-title {
          margin: 0 0 4px;
          font-size: 1.4rem;
          font-weight: 800;
          letter-spacing: 0.03em;
          color: var(--blue-dark);
        }

        .register-card-subtitle {
          margin: 0 0 16px;
          font-size: 0.9rem;
          color: var(--text-subtle);
        }

        .register-label {
          display: block;
          font-size: 0.85rem;
          color: var(--text-muted);
          margin: 12px 0 6px;
        }

        .register-input-wrap {
          position: relative;
          width: 100%;
        }

        .register-input {
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

        .register-input-password {
          padding-right: 42px; /* space for eye button */
        }

        .register-input::placeholder {
          color: rgba(148, 163, 184, 0.9);
        }

        .register-input:focus {
          border-color: var(--blue-mid);
          box-shadow: 0 0 0 3px var(--ring);
          background-color: #f9fafb;
        }

        .register-input.has-error {
          border-color: rgba(248, 113, 113, 0.9);
          box-shadow: 0 0 0 1px rgba(248, 113, 113, 0.5);
        }

        .field-error-text {
          margin: 4px 0 0;
          font-size: 0.78rem;
          color: #b91c1c;
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

        .register-btn {
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
          box-shadow: 0 14px 30px rgba(15, 23, 42, 0.35);
          transition: transform 0.12s ease, box-shadow 0.12s ease, filter 0.12s ease;
        }

        .register-btn:hover {
          filter: brightness(1.05);
          transform: translateY(-1px);
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.45);
        }

        .register-btn:active {
          transform: translateY(0);
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.35);
        }

        .register-actions {
          text-align: center;
          margin-top: 16px;
        }

        .register-hint {
          font-size: 0.85rem;
          color: var(--text-subtle);
        }

        .register-link {
          color: var(--blue-primary);
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .register-link:hover {
          color: var(--blue-mid);
        }

        .register-alert {
          padding: 10px 12px;
          border-radius: 10px;
          margin-bottom: 12px;
          font-size: 0.85rem;
          text-align: center;
        }

        .register-alert-success {
          background: rgba(22, 163, 74, 0.08);
          color: #166534;
          border: 1px solid rgba(34, 197, 94, 0.35);
        }

        .register-alert-error {
          background: rgba(248, 113, 113, 0.08);
          color: #b91c1c;
          border: 1px solid rgba(248, 113, 113, 0.5);
        }

        /* Responsive */
        @media (max-width: 900px) {
          .register-shell {
            grid-template-columns: minmax(0, 1fr);
            max-width: 640px;
          }

          .register-hero {
            display: none;
          }

          .register-page {
            padding: 18px;
          }
        }

        @media (max-width: 480px) {
          .register-card {
            padding: 22px 18px 18px;
          }

          .register-card-title {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Register;
