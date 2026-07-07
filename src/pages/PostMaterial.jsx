import { useState, useRef, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { supabase } from '../utils/supabaseClient'

const PostMaterial = () => {
  const navigate = useNavigate()
  const { addListing, currentUser } = useContext(AppContext)
  const fileInputRef = useRef(null)

  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errors, setErrors] = useState({})
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const [formData, setFormData] = useState({
    materialType: '',
    customName: '',
    totalQuantity: '',
    unit: 'bags',
    minQuantity: '',
    price: '',
    negotiable: false,
    urgent: false,
    grade: '',
    conditionDescription: '',
    photos: [],
    location: '',
    city: '',
    pincode: '',
    duration: '30',
    lat: null,
    lng: null,
  })

  const materialTypes = [
    'Cement', 'Bricks', 'Steel', 'Sand', 'Tiles',
    'Wood', 'PVC Pipes', 'Roofing Sheets', 'Glass', 'Other'
  ]

  const units = ['bags', 'kg', 'tonnes', 'pieces', 'sqft', 'metres']

  const gradeOptions = [
    { grade: 'A', label: 'Unused / Factory fresh', color: 'green', description: 'Brand new, unused materials in perfect condition' },
    { grade: 'B', label: 'Slightly used, intact', color: 'yellow', description: 'Previously used but in good, functional condition' },
    { grade: 'C', label: 'Scrap / Reusable', color: 'red', description: 'Used materials that can be recycled or repurposed' }
  ]

  const validateStep1 = () => {
    const newErrors = {}
    if (!formData.materialType) newErrors.materialType = 'Please select material type'
    if (!formData.customName) newErrors.customName = 'Please enter material name'
    if (!formData.totalQuantity) newErrors.totalQuantity = 'Please enter total quantity'
    if (!formData.minQuantity) newErrors.minQuantity = 'Please enter minimum quantity'
    if (!formData.price) newErrors.price = 'Please enter price'
    if (!formData.grade) newErrors.grade = 'Please select condition grade'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors = {}
    if (formData.photos.length === 0) newErrors.photos = 'Please upload at least one photo'
    if (!formData.location) newErrors.location = 'Please enter location'
    if (!formData.city) newErrors.city = 'Please enter city'
    if (!formData.pincode) newErrors.pincode = 'Please enter pincode'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  // Upload photo to Supabase Storage, store public URL
  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (formData.photos.length + files.length > 5) {
      alert('Maximum 5 photos allowed')
      return
    }
    setUploadingPhoto(true)
    for (const file of files) {
      const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`
      const { error } = await supabase.storage
        .from('listing-photos')
        .upload(fileName, file)

      if (error) {
        console.error('Photo upload error:', error)
        continue
      }

      const { data } = supabase.storage
        .from('listing-photos')
        .getPublicUrl(fileName)

      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, data.publicUrl]
      }))
    }
    setUploadingPhoto(false)
  }

  // Drag and drop — also uploads to Supabase
  const handleDrop = async (e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    if (formData.photos.length + files.length > 5) {
      alert('Maximum 5 photos allowed')
      return
    }
    setUploadingPhoto(true)
    for (const file of files) {
      const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`
      const { error } = await supabase.storage
        .from('listing-photos')
        .upload(fileName, file)
      if (error) { console.error(error); continue }
      const { data } = supabase.storage.from('listing-photos').getPublicUrl(fileName)
      setFormData(prev => ({ ...prev, photos: [...prev.photos, data.publicUrl] }))
    }
    setUploadingPhoto(false)
  }

  const handleDragOver = (e) => e.preventDefault()

  const removePhoto = async (index) => {
    const url = formData.photos[index]
    // Extract filename from URL and delete from storage
    const fileName = url.split('/listing-photos/')[1]
    if (fileName) {
      await supabase.storage.from('listing-photos').remove([fileName])
    }
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }))
  }

  // Auto-detect location — stores real lat/lng
  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported by your browser.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setFormData(prev => ({
          ...prev,
          location: 'Detected location',
          city: 'Bangalore',
          pincode: '',
          lat: latitude,
          lng: longitude,
        }))
      },
      () => alert('Unable to detect location. Please enter manually.')
    )
  }

// Geocode manually entered pincode/city to get lat/lng
  const geocodeLocation = async () => {
    if (!formData.pincode) return
    try {
      const query = `${formData.pincode}, ${formData.city}, India`
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      )
      const results = await res.json()
      if (results.length > 0) {
        setFormData(prev => ({
          ...prev,
          lat: parseFloat(results[0].lat),
          lng: parseFloat(results[0].lon),
        }))
      }
    } catch (err) {
      console.error('Geocoding failed:', err)
    }
  }

  const nextStep = () => {
    if (currentStep === 1 && !validateStep1()) return
    if (currentStep === 2 && !validateStep2()) return
    setCurrentStep(prev => prev + 1)
  }

  const prevStep = () => setCurrentStep(prev => prev - 1)

  // Submit — calls real Supabase addListing from context
  const handleSubmit = async () => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    setIsSubmitting(true)

    const durationDays = parseInt(formData.duration) || 30
    const result = await addListing({
      title: formData.customName,
      materialType: formData.materialType,
      quantity: parseFloat(formData.totalQuantity),
      unit: formData.unit,
      minQuantity: parseFloat(formData.minQuantity),
      price: parseFloat(formData.price),
      negotiable: formData.negotiable,
      urgent: formData.urgent,
      grade: formData.grade,
      gradeLabel: gradeOptions.find(g => g.grade === formData.grade)?.label || '',
      conditionDescription: formData.conditionDescription,
      photos: formData.photos,
      location: `${formData.location}, ${formData.city} - ${formData.pincode}`,
      lat: formData.lat || null,
      lng: formData.lng || null,
      transportHint: 'truck',
      estimatedTravelTime: '',
    })

    setIsSubmitting(false)
    if (result) setShowSuccess(true)
  }

  // Success screen
  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Listing Posted Successfully!</h2>
          <p className="text-green-700 mb-6">Your material is now live on ReStack and visible to buyers nearby.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => navigate('/listings')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              View All Listings
            </button>
            <button
              onClick={() => { setShowSuccess(false); setCurrentStep(1); setFormData({ materialType: '', customName: '', totalQuantity: '', unit: 'bags', minQuantity: '', price: '', negotiable: false, urgent: false, grade: '', conditionDescription: '', photos: [], location: '', city: '', pincode: '', duration: '30', lat: null, lng: null }) }}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Post Another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Post a Material</h1>
        <p className="text-gray-600 mb-6">List your surplus construction materials for buyers near you</p>

        {/* Step indicator */}
        <div className="flex items-center mb-8">
          {[1, 2, 3].map((step, i) => (
            <div key={step} className="flex items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep >= step ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step}
              </div>
              <span className={`ml-2 text-sm font-medium ${currentStep >= step ? 'text-primary' : 'text-gray-400'}`}>
                {step === 1 ? 'Details' : step === 2 ? 'Photos & Location' : 'Review'}
              </span>
              {i < 2 && <div className={`flex-1 h-0.5 mx-3 ${currentStep > step ? 'bg-primary' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1 — Material Details */}
        {currentStep === 1 && (
          <div className="bg-white rounded-lg shadow-md p-6 space-y-5">
            <h2 className="text-xl font-semibold text-gray-900">Material Details</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Material Type *</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {materialTypes.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleInputChange('materialType', type)}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${formData.materialType === type ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {errors.materialType && <p className="mt-1 text-sm text-red-600">{errors.materialType}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Material Name *</label>
              <input
                type="text"
                value={formData.customName}
                onChange={(e) => handleInputChange('customName', e.target.value)}
                placeholder="e.g. UltraTech Cement Grade 53"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.customName ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.customName && <p className="mt-1 text-sm text-red-600">{errors.customName}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Quantity *</label>
                <input
                  type="number"
                  value={formData.totalQuantity}
                  onChange={(e) => handleInputChange('totalQuantity', e.target.value)}
                  placeholder="500"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.totalQuantity ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.totalQuantity && <p className="mt-1 text-sm text-red-600">{errors.totalQuantity}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                <select
                  value={formData.unit}
                  onChange={(e) => handleInputChange('unit', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {units.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Order Qty *</label>
                <input
                  type="number"
                  value={formData.minQuantity}
                  onChange={(e) => handleInputChange('minQuantity', e.target.value)}
                  placeholder="50"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.minQuantity ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.minQuantity && <p className="mt-1 text-sm text-red-600">{errors.minQuantity}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price per {formData.unit} (₹) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="380"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
              </div>
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.negotiable} onChange={(e) => handleInputChange('negotiable', e.target.checked)} className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-gray-700">Price Negotiable</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.urgent} onChange={(e) => handleInputChange('urgent', e.target.checked)} className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-gray-700">Urgent Sale</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Condition Grade *</label>
              <div className="space-y-2">
                {gradeOptions.map(({ grade, label, color, description }) => (
                  <div
                    key={grade}
                    onClick={() => handleInputChange('grade', grade)}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${formData.grade === grade ? `border-${color}-500 bg-${color}-50` : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-${color}-600`}>Grade {grade}</span>
                      <span className="text-sm text-gray-700">— {label}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{description}</p>
                  </div>
                ))}
              </div>
              {errors.grade && <p className="mt-1 text-sm text-red-600">{errors.grade}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Condition Description</label>
              <textarea
                value={formData.conditionDescription}
                onChange={(e) => handleInputChange('conditionDescription', e.target.value)}
                placeholder="Describe the material condition, storage details, any defects..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button onClick={nextStep} className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
              Next Step →
            </button>
          </div>
        )}

        {/* Step 2 — Photos & Location */}
        {currentStep === 2 && (
          <div className="bg-white rounded-lg shadow-md p-6 space-y-5">
            <h2 className="text-xl font-semibold text-gray-900">Photos & Location</h2>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos * ({formData.photos.length}/5)
              </label>
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              >
                {uploadingPhoto ? (
                  <p className="text-gray-500">Uploading...</p>
                ) : (
                  <>
                    <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500 text-sm">Drag & drop or click to upload photos</p>
                    <p className="text-gray-400 text-xs mt-1">Max 5 photos</p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
              {errors.photos && <p className="mt-1 text-sm text-red-600">{errors.photos}</p>}

              {formData.photos.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img src={photo} alt={`Photo ${index + 1}`} className="w-20 h-20 object-cover rounded-lg" />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Area / Locality *</label>
              <button
                type="button"
                onClick={detectLocation}
                className="w-full mb-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                📍 Auto-detect Location
              </button>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g. Whitefield"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Bangalore"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                  onBlur={geocodeLocation} 
                  placeholder="560066"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.pincode ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.pincode && <p className="mt-1 text-sm text-red-600">{errors.pincode}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Listing Duration</label>
              <div className="flex gap-3">
                {['7', '14', '30'].map(days => (
                  <label key={days} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value={days}
                      checked={formData.duration === days}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-sm font-medium text-gray-700">{days} days</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={prevStep} className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                ← Previous
              </button>
              <button onClick={nextStep} className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                Next Step →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Review & Post */}
        {currentStep === 3 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Review & Post</h2>

            <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Material Details</h4>
                  <div className="space-y-2 text-sm">
                    {[
                      ['Type', formData.materialType],
                      ['Name', formData.customName],
                      ['Quantity', `${formData.totalQuantity} ${formData.unit}`],
                      ['Min Order', `${formData.minQuantity} ${formData.unit}`],
                      ['Price', `₹${formData.price}/${formData.unit}`],
                      ['Negotiable', formData.negotiable ? 'Yes' : 'No'],
                      ['Urgent', formData.urgent ? 'Yes' : 'No'],
                      ['Grade', `Grade ${formData.grade}`],
                    ].map(([key, val]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-500">{key}:</span>
                        <span className="font-medium">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Location</h4>
                  <div className="space-y-2 text-sm">
                    {[
                      ['Area', formData.location],
                      ['City', formData.city],
                      ['Pincode', formData.pincode],
                      ['Duration', `${formData.duration} days`],
                      ['GPS', formData.lat ? '✅ Captured' : '❌ Not captured'],
                    ].map(([key, val]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-500">{key}:</span>
                        <span className="font-medium">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {formData.conditionDescription && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Description</h4>
                  <p className="text-sm text-gray-600">{formData.conditionDescription}</p>
                </div>
              )}

              {formData.photos.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Photos ({formData.photos.length})</h4>
                  <div className="flex gap-2">
                    {formData.photos.map((photo, i) => (
                      <img key={i} src={photo} alt={`Photo ${i + 1}`} className="w-16 h-16 object-cover rounded" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mb-4">
              <button onClick={() => setCurrentStep(1)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                Edit Details
              </button>
              <button onClick={() => setCurrentStep(2)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                Edit Photos
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-primary text-white py-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Posting...' : '🚀 Post Listing'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default PostMaterial