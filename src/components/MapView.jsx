import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { sellerIcon, buyerIcon, userIcon } from '../utils/leafletIcons';
import { calculateDistance } from '../utils/distance';

// items: array of { id, lat, lng, title/materialType, price/budget, type: 'seller'|'buyer' }
// userLocation: { lat, lng } or null
export default function MapView({ items, userLocation, onMarkerClick }) {
  const navigate = useNavigate();

  const center = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [12.9716, 77.5946]; // fallback: Bangalore

  return (
    <div className="relative w-full h-[500px] rounded-xl overflow-hidden border">
      <MapContainer center={center} zoom={11} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* User's location marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {items.map(item => {
          if (item.lat == null || item.lng == null) return null;

          const dist = userLocation
            ? calculateDistance(userLocation.lat, userLocation.lng, item.lat, item.lng)
            : null;

          return (
            <Marker
              key={`${item.type}-${item.id}`}
              position={[item.lat, item.lng]}
              icon={item.type === 'buyer' ? buyerIcon : sellerIcon}
              eventHandlers={{
                click: () => onMarkerClick && onMarkerClick(item),
              }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-bold">{item.title}</p>
                  <p>
                    {item.type === 'buyer'
                      ? `Budget: ₹${item.minBudget ?? ''}–₹${item.maxBudget ?? ''}`
                      : `₹${item.price} / ${item.unit}`}
                  </p>
                  {dist != null && <p className="text-gray-500">{dist.toFixed(1)} km away</p>}
                  <button
                    onClick={() =>
                      navigate(item.type === 'buyer' ? '/requirements' : `/listing/${item.id}`)
                    }
                    className="mt-2 text-orange-500 underline"
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Legend overlay */}
      <div className="absolute bottom-2 left-2 bg-white rounded-lg shadow px-3 py-2 text-xs z-[1000] space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span> Sellers
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> Buyers
        </div>
        {userLocation && (
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span> You
          </div>
        )}
      </div>
    </div>
  );
}
