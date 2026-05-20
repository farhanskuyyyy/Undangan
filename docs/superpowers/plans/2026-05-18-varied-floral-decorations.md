# Varied and Prominent Floral Decorations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance the visual appeal of the digital invitation by adding varied, high-quality floral sets and making them more prominent across all sections except the Hero.

**Architecture:** Refactor `FloralDecor.tsx` to handle 4 distinct images and provide more customization (size, opacity). Update `Invitation.tsx` to use these sets.

**Tech Stack:** React, Tailwind CSS, GSAP.

---

### Task 1: Refactor FloralDecor Component

**Files:**
- Modify: `src/components/FloralDecor.tsx`

- [ ] **Step 1: Update FloralDecorProps and Default Values**
    Increase default size and opacity. Add individual image props if not already distinct.

```tsx
interface FloralDecorProps {
  topLeftImage?: string;
  topRightImage?: string;
  bottomLeftImage?: string;
  bottomRightImage?: string;
  className?: string;
  opacity?: string; // Default to 'opacity-80 md:opacity-90'
}
```

- [ ] **Step 2: Enhance GSAP Animations**
    Ensure swaying animation is distinct for each corner with different durations and delays.

- [ ] **Step 3: Update JSX for Visibility**
    Increase size in Tailwind classes for both mobile and desktop.

```tsx
// Example for Top Left
<img
  ref={tlRef}
  src={topLeftImage}
  alt=""
  className={`absolute -top-20 -left-20 w-72 md:w-[28rem] ${opacity} drop-shadow-2xl object-contain`}
/>
```

- [ ] **Step 4: Commit**

```bash
git add src/components/FloralDecor.tsx
git commit -m "feat(ui): enhance FloralDecor with larger sizes and distinct animations"
```

### Task 2: Apply Floral Sets to Invitation Sections

**Files:**
- Modify: `src/pages/Invitation.tsx`

- [ ] **Step 1: Remove FloralDecor from Hero Section**
    Delete the `<FloralDecor />` component from the first `<section>`.

- [ ] **Step 2: Apply Set A to Countdown & Rundown**
    TL: `https://www.freeiconspng.com/uploads/watercolor-flower-png-10.png`
    TR: `https://www.freeiconspng.com/uploads/pink-watercolor-flower-png-6.png`
    BL: `https://www.freeiconspng.com/uploads/watercolor-flower-png-transparent-17.png`
    BR: `https://www.freeiconspng.com/uploads/wedding-flowers-png-15.png`

- [ ] **Step 3: Apply Set B to Love Story**
    TL: `https://www.freeiconspng.com/uploads/watercolor-floral-wedding-invitation-flower-png-2.png`
    TR: `https://freepngimg.com/download/flower/1-2-flower-png-file.png`
    BL: `https://www.freeiconspng.com/uploads/flower-png-25.png`
    BR: `https://freepngimg.com/download/flower/6-2-flower-png-picture.png`

- [ ] **Step 4: Apply Set C to Gallery**
    TL: `https://www.freeiconspng.com/uploads/pink-flowers-png-25.png`
    TR: `https://www.freeiconspng.com/uploads/watercolor-flower-png-18.png`
    BL: `https://www.freeiconspng.com/uploads/floral-wedding-invitation-flower-png-9.png`
    BR: `https://www.freeiconspng.com/uploads/wedding-flowers-png-2.png`

- [ ] **Step 5: Apply Set D to Location & RSVP**
    TL: `https://www.freeiconspng.com/uploads/watercolor-flower-png-23.png`
    TR: `https://www.freeiconspng.com/uploads/watercolor-flower-png-21.png`
    BL: `https://www.freeiconspng.com/uploads/watercolor-flower-png-1.png`
    BR: `https://www.freeiconspng.com/uploads/pink-watercolor-flowers-png-2.png`

- [ ] **Step 6: Commit**

```bash
git add src/pages/Invitation.tsx
git commit -m "feat(ui): add varied floral sets to all invitation sections"
```

### Task 3: Final Verification

- [ ] **Step 1: Run dev server and verify visually**
    Check all sections for floral visibility, size, and animation.

- [ ] **Step 2: Build check**
    Run `npm run build` to ensure no regressions.
