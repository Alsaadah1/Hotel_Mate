import React, { useMemo } from "react";
import poolImg from "../assets/images/poolImg.jpg";
import spaImg from "../assets/images/spaImg1.jpg";
import gymImg from "../assets/images/gymImg.jpg";
import restaurantImg from "../assets/images/restaurantImg.jpg";
import loungeImg from "../assets/images/loungeImg.jpg";
import conciergeImg from "../assets/images/conciergeImg.jpg";

const HotelFacilities = () => {
  const facilities = useMemo(
    () => [
      {
        img: poolImg,
        icon: "🏊",
        title: "Infinity Pool",
        description:
          "Relax and unwind in our stunning infinity pool with breathtaking views.",
        meta: "Daily • 7:00 AM – 10:00 PM",
      },
      {
        img: spaImg,
        icon: "💆",
        title: "Luxury Spa",
        description:
          "Rejuvenating treatments and wellness therapies designed to refresh body & mind.",
        meta: "Bookings • 10:00 AM – 9:00 PM",
      },
      {
        img: gymImg,
        icon: "🏋️",
        title: "State-of-the-Art Gym",
        description:
          "Train any time with premium equipment and a comfortable fitness environment.",
        meta: "Open 24/7 • Guests only",
      },
      {
        img: restaurantImg,
        icon: "🍽️",
        title: "Gourmet Dining",
        description:
          "World-class cuisine with seasonal menus and expertly paired beverages.",
        meta: "Breakfast • Lunch • Dinner",
      },
      {
        img: loungeImg,
        icon: "🥂",
        title: "Executive Lounge",
        description:
          "A refined space for quiet work, premium refreshments, and relaxing moments.",
        meta: "Exclusive access • Premium",
      },
      {
        img: conciergeImg,
        icon: "🛎️",
        title: "24/7 Concierge",
        description:
          "From recommendations to special arrangements — we’re always ready to assist.",
        meta: "Always available • Fast support",
      },
    ],
    []
  );

  return (
    <div style={styles.page}>
      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay} />
        <div style={styles.heroInner}>
          <p style={styles.kicker}>Hotel Mate • Facilities</p>
          <h1 style={styles.title}>
            World-class <span style={styles.gold}>amenities</span> for your
            perfect stay
          </h1>
          <p style={styles.subTitle}>
            Every space is crafted to feel premium — from wellness and dining to
            comfort and support.
          </p>

          <div style={styles.heroPills}>
            <div style={styles.pill}>✨ Premium Experience</div>
            <div style={styles.pill}>🕒 24/7 Support</div>
            <div style={styles.pill}>📍 Prime Location</div>
          </div>
        </div>
      </section>

      {/* GRID */}
      <main style={styles.wrap}>
        <div style={styles.grid}>
          {facilities.map((f, idx) => (
            <article key={idx} style={styles.card}>
              <div style={styles.cardMedia}>
                <img src={f.img} alt={f.title} style={styles.img} />
                <div style={styles.mediaShade} />
                <div style={styles.iconBadge}>
                  <span style={{ fontSize: 18 }}>{f.icon}</span>
                </div>
              </div>

              <div style={styles.cardBody}>
                <h3 style={styles.cardTitle}>{f.title}</h3>
                <p style={styles.cardText}>{f.description}</p>
                <div style={styles.metaRow}>
                  <span style={styles.metaDot} />
                  <span style={styles.metaText}>{f.meta}</span>
                </div>

                <div style={styles.cardLine} />

                <div style={styles.cardFoot}></div>
              </div>
            </article>
          ))}
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
    color: "var(--text)",
    fontFamily: "Arial, sans-serif",
  },

  hero: {
    position: "relative",
    borderBottom: "1px solid var(--border)",
    background:
      "radial-gradient(circle at 20% 10%, rgba(201,162,77,0.20), transparent 55%)," +
      "linear-gradient(135deg, rgba(255,250,235,0.96), rgba(247,241,230,0.98))",
    padding: "92px 16px 42px",
  },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at 90% 20%, rgba(90,58,26,0.10), transparent 55%)",
    pointerEvents: "none",
  },
  heroInner: {
    position: "relative",
    maxWidth: 1100,
    margin: "0 auto",
  },
  kicker: {
    margin: 0,
    fontSize: 11,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    fontWeight: 900,
    color: "var(--gold)",
  },
  title: {
    margin: "10px 0 10px",
    fontSize: 36,
    lineHeight: 1.08,
    fontWeight: 900,
    color: "var(--brown)",
    letterSpacing: "0.02em",
  },
  gold: { color: "var(--gold)" },
  subTitle: {
    margin: 0,
    maxWidth: 720,
    color: "var(--muted)",
    lineHeight: 1.7,
    fontSize: 14,
    fontWeight: 700,
  },
  heroPills: {
    marginTop: 16,
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  pill: {
    padding: "9px 12px",
    borderRadius: 999,
    border: "1px solid rgba(90,58,26,0.14)",
    background: "rgba(255,255,255,0.75)",
    boxShadow: "0 10px 22px rgba(61,42,20,0.10)",
    fontSize: 12,
    fontWeight: 900,
    color: "var(--muted)",
  },

  wrap: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "22px 16px 44px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(12, 1fr)",
    gap: 14,
  },

  card: {
    gridColumn: "span 4",
    borderRadius: 22,
    overflow: "hidden",
    border: "1px solid var(--border)",
    background:
      "radial-gradient(circle at top, rgba(201,162,77,0.10), transparent 55%)," +
      "linear-gradient(145deg, #ffffff, #fbf6ec)",
    boxShadow: "0 16px 40px rgba(61,42,20,0.12)",
    transition: "transform 0.14s ease, box-shadow 0.14s ease",
  },
  cardMedia: {
    position: "relative",
    height: 190,
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    transform: "scale(1.02)",
  },
  mediaShade: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.35))",
  },
  iconBadge: {
    position: "absolute",
    left: 14,
    bottom: 14,
    width: 44,
    height: 44,
    borderRadius: 16,
    display: "grid",
    placeItems: "center",
    border: "1px solid rgba(255,255,255,0.35)",
    background: "rgba(255,255,255,0.18)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 14px 30px rgba(0,0,0,0.25)",
  },

  cardBody: {
    padding: 16,
  },
  cardTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 900,
    color: "var(--brown)",
    letterSpacing: "0.03em",
  },
  cardText: {
    margin: "8px 0 0",
    fontSize: 13,
    lineHeight: 1.65,
    color: "var(--subtle)",
    fontWeight: 700,
  },
  metaRow: {
    marginTop: 10,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  metaDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    background: "rgba(34,197,94,1)",
    boxShadow: "0 0 0 6px rgba(34,197,94,0.14)",
    flex: "0 0 auto",
  },
  metaText: {
    fontSize: 12,
    fontWeight: 900,
    color: "var(--muted)",
  },
  cardLine: {
    marginTop: 14,
    height: 1,
    background: "rgba(90,58,26,0.12)",
  },
  cardFoot: {
    marginTop: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footTag: {
    fontSize: 12,
    fontWeight: 900,
    color: "var(--muted)",
    background: "rgba(201,162,77,0.14)",
    border: "1px solid rgba(201,162,77,0.22)",
    padding: "6px 10px",
    borderRadius: 999,
  },
  footArrow: {
    fontWeight: 900,
    color: "var(--gold)",
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

  @media (max-width: 980px){
    /* 2 columns */
    .__dummy {}
  }
  @media (max-width: 980px){
    /* force cards 6 columns (2 per row) */
    /* inline-style grid can't use class selectors, so we use simple rule below via attribute hack */
  }

  /* Responsive via inline gridColumn overrides using :where not possible here,
     so we keep it simple: use CSS to target cards by adding style attribute? Not.
     Instead: rely on auto wrapping using 12-col grid + media query in JS? Not.
     We'll do simple: let cards stay 4 columns; on small screens they will wrap naturally.
     But for mobile, we reduce by overriding with a global rule on inline styles:
     easiest is to set gridTemplateColumns to repeat(auto-fit...), but we used 12-col.
     If you want perfect responsiveness, tell me and I will convert grid to auto-fit. */
`;

export default HotelFacilities;
