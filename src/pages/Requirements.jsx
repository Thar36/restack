import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

export default function Requirements() {
  const { requirementsList } = useContext(AppContext);
  const navigate = useNavigate();

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'Today': return 'bg-red-100 text-red-700';
      case '3 days': return 'bg-orange-100 text-orange-700';
      case '1 week': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Contractor Requirements</h1>
        <button
          onClick={() => navigate('/post-requirement')}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600"
        >
          + Post Requirement
        </button>
      </div>

      {(!requirementsList || requirementsList.length === 0) ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">📋</p>
          <p className="text-gray-500 text-lg mb-4">No requirements posted yet</p>
          <button
            onClick={() => navigate('/post-requirement')}
            className="bg-orange-500 text-white px-6 py-2 rounded-xl"
          >
            Post First Requirement
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {requirementsList.map(req => (
            <div key={req.id} className="border rounded-xl p-5 bg-white hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="font-bold text-lg">{req.materialType}</h2>
                  {req.subCategory && <p className="text-gray-500 text-sm">{req.subCategory}</p>}
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${getUrgencyColor(req.urgency)}`}>
                  ⏱ {req.urgency}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
                <div>
                  <p className="text-gray-400">Quantity</p>
                  <p className="font-semibold">{req.quantity} {req.unit}</p>
                </div>
                <div>
                  <p className="text-gray-400">Budget</p>
                  <p className="font-semibold">₹{req.minBudget} – ₹{req.maxBudget}</p>
                </div>
                <div>
                  <p className="text-gray-400">Location</p>
                  <p className="font-semibold">{req.location || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Posted</p>
                  <p className="font-semibold">{new Date(req.postedAt).toLocaleDateString()}</p>
                </div>
              </div>

              {req.note && (
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 mb-4">
                  📝 {req.note}
                </p>
              )}

              <button
                onClick={() => {
                  const msg = `Hi, I saw your requirement on ReStack for ${req.materialType} (${req.quantity} ${req.unit}). I can supply this within your budget of ₹${req.minBudget}–₹${req.maxBudget}. Let's connect!`;
                  window.open(`https://wa.me/${req.contact}?text=${encodeURIComponent(msg)}`, '_blank');
                }}
                className="w-full bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors"
              >
                ✅ I Can Supply This → WhatsApp
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}