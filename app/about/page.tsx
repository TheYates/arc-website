import Header from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Shield, Users, Award, CheckCircle } from "lucide-react"

export default function AboutPage() {
  const stats = [
    { number: "500+", label: "Families Served" },
    { number: "50+", label: "Care Professionals" },
    { number: "5", label: "Years of Experience" },
    { number: "24/7", label: "Emergency Support" },
  ]

  const values = [
    {
      icon: Heart,
      title: "Compassionate Care",
      description: "We treat every family member with the love and respect they deserve.",
    },
    {
      icon: Shield,
      title: "Professional Excellence",
      description: "Our team consists of certified, experienced healthcare and childcare professionals.",
    },
    {
      icon: Users,
      title: "Family-Centered Approach",
      description: "We work closely with families to create personalized care plans that meet unique needs.",
    },
    {
      icon: Award,
      title: "Trusted Reputation",
      description: "Built on years of reliable service and countless satisfied families across Ghana.",
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-50 to-blue-50 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">About Alpha Rescue Consult</h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            Ghana's trusted partner for professional home care and nanny services, dedicated to supporting families with
            compassionate, reliable care.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-teal-600 mb-2">{stat.number}</div>
                <div className="text-slate-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Our Story</h2>
          </div>

          <div className="prose prose-lg mx-auto text-slate-600">
            <p className="text-xl leading-relaxed mb-6">
              Alpha Rescue Consult was founded with a simple yet powerful mission: to provide Ghanaian families with
              access to professional, compassionate care services that they can trust completely.
            </p>

            <p className="leading-relaxed mb-6">
              Recognizing the growing need for reliable home care and childcare services in Ghana, our founders brought
              together a team of experienced healthcare professionals, certified nannies, and care coordinators to
              create a comprehensive care solution.
            </p>

            <p className="leading-relaxed mb-6">
              Today, we're proud to serve over 500 families across Greater Accra and beyond, offering everything from
              live-in home care to flexible nanny services. Our commitment to excellence, safety, and personalized care
              has made us Ghana's most trusted name in professional care services.
            </p>

            <p className="leading-relaxed">
              Whether you need comprehensive live-in support or flexible visit-based care, Alpha Rescue Consult is here
              to provide the professional, compassionate service your family deserves.
            </p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              These principles guide everything we do and ensure that every family receives the highest quality care.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="bg-teal-100 p-4 rounded-full w-fit mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3">{value.title}</h3>
                    <p className="text-slate-600">{value.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why Families Choose Us</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-slate-900">Certified Professionals</h3>
                  <p className="text-slate-600">
                    All our care providers are certified, trained, and background-checked.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-slate-900">24/7 Emergency Support</h3>
                  <p className="text-slate-600">Round-the-clock emergency response and coordination services.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-slate-900">Personalized Care Plans</h3>
                  <p className="text-slate-600">Customized services tailored to each family's unique needs.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-slate-900">Flexible Scheduling</h3>
                  <p className="text-slate-600">From live-in care to on-demand visits, we adapt to your schedule.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-slate-900">Transparent Pricing</h3>
                  <p className="text-slate-600">Clear, upfront pricing with no hidden fees or surprises.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-slate-900">Local Expertise</h3>
                  <p className="text-slate-600">Deep understanding of Ghanaian families and cultural needs.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
