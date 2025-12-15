// src/pages/Home.jsx
import React from "react";
import { Container, Row, Col } from "reactstrap";
import Navbar from "../components/Navbar";

// Landing sections
import HeroSection from "./HeroSection";
import Login from "./Login";
import HotelOverview from "./HotelOverview";
import HotelHighlights from "./HotelHighlights";
import WhatsIncluded from "./WhatsIncluded";
import HotelFacilities from "./HotelFacilities";
import PublicNavbar from "../components/PublicNavbar";
// Packages / rooms section
//import Explore from "./Explore";

const MainHome = () => {
  return (
    <>
      <PublicNavbar />

      <Container fluid>
        {/* HERO */}
        <Row>
          <Col>
            <HeroSection />
          </Col>
        </Row>

       

        {/* ABOUT */}
        <Row>
          <Col>
            <HotelOverview />
          </Col>
        </Row>

        {/* HIGHLIGHTS */}
        <Row>
          <Col>
            <HotelHighlights />
          </Col>
        </Row>

        {/* WHAT'S INCLUDED */}
        <Row>
          <Col>
            <WhatsIncluded />
          </Col>
        </Row>

        {/* FACILITIES */}
        <Row>
          <Col>
            <HotelFacilities />
          </Col>
        </Row>

        {/* PACKAGES / ROOMS */}
        <Row>
          <Col>
            
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default MainHome;
