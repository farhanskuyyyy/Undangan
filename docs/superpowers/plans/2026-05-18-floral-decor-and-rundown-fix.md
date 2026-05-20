# Floral Decorations Enhancement & Rundown Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance floral decorations to a 4-corner layout and fix the rundown display by addressing RLS policies.

**Architecture:** Upgrade `FloralDecor.tsx` to handle 4 elements with GSAP animations. Update `update_schema.sql` with RLS policies. Refine `Invitation.tsx` layout.

**Tech Stack:** React, TypeScript, GSAP, Supabase, Tailwind CSS.

---

### Task 1: Update Database Schema (RLS Policies)

**Files:**
- Modify: `update_schema.sql`

- [ ] **Step 1: Add RLS policies to `update_schema.sql`**

```sql
-- Enable RLS on tables
ALTER TABLE wedding_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE rundowns ENABLE ROW LEVEL SECURITY;

-- Create public select policies
CREATE POLICY "Allow public select on wedding_settings" ON wedding_settings FOR SELECT USING (true);
CREATE POLICY "Allow public select on love_stories" ON love_stories FOR SELECT USING (true);
CREATE POLICY "Allow public select on galleries" ON galleries FOR SELECT USING (true);
CREATE POLICY "Allow public select on rundowns" ON rundowns FOR SELECT USING (true);
```

- [ ] **Step 2: Commit schema changes**

```bash
git add update_schema.sql
git commit -m "fix(db): add RLS policies for public access to wedding data"
```

---

### Task 2: Upgrade FloralDecor Component

**Files:**
- Modify: `src/components/FloralDecor.tsx`

- [ ] **Step 1: Update `FloralDecorProps` and component structure**

```typescript
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
  opacity = "opacity-80"
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<HTMLImageElement>(null);
  const trRef = useRef<HTMLImageElement>(null);
  const blRef = useRef<HTMLImageElement>(null);
  const brRef = useRef<HTMLImageElement>(null);
  // ...
```

- [ ] **Step 2: Refine GSAP animations for 4 elements**

Update `useGSAP` hook to loop through all 4 refs and apply individualized swaying and parallax.

- [ ] **Step 3: Update TSX return to render 4 images**

Position them at corners with `absolute` and appropriate offsets/rotations.

- [ ] **Step 4: Commit FloralDecor changes**

```bash
git add src/components/FloralDecor.tsx
git commit -m "feat(ui): upgrade FloralDecor to support 4 corners and refined animations"
```

---

### Task 3: Refine Invitation Page Layout

**Files:**
- Modify: `src/pages/Invitation.tsx`

- [ ] **Step 1: Update `FloralDecor` usages in all sections**

Provide more images or unique configurations (rotations, scales) for each section to ensure visual variety.

- [ ] **Step 2: Verify `Rundown` component placement**

Ensure `<Rundown items={rundowns} />` is correctly positioned and visible.

- [ ] **Step 3: Commit Invitation page changes**

```bash
git add src/pages/Invitation.tsx
git commit -m "feat(ui): refine invitation sections with enhanced floral decorations"
```

---

### Task 4: Final Verification

- [ ] **Step 1: Manual check of all sections**
- [ ] **Step 2: Verify rundown data is displayed**
- [ ] **Step 3: Check console for any errors**
