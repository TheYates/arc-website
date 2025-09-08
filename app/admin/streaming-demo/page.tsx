import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Simulate different loading times for different components
async function FastLoadingComponent() {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-green-600">Fast Component (500ms)</CardTitle>
        <CardDescription>This loads quickly and appears first</CardDescription>
      </CardHeader>
      <CardContent>
        <p>✅ This component loaded in 500ms</p>
        <p className="text-sm text-muted-foreground mt-2">
          Users see this content immediately while other sections are still loading.
        </p>
      </CardContent>
    </Card>
  );
}

async function MediumLoadingComponent() {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-blue-600">Medium Component (2s)</CardTitle>
        <CardDescription>This takes a bit longer to load</CardDescription>
      </CardHeader>
      <CardContent>
        <p>⏳ This component loaded in 2 seconds</p>
        <p className="text-sm text-muted-foreground mt-2">
          This appears after the fast component, demonstrating progressive loading.
        </p>
      </CardContent>
    </Card>
  );
}

async function SlowLoadingComponent() {
  await new Promise(resolve => setTimeout(resolve, 4000));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-orange-600">Slow Component (4s)</CardTitle>
        <CardDescription>This simulates a heavy database query</CardDescription>
      </CardHeader>
      <CardContent>
        <p>🐌 This component loaded in 4 seconds</p>
        <p className="text-sm text-muted-foreground mt-2">
          Even slow components don't block the entire page from rendering.
        </p>
      </CardContent>
    </Card>
  );
}

// Loading skeletons
function FastLoading() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-3 w-3/4" />
      </CardContent>
    </Card>
  );
}

function MediumLoading() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-52" />
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-3 w-4/5" />
      </CardContent>
    </Card>
  );
}

function SlowLoading() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-4 w-60" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-3 w-2/3" />
      </CardContent>
    </Card>
  );
}

export default function StreamingDemoPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Streaming Demo</h1>
          <p className="text-muted-foreground">
            Watch how different components load progressively with Next.js streaming
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="font-semibold text-blue-900 mb-2">How Streaming Works</h2>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Each component below has a different simulated loading time</li>
          <li>• Fast components appear immediately while slow ones are still loading</li>
          <li>• Users see content progressively instead of waiting for everything</li>
          <li>• Loading skeletons provide visual feedback during data fetching</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Fast Component */}
        <Suspense fallback={<FastLoading />}>
          <FastLoadingComponent />
        </Suspense>

        {/* Medium Component */}
        <Suspense fallback={<MediumLoading />}>
          <MediumLoadingComponent />
        </Suspense>

        {/* Slow Component */}
        <Suspense fallback={<SlowLoading />}>
          <SlowLoadingComponent />
        </Suspense>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Benefits of Streaming</CardTitle>
          <CardDescription>Why this approach improves user experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-green-600 mb-2">✅ With Streaming</h3>
              <ul className="text-sm space-y-1">
                <li>• Immediate visual feedback</li>
                <li>• Progressive content loading</li>
                <li>• Better perceived performance</li>
                <li>• Reduced bounce rate</li>
                <li>• Improved Core Web Vitals</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-red-600 mb-2">❌ Without Streaming</h3>
              <ul className="text-sm space-y-1">
                <li>• Blank page until everything loads</li>
                <li>• Poor user experience</li>
                <li>• Higher bounce rates</li>
                <li>• Slower perceived performance</li>
                <li>• All-or-nothing loading</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Implementation in Your Dashboard</CardTitle>
          <CardDescription>How to apply streaming to your admin dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">1. Wrap Components in Suspense</h3>
              <code className="text-sm bg-gray-100 p-2 rounded block">
                {`<Suspense fallback={<LoadingSkeleton />}>
  <YourComponent />
</Suspense>`}
              </code>
            </div>
            <div>
              <h3 className="font-semibold mb-2">2. Create Loading Skeletons</h3>
              <p className="text-sm text-muted-foreground">
                Design skeleton components that match your actual component layout
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">3. Move Data Fetching to Server Components</h3>
              <p className="text-sm text-muted-foreground">
                Use async server components for better streaming performance
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
