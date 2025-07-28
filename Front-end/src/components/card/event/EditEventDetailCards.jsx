import React, { useEffect, useRef, useState } from "react";
import { Card, Form } from "react-bootstrap";
import { CalendarIcon, MapPinIcon, UserIcon } from "lucide-react";
import GoogleMapComponent from "./GoogleMapComponent";

const EventDetailCards = ({
  detailCardsData,
  eventDetails,
  calculatedEndTime,
  dateTimeRef,
  handleEventDetailChange,
  formatDateTimeDisplay,
  handleDateTimeClick,
  handleMapLocationSelect,
  mapApiKey,
}) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const marker = useRef(null);
  const [locationInput, setLocationInput] = useState(eventDetails.location || "");

  // Đồng bộ locationInput với eventDetails.location
  useEffect(() => {
    setLocationInput(eventDetails.location || "");
  }, [eventDetails.location]);

  useEffect(() => {
    if (
      !mapApiKey ||
      !mapRef.current ||
      detailCardsData.find((card) => card.key === "location")?.inputType !== "map"
    ) {
      return;
    }

    const loadGoogleMapsScript = () => {
      if (window.google && window.google.maps) {
        initMap();
        return;
      }
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${mapApiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      script.onerror = () => console.error("Failed to load Google Maps script");
      document.body.appendChild(script);
    };

    const initMap = () => {
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 10.7769, lng: 106.7009 }, // Trung tâm Việt Nam
        zoom: 12,
      });

      marker.current = new window.google.maps.Marker({
        map: mapInstance.current,
        draggable: true,
        title: "Drag me to set location",
      });

      marker.current.addListener("dragend", (event) => {
        const position = marker.current.getPosition();
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: position }, (results, status) => {
          if (status === "OK" && results[0]) {
            const address = results[0].formatted_address;
            setLocationInput(address);
            handleMapLocationSelect(address);
            marker.current.setTitle(address);
          }
        });
      });

      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Search location...";
      input.style.width = "100%";
      input.style.padding = "5px";
      mapRef.current.appendChild(input);

      const autocomplete = new window.google.maps.places.Autocomplete(input);
      autocomplete.bindTo("bounds", mapInstance.current);

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) return;

        mapInstance.current.setCenter(place.geometry.location);
        marker.current.setPosition(place.geometry.location);
        const address = place.formatted_address;
        setLocationInput(address);
        handleMapLocationSelect(address);
        marker.current.setTitle(address);
      });

      // Nếu có location từ input, cập nhật bản đồ
      if (eventDetails.location) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: eventDetails.location }, (results, status) => {
          if (status === "OK" && results[0]) {
            mapInstance.current.setCenter(results[0].geometry.location);
            marker.current.setPosition(results[0].geometry.location);
            marker.current.setTitle(eventDetails.location);
          }
        });
      }
    };

    loadGoogleMapsScript();

    return () => {
      if (mapInstance.current) {
        mapInstance.current = null;
      }
    };
  }, [mapApiKey, eventDetails.location, handleMapLocationSelect, detailCardsData]);

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setLocationInput(value);
    handleMapLocationSelect(value);
    // Cập nhật bản đồ (tùy chọn, nếu muốn tự động geocoding)
    if (value) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: value }, (results, status) => {
        if (status === "OK" && results[0] && mapInstance.current) {
          mapInstance.current.setCenter(results[0].geometry.location);
          marker.current.setPosition(results[0].geometry.location);
          marker.current.setTitle(value);
        }
      });
    }
  };

  return (
    <div className="d-flex flex-column gap-3">
      {detailCardsData.map((card, index) => (
        <Card key={index} className="border-0 shadow-sm">
          <Card.Body className="p-3">
            <div className="d-flex align-items-center mb-3">
              <div
                className="me-3 rounded text-white d-flex align-items-center justify-content-center"
                style={{
                  width: "40px",
                  height: "40px",
                  background: card.color,
                }}
              >
                {card.icon}
              </div>
              <span className="fw-semibold text-dark">{card.label}</span>
            </div>

            {card.key === "dateTime" ? (
              <div className="position-relative">
                <Form.Control
                  ref={dateTimeRef}
                  type="datetime-local"
                  value={eventDetails[card.key] || ""}
                  onChange={(e) =>
                    handleEventDetailChange(card.key, e.target.value)
                  }
                  className="border-2"
                  style={{
                    borderColor: "#dee2e6",
                    borderRadius: "8px",
                  }}
                />
                {!eventDetails[card.key] && (
                  <div
                    className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center px-3 text-muted"
                    style={{
                      cursor: "pointer",
                      backgroundColor: "white",
                      border: "2px solid #dee2e6",
                      borderRadius: "8px",
                    }}
                    onClick={handleDateTimeClick}
                  >
                    {card.placeholder}
                  </div>
                )}
              </div>
            ) : card.key === "location" && card.inputType === "map" ? (
              <div>
                <div
                  ref={mapRef}
                  style={{ height: "200px", width: "100%", borderRadius: "8px" }}
                />
                <Form.Control
                  type="text"
                  placeholder={card.placeholder}
                  value={locationInput}
                  onChange={handleLocationChange}
                  className="border-2 mt-2"
                  style={{
                    borderColor: "#dee2e6",
                    borderRadius: "8px",
                  }}
                />
              </div>
            ) : (
              <Form.Control
                type={card.inputType || "text"}
                placeholder={card.placeholder}
                value={eventDetails[card.key] || ""}
                onChange={(e) =>
                  handleEventDetailChange(card.key, e.target.value)
                }
                className="border-2"
                style={{
                  borderColor: "#dee2e6",
                  borderRadius: "8px",
                }}
              />
            )}

            {card.key === "dateTime" && (
              <div className="mt-2">
                {eventDetails[card.key] && (
                  <small className="text-muted d-block">
                    📅 Bắt đầu: {formatDateTimeDisplay(eventDetails[card.key])}
                  </small>
                )}
                {calculatedEndTime && (
                  <small className="text-muted d-block">
                    ⏰ Kết thúc: {formatDateTimeDisplay(calculatedEndTime)}
                  </small>
                )}
                {!eventDetails[card.key] && !calculatedEndTime && (
                  <small className="text-muted d-block">
                    Chưa có thời gian
                  </small>
                )}
              </div>
            )}
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default EventDetailCards;