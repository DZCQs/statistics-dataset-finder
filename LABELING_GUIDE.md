# Labeling Guide

This project uses labels as a controlled vocabulary, not as free-form tags.
The goal is that a graduate student can search one label and find multiple
papers whose datasets are genuinely useful for that statistical research topic.

## Target Level

Use mid-level statistics concepts.

Too broad for this search engine:

- `bayesian inference`
- `causal inference`
- `survey methodology`
- `statistical learning`

These are real statistical fields, but they are too large to work as useful
search labels.

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
- `survival models`
- `risk prediction`
- `time series forecasting`
- `hierarchical forecasting`
- `probabilistic forecasting`
- `mcmc diagnostics`
- `bayesian hierarchical models`

## New Paper Workflow

When adding a paper, use this workflow in order.

1. Identify the paper's main statistical use.
   Ask what method, design, missing-data problem, sampling issue, modeling
   framework, or forecasting problem a graduate student would search for.

2. Check existing labels first.
   Use an existing label if it reasonably summarizes the paper's primary
   statistical purpose. Different wording in the paper is not enough reason to
   create a new label.

3. Assign 3-4 labels when possible.
   Labels should explain why the dataset is useful for statistics research.
   Do not list every method that could theoretically be applied.

4. Avoid redundant labels on the same paper.
   Do not combine a broad parent and narrow child. For example, prefer
   `propensity score methods` over `causal inference` for a matching dataset.

5. Add a new label only after the admission test.

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

If any check fails, do not create the label. Use the closest existing label or
wait until more papers justify the new label.
