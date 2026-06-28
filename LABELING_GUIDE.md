# Labeling Guide

This project uses labels as a controlled vocabulary, not as free-form tags.
The goal is that a graduate student can search one label and find multiple
papers whose datasets are genuinely useful for that statistical research topic.

## Target Level

Use a layered statistics vocabulary. The catalog may contain broad, mid-level,
and specific labels when each label is useful for a real search task and has
enough papers to support meaningful browsing.

Broad labels are allowed when the catalog is large enough that users may want
topic-level dataset analytics. Examples include:

- `bayesian inference`
- `causal inference`
- `survey methodology`
- `statistical learning`

Broad labels should not replace more specific labels. A paper may carry a broad
parent label plus mid-level or specific child labels when both levels help
different users search the catalog. For example, a paper may reasonably carry
`causal inference`, `propensity score methods`, and `treatment effect
estimation` if all are supported by the paper and dataset.

Too generic for this search engine:

- `model validation`
- `model comparison`
- `benchmarking`
- `forecast evaluation`

These are real and often important concepts, but they are too general unless
the catalog has a dedicated group of papers where that is the primary dataset
use.

Too contextual:

- `retail demand`
- `health outcomes`
- `tabular data`
- `clinical prediction`

These describe domains or data shapes, not the statistical research concept.

Good label level:

- `bayesian inference`
- `bayesian hierarchical models`
- `causal inference`
- `propensity score methods`
- `quasi-experimental designs`
- `treatment effect estimation`
- `heterogeneous treatment effects`
- `randomized experiments`
- `multiple imputation`
- `nonignorable missing data`
- `nonresponse adjustment`
- `complex survey design`
- `survey weighting`
- `small area estimation`
- `longitudinal data analysis`
- `panel data methods`
- `multilevel modeling`
- `survival analysis`
- `survival models`
- `risk prediction`
- `statistical learning`
- `time series analysis`
- `time series forecasting`
- `hierarchical forecasting`
- `forecasting competitions`
- `probabilistic forecasting`
- `mcmc diagnostics`

## Current Label Hierarchy

Hierarchy means containment for search and analytics, not importance or
popularity. A mid-level label may have more papers than a high-level label if
the catalog currently has more data resources for that method.

High-level topic families:

- `causal inference`
  - `treatment effect estimation`
    - `propensity score methods`
    - `heterogeneous treatment effects`
  - `quasi-experimental designs`
  - `randomized experiments`
- `survey methodology`
  - `complex survey design`
    - `survey weighting`
  - `nonresponse adjustment`
  - `small area estimation`
- `survival analysis`
  - `survival models`
  - `risk prediction`
- `statistical learning`
  - `risk prediction`
- `time series analysis`
  - `time series forecasting`
    - `hierarchical forecasting`
    - `forecasting competitions`
- `bayesian inference`
  - `bayesian hierarchical models`
  - `mcmc diagnostics`

Mid-level topic families without a current high-level parent:

- `missing data`
  - `multiple imputation`
  - `nonignorable missing data`
  - `nonresponse adjustment`
- `longitudinal data analysis`
  - `panel data methods`
- `multilevel modeling`
  - `bayesian hierarchical models`

Specific labels are also allowed when they are recognized statistical research
topics and are not one-paper tags. Examples that may be admitted after evidence
checks include:

- `difference-in-differences`
- `regression discontinuity designs`
- `instrumental variables`
- `synthetic control`
- `competing risks`
- `joint models`
- `recurrent event analysis`
- `measurement error models`
- `functional data analysis`
- `spatial statistics`
- `spatio-temporal models`
- `high-dimensional statistics`
- `variable selection`
- `regularization methods`
- `quantile regression`
- `robust statistics`
- `graphical models`
- `latent variable models`
- `item response theory`
- `mixture models`
- `clustering`
- `dimension reduction`
- `conformal prediction`
- `uncertainty quantification`

## New Paper Workflow

When adding a paper, use this workflow in order.

0. Confirm the inclusion rule.
   A paper is eligible for the catalog if it provides a clear dataset source in
   any verifiable form. Label availability is not an inclusion gate.

1. Identify the paper's main statistical use.
   Ask what method, design, missing-data problem, sampling issue, modeling
   framework, or forecasting problem a graduate student would search for.

2. Check existing labels first.
   Use an existing label if it reasonably summarizes the paper's primary
   statistical purpose. Different wording in the paper is not enough reason to
   create a new label.

3. Assign 3-6 labels when possible.
   Labels should explain why the dataset is useful for statistics research.
   Prefer a useful hierarchy: broad parent, mid-level method/design, and
   specific research topic when all are supported. Do not list every method that
   could theoretically be applied.
   If fewer than three official labels fit, keep the paper eligible and mark it
   for label review instead of rejecting it.

4. Avoid redundant labels on the same paper.
   Do not combine synonyms or minor wording variants. Parent-child labels are
   allowed only when both search levels are useful and evidence-supported.

5. Add a new label only after the admission test.

6. Re-run the catalog relabeler after adding papers.
   Incremental additions must be checked against the whole label system, not
   only against the newly added papers. The relabeler adds supported parent
   labels, applies strict evidence rules for selected labels, and keeps the
   controlled vocabulary from drifting into one-paper or redundant tags.

```bash
node scripts/relabel-catalog.mjs
node scripts/assess-labels.mjs
```

## New Label Admission Test

A new label is allowed only if it passes all five checks:

- Recognized: it appears as a standard concept in graduate statistics,
  biostatistics, econometrics, survey methodology, statistical learning, or
  forecasting.
- Searchable: a graduate student might reasonably type it as a research topic.
- Reusable: it can label at least three papers or datasets now or soon.
- Distinct: it is not a synonym, parent, child, or minor wording variant of an
  existing label.
- Dataset-relevant: it explains why the paper's dataset is useful, not merely
  the application domain.
- Hierarchy-aware: if it is broad, it supports topic-level analytics; if it is
  specific, it is still reusable across several papers.

If any check fails, do not create the label. Use the closest existing label or
wait until more papers justify the new label.

## Candidate Labels

Candidate labels are tracked in `LABEL_CANDIDATES` inside `labels.mjs`. They are
not shown as public filters yet, but the daily update and label assessor should
review them.

A candidate label should record:

- proposed `high`, `mid`, or `low` level,
- proposed parent labels when applicable,
- supporting paper IDs,
- evidence terms,
- the specific conditions required for admission.

When a candidate reaches the reuse threshold and passes the admission test, move
it into `LABEL_REGISTRY`, assign `level` and `parents`, then rerun the whole
catalog relabeler and assessor. If it remains below threshold, keep using the
closest existing parent label in live paper records.
