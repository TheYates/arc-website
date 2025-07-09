export default function CaregiverPatientsLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="h-16 bg-white border-b border-slate-200 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="h-8 w-32 bg-slate-200 rounded"></div>
          <div className="h-8 w-24 bg-slate-200 rounded"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="h-8 w-48 bg-slate-200 rounded mb-2 animate-pulse"></div>
          <div className="h-4 w-80 bg-slate-200 rounded animate-pulse"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-slate-200 p-6 animate-pulse">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-slate-200 rounded"></div>
                <div>
                  <div className="h-6 w-12 bg-slate-200 rounded mb-1"></div>
                  <div className="h-4 w-16 bg-slate-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters Skeleton */}
        <div className="bg-white rounded-lg border border-slate-200 mb-8 animate-pulse">
          <div className="p-6">
            <div className="h-6 w-48 bg-slate-200 rounded mb-4"></div>
            <div className="flex space-x-4">
              <div className="flex-1 h-10 bg-slate-200 rounded"></div>
              <div className="h-10 w-32 bg-slate-200 rounded"></div>
              <div className="h-10 w-32 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>

        {/* Patient Cards Skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-slate-200 p-6 animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-slate-200 rounded-full"></div>
                  <div>
                    <div className="h-5 w-32 bg-slate-200 rounded mb-1"></div>
                    <div className="h-4 w-24 bg-slate-200 rounded"></div>
                  </div>
                </div>
                <div className="h-6 w-16 bg-slate-200 rounded"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 w-full bg-slate-200 rounded"></div>
                <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
                <div className="h-4 w-1/2 bg-slate-200 rounded"></div>
              </div>
              <div className="flex space-x-2 mt-4">
                <div className="h-8 w-24 bg-slate-200 rounded"></div>
                <div className="h-8 w-20 bg-slate-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
