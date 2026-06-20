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
- Filter by topic, access type, dataset property, and data format.
- Sort by relevance, year, or citation count.
- Open a detail panel with dataset links, paper links, access notes, and use-case fit.
- Save papers locally in the browser.
- Accept paper suggestions as private review candidates only; public suggestions
  never update the catalog automatically.

## Label Assessment

Run the automatic label assessor before and after adding papers:

```bash
node scripts/assess-labels.mjs
```

The assessor checks whether papers use known labels from `labels.mjs`, whether
assigned labels are supported by the paper metadata, whether labels are reused,
and whether any paper has too few or too many labels. It is intended to prevent
label drift when the catalog grows.

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

The prototype uses a controlled vocabulary of mid-level statistics labels.
Labels are not free-form tags. When adding a paper, first check whether existing
labels can summarize its key statistical use. Add a new label only if it passes
the admission rules in [LABELING_GUIDE.md](LABELING_GUIDE.md).

The intended label level is specific enough for graduate research search
(`propensity score methods`, `multiple imputation`, `small area estimation`) but
not so narrow that each label only returns one paper, and not so broad that it
becomes a whole field such as `causal inference` or `bayesian inference`.

That structure can support an admin review flow where contributors submit papers,
maintainers verify dataset access, and approved records become searchable.
