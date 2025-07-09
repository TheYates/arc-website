import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Clock, Award } from "lucide-react";

export default function CareersPage() {
  const positions = [
    {
      title: "Live-in Care Specialist",
      type: "Full-time",
      location: "Accra, Ghana",
      description:
        "Provide comprehensive 24/7 home care services to families in need. Work closely with families to ensure comfort and quality care.",
      requirements: [
        "Nursing certification",
        "2+ years experience",
        "Excellent communication skills",
        "Compassionate nature",
      ],
      salary: "GHS 2,500 - 3,500/month",
      category: "Healthcare",
    },
    {
      title: "Professional Nanny",
      type: "Full-time / Part-time",
      location: "Greater Accra",
      description:
        "Care for children with love, patience, and professional expertise. Support child development and educational activities.",
      requirements: [
        "Childcare certification",
        "First aid training",
        "References required",
        "Educational background",
      ],
      salary: "GHS 1,800 - 2,800/month",
      category: "Childcare",
    },
    {
      title: "Home Visit Nurse",
      type: "Contract",
      location: "Multiple locations",
      description:
        "Provide daily nursing care and health monitoring services. Travel to client homes for professional medical support.",
      requirements: [
        "Valid nursing license",
        "Transportation",
        "Flexible schedule",
        "Professional demeanor",
      ],
      salary: "GHS 120 - 180/visit",
      category: "Healthcare",
    },
    {
      title: "Event Medical Coordinator",
      type: "Contract",
      location: "Nationwide",
      description:
        "Coordinate medical coverage for events, conferences, and gatherings. Ensure safety protocols and emergency preparedness.",
      requirements: [
        "Medical background",
        "Event management experience",
        "Leadership skills",
        "Emergency response training",
      ],
      salary: "GHS 800 - 1,200/event",
      category: "Event Medical",
    },
    {
      title: "Senior Childcare Specialist",
      type: "Full-time",
      location: "East Legon, Accra",
      description:
        "Lead childcare services with advanced educational support. Mentor junior staff and develop care programs.",
      requirements: [
        "Bachelor's in Education/Child Development",
        "5+ years experience",
        "Leadership experience",
        "Training certification",
      ],
      salary: "GHS 3,000 - 4,000/month",
      category: "Childcare",
    },
    {
      title: "Emergency Response Nurse",
      type: "Full-time",
      location: "Greater Accra",
      description:
        "Provide rapid response medical care and emergency support. Available for urgent home visits and medical emergencies.",
      requirements: [
        "Emergency nursing certification",
        "Valid driver's license",
        "24/7 availability",
        "Critical care experience",
      ],
      salary: "GHS 3,500 - 4,500/month",
      category: "Healthcare",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-50 to-blue-50 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Join Our Care Team
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed mb-8">
            Make a difference in families' lives while building a rewarding
            career in healthcare and childcare.
          </p>
          <Button
            size="lg"
            className="bg-teal-600 hover:bg-teal-700 text-white px-8"
          >
            Apply Now
          </Button>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Why Work With Alpha Rescue Consult?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Heart className="h-12 w-12 text-teal-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Meaningful Work
                </h3>
                <p className="text-slate-600">
                  Make a real difference in families' lives every day
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Supportive Team
                </h3>
                <p className="text-slate-600">
                  Work with experienced professionals who care
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Flexible Schedule
                </h3>
                <p className="text-slate-600">
                  Choose from full-time, part-time, or contract work
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Award className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Professional Growth
                </h3>
                <p className="text-slate-600">
                  Continuous training and career development
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Current Openings
            </h2>
            <p className="text-xl text-slate-600">
              Join our team of dedicated care professionals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {positions.map((position, index) => (
              <Card
                key={index}
                className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300"
              >
                <CardHeader className="pb-4">
                  <div className="mb-2">
                    <CardTitle className="text-lg text-slate-900 mb-2">
                      {position.title}
                    </CardTitle>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-600">
                        {position.type} • {position.location}
                      </p>
                      <p className="text-sm font-semibold text-teal-600">
                        {position.salary}
                      </p>
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-full">
                        {position.category}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                    {position.description}
                  </p>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-2 text-sm">
                      Requirements:
                    </h4>
                    <ul className="list-disc list-inside text-slate-600 space-y-1 text-sm">
                      {position.requirements.map((req, reqIndex) => (
                        <li key={reqIndex}>{req}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-200">
                    <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                      Apply Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional CTA */}
          <div className="text-center mt-16">
            <div className="bg-slate-50 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Don't See Your Perfect Role?
              </h3>
              <p className="text-slate-600 mb-6">
                We're always looking for passionate healthcare and childcare
                professionals. Send us your resume and we'll keep you in mind
                for future opportunities.
              </p>
              <Button
                size="lg"
                variant="outline"
                className="border-teal-600 text-teal-600"
              >
                Submit General Application
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
