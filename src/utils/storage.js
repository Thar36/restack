// Local Storage utilities for ReStack

export const storage = {
  // Listings
  getListings: () => {
    const listings = localStorage.getItem('listings')
    return listings ? JSON.parse(listings) : []
  },

  saveListings: (listings) => {
    localStorage.setItem('listings', JSON.stringify(listings))
  },

  addListing: (listing) => {
    const listings = storage.getListings()
    const newListing = {
      ...listing,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      status: 'active'
    }
    listings.push(newListing)
    storage.saveListings(listings)
    return newListing
  },

  updateListing: (id, updates) => {
    const listings = storage.getListings()
    const index = listings.findIndex(listing => listing.id === id)
    if (index !== -1) {
      listings[index] = { ...listings[index], ...updates }
      storage.saveListings(listings)
      return listings[index]
    }
    return null
  },

  deleteListing: (id) => {
    const listings = storage.getListings()
    const filteredListings = listings.filter(listing => listing.id !== id)
    storage.saveListings(filteredListings)
    return filteredListings.length < listings.length
  },

  // Users
  getCurrentUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  saveUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user))
  },

  logout: () => {
    localStorage.removeItem('user')
  },

  // Orders
  getOrders: () => {
    const orders = localStorage.getItem('orders')
    return orders ? JSON.parse(orders) : []
  },

  addOrder: (order) => {
    const orders = storage.getOrders()
    const newOrder = {
      ...order,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      status: 'pending'
    }
    orders.push(newOrder)
    localStorage.setItem('orders', JSON.stringify(orders))
    return newOrder
  },

  // Reviews
  getReviews: () => {
    const reviews = localStorage.getItem('reviews')
    return reviews ? JSON.parse(reviews) : []
  },

  addReview: (review) => {
    const reviews = storage.getReviews()
    const newReview = {
      ...review,
      id: Date.now(),
      createdAt: new Date().toISOString()
    }
    reviews.push(newReview)
    localStorage.setItem('reviews', JSON.stringify(reviews))
    return newReview
  }
}
