# Design — Project Identity

> This document is project-long-lived. Tokens are not changed without
> the Architect's approval. Developers MUST use these tokens
> instead of improvising their own colors/spacings.

## Style Direction

Dunkle, glamouröse Hollywood-/Red-Carpet-Bühne: tiefes Warm-Schwarz mit Champagner-Gold-Akzent, edler Serifen-Display-Typografie und weichen, flüssigen Übergängen wie ein eleganter Lookbook-Manager.

## Colors

- `--color-bg`: **#0D0A08**
- `--color-surface`: **#1A1410**
- `--color-fg`: **#F5EFE6**
- `--color-accent`: **#D4AF37**
- `--color-border`: **#3A2F26**
- `--color-muted`: **#A79B8A**
- `--color-danger`: **#C0392B**
- `--color-success`: **#3E7C5B**
- `--color-overlay`: **rgba(13, 10, 8, 0.82)**

## Typography

- `font_family`: 'Helvetica Neue', Helvetica, Arial, system-ui, sans-serif
- `heading_font_family`: Didot, 'Bodoni MT', Georgia, 'Times New Roman', serif
- `heading_weight`: 600
- `body_weight`: 400
- `size_scale`: 12px / 14px / 16px / 20px / 28px / 40px / 56px

## Spacing Scale

- `--space-0`: 4px
- `--space-1`: 8px
- `--space-2`: 12px
- `--space-3`: 16px
- `--space-4`: 24px
- `--space-5`: 32px
- `--space-6`: 48px

## Border-Radii

- `--radius-sm`: 4px
- `--radius-md`: 8px
- `--radius-lg`: 16px
- `--radius-pill`: 999px

## Components

### Button

Primary: padding 12px 24px, radius md, bg=accent #D4AF37, color=#0D0A08, font-weight 600, letter-spacing 0.04em, min-height 48px (mobile tap >=44px), transition 150ms ease. Hover: bg=#E0C25E (accent +10% lightness), subtle shadow 0 4px 14px rgba(212,175,55,0.35). Active: translateY(1px), bg=#C19A2E. Disabled: opacity 0.5, cursor not-allowed. Secondary: transparent bg, 1px solid border=#3A2F26, color=fg; hover border=accent, color=accent. Danger: bg=#C0392B, color=#F5EFE6, hover bg=#A93226.

### Card

bg=surface #1A1410, border 1px solid #3A2F26, radius lg 16px, padding 24px, shadow 0 8px 24px rgba(0,0,0,0.45). Hover (klickbar): border=accent, shadow 0 12px 32px rgba(0,0,0,0.55), transform translateY(-2px), transition 200ms ease.

### Input

bg=#0D0A08, border 1px solid #3A2F26, radius md 8px, padding 12px 16px, color=fg, placeholder=#A79B8A, min-height 48px, font-size 16px. Focus: border=accent, ring 2px rgba(212,175,55,0.25), transition 150ms ease. Error: border=#C0392B.

### Modal

Overlay: bg=overlay rgba(13,10,8,0.82), backdrop-filter blur(4px), z-index 1000. Panel: bg=surface, radius lg 16px, max-width 560px, width calc(100% - 32px), padding 32px, border 1px solid #3A2F26, shadow 0 24px 64px rgba(0,0,0,0.65), entrance fade+scale 160ms ease.

### Topbar

Sticky top, height 72px, bg=rgba(13,10,8,0.92), backdrop-filter blur(8px), border-bottom 1px solid #3A2F26. Logo/Wordmark in heading_font_family, color=accent, letter-spacing 0.08em, font-size 20px. Nav-Links color=fg, active underline 2px accent.

### CategoryPill

bg=surface, border 1px solid #3A2F26, radius pill, padding 6px 14px, color=muted, font-size 14px, min-height 36px. Active: bg=accent, color=#0D0A08, border=accent. Hover: border=accent, color=fg, transition 150ms ease.

### ImageTile

Kleidungsstück-/Outfit-Kachel: aspect-ratio 3/4, object-fit cover, radius md 8px, border 1px solid #3A2F26, bg=surface, overflow hidden. Hover: transform scale(1.02), border=accent, transition 200ms ease. Fehlendes Bild: zentriertes Serifen-Monogramm in muted auf surface.

### Toast

bg=surface, border-left 3px solid success|danger, radius md, padding 12px 16px, color=fg, shadow 0 8px 24px rgba(0,0,0,0.5), max-width 360px, slide-in-from-right 200ms ease.

### Footer

bg=#0D0A08, border-top 1px solid #3A2F26, padding 24px 32px, Links Impressum/Datenschutz color=muted, hover color=accent, font-size 14px.

## Layout Principles

- Container max-width 1200px, zentriert, seitliches Padding 16px (mobil) bis 32px (Desktop)
- Breakpoints: 640px (small), 768px (medium), 1024px (large) – mobile-first, ab 1024px mehrspaltige Layouts
- Garderobe-/Outfit-Grid: repeat(auto-fill, minmax(220px, 1fr)), gap 24px
- Sektionsabstand vertikal 48px, innerhalb von Cards 24px
- Sticky Topbar (72px) über allen Inhaltsseiten; Footer mit Impressum/Datenschutz auf jeder Seite erreichbar
- Seitenwechsel/Modals weich: opacity/transform 150–200ms ease, keine harten Sprünge
- Farbe sparsam einsetzen: Gold nur für primäre Aktionen, aktive Zustände und Markenzeichen; große Flächen bleiben dunkel
