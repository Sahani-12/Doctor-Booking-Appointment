import { testimonials } from "../constants";
import { Star } from "lucide-react";

const Testimonials = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted transition-colors duration-300">
      {/* Heading */}
      <div className="text-center max-w-3xl mx-auto px-4">
        <span className="inline-block bg-black dark:bg-white text-orange-500 px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
          Testimonials
        </span>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mt-6 text-foreground">
          What People Are Saying
        </h2>

        <p className="text-muted-foreground mt-4 text-lg">
          Real experiences from our users who trust CareConnect.
        </p>
      </div>

      {/* Testimonial Cards */}
      <div className="grid gap-8 mt-16 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto px-4">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="group bg-card text-card-foreground p-6 rounded-2xl border border-border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
          >
            {/* Stars */}
            <div className="flex mb-3 text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill="currentColor" />
              ))}
            </div>

            {/* Testimonial Text */}
            <p className="text-muted-foreground text-sm leading-relaxed italic">
              “{testimonial.text}”
            </p>

            {/* User Info */}
            <div className="flex items-center mt-6">
              <img
                src={testimonial.image}
                alt={testimonial.user}
                className="w-12 h-12 rounded-full border border-border mr-4 object-cover"
              />

              <div>
                <h6 className="font-semibold text-foreground">
                  {testimonial.user}
                </h6>
                <span className="text-xs text-muted-foreground">
                  {testimonial.company}
                </span>
              </div>
            </div>

            {/* Hover Gradient Line */}
            <div className="mt-4 h-1 w-0 bg-gradient-to-r from-orange-500 to-orange-700 rounded-full transition-all duration-300 group-hover:w-full"></div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
