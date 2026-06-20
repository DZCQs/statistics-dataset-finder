# Maintenance Model

The intended long-term workflow is:

1. The public website is hosted from a central repository.
2. The paper database lives in `data/papers.json` or a later hosted database.
3. New papers are discovered automatically from scholarly sources.
4. Candidate papers are screened for clear dataset access.
5. Existing labels are tried first.
6. New labels are proposed only when several papers support the same statistical
   research concept.
7. Approved database changes trigger an automatic website update.

The project owner should not need to edit code or manually collect paper lists.
The owner can ask for updates in ordinary language, such as:

- "Add recent papers related to missing data with public datasets."
- "Search arXiv and Semantic Scholar for new small area estimation datasets."
- "Update the site this week with new survey methodology papers."
- "Change the website style to look more formal."

The maintainer or automation system then handles discovery, screening, labeling,
database updates, and redeployment.

## Human Review Boundary

Fully automatic publishing is possible, but not recommended for the current
stage because dataset links and labels need quality control. A safer default is:

- automatic discovery,
- automatic label suggestions,
- automatic duplicate checks,
- curator approval,
- automatic publication.

Public suggestions are treated the same way: they enter a private review queue,
not the live catalog. They should never automatically edit GitHub, the database,
or the published website.

## Current Expansion Pipeline

The repository now includes two discovery routes:

- `scripts/discover-papers.mjs` searches statistics-oriented scholarly sources
  and writes candidate records with dataset-link evidence.
- `scripts/expand-openalex.mjs` starts from known public datasets, searches
  OpenAlex for papers that explicitly use those datasets, and writes
  `data/openalex-candidates.json`.

For launch-scale growth, prefer the dataset-first OpenAlex route because the
dataset link is known before the paper is considered. Auto-discovered records
are marked with `auto-discovered` and `needs-review`; this makes it possible to
publish a large searchable catalog while still separating machine-discovered
records from fully curated records.
