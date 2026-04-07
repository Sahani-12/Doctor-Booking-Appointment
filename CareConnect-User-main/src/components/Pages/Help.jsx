import React, { useState } from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import {
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  Clock,
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
          a: "To book an appointment: 1) Search for a doctor using filters (specialization, city, language), 2) Click on the doctor's profile to view details and availability, 3) Click 'Book Appointment', 4) Select your preferred date and time slot, 5) Confirm the booking. You'll receive a confirmation email with details.",
        },
        {
          q: "Can I reschedule my appointment?",
          a: "Yes, you can reschedule appointments up to 24 hours before the scheduled time. Go to 'My Appointments' in your dashboard, select the appointment, and click 'Reschedule'. Choose a new date and time that works for you.",
        },
        {
          q: "How far in advance can I book an appointment?",
          a: "You can book appointments up to 30 days in advance. Select any available slot shown on the doctor's calendar. Availability varies by doctor.",
        },
        {
          q: "What if I can't find a doctor in my area?",
          a: "Try using different filters: change the city, broaden specialization, or clear language filters. You can also contact our support team for recommendations. Many doctors cover multiple locations.",
        },
      ],
    },
    {
      id: 2,
      category: "Payment & Pricing",
      questions: [
        {
          q: "What are the consultation fees?",
          a: "Consultation fees vary by doctor and range from ₹300-₹2000 depending on experience, specialization, and location. The fee is displayed on each doctor's profile and confirmed before booking.",
        },
        {
          q: "What payment methods do you accept?",
          a: "We accept all major payment methods: Credit/Debit Cards (Visa, Mastercard, American Express), Digital Wallets (Google Pay, Apple Pay, PayTM), and UPI transfers.",
        },
        {
          q: "Is there a cancellation fee?",
          a: "Cancellations made 24 hours or more before the appointment are refunded in full. Cancellations within 24 hours of the appointment incur a 50% deduction. No-shows result in full fee loss.",
        },
        {
          q: "When will I receive my refund?",
          a: "Refunds are processed within 5-7 business days to your original payment method. You'll receive an email confirmation when the refund is initiated.",
        },
      ],
    },
    {
      id: 3,
      category: "Medical Records",
      questions: [
        {
          q: "How do I upload medical documents?",
          a: "Go to the 'Documents' section in your dashboard. Click 'Upload Document', select your file (PDF, image, etc.), add a title and description, then submit. Your documents are securely stored and shared with doctors during consultations.",
        },
        {
          q: "What documents can I upload?",
          a: "You can upload: Medical reports (blood tests, X-rays, scans), Prescriptions, Previous medical/surgery records, Insurance documents, Allergy information, and any other relevant health documents.",
        },
        {
          q: "Are my medical documents secure?",
          a: "Yes, all documents are encrypted and stored securely. Only authorized healthcare providers you share them with can access your documents. We comply with HIPAA and medical privacy standards.",
        },
        {
          q: "Can I share documents with multiple doctors?",
          a: "Yes, you can share specific documents with different doctors. During consultation setup or their request, you can grant access to your stored documents.",
        },
      ],
    },
    {
      id: 4,
      category: "Consultations",
      questions: [
        {
          q: "How does the video consultation work?",
          a: "At the scheduled appointment time, you'll receive a link to join the video call. Click the link to open a secure video room. The doctor will join as well. You can share documents during the call.",
        },
        {
          q: "What do I need for a video consultation?",
          a: "You need: a stable internet connection, a device with a camera and microphone (smartphone, tablet, or computer), a quiet private space, and a valid appointment booking.",
        },
        {
          q: "Can I reschedule the video consultation time?",
          a: "Yes, you can reschedule up to 24 hours before the appointment. Go to 'My Appointments' and select 'Reschedule'. Choose a new available time slot.",
        },
        {
          q: "What if I have technical issues during the consultation?",
          a: "If you have connectivity issues, try refreshing the page or rejoining the video call. If problems persist, you can contact our support team immediately. We'll help reschedule your consultation.",
        },
      ],
    },
    {
      id: 5,
      category: "Account & Profile",
      questions: [
        {
          q: "How do I update my profile?",
          a: "Click on your profile icon → 'Edit Profile'. Update your personal information, contact details, medical history, allergies, and preferences. Click 'Save' to update.",
        },
        {
          q: "Can I change my password?",
          a: "Yes, go to Account Settings → 'Change Password'. Enter your current password and new password (minimum 8 characters with uppercase, lowercase, numbers, and symbols).",
        },
        {
          q: "How do I delete my account?",
          a: "You can request account deletion from Account Settings → 'Delete Account'. Your data will be retained for 30 days in case you change your mind. After 30 days, it's permanently deleted.",
        },
        {
          q: "Is email verification required?",
          a: "Yes, you must verify your email during signup. If you didn't receive a verification email, click 'Resend Verification Email'. Check your spam folder if it's not in the inbox.",
        },
      ],
    },
    {
      id: 6,
      category: "Troubleshooting",
      questions: [
        {
          q: "I can't login to my account. What should I do?",
          a: "1) Check if your email is correct, 2) Verify your password is typed correctly (check CAPS LOCK), 3) Click 'Forgot Password' to reset it, 4) Clear browser cache and cookies, 5) Try another browser or device.",
        },
        {
          q: "Why am I not receiving appointment confirmation emails?",
          a: "Check your spam/junk folder. Add noreply@careconnect.com to your contacts. Update your email address in account settings. Check if your email storage is full.",
        },
        {
          q: "The doctor isn't showing up on the appointment call. What do I do?",
          a: "Wait a few minutes - doctors may be running slightly late. Check the video link is correct. Try refreshing the page. If waiting 10+ minutes, contact support immediately for assistance.",
        },
        {
          q: "Why can't I see search results when I search for a doctor?",
          a: "Clear your browser cache, try a simpler search term, check internet connection, try different filters, update your browser to the latest version.",
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
      <div className="bg-white border border-gray-200 rounded-xl mb-4 overflow-hidden hover:border-blue-400 hover:shadow-lg transition-all duration-300 group">
        <button
          onClick={() => setExpandedFaq(isExpanded ? null : faq.q)}
          className="w-full px-6 py-5 flex justify-between items-start hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300"
        >
          <span className="font-semibold text-gray-800 text-left group-hover:text-blue-600 transition-colors duration-300 leading-tight">
            {faq.q}
          </span>
          <ChevronDown
            size={22}
            className={`text-blue-600 transition-all transform flex-shrink-0 ml-4 mt-1 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>

        {isExpanded && (
          <div className="px-6 py-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-t-2 border-blue-100 animate-in fade-in slide-in-from-top-2">
            <p className="text-gray-700 leading-relaxed text-sm">{faq.a}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white min-h-screen">
      <Navbar />

      {/* Hero Section - Modern Gradient Background */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white pt-32 pb-24 overflow-hidden mt-16">
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-80 h-80 bg-blue-400 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-80 h-80 bg-indigo-400 rounded-full opacity-10 blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-6 border border-white/30">
              <HelpCircle size={18} />
              <span className="text-sm font-semibold">We're here to help</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Help & Support
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Find instant answers to your questions or connect with our support
              team. We're available 24/7 to help you.
            </p>

            {/* Search Bar in Hero */}
            <div className="relative max-w-2xl">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search help topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-700 text-gray-900 placeholder-gray-500 shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">2min</p>
                <p className="text-gray-600 text-sm">Avg response time</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">1M+</p>
                <p className="text-gray-600 text-sm">Happy users supported</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Award className="w-7 h-7 text-purple-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">99.8%</p>
                <p className="text-gray-600 text-sm">Satisfaction rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Support Channels */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          {/* Email Support */}
          <div className="group relative bg-white rounded-2xl border border-gray-200 p-8 hover:border-blue-400 hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Mail className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">
                Email Support
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                support@careconnect.com
              </p>
              <p className="text-xs font-semibold text-blue-600">
                24/7 Support
              </p>
            </div>
          </div>

          {/* Phone Support */}
          <div className="group relative bg-white rounded-2xl border border-gray-200 p-8 hover:border-green-400 hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Phone className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">
                Phone Support
              </h3>
              <p className="text-sm text-gray-600 mb-4">+91 1800-CARECONNECT</p>
              <p className="text-xs font-semibold text-green-600">
                Mon-Fri 9AM-6PM IST
              </p>
            </div>
          </div>

          {/* Live Chat */}
          <div className="group relative bg-white rounded-2xl border border-gray-200 p-8 hover:border-purple-400 hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <MessageCircle className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">
                Live Chat
              </h3>
              <p className="text-sm text-gray-600 mb-4">Available Now</p>
              <p className="text-xs font-semibold text-purple-600">
                Avg response: 2min
              </p>
            </div>
          </div>

          {/* Office Address */}
          <div className="group relative bg-white rounded-2xl border border-gray-200 p-8 hover:border-orange-400 hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-red-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <MapPin className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">
                Office Address
              </h3>
              <p className="text-sm text-gray-600 mb-4">Bangalore, India</p>
              <p className="text-xs font-semibold text-orange-600">
                Tech Park Building
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQs Section with Sidebar Categories */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600">
              Find quick answers to common questions below
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Category Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-2">
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setExpandedFaq(null);
                  }}
                  className={`w-full text-left px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                    selectedCategory === "All"
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  All FAQs
                </button>

                {faqs.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.category);
                      setExpandedFaq(null);
                    }}
                    className={`w-full text-left px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                      selectedCategory === category.category
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {category.category}
                  </button>
                ))}
              </div>
            </div>

            {/* FAQ Items */}
            <div className="lg:col-span-3">
              {selectedCategory === "All" ? (
                <div>
                  {faqs.map((category) => (
                    <div key={category.id} className="mb-12">
                      <h3 className="text-2xl font-bold text-blue-600 mb-6 pb-3 border-b-3 border-blue-200">
                        {category.category}
                      </h3>
                      <div className="space-y-4">
                        {category.questions
                          .filter(
                            (faq) =>
                              faq.q
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase()) ||
                              faq.a
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase()),
                          )
                          .map((faq) => (
                            <FaqItem key={faq.q} faq={faq} />
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFaqs.map((faq) => (
                    <FaqItem key={faq.q} faq={faq} />
                  ))}
                </div>
              )}

              {(selectedCategory === "All" ? allFaqs : filteredFaqs).filter(
                (faq) =>
                  faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  faq.a.toLowerCase().includes(searchTerm.toLowerCase()),
              ).length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
                  <Search size={40} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 font-semibold">
                    No results found
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Try searching with different keywords
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video Tutorials */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            Video Guides & Tutorials
          </h2>
          <p className="text-gray-600">
            Learn step-by-step with our video guides
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Getting Started",
              duration: "3:45",
              desc: "Learn how to create an account and search for doctors",
            },
            {
              title: "Booking an Appointment",
              duration: "5:20",
              desc: "Step-by-step guide on booking your first appointment",
            },
            {
              title: "Video Consultation Tips",
              duration: "4:10",
              desc: "Tips to ensure a smooth video consultation experience",
            },
            {
              title: "Managing Your Profile",
              duration: "3:30",
              desc: "Update your information and manage medical records",
            },
          ].map((video, idx) => (
            <div
              key={idx}
              className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-blue-400 hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-40 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:bg-white transition-colors duration-300 group-hover:scale-110">
                    <div className="w-0 h-0 border-l-8 border-l-blue-600 border-t-5 border-t-transparent border-b-5 border-b-transparent ml-1"></div>
                  </div>
                </div>
                <span className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {video.duration}
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                  {video.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  {video.desc}
                </p>
                <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:shadow-lg transition-all duration-300 font-semibold group-hover:scale-105 transform">
                  Watch Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 mt-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Still need help?</h2>
          <p className="text-lg text-blue-100 mb-8 leading-relaxed">
            Our dedicated support team is standing by to assist you with any
            questions or concerns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 hover:shadow-lg transition-all duration-300 hover:scale-105 transform">
              Contact Support Team
            </button>
            <button className="bg-blue-700 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-800 hover:shadow-lg transition-all duration-300 border-2 border-white/30 hover:scale-105 transform">
              Start Live Chat
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Help;
