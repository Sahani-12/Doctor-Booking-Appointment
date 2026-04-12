import { features } from "../constants";

const FeatureSection = () => {
  return (
    <section className="relative py-20 px-4 bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-950 transition-colors duration-300">
      {/* Heading */}
      <div className="text-center max-w-4xl mx-auto">
        {/* Badge */}
        <span className="inline-block bg-black dark:bg-white text-orange-500 px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
          Features
        </span>

        {/* Main Heading */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mt-6 leading-tight tracking-tight text-gray-900 dark:text-white">
          Effortlessly Manage{" "}
          <span className="block bg-gradient-to-r from-orange-500 via-orange-600 to-orange-800 dark:from-orange-400 dark:via-amber-400 dark:to-yellow-300 bg-clip-text text-transparent">
            Your Health
          </span>
        </h2>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 mt-4 text-lg">
          Smart healthcare solutions designed to simplify your medical journey.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-8 mt-16 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-xl p-6 transition-all duration-300 hover:-translate-y-2"
          >
            {/* Icon */}
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 mb-4 text-xl transition">
              {feature.icon}
            </div>

            {/* Title */}
            <h5 className="text-xl font-semibold mb-2">{feature.text}</h5>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {feature.description}
            </p>

            {/* Hover Gradient Line */}
            <div className="mt-4 h-1 w-0 bg-gradient-to-r from-orange-500 to-orange-700 rounded-full transition-all duration-300 group-hover:w-full"></div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeatureSection;
