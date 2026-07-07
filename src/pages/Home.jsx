import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import MapView from '../components/MapView'
import useUserLocation from '../hooks/useUserLocation'
import { calculateDistance } from '../utils/distance'

const Home = () => {
  const { listings } = useContext(AppContext)
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('')
  const [view, setView] = useState('list') // 'list' | 'map'
  const { location: userLocation, permissionDenied } = useUserLocation()

  const quickFilters = ['Cement', 'Bricks', 'Steel', 'Sand', 'Tiles', 'Wood']

  const isBulkAvailable = (listing) => {
    const bulkThresholds = { bags: 100, pieces: 1000, tons: 5, kg: 500, sqft: 500, metres: 100 }
    return listing.quantity >= (bulkThresholds[listing.unit] || 100)
  }

  const getRemainingPercentage = (listing) => {
    if (!listing.originalQuantity) return 100
    return (listing.quantity / listing.originalQuantity) * 100
  }

  const getGradeBadgeColor = (grade) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800'
      case 'B': return 'bg-yellow-100 text-yellow-800'
      case 'C': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTransportIcon = (transportHint) => {
    if (transportHint === 'truck') return '🚛'
    if (transportHint === 'small vehicle') return '🚐'
    return '📦'
  }

  // Add live distance to each listing
  const withDistance = listings
    .filter(l => l.status === 'active')
    .map(l => {
      const liveDistance = userLocation && l.lat != null && l.lng != null
        ? calculateDistance(userLocation.lat, userLocation.lng, l.lat, l.lng)
        : l.distanceKm
      return { ...l, liveDistance }
    })

  // Apply search + filter
  const filteredListings = withDistance.filter(l => {
    const matchSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.materialType?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchFilter = !selectedFilter || l.materialType?.toLowerCase().includes(selectedFilter.toLowerCase())
    return matchSearch && matchFilter
  })

  // Nearby = sorted by live distance, top 6
  const nearbyMaterials = [...filteredListings]
    .sort((a, b) => (a.liveDistance ?? Infinity) - (b.liveDistance ?? Infinity))
    .slice(0, 6)

  const mapItems = filteredListings.map(l => ({
    id: l.id,
    lat: l.lat,
    lng: l.lng,
    title: l.title,
    price: l.price,
    unit: l.unit,
    type: 'seller',
  }))

  // Stats for value bar
  const avgSavings = (() => {
    const withMarket = listings.filter(l => l.marketPrice && l.marketPrice > l.price)
    if (!withMarket.length) return 23
    const total = withMarket.reduce((acc, l) => acc + ((l.marketPrice - l.price) / l.marketPrice) * 100, 0)
    return Math.round(total / withMarket.length)
  })()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-50 to-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Find Construction Materials
              <span className="block text-primary">Near You</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect with local suppliers and get the best prices on construction materials
            </p>
          </div>

          <div className="max-w-3xl mx-auto mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search cement, bricks, steel…"
                className="flex-1 px-6 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button className="bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                Search
              </button>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {quickFilters.map(filter => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter === selectedFilter ? '' : filter)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  selectedFilter === filter
                    ? 'bg-primary text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Value Proposition Bar */}
      <div className="bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 py-6">
            <div className="flex items-center gap-2">
              <span className="text-green-600 text-xl">💰</span>
              <span className="font-medium text-gray-900">Avg {avgSavings}% cheaper than suppliers</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600 text-xl">📍</span>
              <span className="font-medium text-gray-900">
                {listings.filter(l => l.distanceKm <= 5).length} materials within 5km
              </span>
            </div>
            <div className="hidden md:block w-px h-6 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <span className="text-orange-500 text-xl">♻️</span>
              <span className="font-medium text-gray-900">
                {listings.reduce((acc, l) => acc + (l.wasteDiverted || 0), 0).toFixed(0)} kg waste diverted
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Nearby Materials Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {permissionDenied && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-lg px-4 py-2 mb-4">
            📍 Enable location for distance-based sorting
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Nearby Materials</h2>

          {/* View Toggle */}
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
        </div>

        {view === 'map' ? (
          <MapView
            items={mapItems}
            userLocation={userLocation}
            onMarkerClick={(item) => navigate(`/listing/${item.id}`)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearbyMaterials.map(material => (
              <div
                key={material.id}
                onClick={() => navigate(`/listing/${material.id}`)}
                className="bg-white border rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <img
                    src={material.photos[0]}
                    alt={material.title}
                    className="w-full h-48 object-cover"
                  />
                  {material.urgent && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      🔴 Urgent
                    </span>
                  )}
                  <span className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${getGradeBadgeColor(material.grade)}`}>
                    Grade {material.grade}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">{material.title}</h3>
                  <p className="text-orange-500 font-bold text-lg mb-2">
                    ₹{material.price} / {material.unit}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                    <span>📍 {material.liveDistance != null ? material.liveDistance.toFixed(1) : material.distanceKm} km away</span>
                    <span>{getTransportIcon(material.transportHint)} {material.transportHint}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{material.sellerName}</span>
                    <span>⭐ {material.sellerRating}</span>
                  </div>
                  {material.phoneVerified && (
                    <span className="text-green-600 text-xs">✅ Verified Seller</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link to="/listings" className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors inline-block">
            View All Materials
          </Link>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="bg-primary py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Can't find what you need?</h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Post a request and let sellers come to you
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/post" className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block">
              Post Material
            </Link>
            <Link to="/post-requirement" className="bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-800 transition-colors inline-block">
              Post Requirement
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Get construction materials in 3 simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Search Nearby', desc: 'Browse thousands of construction materials available in your area' },
              { step: '2', title: 'Contact Seller', desc: 'Connect directly with suppliers via WhatsApp or phone to negotiate prices' },
              { step: '3', title: 'Pick Up & Save', desc: 'Arrange pickup or delivery and save money on quality construction materials' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">{step}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home