"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { 
  Loader2, 
  CreditCard, 
  Smartphone, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ArrowLeft,
  Receipt,
  Calendar,
  User
} from "lucide-react";

interface ApplicationData {
  id: string;
  firstName: string;
  lastName: string;
  serviceName: string;
  paymentStatus: string;
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    totalAmount: number;
    currency: string;
    status: string;
    dueDate?: string;
    items: Array<{
      itemName: string;
      description?: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
  }>;
}

export default function PatientPaymentPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "patient")) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchApplicationData();
    }
  }, [user, authLoading, router]);

  const fetchApplicationData = async () => {
    try {
      const response = await fetch(`/api/patient/application?userId=${user?.id}`);
      const data = await response.json();

      if (data.success) {
        setApplication(data.application);
        
        // If payment is already completed, redirect to dashboard
        if (data.paymentStatus === 'completed') {
          toast({
            title: "Payment Already Completed",
            description: "Redirecting to your dashboard...",
          });
          router.push("/patient");
          return;
        }

        // If no invoice exists, show error
        if (!data.hasInvoice) {
          toast({
            title: "No Invoice Found",
            description: "Please contact support for assistance.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to load payment information",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to fetch application data:", error);
      toast({
        title: "Error",
        description: "Failed to load payment information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMobileMoneyPayment = async () => {
    if (!application || !application.invoices.length) return;

    setIsProcessingPayment(true);
    try {
      // Simulate Mobile Money payment process
      // In a real implementation, this would integrate with:
      // - MTN Mobile Money API
      // - Vodafone Cash API
      // - AirtelTigo Money API
      // - Hubtel Payment Gateway
      
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate processing

      toast({
        title: "Payment Initiated",
        description: "Please check your phone for the Mobile Money prompt and complete the payment.",
      });

      // In real implementation, you would:
      // 1. Call payment provider API
      // 2. Get payment reference
      // 3. Poll for payment status
      // 4. Update application payment status
      
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Failed to initiate Mobile Money payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending Payment</Badge>;
      case 'processing':
        return <Badge variant="outline" className="text-blue-600 border-blue-600"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Processing</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>;
      case 'failed':
        return <Badge variant="outline" className="text-red-600 border-red-600"><AlertCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Payment Information Found</h2>
            <p className="text-muted-foreground mb-4">
              We couldn't find any payment information for your account.
            </p>
            <Button onClick={() => router.push("/patient")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const invoice = application.invoices[0]; // Get the first invoice

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            
            <div>
              <h1 className="text-xl font-bold">Payment Required</h1>
              <p className="text-sm text-muted-foreground">Complete your payment to access services</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="font-medium">{user?.firstName} {user?.lastName}</div>
              <div className="text-sm text-muted-foreground">{user?.email}</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/logout")}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Service Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Service Application
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Service:</span>
                  <div className="font-medium">{application.serviceName}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <div>{getStatusBadge(application.paymentStatus)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Details */}
          {invoice && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Invoice Details
                </CardTitle>
                <CardDescription>
                  Invoice #{invoice.invoiceNumber}
                  {invoice.dueDate && (
                    <span className="ml-2">
                      • Due: {new Date(invoice.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Invoice Items */}
                <div className="space-y-2">
                  {invoice.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium">{item.itemName}</div>
                        {item.description && (
                          <div className="text-sm text-muted-foreground">{item.description}</div>
                        )}

                      </div>
                      <div className="font-medium">
                        {invoice.currency} {item.totalPrice.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Amount</span>
                  <span>{invoice.currency} {invoice.totalAmount.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </CardTitle>
              <CardDescription>
                Choose your preferred payment method
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mobile Money */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-6 w-6 text-green-600" />
                    <div>
                      <div className="font-medium">Mobile Money</div>
                      <div className="text-sm text-muted-foreground">
                        MTN, Vodafone, AirtelTigo
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">Recommended</Badge>
                </div>
                <Button 
                  onClick={handleMobileMoneyPayment}
                  disabled={isProcessingPayment}
                  className="w-full"
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Smartphone className="h-4 w-4 mr-2" />
                      Pay with Mobile Money
                    </>
                  )}
                </Button>
              </div>

              {/* Testing bypass */}
              <div className="border-t pt-4 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => router.push('/patient')}
                >
                  Skip Payment (Testing Only)
                </Button>
              </div>

              {/* Other payment methods can be added here */}
              <div className="text-center text-sm text-muted-foreground mt-4">
                More payment methods coming soon
              </div>
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">
                <strong>Need help?</strong> Contact our support team if you encounter any issues with your payment.
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
