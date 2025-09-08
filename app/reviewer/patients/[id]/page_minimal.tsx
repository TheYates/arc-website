"use client";

import React, { useState, useEffect, useCallback } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ReviewerPatientDetailPage({ params }: PageProps) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  
  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  return (
    <div className="min-h-screen bg-background">
      <h1>Test Page</h1>
    </div>
  );
}
