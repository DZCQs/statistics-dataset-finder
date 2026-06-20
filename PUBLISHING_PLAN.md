# Publishing Plan

This project is now prepared for public hosting as a static website with a
separate paper database file.

## Current Public-Ready Structure

- `index.html` is the public page.
- `styles.css` controls the design.
- `app.js` loads the catalog and powers search.
- `data/papers.json` is the paper database.
- `labels.mjs` is the controlled label registry.
- `scripts/assess-labels.mjs` audits labels before publication.
- `scripts/add-paper.mjs` supports future curator-assisted additions.
- `netlify.toml` prepares the project for Netlify-style static hosting.

## Recommended First Deployment

Use a static hosting service such as Netlify, Vercel, Cloudflare Pages, or
GitHub Pages.

For this project, Netlify is a good first option because the current suggestion
form can become a real public submission form without building a custom backend.

## Update Workflow

For periodic updates:

1. Candidate papers are discovered from scholarly sources such as arXiv,
   Semantic Scholar, Crossref, journal pages, dataset repositories, and curated
   statistics searches.
2. The label registry is checked first.
3. Existing labels are assigned whenever they fit.
4. A new label is proposed only if multiple papers support the same mid-level
   statistical concept.
5. The catalog database is updated.
6. The public site is redeployed.

The website should not accept labels directly from public users. Public users can
suggest papers, but labels should remain curator-reviewed.

## Submission Safety

The public suggestion form is review-only. It should collect candidate paper
links and dataset links, but it must never write directly to the public catalog
or GitHub repository. Suggested labels or research areas from users are treated
as untrusted hints. Curators verify the paper, dataset access, and labels before
publication.

## Automated Discovery

The project includes a discovery pipeline that can search paper sources, screen
for dataset-availability signals, and score candidate papers against the label
registry.

Discovery should be treated as an assistant, not as blind publication. It can
find and label candidates automatically, but the final public database should
only include records that have a clear paper link, a dataset or dataset-access
link, and labels supported by the paper context.

For public operation, this discovery step can be scheduled weekly or daily in a
repository automation workflow after the site is connected to GitHub and a host.

## What Is Still Needed To Publish

The final publishing step requires access to a hosting account or repository.
Without that account connection, the project can be prepared but cannot be placed
on a public URL from this local workspace alone.
