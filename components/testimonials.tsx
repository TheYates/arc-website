import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

export default function Testimonials() {
  const testimonials = [
    {
      name: "Akosua Mensah",
      location: "East Legon, Accra",
      service: "AHENEFIE Live-in Care",
      rating: 5,
      text: "Alpha Rescue Consult has been a blessing to our family. The live-in care for my elderly mother has been exceptional. The nurse is professional, caring, and treats my mother like family.",
    },
    {
      name: "Kwame Asante",
      location: "Airport Residential, Accra",
      service: "Fie Ne Fie Nanny Service",
      rating: 5,
      text: "Our nanny from ARC is amazing with our two children. She's not just caring for them but also helping with their education. We couldn't be happier with the service.",
    },
    {
      name: "Ama Osei",
      location: "Tema",
      service: "ADAMFO PA Daily Visits",
      rating: 5,
      text: "The daily visits have been perfect for my father's needs. The flexibility and professionalism of the care team gives us peace of mind while maintaining his independence.",
    },
    {
      name: "Dr. Emmanuel Boateng",
      location: "Kumasi",
      service: "YONKO PA On-Request",
      rating: 5,
      text: "As a busy professional, the on-request nanny service has been invaluable. Reliable, trustworthy, and always available when we need them most.",
    },
  ]

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">What Families Say About Us</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Don't just take our word for it. Here's what some of our satisfied families have to say about our services.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-600 mb-4 italic">"{testimonial.text}"</p>
                <div className="border-t border-slate-200 pt-4">
                  <p className="font-semibold text-slate-900">{testimonial.name}</p>
                  <p className="text-sm text-slate-500">{testimonial.location}</p>
                  <p className="text-sm text-teal-600 font-medium">{testimonial.service}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
