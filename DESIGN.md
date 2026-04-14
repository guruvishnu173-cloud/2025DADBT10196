# Design Brief

## Direction

Academic Question Paper Library — A clean, trustworthy interface for discovering and managing college question papers with distinct admin and public zones.

## Tone

Educational and focused — refined minimalism with a modern tech edge, avoiding coldness through warm secondary accents and spacious breathing room.

## Differentiation

Dual-zone visual separation: public discovery (spacious, neutral) vs. admin upload area (subtle warm amber accents on buttons), creating instant visual hierarchy without visual clutter.

## Color Palette

| Token      | OKLCH (Light)     | OKLCH (Dark)      | Role                      |
| ---------- | ----------------- | ----------------- | ------------------------- |
| background | 0.99 0.004 240    | 0.145 0.01 240    | Primary surface           |
| foreground | 0.16 0.015 240    | 0.95 0.008 240    | Body text                 |
| primary    | 0.38 0.18 240     | 0.75 0.16 240     | Deep ocean blue—main CTA  |
| accent     | 0.68 0.15 60      | 0.72 0.15 60      | Warm amber—admin actions  |
| muted      | 0.94 0.008 240    | 0.22 0.012 240    | Secondary surface         |
| destructive| 0.55 0.22 25      | 0.65 0.19 22      | Delete/danger             |

## Typography

- Display: Space Grotesk — hero text, section headings, form labels (geometric, modern, tech-forward)
- Body: Figtree — paragraphs, descriptions, UI text (warm, highly readable, friendly)
- Mono: JetBrains Mono — code blocks, file names
- Scale: hero `text-4xl md:text-5xl font-bold tracking-tight`, h2 `text-2xl font-semibold`, label `text-sm font-semibold`, body `text-base`

## Elevation & Depth

Subtle borders and soft transitions: no heavy shadows, instead use background shifts and thin `border` tokens to define card and surface hierarchy; accessibility-focused with 90+ WCAG contrast.

## Structural Zones

| Zone    | Background          | Border              | Notes                                    |
| ------- | ------------------- | ------------------- | ---------------------------------------- |
| Header  | `bg-primary`        | none                | Dark blue header with white text         |
| Content | `bg-background`     | none                | Main spacious work area                  |
| Cards   | `bg-card`           | `border-border`     | Paper listings with thin border          |
| Admin   | `bg-accent/5`       | none                | Admin zone has warm amber background     |
| Footer  | `bg-muted`          | `border-t border-border` | Secondary surface, visible separator  |

## Spacing & Rhythm

Spacious density: section gaps of `2rem`, content grouping with `1.5rem` padding, micro-spacing `0.5rem` for form fields; generous white space around filter forms and paper cards for clarity.

## Component Patterns

- Buttons: `primary` for main CTAs (blue), `accent` for admin/upload (amber), rounded `sm` (4px), high contrast
- Cards: `rounded-md` (8px), `bg-card`, thin `border-border`, no shadow
- Badges: `rounded-full`, `bg-secondary`, `text-secondary-foreground`, small font
- Form inputs: `rounded-sm` (4px), `border-input`, `bg-background`

## Motion

- Entrance: form fields fade-in on page load (100ms stagger)
- Hover: buttons scale 102%, background color shifts
- Decorative: none—keep focus on content and interactions

## Constraints

- No gradients; use solid OKLCH colors only
- No heavy shadows or blur effects; depth via elevation zones
- No more than two accent colors (primary blue + warm amber)
- Admin upload form always visually distinct from public search interface

## Signature Detail

Warm amber accents on admin/upload buttons create a visual "hotspot" that guides the owner's eye without disrupting the clean, academic aesthetic—combining trustworthiness (blue primary) with action-readiness (amber secondary).
