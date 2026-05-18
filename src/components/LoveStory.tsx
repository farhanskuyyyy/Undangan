import { motion } from 'framer-motion';

interface StoryPoint {
  title: string;
  event_date: string;
  description: string;
  image_url: string;
}

interface LoveStoryProps {
  stories: StoryPoint[];
}

export const LoveStory = ({ stories }: LoveStoryProps) => {
  if (!stories || stories.length === 0) return null;

  return (
    <section className="py-24 bg-cream relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-serif text-sage italic mb-4">Our Love Story</h2>
          <div className="w-24 h-1 bg-terracotta mx-auto rounded-full"></div>
        </motion.div>

        <div className="relative">
          {/* Wavy Timeline Line */}
          <div className="absolute left-1/2 -translate-x-1/2 h-full w-1 hidden md:block">
            <svg
              className="h-full w-full"
              preserveAspectRatio="none"
              viewBox="0 0 40 1000"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 0C30 50 10 100 20 150C30 200 10 250 20 300C30 350 10 400 20 450C30 500 10 550 20 600C30 650 10 700 20 750C30 800 10 850 20 900C30 950 10 1000 20 1050"
                stroke="#BC8F8F"
                strokeWidth="2"
                strokeDasharray="8 8"
              />
            </svg>
          </div>

          <div className="space-y-12 md:space-y-24">
            {stories.map((point, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={`flex flex-col ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                } items-center gap-8 md:gap-16`}
              >
                {/* Image */}
                <div className="flex-1 w-full">
                  <div className="relative group">
                    <div className="absolute -inset-2 bg-sage/20 rounded-2xl blur-lg group-hover:bg-sage/30 transition duration-500"></div>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border-4 border-white shadow-xl">
                      <img
                        src={point.image_url}
                        alt={point.title}
                        className="w-full h-full object-cover transform transition duration-700 group-hover:scale-110"
                      />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  <div className={`flex flex-col ${index % 2 === 0 ? 'md:items-start' : 'md:items-end'} gap-2`}>
                    <span className="text-terracotta font-medium tracking-widest uppercase text-sm">
                      {point.event_date}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-serif text-sage italic">
                      {point.title}
                    </h3>
                    <p className={`text-gray-600 font-light leading-relaxed max-w-sm ${
                      index % 2 === 0 ? 'md:text-left' : 'md:text-right'
                    }`}>
                      {point.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
