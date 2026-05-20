# Section-Specific Floral Decorations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor floral decorations from a global overlay to section-specific components with unique images and animations.

**Architecture:** 
- Refactor `FloralDecor.tsx` to accept `leftImage`, `rightImage`, and optional `className` props.
- Use `absolute` positioning within `relative` section containers in `Invitation.tsx`.
- Keep GSAP infinite swaying and parallax effects, scoped to the individual section.

**Tech Stack:** React, Tailwind CSS, GSAP (@gsap/react)

---

### Task 1: Refactor FloralDecor.tsx

**Files:**
- Modify: `src/components/FloralDecor.tsx`

- [ ] **Step 1: Update FloralDecor.tsx to accept props and use absolute positioning**

```tsx
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
```

- [ ] **Step 2: Commit refactored FloralDecor**

```bash
git add src/components/FloralDecor.tsx
git commit -m "refactor(ui): make FloralDecor section-specific and prop-driven"
```

### Task 2: Update Invitation.tsx

**Files:**
- Modify: `src/pages/Invitation.tsx`

- [ ] **Step 1: Update Invitation.tsx to use section-specific FloralDecor**

```tsx
// ... existing imports ...
import FloralDecor from '../components/FloralDecor'

// ... existing code ...

  return (
    <div className="bg-[#fdfcfb] min-h-screen font-sans text-gray-900 selection:bg-sage/20 relative overflow-x-hidden">
      <ParallaxDecor />
      {/* Global FloralDecor removed */}

      <AnimatePresence>
        {/* ... Envelope ... */}
      </AnimatePresence>

      <div className={`transition-all duration-1000 ${isOpen ? 'opacity-100' : 'opacity-0 blur-sm'}`}>
        {/* Hero Section */}
        <section className="bg-[#FDFBF7] relative overflow-hidden">
          <FloralDecor 
            leftImage="https://freepngimg.com/download/flower/6-2-flower-png-picture.png"
            rightImage="https://freepngimg.com/download/flower/6-2-flower-png-picture.png"
            className="rotate-12"
          />
          <div className="max-w-4xl mx-auto relative z-10">
            <Hero 
              groomName={settings?.groom_name || 'Groom'} 
              brideName={settings?.bride_name || 'Bride'} 
              weddingDate={settings?.wedding_date || ''}
            />
          </div>
        </section>
        
        {/* Countdown & Rundown Section */}
        <section className="bg-[#F4F1EA] py-24 relative overflow-hidden">
          <FloralDecor 
            leftImage="https://freepngimg.com/download/flower/1-2-flower-png-file.png"
            rightImage="https://freepngimg.com/download/flower/1-2-flower-png-file.png"
            opacity="opacity-40"
            className="-rotate-6"
          />
          <div className="max-w-4xl mx-auto px-6 relative z-10">
            {/* ... existing Countdown and Rundown ... */}
          </div>
        </section>

        {/* Love Story Section */}
        <section className="bg-[#E8EDE7] py-24 relative overflow-hidden">
          <FloralDecor 
            leftImage="https://www.freeiconspng.com/uploads/watercolor-floral-wedding-invitation-flower-png-2.png"
            rightImage="https://www.freeiconspng.com/uploads/watercolor-floral-wedding-invitation-flower-png-2.png"
            opacity="opacity-50"
          />
          <div className="max-w-4xl mx-auto relative z-10">
            <LoveStory stories={loveStories} />
          </div>
        </section>

        {/* Gallery Section */}
        <section className="bg-[#FDFBF7] py-24 relative overflow-hidden">
          <FloralDecor 
            leftImage="https://www.freeiconspng.com/uploads/flower-png-25.png"
            rightImage="https://www.freeiconspng.com/uploads/flower-png-25.png"
            opacity="opacity-40"
            className="rotate-45 scale-110"
          />
          <div className="max-w-4xl mx-auto relative z-10">
            <Gallery images={galleries} />
          </div>
        </section>

        {/* Location & RSVP Section */}
        <section className="bg-[#F0F4F1] py-24 relative overflow-hidden">
          <FloralDecor 
            leftImage="https://www.freeiconspng.com/uploads/watercolor-flower-png-transparent-17.png"
            rightImage="https://www.freeiconspng.com/uploads/watercolor-flower-png-transparent-17.png"
            opacity="opacity-50"
            className="-rotate-12"
          />
          <div className="max-w-4xl mx-auto px-6 relative z-10">
            {/* ... existing content ... */}
          </div>
        </section>

        {/* ... Footer ... */}
      </div>
      <MusicPlayer autoPlay={isOpen} />
    </div>
  )
}
```

- [ ] **Step 2: Commit updated Invitation.tsx**

```bash
git add src/pages/Invitation.tsx
git commit -m "feat(ui): add section-specific GSAP floral decorations"
```
