# MediDesk — AI Clinic Management System
## UI Design Specification (Aura Template — Exact Color System)
### For Google Stitch — Full Design Generation

---

## 1. Design Identity

**Product Name:** MediDesk  
**Tagline:** "Your clinic. Reimagined."  
**Design Base:** Aura email client template (cinematic dark, glassy, liquid-glass cards)  
**Mood:** Premium, medical-tech, cinematic, trustworthy  
**Mode:** Dark only  

---

## 2. EXACT Color System (From Aura Template)

> Use these hex values exactly — do not substitute.

### Background Colors
```
Page background:        #0c0c0c
Card / panel surface:   #0e1014
Elevated surface:       rgba(14,16,20,0.90)
Sidebar background:     rgba(0,0,0,0.30)
Hover states:           rgba(255,255,255,0.05)
Active states:          rgba(255,255,255,0.10)
```

### Brand / Accent Colors (Aura exact)
```
Primary brand blue:     #3D81E3
Cyan highlight:         #00d2ff
Light cyan:             #A4F4FD
Deep navy:              #0B2551
Darkest navy:           #091020
```

### Text Colors
```
Primary text:           #ffffff
Secondary text:         rgba(255,255,255,0.70)
Muted text:             rgba(255,255,255,0.50)
Very muted:             rgba(255,255,255,0.40)
Placeholder:            rgba(255,255,255,0.35)
```

### Border Colors
```
Default border:         rgba(255,255,255,0.10)
Active border:          rgba(255,255,255,0.20)
Subtle border:          rgba(255,255,255,0.05)
Card border:            rgba(255,255,255,0.10)
```

### Semantic Colors
```
Success (green):        #28c840
Warning (amber):        #febc2e
Danger (red):           #ff5f57
Info / active:          #00d2ff
Unread dot:             #3D81E3
```

### Gradient — Hero Headline (exact Aura gradient)
```
Direction:   left to right
Stops:
  0%    →  #091020
  12.5% →  #0B2551
  32.5% →  #A4F4FD
  50%   →  #00d2ff
  67.5% →  #0B2551
  87.5% →  #091020
  100%  →  #091020

Background-size: 200% auto
Animation: shiny — 6s linear infinite
  from: background-position -200% center
  to:   background-position  200% center
Applied to: -webkit-background-clip: text
```

### Gradient — Pricing / Watermark (exact Aura)
```
Direction: left to right
Stops:
  0%   → #091020
  25%  → #0B2551
  65%  → #A4F4FD
  100% → #00d2ff
```

### Button — Primary (Aura AppleButton style)
```
Background:       #ffffff
Text color:       #000000
Border-radius:    100px (pill)
Font-weight:      600
Font-size:        14px
Padding:          10px 24px
Hover background: rgba(255,255,255,0.90)
Active scale:     0.98
```

### Button — Ghost / Secondary
```
Background:       transparent
Border:           1px solid rgba(255,255,255,0.15)
Text color:       #ffffff
Border-radius:    100px
Hover background: rgba(255,255,255,0.05)
```

---

## 3. Typography (Aura exact)

```
Primary font:   Inter (Google Fonts)
Weights:        400, 500, 600, 700, 800, 900

Import:
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

Body:           font-family: 'Inter', system-ui, sans-serif
Smoothing:      -webkit-font-smoothing: antialiased

Heading scale:
  Hero H1:      clamp(42px, 7vw, 80px) — font-weight 600 — tracking -0.03em — line-height 0.9
  Section H2:   clamp(28px, 4vw, 48px) — font-weight 600 — tracking -0.02em — line-height 1.02
  Card title:   15–16px — font-weight 600

Body text:      16px — font-weight 400 — line-height 1.6
Small / meta:   12–13px — color rgba(255,255,255,0.50)
Eyebrow:        12px — uppercase — letter-spacing 0.1em — color rgba(255,255,255,0.40)
```

---

## 4. Global Effects

### Background Video (fullscreen, fixed, behind everything)
```
Position:       fixed, inset 0, z-index 0
Video src:      https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_064122_c4750c0e-7476-4b44-94a2-a85a65c63bf2.mp4
Properties:     autoPlay, loop, muted, playsInline
Object-fit:     cover
Pointer-events: none
```

### Liquid-Glass Card Effect (Aura exact)
```
Background:             rgba(255,255,255,0.01)
Background-blend-mode:  luminosity
Backdrop-filter:        blur(4px)
Border:                 none (use ::before pseudo for border)
Box-shadow:             inset 0 1px 1px rgba(255,255,255,0.10)
Position:               relative
Overflow:               hidden

::before pseudo-element:
  Content:        ''
  Position:       absolute inset 0
  Border-radius:  inherit
  Padding:        1.4px
  Background:     linear-gradient(180deg,
                    rgba(255,255,255,0.45) 0%,
                    rgba(255,255,255,0.15) 20%,
                    rgba(255,255,255,0.00) 40%,
                    rgba(255,255,255,0.00) 60%,
                    rgba(255,255,255,0.15) 80%,
                    rgba(255,255,255,0.45) 100%)
  Mask:           xor composite (border-only mask)
  Pointer-events: none
```

### SVG Noise Filter (Aura grain effect on headline)
```xml
<filter id="c3-noise">
  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>
  <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0"/>
  <feComposite in2="SourceGraphic" operator="in" result="noise"/>
  <feBlend in="SourceGraphic" in2="noise" mode="multiply"/>
</filter>
```
Apply to: hero headline "Reimagined" word via filter: url(#c3-noise)

### Vertical Guide Lines (desktop only)
```
Two 1px vertical lines at container edges (max-width 72rem / ~1152px)
Color: rgba(255,255,255,0.10)
Position: fixed, full height, z-index 5
Hidden on mobile
```

### Animation Timing
```
Page load:         opacity 0→1, y -10→0, duration 0.6s, easeOut
Hero heading:      delay 0.3s, 0.8s, cubic-bezier(.22,1,.36,1)
Hero paragraph:    delay 0.5s
Hero buttons:      delay 0.7s
Menu bar:          delay 0.9s
Inbox / mockup:    delay 1.1s, y 40→0
Stagger (lists):   0.1s + index * 0.05s
Card hover:        all 0.6s cubic-bezier(.22,1,.36,1)
```

---

## 5. Page Structure & All Screens

---

### SCREEN 1 — Navigation Bar

**Layout:** full width, max-width 1152px centered, padding 0 24px, height 64px  
**Background:** transparent (video shows through)  
**Border-bottom:** none  
**Animation:** fadeDown, delay 0s  

**Left — Logo:**
- Abstract 4-quadrant SVG logo mark (white fill, 32×32px)
- "MediDesk" text — Inter 700, 18px, white
- No tagline in nav

**Center — Nav Links (desktop only):**
- Items: Solutions · Pricing · Doctors · Documentation · Support
- Style: rgba(255,255,255,0.70), 14px, font-weight 500
- Hover: #ffffff
- Stagger animation delay

**Right — CTA Button:**
- White pill button (AppleButton style)
- Label: "Get Started"
- Chevron right icon
- Black text on white background

---

### SCREEN 2 — Hero Section

**Layout:** centered, padding-top 112px (desktop) / 64px (mobile), padding-bottom 80px  
**Text-align:** center  
**Flex:** column, align-items center  

**Eyebrow line:**
- Small white dot (6×6px, rounded)
- Text: "AI-Powered · 4-Doctor Clinic System"
- Style: 12px, rgba(255,255,255,0.50)

**H1 Headline — 2 lines:**
- Line 1: "Your clinic." — color #ffffff
- Line 2: "Reimagined." — apply shiny gradient animation + noise filter
- Font: Inter 600, clamp(42px,7vw,80px), tracking -0.03em, line-height 0.9

**Subheadline paragraph:**
- Text: "MediDesk is the premier clinic management platform for the current era. It leverages powerful AI to schedule patients, manage billing, and run your front desk — with total clarity."
- Style: rgba(255,255,255,0.60), max-width 448px, 16px, line-height 1.5
- Margin-top: 32px

**CTA Row:**
- White pill button: "Start Free Trial" + ChevronRight
- Below: "Available for all clinic sizes · Powered by NVIDIA API" — 12px, rgba(255,255,255,0.40)

---

### SCREEN 3 — macOS-Style Menu Bar Strip

**Full width bar — mimics macOS menu bar**  
**Height:** 40px  
**Background:** rgba(0,0,0,0.40)  
**Backdrop-filter:** blur(12px)  
**Border-top + border-bottom:** 1px solid rgba(255,255,255,0.10)  

**Left side:**
- Apple-style logo mark (14×14px, white)
- Bold white "MediDesk"
- Menu items: Appointments · Patients · Billing · Reports · AI Assistant · Help
- Progressive hiding on smaller screens
- Font: 12px, rgba(255,255,255,0.70)

**Right side:**
- 🟢 icon + "3 Doctors On Duty · Wed May 11 · 10:30 AM"
- Font: 12px, rgba(255,255,255,0.50)

---

### SCREEN 4 — Clinic Dashboard Mockup (Hero Inbox)

**Container:** max-width 1152px, margin auto, padding 64px 24px  
**Animation:** y 40→0, delay 1.1s  

**Outer wrapper:**
- border: 1px solid rgba(255,255,255,0.10)
- border-radius: 16px
- overflow: hidden
- background: rgba(14,16,20,0.90)
- backdrop-filter: blur(32px)

**Title Bar:**
- Traffic lights: #ff5f57 · #febc2e · #28c840 (each 12px circle)
- Center label: "MediDesk — Reception Dashboard" — 12px, rgba(255,255,255,0.50)

**Body — 3-column grid (height 520px):**

**Column 1 — Sidebar (220px wide, border-right: 1px solid rgba(255,255,255,0.10)):**

Compose button:
- "✦ Book with AI" — white bg, black text, rounded-lg, Sparkles icon, 12px, font-weight 600

Navigation items (icon + label + optional count):
- 📅 Today's Queue (12) — ACTIVE: bg rgba(255,255,255,0.10), white text
- ⭐ Priority (3)
- 👤 Patients
- 🧾 Billing (2)
- 📊 Reports
- 🤖 AI Assistant
- Style inactive: rgba(255,255,255,0.60), hover bg rgba(255,255,255,0.05)
- Count badge: 10px, rounded-full, bg rgba(255,255,255,0.10)

Labels section:
- Section title: "DOCTORS" — 10px, uppercase, letter-spacing 0.1em, rgba(255,255,255,0.35)
- Dr. Khalid — color dot #00d2ff
- Dr. Ayesha — color dot #A4F4FD
- Dr. Salman — color dot #febc2e
- Dr. Sara — color dot #28c840

**Column 2 — Patient Queue List (flex 1, border-right: 1px solid rgba(255,255,255,0.10)):**

Search bar:
- Search icon + "Search patients, appointments..." placeholder
- 12px, rgba(255,255,255,0.35)
- Border-bottom: 1px solid rgba(255,255,255,0.08)

Patient rows (6 items):
1. Ahmed Khan · T-001 — Dr. Khalid · Checkup · PKR 2,000 — 10:00 AM — UNREAD + ACTIVE
2. Sara Malik · T-002 — Dr. Ayesha · Follow-up · PKR 1,500 — 10:20 AM — UNREAD
3. Muhammad Ali · T-003 — Dr. Salman · Emergency · PKR 3,000 — 10:40 AM
4. Fatima Zahra · T-004 — Dr. Sara · Checkup · PKR 2,000 — 11:00 AM
5. Stripe — PKR 85,000 collected today — Yesterday
6. GitHub — System backup completed — Monday

Row style:
- Padding: 12px 14px
- Border-bottom: 1px solid rgba(255,255,255,0.06)
- Unread indicator: 6px blue dot (#3D81E3)
- Active row: bg rgba(255,255,255,0.06), left border 2px solid #3D81E3
- Name: 12px, white (600 if unread), subject: 11px rgba(255,255,255,0.60), preview: 11px rgba(255,255,255,0.35)
- Time: 10px, rgba(255,255,255,0.35)

**Column 3 — Patient Detail Reader (flex 1.2):**

Toolbar:
- Icon buttons: Reply · Forward · Archive · Trash — each 28×28px, rounded-md, hover bg rgba(255,255,255,0.05)
- MoreHorizontal on far right
- Border-bottom: 1px solid rgba(255,255,255,0.08)

Header:
- Subject: "Patient: Ahmed Khan · Token T-001" — 14px, white, font-weight 600
- Sender row: avatar gradient circle (from #00d2ff to #0B2551, initials "AK") + "Dr. Khalid Ahmed" + "Room 1 · 10:00 AM" + "Priority" pill badge

AI Summary Card:
- Background: rgba(255,255,255,0.04)
- Border: 1px solid rgba(255,255,255,0.08)
- Border-radius: 10px
- Sparkles icon — color #A4F4FD
- Label: "Summary by MediDesk AI"
- Text: "Returning patient, 3rd visit this month. Blood pressure normal (last visit). Today: annual checkup. No pending invoices. Insurance: EFU Health."

Body paragraphs:
- "Patient arrived at 9:52 AM. Vitals: BP 120/80, Temp 98.6°F, Weight 75kg."
- "Appointment confirmed with Dr. Khalid Ahmed (General Physician). Estimated 20 minutes."
- "— MediDesk Reception System" — rgba(255,255,255,0.50)

Attachment pill:
- Paperclip icon + "patient-report-ahmed.pdf"
- Border: 1px solid rgba(255,255,255,0.10), border-radius 8px, padding 6px 12px, 11px

---

### SCREEN 5 — Feature: AI Triage (2-column)

**Layout:** max-width 1152px, 2-column grid, gap 64px, padding 80px 24px  
**Border-top:** 1px solid rgba(255,255,255,0.10)  

**Left column:**

Eyebrow: dot + "Smart Reception" + tag pill "AI-native"  
Tag pill: px-2 py-0.5, border 1px solid rgba(255,255,255,0.10), rgba(255,255,255,0.50)

H2: "Manage your clinic" / "in a single view."  
Font: Inter 600, clamp(28px,4vw,48px), tracking -0.02em, line-height 1.02

Paragraph: "MediDesk reads every appointment request, understands urgency, and routes patients to the right doctor automatically. Focus on care — the system handles the rest."  
Style: rgba(255,255,255,0.60), 16px, line-height 1.6, max-width 400px

Chips row (each: 12px, rgba(255,255,255,0.70), px-3 py-1.5, rounded-full, border rgba(255,255,255,0.10), bg rgba(255,255,255,0.03)):
- "Auto-schedule" · "Token queue" · "Emergency routing" · "WhatsApp alerts"

**Right column — Liquid-glass card:**

- Apply full liquid-glass effect
- Border-radius: 20px, padding: 20px

Eyebrow: "Today · 38 patients managed"

Four sub-cards (each liquid-glass, rounded-lg, padding 12px, margin-bottom 8px):
1. Priority (3 patients) — color #ffffff — "Ahmed Khan · Emergency", "Sara Malik · Follow-up"
2. In Progress (7) — color #e5e5e5 — "Dr. Khalid · Room 1", "Dr. Ayesha · Room 2"
3. Waiting (18) — color #a3a3a3 — "Token T-008 · T-009 · T-010"
4. Completed (13) — color #525252 — "Morning batch · Billed · Discharged"

---

### SCREEN 6 — Logo Cloud (Trusted By)

**Layout:** max-width 1152px, centered, padding 64px 24px  

**Kicker text:**
- "Trusted by Pakistan's most forward-thinking clinics"
- 12px, uppercase, letter-spacing 0.15em, rgba(255,255,255,0.40)
- Text-align: center

**8-item grid (2 cols mobile → 4 cols sm → 8 cols lg):**
- Items: Shaukat Khanum · Aga Khan · Dow Hospital · SIUT · Liaquat National · CMH · Services Hospital · AKUH
- Style: 14px, font-weight 600, tracking -0.01em, rgba(255,255,255,0.50)
- Hover: rgba(255,255,255,1.0)
- Stagger fade-in animation (0.05s each)

---

### SCREEN 7 — Testimonials

**Layout:** max-width 1152px, 3-column grid, padding 80px 24px  
**Border-top:** 1px solid rgba(255,255,255,0.10)  

**Each card — liquid-glass, rounded-2xl, padding 24px:**

Blockquote:
- 14px, rgba(255,255,255,0.80), line-height 1.6
- Wrapped in opening/closing quote marks

Figcaption (border-top: 1px solid rgba(255,255,255,0.10), margin-top 24px, padding-top 20px):
- Name: 14px, font-weight 600, white
- Role: 12px, rgba(255,255,255,0.50)
- Clinic: 12px, white, font-weight 600, uppercase, letter-spacing 0.05em

**3 testimonials:**

1. "MediDesk gave our entire front desk four hours back every day. It books, bills, and briefs the doctor before the patient even sits down." — Dr. Imran Malik, Head of Operations, CITY CLINIC KARACHI

2. "The AI assistant alone changed how we run mornings. I type in Urdu, it books in seconds. I can not imagine going back to paper registers." — Nadia Hussain, Senior Receptionist, MEDICARE LAHORE

3. "Token display on the TV, live billing, WhatsApp reminders — our patients think we upgraded to a five-star hospital." — Ahsan Raza, Clinic Manager, HEALTH POINT ISLAMABAD

---

### SCREEN 8 — Pricing Section

**Layout:** full-section, padding 40px 20px 80px, centered, overflow-x hidden  

**Watermark (giant background text):**
- Position: relative, centered, max-width 1100px, z-index 2
- Font: Inter 800, 9rem (desktop) / 3.5rem (mobile), line-height 0.9, letter-spacing -0.05em
- Apply noise filter (pricing version)
- Line 1: "Your clinic." — color #ffffff
- Line 2: "Reimagined." — gradient (Aura watermark gradient: #091020→#0B2551→#A4F4FD→#00d2ff)
- On mobile: remove filter, set line 2 to solid #00d2ff

**Toggle (Yearly / Monthly):**
- Right-aligned, max-width 1100px
- "Yearly" label, 14px, white
- Pill toggle (52×28px):
  - OFF: white background, black knob at left
  - ON (active): bg rgba(255,255,255,0.20), white knob translated 24px right
  - Transition: 0.3s cubic-bezier(.4,0,.2,1)

**3-card grid (max-width 1100px, gap 24px, translateX 20px):**
- Desktop: 3 columns
- Mobile: horizontal scroll snap (320px cards, scroll-snap-type x mandatory)

**Card base styles:**
- Background: linear-gradient(135deg, rgba(0,0,0,0.70), rgba(0,0,0,0.40))
- Backdrop-filter: blur(14px) brightness(0.91)
- Border: 1px solid rgba(255,255,255,1.0)
- Border-radius: 44px
- Padding: 50px 24px
- Min-height: 580px
- ::before: linear-gradient(135deg, rgba(255,255,255,0.10) 0%, transparent 50%) overlay
- Hover: border-color rgba(34,211,238,0.70), translateY(-12px) scale(1.01)

**Plan 1 — Free:**
- Tier small: "Free" — rgba(255,255,255,0.60), 17px
- Tier large: "Free" — white, 45px, font-weight 500
- Description: "For small clinics taking their first steps with MediDesk."
- Features:
  - Up to 1 doctor profile
  - 50 appointments per month
  - Basic patient registration
  - Cash billing only
  - Web access only

**Plan 2 — Standard:**
- Tier small: "Standard"
- Tier large: "$9.99/m" (monthly) or "$99.99/y" (yearly)
- Description: "For growing clinics that need scheduling, billing, and smart reports."
- Features:
  - Up to 4 doctor profiles
  - Unlimited appointments
  - Full patient management
  - Multi-payment billing (JazzCash, EasyPaisa, card)
  - WhatsApp reminders
  - Daily revenue reports

**Plan 3 — Pro (highlighted card):**
- Background: linear-gradient(135deg, rgba(0,0,0,0.85), rgba(0,0,0,0.55))
- Tier small: "Pro"
- Tier large: "$19.99/m" or "$199.99/y"
- Description: "For multi-clinic networks and hospital-grade operations."
- Features:
  - Unlimited doctor profiles
  - NVIDIA AI assistant (full access)
  - Token display TV screen
  - Real-time analytics dashboard
  - Role-based staff access
  - Custom clinic branding
  - API access + integrations

**Feature list item style:**
- Icon: 28px circle, bg rgba(255,255,255,0.15), white checkmark SVG
- Text: 14px, rgba(255,255,255,0.80), line-height 1.4
- Gap: 14px, margin-bottom 18px

**Button per card:**
- "Choose Plan" — white bg, black text, rounded-full, padding 10px 32px, font-weight 600
- Hover: bg #f5f5f5, scale(1.02), box-shadow 0 8px 24px rgba(255,255,255,0.15)
- Align: center, margin-top auto

---

### SCREEN 9 — Final CTA

**Layout:** max-width 1152px, padding 80px 24px (desktop) / 80px 32px (mobile)  

**Liquid-glass card:**
- Border-radius: 24px
- Padding: 64px 40px (desktop), 48px 24px (mobile)
- Text-align: center
- Overflow: hidden
- Radial glow overlay: radial-gradient(600px circle at 50% 0%, rgba(255,255,255,0.15), transparent 70%) — opacity 0.30

**H2:** "Close the register." / "Open your clinic."  
Font: Inter 600, clamp(32px,5vw,56px), tracking -0.02em, line-height 1.02

**Paragraph:** "Join thousands of clinic owners, receptionists, and doctors across Pakistan who treat clinic management like a tool — not a burden."  
Style: rgba(255,255,255,0.60), max-width 400px, centered, 14px, line-height 1.6

**Button row (centered, gap 16px):**
- White pill button: "Start Free Trial" + ChevronRight
- Ghost button: "Talk to sales" + ChevronRight — border rgba(255,255,255,0.15)

---

### SCREEN 10 — Token Display (Fullscreen TV Screen)

**Purpose:** Separate fullscreen screen shown on clinic TV at reception  
**Background:** #0c0c0c — no sidebar, no header  

**Top bar (10% height):**
- Clinic name: left, Inter 700, 18px, white
- MediDesk logo mark: center
- Live clock: right — Inter monospace, 24px, white — "10:41 AM"

**Center section (70% height):**
- "NOW SERVING" — 14px, uppercase, letter-spacing 0.2em, rgba(255,255,255,0.40)
- Token number: "T-024" — Inter 800, 180px+, white — primary display element
- Glow effect behind number: radial-gradient(rgba(0,210,255,0.15), transparent)
- Pulse animation: subtle scale 1.0→1.02→1.0, 2s loop
- Doctor name: "Dr. Khalid Ahmed" — Inter 600, 28px, white
- Room: "Room 1 →" — 18px, rgba(255,255,255,0.50)

**Bottom ticker (20% height):**
- Background: rgba(255,255,255,0.04)
- "NEXT IN QUEUE:" label — 12px, rgba(255,255,255,0.40)
- Scrolling: "T-025 — Sara Malik · T-026 — Muhammad Ali · T-027 — Fatima Zahra"
- Auto-scroll left continuously
- Updates live via WebSocket

---

### SCREEN 11 — AI Assistant Chat Page

**Layout:** full height, 2-column (sidebar + chat)  
**Background:** #0c0c0c  

**Left sidebar (280px):**
- "MediDesk AI" title — Inter 700, 16px, white
- NVIDIA badge: small pill "Powered by NVIDIA LLaMA 3.1 70B" — rgba(255,255,255,0.40), 10px, border rgba(255,255,255,0.10)
- "➕ New Chat" button — ghost style
- Conversation history list — each: 12px, rgba(255,255,255,0.60), hover bg rgba(255,255,255,0.05)
- Active conversation: border-left 2px solid #00d2ff, rgba(255,255,255,1.0)
- Quick commands section:
  - 📅 Book Appointment
  - 💰 Revenue Summary
  - 🏥 Doctor Availability
  - 🧾 Create Invoice
  - 📊 Today's Stats

**Main chat area:**

Top bar:
- "MediDesk AI" — Inter 600, 15px, white
- Clear button: ghost, right side

Messages:
- User bubble: right-aligned, bg #3D81E3 (Aura brand blue), white text, rounded-2xl, 14px
- AI bubble: left-aligned, bg rgba(255,255,255,0.05), border 1px solid rgba(255,255,255,0.08), 14px, rgba(255,255,255,0.80)
- AI avatar: 28px circle, gradient bg #00d2ff→#0B2551, white AI icon inside

Structured response cards (inline in AI bubble):
- Appointment card: bg rgba(255,255,255,0.04), border rgba(255,255,255,0.08), rounded-xl, shows patient/doctor/time/token + Confirm/Cancel buttons
- Revenue card: mini bar chart, cyan bars
- Schedule card: time slot grid (available = rgba(255,255,255,0.10), booked = rgba(255,255,255,0.03) + strikethrough)

AI thinking indicator:
- Three animated dots — color #00d2ff
- "MediDesk AI is thinking..." — 12px, rgba(255,255,255,0.40)

Input bar (pinned bottom):
- Dark input: "Ask anything about the clinic..." — bg rgba(255,255,255,0.05), border rgba(255,255,255,0.10), border-radius 100px
- Microphone icon button (right inside input)
- Send button: white circle, right of input, black arrow icon

Quick command chips (above input, horizontal scroll):
- Style: 12px, border rgba(255,255,255,0.10), bg rgba(255,255,255,0.03), rounded-full, rgba(255,255,255,0.70)

---

## 6. Reusable Components

### AppleButton (primary CTA — white pill)
```
Shape:          rounded-full (100px radius)
Background:     #ffffff
Text color:     #000000
Font:           Inter 500, 14px
Padding:        12px 20px
Gap:            8px (icon + label + chevron)
Chevron:        ChevronRight icon, translates +1px on hover
Hover:          bg rgba(255,255,255,0.90)
Active:         scale(0.98)
Props:          label (string), full (boolean — 100% width)
```

### SectionEyebrow
```
Elements:       6px white dot (rounded) + label text + optional tag pill
Tag pill:       px-2 py-0.5, border rgba(255,255,255,0.10), rgba(255,255,255,0.50), rounded-full
```

### StatusBadge
```
Waiting:        bg rgba(254,188,46,0.15), color #febc2e
In Progress:    bg rgba(0,210,255,0.15), color #00d2ff
Done:           bg rgba(40,200,64,0.15), color #28c840
Cancelled:      bg rgba(255,95,87,0.15), color #ff5f57
Paid:           bg rgba(40,200,64,0.15), color #28c840
Pending:        bg rgba(254,188,46,0.15), color #febc2e
Overdue:        bg rgba(255,95,87,0.15), color #ff5f57
Shape:          rounded-full, padding 4px 10px, font 11px 500
```

### DoctorAvatar
```
Size:           36×36px circle
Background:     gradient from #00d2ff to #0B2551
Text:           initials, Inter 600, 13px, white
Status dot:     8px, absolute bottom-right
  Available →   #28c840
  Busy →        #ff5f57
  Break →       #febc2e
```

### DataTable
```
Header:         12px, rgba(255,255,255,0.50), uppercase, letter-spacing 0.05em
Row:            14px, rgba(255,255,255,0.80), border-bottom rgba(255,255,255,0.06)
Row hover:      bg rgba(255,255,255,0.04)
Zebra:          every other row rgba(255,255,255,0.02)
```

---

## 7. Responsive Breakpoints

```
Mobile:   320px–767px  → single column, bottom tab nav, stacked cards
Tablet:   768px–1023px → sidebar hidden (hamburger), 2-col where possible
Laptop:   1024px–1279px → slim sidebar (icons only)
Desktop:  1280px+      → full layout, all columns visible
```

---

## 8. Tech Stack (for developer — Codex / Cursor reference)

```
Frontend:     Next.js 14 (App Router) + TypeScript
Styling:      Tailwind CSS (extend brand color #3D81E3)
Animation:    motion/react (Framer Motion v12+)
Icons:        lucide-react
UI base:      shadcn/ui components
Charts:       Recharts
Database:     Supabase (PostgreSQL + Realtime + Auth)
AI:           NVIDIA NIM API → meta/llama-3.1-70b-instruct
              Base URL: https://integrate.api.nvidia.com/v1
              Key: process.env.NVIDIA_API_KEY (never hardcoded)
Backend:      FastAPI (Python)
PDF:          pdf-lib
Deploy:       Vercel (frontend) + Railway (backend)
```

---

## 9. Tailwind Config Extensions

```javascript
theme: {
  extend: {
    colors: {
      brand: '#3D81E3',
      cyan: '#00d2ff',
      'cyan-light': '#A4F4FD',
      'navy-deep': '#0B2551',
      'navy-dark': '#091020',
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
    },
    keyframes: {
      shiny: {
        '0%': { backgroundPosition: '-200% center' },
        '100%': { backgroundPosition: '200% center' },
      },
    },
    animation: {
      shiny: 'shiny 6s linear infinite',
    },
  },
}
```

---

## 10. Pakistani Market Details

```
Currency:         PKR (Pakistani Rupee) — format PKR 1,20,000
Phone format:     +92 300 1234567
Date format:      DD/MM/YYYY
Time:             12-hour AM/PM
Timezone:         Asia/Karachi (PKT, UTC+5)
Payment methods:  Cash · JazzCash · EasyPaisa · Card · Bank Transfer
Languages:        English (primary) · Urdu (secondary, RTL)
Urdu font:        Noto Nastaliq Urdu
```

---

*MediDesk Design Spec — Aura Template Color System*
*Version 3.0 | For Google Stitch UI Generation*
*Colors: #0c0c0c base · #3D81E3 brand · #00d2ff cyan · #A4F4FD light cyan · #0B2551 navy*
