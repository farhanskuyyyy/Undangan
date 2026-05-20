import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const LeafIcon = () => (
  <svg viewBox="0 0 100 100" fill="currentColor">
    <path d="M50 0 C60 30 90 40 100 50 C90 60 60 70 50 100 C40 70 10 60 0 50 C10 40 40 30 50 0" />
  </svg>
);

const FlowerIcon = () => (
  <svg viewBox="0 0 100 100" fill="currentColor">
    <path d="M50 0 C55 20 75 20 85 35 C95 50 85 70 70 75 C50 80 50 100 50 100 C50 100 50 80 30 75 C15 70 5 50 15 35 C25 20 45 20 50 0" />
  </svg>
);

const PetalIcon = () => (
  <svg viewBox="0 0 100 100" fill="currentColor">
    <path d="M50 10 Q70 10 80 40 T50 90 Q20 70 20 40 T50 10" />
  </svg>
);

export const ParallaxDecor: React.FC = () => {
  const { scrollYProgress } = useScroll();

  // Create different parallax offsets for various elements
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -500]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const y5 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const y6 = useTransform(scrollYProgress, [0, 1], [0, -600]);

  const rotate1 = useTransform(scrollYProgress, [0, 1], [0, 45]);
  const rotate2 = useTransform(scrollYProgress, [0, 1], [0, -90]);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden select-none">
      {/* Top Left - Sage Leaf */}
      <motion.div 
        style={{ y: y1, rotate: rotate1, opacity: 0.07 }}
        className="absolute top-[5%] -left-8 w-32 h-32 text-sage"
      >
        <LeafIcon />
      </motion.div>

      {/* Top Right - Terracotta Flower */}
      <motion.div 
        style={{ y: y2, rotate: rotate2, opacity: 0.05 }}
        className="absolute top-[15%] -right-12 w-48 h-48 text-terracotta"
      >
        <FlowerIcon />
      </motion.div>

      {/* Mid Left - Sage Petal */}
      <motion.div 
        style={{ y: y3, rotate: 15, opacity: 0.06 }}
        className="absolute top-[40%] -left-6 w-24 h-24 text-sage"
      >
        <PetalIcon />
      </motion.div>

      {/* Mid Right - Sage Leaf */}
      <motion.div 
        style={{ y: y4, rotate: -25, opacity: 0.05 }}
        className="absolute top-[55%] -right-8 w-40 h-40 text-sage"
      >
        <LeafIcon />
      </motion.div>

      {/* Bottom Left - Terracotta Petal */}
      <motion.div 
        style={{ y: y5, rotate: 45, opacity: 0.06 }}
        className="absolute top-[75%] -left-12 w-36 h-36 text-terracotta"
      >
        <PetalIcon />
      </motion.div>

      {/* Bottom Right - Sage Flower */}
      <motion.div 
        style={{ y: y6, rotate: -15, opacity: 0.04 }}
        className="absolute top-[85%] -right-10 w-56 h-56 text-sage"
      >
        <FlowerIcon />
      </motion.div>

      {/* Random small petals */}
      <motion.div 
        style={{ y: y2, opacity: 0.08 }}
        className="absolute top-[25%] left-[20%] w-8 h-8 text-sage"
      >
        <PetalIcon />
      </motion.div>

      <motion.div 
        style={{ y: y4, opacity: 0.07 }}
        className="absolute top-[65%] right-[25%] w-10 h-10 text-terracotta"
      >
        <PetalIcon />
      </motion.div>
    </div>
  );
};

