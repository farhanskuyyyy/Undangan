# Masonry Gallery Design

**Topic:** Responsive Masonry Gallery for Digital Invitation
**Date:** 2026-05-18

## Purpose
Add a visually appealing photo gallery to the digital invitation using a masonry layout to showcase memories of the couple.

## Architecture & Design
- **Component:** `src/components/Gallery.tsx`
- **Layout:** Tailwind CSS `columns-2 md:columns-3` with `break-inside-avoid`.
- **Styling:** Earth tones (Sage, Cream, Terracotta) for borders/shadows.
- **Animations:** Framer Motion `initial`, `whileInView`, and `viewport` for entrance effects.
- **Data:** Static array of image objects with varied aspect ratios.

## Technical Details
- **Tech Stack:** React, Tailwind CSS, Framer Motion.
- **Assets:** `/contoh1.JPG` (repeated with different aspect ratios).
- **Responsive:** 2 columns on mobile, 3 columns on medium screens and above.

## Success Criteria
1. Gallery displays at least 8 images.
2. Masonry effect is visible (images of different heights fitting together).
3. Subtle entrance animations as the user scrolls.
4. Styling matches the "Earth Tones" theme.
