import { useState, useEffect } from "react";

const API_KEY = process.env.REACT_APP_OPENCAGE_API_KEY;
const API_URL = process.env.REACT_APP_OPENCAGE_API_URL; // e.g. "https://api.opencagedata.com/geocode/v1/json"

const useLocation = () => {
  const [placeInfo, setPlaceInfo] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // 1. Ensure env variables exist
    if (!API_KEY || !API_URL) {
      setError("Location API is not configured (missing API key or URL).");
      return;
    }

    // 2. Check browser geolocation support
    if (!navigator.geolocation) {
      setError("Geolocation not supported on this device.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const url = `${API_URL}?key=${API_KEY}&q=${latitude}+${longitude}&no_annotations=1`;

          const response = await fetch(url);

          // 3. Check server-level (HTTP) errors
          if (!response.ok) {
            setError("Location lookup failed (HTTP " + response.status + ")");
            return;
          }

          const data = await response.json();

          // 4. Check OpenCage internal status
          if (!data.status || data.status.code !== 200) {
            setError("OpenCage error: " + (data.status?.message || "Unknown error"));
            return;
          }

          if (!data.results || data.results.length === 0) {
            setError("No location results found.");
            return;
          }

          const comp = data.results[0].components;

          // 5. Extract clean info
          setPlaceInfo({
            city:
              comp.city ||
              comp.town ||
              comp.village ||
              comp.borough ||
              comp.suburb ||
              "Unknown",
            region: comp.state || comp.county || "Unknown",
            country: comp.country || "Unknown",
            formatted: data.results[0].formatted,
          });
        } catch (err) {
          setError("Failed to fetch reverse geolocation.");
        }
      },
      () => {
        setError("Permission denied or location unavailable.");
      }
    );
  }, []);

  return { placeInfo, error };
};

export default useLocation;
