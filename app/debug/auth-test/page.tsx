"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authenticatedGet } from "@/lib/api/auth-headers";

export default function AuthTestPage() {
  const { user } = useAuth();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAuth = async () => {
    if (!user) {
      setResult({ error: "No user logged in" });
      return;
    }

    setLoading(true);
    try {
      const response = await authenticatedGet("/api/debug/caregiver-requests", user);
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testServiceRequests = async () => {
    if (!user) {
      setResult({ error: "No user logged in" });
      return;
    }

    setLoading(true);
    try {
      const response = await authenticatedGet("/api/service-requests", user);
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Current User:</h3>
            {user ? (
              <pre className="bg-gray-100 p-3 rounded text-sm">
                {JSON.stringify(user, null, 2)}
              </pre>
            ) : (
              <p className="text-red-500">No user logged in</p>
            )}
          </div>

          <div className="space-x-2">
            <Button onClick={testAuth} disabled={loading || !user}>
              {loading ? "Testing..." : "Test Debug API"}
            </Button>
            <Button onClick={testServiceRequests} disabled={loading || !user}>
              {loading ? "Testing..." : "Test Service Requests API"}
            </Button>
          </div>

          {result && (
            <div>
              <h3 className="font-semibold mb-2">API Response:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm max-h-96 overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
