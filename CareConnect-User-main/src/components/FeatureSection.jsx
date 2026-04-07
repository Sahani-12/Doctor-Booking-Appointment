import { features } from "../constants";

const FeatureSection = () => {
  return (
    <div className="relative py-20 px-4 bg-gradient-to-b from-white to-gray-100">

      {/* Heading */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="bg-black text-orange-500 px-3 py-1 rounded-full text-sm uppercase">
          Features
        </span>

        <h2 className="text-3xl sm:text-5xl font-bold mt-6">
          Effortlessly Manage{" "}
          <span className="bg-gradient-to-r from-orange-500 to-orange-800 text-transparent bg-clip-text">
            Your Health
          </span>
        </h2>

        <p className="text-gray-500 mt-4">
          Smart healthcare solutions designed to simplify your medical journey.
        </p>
      </div>

      {/* Cards */}
      <div className="grid gap-8 mt-16 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition duration-300 hover:-translate-y-2"
          >
            {/* Icon */}
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-orange-100 text-orange-600 mb-4 text-xl">
              {feature.icon}
            </div>

            {/* Title */}
            <h5 className="text-xl font-semibold mb-2">
              {feature.text}
            </h5>

            {/* Description */}
            <p className="text-gray-500 text-sm leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureSection;