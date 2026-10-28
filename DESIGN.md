---
name: Muhammad Yekini portfolio
description: An editorial engineering portfolio in black and amber.
colors:
  bg: "#0d0e0f"
  bg-raised: "#111214"
  bg-sunk: "#0a0b0c"
  line: "#1a1c1f"
  line-strong: "#1f2124"
  line-dash: "#2a2d31"
  text: "#e6e6e3"
  text-strong: "#f4f4f2"
  text-body: "#c9cac6"
  muted: "#a0a5ad"
  faint: "#9298a2"
  accent: "#d69e2e"
  ok: "#68d391"
typography:
  display:
    fontFamily: "DM Sans, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "clamp(56px, 6.8vw, 88px)"
    fontWeight: 500
    lineHeight: 0.98
    letterSpacing: "-.035em"
  headline:
    fontFamily: "DM Sans, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "clamp(30px, 4vw, 42px)"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-.025em"
  body:
    fontFamily: "DM Sans, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "16px"
    lineHeight: 1.65
  label:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "12px"
rounded:
  square: "0"
  copy: "4px"
  architecture-node: "8px"
spacing:
  small: "8px"
  medium: "16px"
  large: "24px"
  section: "80px"
components:
  action-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.bg}"
    rounded: "{rounded.square}"
    padding: "12px 18px"
  action-secondary:
    textColor: "{colors.text}"
    rounded: "{rounded.square}"
    padding: "12px 18px"
  copy:
    textColor: "{colors.muted}"
    rounded: "{rounded.copy}"
    padding: "10px 14px"
---

# Design System: Muhammad Yekini portfolio

## Overview

The established direction is an editorial engineering portfolio in a near-black and amber world. Large, restrained sans-serif headings and readable narrative sit alongside monospaced labels, numbered navigation and terminal-like details. The ASCII portrait is the distinctive identity asset.

Data Engineering and Cloud FinOps receive equal visual weight in the professional title, example selector and paired work stories. The surrounding page remains still while a seven-node architecture diagram carries document-shaped packets from sources through checks to reporting or human review. Supporting explanations expand in place, keeping the default reading path short.

**Key Characteristics:**

- Broad desktop composition with open editorial columns.
- Text-first mobile hierarchy and a small supporting portrait.
- Amber for emphasis and interaction; green for completion and availability.
- Thin rules, square containers and minimal tonal depth.

## Colors

### Primary

Amber is the single brand accent. It marks the name punctuation, primary action, domain labels, selected pipeline mode, active processing and focus outlines. Primary-action hover lightens to `#e7b24a`.

### Neutral

The near-black background carries the page. Raised black distinguishes the project header, while sunk black grounds the pipeline. Off-white strong text carries headings; body text, muted text and faint text provide progressively quieter supporting roles. Thin dark borders separate sections, experience rows and project content.

Green is a functional state color for availability, completed stages and successful copying. It is not a competing brand accent.

## Typography

DM Sans, with system sans-serif fallbacks, carries the name, professional title, narrative, headings and action labels. JetBrains Mono, with system monospace fallbacks, carries technical labels, navigation, dates, metrics and terminal cues.

The display and section-heading tokens describe desktop defaults. The professional title scales from 17px to 22px; the hero proposition scales from 21px to 28px with a 1.45 line height. Selected-work headings scale from 23px to 29px. Narrative commonly uses 15px to 17px with line heights around 1.55 to 1.7. Technical labels generally use 10px to 13px. Headings use medium weight rather than heavy bold.

## Layout

The centered outer canvas is 1120px including fluid horizontal padding from 20px to 32px. Desktop hero content uses a flexible text column beside a 290px portrait with a 60px gap. Selected work has two equal columns separated by 64px. Narrative measures are local to their purpose: work stories use up to 50ch, biography up to 65ch, and section introductions up to 70ch.

Sections use 80px vertical padding and a top rule. At 960px, the hero portrait reduces to 220px and major column gaps tighten. At 760px, sections reduce to 52px padding, work stories stack, and the architecture diagram changes from a horizontal merge and fork to a vertical merge and fork. Hero text owns the reading order; its portrait becomes a 112px supporting image at the upper right. At 560px, the portrait reduces to 90px, navigation spans its own row, experience dates move above the title and metric descriptions stack beneath their labels.

Navigation, actions and pipeline controls have at least 44px interactive height; hero actions use 48px. Anchor clearance follows the measured sticky-header height rather than a fixed desktop assumption.

## Elevation & Depth

The system uses tonal layering and fine borders, without box shadows. The sticky header uses a translucent near-black surface with 10px backdrop blur. The portrait fades into the page toward its lower edge. The pointer lens uses amber rings to distinguish the revealed photograph from its character grid.

## Shapes

Primary actions, pipeline surfaces and project containers are square. The copy control uses a small rounded corner. The availability dot is circular. Architecture nodes use 8px corners and fine borders. Line icons, source filenames and document-shaped SVG packets distinguish sources, processing and outcomes. Native select controls use 4px corners.

## Components

### Actions and navigation

The primary action uses amber fill with dark text. The secondary action is transparent with a muted border; hover turns the border amber. Links use underlines with a 4px offset except in the header and dedicated action treatments. Keyboard focus has a 2px amber outline with 3px offset. Header navigation uses muted text, brighter current-location text and amber hover. Number keys 1 through 4 progressively enhance section navigation.

### Synthetic architecture demonstration

Seven nodes form a directed graph: two sources merge into ingestion, then pass through modelling and validation before forking to reporting and human review. Desktop uses five columns and two rows. At 760px and below, paired sources sit above three centered processing nodes, with paired outputs below. SVG wires follow the nodes on resize. Nodes use raised black, gray borders, line icons, sans-serif titles and monospaced source labels.

Equal-weight mode buttons select payment reconciliation or cloud-cost allocation. An amber underline and faint amber fill mark selection. A labelled native select offers a clean run plus two faults per example: duplicate payment or missing settlement; double-counted charge or missing owner. Replay restarts the run. Pause becomes Resume during an unfinished run and disappears at completion or with reduced motion.

Document-shaped SVG packets travel along wires over a finite seven-second run in five causal phases. The bounded requestAnimationFrame clock suspends while paused, offscreen or in a hidden document. Active nodes use amber; passed wires and completed states use green; held exceptions use amber. Text distinguishes waiting, processing, paused, published and held outcomes. A separate polite status region announces manually triggered completion.

Results show published and held record counts and currency-formatted totals: NGN for payments and USD for cloud costs. Outcomes come from a deterministic synthetic engine checking matches, duplicates, missing owners, input conservation and cent-preserving shared allocation. A collapsed inspector exposes record traces and checks; a nested disclosure explains integer minor units and largest-remainder allocation.

Reduced motion immediately presents a completed static outcome without travelling packets. Without JavaScript, authored payment nodes and explanations remain readable; enhancement controls and the computed inspector remain hidden. This browser demonstration is separate from the planned public builds. PDF imagery represents supplied synthetic extracted statement rows; no PDF parsing or live account connection is claimed.

### Selected work and progressive disclosure

Selected work retains two equal editorial columns, with domain labels, narrative and ruled metric rows. Each story has a native disclosure for its approach and a link to the full role. Full experience is a closed outer disclosure containing six native role disclosures. Role links and matching URL fragments open enclosing disclosures before navigation.

Education, the LLM principle, technical inspection and implementation rationale also use native disclosures. Summary targets are at least 44px high and use amber hover. The full-experience summary has a top rule, muted supporting label and amber plus/minus sign. Supporting detail expands in place while the default reading path stays short.

### Public builds

Three open, ruled list rows show repository links, concise purposes and explicit statuses. The first status uses amber; later statuses use muted text. Project titles use medium-weight sans-serif at 22px. Below 560px, status moves beneath the project text. Descriptions identify designs and evaluation plans as available and implementations as pending.
### Portrait

The real photograph is the accessible fallback. On desktop and touch devices, a canvas samples the portrait into a character grid. Hover or tap reveals the photograph beneath an amber lens; touch uses a larger lens that closes after release. Small portraits use a finer character grid. The intro resolves once; there is no idle animation loop, and a stationary lens stops redrawing. Reduced motion skips the intro and makes lens changes immediate. Mobile preserves native vertical scrolling.

### Contact

A simple email row keeps the mail link directly available. The footer includes location, GitHub and LinkedIn links. Copy appears only when the clipboard API is available, reports success in green and keeps failure guidance visible in its label.

## Do's and Don'ts

- **Do** preserve the black and amber identity, ASCII portrait and sans/mono division of roles.
- **Do** retain equal visual emphasis for Data Engineering and Cloud FinOps.
- **Do** keep essential text, native disclosures and contact access usable without animation or JavaScript.
- **Do** keep workflow status readable as text as well as color.
- **Don't** present the synthetic demonstration as a live client system, a client architecture or a PDF parser.
- **Don't** use fabricated screenshots or finished-product presentation to imply that planned public builds are complete.
- **Don't** add scattered entrance choreography or continuous idle portrait flicker.
