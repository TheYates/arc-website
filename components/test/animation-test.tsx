"use client";

export function AnimationTest() {
  return (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-bold">Animation Test</h2>
      
      {/* Simple CSS Animation Test */}
      <div className="border-2 border-red-500 p-4">
        <h3 className="text-lg font-semibold mb-4">Simple CSS Animation Test</h3>
        <div className="w-full overflow-hidden bg-blue-100 h-16">
          <div 
            className="h-full bg-red-500 w-20"
            style={{
              animation: "scroll-left 5s linear infinite"
            }}
          >
            <div className="text-white p-2">Moving Box</div>
          </div>
        </div>
      </div>

      {/* Tailwind Animation Test */}
      <div className="border-2 border-green-500 p-4">
        <h3 className="text-lg font-semibold mb-4">Tailwind Animation Test</h3>
        <div className="w-full overflow-hidden bg-green-100 h-16">
          <div className="h-full bg-green-500 w-20 animate-scroll">
            <div className="text-white p-2">Tailwind Box</div>
          </div>
        </div>
      </div>

      {/* Logo Container Test */}
      <div className="border-2 border-purple-500 p-4">
        <h3 className="text-lg font-semibold mb-4">Logo Container Test</h3>
        <div className="w-full overflow-hidden bg-gray-100 h-20">
          <div 
            className="flex h-full"
            style={{
              width: "200%",
              animation: "scroll-left 10s linear infinite"
            }}
          >
            <div className="flex items-center justify-around w-1/2 bg-red-100 h-full">
              <div className="bg-white p-2 border">Logo 1</div>
              <div className="bg-white p-2 border">Logo 2</div>
              <div className="bg-white p-2 border">Logo 3</div>
            </div>
            <div className="flex items-center justify-around w-1/2 bg-blue-100 h-full">
              <div className="bg-white p-2 border">Logo 1</div>
              <div className="bg-white p-2 border">Logo 2</div>
              <div className="bg-white p-2 border">Logo 3</div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        <p>If you can see the boxes moving from right to left, the animation is working!</p>
        <p>The red borders around the logo section help visualize the container boundaries.</p>
      </div>
    </div>
  );
}
