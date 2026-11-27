---
name: Vivid soboslikanje
description: A prepared job site. Content waits under protective foil and painter's tape, then is unwrapped to a finished wall.
colors:
  navy: "#003060"
  navy-deep: "#00223f"
  tape: "#6fa8e2"
  tape-ink: "#0d1b2e"
  ink: "#0d1b2e"
  ink-2: "#44505f"
  wall: "#f6f6f3"
  wall-2: "#e9e9e6"
  paper: "#ffffff"
  on-navy: "#f6f6f3"
  on-navy-2: "#b8c7d9"
  line: "#d3d2cb"
  error: "#a3271b"
typography:
  display:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "7.25rem"
    fontWeight: 800
    lineHeight: 0.86
    letterSpacing: "-0.045em"
    fontVariation: "'wdth' 125"
  headline:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "4rem"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.035em"
    fontVariation: "'wdth' 125"
  title-lg:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "3.1rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontVariation: "'wdth' 125"
  title:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "2.1rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontVariation: "'wdth' 125"
  lead:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 400
    lineHeight: 1.6
    fontVariation: "'wdth' 100"
  body:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
    fontVariation: "'wdth' 100"
  button:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    letterSpacing: "0.01em"
    fontVariation: "'wdth' 112"
    fontFeature: "'tnum' 1"
  label:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    letterSpacing: "0.05em"
    fontVariation: "'wdth' 112"
  marker:
    fontFamily: "Kalam, cursive"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.2
  marker-lg:
    fontFamily: "Kalam, cursive"
    fontSize: "1.3125rem"
    fontWeight: 700
    lineHeight: 1.2
rounded:
  none: "0px"
spacing:
  paper-inset: "8px"
  field: "12px"
  tape-x: "16px"
  stack-sm: "14px"
  stack-md: "28px"
  stack-lg: "40px"
  gutter: "56px"
  section: "170px"
components:
  button-primary:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.on-navy}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: "0 26px"
    height: "56px"
  button-primary-hover:
    backgroundColor: "{colors.navy-deep}"
    textColor: "{colors.on-navy}"
  button-tape:
    backgroundColor: "{colors.tape}"
    textColor: "{colors.tape-ink}"
    typography: "{typography.marker}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "46px"
  button-tape-lg:
    backgroundColor: "{colors.tape}"
    textColor: "{colors.tape-ink}"
    typography: "{typography.marker-lg}"
    rounded: "{rounded.none}"
    padding: "0 24px"
    height: "56px"
  chip:
    textColor: "{colors.ink}"
    typography: "{typography.marker}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "44px"
  chip-on:
    backgroundColor: "{colors.tape}"
    textColor: "{colors.tape-ink}"
  input-field:
    backgroundColor: "{colors.wall}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "{spacing.field}"
  pinned-photo:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "{spacing.paper-inset}"
  quote-sheet:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "48px"
  nav-link:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
  mobile-bar:
    backgroundColor: "{colors.wall}"
    height: "50px"
---

# Design System: Vivid soboslikanje

## Overview

**Creative North Star: "The Prepared Job Site"**

The page is a room the crew has just finished. Every surface is a freshly rolled white wall (warm off-white with a faint roller-noise grain you only see up close), and the brand navy is not an accent but paint: it covers whole sections edge to edge, the way a feature wall would. Things the crew sticks onto that wall carry the content: photos printed on white paper with a strip of blue painter's tape across the top, a form sheet taped at both corners, a handwritten note. The signature act is the unwrap: hero and card photos first sit under milky, crinkled protective foil sealed with a tape strip ("ne dirati, svježe", "pokriveno"), and once in view the tape peels off and the foil slides away to show the finished work. The page proves "tidy" by staging it rather than claiming it.

Two hands write on this site. Printed in the hand of the workwear and the logo: Archivo, pushed to its widest axis (125) at weight 800, uppercase, tightly tracked. Written in marker: Kalam bold, used only on the tape and on paper captions, the lettering a painter scrawls on masking tape. Density is generous and bodily: sections breathe (up to 170px of vertical padding), headlines are huge, and nothing is boxed into icon cards. Objects on the wall sit slightly askew (between about -3deg and +2.2deg), which is the main way the system shows it was made by hand. Corners are always square.

This world replaces a Scandinavian-minimal version the client rejected, and refuses the contractor default of a dark-overlay photo hero, icon-card service grids and a stat row. (Descriptive language here was derived from the direction contract and the shipped build; the client was not interviewed for it in this pass.)

**Key Characteristics:**
- Off-white roller-textured wall as the ground; brand navy painted across entire sections, never as small cards.
- Painter's-tape blue as a physical material: strips with serrated ends, selected states, underlines, list ticks.
- Wide heavy Archivo caps for anything printed; Kalam marker for anything handwritten on tape or paper.
- Photos are real job-site shots, printed on white paper and taped to the wall, slightly rotated.
- Frosted, crinkled foil (backdrop blur) over photos that peels away once, on scroll.
- Square corners everywhere; depth comes from soft, downward cast shadows under taped-up objects.

## Colors

A restrained painter's palette: one off-white wall, one committed brand navy, one tape blue, and ink.

### Primary
- **Vivid Navy** (navy): The brand colour from the logo and a non-negotiable commitment. Used as paint: it fills the services section ("Što radimo") and the quote section ("Recite nam koji zid.") with roller grain on top, colours the hero headline and the card titles on white, fills the primary call button, the mobile menu, the scrollbar thumb and the focus ring.
- **Deep Navy** (navy-deep): The darker coat. Primary button hover and the footer field.

### Secondary
- **Painter's Tape Blue** (tape): The only accent, and it is always tape. Tape buttons ("Zatraži ponudu", "Besplatna ponuda"), tape strips over photos and the form, the slanted running band of services, the selected filter chip and form pick, the nav hover underline, list tick marks, text selection, and icons on navy. Text on it is always tape ink (6.9:1).

### Neutral
- **Fresh Wall** (wall): The page ground, layered with a fine roller-noise texture. Also the solid header after scroll, input fill and the mobile action bar.
- **Second Coat** (wall-2): A slightly greyer wall for the works section ("S naših radilišta") and the empty frame behind photos before they load.
- **Print Paper** (paper): Pure white for anything printed and taped up: photo prints, the testimonial note, the quote sheet. It reads as a separate object against the off-white wall.
- **Ink** (ink / tape-ink): Body text on the wall and paper, and the lettering on tape.
- **Soft Ink** (ink-2): Leads, secondary text, list text, captions on the wall.
- **Wall on Navy** (on-navy) and **Navy Mist** (on-navy-2): Text on painted navy fields; mist for paragraphs and footer legal lines.
- **Plaster Line** (line): Hairline row dividers in the facts and roles lists and the header's bottom rule.
- **Error Red** (error): Field error text and the error underline only.

### Named Rules
**The Painted Field Rule.** Navy is applied like paint to a whole wall: a section is either white wall or navy wall, edge to edge. Navy never appears as a floating card or panel on white.

**The Tape Is Tape Rule.** Tape blue only appears where a strip of masking tape could physically be: strips, labels, selected states, underlines, ticks. It is never a background for a section (the slanted service band is a single long strip of tape, not a section) and never a text colour on white.

## Typography

**Display Font:** Archivo (variable, width 62 to 125, weight 400 to 900), with Arial Narrow and sans-serif fallback
**Body Font:** Archivo at normal width (100)
**Marker Font:** Kalam Bold, with cursive fallback

**Character:** Archivo at full width and heavy weight is the printed voice of the brand: the logo, the "Profesionalno soboslikanje" print on white work clothes, stencilled caps. Kalam is the marker lettering written on tape on site. The pairing is printed authority plus a handwritten aside.

### Hierarchy
- **Display** (800, width 125, fluid from 2.9rem to 7.25rem at 6.3vw, line-height 0.86, uppercase, navy): The hero headline "ZID GOTOV. POD ČIST." only. Each line sits in its own mask and rises into place on load. On phones it is set at 12vw.
- **Headline** (800, width 125, fluid from 2rem to 4rem at 4.6vw, line-height 0.98, uppercase): Section headings, in ink on wall and wall colour on navy.
- **Title Large** (800, width 125, fluid from 1.6rem to 3.1rem, line-height 1, uppercase): Service rows on the navy field.
- **Title** (800, width 125, fluid from 1.5rem to 2.1rem, line-height 1, uppercase, navy): Card titles ("Stan i kuća", "Trgovina, lokal, ured"); the quote sheet title uses the same voice at 1.5rem.
- **Lead** (400, 1.1875rem, line-height 1.6): Opening paragraphs of hero, intro, team and contact, capped at 40 to 54ch.
- **Body** (400, 1.0625rem, line-height 1.6): Everything else, capped near 54ch.
- **Button** (700, width 112, 1rem, 0.01em, tabular figures): Navy buttons and the mobile bar.
- **Label** (600 to 700, width 112, 0.875 to 0.9375rem, 0.04 to 0.06em, uppercase): Nav links, form labels, footer nav, the hero service line.
- **Marker** (Kalam 700, 1.0625 to 1.3125rem, line-height 1.2): Tape labels, tape buttons, filter chips, form picks, photo captions, the testimonial attribution, the band.

### Named Rules
**The Two Hands Rule.** Archivo is printed, Kalam is written. Kalam only appears on tape or as a caption on taped-up paper (and the lightbox caption that repeats it); it never sets a heading or a paragraph.

**The Wide Caps Rule.** Every heading is Archivo 800 at width 125, uppercase, with negative tracking (-0.02 to -0.045em). Headings never drop to normal width or sentence case.

## Layout

A single long page on a centred container (1320px max, hero allowed 160px wider) with a fluid side gutter of clamp(16px, 4vw, 56px). Sections alternate between white wall, navy wall and second-coat wall, with heavy vertical padding of clamp(96px, 12vw, 170px).

Compositions are asymmetric two-column grids rather than centred stacks: hero 1.15fr / 0.85fr (text left, foil-covered photo right, max 520px), intro and works head 1fr / 1fr, team 0.9fr / 1.1fr, quote 0.85fr / 1.15fr. Services are full-width rows with text on the left and a 260px taped photo on the right, separated by thin translucent rules. The four process steps are a staircase: each column drops a further 28px. The gallery is a three-column grid with a 2x2 feature print, 36px vertical gaps leaving room for the tape strip above each print.

Breakpoints: at 1080px the nav and header phone collapse into a burger and steps become two columns; at 860px every grid becomes one column, the hero reorders to headline, photo, lead, actions, the gallery goes to two columns, and a fixed bottom bar appears (navy "Nazovite" plus tape "Besplatna ponuda"), hidden while the quote section is on screen; at 520px steps go single column and the hero call button goes full width. The header is fixed (78px, 66px on mobile), transparent over the hero, turns solid wall after 24px of scroll and hides on scroll down.

## Elevation & Depth

The walls are flat; only objects stuck onto the wall cast shadows. Shadows are soft, downward and pulled in with negative spread, as if lit from above in a room, and tinted with ink rather than black where the object sits on white. The foil adds a second, translucent layer: a frosted blur (9px, desaturated, slightly brightened) with a crinkle texture and a soft, wavy top edge.

### Shadow Vocabulary
- **Tape** (`box-shadow: 0 1px 2px rgba(13, 27, 46, .18)`): The barely-raised thickness of a tape strip.
- **Tape lifted** (`box-shadow: 0 8px 18px -8px rgba(13, 27, 46, .45)`): Tape button on hover, straightening and lifting 2px.
- **Print** (`box-shadow: 0 18px 30px -22px rgba(13, 27, 46, .55)`): Gallery prints at rest; deepens to `0 28px 40px -24px rgba(13, 27, 46, .6)` on hover.
- **Covered photo** (`box-shadow: 0 30px 60px -38px rgba(13, 27, 46, .55)`): Foil-covered photos.
- **Note** (`box-shadow: 0 22px 40px -28px rgba(13, 27, 46, .45)`): The testimonial note on white wall.
- **Print on navy** (`box-shadow: 0 22px 40px -24px rgba(0, 0, 0, .6)`) and **Sheet on navy** (`box-shadow: 0 34px 60px -34px rgba(0, 0, 0, .65)`): Darker, black-based shadows for paper objects on the navy field.
- **Header rule** (`box-shadow: 0 1px 0 var(--line)`): A hairline, not elevation.

### Named Rules
**The Taped-Up Rule.** Only things taped to the wall cast shadows: paper prints, notes, the form sheet, tape. Sections, buttons at rest, lists and fields are flat. Shadows are always soft and downward; never a hard offset.

## Shapes

Square corners without exception (0px): buttons, chips, inputs, prints, sheet, social squares, lightbox controls. The only non-rectangular edges are material ones: tape strips end in serrated teeth (6 by 7px triangles masked onto both ends), the foil has a soft, uneven top edge, and nav underlines and list ticks are short tilted tape slivers. Rotation is the form language: prints, notes and tape sit at small angles (prints -1.2 to +2.2deg, tape strips -3 to +2deg, corner tape at ±32deg) and straighten to 0 on hover. Borders are thin and functional: a 2px navy rule tops the facts and roles lists, 1px plaster lines divide rows, 1.5px dashed outlines mark unselected chips and picks.

## Components

### Buttons
Confident and physical: navy is the solid order, tape is the friendly hand-written ask.
- **Shape:** Square (0px), minimum 46 to 56px tall.
- **Primary (navy):** Navy fill, wall-coloured text, Archivo 700 at width 112, 56px tall, 26px side padding, optional leading phone icon ("Nazovite 092 326 8507", "Pošalji upit").
- **Hover / Active:** Hover deepens to deep navy (0.2s); press scales to 0.97.
- **Tape button:** A strip of tape: tape fill with a subtle top sheen and fibre stripes, Kalam lettering, serrated ends, tilted -1.5deg (large variant +1.2deg, 56px tall). On hover it straightens to 0deg, lifts 2px, gains the lifted shadow and its arrow nudges 3px right; press scales to 0.97 keeping its tilt. Used for "Zatraži ponudu" in the header and "Besplatna ponuda" in the hero.

### Chips and Picks
- **Style:** Kalam lettering, 44px tall, 16px side padding, transparent with a 1.5px dashed slate outline (#6f7a8a, 3:1 or better on both wall tones) at rest (like an unpeeled tape outline).
- **State:** Selected becomes a solid tape strip tilted -1.5deg; hover on unselected turns the outline navy. The same component serves the gallery filters ("Sve", "Poslovni prostori", "Stropovi" ...) and the radio/checkbox picks in the quote form, with a navy focus ring on the visually hidden input.

### Inputs / Fields
- **Style:** Wall-coloured fill on the white sheet, no box border, a 2px slate bottom rule (#7a8494, 3:1 or better), 12px padding, square. Labels sit above in uppercase Label type.
- **Focus:** Bottom rule turns navy and the fill cools to a pale blue (#eef3f9); caret is navy.
- **Error:** Bottom rule and a short message below turn error red; the first invalid field takes focus.

### Navigation
- **Desktop:** Logo left; uppercase Label links (Usluge, Radovi, Tim, Kontakt) with a tilted tape sliver that wipes in from the left under the word on hover; phone number and tape button on the right.
- **Mobile:** Two-line burger that crosses on open; the menu is a full navy wall that wipes down (clip-path, 0.5s), with links in 2.5rem wide caps and the logo inverted to white.

### Taped Prints
White paper with an 8px border (no bottom border on gallery prints, where the Kalam caption sits), a tape strip across the top centre or tape at the corners, a small rotation and the print shadow. Gallery prints open a full-screen dark lightbox with marker caption, count, arrows, keyboard and swipe. On reveal, gallery prints drop 18px and settle as if pressed onto the wall, staggered 90ms per column.

### Foil-Covered Photo (signature)
A photo under a translucent frosted foil sheet with crinkle texture and a tape seal lettered in marker. When 45% visible (the hero waits 1.2s for its headline to land first) the seal rotates and peels up and away (0.7s), then the foil slides down and off to the bottom right (1.2s) while the photo eases out of a 1.04 zoom. It happens once. With reduced motion the foil and seal simply fade; without JavaScript there is no foil at all. Atmosphere images that are not Vivid's own work carry a tape label reading "ilustracija".

### Quote Sheet
A white sheet on the navy field, tilted -0.6deg (flat on mobile), taped at both top corners, with the sheet title in navy wide caps, a two-column field grid and a full-width navy submit button.

### Running Tape Band
One long strip of tape laid across the page under the hero, rotated -1.6deg and bleeding past both edges, with services lettered in marker scrolling slowly (38s loop) and separated by faint slashes. Stops under reduced motion.

## Do's and Don'ts

### Do:
- **Do** paint whole sections navy or leave them wall; alternate wall, navy and second coat down the page.
- **Do** put photos on white paper with tape, rotated between -2deg and +2.2deg, with the soft downward print shadow.
- **Do** set every heading in Archivo 800 at width 125, uppercase, tightly tracked; keep hero type in navy on the wall.
- **Do** write on tape in Kalam, and only on tape or paper captions.
- **Do** use real job-site photos as proof, and label any atmosphere image with an "ilustracija" tape note.
- **Do** keep motion physical and single-use: peel once, settle prints once, fade only under reduced motion, and use the two project curves (cubic-bezier(0.23, 1, 0.32, 1) out, cubic-bezier(0.77, 0, 0.175, 1) in-out).
- **Do** keep every call and quote action within reach: navy call button and tape quote button side by side, the mobile bottom bar on phones.

### Don't:
- **Don't** round corners; the only shaped edges are tape teeth and the foil edge.
- **Don't** use tape blue as a section background, a text colour on white, or a decorative gradient.
- **Don't** put foil over text or controls; foil covers photos only.
- **Don't** use a dark-overlay photo hero, icon-card service grids or a statistics row.
- **Don't** drift back toward the rejected Scandinavian-minimal calm (pale greys, thin light type, empty centred layouts).
- **Don't** use hard offset shadows or shadows on flat elements such as sections and resting buttons.
- **Don't** set headings or paragraphs in Kalam.
