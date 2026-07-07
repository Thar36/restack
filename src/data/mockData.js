export const categories = [
  { id: 'cement', name: 'Cement', icon: '🏗️' },
  { id: 'steel', name: 'Steel', icon: '🔧' },
  { id: 'bricks', name: 'Bricks', icon: '🧱' },
  { id: 'wood', name: 'Wood', icon: '🪵' },
  { id: 'paints', name: 'Paints', icon: '🎨' },
  { id: 'pipes', name: 'Pipes', icon: '🔧' },
  { id: 'electrical', name: 'Electrical', icon: '⚡' },
  { id: 'tools', name: 'Tools', icon: '🔨' },
  { id: 'other', name: 'Other', icon: '📦' }
]

export const conditions = [
  { id: 'new', name: 'New', color: 'green' },
  { id: 'like-new', name: 'Like New', color: 'blue' },
  { id: 'good', name: 'Good', color: 'yellow' },
  { id: 'fair', name: 'Fair', color: 'orange' },
  { id: 'used', name: 'Used', color: 'red' }
]

export const locations = [
  'Mumbai, Maharashtra',
  'Delhi, NCR',
  'Bangalore, Karnataka',
  'Chennai, Tamil Nadu',
  'Kolkata, West Bengal',
  'Hyderabad, Telangana',
  'Pune, Maharashtra',
  'Ahmedabad, Gujarat',
  'Jaipur, Rajasthan',
  'Lucknow, Uttar Pradesh'
]

export const sampleListings = [
  {
    id: 1,
    title: 'Premium Cement Grade 53',
    category: 'cement',
    brand: 'UltraTech',
    condition: 'new',
    price: 350,
    quantity: 100,
    unit: 'bags',
    description: 'Premium quality UltraTech Cement Grade 53 suitable for all types of construction work.',
    location: 'Mumbai, Maharashtra',
    sellerName: 'John Construction',
    sellerPhone: '+91 98765 43210',
    sellerEmail: 'john@example.com',
    sellerRating: 4.8,
    sellerReviews: 127,
    images: ['cement1.jpg', 'cement2.jpg'],
    createdAt: new Date().toISOString(),
    status: 'active'
  },
  {
    id: 2,
    title: 'TATA TMT Steel Bars',
    category: 'steel',
    brand: 'TATA',
    condition: 'new',
    price: 45000,
    quantity: 1,
    unit: 'ton',
    description: 'High quality TATA TMT steel bars for construction. Available in various diameters.',
    location: 'Delhi, NCR',
    sellerName: 'Steel Suppliers',
    sellerPhone: '+91 98765 43211',
    sellerEmail: 'steel@example.com',
    sellerRating: 4.6,
    sellerReviews: 89,
    images: ['steel1.jpg', 'steel2.jpg'],
    createdAt: new Date().toISOString(),
    status: 'active'
  },
  {
    id: 3,
    title: 'Clay Bricks',
    category: 'bricks',
    brand: 'Local',
    condition: 'good',
    price: 8,
    quantity: 5000,
    unit: 'pieces',
    description: 'High quality clay bricks suitable for wall construction. Good condition, slightly used.',
    location: 'Bangalore, Karnataka',
    sellerName: 'Brick House',
    sellerPhone: '+91 98765 43212',
    sellerEmail: 'bricks@example.com',
    sellerRating: 4.5,
    sellerReviews: 64,
    images: ['bricks1.jpg', 'bricks2.jpg'],
    createdAt: new Date().toISOString(),
    status: 'active'
  }
]
