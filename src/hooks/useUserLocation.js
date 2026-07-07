import { useState, useEffect } from 'react';

const DEFAULT_LOCATION = { lat: 12.9716, lng: 77.5946 }; // Bangalore fallback

export default function useUserLocation() {
  const [location, setLocation] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation(DEFAULT_LOCATION);
      setPermissionDenied(true);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      () => {
        setLocation(DEFAULT_LOCATION);
        setPermissionDenied(true);
        setLoading(false);
      }
    );
  }, []);

  return { location, permissionDenied, loading };
}