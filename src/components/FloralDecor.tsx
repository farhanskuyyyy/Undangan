import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

interface FloralDecorProps {
  leftImage: string;
  rightImage: string;
  className?: string;
  opacity?: string;
}

const FloralDecor: React.FC<FloralDecorProps> = ({ 
  leftImage, 
  rightImage, 
  className = "",
  opacity = "opacity-60"
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLImageElement>(null);
  const rightRef = useRef<HTMLImageElement>(null);

  useGSAP(() => {
    const items = [leftRef.current, rightRef.current];
    
    items.forEach((item, index) => {
      if (!item) return;
      
      // 1. Continuous Floating/Swaying Animation
      gsap.to(item, {
        y: '+=20',
        x: index === 0 ? '+=10' : '-=10',
        rotation: index === 0 ? 3 : -3,
        duration: 3 + index,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // 2. Parallax Effect with ScrollTrigger
      gsap.to(item, {
        y: index === 0 ? '-=100' : '-=150',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });
    });
  }, { scope: containerRef });

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none z-10 overflow-hidden select-none ${className}`}
    >
      {/* Left Floral */}
      <img
        ref={leftRef}
        src={leftImage}
        alt=""
        className={`absolute -top-10 -left-10 w-48 md:w-80 ${opacity} drop-shadow-2xl`}
      />

      {/* Right Floral */}
      <img
        ref={rightRef}
        src={rightImage}
        alt=""
        className={`absolute -bottom-20 -right-20 w-56 md:w-96 ${opacity} drop-shadow-2xl`}
      />
    </div>
  );
};

export default FloralDecor;
