import React, { useEffect, useRef } from "react";

const Map = ({ latitude, longitude }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (window.google) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: latitude, lng: longitude },
        zoom: 15,
      });
      new window.google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: map,
        title: "Location",
      });
    }
  }, [latitude, longitude]);

  return <div ref={mapRef} style={{ width: "100%", height: "450px" }} />;
};

export default Map;
