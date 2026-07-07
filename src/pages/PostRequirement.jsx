import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

export default function PostRequirement() {
  const navigate = useNavigate();
  const { addRequirement } = useContext(AppContext);
  const [formData, setFormData] = useState({
    materialType: '',
    subCategory: '',
    quantity: '',
    unit: 'pieces',
    minBudget: '',
    maxBudget: '',
    location: '',
    urgency: 'Flexible',
    contact: '',
    note: '',
    lat: null,   
    lng: null,
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const materialTypes = [
    'Cement', 'Bricks', 'Steel', 'Sand', 'Tiles', 
    'Wood', 'PVC Pipes', 'Roofing Sheets', 'Glass', 'Other'
  ];

  const materialCategories = {
    'Cement': ['OPC 53 Grade', 'PPC', 'White Cement'],
    'Steel': ['TMT Fe500', 'Scrap Steel', 'MS Plates'],
    'Sand': ['River Sand', 'M-Sand', 'Stone Dust'],
    'Wood': ['Plywood', 'Teak Planks', 'Bamboo', 'Shuttering Ply'],
    'Tiles': ['Floor Tiles', 'Wall Tiles', 'Vitrified', 'Mosaic'],
    'Pipes': ['PVC', 'CPVC', 'GI Pipes', 'Drainage Pipes'],
    'Glass': ['Clear Glass', 'Tinted', 'Tempered']
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.materialType) newErrors.materialType = 'Material type is required';
    if (!formData.quantity) newErrors.quantity = 'Quantity is required';
    if (!formData.minBudget) newErrors.minBudget = 'Minimum budget is required';
    if (!formData.maxBudget) newErrors.maxBudget = 'Maximum budget is required';
    if (!formData.contact) newErrors.contact = 'Contact number is required';
    if (parseInt(formData.minBudget) > parseInt(formData.maxBudget)) {
      newErrors.budget = 'Minimum budget cannot be greater than maximum budget';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const requirementData = {
      ...formData,
      id: Date.now(),
      postedAt: new Date().toISOString(),
      status: 'active',
      lat: formData.lat || null,   // ← add this
      lng: formData.lng || null,   // ← add this
      };

    addRequirement(requirementData);
    setShowSuccess(true);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

 const handleLocationDetect = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          lat: latitude,   
          lng: longitude,  
        }));
      },
      (error) => {
        console.error('Location detection failed:', error);
      }
    );
  }
};

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Requirement Posted Successfully!</h2>
          <p className="text-green-700 mb-6">Your requirement is posted. Sellers will contact you.</p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => navigate('/requirements')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              View All Requirements
            </button>
            <button 
              onClick={() => {
                setShowSuccess(false);
                setFormData({
                  materialType: '',
                  subCategory: '',
                  quantity: '',
                  unit: 'pieces',
                  minBudget: '',
                  maxBudget: '',
                  location: '',
                  urgency: 'Flexible',
                  contact: '',
                  note: ''
                });
              }}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Post Another Requirement
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Post a Requirement</h1>
        <p className="text-gray-600 mb-8">Let sellers know what materials you need for your project</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Material Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material Type *
              </label>
              <select
                value={formData.materialType}
                onChange={(e) => handleInputChange('materialType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select material type</option>
                {materialTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.materialType && <p className="text-red-500 text-sm mt-1">{errors.materialType}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategory
              </label>
              <select
                value={formData.subCategory}
                onChange={(e) => handleInputChange('subCategory', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={!formData.materialType}
              >
                <option value="">Select subcategory</option>
                {materialCategories[formData.materialType]?.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantity and Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity Required *
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Enter quantity"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <select
                  value={formData.unit}
                  onChange={(e) => handleInputChange('unit', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="pieces">Pieces</option>
                  <option value="bags">Bags</option>
                  <option value="tons">Tons</option>
                  <option value="sqft">Sq. Ft.</option>
                  <option value="kg">Kg</option>
                </select>
              </div>
              {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Range (₹) *
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={formData.minBudget}
                  onChange={(e) => handleInputChange('minBudget', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="flex items-center text-gray-500">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={formData.maxBudget}
                  onChange={(e) => handleInputChange('maxBudget', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              {errors.budget && <p className="text-red-500 text-sm mt-1">{errors.budget}</p>}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter location or use auto-detect"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={handleLocationDetect}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                📍 Auto-detect
              </button>
            </div>
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Need Within
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['Today', '3 days', '1 week', 'Flexible'].map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleInputChange('urgency', option)}
                  className={`px-3 py-2 rounded-lg border transition-colors ${
                    formData.urgency === option
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Number *
            </label>
            <input
              type="tel"
              placeholder="Enter your phone number"
              value={formData.contact}
              onChange={(e) => handleInputChange('contact', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.contact && <p className="text-red-500 text-sm mt-1">{errors.contact}</p>}
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note for Sellers (Optional)
            </label>
            <textarea
              placeholder="Add any additional details about your requirement..."
              value={formData.note}
              onChange={(e) => handleInputChange('note', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            Post Requirement
          </button>
        </form>
      </div>
    </div>
  );
}
