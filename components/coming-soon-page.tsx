"use client";

import { Clock, ArrowLeft, Bell } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ResponsiveHeader from "@/components/responsive-header";

interface ComingSoonPageProps {
  serviceName: string;
  description?: string;
}

export default function ComingSoonPage({ serviceName, description }: ComingSoonPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-teal-50">
      <ResponsiveHeader />
      
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          {/* Back Button */}
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" className="text-slate-600 hover:text-slate-800">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Coming Soon Card */}
          <Card className="border-amber-200 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="bg-amber-100 p-4 rounded-full">
                  <Clock className="h-12 w-12 text-amber-600" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-slate-800 mb-2">
                {serviceName}
              </CardTitle>
              <div className="inline-flex items-center bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium">
                <Clock className="h-4 w-4 mr-2" />
                Coming Soon
              </div>
            </CardHeader>
            
            <CardContent className="text-center space-y-6">
              <p className="text-lg text-slate-600 leading-relaxed">
                {description || `We're working hard to bring you ${serviceName} service. This exciting new offering will be available soon!`}
              </p>

              <div className="bg-slate-50 p-6 rounded-lg">
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center justify-center">
                  <Bell className="h-5 w-5 mr-2 text-teal-600" />
                  Get Notified
                </h3>
                <p className="text-slate-600 mb-4">
                  Be the first to know when {serviceName} becomes available. 
                  Contact us to express your interest and we'll keep you updated.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/contact">
                    <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                      Contact Us
                    </Button>
                  </Link>
                  <Link href="/get-started">
                    <Button variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50">
                      Explore Other Services
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="text-sm text-slate-500">
                <p>
                  In the meantime, check out our other available services or contact us 
                  for more information about what we can offer your family.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
