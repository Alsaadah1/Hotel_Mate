import React, { useMemo } from "react";
import b from "../assets/images/b.webp";
import e from "../assets/images/eee.jpg";
import f from "../assets/images/f.jpg";
import o from "../assets/images/o.jpg";

const HotelInclusions = () => {
  const items = useMemo(
    () => [
      {
        img: b,
        title: "Complimentary Beverages",
        text:
          "Enjoy complimentary beverages including coffee, tea, juice, and bottled water throughout your stay.",
        tag: "Included",
      },
      {
        img: f,
        title: "Food & Dining",
        text:
          "Savor meals and snacks at our cafes, restaurants, and buffet areas — included with your booking.",
        tag: "Dining",
      },
      {
        img: e,
        title: "Entertainment & Activities",
        text:
          "Access hotel entertainment, live music, and engaging activities designed for all guests.",
        tag: "Fun",
      },
      {
        img: o,
        title: "Premium Amenities",
        text:
          "Relax with wellness facilities, lounges, swimming pool, fitness center, and more included experiences.",
        tag: "Premium",
      },
    ],
    []
  );

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <p style={styles.kicker}>Hotel Mate • Inclusions</p>
          <h1 style={styles.title}>
            What’s <span style={styles.gold}>included</span> with your stay
          </h1>
          <p style={styles.sub}>
            A comfortable stay should feel generous — here’s what you get with every booking.
          </p>
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
  },
  media: { position: "relative", height: 190 },
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

export default HotelInclusions;
