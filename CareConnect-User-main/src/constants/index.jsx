import { BotMessageSquare } from "lucide-react";
import { BatteryCharging } from "lucide-react";
import { Fingerprint } from "lucide-react";
import { ShieldHalf } from "lucide-react";
import { PlugZap } from "lucide-react";
import { GlobeLock } from "lucide-react";
import qrCodeImage from "../assets/qr-code-1.png";
import { QrCode, UserCircle } from "lucide-react";
import { Link } from "react-router-dom";

import user1 from "../assets/profile-pictures/user1.jpg";
import user2 from "../assets/profile-pictures/user2.jpg";
import user3 from "../assets/profile-pictures/user3.jpg";
import user4 from "../assets/profile-pictures/user4.jpg";
import user5 from "../assets/profile-pictures/user5.jpg";
import user6 from "../assets/profile-pictures/user6.jpg";

// export const navItems = [
//   { label: "Features", href: "#" },
//   { label: "Workflow", href: "#" },
//   { label: "Pricing", href: "#" },
//   { label: "Testimonials", href: "#" },
// ];

export const navItems = [
  { label: "Find doctors", href: "/doctor-search" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Help", href: "/help" },
];

export const qrCode = [
  {
    icon: <Fingerprint />,
    text: "Multi-Device Access",
    description:
      "Access your medical records, prescriptions, and consultations seamlessly across mobile, desktop, and tablets.",
  },
  {
    icon: (
      <Link to="/qr-code-sharing">
        <QrCode />
      </Link>
    ), // Added routing
    text: <Link to="/qr-code-sharing">QR Code Sharing</Link>, // Wrapped text in Link
    description:
      "Easily share and access digital prescriptions or medical records using secure QR codes.",
  },
  {
    icon: <UserCircle />,
    text: "Patient Profile",
    description:
      "Manage and update your personal health details, prescriptions, and reports all in one place.",
  },
];
export const testimonials = [
  {
    user: "Dr. Aryan Mehta",
    company: "CityCare Hospital",
    image: user1,
    text: "The platform has streamlined our patient management system, making consultations and scheduling seamless. Highly recommended for healthcare professionals!",
  },
  {
    user: "Sarah Kapoor",
    company: "Wellness Diagnostics",
    image: user2,
    text: "This service has transformed the way we handle appointments and patient records. It’s intuitive, efficient, and incredibly reliable.",
  },
  {
    user: "Dr. Ananya Rao",
    company: "Healing Hands Clinic",
    image: user3,
    text: "From online consultations to prescription tracking, this platform has improved patient care significantly. It’s a game-changer in medical practice.",
  },
  {
    user: "Dr. Vikram Khanna",
    company: "Pulse Multi-Specialty Hospital",
    image: user4,
    text: "The ease of accessing medical records and coordinating with patients remotely has been remarkable. This platform is essential for modern healthcare.",
  },
  {
    user: "Meera Sharma",
    company: "HealthyLife Physiotherapy",
    image: user5,
    text: "I’ve never seen a more user-friendly and secure medical platform. It has simplified appointment booking and patient follow-ups like never before!",
  },
  {
    user: "Dr. Rohan Batra",
    company: "CareFirst Medical Center",
    image: user6,
    text: "The integration of telemedicine and digital health records has enhanced our efficiency. Our patients love the convenience, and so do we!",
  },
];

export const features = [
  {
    icon: <BotMessageSquare />,
    text: "Hospital Triage Assistant",
    description:
      "Start with guided symptom triage before moving into OPD, emergency, or specialist care.",
  },
  {
    icon: <QrCode />,
    text: "Unified Patient Portal",
    description:
      "Track appointments, admissions, lab reports, and billing from any device.",
    // description:
    //  <QrCode />,
  },
  {
    icon: <ShieldHalf />,
    text: "Clinical Records Hub",
    description:
      "Receive secure doctor notes, care plans, and discharge-ready documentation in one place.",
  },
  {
    icon: <BatteryCharging />,
    text: "Continuous Doctor Access",
    description:
      "Move from appointment booking to live consultation and follow-up without leaving the platform.",
  },
  {
    icon: <PlugZap />,
    text: "Integrated Lab Workflows",
    description:
      "Doctors can order tests and patients can track progress and reports from the dashboard.",
  },
  {
    icon: <GlobeLock />,
    text: "Smart Hospital Billing",
    description:
      "Keep inpatient, department, and service charges visible with live balance updates.",
  },
];

export const pricingOptions = [
  {
    title: "Basic Health",
    price: "₹499",
    features: [
      "Unlimited Doctor Consultations",
      "10% Discount on Medicines",
      "Free Lab Test Booking",
      "24/7 Chat Support",
    ],
  },
  {
    title: "Premium Care",
    price: "₹999",
    features: [
      "Unlimited Doctor Consultations",
      "20% Discount on Medicines",
      "Priority Appointments",
      "Dedicated Health Advisor",
    ],
  },
  {
    title: "Family Plan",
    price: "₹1,499",
    features: [
      "Covers 4 Family Members",
      "Unlimited Video Consultations",
      "Free Ambulance Support",
      "Exclusive Health Insights",
    ],
  },
];
export const resourcesLinks = [
  { href: "#", text: "Patient Guide" },
  { href: "#", text: "Medical Resources" },
  { href: "#", text: "Health Articles" },
  { href: "#", text: "Doctor's Advice" },
  { href: "#", text: "Support Center" },
];

export const platformLinks = [
  { href: "#", text: "Telemedicine" },
  { href: "#", text: "Appointment Booking" },
  { href: "#", text: "E-Prescriptions" },
  { href: "#", text: "Health Records" },
  { href: "#", text: "Insurance Support" },
];

export const communityLinks = [
  { href: "#", text: "Medical Events" },
  { href: "#", text: "Health Seminars" },
  { href: "#", text: "Wellness Webinars" },
  { href: "#", text: "Healthcare Camps" },
  { href: "#", text: "Medical Careers" },
];

export const qrCodes = [
  {
    image: qrCodeImage,
    text: "Hospital QR Code",
    description:
      "Scan this QR code to access hospital services and information instantly.",
  },
];
