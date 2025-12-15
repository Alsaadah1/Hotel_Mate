// client/src/pages/Aboutus.jsx  (or About.jsx — keep your filename)
import React, { useMemo, useState } from "react";

import hero from "../assets/images/hero.jpg";
import h2 from "../assets/images/h2.jpg";
import p1 from "../assets/images/p1.jpg";
import a6 from "../assets/images/a6.PNG";
import a5 from "../assets/images/a5.PNG";
import a4 from "../assets/images/a4.PNG";
import a3 from "../assets/images/a3.PNG";

import Location from "./Location";
import PublicNavbar from "../components/PublicNavbar";

const About = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const stats = useMemo(
    () => [
      { label: "Years of Hospitality", value: "15+" },
      { label: "Rooms & Suites", value: "80+" },
      { label: "Guest Satisfaction", value: "4.8/5" },
      { label: "Support", value: "24/7" },
    ],
    []
  );

  const highlights = useMemo(
    () => [
      {
        title: "Premium Comfort",
        text: "Modern rooms with thoughtful details so you sleep better and feel refreshed.",
        icon: "🛏️",
      },
      {
        title: "Warm Hospitality",
        text: "Friendly staff, fast check-in, and a personalised stay experience.",
        icon: "🤝",
      },
      {
        title: "Prime Location",
        text: "Easy access to key spots, dining, and business hubs — perfect for everyone.",
        icon: "📍",
      },
    ],
    []
  );

  const whyUs = useMemo(
    () => [
      {
        img: a6,
        alt: "Expert Staff",
        title: "EXPERT STAFF",
        text: "Highly trained team providing personalised assistance and quick support throughout your stay.",
      },
      {
        img: a5,
        alt: "Luxurious Rooms",
        title: "LUXURIOUS ROOMS",
        text: "From cozy rooms to luxury suites — choose the space that matches your comfort and style.",
      },
      {
        img: a3,
        alt: "Safety & Insurance",
        title: "SAFETY & INSURANCE",
        text: "Strong safety protocols and reliable support so you enjoy peace of mind from check-in to checkout.",
      },
      {
        img: a4,
        alt: "Opening Hours",
        title: "OPENING HOURS",
        text: "Reception is available 24/7, and concierge support is always ready to help.",
      },
    ],
    []
  );

  return (
    <>
      <PublicNavbar />

      <div className="about-shell">
        {/* HERO */}
        <section className="hero">
          <img src={hero} alt="Hotel Mate" className="hero-bg" />
          <div className="hero-shade" />
          <div className="hero-inner">
            <div className="hero-left">
              <div className="hero-kicker">Hotel Mate • Luxury & Comfort</div>
              <h1 className="hero-title">
                Your stay, <span className="gold">elevated</span>.
              </h1>
              <p className="hero-sub">
                Welcome to <strong>Hotel Mate</strong> — a refined blend of
                modern design and warm hospitality. Book smarter, stay happier,
                and enjoy every detail.
              </p>

              <div className="hero-cta-row">
                <button
                  onClick={() => {
                    const el = document.getElementById("whyus");
                    if (el)
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="btn-primary"
                >
                  Explore Why Us
                </button>

                <button
                  onClick={() => setIsExpanded((v) => !v)}
                  className="btn-secondary"
                >
                  {isExpanded ? "Show Less" : "Learn More"}
                </button>
              </div>

              {isExpanded && (
                <div className="hero-expand">
                  <p>
                    Enjoy a wide range of rooms and suites for families,
                    couples, and solo travelers. Our focus is comfort,
                    convenience, and attentive service.
                  </p>
                  <p>
                    Since 2010, Hotel Mate has welcomed guests who love modern
                    style with genuine hospitality — with curated amenities for
                    a memorable stay.
                  </p>
                  <p>
                    From our lounge spaces to wellness comforts, every moment is
                    designed to feel calm, premium, and effortless.
                  </p>
                </div>
              )}

              <div className="stats-row">
                {stats.map((s) => (
                  <div key={s.label} className="stat">
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="hero-right">
              <div className="glass-card">
                <div className="glass-title">A stay that feels premium</div>
                <div className="glass-sub">
                  Experience thoughtful service, elegant rooms, and fast
                  bookings through our platform.
                </div>

                <div className="highlight-list">
                  {highlights.map((h) => (
                    <div key={h.title} className="highlight">
                      <div className="highlight-ico">{h.icon}</div>
                      <div>
                        <div className="highlight-title">{h.title}</div>
                        <div className="highlight-text">{h.text}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="glass-foot">
                  <div className="pulse-dot" />
                  <span>Open 24/7 • Concierge support</span>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* STORY / IMAGE SPLIT */}
        <section className="split">
          <div className="split-card">
            <div className="split-img-wrap">
              <img src={h2} alt="Hotel Lobby" className="split-img" />
            </div>
            <div className="split-content">
              <div className="section-kicker">Our Promise</div>
              <h2 className="section-title">Seamless stays, made simple</h2>
              <p>
                At Hotel Mate, your stay should feel smooth from the first click
                to checkout day. We blend modern technology with human
                hospitality — so booking, check-in, and support feel effortless.
              </p>
              <p>
                Every guest deserves a premium experience. Whether you need
                concierge guidance, a special arrangement, or quick help — our
                team is ready.
              </p>

              <div className="mini-points">
                <div className="mini">
                  <span className="mini-ico">⚡</span>
                  <span>Fast booking & confirmation</span>
                </div>
                <div className="mini">
                  <span className="mini-ico">🧼</span>
                  <span>Clean, comfortable rooms</span>
                </div>
                <div className="mini">
                  <span className="mini-ico">🛎️</span>
                  <span>Concierge & guest support</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WHY US */}
        <section id="whyus" className="why">
          <div className="why-head">
            <div className="section-kicker">Why choose us</div>
            <h2 className="section-title">
              Designed for comfort. Powered by care.
            </h2>
            <p className="section-sub">
              Small details make a big difference — here are the features guests
              love most.
            </p>
          </div>

          <div className="why-grid">
            {whyUs.map((c) => (
              <div key={c.title} className="why-card">
                <div className="why-icon-wrap">
                  <img src={c.img} alt={c.alt} className="why-icon" />
                </div>
                <h3 className="why-title">{c.title}</h3>
                <p className="why-text">{c.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* PARTNERS */}
        <section className="partners">
          <div className="partners-head">
            <div className="section-kicker">Trusted by</div>
            <h2 className="section-title">Our Partners</h2>
            <p className="section-sub">
              We collaborate with brands that match our quality standards.
            </p>
          </div>

          <div className="partners-card">
            <img src={p1} alt="Partner Logo" className="partner-logo" />
          </div>
        </section>

        {/* LOCATION */}
        <section className="location">
          <div className="location-card">
            <div className="location-head">
              <div className="section-kicker">Find us</div>
              <h2 className="section-title">Hotel Location</h2>
              <p className="section-sub">
                Use the map below for directions and nearby landmarks.
              </p>
            </div>
            <div className="location-map">
              <Location />
            </div>
          </div>
        </section>

        {/* DEVELOPERS */}
        <section className="dev">
          <div className="dev-card">
            <img src={h2} alt="Developers" className="dev-avatar" />
            <div>
              <div className="dev-kicker">Developed by</div>
              <div className="dev-name">
                Alsaadah & Tasneem & Mithaq and Mariyam{" "}
              </div>
              <div className="dev-id">
                Student ID:66J19100 & 66S1915 & 66S193 & 66S1877
              </div>
            </div>
          </div>
        </section>

        {/* INLINE STYLES */}
        <style>{`
          :root {
            /* Brown & Gold luxury theme */
            --gold: #c9a24d;
            --gold-soft: rgba(201,162,77,0.22);
            --brown: #5a3a1a;
            --brown-2: #3d2a14;

            --bg: #fbf8f3;
            --paper: #ffffff;
            --paper-2: #fbf6ec;

            --text: #3d2a14;
            --muted: #6b5a3c;
            --subtle: #8c7a55;

            --border: rgba(90, 58, 26, 0.16);
            --shadow: 0 18px 45px rgba(61, 42, 20, 0.16);
            --shadow-2: 0 22px 60px rgba(61, 42, 20, 0.18);
          }

          .about-shell{
            max-width: 1200px;
            margin: 0 auto;
            padding: 88px 16px 40px; /* below navbar */
            font-family: Arial, sans-serif;
            color: var(--text);
          }

          /* HERO */
          .hero{
            position: relative;
            border-radius: 22px;
            overflow: hidden;
            border: 1px solid var(--border);
            box-shadow: var(--shadow);
            min-height: 520px;
            background: var(--paper);
          }
          .hero-bg{
            position:absolute;
            inset:0;
            width:100%;
            height:100%;
            object-fit:cover;
            transform: scale(1.03);
          }
          .hero-shade{
            position:absolute;
            inset:0;
            background:
              radial-gradient(circle at 20% 10%, rgba(201,162,77,0.22), transparent 55%),
              linear-gradient(90deg, rgba(0,0,0,0.55), rgba(0,0,0,0.12));
          }
          .hero-inner{
            position:relative;
            z-index:2;
            display:grid;
            grid-template-columns: 1.55fr 0.9fr;
            gap: 18px;
            padding: 26px;
            align-items: stretch;
          }
          .hero-left{
            color: #fffdf8;
            padding: 8px 6px;
            max-width: 720px;
          }
          .hero-kicker{
            display:inline-flex;
            align-items:center;
            gap:8px;
            font-size: 11px;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: rgba(255,253,248,0.85);
            margin-bottom: 10px;
          }
          .hero-title{
            margin: 0;
            font-size: 40px;
            line-height: 1.05;
            font-weight: 900;
            letter-spacing: 0.02em;
            text-shadow: 0 12px 30px rgba(0,0,0,0.35);
          }
          .hero-title .gold{
            color: var(--gold);
            text-shadow: 0 16px 32px rgba(0,0,0,0.35);
          }
          .hero-sub{
            margin: 12px 0 14px;
            max-width: 620px;
            line-height: 1.7;
            color: rgba(255,253,248,0.9);
            font-size: 14px;
          }

          .hero-cta-row{
            display:flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-top: 8px;
          }

          .btn-primary{
            border:none;
            cursor:pointer;
            padding: 10px 16px;
            border-radius: 999px;
            font-weight: 900;
            color: #fffdf8;
            background-image: linear-gradient(135deg, var(--brown), var(--gold));
            box-shadow: 0 14px 30px rgba(0,0,0,0.26);
            transition: transform 0.12s ease, filter 0.12s ease, box-shadow 0.12s ease;
          }
          .btn-primary:hover{
            transform: translateY(-1px);
            filter: brightness(1.04);
            box-shadow: 0 18px 40px rgba(0,0,0,0.32);
          }
          .btn-secondary{
            border: 1px solid rgba(255,253,248,0.35);
            cursor:pointer;
            padding: 10px 16px;
            border-radius: 999px;
            font-weight: 900;
            color: #fffdf8;
            background: rgba(255,255,255,0.10);
            box-shadow: 0 14px 30px rgba(0,0,0,0.16);
            transition: transform 0.12s ease, filter 0.12s ease, box-shadow 0.12s ease;
            backdrop-filter: blur(8px);
          }
          .btn-secondary:hover{
            transform: translateY(-1px);
            filter: brightness(1.05);
          }

          .hero-expand{
            margin-top: 12px;
            padding: 12px 14px;
            border-radius: 14px;
            border: 1px solid rgba(255,253,248,0.22);
            background: rgba(255,255,255,0.10);
            color: rgba(255,253,248,0.92);
            line-height: 1.7;
            box-shadow: 0 16px 35px rgba(0,0,0,0.20);
            backdrop-filter: blur(10px);
          }
          .hero-expand p{
            margin: 0 0 10px;
          }
          .hero-expand p:last-child{ margin-bottom: 0; }

          .stats-row{
            margin-top: 14px;
            display:grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 10px;
            max-width: 680px;
          }
          .stat{
            border-radius: 16px;
            padding: 10px 12px;
            background: rgba(255,255,255,0.10);
            border: 1px solid rgba(255,253,248,0.22);
            backdrop-filter: blur(10px);
          }
          .stat-value{
            font-weight: 900;
            font-size: 18px;
            color: #fffdf8;
          }
          .stat-label{
            margin-top: 2px;
            font-size: 11px;
            letter-spacing: 0.06em;
            color: rgba(255,253,248,0.85);
          }

          .hero-right{
            display:flex;
            align-items: stretch;
          }
          .glass-card{
            width: 100%;
            border-radius: 20px;
            padding: 16px 16px 14px;
            border: 1px solid rgba(255,255,255,0.22);
            background:
              radial-gradient(circle at top left, rgba(201,162,77,0.18), transparent 55%),
              linear-gradient(145deg, rgba(255,255,255,0.22), rgba(255,255,255,0.10));
            backdrop-filter: blur(12px);
            box-shadow: 0 22px 60px rgba(0,0,0,0.24);
            color: rgba(255,253,248,0.95);
            display:flex;
            flex-direction: column;
          }
          .glass-title{
            font-weight: 900;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            font-size: 12px;
            color: rgba(255,253,248,0.92);
          }
          .glass-sub{
            margin-top: 8px;
            font-size: 13px;
            line-height: 1.6;
            color: rgba(255,253,248,0.88);
          }
          .highlight-list{
            margin-top: 12px;
            display:grid;
            gap: 10px;
          }
          .highlight{
            display:flex;
            gap: 10px;
            align-items:flex-start;
            padding: 10px 10px;
            border-radius: 16px;
            border: 1px solid rgba(255,255,255,0.18);
            background: rgba(255,255,255,0.08);
          }
          .highlight-ico{
            width: 34px;
            height: 34px;
            border-radius: 12px;
            display:grid;
            place-items:center;
            background: rgba(201,162,77,0.18);
            border: 1px solid rgba(201,162,77,0.25);
            flex: 0 0 auto;
          }
          .highlight-title{
            font-weight: 900;
            font-size: 12px;
            letter-spacing: 0.04em;
          }
          .highlight-text{
            margin-top: 2px;
            font-size: 12px;
            line-height: 1.5;
            color: rgba(255,253,248,0.86);
          }
          .glass-foot{
            margin-top: auto;
            padding-top: 12px;
            display:flex;
            align-items:center;
            gap: 10px;
            font-size: 12px;
            color: rgba(255,253,248,0.82);
            border-top: 1px solid rgba(255,255,255,0.14);
          }
          .pulse-dot{
            width: 9px;
            height: 9px;
            border-radius: 999px;
            background: #22c55e;
            box-shadow: 0 0 0 6px rgba(34,197,94,0.14);
          }

          /* SECTION HELPERS */
          .section-kicker{
            font-size: 11px;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            font-weight: 900;
            color: var(--gold);
          }
          .section-title{
            margin: 6px 0 8px;
            font-size: 26px;
            font-weight: 900;
            color: var(--brown);
            letter-spacing: 0.02em;
          }
          .section-sub{
            margin: 0;
            color: var(--subtle);
            line-height: 1.6;
            font-size: 13px;
          }

          /* SPLIT */
          .split{
            margin-top: 18px;
          }
          .split-card{
            border-radius: 22px;
            border: 1px solid var(--border);
            box-shadow: var(--shadow);
            background:
              radial-gradient(circle at top left, rgba(201,162,77,0.10), transparent 55%),
              linear-gradient(145deg, var(--paper), var(--paper-2));
            display:grid;
            grid-template-columns: 0.95fr 1.35fr;
            overflow:hidden;
          }
          .split-img-wrap{
            position: relative;
            min-height: 320px;
          }
          .split-img{
            width: 100%;
            height: 100%;
            object-fit: cover;
            display:block;
          }
          .split-content{
            padding: 22px;
            color: var(--text);
          }
          .split-content p{
            margin: 10px 0 0;
            color: var(--subtle);
            line-height: 1.75;
            font-size: 14px;
          }
          .mini-points{
            margin-top: 14px;
            display:flex;
            gap: 10px;
            flex-wrap: wrap;
          }
          .mini{
            display:flex;
            align-items:center;
            gap: 8px;
            padding: 10px 12px;
            border-radius: 999px;
            border: 1px solid rgba(90,58,26,0.12);
            background: rgba(255,255,255,0.75);
            box-shadow: 0 12px 24px rgba(61,42,20,0.10);
            color: var(--muted);
            font-weight: 800;
            font-size: 12px;
          }
          .mini-ico{
            width: 26px;
            height: 26px;
            display:grid;
            place-items:center;
            border-radius: 999px;
            background: rgba(201,162,77,0.18);
            border: 1px solid rgba(201,162,77,0.25);
          }

          /* WHY US */
          .why{
            margin-top: 18px;
            padding: 18px 0 0;
          }
          .why-head{
            text-align:center;
            margin-bottom: 14px;
          }
          .why-grid{
            display:grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 14px;
          }
          .why-card{
            border-radius: 20px;
            border: 1px solid var(--border);
            background:
              radial-gradient(circle at top, rgba(201,162,77,0.10), transparent 55%),
              linear-gradient(145deg, var(--paper), var(--paper-2));
            box-shadow: 0 14px 32px rgba(61,42,20,0.12);
            padding: 16px;
            transition: transform 0.14s ease, box-shadow 0.14s ease, filter 0.14s ease;
          }
          .why-card:hover{
            transform: translateY(-3px);
            box-shadow: 0 20px 45px rgba(61,42,20,0.16);
            filter: brightness(1.01);
          }
          .why-icon-wrap{
            width: 86px;
            height: 86px;
            border-radius: 22px;
            background: rgba(201,162,77,0.14);
            border: 1px solid rgba(201,162,77,0.22);
            display:grid;
            place-items:center;
            overflow:hidden;
          }
          .why-icon{
            width: 76px;
            height: 76px;
            object-fit: contain;
            display:block;
          }
          .why-title{
            margin: 10px 0 6px;
            font-size: 13px;
            letter-spacing: 0.08em;
            font-weight: 900;
            color: var(--brown);
          }
          .why-text{
            margin: 0;
            color: var(--subtle);
            font-size: 13px;
            line-height: 1.65;
          }

          /* PARTNERS */
          .partners{
            margin-top: 18px;
          }
          .partners-head{
            text-align:center;
            margin-bottom: 12px;
          }
          .partners-card{
            border-radius: 22px;
            border: 1px solid var(--border);
            box-shadow: var(--shadow);
            padding: 18px;
            background:
              radial-gradient(circle at top, rgba(201,162,77,0.10), transparent 55%),
              linear-gradient(145deg, var(--paper), var(--paper-2));
            display:flex;
            justify-content:center;
            align-items:center;
            min-height: 140px;
          }
          .partner-logo{
            max-width: 100%;
            max-height: 110px;
            object-fit: contain;
            filter: drop-shadow(0 14px 24px rgba(61,42,20,0.18));
          }

          /* LOCATION */
          .location{
            margin-top: 18px;
          }
          .location-card{
            border-radius: 22px;
            border: 1px solid var(--border);
            box-shadow: var(--shadow);
            background:
              radial-gradient(circle at top left, rgba(201,162,77,0.10), transparent 55%),
              linear-gradient(145deg, var(--paper), var(--paper-2));
            overflow:hidden;
          }
          .location-head{
            padding: 18px 18px 0;
            text-align:center;
          }
          .location-map{
            padding: 14px 14px 16px;
          }

          /* DEV */
          .dev{
            margin-top: 18px;
          }
          .dev-card{
            border-radius: 22px;
            border: 1px solid var(--border);
            box-shadow: var(--shadow);
            background:
              radial-gradient(circle at top, rgba(201,162,77,0.10), transparent 55%),
              linear-gradient(145deg, var(--paper), var(--paper-2));
            padding: 16px;
            display:flex;
            align-items:center;
            justify-content:center;
            gap: 14px;
          }
          .dev-avatar{
            width: 74px;
            height: 74px;
            border-radius: 999px;
            object-fit: cover;
            border: 1px solid rgba(90,58,26,0.12);
            box-shadow: 0 14px 30px rgba(61,42,20,0.16);
          }
          .dev-kicker{
            font-size: 11px;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            font-weight: 900;
            color: var(--muted);
          }
          .dev-name{
            margin-top: 4px;
            font-size: 18px;
            font-weight: 900;
            color: var(--brown);
          }
          .dev-id{
            margin-top: 2px;
            color: var(--subtle);
            font-weight: 800;
            font-size: 12px;
          }

          /* RESPONSIVE */
          @media (max-width: 980px){
            .hero-inner{ grid-template-columns: 1fr; }
            .hero-right{ display:none; }
            .stats-row{ grid-template-columns: repeat(2, minmax(0,1fr)); }
            .split-card{ grid-template-columns: 1fr; }
            .split-img-wrap{ min-height: 240px; }
            .why-grid{ grid-template-columns: repeat(2, minmax(0,1fr)); }
          }
          @media (max-width: 520px){
            .hero-title{ font-size: 30px; }
            .why-grid{ grid-template-columns: 1fr; }
          }
        `}</style>
      </div>
    </>
  );
};

export default About;
