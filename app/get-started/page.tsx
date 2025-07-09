import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Phone } from "lucide-react"

export default function GetStartedPage() {
  const services = [
    {
      id: "ahenefie",
      name: "AHENEFIE",
      description: "Live-in home care package",
      price: "Starting from GHS 200/day",
      popular: true,
    },
    {
      id: "adamfo-pa",
      name: "ADAMFO PA",
      description: "Daily home visit package",
      price: "Starting from GHS 80/visit",
      popular: false,
    },
    {
      id: "fie-ne-fie",
      name: "Fie Ne Fie",
      description: "Stay-in nanny service",
      price: "Starting from GHS 150/day",
      popular: false,
    },
    {
      id: "yonko-pa",
      name: "YONKO PA",
      description: "Visit-on-request nanny service",
      price: "Starting from GHS 50/hour",
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-50 to-blue-50 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Get Started Today</h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            Tell us about your care needs and we'll create a personalized plan for your family.
          </p>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-slate-900 text-center">Book Your Free Consultation</CardTitle>
              <p className="text-slate-600 text-center">
                Complete the form below and we'll contact you within 24 hours to discuss your needs.
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-2">
                      First Name *
                    </label>
                    <Input id="firstName" placeholder="Enter your first name" required />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-2">
                      Last Name *
                    </label>
                    <Input id="lastName" placeholder="Enter your last name" required />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                      Email Address *
                    </label>
                    <Input id="email" type="email" placeholder="Enter your email" required />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                      Phone Number *
                    </label>
                    <Input id="phone" placeholder="Enter your phone number" required />
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-2">
                    Address
                  </label>
                  <Input id="address" placeholder="Enter your address" />
                </div>
              </div>

              {/* Service Selection */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Select Your Service</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <label key={service.id} className="cursor-pointer">
                      <input type="radio" name="service" value={service.id} className="sr-only peer" />
                      <Card className="peer-checked:ring-2 peer-checked:ring-teal-500 peer-checked:border-teal-500 hover:shadow-md transition-all">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-slate-900">{service.name}</h4>
                            {service.popular && <Badge className="bg-teal-100 text-teal-800">Most Popular</Badge>}
                          </div>
                          <p className="text-slate-600 text-sm mb-2">{service.description}</p>
                          <p className="text-teal-600 font-medium text-sm">{service.price}</p>
                        </CardContent>
                      </Card>
                    </label>
                  ))}
                </div>
              </div>

              {/* Care Details */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Care Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 mb-2">
                      Preferred Start Date
                    </label>
                    <Input id="startDate" type="date" />
                  </div>
                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-slate-700 mb-2">
                      Expected Duration
                    </label>
                    <select
                      id="duration"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="">Select duration</option>
                      <option value="short-term">Short-term (1-4 weeks)</option>
                      <option value="medium-term">Medium-term (1-6 months)</option>
                      <option value="long-term">Long-term (6+ months)</option>
                      <option value="ongoing">Ongoing</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="careNeeds" className="block text-sm font-medium text-slate-700 mb-2">
                    Specific Care Needs
                  </label>
                  <Textarea
                    id="careNeeds"
                    rows={4}
                    placeholder="Please describe the specific care needs, any medical conditions, preferences, or special requirements..."
                  />
                </div>
              </div>

              {/* Preferred Contact */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Preferred Contact Method</h3>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="contact" value="phone" className="text-teal-600" />
                    <Phone className="h-4 w-4 text-slate-600" />
                    <span className="text-slate-700">Phone Call</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="contact" value="email" className="text-teal-600" />
                    <span className="text-slate-700">Email</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="contact" value="whatsapp" className="text-teal-600" />
                    <span className="text-slate-700">WhatsApp</span>
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200">
                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 text-lg">
                  Book Free Consultation
                </Button>
                <p className="text-center text-sm text-slate-500 mt-3">
                  We'll contact you within 24 hours to schedule your consultation
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* What Happens Next */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">What Happens Next?</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-teal-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Phone className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">1. We Contact You</h3>
              <p className="text-slate-600">
                Our care coordinator will call you within 24 hours to discuss your needs.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">2. Schedule Assessment</h3>
              <p className="text-slate-600">
                We arrange a free in-home assessment to understand your specific requirements.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">3. Match & Start Care</h3>
              <p className="text-slate-600">
                We match you with the perfect care provider and begin your personalized care plan.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
