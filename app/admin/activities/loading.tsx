export default function AdminActivitiesLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="h-8 bg-slate-200 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-slate-200 rounded w-96 animate-pulse"></div>
        </div>

        {/* Stats Cards Loading */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-slate-200 rounded animate-pulse"></div>
                <div>
                  <div className="h-6 bg-slate-200 rounded w-12 mb-1 animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded w-20 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters Loading */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
          <div className="h-6 bg-slate-200 rounded w-32 mb-4 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-slate-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Table Loading */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-16 bg-slate-100 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
