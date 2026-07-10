# Statistics Dataset Paper Finder

A public, statistics-focused catalog for finding research papers with clearly
accessible dataset resources.

Website: https://dzcqs.github.io/statistics-dataset-finder/

## What This Project Does

Graduate students and researchers often need more than a dataset name. They need
papers whose datasets fit a specific statistical research purpose, such as
causal inference, missing data, survey weighting, survival analysis, functional
data analysis, time series forecasting, or high-dimensional variable selection.

This project catalogs papers that point to usable dataset resources, then
organizes them with controlled statistics research labels. The goal is to help
users find papers, datasets, replication resources, software examples, and
related literature for a topic they are studying.

## What You Can Search

The website supports:

- keyword search across paper titles, dataset descriptions, authors, and notes;
- label search for statistics research topics;
- multi-label search, such as `causal inference, difference-in-differences`;
- browsing through hierarchical labels;
- filtering by access type, dataset properties, and data format;
- sorting by relevance, year, or citation count;
- viewing paper links, dataset links, and short notes about why a record may be useful.

## What Counts As an Included Paper

A paper is eligible for the catalog only when it provides a clear dataset source
in a verifiable form. Examples include:

- a dataset URL;
- a GitHub, CRAN, Zenodo, OSF, Figshare, Dataverse, OpenICPSR, or journal
  supplement link;
- a replication archive;
- a software package with documented example datasets;
- a public dataset source described clearly enough for users to find it.

The catalog may include older papers when their datasets remain accessible and
useful. It may also include method papers, software papers, benchmark papers, or
applied papers when the dataset resource is explicit.

## Labeling Principles

Labels are controlled statistics research topics, not free-form tags.

The label system is designed so that searching a label should return multiple
papers whose datasets are useful for that research topic. Broad labels can exist
when they help topic-level browsing, but they should not replace more specific
labels.

Examples of current label families include:

- causal inference;
- difference-in-differences;
- survey methodology;
- missing data;
- survival analysis;
- high-dimensional statistics;
- variable selection;
- functional data analysis;
- time series analysis;
- Bayesian inference.

Generic labels such as "model comparison", "model validation", "machine
learning", "deep learning", or "statistical learning" are intentionally avoided
because they are too broad for this catalog.

## Public Suggestions

Users may suggest papers or dataset links through the website. Suggestions are
treated as review candidates only. They do not automatically change the public
catalog, the website, or this repository.

Before a suggested record is added, it should be checked for:

- a real paper or scholarly resource;
- a clear dataset access path;
- duplicate status;
- appropriate statistics research labels.

## Current Status

The project is an actively growing public catalog. Records marked as
auto-discovered or needing review should be treated as useful leads, not as a
claim that every metadata detail has been manually audited.

The long-term direction is to keep expanding the database, improve label
coverage, and add better analytics for each research topic so users can see not
only individual papers, but also how datasets are used across a field.

