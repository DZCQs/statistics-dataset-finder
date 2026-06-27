# Dataset Paper Finder

A static prototype for a statistics-focused, label-based research dataset search
engine.

The site indexes papers that have clear dataset access paths, then lets graduate
students search by statistical method labels, data format, access type, and
dataset properties.

## Run locally

```bash
python3 -m http.server 4173
```

Then open:

```text
http://localhost:4173/
```

## Current Features

- Search across paper titles, datasets, authors, notes, formats, and topic labels.
- Search combinations of labels with comma syntax, such as
  `treatment effect estimation, propensity score methods`.
- Browse labels as a hierarchy of high-level, mid-level, and specific research
  topics. The hierarchy means containment for search and analytics, not topic
  importance.
- Filter by topic, access type, dataset property, and data format.
- Sort by relevance, year, or citation count.
- Open a detail panel with dataset links, paper links, access notes, and use-case fit.
- Save papers locally in the browser.
- Accept paper suggestions as private review candidates only; public suggestions
  never update the catalog automatically.

## Label Assessment

Run the catalog relabeler and automatic label assessor before and after adding
papers:

```bash
node scripts/relabel-catalog.mjs
node scripts/assess-labels.mjs
```

The relabeler applies the controlled hierarchy across the whole catalog, not
only the newest papers. The assessor then checks whether papers use known labels
from `labels.mjs`, whether assigned labels are supported by the paper metadata,
whether labels are reused, and whether any paper has too few or too many labels.
Together they are intended to prevent label drift when the catalog grows.

## Automated Expansion

The current catalog can be expanded from dataset-first scholarly discovery:

```bash
node scripts/expand-openalex.mjs --target=450 --pages=4
```

This writes `data/openalex-candidates.json`. The script starts from known public
statistics datasets, finds papers through OpenAlex, reuses only the controlled
labels in `labels.mjs`, and marks generated records as `auto-discovered` and
`needs-review`. Candidate records should be audited before being treated as
fully curated.

## Next Backend Step

The current prototype uses `data/papers.json` as its paper database. A later
backend can move the same fields into a hosted database table:

- `title`
- `authors`
- `year`
- `paper_url`
- `dataset_name`
- `dataset_url`
- `access_type`
- `formats`
- `properties`
- `topics`
- `best_for`
- `catalog_note`

The prototype uses a controlled, layered vocabulary of statistics labels.
Labels are not free-form tags. When adding a paper, first check whether existing
labels can summarize its key statistical use. Broad labels such as `causal
inference`, `survey methodology`, or `bayesian inference` are allowed only when
they support useful topic-level analytics and coexist with more specific labels
such as `propensity score methods`, `multiple imputation`, or `small area
estimation`. Add a new label only if it passes the admission rules in
[LABELING_GUIDE.md](LABELING_GUIDE.md).

That structure can support an admin review flow where contributors submit papers,
maintainers verify dataset access, and approved records become searchable.
