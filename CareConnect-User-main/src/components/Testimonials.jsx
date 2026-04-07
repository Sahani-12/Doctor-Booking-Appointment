import { testimonials } from "../constants";

const Testimonials = () => {
  return (
    <div className="py-20 bg-gradient-to-b from-white to-gray-100">

      {/* Heading */}
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl sm:text-5xl font-bold">
          What People Are Saying
        </h2>
        <p className="text-gray-500 mt-4">
          Real experiences from our users who trust CareConnect.
        </p>
      </div>

      {/* Cards */}
      <div className="grid gap-8 mt-16 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto px-4">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition duration-300 hover:-translate-y-2"
          >
            {/* Stars */}
            <div className="text-yellow-400 mb-3">
              ⭐⭐⭐⭐⭐
            </div>

            {/* Text */}
            <p className="text-gray-600 text-sm leading-relaxed">
              “{testimonial.text}”
            </p>

            {/* User */}
            <div className="flex items-center mt-6">
              <img
                src={testimonial.image}
                alt=""
                className="w-12 h-12 rounded-full border mr-4"
              />

              <div>
                <h6 className="font-semibold">
                  {testimonial.user}
                </h6>
                <span className="text-xs text-gray-500">
                  {testimonial.company}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;