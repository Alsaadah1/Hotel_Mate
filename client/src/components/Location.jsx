import React, { useState, useEffect } from "react";

const OPENCAGE_API_KEY = "e6d38b8450ab40c688fead6ffd3ef390";

const Location = () => {
  const [location, setLocation] = useState(null);
  const [placeInfo, setPlaceInfo] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLocation({ latitude, longitude, accuracy });

        try {
          const url = `https://api.opencagedata.com/geocode/v1/json?key=${OPENCAGE_API_KEY}&q=${latitude}+${longitude}&no_annotations=1`;

          console.log("Fetching location from:", url);

          const response = await fetch(url);

          // 🔥 Check HTTP status first
          if (!response.ok) {
            setError("OpenCage API error: " + response.status);
            return;
          }

          const data = await response.json();

          // 🔥 Check OpenCage internal status
          if (data.status.code !== 200) {
            setError("OpenCage error: " + data.status.message);
            return;
          }

          if (data.results.length === 0) {
            setError("No location details found.");
            return;
          }

          const components = data.results[0].components;

          setPlaceInfo({
            formatted: data.results[0].formatted,
            city:
              components.city ||
              components.town ||
              components.village ||
              components.borough ||
              components.suburb ||
              "Unknown",
            region: components.state || components.county || "Unknown",
            country: components.country || "Unknown",
          });
        } catch (err) {
          setError("Failed to fetch reverse geolocation.");
        }
      },
      (err) => {
        setError("Permission denied or location unavailable");
      }
    );
  }, []);

  return (
    <div>
      <h1>Current Location & Place Info</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {location ? (
        <>
          <p><strong>Latitude:</strong> {location.latitude}</p>
          <p><strong>Longitude:</strong> {location.longitude}</p>
          <p><strong>GPS Accuracy:</strong> {location.accuracy} meters</p>
        </>
      ) : (
        !error && <p>Getting location…</p>
      )}

      {placeInfo && (
        <div style={{ marginTop: "1rem" }}>
          <p><strong>Formatted Address:</strong> {placeInfo.formatted}</p>
          <p><strong>City:</strong> {placeInfo.city}</p>
          <p><strong>Region:</strong> {placeInfo.region}</p>
          <p><strong>Country:</strong> {placeInfo.country}</p>
        </div>
      )}
    </div>
  );
};

export default Location;
