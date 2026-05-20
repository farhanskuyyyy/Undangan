import { motion } from 'framer-motion';

interface GalleryImage {
  image_url: string;
  aspect_ratio: string;
}

interface GalleryProps {
  images: GalleryImage[];
}

const Gallery = ({ images }: GalleryProps) => {
  if (!images || images.length === 0) return null;

  return (
    <div id="gallery">
      <div className="max-w-6xl mx-auto px-4">
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
                src={image.image_url}
                alt={`Moment ${index + 1}`}
                className={`w-full h-auto object-cover ${image.aspect_ratio || 'aspect-square'} hover:scale-105 transition-transform duration-500`}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gallery;
