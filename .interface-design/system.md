# KUBE Kitchen Design System (`.interface-design/system.md`)

This file is the single source of truth for all visual, structural, and interaction decisions across KUBE Kitchen ERP. Every component, page, dialog, and table must adhere to these decisions.

---

## 1. Product Domain & Intent

- **Domain:** Luxury specialty coffee, artisan patisserie, dark kitchen ERP & multi-branch receiving system (`كيوب كيتشن`).
- **Core Personas:**
  - **Branch Employee (الموظف):** Fast-paced physical kitchen environment, mobile or tablet in hand, dirty or wet hands, quick photo uploads of vendor paper receipts, zero friction.
  - **Accountant (المحاسب):** High data density, matching physical receipts with tax invoices, reviewing totals, spotting VAT or date discrepancies.
  - **Owner / GM (المالك):** High-level operational health, cost control, vendor breakdowns, branch comparisons, AI creative generation.
- **Visual Direction:** Modern Saudi Luxury Monochrome with Surgical Red Accent. Industrial warmth, Swiss typographic clarity, Japanese restraint.
- **Directionality:** **RTL native first (Arabic)**. All margins, padding, chevron icons, and data grids align naturally for Arabic readers. Back navigation uses `ArrowRight` (`→`).

---

## 2. Color Palette & Semantic Tokens

KUBE adheres strictly to a **60 / 30 / 10** monochrome distribution:

| Role | Token / Value (Dark Mode) | Token / Value (Light Mode) | Purpose |
|------|---------------------------|----------------------------|---------|
| **Canvas Background** | `#09090B` / `bg-background` | `#FAFAFA` / `bg-background` | Deep OLED neutral background |
| **Surface (Cards/Panels)** | `#121215` / `bg-card` | `#FFFFFF` / `bg-card` | Elevated surface with hairline border (`rounded-2xl`) |
| **Input / Inset Surface** | `#18181B` / `bg-muted/30` | `#F4F4F5` / `bg-muted/40` | Inset fields receiving user keystrokes (`rounded-xl`) |
| **Hairline Borders** | `oklch(0.20 0.004 260)` | `oklch(0.89 0.005 90)` | Structural containment without harshness (`border-border/80`) |
| **Primary Accent** | `#E11D48` / `#D71921` (`kube-red`) | `#E11D48` / `#D71921` | KUBE Signature Red: primary actions, submit, badge alert |
| **Text Primary** | `#FAF8F5` (`text-foreground`) | `#121215` (`text-foreground`) | High legibility headings and values (Alexandria / IBM Plex) |
| **Text Secondary** | `#A1A1AA` (`text-muted-foreground`) | `#6B7280` | Labels, subtitles, table column headers |
| **Text Tertiary / Meta** | `#71717A` | `#9CA3AF` | Timestamps, receipt codes, helper text |
| **Status: Success** | `#10B981` (`emerald-500`) | `#059669` | Matches, approved receipts, healthy sync |
| **Status: Warning** | `#F59E0B` (`amber-500`) | `#D97706` | Pending approvals, missing invoice match |
| **Status: Danger** | `#E11D48` (`kube-red`) | `#DC2626` | Discrepancies, rejected items, deletions |

> **Strict Rule:** Red is an interrupt and an action trigger. It is never used for decorative wallpaper, large colored card backgrounds, or unmotivated visual noise.

---

## 3. Saudi Modern Typography Suite

- **Font Stack:**
  - **Display & Headlines (`font-display`):** `Alexandria`, `Cairo`, sans-serif (Weights: 600, 700, 800, 900)
    - Modern Saudi architectural geometric font for titles, branding, KPI metric numbers, and button labels.
  - **Operational & Body (`font-sans`):** `IBM Plex Sans Arabic`, `Alexandria`, sans-serif (Weights: 400, 500, 600)
    - High-density readability for tables, forms, inputs, descriptions.
  - **Numbers, Currency & Code (`font-mono`):** `JetBrains Mono` or `tabular-nums`
    - Financial figures, invoice numbers, timestamps (`1,450.00 ر.س`).
- **Scale & Weights:**
  - **Hero Display:** `text-3xl` to `text-4xl` (`font-display font-black tracking-tight tabular-nums`)
  - **Page Title (H1):** `text-xl` to `text-2xl` (`font-display font-bold tracking-tight`)
  - **Section Title (H2):** `text-base` to `text-lg` (`font-display font-bold`)
  - **Card Header (H3):** `text-sm` to `text-base` (`font-display font-bold`)
  - **Body Text:** `text-sm` (`font-sans font-normal leading-relaxed`)
  - **Labels / Headers:** `text-xs` (`font-display font-semibold text-muted-foreground`)
  - **Status Pills & Chips:** `text-[11px]` (`font-display font-semibold`)

---

## 4. Layout & Spacing Architecture

- **Base Unit:** 4px / 8px grid (`gap-2`, `gap-3.5`, `gap-4`, `gap-7`, `p-4`, `p-5`).
- **View Containers (`maxWidth` in `AppShell`):**
  - **Wide (`max-w-6xl`):** All administrative tables, reports, dashboards, receipt reconciliation, and audit logs.
  - **Default (`max-w-4xl`):** Standard workflows, supplier invoices, overview.
  - **Narrow (`max-w-xl`):** Mobile kitchen staff operations, PIN pad, quick order creation.
- **Rhythm:** Group related controls tightly (8–12px), place real breathing space between conceptual sections (24–32px).

---

## 5. Depth & Surface Strategy

- **Strategy: Borders-First with Whisper-Quiet Shifts.**
- We do **NOT** use heavy drop shadows (`shadow-2xl`, dark fuzzy spreads).
- Surfaces elevate through:
  1. Hairline borders (`border border-border/80`).
  2. Subtle background lightness steps (`#09090B` -> `#121215` -> `#18181B`).
  3. Backdrop blur for floating bars (`backdrop-blur-xl bg-background/85`).
- **Radius Scale:**
  - Badges, status pills: `rounded-full`
  - Small inputs, inner buttons, icon chips: `rounded-xl` (12px)
  - Cards, panels, dialogs: `rounded-2xl` (16px)
  - Concentric Rule: Inner element radius must equal `outerRadius - padding`.

---

## 6. Key Component Standards

### 6.1 Buttons
- **Primary:** `bg-primary text-primary-foreground font-display font-semibold rounded-xl h-10 px-4 active:scale-[0.98] transition-all`
- **Kube Red:** `bg-kube-red text-kube-red-foreground font-display font-semibold rounded-xl h-10 px-4 active:scale-[0.98] transition-all`
- **Secondary / Outline:** `border border-border/80 bg-card hover:bg-muted/70 h-10 px-4 rounded-xl text-foreground font-display font-medium active:scale-[0.98]`
- **Touch Targets:** Minimum 44px height for mobile kitchen staff actions.

### 6.2 Data Tables & Metric Cards
- Metric cards feature:
  - Metric label in `text-xs font-display font-medium text-muted-foreground`.
  - Focal value in `text-2xl md:text-3xl font-display font-black tabular-nums text-foreground`.
  - Micro-action or status pill.
- Tables:
  - Header: `bg-muted/30 border-b border-border/70 text-start font-display font-semibold text-xs text-muted-foreground`.
  - Cells: `py-3.5 px-4 text-sm font-sans`.
  - Numeric columns formatted with `tabular-nums` and right/start RTL alignment.

### 6.3 Form Inputs
- Height 40px (`h-10`).
- Inset background: `bg-muted/20 border border-border/80 focus:bg-background focus:border-primary focus:ring-2 focus:ring-ring/20 rounded-xl`.
- Clear Arabic placeholders and explicit top labels.

---

## 7. Quality & Verification Discipline

Before finalizing any screen:
1. **The Squint Test:** Blur eyes — focal metric or primary CTA dominates immediately.
2. **The RTL Test:** Icons, chevrons (`ArrowRight` for back), tabs, and form alignments flow Right-to-Left without horizontal misalignment.
3. **The Mobile Test:** Form controls and upload buttons comfortable on 375px viewport with >= 44px hit targets.
4. **The Zero-Slop Rule:** No generic AI placeholder text, no unnecessary colored gradients, no unstyled div buttons.
