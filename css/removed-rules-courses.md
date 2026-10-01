# Removed CSS — courses.html and courseDetail.html

Compared with the Assignment 2 versions of `css/courses.css` (706 lines) and `css/courseDetail.css` (910 lines).
After moving to Bootstrap 5.3.8 they are a short correction layer: brand colours only, plus one justified override.

Several old rules styled classes that no longer exist in the markup (for example filter chips, Kaspi and WhatsApp badges, breadcrumbs, branch cards). They were deleted, and nothing replaces them.

## courses.css

| Removed rule(s) | What it did | Replaced by |
|---|---|---|
| `:root` palette, radius, shadow and transition variables | brand tokens | `--bs-warning-rgb` / `--bs-dark-rgb` on `main`; `rounded-3`, `shadow-sm` |
| `*`, `html`, `body`, `h1–h3`, `a` resets | box-sizing, font, margins | Bootstrap Reboot |
| `.container` | max-width + side padding | `.container` / `.container-fluid` |
| `.visually-hidden` | screen-reader-only text | Bootstrap `.visually-hidden` |
| `.hero`, `.hero h1`, `.hero-lead` | dark gradient title band, big heading, lead text | `container-fluid bg-dark text-white py-5`, `display-4 fw-bold`, `lead` |
| `.hero-badge`, `.hero-eyebrow` | rating badge, small caps label | removed (not in the markup) |
| `.course-filters`, `.filter-chip` | category chips | removed (not in the markup) |
| `.course-grid` / `.courses-grid` (CSS grid `auto-fill`) | card grid | `row g-4` + `col-12 col-lg-6`, nested `row g-3` + `col-12 col-sm-6` |
| `.course-card` (+ hover lift) | card box | `h-100 p-4 bg-white border-start border-warning border-4 rounded-3 shadow-sm` |
| `.card-body`, `.card-params`, `.tag` | card internals | `list-unstyled`, `fw-bold`, `fs-5`, `text-body-secondary` |
| `.card-media`, `.media-*`, `.badge-*` | image area and badges | removed (not in the markup) |
| `.price` | bold price | `fw-bold` on the price cell |
| `.btn` (+ hover/active) | gold button | `btn btn-warning`, `btn btn-outline-dark btn-sm` |
| `.site-header`, `.logo`, `.nav-list`, `.site-footer`, `.footer-*` | header/footer | removed: header and footer belong to a teammate |
| `@media (max-width: 900px / 640px)` | phone layout | `col-*` breakpoints, `table-responsive`, `d-none d-md-table-cell`, `d-none d-sm-block`, `text-center text-md-start`, `flex-column flex-md-row` |
| `@media (prefers-reduced-motion)` | disable animations | removed (Bootstrap's own transitions already respect it) |

## courseDetail.css

| Removed rule(s) | What it did | Replaced by |
|---|---|---|
| `:root` variables, resets, `.container`, header/footer rules | same as above | same as above |
| `.breadcrumbs` | breadcrumb trail | removed (not in the markup) |
| `.detail-layout` (CSS grid `2fr / 1fr`) + 900px media query | two-column layout | `row g-4` + `col-12 col-lg-8` (article) / `col-12 col-lg-4` (aside) |
| `.course-content` (flex column + gap) | stacked sections | nested `row g-4` + `col-12 col-md-7` / `col-12 col-md-5` |
| `.course-header` (`border-left: 5px solid`) | gold left border on the title | `border-start border-warning border-5 ps-3` |
| `.course-banner`, `.rating`, `.tag` | banner, rating, label | removed (not in the markup) |
| `.metrics`, `.metric` (CSS grid) | key-fact tiles | `dl` with `d-flex flex-column flex-md-row gap-3`; tiles `flex-fill p-3 bg-white border rounded-3 shadow-sm` |
| `.stages`, `.stage` (CSS counter badges) | numbered steps | removed (not in the markup) |
| `.branches`, `.branch-card`, `.back-link`, `.kaspi-badge` | address cards, back link, badge | removed (not in the markup) |
| `.sidebar-sticky`, `.enroll-card` (`position: sticky`) | sticky sidebar card | Card component: `card text-bg-dark shadow sticky-lg-top` |
| `.enroll-form input/select` (+ focus ring) | form fields | `form-label`, `form-control`, `form-select`, `form-check`, `form-check-input` |
| radio buttons | plain radios | `btn-check` + `btn btn-outline-dark` toggle |
| `.btn`, `.btn-whatsapp` | buttons | `btn btn-warning btn-lg`, `btn btn-outline-secondary btn-lg`; full width on phones with `d-grid d-sm-flex gap-2` |
| `.form-success`, `.form-note` | form messages | removed (not in the markup) |
| `@media (max-width: 640px)` | phone layout | `col-12 col-md-6` on form fields, `d-grid d-sm-flex` on buttons |

## What is left

- `courses.css`: brand colour variables on `main`, brand colours for `.btn-warning` and `.table-dark`, and one override that makes `.list-group-numbered` respect `start="2"`.
- `courseDetail.css`: brand colour variables on `main`, brand colours for `.btn-warning` and `.btn-outline-dark`.
- No layout, spacing, grid, `!important` or inline styles.
