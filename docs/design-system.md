# Aster design system

The living implementation is available at [`/style-guide`](http://localhost:3000/style-guide)
when the local app is running. The page renders the current palette, type
hierarchy, question field, evidence card, and action styles.

## Shared tokens

The base custom properties live in `src/app/globals.css` and are the source of
truth for the core shell:

| Token | Value | Role |
| --- | --- | --- |
| `--ink` | `#271f2d` | Primary text |
| `--muted` | `#857c88` | Supporting text |
| `--paper` | `#f7f4f0` | Main canvas |
| `--surface` | `#fffdfa` | Cards and form surfaces |
| `--line` | `#eae4de` | Separators and borders |
| `--plum` | `#6a3d67` | Primary actions |
| `--plum-dark` | `#211827` | Deep surfaces |
| `--plum-deep` | `#18121d` | Navigation |
| `--lilac` | `#ddc3dc` | Celestial highlights |
| `--gold` | `#d3a66a` | Warm emphasis |
| `--green` | `#587d69` | Positive status |

Rashi and planet cards may set a local accent custom property; they should not
replace the shared text, surface, or focus colors.

## Typography and layout

- Display headings use Georgia/serif at regular weight for an editorial,
  reflective feel.
- Body copy and controls use Arial/Helvetica with generous line height.
- Small all-caps labels use muted color and restrained letter spacing; keep
  their text readable and do not use them for essential instructions.
- Layouts use responsive grids, clear page gutters, and a single-column mobile
  fallback. Controls should remain reachable without horizontal scrolling.

## Components and states

- Cards use warm white surfaces, thin neutral borders, and small radii. Use
  stronger contrast only for primary action or selected state.
- Buttons and links have visible keyboard focus; `:focus-visible` is defined
  globally.
- Question and answer views keep loading, error, insufficient-evidence, saved,
  and offline states distinct.
- Evidence is a separate disclosure and its source label stays next to the
  reviewed fact.
- Motion is decorative or spatially informative. Respect
  `prefers-reduced-motion` and avoid motion as the sole way to convey state.

## Accessibility and content boundaries

Use semantic headings, explicit form labels, descriptive accessible names, and
keyboard-operable controls. Astronomy views state whether they are schematic;
traditional interpretations are labeled educational and not predictive.
Translation must not change the evidence selected or the API's unsupported
question behavior.

## Updating the system

Change the CSS tokens first, then verify the live `/style-guide`, Q&A home,
Rashi pages, and the sky/Panchang pages at desktop and mobile widths. Keep this
document aligned with the actual tokens and components.
