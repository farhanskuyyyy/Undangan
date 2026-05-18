import { motion } from 'framer-motion';

const images = [
  { src: '/contoh1.JPG', alt: 'Moment 1', aspect: 'aspect-square' },
  { src: '/contoh1.JPG', alt: 'Moment 2', aspect: 'aspect-video' },
  { src: '/contoh1.JPG', alt: 'Moment 3', aspect: 'aspect-[3/4]' },
  { src: '/contoh1.JPG', alt: 'Moment 4', aspect: 'aspect-[4/3]' },
  { src: '/contoh1.JPG', alt: 'Moment 5', aspect: 'aspect-square' },
  { src: '/contoh1.JPG', alt: 'Moment 6', aspect: 'aspect-video' },
  { src: '/contoh1.JPG', alt: 'Moment 7', aspect: 'aspect-[3/4]' },
  { src: '/contoh1.JPG', alt: 'Moment 8', aspect: 'aspect-[4/3]' },
];

const Gallery = () => {
  return (
    <section className="py-16 px-4 bg-cream/30" id="gallery">
      <div className="max-w-6xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-serif text-sage text-center mb-12"
        >
          Our Precious Moments
        </motion.h2>
        
        <div className="columns-2 md:columns-3 gap-4 space-y-4">
          {images.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`break-inside-avoid mb-4 overflow-hidden rounded-lg border-4 border-white shadow-md hover:shadow-xl transition-shadow duration-300`}
            >
              <img
                src={image.src}
                alt={image.alt}
                className={`w-full h-auto object-cover ${image.aspect} hover:scale-105 transition-transform duration-500`}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
