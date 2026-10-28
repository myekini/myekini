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

Data Engineering and Cloud FinOps receive equal visual weight in the professional title, example selector and paired work stories. The surrounding page remains still while the illustrative pipeline explains a finite progression from sources to checked outputs.

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

Sections use 80px vertical padding and a top rule. At 960px, the hero portrait reduces to 220px and major column gaps tighten. At 760px, sections reduce to 52px padding, work stories stack, and the pipeline changes from five horizontal columns to a vertical flow. Hero text owns the reading order; its portrait becomes a 112px supporting image at the upper right. At 560px, the portrait reduces to 90px, navigation spans its own row, experience dates move above the title and metric descriptions stack beneath their labels.

Navigation, actions and pipeline controls have at least 44px interactive height; hero actions use 48px. Anchor clearance follows the measured sticky-header height rather than a fixed desktop assumption.

## Elevation & Depth

The system uses tonal layering and fine borders, without box shadows. The sticky header uses a translucent near-black surface with 10px backdrop blur. The portrait fades into the page toward its lower edge. The pointer lens uses amber rings to distinguish the revealed photograph from its character grid.

## Shapes

Primary actions, pipeline surfaces and project containers are square. The copy control uses a small rounded corner. The availability dot is circular. Dashed stage rules, bracketed stage labels and character arrows give the pipeline its ASCII-inspired form without enclosing each stage in a separate card.

## Components

### Actions and navigation

The primary action uses amber fill with dark text. The secondary action is transparent with a muted border; hover turns the border amber. Links use underlines with a 4px offset except in the header and dedicated action treatments. Keyboard focus has a 2px amber outline with 3px offset. Header navigation uses muted text, brighter current-location text and amber hover. Number keys 1 through 4 progressively enhance section navigation.

### Illustrative pipeline

A caption, ordered five-stage flow and log share a single bordered sunk surface. Both examples use source, ingest, model, check and serve stages. The reconciliation example moves payment records through matching and validation to a warehouse and dispute portal. The cloud-cost example moves billing records through amortization, offsets and validation to reporting and commitment analysis. These are illustrative workflows, explicitly labelled as such.

The equally styled mode buttons use an amber underline and faint amber fill for selection. Replay restarts the chosen flow; Pause becomes Resume while paused. The flow starts once on entering the viewport, advances every 1450ms, and stops after the fifth stage. Offscreen or hidden-document states suspend advancement. Active arrows move in the direction of the responsive layout. Completed stages use amber rules and green status text.

With reduced motion, all stages render complete and static, and pause is disabled. Without JavaScript, the authored reconciliation path and explanatory content remain readable, while enhancement controls remain hidden.

### Selected work and experience

Selected work uses open editorial columns, each with a domain label, narrative, ruled metric rows and a link to work details. Native `details` and `summary` elements provide experience disclosure. Summary rows align dates, role and a plus/minus sign; expanded metrics align beside their explanation on desktop. The FinOps role starts open. Work-story links open the corresponding experience disclosure.

### Public builds

The featured build uses a square bordered container with a raised title bar, narrative body, definition-list notes and repository footer. Other builds use numbered ruled links. Current status and planned capabilities are explicit text, not implied by polished product imagery.

### Portrait

The real photograph is the accessible fallback. On hover-capable devices, a canvas samples the portrait into a character grid and a pointer lens reveals the photograph beneath it. The intro resolves once; there is no idle animation loop. Reduced motion skips the intro and makes lens changes immediate. Touch devices retain the photograph, and mobile layout disables the hover interaction.

### Contact

A terminal-style email row keeps the mail link directly available. Copy appears only when the clipboard API is available, reports success in green and keeps failure guidance visible in its label.

## Do's and Don'ts

- **Do** preserve the black and amber identity, ASCII portrait and sans/mono division of roles.
- **Do** retain equal visual emphasis for Data Engineering and Cloud FinOps.
- **Do** keep essential text, native disclosures and contact access usable without animation or JavaScript.
- **Do** keep workflow status readable as text as well as color.
- **Don't** present the illustrative pipeline as a live system or a client architecture.
- **Don't** use fabricated screenshots or finished-product presentation to imply that planned public builds are complete.
- **Don't** add scattered entrance choreography or continuous idle portrait flicker.
