import React from "react";

const HeroSection = () => {
  return (
    <div className="hero">
      <div className="hero-image">{/* Hero image set via CSS */}</div>
      <div className="hero-text">
        <h1>Welcome to Hotel Mate</h1>
      
      </div>
    </div>
  );
};



/////////////////////////////////////////////
const style = {
  hero: {
    position: "relative",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    color: "#FFFFFF",
    overflow: "hidden",
  },

  heroImage: {
    position: "absolute",
    inset: 0,
    backgroundImage: `url(${process.env.REACT_APP_SERVER_URL}/assets/images/hero.jpg)`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    zIndex: -1,
  },

  heroText: {
    maxWidth: "800px",
    padding: "2rem",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: "10px",
    margin: "2rem",
  },

  heroHeading: {
    fontSize: "2.5rem",
    marginBottom: "1rem",
    fontWeight: 800,
  },

  heroParagraph: {
    fontSize: "1.2rem",
    marginBottom: "1rem",
  },

  heroUserCard: {
    position: "absolute",
    bottom: "24px",
    right: "24px",
    backgroundColor: "rgba(255,255,255,0.95)",
    color: "#0B1A33",
    padding: "12px 16px",
    borderRadius: "14px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
  },
};

export default HeroSection;