import React, { useMemo, useState } from "react";
import e6 from "../assets/images/e6.jpg";
import e1 from "../assets/images/e1.jpeg";
import e4 from "../assets/images/e4.jpg";

const HotelHighlights = () => {
  const [active, setActive] = useState("dining");

  const tabs = useMemo(
    () => [
      {
        key: "dining",
        label: "Dining Experience",
        img: e6,
        title: "Dining Experience",
        text:
          "Enjoy refined dining with curated menus, elegant ambiance, and dishes prepared by expert chefs using premium ingredients.",
        bullets: ["Seasonal menus", "Signature dishes", "Elegant setting"],
      },
      {
        key: "services",
        label: "Hotel Services",
        img: e1,
        title: "Hotel Services",
        text:
          "From 24/7 reception and room service to housekeeping and concierge assistance — everything is designed for a seamless stay.",
        bullets: ["24/7 reception", "Room service", "Concierge help"],
      },
      {
        key: "facilities",
        label: "Facilities & Amenities",
        img: e4,
        title: "Facilities & Amenities",
        text:
          "Relax and recharge with comfortable lounges, wellness areas, meeting spaces, and high-speed internet across the hotel.",
        bullets: ["Wellness comfort", "Work-friendly spaces", "Fast Wi-Fi"],
      },
    ],
    []
  );

  const current = tabs.find((t) => t.key === active) || tabs[0];

  return (
    <div style={styles.page}>
      <div style={styles.heroBand}>
        <div style={styles.heroInner}>
          <p style={styles.kicker}>Hotel Mate • Highlights</p>
          <h1 style={styles.title}>
            Moments that feel <span style={styles.gold}>premium</span>
          </h1>
          <p style={styles.sub}>
            Explore the experiences guests love most — designed with comfort and care.
          </p>
        </div>
      </div>

      <main style={styles.wrap}>
        <div style={styles.shell}>
          <div style={styles.tabRow}>
            {tabs.map((t) => {
              const on = t.key === active;
              return (
                <button
                  key={t.key}
                  onClick={() => setActive(t.key)}
                  style={{ ...styles.tab, ...(on ? styles.tabOn : {}) }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <section style={styles.content}>
            <div style={styles.media}>
              <img src={current.img} alt={current.title} style={styles.image} />
              <div style={styles.mediaShade} />
              <div style={styles.cornerBadge}>Hotel Mate</div>
            </div>

            <div style={styles.body}>
              <h2 style={styles.h2}>{current.title}</h2>
              <p style={styles.p}>{current.text}</p>

              <div style={styles.bullets}>
                {current.bullets.map((b) => (
                  <div key={b} style={styles.bullet}>
                    <span style={styles.check}>✓</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>

              <div style={styles.note}>
                <span style={styles.dot} />
                <span>Tip: Your reservation record is always visible in “My Reservations”.</span>
              </div>
            </div>
          </section>
        </div>
      </main>

      <style>{css}</style>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "var(--bg)",
    fontFamily: "Arial, sans-serif",
    color: "var(--text)",
  },
  heroBand: {
    padding: "92px 16px 24px",
    background:
      "radial-gradient(circle at 20% 10%, rgba(201,162,77,0.18), transparent 55%)," +
      "linear-gradient(135deg, rgba(255,250,235,0.96), rgba(247,241,230,0.98))",
    borderBottom: "1px solid var(--border)",
  },
  heroInner: { maxWidth: 1100, margin: "0 auto" },
  kicker: {
    margin: 0,
    fontSize: 11,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    fontWeight: 900,
    color: "var(--gold)",
  },
  title: {
    margin: "10px 0 6px",
    fontSize: 34,
    fontWeight: 900,
    color: "var(--brown)",
  },
  gold: { color: "var(--gold)" },
  sub: {
    margin: 0,
    color: "var(--muted)",
    lineHeight: 1.7,
    fontSize: 14,
    fontWeight: 700,
    maxWidth: 760,
  },

  wrap: { maxWidth: 1100, margin: "0 auto", padding: "18px 16px 44px" },

  shell: {
    borderRadius: 22,
    border: "1px solid var(--border)",
    background:
      "radial-gradient(circle at top, rgba(201,162,77,0.10), transparent 55%)," +
      "linear-gradient(145deg, #ffffff, #fbf6ec)",
    boxShadow: "0 18px 45px rgba(61,42,20,0.14)",
    overflow: "hidden",
  },

  tabRow: {
    display: "flex",
    gap: 10,
    padding: 14,
    flexWrap: "wrap",
    borderBottom: "1px solid rgba(90,58,26,0.12)",
    background: "rgba(255,255,255,0.75)",
    backdropFilter: "blur(10px)",
  },

  tab: {
    border: "1px solid rgba(90,58,26,0.14)",
    background: "#ffffff",
    color: "var(--muted)",
    fontWeight: 900,
    padding: "10px 14px",
    borderRadius: 999,
    cursor: "pointer",
    boxShadow: "0 10px 22px rgba(61,42,20,0.10)",
  },
  tabOn: {
    backgroundImage: "linear-gradient(135deg, var(--brown), var(--gold))",
    color: "#fffdf8",
    borderColor: "rgba(201,162,77,0.28)",
  },

  content: {
    display: "grid",
    gridTemplateColumns: "1.05fr 1fr",
    gap: 0,
  },

  media: { position: "relative", minHeight: 380 },
  image: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  mediaShade: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.35))",
  },
  cornerBadge: {
    position: "absolute",
    left: 14,
    top: 14,
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.16)",
    border: "1px solid rgba(255,255,255,0.30)",
    color: "#fffdf8",
    fontWeight: 900,
    letterSpacing: "0.10em",
    textTransform: "uppercase",
    fontSize: 11,
    backdropFilter: "blur(10px)",
  },

  body: { padding: 18 },
  h2: {
    margin: 0,
    fontSize: 22,
    fontWeight: 900,
    color: "var(--brown)",
  },
  p: {
    margin: "10px 0 0",
    color: "var(--subtle)",
    lineHeight: 1.75,
    fontWeight: 700,
    fontSize: 14,
  },

  bullets: { marginTop: 14, display: "grid", gap: 10 },
  bullet: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 16,
    border: "1px solid rgba(90,58,26,0.12)",
    background: "rgba(255,255,255,0.75)",
    boxShadow: "0 12px 26px rgba(61,42,20,0.10)",
    color: "var(--muted)",
    fontWeight: 900,
  },
  check: {
    width: 24,
    height: 24,
    display: "grid",
    placeItems: "center",
    borderRadius: 999,
    background: "rgba(34,197,94,0.12)",
    border: "1px solid rgba(34,197,94,0.20)",
    color: "rgb(22,101,52)",
    fontWeight: 900,
    flex: "0 0 auto",
  },

  note: {
    marginTop: 14,
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 16,
    border: "1px solid rgba(201,162,77,0.20)",
    background: "rgba(201,162,77,0.10)",
    color: "var(--muted)",
    fontWeight: 900,
    fontSize: 12,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    background: "rgba(34,197,94,1)",
    boxShadow: "0 0 0 6px rgba(34,197,94,0.14)",
    flex: "0 0 auto",
  },
};

const css = `
  :root{
    --gold:#c9a24d;
    --brown:#5a3a1a;
    --text:#3d2a14;
    --muted:#6b5a3c;
    --subtle:#8c7a55;
    --bg:#fbf8f3;
    --border:rgba(90,58,26,0.16);
  }
  @media (max-width: 900px){
    /* stack */
  }
`;

export default HotelHighlights;
