# Design Spec: Digital Invitation with CMS Scan (Modern Minimalist)

Project: Digital Invitation system with guest management and souvenir tracking.
Date: 2026-05-18

## 1. Vision & Goals
Build a lightweight, aesthetically pleasing digital invitation using React + Vite + Tailwind CSS. The system includes a public-facing invitation page and a password-protected CMS for scanning guest QR codes to manage souvenir distribution.

## 2. Architecture & Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion (animations), Lucide React (icons).
- **Backend/Database**: Supabase (PostgreSQL).
- **QR Scanning**: `html5-qrcode`.
- **State Management**: React Hooks.
- **Styling**: Modern Minimalist (Clean, high whitespace, serif/sans-serif mix).

## 3. Data Schema (Supabase)
### Table: `guests`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| name | String | Guest Name |
| qr_code | String | Unique identifier for the guest's QR code |
| rsvp_status | Boolean | Whether the guest has RSVP-ed |
| souvenir_taken | Boolean | Tracking if souvenir has been claimed |
| message | Text | Well-wishes from the guest |
| attendance_count | Integer| Number of people attending |

## 4. Key Features & Pages
### A. Invitation Page (Public)
- **Hero Section**: Image, names, and date.
- **Countdown**: Real-time timer to the event.
- **Event Details**: Time, Location (Google Maps embed).
- **Gallery**: Photo grid.
- **RSVP Form**: Name, attendance status, and message.
- **Music Player**: Background music with play/pause toggle.

### B. CMS Scan Page (Admin)
- **Authentication**: Simple password-based gate.
- **QR Scanner**: Camera interface to scan guest QR codes.
- **Guest Info Display**: Shows guest name and souvenir status upon successful scan.
- **Souvenir Action**: Button to mark souvenir as "Taken" (updates Supabase in real-time).

## 5. User Flow
1. Guest receives link with their unique `qr_code` parameter.
2. Guest views invitation, plays music, and fills RSVP.
3. At the event, Guest shows QR code (generated based on their ID).
4. Receptionist scans QR code via CMS.
5. CMS displays "Claim Souvenir" button if not already taken.

## 6. Success Criteria
- Responsive design (Mobile first).
- Real-time database updates for souvenir tracking.
- Smooth animations (Framer Motion).
- Functional QR scanning on mobile browsers.
