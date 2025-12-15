// src/components/EquipmentCard.jsx

import React from 'react';

const EquipmentCard = ({ image, name, price, onRentNowClick }) => {
  const API_URL = process.env.REACT_APP_SERVER_URL;

  return (
    <article style={styles.card}>
      {/* IMAGE WITH OVERLAY + PRICE BADGE */}
      <div style={styles.imageBox}>
        <img
          src={`${API_URL}/assets/images/${image}`}
          alt={name}
          style={styles.image}
        />
        <div style={styles.imageOverlay} />

        <div style={styles.topPills}>
          <div style={styles.priceBadge}>
            <span style={styles.priceMain}>{price}</span>
            <span style={styles.priceSub}> OMR / night</span>
          </div>

          <div style={styles.ratingPill} aria-label="Premium stay">
            <span style={{ marginRight: 6 }}>★</span>
            <span>Premium</span>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={styles.bottom}>
        <h3 style={styles.title}>{name}</h3>

        <div style={styles.featuresRow}>
          <span style={styles.featureChip}>Boutique</span>
          <span style={styles.featureChip}>Wi-Fi</span>
          <span style={styles.featureChip}>Flexible</span>
        </div>

        <p style={styles.metaText}>
          Hand-picked comfort with a refined, hotel-grade experience.
        </p>

        <button style={styles.btn} onClick={onRentNowClick}>
          Book this room
        </button>

        <div style={styles.bottomLine} />
      </div>
    </article>
  );
};

const styles = {
  card: {
    width: '100%',
    maxWidth: '330px',
    borderRadius: '24px',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.86)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(122,74,46,0.14)',
    boxShadow: '0 18px 46px rgba(43,26,18,0.16)',
    display: 'flex',
    flexDirection: 'column',
    color: '#2b1a12',
    margin: '0 auto',
  },

  imageBox: {
    position: 'relative',
    width: '100%',
    height: '198px',
    overflow: 'hidden',
    backgroundColor: '#efe7da',
  },

  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    transform: 'scale(1.04)',
    filter: 'contrast(1.02) saturate(1.05)',
  },

  imageOverlay: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(to top, rgba(43,26,18,0.62), rgba(43,26,18,0.10))',
  },

  topPills: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },

  priceBadge: {
    padding: '8px 12px',
    borderRadius: '999px',
    backgroundImage: 'linear-gradient(135deg, #7a4a2e, #d4af37)',
    border: '1px solid rgba(212,175,55,0.35)',
    display: 'inline-flex',
    alignItems: 'baseline',
    fontSize: '13px',
    boxShadow: '0 14px 28px rgba(43,26,18,0.30)',
    whiteSpace: 'nowrap',
  },

  priceMain: {
    fontWeight: 900,
    fontSize: '14px',
    color: '#fff8e1',
  },

  priceSub: {
    marginLeft: 5,
    color: 'rgba(255,248,225,0.92)',
    fontSize: '12px',
  },

  ratingPill: {
    padding: '8px 12px',
    borderRadius: '999px',
    backgroundColor: 'rgba(255,255,255,0.20)',
    border: '1px solid rgba(255,248,225,0.32)',
    color: 'rgba(255,248,225,0.92)',
    fontWeight: 900,
    fontSize: '12px',
    letterSpacing: '0.02em',
    display: 'inline-flex',
    alignItems: 'center',
    boxShadow: '0 14px 28px rgba(0,0,0,0.18)',
    whiteSpace: 'nowrap',
  },

  bottom: {
    padding: '14px 16px 14px',
    textAlign: 'left',
    position: 'relative',
  },

  title: {
    margin: '0 0 8px',
    fontSize: '16px',
    fontWeight: 900,
    color: '#2b1a12',
    letterSpacing: '0.02em',
  },

  featuresRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },

  featureChip: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 10px',
    borderRadius: '999px',
    backgroundColor: 'rgba(212,175,55,0.10)',
    border: '1px solid rgba(212,175,55,0.20)',
    color: '#7a4a2e',
    fontWeight: 900,
    fontSize: '11px',
    letterSpacing: '0.02em',
  },

  metaText: {
    margin: '0 0 12px',
    fontSize: '12.5px',
    color: 'rgba(43,26,18,0.72)',
    lineHeight: 1.55,
  },

  btn: {
    width: '100%',
    padding: '11px 0',
    backgroundImage: 'linear-gradient(135deg, #7a4a2e, #d4af37)',
    borderRadius: '999px',
    border: '1px solid rgba(212,175,55,0.35)',
    fontWeight: 900,
    fontSize: '13px',
    color: '#fff8e1',
    cursor: 'pointer',
    marginTop: '2px',
    boxShadow: '0 14px 30px rgba(43,26,18,0.22)',
    transition: 'transform 0.14s ease, boxShadow 0.14s ease, filter 0.14s ease',
  },

  bottomLine: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 10,
    height: 1,
    background:
      'linear-gradient(90deg, transparent, rgba(212,175,55,0.55), transparent)',
    opacity: 0.7,
    pointerEvents: 'none',
  },
};

export default EquipmentCard;
