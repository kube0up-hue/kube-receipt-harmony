# KUBE Kitchen Design System (`.interface-design/system.md`)

This file is the single source of truth for all visual, structural, and interaction decisions across KUBE Kitchen ERP. Every component, page, dialog, and table must adhere to these decisions.

---

## 1. Product Domain & Intent

- **Domain:** Luxury specialty coffee, artisan patisserie, dark kitchen ERP & multi-branch receiving system (`كيوب كيتشن`).
- **Core Personas:**
  - **Branch Employee (الموظف):** Fast-paced physical kitchen environment, mobile or tablet in hand, dirty or wet hands, quick photo uploads of vendor paper receipts, zero friction.
  - **Accountant (المحاسب):** High data density, matching physical receipts with tax invoices, reviewing totals, spotting VAT or date discrepancies.
  - **Owner / GM (المالك):** High-level operational health, cost control, vendor breakdowns, branch comparisons, AI creative generation.
- **Visual Direction:** Minimalist Luxury Monochrome with Precision Red Accent. Industrial warmth, Swiss typographic clarity, Japanese restraint.
- **Directionality:** **RTL native first (Arabic)**. All margins, padding, chevron icons, and data grids align naturally for Arabic readers.

---

## 2. Color Palette & Semantic Tokens

KUBE adheres strictly to a **60 / 30 / 10** monochrome distribution:

| Role | Token / Value (Dark Mode) | Token / Value (Light Mode) | Purpose |
|------|---------------------------|----------------------------|---------|
| **Canvas Background** | `#080808` / `bg-background` | `#F8F9FA` / `bg-background` | Deep OLED neutral background |
| **Surface (Cards/Panels)** | `#141414` / `bg-card` | `#FFFFFF` / `bg-card` | Elevated surface with hairline border |
| **Input / Inset Surface** | `#0F0F0F` / `bg-muted/40` | `#F1F3F5` / `bg-muted/50` | Inset fields receiving user keystrokes |
| **Hairline Borders** | `rgba(255,255,255,0.08)` | `rgba(0,0,0,0.08)` | Structural containment without harshness |
| **Primary Accent** | `#E53935` / `#D71921` (`bg-primary`) | `#E53935` / `#D71921` | KUBE Signature Red: primary actions, submit, badge alert |
| **Text Primary** | `#FAF8F5` (`text-foreground`) | `#111827` (`text-foreground`) | High legibility headings and values |
| **Text Secondary** | `#A1A1AA` (`text-muted-foreground`) | `#6B7280` | Labels, subtitles, table column headers |
| **Text Tertiary / Meta** | `#71717A` | `#9CA3AF` | Timestamps, receipt codes, helper text |
| **Status: Success** | `#10B981` (`emerald-500`) | `#059669` | Matches, approved receipts, healthy sync |
| **Status: Warning** | `#F59E0B` (`amber-500`) | `#D97706` | Pending approvals, missing invoice match |
| **Status: Danger** | `#EF4444` (`red-500`) | `#DC2626` | Discrepancies, rejected items, deletions |

> **Strict Rule:** Red is an interrupt and an action trigger. It is never used for decorative wallpaper, large colored card backgrounds, or unmotivated visual noise.

---

## 3. Typography Hierarchy

- **Font Family:**
  - Arabic: `Cairo`, `system-ui`, sans-serif
  - Western / Technical: `Inter`, `system-ui`, sans-serif
  - Numbers / Currency / Codes: `JetBrains Mono` or `tabular-nums`
- **Scale & Weights:**
  - **Display (Hero Numbers):** `text-3xl` to `text-4xl` (`font-extrabold`, `tabular-nums`) — used for total amounts (e.g. `14,250.00 ر.س`).
  - **Page Title (H1):** `text-2xl` (`font-bold`, `tracking-tight`).
  - **Section Title (H2):** `text-lg` to `text-xl` (`font-semibold`).
  - **Card Header (H3):** `text-base` (`font-semibold`).
  - **Body Text:** `text-sm` (`font-normal`, `leading-relaxed`).
  - **Labels / Headers:** `text-xs` (`font-medium`, `text-muted-foreground`).
  - **Metadata / Badges:** `text-[11px]` (`font-medium`).

---

## 4. Layout & Spacing Architecture

- **Base Unit:** 4px / 8px grid (`gap-2`, `gap-3`, `gap-4`, `gap-6`, `p-4`, `p-6`).
- **View Containers (`maxWidth` in `AppShell`):**
  - **Wide (`max-w-6xl`):** All administrative tables, reports, dashboards, receipt reconciliation, and audit logs.
  - **Default (`max-w-3xl`):** Simple single-column forms, settings, employee camera receipt upload.
  - **Compact (`max-w-sm`):** Login, pinpad, OTP confirmation.
- **Rhythm:** Group related controls tightly (8–12px), place real breathing space between conceptual sections (24–32px).

---

## 5. Depth & Surface Strategy

- **Strategy: Borders-First with Whisper-Quiet Shifts.**
- We do **NOT** use heavy drop shadows (`shadow-2xl`, dark fuzzy spreads).
- Surfaces elevate through:
  1. Hairline borders (`border border-border/60`).
  2. Subtle background lightness steps (`#080808` -> `#141414` -> `#1C1C1C`).
  3. Backdrop blur for floating bars (`backdrop-blur-md bg-background/80`).
- **Radius Scale:**
  - Small inputs, badges, inner buttons: `rounded-md` (6px) or `rounded-lg` (8px).
  - Cards, panels, sheets: `rounded-xl` (12px) to `rounded-2xl` (16px).
  - Concentric Rule: Inner element radius must equal `outerRadius - padding`.

---

## 6. Key Component Standards

### 6.1 Buttons
- **Primary:** `bg-primary text-primary-foreground font-semibold hover:bg-primary/90 h-10 px-5 rounded-lg active:scale-[0.98] transition-all`
- **Secondary / Outline:** `border border-border/80 bg-card hover:bg-muted/50 h-10 px-4 rounded-lg text-foreground font-medium`
- **Ghost:** `hover:bg-muted/40 text-muted-foreground hover:text-foreground h-9 px-3 rounded-md`
- **Touch Targets:** Minimum 44px height for mobile kitchen staff actions.

### 6.2 Data Tables & Metric Cards
- Metric cards feature:
  - Metric label in `text-xs text-muted-foreground font-medium`.
  - Focal value in `text-2xl font-bold tabular-nums text-foreground`.
  - Trend badge or contextual secondary note in `text-xs`.
- Tables:
  - Sticky header with `bg-card/90 backdrop-blur border-b border-border`.
  - Cells use `text-sm py-3 px-4`.
  - Numeric columns right-aligned (or left-aligned relative to RTL currency placement) with `tabular-nums`.

### 6.3 Form Inputs
- Height 40px (`h-10`).
- Inset background: `bg-muted/30 border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary/30`.
- Clear Arabic placeholders and explicit top labels.

---

## 7. Quality & Verification Discipline

Before finalizing any screen:
1. **The Squint Test:** Blur eyes — focal metric or primary CTA dominates immediately.
2. **The RTL Test:** Icons, chevrons, tabs, and form alignments flow Right-to-Left without horizontal misalignment.
3. **The Mobile Test:** Form controls and upload buttons comfortable on 375px viewport with >= 44px hit targets.
4. **The Zero-Slop Rule:** No generic AI placeholder text, no unnecessary colored gradients, no unstyled div buttons.
