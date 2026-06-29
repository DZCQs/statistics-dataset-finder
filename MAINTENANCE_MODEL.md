# Maintenance Model

The intended long-term workflow is:

1. The public website is hosted from a central repository.
2. The paper database lives in `data/papers.json` or a later hosted database.
3. New papers are discovered automatically from scholarly sources.
4. Candidate papers are screened for clear dataset access.
5. Papers with explicit dataset sources are eligible for inclusion; labels are
   organization metadata, not an inclusion gate.
6. Existing labels are tried first.
7. New labels are proposed only when several papers support the same statistical
   research concept.
8. The whole catalog is relabeled and assessed after accepted additions, so new
   records do not slowly damage the controlled vocabulary.
9. Approved database changes trigger an automatic website update.

## Inclusion Rule

The inclusion rule for `data/papers.json` has one hard standard:

- include a paper when it provides a clear dataset source in any verifiable
  form, such as a dataset URL, repository, replication archive, supplement,
  journal data page, package data source, or documented public dataset link.

Do not reject a paper merely because it does not advertise data access in the
abstract, does not match enough existing labels, supports a candidate label, or
requires later label review. Those are labeling and curation issues after the
dataset-source requirement is met.

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

The daily discovery script should start from a substantial raw candidate pool,
not a tiny pre-filtered list. A normal daily run should use multiple source
families and should usually produce at least 100 raw candidates when the public
APIs are reachable. If the raw candidate count is much smaller, treat that as a
discovery failure: broaden the query/source mix before concluding that too few
papers exist. The final accepted count may be small because dataset-source
verification is strict, but the initial pool should not be small.

## Discovery Scope

Daily updates should cover the broader statistics ecosystem, not only public
health, biomedical, or survey datasets. The discovery process should actively
rotate across source families:

- statistics preprints: arXiv `stat.ME`, `stat.AP`, `stat.CO`, `stat.ML`,
  plus data/code evidence;
- broad scholarly indexes: OpenAlex and Semantic Scholar;
- reproducibility and data repositories: Dataverse, Zenodo, Figshare, OSF, ICPSR,
  OpenICPSR, journal supplementary-data pages;
- benchmark sources: OpenML, UCI Machine Learning Repository, forecasting
  competitions, simulation benchmark papers, causal benchmark datasets;
- statistical software ecosystems: CRAN task views, R/Python package papers,
  package vignettes linked to real datasets or benchmark data;
- journal families in statistics, biostatistics, econometrics, survey
  methodology, machine learning, forecasting, spatial statistics, and Bayesian
  computation.

Older papers may be added when their datasets remain accessible and useful.
Recency alone is not a quality criterion.

## Label Expansion Direction

The label system should become hierarchical over time. Broad labels such as
`causal inference` or `bayesian inference` are allowed when they support
topic-level analytics over many papers. They should coexist with more specific
labels such as `propensity score methods`, `regression discontinuity designs`,
`bayesian hierarchical models`, or `mcmc diagnostics`.

New labels should be added through evidence: a candidate label should have
multiple supporting papers or a clear discovery path that will produce them.
Avoid one-paper labels, application-domain labels, and generic evaluation terms.

Candidate labels are persistent system state, not conversational notes. Track
them in `LABEL_CANDIDATES` in `labels.mjs` with proposed level, proposed
parents, supporting paper IDs, and admission conditions. Daily updates should
check whether any candidate label has gained enough high-confidence records to
be promoted into `LABEL_REGISTRY`.

Daily updates should run:

```bash
node scripts/relabel-catalog.mjs
node scripts/assess-labels.mjs
```

This makes each update a whole-system label-health check, not just an
incremental append. If a newly discovered paper would require a vague,
redundant, or one-paper label, reject the paper or use the closest existing
statistics label until enough evidence supports a new one.

Daily discovery should rotate sources rather than blindly exhaust every source
every day. If one source mostly returns duplicates or weak candidates, record
that in the report and move to a different source family on the next run.

Discovery and admission are separate stages:

- Discovery should be broad. A paper does not need to advertise data access in
  the abstract to become a review candidate, and it does not need to match three
  existing official labels.
- Review should be strict. A paper should enter `data/papers.json` only after
  dataset access is clear and duplicates are checked. Label or candidate-label
  evidence should be reviewed, but weak label coverage is not an inclusion gate.
- Candidate-label overlap matters. If a paper supports a `LABEL_CANDIDATES`
  entry, keep it in the review pool even when it does not yet fit three official
  labels.

Daily reports should distinguish raw candidates, review candidates, screened
high-confidence candidates, and records actually added.
