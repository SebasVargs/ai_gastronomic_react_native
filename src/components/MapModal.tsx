// src/components/MapModal.tsx

import React, { useEffect, useRef } from 'react';
import { X, ExternalLink } from 'lucide-react';
import './MapModal.css';

interface MapModalProps {
    restaurantName: string;
    lat: number;
    lng: number;
    onClose: () => void;
}

export const MapModal: React.FC<MapModalProps> = ({ restaurantName, lat, lng, onClose }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);

    useEffect(() => {
        // Dynamically load Leaflet CSS
        if (!document.getElementById('leaflet-css')) {
            const link = document.createElement('link');
            link.id = 'leaflet-css';
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
        }

        // Dynamically load Leaflet JS then init map
        const initMap = () => {
            if (!mapRef.current || mapInstanceRef.current) return;
            const L = (window as any).L;
            if (!L) return;

            const map = L.map(mapRef.current).setView([lat, lng], 16);
            mapInstanceRef.current = map;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 19,
            }).addTo(map);

            // Custom marker icon
            const icon = L.divIcon({
                className: '',
                html: `
          <div class="map-marker">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
              fill="#f15a47" stroke="white" stroke-width="1.5">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5" fill="white" stroke="none"/>
            </svg>
          </div>`,
                iconSize: [36, 36],
                iconAnchor: [18, 36],
                popupAnchor: [0, -36],
            });

            L.marker([lat, lng], { icon })
                .addTo(map)
                .bindPopup(`<strong>${restaurantName}</strong><br/>Villa de Leyva`)
                .openPopup();
        };

        if ((window as any).L) {
            initMap();
        } else {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = initMap;
            document.head.appendChild(script);
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [lat, lng, restaurantName]);

    const openGoogleMaps = () => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        window.open(url, '_blank');
    };

    // Close on backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="map-modal">
                <div className="map-modal-header">
                    <div className="map-modal-title">
                        <span className="map-modal-icon">📍</span>
                        <div>
                            <h3>{restaurantName}</h3>
                            <p>Villa de Leyva, Boyacá</p>
                        </div>
                    </div>
                    <div className="map-modal-actions">
                        <button className="gmaps-btn" onClick={openGoogleMaps}>
                            <ExternalLink size={15} />
                            Cómo llegar
                        </button>
                        <button className="modal-close-btn" onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>
                </div>
                <div className="map-container" ref={mapRef} />
            </div>
        </div>
    );
};