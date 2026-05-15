export default function Loading() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header Skeleton */}
      <header className="bg-background border-b-2 border-border-color sticky top-0 z-50 animate-pulse">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="h-8 bg-border-color w-48"></div>
          <div className="h-10 bg-border-color w-64 hidden md:block"></div>
        </div>
        <div className="h-10 bg-border-color w-full border-t border-border-color"></div>
      </header>

      {/* Main Content Skeleton */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
          <div className="flex justify-between items-end border-b-2 border-border-color pb-4">
            <div className="space-y-2">
              <div className="h-10 bg-border-color w-64"></div>
              <div className="h-4 bg-border-color w-96"></div>
            </div>
            <div className="flex space-x-2">
              <div className="h-8 bg-border-color w-20"></div>
              <div className="h-8 bg-border-color w-20"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white border-2 border-border-color h-40 shadow-brutal p-4 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="h-6 bg-border-color w-1/2"></div>
                  <div className="h-6 bg-border-color w-16"></div>
                </div>
                <div className="flex items-end justify-between mt-4">
                  <div className="space-y-2">
                    <div className="h-8 bg-border-color w-32"></div>
                    <div className="h-4 bg-border-color w-24"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
