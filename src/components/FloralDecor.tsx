import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const FloralDecor: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const topLeftRef = useRef<HTMLImageElement>(null);
  const bottomRightRef = useRef<HTMLImageElement>(null);
  const bottomLeftRef = useRef<HTMLImageElement>(null);
  const topRightRef = useRef<HTMLImageElement>(null);

  useGSAP(() => {
    // 1. Continuous Floating/Swaying Animation
    const items = [topLeftRef.current, bottomRightRef.current, bottomLeftRef.current, topRightRef.current];
    
    items.forEach((item, index) => {
      if (!item) return;
      
      // Infinite subtle floating
      gsap.to(item, {
        y: '+=20',
        x: index % 2 === 0 ? '+=10' : '-=10',
        rotation: index % 2 === 0 ? 3 : -3,
        duration: 3 + index,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // 2. Parallax Effect with ScrollTrigger
      gsap.to(item, {
        y: index % 2 === 0 ? '-=150' : '-=250', // Move up at different rates
        scrollTrigger: {
          trigger: 'body',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
        },
      });
    });
  }, { scope: containerRef });

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-[1] overflow-hidden select-none pointer-events-none"
    >
      {/* Top Left Floral */}
      <img
        ref={topLeftRef}
        src="https://freepngimg.com/download/flower/6-2-flower-png-picture.png"
        alt=""
        className="absolute -top-10 -left-10 w-48 md:w-80 opacity-60 md:opacity-80 drop-shadow-2xl"
      />

      {/* Bottom Right Floral */}
      <img
        ref={bottomRightRef}
        src="https://freepngimg.com/download/flower/1-2-flower-png-file.png"
        alt=""
        className="absolute -bottom-20 -right-20 w-56 md:w-96 opacity-60 md:opacity-80 drop-shadow-2xl"
      />

      {/* Subtle Bottom Left - Adding more depth */}
      <img
        ref={bottomLeftRef}
        src="https://freepngimg.com/download/flower/6-2-flower-png-picture.png"
        alt=""
        className="absolute top-[60%] -left-20 w-32 md:w-56 opacity-30 md:opacity-40 rotate-180 brightness-75 contrast-75"
      />

      {/* Subtle Top Right - Adding more depth */}
      <img
        ref={topRightRef}
        src="https://freepngimg.com/download/flower/1-2-flower-png-file.png"
        alt=""
        className="absolute top-[20%] -right-16 w-32 md:w-48 opacity-30 md:opacity-40 rotate-90 grayscale-[0.2]"
      />
    </div>
  );
};

export default FloralDecor;
