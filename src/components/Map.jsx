import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import styles from "./Map.module.css";
import { useGeolocation } from "../hooks/useGeolocation";
import { useUrlPosition } from "../hooks/useUrlPosition";
import { useCities } from "../hooks/useCities.js";

import Button from "./Button";

function Map() {
  const { cities } = useCities();
  const [mapPosition, setMapPosition] = useState([40, 0]);
  const { lat: mapLat, lng: mapLng } = useUrlPosition();
  const {
    isLoading: isLoadingGeolocation,
    position: positionGeolocation,
    getPosition,
  } = useGeolocation();

  useEffect(() => {
    if (mapLat && mapLng) setMapPosition([mapLat, mapLng]);
  }, [mapLat, mapLng]);

  useEffect(() => {
    if (positionGeolocation)
      setMapPosition([positionGeolocation.lat, positionGeolocation.lng]);
  }, [positionGeolocation]);

  return (
    <div className={styles.mapContainer}>
      {!positionGeolocation ? (
        <Button type="position" onClick={getPosition}>
          {isLoadingGeolocation ? "Loading..." : "Use current position"}
        </Button>
      ) : (
        ""
      )}

      <MapContainer
        className={styles.map}
        center={mapPosition}
        zoom={6}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        />
        {cities.map((city) => (
          <Marker
            key={city.id}
            position={[city.position.lat, city.position.lng]}
          >
            <Popup>
              <span>{city.emoji}</span> <span>{city.cityName}</span>
            </Popup>
          </Marker>
        ))}
        <CenterMap position={mapPosition} />
        <ClickMap setMapPosition={setMapPosition} />
      </MapContainer>
    </div>
  );
}

function CenterMap({ position }) {
  const map = useMap();
  map.setView(position);

  return null;
}

function ClickMap() {
  const navigate = useNavigate();

  useMapEvents({
    click(e) {
      navigate(`form?lat=${e.latlng.lat}&lng=${e.latlng.lng}`);
    },
  });

  return null;
}

CenterMap.propTypes = {
  position: PropTypes.array,
};

export default Map;
