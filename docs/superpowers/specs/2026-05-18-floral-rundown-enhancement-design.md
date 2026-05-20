# Spec: Floral Decorations Enhancement & Rundown Fix

## Overview
Enhance the visual appeal of the digital invitation by upgrading the floral decorations to a four-corner layout with refined animations. Additionally, fix the issue where the wedding rundown is not appearing by ensuring correct database permissions and frontend rendering.

## Goals
- Upgrade `FloralDecor.tsx` to support 4 floral elements (TL, TR, BL, BR).
- Increase size, opacity, and refinement of floral animations (GSAP).
- Ensure `Rundown` component is correctly rendered and data is fetched.
- Fix Supabase RLS policies to allow public access to wedding data.

## Design

### 1. Floral Decorations (`src/components/FloralDecor.tsx`)
- **Props**:
  - `topLeftImage?: string`
  - `topRightImage?: string`
  - `bottomLeftImage?: string`
  - `bottomRightImage?: string`
  - `opacity?: string` (default: `opacity-80`)
- **Implementation**:
  - Render four images, positioned at each corner with `absolute`.
  - Use `object-contain` or `object-cover` with bleed-off-screen positioning (`-top-20`, `-left-20`, etc.).
  - If a corner image is missing, fallback to a provided one or hide it.
- **Animations (GSAP)**:
  - Each element gets a unique `yoyo` swaying animation.
  - Scroll-based parallax with varying `scrub` values or distances for depth.

### 2. Rundown Fix
- **Database (`update_schema.sql`)**:
  - Add RLS policies for:
    - `wedding_settings`
    - `love_stories`
    - `galleries`
    - `rundowns`
  - Policy: `ALLOW SELECT FOR ALL` (Public read-only).
- **Frontend (`src/pages/Invitation.tsx`)**:
  - Verify `rundowns` state is populated.
  - Ensure `<Rundown items={rundowns} />` is rendered inside the appropriate section.

### 3. Visual Polish
- Increase default floral sizes (`w-64 md:w-96`).
- Use higher default opacity for "premium" feel.
- Vary rotations in `Invitation.tsx` for each section's `FloralDecor` instance.

## Verification Plan
- **Manual Verification**:
  - Inspect all invitation sections to ensure 4 flowers are visible and animating.
  - Verify Rundown section is visible and displays data.
- **Database Verification**:
  - Ensure SQL executes without errors.
  - (If possible) Verify Supabase API returns data for the tables.
