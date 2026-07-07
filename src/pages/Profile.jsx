import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const Profile = () => {
  const navigate = useNavigate()
  const {
    currentUser, logout, listings,
    getSavedListingsData, updateListing, deleteListing, unsaveListing
  } = useContext(AppContext)

  const [activeTab, setActiveTab] = useState('listings')
  const [showSoldModal, setShowSoldModal] = useState(false)
  const [selectedListing, setSelectedListing] = useState(null)
  const [soldQuantity, setSoldQuantity] = useState('')
  const [timeLeft, setTimeLeft] = useState({})

  // Redirect to login if not logged in
  useEffect(() => {
    if (!currentUser) navigate('/login')
  }, [currentUser, navigate])

  // Calculate time left for active listings
  useEffect(() => {
    const calculateTimeLeft = () => {
      const newTimeLeft = {}
      listings.forEach(listing => {
        if (listing.status === 'active' && listing.expiresAt) {
          const diff = new Date(listing.expiresAt) - new Date()
          if (diff > 0) {
            newTimeLeft[listing.id] = {
              days: Math.floor(diff / (1000 * 60 * 60 * 24)),
              hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            }
          }
        }
      })
      setTimeLeft(newTimeLeft)
    }
    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 60000)
    return () => clearInterval(interval)
  }, [listings])

  if (!currentUser) return null

  // My listings — match by seller_id or phone
  const myListings = listings.filter(l =>
    l.sellerPhone === currentUser.phone || l.seller_id === currentUser.id
  )
  const activeCount = myListings.filter(l => l.status === 'active').length
  const soldCount = myListings.filter(l => l.status === 'sold').length

  // Saved listings from context
  const savedListingsDetails = getSavedListingsData()

  const handleMarkAsSold = (listing) => {
    setSelectedListing(listing)
    setShowSoldModal(true)
  }

  const handleConfirmSold = async () => {
    if (!soldQuantity || !selectedListing) return
    const remaining = selectedListing.quantity - parseInt(soldQuantity)
    if (remaining <= 0) {
      await updateListing(selectedListing.id, { status: 'sold', quantity: 0 })
    } else {
      await updateListing(selectedListing.id, { quantity: remaining })
    }
    setShowSoldModal(false)
    setSelectedListing(null)
    setSoldQuantity('')
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-3xl font-bold">
                {(currentUser.name || currentUser.email || 'U')[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-900">
                {currentUser.name || 'ReStack User'}
              </h1>
              <p className="text-gray-600">{currentUser.email}</p>
              {currentUser.phone && (
                <p className="text-gray-600">📞 {currentUser.phone}</p>
              )}
              <div className="flex gap-4 mt-3 justify-center md:justify-start">
                <div className="text-center">
                  <p className="text-xl font-bold text-primary">{activeCount}</p>
                  <p className="text-xs text-gray-500">Active</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-700">{soldCount}</p>
                  <p className="text-xs text-gray-500">Sold</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-700">{savedListingsDetails.length}</p>
                  <p className="text-xs text-gray-500">Saved</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="flex border-b">
            {['listings', 'saved'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 font-medium capitalize transition-colors ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-gray-900'}`}
              >
                {tab === 'listings' ? `My Listings (${myListings.length})` : `Saved (${savedListingsDetails.length})`}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* My Listings Tab */}
            {activeTab === 'listings' && (
              <div>
                {myListings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings yet</h3>
                    <p className="text-gray-600 mb-4">Post your first material to get started</p>
                    <button onClick={() => navigate('/post')} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                      Post Material
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myListings.map(listing => (
                      <div key={listing.id} className="border rounded-lg overflow-hidden">
                        <img
                          src={listing.photos?.[0] || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400'}
                          alt={listing.title}
                          className="w-full h-40 object-cover"
                        />
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-1">{listing.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{listing.materialType}</p>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-lg font-bold text-primary">₹{listing.price}/{listing.unit}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${listing.status === 'active' ? 'bg-green-100 text-green-800' : listing.status === 'sold' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                              {listing.status?.charAt(0).toUpperCase() + listing.status?.slice(1)}
                            </span>
                          </div>
                          {listing.status === 'active' && timeLeft[listing.id] && (
                            <p className="text-xs text-orange-600 mb-3">
                              ⏱ Expires in {timeLeft[listing.id].days}d {timeLeft[listing.id].hours}h
                            </p>
                          )}
                          <div className="flex gap-2">
                            {listing.status === 'active' && (
                              <button
                                onClick={() => handleMarkAsSold(listing)}
                                className="flex-1 bg-green-100 text-green-700 px-2 py-1.5 rounded text-xs hover:bg-green-200 transition-colors"
                              >
                                Mark Sold
                              </button>
                            )}
                            <button
                              onClick={() => deleteListing(listing.id)}
                              className="flex-1 bg-red-100 text-red-700 px-2 py-1.5 rounded text-xs hover:bg-red-200 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Saved Tab */}
            {activeTab === 'saved' && (
              <div>
                {savedListingsDetails.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved materials yet</h3>
                    <p className="text-gray-600 mb-4">Browse listings and save ones you're interested in</p>
                    <button onClick={() => navigate('/listings')} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                      Browse Materials
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedListingsDetails.map(listing => (
                      <div key={listing.id} className="border rounded-lg overflow-hidden">
                        <img
                          src={listing.photos?.[0] || 'https://images.unsplash.com/photo-1511467687858-ff1cd6b3ff16?w=400'}
                          alt={listing.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-1">{listing.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{listing.materialType}</p>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-lg font-bold text-primary">₹{listing.price}/{listing.unit}</span>
                            <span className={`px-2 py-1 rounded text-xs ${listing.grade === 'A' ? 'bg-green-100 text-green-800' : listing.grade === 'B' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                              Grade {listing.grade}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => navigate(`/listing/${listing.id}`)} className="flex-1 bg-primary text-white px-3 py-2 rounded text-sm hover:bg-orange-600 transition-colors">
                              View
                            </button>
                            <button onClick={() => unsaveListing(listing.id)} className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 transition-colors">
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Floating Post Button */}
        <button
          onClick={() => navigate('/post')}
          className="fixed bottom-6 right-6 bg-primary text-white w-14 h-14 rounded-full shadow-lg hover:bg-orange-600 transition-colors flex items-center justify-center"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Mark as Sold Modal */}
      {showSoldModal && selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mark as Sold</h3>
            <p className="text-gray-600 mb-4">How much quantity was sold from <strong>{selectedListing.title}</strong>?</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity Sold ({selectedListing.unit})
              </label>
              <input
                type="number"
                value={soldQuantity}
                onChange={(e) => setSoldQuantity(e.target.value)}
                placeholder={`Max: ${selectedListing.quantity}`}
                max={selectedListing.quantity}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowSoldModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleConfirmSold}
                disabled={!soldQuantity || soldQuantity <= 0}
                className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile