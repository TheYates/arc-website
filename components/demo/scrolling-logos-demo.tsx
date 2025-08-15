"use client";

import { ScrollingLogos } from "@/components/ui/scrolling-logos";
import { getPartnerLogos } from "@/lib/constants/logos";

export function ScrollingLogosDemo() {
  const logos = getPartnerLogos();

  return (
    <div className="space-y-8 p-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Scrolling Logos Demo</h2>
        <p className="text-gray-600 mb-8">
          Here are different variations of the scrolling logos component:
        </p>
      </div>

      {/* Normal Speed, Left Direction */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Normal Speed - Left Direction</h3>
        <ScrollingLogos 
          logos={logos} 
          speed="normal" 
          direction="left"
          className="bg-white border"
        />
      </div>

      {/* Slow Speed, Right Direction */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Slow Speed - Right Direction</h3>
        <ScrollingLogos 
          logos={logos} 
          speed="slow" 
          direction="right"
          className="bg-gray-100 border"
        />
      </div>

      {/* Fast Speed, Left Direction */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Fast Speed - Left Direction</h3>
        <ScrollingLogos 
          logos={logos} 
          speed="fast" 
          direction="left"
          className="bg-teal-50 border"
        />
      </div>

      <div className="text-center text-sm text-gray-500 mt-8">
        <p>
          Currently using placeholder logos. Add real logos to <code>public/images/logos/</code> 
          and update <code>lib/constants/logos.ts</code> to use actual partner logos.
        </p>
      </div>
    </div>
  );
}
