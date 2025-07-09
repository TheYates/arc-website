import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Phone, Mail, MapPin, Clock } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-50 to-blue-50 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Get in Touch</h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            Ready to discuss your care needs? We're here to help you find the perfect solution for your family.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-slate-900">Send us a Message</CardTitle>
                <p className="text-slate-600">Fill out the form below and we'll get back to you within 24 hours.</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-2">
                      First Name
                    </label>
                    <Input id="firstName" placeholder="Enter your first name" />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-2">
                      Last Name
                    </label>
                    <Input id="lastName" placeholder="Enter your last name" />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                    Phone Number
                  </label>
                  <Input id="phone" placeholder="Enter your phone number" />
                </div>

                <div>
                  <label htmlFor="service" className="block text-sm font-medium text-slate-700 mb-2">
                    Service Interested In
                  </label>
                  <select
                    id="service"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="">Select a service</option>
                    <option value="ahenefie">AHENEFIE - Live-in Home Care</option>
                    <option value="adamfo-pa">ADAMFO PA - Daily Home Visits</option>
                    <option value="fie-ne-fie">Fie Ne Fie - Stay-in Nanny</option>
                    <option value="yonko-pa">YONKO PA - Visit-on-Request Nanny</option>
                    <option value="custom">Custom Package</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    rows={4}
                    placeholder="Tell us about your specific needs and any questions you have..."
                  />
                </div>

                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">Send Message</Button>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-slate-900">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <Phone className="h-6 w-6 text-teal-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-slate-900">Phone</h3>
                      <p className="text-slate-600">+233 24 123 4567</p>
                      <p className="text-slate-600">+233 20 987 6543</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Mail className="h-6 w-6 text-teal-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-slate-900">Email</h3>
                      <p className="text-slate-600">info@alpharescueconsult.com</p>
                      <p className="text-slate-600">care@alpharescueconsult.com</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <MapPin className="h-6 w-6 text-teal-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-slate-900">Office Location</h3>
                      <p className="text-slate-600">123 Liberation Road</p>
                      <p className="text-slate-600">East Legon, Accra</p>
                      <p className="text-slate-600">Ghana</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Clock className="h-6 w-6 text-teal-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-slate-900">Business Hours</h3>
                      <p className="text-slate-600">Monday - Friday: 8:00 AM - 6:00 PM</p>
                      <p className="text-slate-600">Saturday: 9:00 AM - 4:00 PM</p>
                      <p className="text-slate-600">Sunday: Emergency calls only</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900">Emergency Contact</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">
                    For urgent care needs or emergencies, our 24/7 hotline is always available.
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 font-semibold text-lg">Emergency Hotline: +233 24 911 0000</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
