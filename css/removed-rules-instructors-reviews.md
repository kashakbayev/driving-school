# Removed CSS — instructors.html and reviews.html

The Assignment 2 rules for `<main>` in `css/instructors.css` (44 rules) and `css/reviews.css` (57 rules) were deleted, including the ones inside the `@media` queries. Bootstrap classes in the HTML and the shared `css/index.css` now do this work.

The `header`, `footer`, `html`, `body` and `*` rules were **not** touched. A teammate owns the header and footer.

Each file now adds only one small rule for `<main>`: `.instructor-card` (orange top edge) and `.review-quote` (orange left bar). Bootstrap's border colours have no brand orange.

## instructors.css

| Removed rule(s) | What it did | Replaced by |
|---|---|---|
| `main` (+ padding in 700px / 480px queries) | page width and padding | `container py-4 py-lg-5` |
| `main > h1`, `main > h1 + p`, `main > h1 + p strong` (+ font sizes in media queries) | title block | `.hero-panel` (shared index.css) + `rounded-5 shadow p-4 p-lg-5`, `display-4 fw-bold`, `lead text-body-secondary`, `text-center text-lg-start` |
| `main mark` | highlight | `bg-warning-subtle rounded-2 px-1` |
| `main article` (CSS grid `230px 1fr`, padding, shadow) + `:hover`, and its 1000px / 700px / 480px versions | hand-built two-column instructor card | `row g-4` + `col-12 col-lg-6`; Card component `card h-100 shadow-sm` |
| `main article h2` | name heading | `card-header h3 fw-bold bg-white border-0` |
| `main article figure`, `main article img` (fixed heights per breakpoint), `main article figcaption` | photo | `ratio ratio-4x3` + `object-fit-cover`; caption `small text-body-secondary px-4 pt-2` |
| `main article > p`, `main article abbr` | description | `card-text` (Bootstrap Reboot styles `abbr[title]`) |
| `main article > ul`, `> li`, `> li > ul`, `li` (flex, badges) and the 480px column version | category/specialty badges | nested `row g-3 list-unstyled` + `col-12 col-sm-6`; `list-unstyled d-flex flex-wrap gap-2`; `badge rounded-pill text-bg-light border text-wrap` |
| `main article dl`, `dt`, `dd` (grid, and 1-column version at 700px) | office hours / contact | horizontal description list: `row g-0` + `col-12 col-sm-4` / `col-12 col-sm-8`, `border-top pt-3` |
| `main article dd a` + `:hover`, `:focus-visible` | e-mail link | `btn btn-outline-primary btn-sm` |
| `main hr` | divider | `<hr class="col-12 d-lg-none">`: only shown when the cards are stacked |
| `main > div`, `main > div p`, `main > div small` | availability note | `alert alert-light border shadow-sm`, `mb-0` |

## reviews.css

| Removed rule(s) | What it did | Replaced by |
|---|---|---|
| `main` (+ padding in media queries) | page width and padding | `container py-4 py-lg-5` |
| `main > h1`, `main > h1 + p` (+ sizes in media queries) | title block | `.hero-panel` + `rounded-5 shadow p-4 p-lg-5`, `display-4 fw-bold`, `lead`, `text-center text-lg-start` |
| `main a`, `main a:hover` | link colour | `.link-arrow` (shared index.css) |
| `main aside`, `main aside h2`, `main aside p` | rating summary box | `col-12 col-lg-4` + `bg-brand text-white rounded-4 shadow-sm p-4`, heading `eyebrow-light` |
| `main mark` | highlight | `bg-warning text-dark rounded-2 px-2 fw-bold` |
| `main blockquote`, `::before`, `> p`, `blockquote footer` | quote with quotation mark | `blockquote ps-3` + `.review-quote` (orange bar), footer `small text-body-secondary` |
| `main > img` (+ 700px version) | photo | `img-fluid rounded-4 shadow-sm` in a nested `row g-3` (`col-12 col-md-7` / `col-12 col-md-5`) |
| `main > h2` (+ 480px size) | section headings | `display-6 fw-bold mb-3` |
| `main table`, `caption`, `th`, `td`, `thead th`, `tbody th/td`, `tr:last-child`, `tr:hover` (+ 700px versions) | rating table | Tables component: `table table-hover align-middle caption-top`, `table-dark`, `table-responsive`, `text-end fw-bold` |
| `main > ol`, `main > ol li` | top instructors list | `list-group list-group-numbered shadow-sm`, `list-group-item` |
| `main hr` | divider | `my-5` |
| `main form`, `fieldset`, `legend`, `form p`, `form label` | form layout | `bg-white rounded-5 shadow-sm p-4 p-lg-5`, `row g-3` + `col-12 col-md-6`, `form-label`, `h4 fw-bold` |
| `main form input/select/textarea` (+ `:focus`) | text fields | `form-control`, `form-select` (Bootstrap focus ring) |
| `main form fieldset fieldset` (+ legend, label), radio/checkbox rules | radio and checkbox | `form-check form-check-inline`, `form-check-input` |
| `main button`, `[type=submit]`, `[type=reset]` (+ hover, active, focus, 480px version) | buttons | `btn btn-primary btn-lg`, `btn btn-outline-secondary btn-lg`; full width on phones with `d-grid d-sm-flex gap-2` |
| `main > p:last-child` | closing note | `text-center text-body-secondary mt-4`, `fw-bold` |
