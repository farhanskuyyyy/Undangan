import { motion } from 'framer-motion';

interface StoryPoint {
  title: string;
  event_date: string;
  description: string;
  image_url: string; // Keeping in interface for compatibility, though unused in view
}

interface LoveStoryProps {
  stories: StoryPoint[];
}

export const LoveStory = ({ stories }: LoveStoryProps) => {
  if (!stories || stories.length === 0) return null;

  return (
    <div className="relative overflow-hidden">
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

          <div className="space-y-16 md:space-y-32">
            {stories.map((point, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="relative flex justify-center"
              >
                {/* Timeline Dot (Mobile only, or as accent) */}
                <div className="absolute left-1/2 -translate-x-1/2 top-0 w-4 h-4 rounded-full bg-terracotta/40 md:hidden"></div>

                {/* Content Block */}
                <div className={`w-full md:w-1/2 px-8 ${
                  index % 2 === 0 ? 'md:mr-[50%] md:text-right' : 'md:ml-[50%] md:text-left'
                } text-center`}>
                  <div className={`flex flex-col ${
                    index % 2 === 0 ? 'md:items-end' : 'md:items-start'
                  } items-center gap-3`}>
                    <span className="text-terracotta font-medium tracking-widest uppercase text-sm">
                      {point.event_date}
                    </span>
                    <h3 className="text-3xl md:text-4xl font-serif text-sage italic">
                      {point.title}
                    </h3>
                    <div className="w-12 h-px bg-terracotta/30 my-1 md:hidden"></div>
                    <p className="text-gray-600 font-light leading-relaxed max-w-sm">
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

