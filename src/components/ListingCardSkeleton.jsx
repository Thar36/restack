const ListingCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Image skeleton */}
      <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
      
      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          {/* Title skeleton */}
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-2 w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
          </div>
          
          {/* Price skeleton */}
          <div className="h-8 bg-gray-200 rounded animate-pulse w-20"></div>
        </div>
        
        {/* Details skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4"></div>
        </div>
        
        {/* Location skeleton */}
        <div className="flex items-center text-sm text-gray-600">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-4 mr-2"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-8"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
        </div>
        
        {/* Action buttons skeleton */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

export default ListingCardSkeleton
