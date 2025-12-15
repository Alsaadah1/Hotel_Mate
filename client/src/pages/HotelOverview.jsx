import React, { useMemo } from "react";
import h7 from "../assets/images/h7.jpg";
import e3 from "../assets/images/e3.jpg";
import e2 from "../assets/images/e2.jpg";
import rr3 from "../assets/images/rr3.jpg";
import d3 from "../assets/images/d3.jpg";
import h3 from "../assets/images/h3.jpg";

const HotelOverview = () => {
  const items = useMemo(
    () => [
      {
        img: h7,
        title: "Luxury Rooms & Suites",
        text: "Thoughtfully designed rooms offering comfort, style, and modern amenities.",
        tag: "Comfort",
      },
      {
        img: e3,
        title: "Fine Dining",
        text: "Exceptional dining experiences crafted by professional chefs.",
        tag: "Dining",
      },
      {
        img: e2,
        title: "Modern Facilities",
        text: "High-speed Wi-Fi, workspaces, and facilities for business and leisure.",
        tag: "Facilities",
      },
      {
        img: d3,
        title: "Prime Location",
        text: "Close to major attractions, shopping areas, and transport hubs.",
        tag: "Location",
      },
      {
        img: h3,
        title: "Premium Services",
        text: "24/7 reception, room service, housekeeping, and concierge support.",
        tag: "Service",
      },
      {
        img: rr3,
        title: "Relax & Unwind",
        text: "Peaceful spaces designed to help you relax and recharge.",
        tag: "Wellness",
      },
    ],
    []
  );

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <p style={styles.kicker}>Hotel Mate • Overview</p>
          <h1 style={styles.title}>
            Why choose <span style={styles.gold}>Hotel Mate</span>
          </h1>
          <p style={styles.sub}>
            A refined stay designed for comfort, convenience, and elegance — curated details,
            premium service, and a warm welcome.
          </p>

          <div style={styles.quickRow}>
            <div style={styles.quick}>
              <div style={styles.quickVal}>24/7</div>
              <div style={styles.quickLab}>Reception</div>
            </div>
            <div style={styles.quick}>
              <div style={styles.quickVal}>4.8/5</div>
              <div style={styles.quickLab}>Guest rating</div>
            </div>
            <div style={styles.quick}>
              <div style={styles.quickVal}>80+</div>
              <div style={styles.quickLab}>Rooms</div>
            </div>
          </div>
        </div>
      </header>

      <main style={styles.wrap}>
        <section style={styles.grid}>
          {items.map((it, idx) => (
            <article key={idx} style={styles.card}>
              <div style={styles.media}>
                <img src={it.img} alt={it.title} style={styles.img} />
                <div style={styles.mediaShade} />
                <span style={styles.tag}>{it.tag}</span>
              </div>
              <div style={styles.body}>
                <h2 style={styles.h2}>{it.title}</h2>
                <p style={styles.p}>{it.text}</p>
              </div>
            </article>
          ))}
        </section>
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

  header: {
    padding: "92px 16px 26px",
    background:
      "radial-gradient(circle at 20% 10%, rgba(201,162,77,0.18), transparent 55%)," +
      "linear-gradient(135deg, rgba(255,250,235,0.96), rgba(247,241,230,0.98))",
    borderBottom: "1px solid var(--border)",
  },
  headerInner: { maxWidth: 1200, margin: "0 auto" },
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
    maxWidth: 820,
    color: "var(--muted)",
    lineHeight: 1.7,
    fontWeight: 700,
    fontSize: 14,
  },

  quickRow: {
    marginTop: 16,
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  quick: {
    padding: "10px 12px",
    borderRadius: 16,
    background: "rgba(255,255,255,0.75)",
    border: "1px solid rgba(90,58,26,0.14)",
    boxShadow: "0 10px 22px rgba(61,42,20,0.10)",
    minWidth: 120,
  },
  quickVal: {
    fontWeight: 900,
    color: "var(--brown)",
    fontSize: 16,
  },
  quickLab: {
    marginTop: 2,
    fontWeight: 900,
    color: "var(--muted)",
    fontSize: 12,
  },

  wrap: { maxWidth: 1200, margin: "0 auto", padding: "18px 16px 44px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 14,
  },

  card: {
    borderRadius: 22,
    overflow: "hidden",
    border: "1px solid var(--border)",
    background:
      "radial-gradient(circle at top, rgba(201,162,77,0.10), transparent 55%)," +
      "linear-gradient(145deg, #ffffff, #fbf6ec)",
    boxShadow: "0 16px 40px rgba(61,42,20,0.12)",
    transition: "transform 0.14s ease, box-shadow 0.14s ease",
  },

  media: { position: "relative", height: 200 },
  img: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  mediaShade: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.35))",
  },
  tag: {
    position: "absolute",
    left: 14,
    top: 14,
    padding: "7px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.16)",
    border: "1px solid rgba(255,255,255,0.30)",
    color: "#fffdf8",
    fontWeight: 900,
    letterSpacing: "0.10em",
    textTransform: "uppercase",
    fontSize: 10,
    backdropFilter: "blur(10px)",
  },

  body: { padding: 16 },
  h2: { margin: 0, fontSize: 16, fontWeight: 900, color: "var(--brown)" },
  p: {
    margin: "8px 0 0",
    fontSize: 13,
    lineHeight: 1.65,
    color: "var(--subtle)",
    fontWeight: 700,
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
`;

export default HotelOverview;
