export default function AdminReportsLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="h-8 bg-slate-200 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-slate-200 rounded w-96 animate-pulse"></div>
        </div>

        {/* Stats Cards Loading */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-24 animate-pulse"></div>
                  <div className="h-8 bg-slate-200 rounded w-16 animate-pulse"></div>
                  <div className="h-3 bg-slate-200 rounded w-20 animate-pulse"></div>
                </div>
                <div className="h-12 w-12 bg-slate-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Navigation Loading */}
        <div className="mb-8">
          <div className="border-b border-slate-200">
            <div className="flex space-x-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-8 bg-slate-200 rounded w-20 animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Loading */}
        <div className="grid lg:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="h-6 bg-slate-200 rounded w-32 mb-4 animate-pulse"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-4 bg-slate-100 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
