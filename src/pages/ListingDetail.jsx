import { useParams, useNavigate } from 'react-router-dom';
import { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';

export default function ListingDetail() {
  const { id } = useParams();
  const { listings } = useContext(AppContext);
  const [showOffer, setShowOffer] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const listing = listings.find(l => l.id === parseInt(id));

  if (!listing) return <div className="p-8 text-center">Listing not found</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <img src={listing.photos[0]} alt={listing.title} className="w-full h-64 object-cover rounded-xl mb-4" />
      <h1 className="text-2xl font-bold mb-1">{listing.title}</h1>
      {/* Savings Box */}
      {listing.marketPrice && listing.marketPrice > listing.price && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
          <h3 className="text-lg font-semibold text-green-800 mb-3">💰 Savings Calculator</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Market Price:</p>
              <p className="text-lg font-bold text-gray-900">₹{listing.marketPrice}/{listing.unit}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">ReStack Price:</p>
              <p className="text-lg font-bold text-orange-500">₹{listing.price}/{listing.unit}</p>
            </div>
          </div>
          <div className="border-t pt-3">
            <p className="text-sm text-gray-600 mb-2">You Save:</p>
            <p className="text-2xl font-bold text-green-600">₹{listing.marketPrice - listing.price} per {listing.unit}</p>
          </div>
          <div className="border-t pt-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How many {listing.unit} do you need?
            </label>
            <input
              type="number"
              placeholder="Enter quantity"
              className="w-full border rounded-lg px-3 py-2"
              onChange={(e) => {
                const quantity = parseInt(e.target.value) || 0;
                const totalSavings = (listing.marketPrice - listing.price) * quantity;
                const savingsDisplay = document.getElementById('total-savings');
                if (savingsDisplay) {
                  savingsDisplay.textContent = `Total Savings: ₹${totalSavings.toLocaleString()}`;
                }
              }}
            />
            <p id="total-savings" className="text-lg font-bold text-green-600 mt-2">Total Savings: ₹0</p>
          </div>
        </div>
      )}

      <p className="mb-1">Grade: {listing.grade} — {listing.gradeLabel}</p>
      <p className="mb-1">Quantity: {listing.quantity} {listing.unit}</p>
      <p className="mb-1">Location: {listing.location}</p>
      <p className="mb-1">Distance: {listing.distanceKm} km · {listing.estimatedTravelTime}</p>
      <p className="mb-1">Transport: {listing.transportHint}</p>
      <div style={{background:'#f0f0f0', padding:'12px', borderRadius:'8px', marginBottom:'16px'}}>
        <p style={{fontWeight:'bold'}}>Trust Score: 80%</p>
        <p style={{color:'green'}}>✅ Phone Verified · {listing.totalSuccessfulSales || 12} Successful Sales</p>
        {listing.isRepeatSeller && <p style={{color:'blue'}}>🏅 Repeat Seller</p>}
      </div>
      <a href={"tel:" + listing.sellerPhone} className="block w-full bg-orange-500 text-white text-center py-3 rounded-xl mb-2 font-bold">Call Seller</a>
      <a href={"https://wa.me/91" + listing.sellerPhone} className="block w-full bg-green-500 text-white text-center py-3 rounded-xl mb-2 font-bold">WhatsApp Seller</a>
      {listing.negotiable && (
        <button onClick={() => setShowOffer(!showOffer)} className="block w-full bg-blue-500 text-white text-center py-3 rounded-xl mb-2 font-bold">Make an Offer</button>
      )}
      {showOffer && (
        <div className="border rounded-xl p-4 mb-4">
          <p className="font-bold mb-2">Your Offer</p>
          <input type="number" placeholder="Enter offer price ₹" value={offerPrice} onChange={e => setOfferPrice(e.target.value)} className="w-full border rounded-lg px-3 py-2 mb-2" />
          <a href={"https://wa.me/91" + listing.sellerPhone + "?text=Hi, I want to offer ₹" + offerPrice + " for " + listing.title + " on ReStack"} className="block w-full bg-green-500 text-white text-center py-2 rounded-lg font-bold">Send Offer via WhatsApp</a>
        </div>
      )}
    </div>
  );
}
