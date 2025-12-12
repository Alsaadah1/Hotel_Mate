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

        <div style={styles.priceBadge}>
          <span style={styles.priceMain}>{price}</span>
          <span style={styles.priceSub}> OMR / night</span>
        </div>
      </div>

      {/* CONTENT */}
      <div style={styles.bottom}>
        <h3 style={styles.title}>{name}</h3>

        <p style={styles.metaText}>
          Boutique stay • Complimentary Wi-Fi • Flexible check-in
        </p>

        <button style={styles.btn} onClick={onRentNowClick}>
          Book this room
        </button>
      </div>
    </article>
  );
};

const styles = {
  card: {
    width: '100%',
    maxWidth: '320px',
    borderRadius: '22px',
    overflow: 'hidden',
    backgroundImage:
      'linear-gradient(145deg, #FFFFFF, #EFF6FF)',
    border: '1px solid rgba(191,219,254,0.95)',
    boxShadow: '0 18px 40px rgba(15,23,42,0.12)',
    display: 'flex',
    flexDirection: 'column',
    color: '#0B1A33',
    margin: '0 auto',
  },

  imageBox: {
    position: 'relative',
    width: '100%',
    height: '190px',
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },

  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    transform: 'scale(1.03)',
  },

  imageOverlay: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(to top, rgba(15,23,42,0.55), rgba(15,23,42,0.08))',
  },

  priceBadge: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    padding: '6px 10px',
    borderRadius: '999px',
    backgroundImage:
      'linear-gradient(135deg, #0A3D91, #1E5FE0)',
    border: '1px solid rgba(219,234,254,0.95)',
    display: 'flex',
    alignItems: 'baseline',
    fontSize: '13px',
    boxShadow: '0 10px 22px rgba(15,23,42,0.4)',
  },

  priceMain: {
    fontWeight: 800,
    fontSize: '14px',
    color: '#F9FAFF',
  },

  priceSub: {
    marginLeft: 4,
    color: '#E0EAFF',
    opacity: 0.95,
  },

  bottom: {
    padding: '14px 16px 16px',
    textAlign: 'left',
  },

  title: {
    margin: '0 0 6px',
    fontSize: '16px',
    fontWeight: 700,
    color: '#0B1A33',
  },

  metaText: {
    margin: '0 0 12px',
    fontSize: '12px',
    color: '#4B5563',
    opacity: 0.95,
  },

  btn: {
    width: '100%',
    padding: '10px 0',
    backgroundImage: 'linear-gradient(135deg, #0A3D91, #1E5FE0)',
    borderRadius: '999px',
    border: 'none',
    fontWeight: 700,
    fontSize: '13px',
    color: '#F9FAFF',
    cursor: 'pointer',
    marginTop: '4px',
    boxShadow: '0 10px 24px rgba(37,99,235,0.55)',
    transition: 'transform 0.14s ease, boxShadow 0.14s ease, filter 0.14s ease',
  },
};

export default EquipmentCard;
