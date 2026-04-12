import React, { useState } from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import {
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  Search,
  MessageCircle,
  HelpCircle,
  Zap,
  Users,
  Award,
} from "lucide-react";

const Help = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Booking");
  const [searchTerm, setSearchTerm] = useState("");

  const faqs = [
    {
      id: 1,
      category: "Booking",
      questions: [
        {
          q: "How do I book an appointment with a doctor?",
          a: "Search for a doctor, select a profile, choose an available slot, and confirm your booking.",
        },
        {
          q: "Can I reschedule my appointment?",
          a: "Yes, appointments can be rescheduled up to 24 hours before the scheduled time.",
        },
        {
          q: "How far in advance can I book?",
          a: "Appointments can be booked up to 30 days in advance.",
        },
      ],
    },
    {
      id: 2,
      category: "Payments",
      questions: [
        {
          q: "What payment methods do you accept?",
          a: "We accept Credit/Debit Cards, UPI, Net Banking, and Digital Wallets.",
        },
        {
          q: "When will I receive my refund?",
          a: "Refunds are processed within 5-7 business days.",
        },
      ],
    },
    {
      id: 3,
      category: "Consultations",
      questions: [
        {
          q: "How does video consultation work?",
          a: "Join the secure video link at your scheduled time to consult with your doctor.",
        },
        {
          q: "What do I need for a video consultation?",
          a: "A stable internet connection, camera, microphone, and a quiet environment.",
        },
      ],
    },
    {
      id: 4,
      category: "Account",
      questions: [
        {
          q: "How do I update my profile?",
          a: "Go to your dashboard and click on 'Edit Profile' to update your details.",
        },
        {
          q: "How can I reset my password?",
          a: "Click on 'Forgot Password' on the login page and follow the instructions.",
        },
      ],
    },
  ];

  const allFaqs = faqs.flatMap((cat) =>
    cat.questions.map((q) => ({ ...q, category: cat.category })),
  );

  const filteredFaqs =
    selectedCategory === "All"
      ? allFaqs.filter(
          (faq) =>
            faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.a.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      : faqs
          .find((cat) => cat.category === selectedCategory)
          ?.questions.filter(
            (faq) =>
              faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
              faq.a.toLowerCase().includes(searchTerm.toLowerCase()),
          ) || [];

  const FaqItem = ({ faq }) => {
    const isExpanded = expandedFaq === faq.q;

    return (
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <button
          onClick={() => setExpandedFaq(isExpanded ? null : faq.q)}
          className="w-full flex justify-between items-center px-6 py-4 text-left hover:bg-muted transition"
        >
          <span className="font-semibold text-foreground">{faq.q}</span>
          <ChevronDown
            className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </button>

        {isExpanded && (
          <div className="px-6 pb-4 text-muted-foreground border-t border-border bg-muted/50">
            {faq.a}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-background text-foreground min-h-screen transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-24 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle />
              <span className="font-semibold">We're here to help</span>
            </div>

            <h1 className="text-5xl font-bold mb-4">Help & Support</h1>
            <p className="text-lg text-blue-100 mb-6">
              Find answers to your questions or contact our support team.
            </p>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search help topics..."
                className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-900 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-xl border border-border flex items-center gap-4">
            <Zap className="text-blue-600" size={32} />
            <div>
              <h3 className="text-xl font-bold">2 min</h3>
              <p className="text-muted-foreground">Average response time</p>
            </div>
          </div>

          <div className="bg-card p-6 rounded-xl border border-border flex items-center gap-4">
            <Users className="text-green-600" size={32} />
            <div>
              <h3 className="text-xl font-bold">1M+</h3>
              <p className="text-muted-foreground">Happy Users</p>
            </div>
          </div>

          <div className="bg-card p-6 rounded-xl border border-border flex items-center gap-4">
            <Award className="text-purple-600" size={32} />
            <div>
              <h3 className="text-xl font-bold">99.8%</h3>
              <p className="text-muted-foreground">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Support Channels */}
      <section className="py-16 max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-6">
        {[
          {
            icon: Mail,
            title: "Email Support",
            desc: "support@careconnect.com",
            color: "text-blue-600",
          },
          {
            icon: Phone,
            title: "Phone Support",
            desc: "+91 1800-CARECONNECT",
            color: "text-green-600",
          },
          {
            icon: MessageCircle,
            title: "Live Chat",
            desc: "Available 24/7",
            color: "text-purple-600",
          },
          {
            icon: MapPin,
            title: "Office Address",
            desc: "Bangalore, India",
            color: "text-orange-600",
          },
        ].map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition"
            >
              <Icon className={`${item.color} mx-auto mb-3`} size={32} />
              <h3 className="font-semibold text-lg">{item.title}</h3>
              <p className="text-muted-foreground text-sm">{item.desc}</p>
            </div>
          );
        })}
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-8">
            Frequently Asked Questions
          </h2>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Categories */}
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory("All")}
                className={`w-full py-3 rounded-lg font-semibold ${
                  selectedCategory === "All"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border"
                }`}
              >
                All FAQs
              </button>

              {faqs.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.category)}
                  className={`w-full py-3 rounded-lg font-semibold ${
                    selectedCategory === cat.category
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border"
                  }`}
                >
                  {cat.category}
                </button>
              ))}
            </div>

            {/* FAQ Items */}
            <div className="lg:col-span-3 space-y-4">
              {(selectedCategory === "All" ? allFaqs : filteredFaqs).map(
                (faq, index) => (
                  <FaqItem key={index} faq={faq} />
                ),
              )}

              {filteredFaqs.length === 0 && (
                <p className="text-muted-foreground">No results found.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Still need help?</h2>
        <p className="mb-6 text-blue-100">Contact our support team anytime.</p>
        <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100">
          Contact Support
        </button>
      </section>

      <Footer />
    </div>
  );
};

export default Help;
