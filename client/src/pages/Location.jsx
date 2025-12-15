import React, { useEffect, useState } from "react";
import axios from "axios";

const OPENCAGE_API_KEY = "85d439c4bc1240e7aa266e0b5025b12d";

const Location = () => {
  const [location, setLocation] = useState(null);
  const [placeInfo, setPlaceInfo] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const address = "JH8X+P4V, Al Bahri Rd, Muscat, Oman";

    const fetchCoordinates = async () => {
      try {
        const response = await axios.get(
          `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${OPENCAGE_API_KEY}`
        );
        const data = response.data;
        if (data && data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry;
          setLocation({ latitude: lat, longitude: lng });

          const components = data.results[0].components;
          setPlaceInfo({
            city: components.city || components.town || components.village,
            region: components.state,
            country: components.country,
          });
        } else {
          setError("Could not retrieve location details.");
        }
      } catch (err) {
        setError("Failed to fetch geolocation.");
      }
    };

    fetchCoordinates();
  }, []);

  return (
    <div className="location-container p-8">
      <h3 className="text-2xl font-bold mb-4">Visit our office in Muscat, Oman</h3>
      <div className="location-content grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="location-details bg-white p-6 rounded shadow">
          {error && <p className="text-red-500">{error}</p>}
          {location ? (
            <div className="location-info space-y-2">
              <p><strong>Latitude:</strong> {location.latitude}</p>
              <p><strong>Longitude:</strong> {location.longitude}</p>
            </div>
          ) : (
            !error && <p>Getting location...</p>
          )}
          {placeInfo && (
            <div className="place-info mt-4 space-y-2">
              <p><strong>City:</strong> {placeInfo.city}</p>
              <p><strong>Region:</strong> {placeInfo.region}</p>
              <p><strong>Country:</strong> {placeInfo.country}</p>
            </div>
          )}
        </div>

        <div className="map-container rounded overflow-hidden shadow">
          <h2 className="text-xl font-semibold mb-2">Map</h2>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3584.028814087798!2d58.589874075363256!3d23.61234987877443!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e8e0176f7e5a8cf%3A0x4f8b0edc6e354730!2sJH8X%2BP4V%20Al%20Bahri%20Rd%2C%20Muscat%2C%20Oman!5e0!3m2!1sen!2som!4v1715947305295"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-[450px]"
          ></iframe>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold mb-4">CruiseVoyage Headquarters</h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <span className="icon mr-3">📍</span>
            <span>1234 Ocean Avenue, New York, NY 10001, USA</span>
          </div>
          <div className="flex items-center">
            <span className="icon mr-3">📞</span>
            <span>+1 (555) 123-4567</span>
          </div>
          <div className="flex items-center">
            <span className="icon mr-3">✉️</span>
            <span>info@cruisevoyage.com</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Location;
