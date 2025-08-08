"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface Service {
  id: string;
  displayName: string;
  shortDescription: string;
  isActive: boolean;
  isPopular: boolean;
  basePriceHourly: number;
  basePriceDaily: number;
  basePriceMonthly: number;
  priceDisplay: string;
  createdAt: string;
  updatedAt: string;
}

export function AdminServiceDetailMobile({ serviceId }: { serviceId: string }) {
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/services/${serviceId}`);
        if (res.ok) {
          const data = await res.json();
          setService(data.service || null);
        } else {
          setService(null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [serviceId]);

  if (loading)
    return (
      <div className="px-4 py-6 text-sm text-muted-foreground">Loading...</div>
    );
  if (!service)
    return (
      <div className="px-4 py-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="mb-2 font-medium">Service not found</div>
            <Button
              variant="outline"
              onClick={() => router.push("/admin/services")}
            >
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(n);

  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Service Details</h1>
        <p className="text-sm text-muted-foreground">
          View and manage service configuration
        </p>
      </div>

      <Button
        variant="ghost"
        onClick={() => router.push("/admin/services")}
        className="px-0"
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="font-semibold">{service.displayName}</div>
            <div className="flex items-center gap-2">
              <Badge variant={service.isActive ? "default" : "secondary"}>
                {service.isActive ? "Active" : "Inactive"}
              </Badge>
              {service.isPopular && (
                <Badge
                  variant="outline"
                  className="text-orange-600 border-orange-600"
                >
                  Popular
                </Badge>
              )}
            </div>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {service.shortDescription}
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm mt-3">
            <div className="p-2 border rounded-md">
              <div className="text-xs text-muted-foreground">Hourly</div>
              <div className="font-medium">{fmt(service.basePriceHourly)}</div>
            </div>
            <div className="p-2 border rounded-md">
              <div className="text-xs text-muted-foreground">Daily</div>
              <div className="font-medium">{fmt(service.basePriceDaily)}</div>
            </div>
            <div className="p-2 border rounded-md">
              <div className="text-xs text-muted-foreground">Monthly</div>
              <div className="font-medium">{fmt(service.basePriceMonthly)}</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Display: {service.priceDisplay}
          </div>
          <div className="mt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/admin/services/${service.id}`)}
            >
              Open full editor
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
