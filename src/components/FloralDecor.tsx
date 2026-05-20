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
}

const FloralDecor: React.FC<FloralDecorProps> = ({ 
  topLeftImage, 
  topRightImage,
  bottomLeftImage,
  bottomRightImage,
  className = "",
  opacity = "opacity-80 md:opacity-90"
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<HTMLImageElement>(null);
  const trRef = useRef<HTMLImageElement>(null);
  const blRef = useRef<HTMLImageElement>(null);
  const brRef = useRef<HTMLImageElement>(null);

  useGSAP(() => {
    const refs = [
      { ref: tlRef, x: 12, y: 25, rot: 5, duration: 4.5, delay: 0, pX: -60, pY: -110 },
      { ref: trRef, x: -18, y: 30, rot: -6, duration: 5.2, delay: 0.8, pX: 70, pY: -130 },
      { ref: blRef, x: 15, y: -22, rot: 8, duration: 4.8, delay: 1.2, pX: -50, pY: 110 },
      { ref: brRef, x: -12, y: -28, rot: -5, duration: 5.5, delay: 1.8, pX: 60, pY: 160 },
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
          className={`absolute -top-24 -left-24 w-72 md:w-[28rem] ${opacity} drop-shadow-2xl object-contain`}
        />
      )}

      {/* Top Right Floral */}
      {topRightImage && (
        <img
          ref={trRef}
          src={topRightImage}
          alt=""
          className={`absolute -top-28 -right-28 w-80 md:w-[32rem] ${opacity} drop-shadow-2xl object-contain rotate-90 scale-x-[-1]`}
        />
      )}

      {/* Bottom Left Floral */}
      {bottomLeftImage && (
        <img
          ref={blRef}
          src={bottomLeftImage}
          alt=""
          className={`absolute -bottom-32 -left-28 w-80 md:w-[36rem] ${opacity} drop-shadow-2xl object-contain -rotate-90 scale-y-[-1]`}
        />
      )}

      {/* Bottom Right Floral */}
      {bottomRightImage && (
        <img
          ref={brRef}
          src={bottomRightImage}
          alt=""
          className={`absolute -bottom-36 -right-32 w-80 md:w-[34rem] ${opacity} drop-shadow-2xl object-contain rotate-180`}
        />
      )}
    </div>
  );
};

export default FloralDecor;
