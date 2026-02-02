import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { DisasterEvent, Coordinates } from '../types';
import { DISASTER_ICONS, DISASTER_COLORS, SEVERITY_ICONS, SEVERITY_COLORS, DEFAULT_CENTER, DEFAULT_ZOOM } from '../constants';
import { renderToStaticMarkup } from 'react-dom/server';

// Fix for default Leaflet markers in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface MapDisplayProps {
  events: DisasterEvent[];
  selectedEventId: string | null;
  onEventSelect: (event: DisasterEvent) => void;
  userLocation: Coordinates | null;
  searchFocus: Coordinates | null;
  zoomLevel: number;
}

// Component to handle map movement
const MapController: React.FC<{ center: Coordinates; zoom: number; selectedEventId: string | null }> = ({ center, zoom, selectedEventId }) => {
  const map = useMap();
  useEffect(() => {
    // If an event is selected, fly there with high zoom
    // If just a search happened (searchFocus changed), fly there with suggested zoom
    // We differentiate by checking if selectedEventId is set, or if we just want to move to center
    const targetZoom = selectedEventId ? 12 : zoom;
    map.flyTo([center.lat, center.lng], targetZoom, {
        duration: 1.5
    });
  }, [center, zoom, map, selectedEventId]);
  return null;
};

// Custom Hook to create icons
const useDisasterIcon = (type: string, severity: string) => {
  const IconComponent = DISASTER_ICONS[type as keyof typeof DISASTER_ICONS] || DISASTER_ICONS['OTHER'];
  const color = DISASTER_COLORS[type as keyof typeof DISASTER_COLORS] || '#9ca3af';
  
  const size = severity === 'CRITICAL' ? 40 : severity === 'HIGH' ? 32 : 24;

  const iconHtml = renderToStaticMarkup(
    <div className="relative flex items-center justify-center w-full h-full">
      {severity === 'CRITICAL' && <span className="absolute w-full h-full rounded-full animate-ping opacity-75" style={{ backgroundColor: color }}></span>}
      <div 
        className="relative flex items-center justify-center rounded-full shadow-lg border-2 border-white"
        style={{ backgroundColor: color, width: '100%', height: '100%' }}
      >
        <IconComponent size={size * 0.6} color="white" />
      </div>
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'custom-leaflet-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

const MapDisplay: React.FC<MapDisplayProps> = ({ 
    events, 
    selectedEventId, 
    onEventSelect, 
    userLocation,
    searchFocus,
    zoomLevel
}) => {
  const [activeCenter, setActiveCenter] = useState<Coordinates>(DEFAULT_CENTER);
  const [activeZoom, setActiveZoom] = useState<number>(DEFAULT_ZOOM);

  useEffect(() => {
    if (selectedEventId) {
      const event = events.find(e => e.id === selectedEventId);
      if (event) {
        setActiveCenter(event.coordinates);
        // Zoom is handled in Controller for selected events
      }
    } else if (searchFocus) {
        setActiveCenter(searchFocus);
        setActiveZoom(zoomLevel);
    } else if (userLocation) {
        setActiveCenter(userLocation);
        setActiveZoom(10);
    }
  }, [selectedEventId, events, userLocation, searchFocus, zoomLevel]);

  return (
    <div className="h-full w-full z-0 relative">
      <MapContainer 
        center={[DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]} 
        zoom={DEFAULT_ZOOM} 
        style={{ height: '100%', width: '100%' }}
        className="bg-gray-900"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapController 
            center={activeCenter} 
            zoom={activeZoom} 
            selectedEventId={selectedEventId}
        />

        {userLocation && (
             <Marker position={[userLocation.lat, userLocation.lng]} icon={
                 L.divIcon({
                     html: '<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>',
                     className: 'user-loc-icon',
                     iconSize: [16, 16]
                 })
             }>
                 <Popup>You are here</Popup>
             </Marker>
        )}

        {events.map((event) => {
           // eslint-disable-next-line react-hooks/rules-of-hooks
           const icon = useDisasterIcon(event.type, event.severity);
           
           const SeverityIcon = SEVERITY_ICONS[event.severity] || SEVERITY_ICONS['LOW'];
           const severityColor = SEVERITY_COLORS[event.severity];

           return (
            <Marker 
                key={event.id} 
                position={[event.coordinates.lat, event.coordinates.lng]}
                icon={icon}
                eventHandlers={{
                    click: () => onEventSelect(event),
                }}
            >
                <Popup className="custom-popup">
                <div className="p-1 min-w-[200px]">
                    <h3 className="font-bold text-gray-900">{event.title}</h3>
                    <p className="text-xs text-gray-600 mt-1">{event.locationName}</p>
                    
                    <div className="flex items-center gap-1.5 mt-2">
                        <SeverityIcon size={16} color={severityColor} />
                        <span className="text-xs font-bold" style={{ color: severityColor }}>
                            {event.severity}
                        </span>
                    </div>

                    {event.sourceUrl && (
                        <a 
                            href={event.sourceUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block mt-2 text-xs text-blue-600 hover:underline"
                        >
                            Read Source Report &rarr;
                        </a>
                    )}
                </div>
                </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapDisplay;