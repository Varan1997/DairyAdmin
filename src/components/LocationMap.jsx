import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Bengaluru — a reasonable default center matching our seeded serviceable area.
const DEFAULT_CENTER = [12.9716, 77.5946];

const SATELLITE_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const SATELLITE_ATTRIBUTION = "Tiles &copy; Esri";

const pinIcon = L.divIcon({
  html: '<div style="font-size:30px;line-height:1;transform:translate(-50%,-92%);filter:drop-shadow(0 2px 2px rgba(0,0,0,0.5))">📍</div>',
  className: "",
  iconSize: [0, 0],
});

// A Leaflet map showing satellite imagery only (no toggle/other views). When
// `editable`, the marker can be dragged or the map clicked to move it, and
// `onChange({ lat, lng })` fires — return `false` from `onChange` to reject
// the new spot and have the pin snap back to where it was.
export default function LocationMap({ lat, lng, onChange, editable = false, height = 240, zoom = 17 }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onChangeRef = useRef(onChange);

  // Keep the ref current every render so the Leaflet listeners (wired up once,
  // below) always call the latest onChange instead of a stale first-render one.
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const center = lat != null && lng != null ? [lat, lng] : DEFAULT_CENTER;
    const map = L.map(containerRef.current, { center, zoom });
    mapRef.current = map;

    // Esri's free imagery isn't high-resolution everywhere (patchy outside major
    // metro areas in India). maxNativeZoom stops Leaflet from requesting tiles
    // beyond what actually exists — it upscales the best available tile instead
    // of showing a blank one when zoomed in past the real coverage.
    L.tileLayer(SATELLITE_URL, {
      maxZoom: 19,
      maxNativeZoom: 17,
      attribution: SATELLITE_ATTRIBUTION,
    }).addTo(map);

    const marker = L.marker(center, { icon: pinIcon, draggable: editable }).addTo(map);
    markerRef.current = marker;

    if (editable) {
      let dragStartPos = marker.getLatLng();
      marker.on("dragstart", () => {
        dragStartPos = marker.getLatLng();
      });
      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        const accepted = onChangeRef.current?.({ lat: pos.lat, lng: pos.lng });
        if (accepted === false) marker.setLatLng(dragStartPos);
      });
      map.on("click", (e) => {
        const prevPos = marker.getLatLng();
        marker.setLatLng(e.latlng);
        const accepted = onChangeRef.current?.({ lat: e.latlng.lat, lng: e.latlng.lng });
        if (accepted === false) marker.setLatLng(prevPos);
      });
    }

    setTimeout(() => map.invalidateSize(), 0);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the marker/view in sync when lat/lng change from outside (e.g. GPS button)
  useEffect(() => {
    if (!mapRef.current || !markerRef.current || lat == null || lng == null) return;
    const current = markerRef.current.getLatLng();
    if (Math.abs(current.lat - lat) > 1e-6 || Math.abs(current.lng - lng) > 1e-6) {
      markerRef.current.setLatLng([lat, lng]);
      mapRef.current.setView([lat, lng], mapRef.current.getZoom());
    }
  }, [lat, lng]);

  return (
    <div
      ref={containerRef}
      style={{ height }}
      className="w-full overflow-hidden rounded-xl border border-line"
    />
  );
}
