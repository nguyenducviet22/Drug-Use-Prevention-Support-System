import React, { useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";

const GoogleMapComponent = ({ location, onLocationSelect, mapApiKey }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const marker = useRef(null);

  useEffect(() => {
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
      if (!mapRef.current) return;

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
            onLocationSelect(address);
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
        onLocationSelect(address);
        marker.current.setTitle(address);
      });

      // Cập nhật bản đồ khi location thay đổi
      if (location) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: location }, (results, status) => {
          if (status === "OK" && results[0]) {
            mapInstance.current.setCenter(results[0].geometry.location);
            marker.current.setPosition(results[0].geometry.location);
          }
        });
      }
    };

    loadGoogleMapsScript();

    return () => {
      if (mapInstance.current) {
        google.maps.event.clearInstanceListeners(mapInstance.current);
        mapInstance.current = null;
      }
    };
  }, [mapApiKey, location, onLocationSelect]);

  return <div ref={mapRef} style={{ height: "300px", width: "100%", marginBottom: "10px", border: "1px solid #ccc" }} />;
};

export default React.memo(GoogleMapComponent);