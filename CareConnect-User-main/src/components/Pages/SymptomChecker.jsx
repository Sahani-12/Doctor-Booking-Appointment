import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";
import BASE_URL from "@/constants/api";
import {
  Sun,
  Moon,
  Brain,
  Stethoscope,
  AlertTriangle,
  Activity,
} from "lucide-react";

const SymptomChecker = () => {
  const [symptoms, setSymptoms] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark",
  );

  const navigate = useNavigate();

  // 🌙 Dark Mode Toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // 🧠 AI Specialist Mapping
  const specializationMap = {
    "General Practitioner": "General Physician",
    "Family Physician": "General Physician",
    "Primary Care Physician": "General Physician",
    "General Doctor": "General Physician",
    Cardiologist: "Cardiologist",
    Neurologist: "Neurologist",
    Dermatologist: "Dermatologist",
    Pediatrician: "Pediatrician",
    Pulmonologist: "Pulmonologist",
    Orthopedic: "Orthopedic",
    Gynecologist: "Gynecologist",
    Psychiatrist: "Psychiatrist",
    Urologist: "Urologist",
  };

  // 🔍 Analyze Symptoms
  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) {
      alert("Please enter symptoms.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${BASE_URL}/symptoms/analyze`, {
        symptoms,
      });
      setResult(response.data.data);
    } catch (error) {
      console.error("Error analyzing symptoms:", error);
      alert("Failed to analyze symptoms");
    } finally {
      setLoading(false);
    }
  };

  // 👨‍⚕️ Navigate to Doctors
  const handleFindDoctor = () => {
    if (!result?.recommendedSpecialist) return;

    const rawSpecialist = result.recommendedSpecialist.split(" or ")[0].trim();

    const mappedSpecialist = specializationMap[rawSpecialist] || rawSpecialist;

    navigate(
      `/doctor-search?specialization=${encodeURIComponent(mappedSpecialist)}`,
    );
  };

  return (
    <div className="min-h-screen transition-all duration-300 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      {/* 🌙 Theme Toggle */}
      {/* <div className="fixed top-24 right-6 z-50">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:scale-110 transition"
        >
          {darkMode ? (
            <Sun className="text-yellow-400" />
          ) : (
            <Moon className="text-gray-700" />
          )}
        </button>
      </div> */}

      <div className="max-w-5xl mx-auto pt-28 px-4 pb-12">
        {/* 🧠 Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 dark:text-white">
            🧠 AI Symptom Checker
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Describe your symptoms and get AI-powered medical insights.
          </p>
        </div>

        {/* 🔮 Input Card */}
        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg shadow-xl rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <textarea
            className="w-full p-4 border rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-400"
            rows="4"
            placeholder="Enter symptoms (e.g., fever, headache, cough)..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />

          <button
            onClick={analyzeSymptoms}
            disabled={loading}
            className="mt-4 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
            ) : (
              <>
                <Brain size={20} />
                Analyze Symptoms
              </>
            )}
          </button>
        </div>

        {/* 📊 Results Section */}
        {result && (
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            {/* Possible Diseases */}
            <div className="bg-white dark:bg-gray-900 shadow-lg rounded-xl p-5">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Activity /> Possible Diseases
              </h3>
              <ul className="list-disc ml-6 mt-2 text-gray-700 dark:text-gray-300">
                {result.possibleDiseases.map((disease, index) => (
                  <li key={index}>{disease}</li>
                ))}
              </ul>
            </div>

            {/* Severity */}
            <div className="bg-white dark:bg-gray-900 shadow-lg rounded-xl p-5">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-red-500">
                <AlertTriangle /> Severity
              </h3>
              <p className="mt-2 text-gray-700 dark:text-gray-300">
                {result.severity}
              </p>
            </div>

            {/* Specialist */}
            <div className="bg-white dark:bg-gray-900 shadow-lg rounded-xl p-5">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-green-600">
                <Stethoscope /> Recommended Specialist
              </h3>
              <p className="mt-2 text-gray-700 dark:text-gray-300">
                {result.recommendedSpecialist}
              </p>
            </div>

            {/* Precautions */}
            <div className="bg-white dark:bg-gray-900 shadow-lg rounded-xl p-5">
              <h3 className="font-semibold text-lg text-purple-600">
                Precautions
              </h3>
              <ul className="list-disc ml-6 mt-2 text-gray-700 dark:text-gray-300">
                {result.precautions.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Advice */}
            <div className="bg-white dark:bg-gray-900 shadow-lg rounded-xl p-5 md:col-span-2">
              <h3 className="font-semibold text-lg text-indigo-600">
                Medical Advice
              </h3>
              <p className="mt-2 text-gray-700 dark:text-gray-300">
                {result.advice}
              </p>
            </div>
          </div>
        )}

        {/* 👨‍⚕️ Find Doctor Button */}
        {result && (
          <button
            onClick={handleFindDoctor}
            className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition shadow-lg"
          >
            Find Recommended Doctor
          </button>
        )}

        {/* ⚠️ Disclaimer */}
        {result && (
          <p className="text-center text-sm text-red-500 mt-4">
            ⚠️ This AI-generated information is for educational purposes only
            and is not a substitute for professional medical advice.
          </p>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SymptomChecker;
