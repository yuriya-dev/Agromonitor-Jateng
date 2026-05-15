export default function Loading() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header Skeleton */}
      <header className="bg-background border-b-2 border-border-color sticky top-0 z-50 animate-pulse">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="h-8 bg-border-color w-64"></div>
          <div className="h-8 bg-border-color w-32"></div>
        </div>
        <div className="h-10 bg-border-color w-full border-t border-border-color"></div>
      </header>

      {/* Main Content Skeleton */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          
          {/* Left Column Skeleton */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border-2 border-border-color p-6 shadow-brutal h-96">
              <div className="h-4 bg-border-color w-3/4 mb-4"></div>
              <div className="h-10 bg-border-color w-full mb-8"></div>
              
              <div className="space-y-4 mb-8">
                <div className="h-4 bg-border-color w-1/2"></div>
                <div className="h-12 bg-border-color w-3/4"></div>
                <div className="h-6 bg-border-color w-1/2"></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 border-t border-border-color pt-6">
                <div className="h-10 bg-border-color w-full"></div>
                <div className="h-10 bg-border-color w-full"></div>
                <div className="h-10 bg-border-color w-full"></div>
                <div className="h-10 bg-border-color w-full"></div>
              </div>
            </div>
            
            <div className="bg-white border-2 border-border-color p-6 shadow-brutal h-24"></div>
          </div>

          {/* Right Column Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border-2 border-border-color shadow-brutal h-[468px] p-4 flex flex-col">
              <div className="flex justify-between mb-4">
                <div className="h-6 bg-border-color w-1/4"></div>
                <div className="h-6 bg-border-color w-1/4"></div>
              </div>
              <div className="flex-1 bg-border-color w-full"></div>
            </div>
            
            <div className="bg-white border-2 border-border-color shadow-brutal h-48 p-6">
              <div className="h-6 bg-border-color w-1/3 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-border-color w-full"></div>
                <div className="h-4 bg-border-color w-full"></div>
                <div className="h-4 bg-border-color w-3/4"></div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
