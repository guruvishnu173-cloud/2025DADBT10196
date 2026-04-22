# Design Brief

## Direction

**3D Immersive Academic Archive** — Deep dimensional experience inspired by ActiveTheory; layered floating depth, glassmorphic surfaces, perspective transforms, and interactive dimensional elevation create premium, memorable interaction. Floating UI elements hover above background layers with strong ambient shadows. Every surface has distinct Z-axis position.

## Tone

Bold contemporary tech — immersive 3D depth, dimensional floating cards, glassmorphic panels, glowing accents. Luxury meets accessibility: premium visual complexity balanced with clear hierarchy and content-first design.

## Differentiation

Layered perspective system: hero floats above mid-layer cards, which float above base grid. Glassmorphic surfaces blur into depth. Orange primary glows with dimensional shadows. Parallax and hover-activated 3D transforms. Public + admin zones use identical depth system for unified dimensional language.

## Color Palette

| Token      | OKLCH (Dark)      | Role                           |
| ---------- | ----------------- | ------------------------------ |
| background | 0.23 0.008 55     | Deep layered base surface      |
| foreground | 0.94 0.008 55     | High-contrast text             |
| primary    | 0.76 0.16 45      | Warm orange—main CTA + glow    |
| accent     | 0.8 0.17 42       | Secondary warm—accent depth    |
| card       | 0.27 0.01 55      | Mid-layer floating surfaces    |
| border     | 0.35 0.01 55      | Glass + dimensional edges      |
| muted      | 0.31 0.012 55     | Tertiary depth layer           |
| destructive| 0.65 0.19 22      | Delete/danger with depth       |

## Typography

- Display: Space Grotesk — geometric, tech-forward, dimensional headlines
- Body: Figtree — warm, highly readable paragraphs and UI labels
- Mono: JetBrains Mono — code and technical content
- Scale: hero `text-5xl font-bold tracking-tight`, h2 `text-2xl font-semibold`, label `text-sm font-semibold`, body `text-base`

## Elevation & 3D System

Four-tier depth layer system via ambient shadows: `.depth-layer-1` (subtle inset glow), `.depth-layer-2` (elevated card), `.depth-layer-3` (floating mid-level), `.depth-layer-4` (foreground active). Glass morphism (background blur + semi-transparent) on all surfaces. Glow halos on primary interactive elements. Perspective transforms on hover.

## Structural Zones

| Zone     | Background              | Shadow           | Notes                                   |
| -------- | ----------------------- | ---------------- | --------------------------------------- |
| Hero     | `glass-base`            | `depth-layer-4`  | Floating above content, highest Z-axis |
| Header   | `glass-elevated`        | `depth-layer-2`  | Semi-transparent glass layer            |
| Content  | `bg-background`         | none             | Base grid layer, lowest Z-axis          |
| Cards    | `glass-elevated`        | `depth-layer-3`  | Floating mid-layer with glow            |
| Admin    | `glass-elevated`        | `depth-layer-3`  | Same depth as content cards             |
| Footer   | `glass-base`            | `depth-layer-1`  | Subtle elevated base                    |

## Spacing & Rhythm

Generous layered spacing: 3rem gaps between depth zones, 2rem section padding, 1.5rem card internal padding. Floating margins create air between layers. Breathing room around glass surfaces.

## Component Patterns

- Buttons: primary `glow-primary` + `depth-layer-2` on hover, round corners, smooth scale
- Cards: `glass-elevated` + `depth-layer-3`, floating animation, hover 3D rotate-y
- Glass surfaces: `backdrop-filter blur-xl` + semi-transparent background, thin borders
- Badges: `rounded-full`, floating with subtle animation

## Motion Choreography

- Page load: cards float-in with staggered 100ms timing
- Hover: buttons scale 105% + glow intensify, cards rotate 2deg on Y-axis
- Interactive: smooth 0.4s dimensional transitions (ease-out-back)
- Continuous: `float-subtle` (3s) on mid-level elements, `float-medium` (4s) on hero

## Constraints

- No flat surfaces; every element has depth shadow or glass
- Glow halos only on primary interactive elements (avoid neon saturation)
- Glass blur always paired with semi-transparent background (no pure glass)
- Perspective rotations subtle (max 2-3 degrees) to maintain readability

## Signature Detail

**Dimensional floating depth**: Cards hover above base layer with multi-shadow depth system, creating ActiveTheory-style immersive space. Warm orange primary glows from within dimensional surfaces. Parallax perspective on scroll creates continuous 3D sensation throughout.
