"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { ServiceCustomization } from "@/components/service-customization";

interface Service {
  id: string;
  name: string;
  slug: string;
  displayName: string;
  description: string;
  basePriceDaily: number;
  basePriceMonthly: number;
  basePriceHourly: number;
}

export default function ServiceCustomizePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState<
    "hourly" | "daily" | "monthly"
  >("daily");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  useEffect(() => {
    loadService();
  }, [slug]);

  const loadService = async () => {
    try {
      setLoading(true);
      // First get service by slug
      const response = await fetch(`/api/services/slug/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setService(data.service);
      }
    } catch (error) {
      console.error("Error loading service:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectionChange = (items: string[], price: number) => {
    setSelectedItems(items);
    setTotalPrice(price);
  };

  const handleProceedToBooking = () => {
    // Navigate to booking page with selected options
    const searchParams = new URLSearchParams({
      service: service?.id || "",
      billingPeriod,
      optionalItems: selectedItems.join(","),
      totalPrice: totalPrice.toString(),
    });

    router.push(`/booking?${searchParams.toString()}`);
  };

  const handleBack = () => {
    router.push(`/services/${slug}`);
  };

  const getBillingPeriodLabel = () => {
    switch (billingPeriod) {
      case "hourly":
        return "Hourly";
      case "daily":
        return "Daily";
      case "monthly":
        return "Monthly";
      default:
        return "Daily";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading service customization...</div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">Service not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Service
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              Customize {service.displayName}
            </h1>
            <p className="text-muted-foreground">
              Select your preferred billing period and optional items
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Billing Period Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Billing Period</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={billingPeriod} onValueChange={setBillingPeriod}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select billing period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">
                    Hourly - GHS {(service.basePriceHourly || 0).toFixed(2)}
                    /hour
                  </SelectItem>
                  <SelectItem value="daily">
                    Daily - GHS {(service.basePriceDaily || 0).toFixed(2)}/day
                  </SelectItem>
                  <SelectItem value="monthly">
                    Monthly - GHS {(service.basePriceMonthly || 0).toFixed(2)}
                    /month
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Service Customization */}
          <ServiceCustomization
            serviceId={service.id}
            billingPeriod={billingPeriod}
            onSelectionChange={handleSelectionChange}
          />
        </div>

        {/* Sidebar - Order Summary */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Service:</span>
                  <span>{service.displayName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Billing:</span>
                  <span>{getBillingPeriodLabel()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Optional Items:</span>
                  <span>{selectedItems.length} selected</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Price:</span>
                  <span className="text-green-600">
                    GHS {totalPrice.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {getBillingPeriodLabel().toLowerCase()} rate
                </p>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleProceedToBooking}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Proceed to Booking
              </Button>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Prices shown are base rates</p>
                <p>• Final pricing may vary based on specific requirements</p>
                <p>• All prices are in Ghana Cedis (GHS)</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
