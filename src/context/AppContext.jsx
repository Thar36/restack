import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'

export const AppContext = createContext()

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}

export const AppProvider = ({ children }) => {
  const [listings, setListings] = useState([])
  const [requirementsList, setRequirementsList] = useState([])
  const [currentUser, setCurrentUserState] = useState(null)
  const [savedListings, setSavedListings] = useState([])
  const [loading, setLoading] = useState(true)

  // Helper: convert Supabase snake_case listing to your camelCase format
  const formatListing = (l) => ({
    id: l.id,
    title: l.title,
    materialType: l.material_type,
    quantity: l.quantity,
    originalQuantity: l.original_quantity,
    minQuantity: l.min_quantity,
    unit: l.unit,
    price: l.price,
    negotiable: l.negotiable,
    urgent: l.urgent,
    grade: l.grade,
    gradeLabel: l.grade_label,
    conditionDescription: l.condition_description,
    photos: l.photos || [],
    sellerName: l.seller_name,
    sellerPhone: l.seller_phone,
    phoneVerified: l.phone_verified,
    totalSuccessfulSales: l.total_successful_sales,
    isRepeatSeller: l.is_repeat_seller,
    sellerRating: l.seller_rating,
    sellerTotalDeals: l.seller_total_deals,
    location: l.location,
    lat: l.lat,
    lng: l.lng,
    transportHint: l.transport_hint,
    estimatedTravelTime: l.estimated_travel_time,
    status: l.status,
    postedAt: l.posted_at,
    expiresAt: l.expires_at,
  })

  // Helper: convert Supabase requirement to camelCase
  const formatRequirement = (r) => ({
    id: r.id,
    materialType: r.material_type,
    subCategory: r.sub_category,
    quantity: r.quantity,
    unit: r.unit,
    minBudget: r.min_budget,
    maxBudget: r.max_budget,
    location: r.location,
    lat: r.lat,
    lng: r.lng,
    urgency: r.urgency,
    contact: r.contact,
    note: r.note,
    status: r.status,
    postedAt: r.posted_at,
  })

  // Load session + data on mount
  useEffect(() => {
    const init = async () => {
      // Check existing session
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setCurrentUserState(profile ? { ...session.user, ...profile } : session.user)

        // Load saved listings for this user
        const { data: saved } = await supabase
          .from('saved_listings')
          .select('listing_id')
          .eq('user_id', session.user.id)
        if (saved) setSavedListings(saved.map(s => s.listing_id))
      }

      // Fetch listings
      const { data: listingsData } = await supabase
        .from('listings')
        .select('*')
        .order('posted_at', { ascending: false })
      if (listingsData) setListings(listingsData.map(formatListing))

      // Fetch requirements
      const { data: reqData } = await supabase
        .from('requirements')
        .select('*')
        .order('posted_at', { ascending: false })
      if (reqData) setRequirementsList(reqData.map(formatRequirement))

      setLoading(false)
    }

    init()

    // Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setCurrentUserState(profile ? { ...session.user, ...profile } : session.user)
      } else {
        setCurrentUserState(null)
        setSavedListings([])
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Add new listing
  const addListing = async (listingData) => {
    const { data, error } = await supabase
      .from('listings')
      .insert([{
        seller_id: currentUser?.id || null,
        title: listingData.title,
        material_type: listingData.materialType,
        quantity: listingData.quantity,
        original_quantity: listingData.quantity,
        min_quantity: listingData.minQuantity,
        unit: listingData.unit,
        price: listingData.price,
        negotiable: listingData.negotiable || false,
        urgent: listingData.urgent || false,
        grade: listingData.grade,
        grade_label: listingData.gradeLabel,
        condition_description: listingData.conditionDescription,
        photos: listingData.photos || [],
        seller_name: currentUser?.name || 'Anonymous',
        seller_phone: currentUser?.phone || '',
        phone_verified: false,
        location: listingData.location,
        lat: listingData.lat || null,
        lng: listingData.lng || null,
        transport_hint: listingData.transportHint,
        estimated_travel_time: listingData.estimatedTravelTime,
      }])
      .select()
      .single()

    if (error) { console.error(error); return null }
    const formatted = formatListing(data)
    setListings(prev => [formatted, ...prev])
    return formatted
  }

  // Add requirement (was missing before — fixed!)
  const addRequirement = async (reqData) => {
    const { data, error } = await supabase
      .from('requirements')
      .insert([{
        buyer_id: currentUser?.id || null,
        material_type: reqData.materialType,
        sub_category: reqData.subCategory,
        quantity: reqData.quantity,
        unit: reqData.unit,
        min_budget: reqData.minBudget,
        max_budget: reqData.maxBudget,
        location: reqData.location,
        lat: reqData.lat || null,
        lng: reqData.lng || null,
        urgency: reqData.urgency,
        contact: reqData.contact,
        note: reqData.note,
      }])
      .select()
      .single()

    if (error) { console.error(error); return null }
    const formatted = formatRequirement(data)
    setRequirementsList(prev => [formatted, ...prev])
    return formatted
  }

  // Save / unsave listing
  const saveListing = async (listingId) => {
    if (!currentUser) return false
    await supabase.from('saved_listings').insert([{ user_id: currentUser.id, listing_id: listingId }])
    setSavedListings(prev => [...prev, listingId])
    return true
  }

  const unsaveListing = async (listingId) => {
    if (!currentUser) return false
    await supabase.from('saved_listings').delete()
      .eq('user_id', currentUser.id)
      .eq('listing_id', listingId)
    setSavedListings(prev => prev.filter(id => id !== listingId))
    return true
  }

  const isListingSaved = (listingId) => savedListings.includes(listingId)

  // Mark as sold
  const markAsSold = async (listingId) => {
    await supabase.from('listings').update({ status: 'sold' }).eq('id', listingId)
    setListings(prev => prev.map(l => l.id === listingId ? { ...l, status: 'sold' } : l))
    return true
  }

  // Delete listing
  const deleteListing = async (listingId) => {
    await supabase.from('listings').delete().eq('id', listingId)
    setListings(prev => prev.filter(l => l.id !== listingId))
    return true
  }

  // Update listing
  const updateListing = async (listingId, updates) => {
    await supabase.from('listings').update(updates).eq('id', listingId)
    setListings(prev => prev.map(l => l.id === listingId ? { ...l, ...updates } : l))
    return true
  }

  // Logout
  const logout = async () => {
    await supabase.auth.signOut()
    setCurrentUserState(null)
    setSavedListings([])
  }

  const getUserListings = () => {
    if (!currentUser) return []
    return listings.filter(l => l.sellerPhone === currentUser.phone)
  }

  const getSavedListingsData = () => listings.filter(l => savedListings.includes(l.id))

  const setCurrentUser = (userData) => setCurrentUserState(userData)

  const value = {
    listings,
    requirementsList,
    currentUser,
    savedListings,
    loading,
    addListing,
    addRequirement,
    saveListing,
    unsaveListing,
    isListingSaved,
    markAsSold,
    deleteListing,
    updateListing,
    logout,
    setCurrentUser,
    getUserListings,
    getSavedListingsData,
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}