# UI Update: Love Story, QR Code & Masonry Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance the invitation page with a wavy Love Story timeline, Masonry Gallery, QR Code display for guests, and an Earth Tones color palette.

**Architecture:** Use Tailwind CSS for the wavy timeline and Earth Tones theme. Implement `qrcode.react` for the guest QR display. Refactor the Gallery to use a responsive Masonry grid.

**Tech Stack:** React, Tailwind CSS, Framer Motion, qrcode.react.

---

### Task 1: Theme & Color Palette Update

**Files:**
- Modify: `tailwind.config.js`
- Modify: `src/index.css`

- [ ] **Step 1: Update Tailwind config with Earth Tones colors**
Add: `sage: '#829460'`, `cream: '#F3EFE0'`, `terracotta: '#BC8F8F'`.

- [ ] **Step 2: Update global CSS with theme variables**
Set CSS variables in `src/index.css` for easy reuse.

- [ ] **Step 3: Commit**
```bash
git add tailwind.config.js src/index.css
git commit -m "style: update theme to earth tones palette"
```

### Task 2: Love Story Component

**Files:**
- Create: `src/components/LoveStory.tsx`

- [ ] **Step 1: Implement LoveStory with wavy timeline**
Use Framer Motion for scroll animations. Use `contoh1.JPG` as a placeholder for photos.
Timeline style: Wavy vertical line with alternating left/right content blocks.

- [ ] **Step 2: Commit**
```bash
git add src/components/LoveStory.tsx
git commit -m "feat: add love story timeline component"
```

### Task 3: Masonry Gallery Implementation

**Files:**
- Create: `src/components/Gallery.tsx`

- [ ] **Step 1: Build responsive Masonry Gallery**
Use Tailwind `columns` or grid with varied row spans. Use `contoh1.JPG` multiple times with different aspect ratios.

- [ ] **Step 2: Commit**
```bash
git add src/components/Gallery.tsx
git commit -m "feat: add masonry gallery with varied image sizes"
```

### Task 3: Guest QR Code Display

**Files:**
- Create: `src/components/GuestQR.tsx`

- [ ] **Step 1: Implement QR code generator for guests**
Component that takes `guestId` (from URL) and renders a QR code for check-in.

- [ ] **Step 2: Commit**
```bash
git add src/components/GuestQR.tsx
git commit -m "feat: add guest qr code component"
```

### Task 4: Invitation Page Integration & Maps Fix

**Files:**
- Modify: `src/pages/Invitation.tsx`

- [ ] **Step 1: Fix Google Maps embed (Monas)**
Update iframe src with Monas coordinates or search query.

- [ ] **Step 2: Integrate new components**
Insert `LoveStory`, `Gallery`, and `GuestQR` into the page flow.

- [ ] **Step 3: Apply Earth Tones classes**
Update background and text colors using new theme classes.

- [ ] **Step 4: Commit**
```bash
git add src/pages/Invitation.tsx
git commit -m "feat: integrate love story, gallery, and qr code"
```
