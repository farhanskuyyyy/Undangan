# Digital Invitation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a modern minimalist digital invitation with RSVP and a QR-scan CMS for souvenir tracking.

**Architecture:** React + Vite frontend, Tailwind CSS for styling, Supabase for real-time database, and `html5-qrcode` for scanning.

**Tech Stack:** React, Vite, Tailwind CSS, Framer Motion, Lucide React, Supabase, html5-qrcode.

---

### Task 1: Project Initialization

**Files:**
- Create: `package.json`, `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`
- Create: `src/main.tsx`, `src/App.tsx`, `src/index.css`

- [ ] **Step 1: Initialize Vite with React and TypeScript**
Run: `npm create vite@latest . -- --template react-ts`

- [ ] **Step 2: Install dependencies**
Run: `npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p`
Run: `npm install lucide-react framer-motion @supabase/supabase-js html5-qrcode react-hook-form`

- [ ] **Step 3: Configure Tailwind**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 4: Verify setup**
Run: `npm run dev` (check if blank page loads)

- [ ] **Step 5: Commit**
```bash
git add .
git commit -m "chore: init vite react tailwind project"
```

### Task 2: Supabase Setup

**Files:**
- Create: `src/lib/supabase.ts`
- Create: `.env.example`

- [ ] **Step 1: Create Supabase client**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] **Step 2: SQL for Database Table**
Create a snippet for the user to run in Supabase SQL Editor:
```sql
create table guests (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  qr_code text unique not null,
  rsvp_status boolean default false,
  souvenir_taken boolean default false,
  message text,
  attendance_count integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table guests enable row level security;

-- Public read for specific guest (via qr_code)
create policy "Public read by QR" on guests for select using (true);

-- Public update for RSVP
create policy "Public update RSVP" on guests for update using (true);
```

- [ ] **Step 3: Commit**
```bash
git add src/lib/supabase.ts .env.example
git commit -m "feat: setup supabase client and schema"
```

### Task 3: Invitation Page - Hero & Countdown

**Files:**
- Create: `src/components/Hero.tsx`
- Create: `src/components/Countdown.tsx`

- [ ] **Step 1: Implement Hero section**
Minimalist design: Large names, date, elegant serif font.

- [ ] **Step 2: Implement Countdown component**
Logic to calculate days, hours, minutes, seconds remaining.

- [ ] **Step 3: Commit**
```bash
git add src/components/Hero.tsx src/components/Countdown.tsx
git commit -m "feat: add hero and countdown components"
```

### Task 4: Invitation Page - RSVP Form

**Files:**
- Create: `src/components/RSVPForm.tsx`

- [ ] **Step 1: Implement RSVP Form**
Fields: Name (readonly if coming from link), Attendance (Yes/No), Number of Guests, Message.

- [ ] **Step 2: Integrate with Supabase**
Update `guests` table on submit.

- [ ] **Step 3: Commit**
```bash
git add src/components/RSVPForm.tsx
git commit -m "feat: add rsvp form with supabase integration"
```

### Task 5: CMS - Admin Auth & Scanner

**Files:**
- Create: `src/pages/AdminCMS.tsx`

- [ ] **Step 1: Simple Password Gate**
State to check if `admin_password` matches env variable.

- [ ] **Step 2: QR Scanner Integration**
Use `html5-qrcode` to scan. On success, fetch guest by `qr_code`.

- [ ] **Step 3: Souvenir Claim Action**
Button to toggle `souvenir_taken` in Supabase.

- [ ] **Step 4: Commit**
```bash
git add src/pages/AdminCMS.tsx
git commit -m "feat: add admin cms with qr scanner"
```

### Task 6: Final Polish & Routing

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Setup Routing**
`/` for Invitation, `/admin` for CMS.

- [ ] **Step 2: Minimalist Theme CSS**
Add custom animations in `index.css` or via Framer Motion.

- [ ] **Step 3: Commit**
```bash
git add src/App.tsx
git commit -m "feat: final routing and polish"
```
