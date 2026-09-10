# TSS Schedule Visualizer

A Chrome extension tool that helps UCSD students see their quarter schedule.


> **Build plan and every link you need: [RESOURCES.md](RESOURCES.md)**
> **Parser build guide: [PARSER.md](PARSER.md)**

## The Problem

UCSD migrated from ISIS to TSS in Summer 2026. It's a big improvement in some ways, but
there's still no good way to visualize a full quarter at a glance — no weekly grid, no
easy way to spot gaps or conflicts across sections.

## The Idea

Two pieces working together:

1. **Chrome Extension** — a content script that runs on the TSS schedule page, in the
   student's own logged-in browser session, and pulls their schedule into structured data.
   No login automation, no credential handling; it only ever reads what is already
   rendered for a student who is already on the page.
2. **Web Visualizer** — takes that schedule data (clipboard/JSON handoff for now) and
   renders a Mon–Fri weekly time grid, color-coded by course, with automatic conflict
   detection for overlapping sections.

## Why This Approach

- **No auth risk.** TSS sits behind SSO and Duo. Rather than logging in on a student's
  behalf — a security and liability problem — the extension leans on the student's own
  already-authenticated session. It reads; it never authenticates.
- **No public API.** TSS exposes no student-facing API, so extracting data from within the
  authenticated session is the only practical route.

## What TSS Actually Is

TSS is **SAP Student Lifecycle Management** behind an SAP Fiori launchpad. `sis.ucsd.edu`
is the login entry point; the app and its data services live on **`tss.ucsd.edu`**. Booked
courses are in the **My Modules** app.

That matters a lot for how data gets extracted. Fiori embeds apps in iframes, generates
unstable DOM IDs, and virtualizes its tables — so scraping the rendered DOM is fragile.
Fortunately it doesn't have to happen. The schedule is served as structured JSON by two
OData services, readable from the student's own authenticated session:

- `ited/EVENT_TIMETABLE_SRV/EventListSet` — the timetable, filtered by date range
- `ited/BC_OVP_BOOKED_MODULES_SRV/ModuleSet` — the student's booked courses

[RESOURCES.md §2](RESOURCES.md) has the exact queries.

## Project Structure (planned)

```
tss-schedule-extension/
├── manifest.json          # Manifest V3 config, minimal permissions
├── content-script.js      # Extracts schedule data on the TSS page
├── popup.html / popup.js  # "Copy my schedule" trigger + UI
├── fixtures/              # Sanitized page/response snapshots for offline dev
└── icons/

tss-schedule-visualizer/
├── index.html             # Weekly grid UI
├── parser.js              # Turns extracted data into structured sections
├── grid.js                # Renders the Mon–Fri grid + conflict detection
└── style.css
```

## Status

- [x] Identified the content-script-in-your-own-session approach as the path forward
- [x] Identified the platform (SAP SLcM / Fiori, app on `tss.ucsd.edu`)
- [x] Found the data source: `EVENT_TIMETABLE_SRV` + `BC_OVP_BOOKED_MODULES_SRV` — no DOM scraping needed
- [x] Mapped the `EventListSet` schema (see [RESOURCES.md §2](RESOURCES.md))
- [ ] Capture sanitized fixtures for offline development
- [ ] Write the extraction layer
- [ ] Build the popup bridge (clipboard/JSON handoff)
- [ ] Build the weekly grid visualizer with conflict detection
- [ ] Test locally via `chrome://extensions` → Load unpacked
- [ ] Publish to the Chrome Web Store

## Tech

- Vanilla JS, HTML, CSS — no frameworks
- Manifest V3 (Chrome Extensions)
- Optional later: Cloudflare Workers/D1 if schedule persistence or sharing gets added —
  see the FERPA note in [RESOURCES.md §7](RESOURCES.md) before going there

## Privacy

Schedule data stays on the student's own machine. Nothing is transmitted anywhere, and no
credentials are ever read, stored, or handled.

## Why This Project

Built after spotting a real gap during UCSD's TSS migration — a tool students can actually
use, not a tutorial exercise.
