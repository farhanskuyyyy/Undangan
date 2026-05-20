import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

interface FloralDecorProps {
  topLeftImage?: string;
  topRightImage?: string;
  bottomLeftImage?: string;
  bottomRightImage?: string;
  className?: string;
  opacity?: string;
  scale?: number;
}

const FloralDecor: React.FC<FloralDecorProps> = ({ 
  topLeftImage, 
  topRightImage,
  bottomLeftImage,
  bottomRightImage,
  className = "",
  opacity = "opacity-80 md:opacity-90",
  scale = 1
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<HTMLImageElement>(null);
  const trRef = useRef<HTMLImageElement>(null);
  const blRef = useRef<HTMLImageElement>(null);
  const brRef = useRef<HTMLImageElement>(null);

  useGSAP(() => {
    const refs = [
      { ref: tlRef, x: 8, y: 12, rot: 2, duration: 6, delay: 0, pX: -30, pY: -60 },
      { ref: trRef, x: -8, y: 15, rot: -2, duration: 6.5, delay: 0.5, pX: 30, pY: -70 },
      { ref: blRef, x: 6, y: -10, rot: 3, duration: 6.2, delay: 1, pX: -20, pY: 60 },
      { ref: brRef, x: -6, y: -12, rot: -3, duration: 7, delay: 1.5, pX: 20, pY: 80 },
    ];
    
    refs.forEach((item) => {
      if (!item.ref.current) return;
      
      // 1. Continuous Floating/Swaying Animation
      gsap.to(item.ref.current, {
        y: `+=${item.y}`,
        x: `+=${item.x}`,
        rotation: item.rot,
        duration: item.duration,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: item.delay,
      });

      // 2. Parallax Effect with ScrollTrigger
      gsap.to(item.ref.current, {
        x: `+=${item.pX}`,
        y: `+=${item.pY}`,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        },
      });
    });
  }, { scope: containerRef });

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none z-10 overflow-hidden select-none ${className}`}
    >
      {/* Top Left Floral */}
      {topLeftImage && (
        <img
          ref={tlRef}
          src={topLeftImage}
          alt=""
          style={{ transform: `scale(${scale})` }}
          className={`absolute -top-20 -left-20 w-80 md:w-[32rem] ${opacity} drop-shadow-xl object-contain transition-transform duration-300`}
        />
      )}

      {/* Top Right Floral */}
      {topRightImage && (
        <img
          ref={trRef}
          src={topRightImage}
          alt=""
          style={{ transform: `scale(${scale})` }}
          className={`absolute -top-20 -right-20 w-80 md:w-[32rem] ${opacity} drop-shadow-xl object-contain transition-transform duration-300`}
        />
      )}

      {/* Bottom Left Floral */}
      {bottomLeftImage && (
        <img
          ref={blRef}
          src={bottomLeftImage}
          alt=""
          style={{ transform: `scale(${scale})` }}
          className={`absolute -bottom-20 -left-20 w-80 md:w-[32rem] ${opacity} drop-shadow-xl object-contain transition-transform duration-300`}
        />
      )}

      {/* Bottom Right Floral */}
      {bottomRightImage && (
        <img
          ref={brRef}
          src={bottomRightImage}
          alt=""
          style={{ transform: `scale(${scale})` }}
          className={`absolute -bottom-20 -right-20 w-80 md:w-[32rem] ${opacity} drop-shadow-xl object-contain transition-transform duration-300`}
        />
      )}
    </div>
  );
};

export default FloralDecor;
