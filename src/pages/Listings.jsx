import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import MapView from '../components/MapView';
import useUserLocation from '../hooks/useUserLocation';
import { calculateDistance } from '../utils/distance';

export default function Listings() {
  const { listings } = useContext(AppContext);
  const navigate = useNavigate();
  const { location: userLocation, permissionDenied } = useUserLocation();

  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState([]);
  const [distanceFilter, setDistanceFilter] = useState('any');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [view, setView] = useState('list'); // 'list' | 'map'
  const [sortBy, setSortBy] = useState('nearest'); // 'nearest' | range values | 'recency'

  const toggleGrade = (grade) => {
    setGradeFilter(prev =>
      prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade]
    );
  };

  // Compute live distance from user for each listing
  const withDistance = listings.map(l => {
    const liveDistance = userLocation && l.lat != null && l.lng != null
      ? calculateDistance(userLocation.lat, userLocation.lng, l.lat, l.lng)
      : l.distanceKm; // fallback to static field
    return { ...l, liveDistance };
  });

  const filtered = withDistance.filter(l => {
    const matchSearch = l.title.toLowerCase().includes(search.toLowerCase()) ||
      (l.subCategory && l.subCategory.toLowerCase().includes(search.toLowerCase()));
    const matchGrade = gradeFilter.length === 0 || gradeFilter.includes(l.grade);
    const matchDistance = distanceFilter === 'any' || l.liveDistance == null || l.liveDistance <= parseInt(distanceFilter);
    const matchVerified = !verifiedOnly || l.phoneVerified;
    const matchUrgent = !urgentOnly || l.urgent;
    return matchSearch && matchGrade && matchDistance && matchVerified && matchUrgent;
  });

  // Sort by distance range selector
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'recency') return new Date(b.postedAt) - new Date(a.postedAt);
    return (a.liveDistance ?? Infinity) - (b.liveDistance ?? Infinity);
  });

  const mapItems = sorted.map(l => ({
    id: l.id,
    lat: l.lat,
    lng: l.lng,
    title: l.title,
    price: l.price,
    unit: l.unit,
    type: 'seller',
  }));

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Browse Materials</h1>

      {permissionDenied && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-lg px-4 py-2 mb-4">
          📍 Enable location for distance-based sorting. Showing all listings sorted by recency.
        </div>
      )}

      <input
        type="text"
        placeholder="Search materials..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full border rounded-xl px-4 py-2 mb-4"
      />

      {/* View toggle + sort */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex border rounded-xl overflow-hidden">
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 text-sm font-medium ${view === 'list' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700'}`}
          >
            List View
          </button>
          <button
            onClick={() => setView('map')}
            className={`px-4 py-2 text-sm font-medium ${view === 'map' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700'}`}
          >
            Map View
          </button>
        </div>

        <select
          value={distanceFilter}
          onChange={e => setDistanceFilter(e.target.value)}
          className="border rounded-xl px-3 py-2 text-sm"
        >
          <option value="any">All distances</option>
          <option value="2">Within 2 km</option>
          <option value="5">Within 5 km</option>
          <option value="10">Within 10 km</option>
          <option value="20">Within 20 km</option>
        </select>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="border rounded-xl px-3 py-2 text-sm"
        >
          <option value="nearest">Nearest First</option>
          <option value="recency">Most Recent</option>
        </select>
      </div>

      <div className="flex gap-6">
        <div className="w-48 shrink-0">
          <div className="border rounded-xl p-4 sticky top-4">
            <p className="font-bold mb-3">Filters</p>

            <p className="font-semibold text-sm mb-1">Grade</p>
            {['A', 'B', 'C'].map(g => (
              <label key={g} className="flex items-center gap-2 text-sm mb-1 cursor-pointer">
                <input type="checkbox" checked={gradeFilter.includes(g)} onChange={() => toggleGrade(g)} />
                {g === 'A' ? 'A — Unused' : g === 'B' ? 'B — Slightly Used' : 'C — Scrap'}
              </label>
            ))}

            <p className="font-semibold text-sm mt-3 mb-1">Seller</p>
            <label className="flex items-center gap-2 text-sm mb-1 cursor-pointer">
              <input type="checkbox" checked={verifiedOnly} onChange={() => setVerifiedOnly(!verifiedOnly)} />
              Verified only
            </label>

            <p className="font-semibold text-sm mt-3 mb-1">Availability</p>
            <label className="flex items-center gap-2 text-sm mb-1 cursor-pointer">
              <input type="checkbox" checked={urgentOnly} onChange={() => setUrgentOnly(!urgentOnly)} />
              Urgent only
            </label>

            <button
              onClick={() => { setGradeFilter([]); setDistanceFilter('any'); setVerifiedOnly(false); setUrgentOnly(false); }}
              className="mt-4 w-full text-sm text-orange-500 border border-orange-500 rounded-lg py-1"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-3">Showing {sorted.length} materials</p>

          {sorted.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No materials found. Try adjusting filters.</p>
              <button onClick={() => navigate('/post')} className="bg-orange-500 text-white px-6 py-2 rounded-xl">Post Material</button>
            </div>
          )}

          {view === 'map' ? (
            <MapView items={mapItems} userLocation={userLocation} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sorted.map(listing => (
                <div key={listing.id} onClick={() => navigate('/listing/' + listing.id)} className="border rounded-xl p-4 cursor-pointer hover:shadow-md">
                  <img src={listing.photos[0]} alt={listing.title} className="w-full h-40 object-cover rounded-lg mb-3" />
                  <div className="flex justify-between items-start mb-1">
                    <h2 className="font-bold text-lg">{listing.title}</h2>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${listing.grade === 'A' ? 'bg-green-100 text-green-700' : listing.grade === 'B' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      Grade {listing.grade}
                    </span>
                  </div>
                  {listing.subCategory && <p style={{color:'gray', fontSize:'0.8rem'}}>{listing.subCategory}</p>}
                  {listing.urgent && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">🔴 Urgent</span>}
                  <p className="text-orange-500 font-bold">₹{listing.price} / {listing.unit}</p>
                  <p className="text-sm text-gray-500">
                    {listing.location} · 📍 {listing.liveDistance != null ? listing.liveDistance.toFixed(1) : listing.distanceKm} km away
                  </p>
                  <p className="text-sm">⭐ {listing.sellerRating} ({listing.sellerTotalDeals} deals)</p>
                  {listing.phoneVerified && <span style={{color:'green', fontSize:'0.8rem'}}>✅ Verified</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}