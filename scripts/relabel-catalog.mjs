import { readFile, writeFile } from "node:fs/promises";
import { LABEL_REGISTRY, LABEL_RULES } from "../labels.mjs";

const PAPERS_URL = new URL("../data/papers.json", import.meta.url);

const labelNames = new Set(LABEL_REGISTRY.map((label) => label.name));

const parentRules = [
  {
    label: "causal inference",
    children: [
      "treatment effect estimation",
      "propensity score methods",
      "quasi-experimental designs",
      "difference-in-differences",
      "regression discontinuity designs",
      "instrumental variables",
      "heterogeneous treatment effects",
      "randomized experiments",
      "survey experiments"
    ]
  },
  {
    label: "treatment effect estimation",
    children: ["difference-in-differences", "regression discontinuity designs", "instrumental variables"]
  },
  {
    label: "quasi-experimental designs",
    children: ["difference-in-differences", "regression discontinuity designs", "instrumental variables"]
  },
  {
    label: "survey methodology",
    children: [
      "complex survey design",
      "survey weighting",
      "nonresponse adjustment",
      "small area estimation",
      "survey experiments"
    ]
  },
  {
    label: "bayesian inference",
    children: ["bayesian hierarchical models", "mcmc diagnostics"]
  },
  {
    label: "randomized experiments",
    children: ["survey experiments"]
  },
  {
    label: "survival analysis",
    children: ["survival models"]
  },
  {
    label: "time series analysis",
    children: ["time series forecasting", "hierarchical forecasting", "time series classification"]
  },
  {
    label: "high-dimensional statistics",
    children: ["variable selection", "dimension reduction", "functional data analysis", "best subset selection", "graphical models"]
  },
  {
    label: "variable selection",
    children: ["best subset selection"]
  },
  {
    label: "longitudinal data analysis",
    children: ["panel data methods"]
  }
];

const evidenceRules = [
  {
    label: "graphical models",
    reason: "graphical-model, conditional-dependence, precision-matrix, or structure-learning evidence in record text",
    test: (paper) =>
      /\b(graphical model|graphical-model|graphical models|gaussian graphical model|markov random field|conditional independence|conditional dependence|precision matrix|structure learning|decomposable models|chordal graph|birth-death mcmc|g-wishart|undirected graph estimation)\b/i.test(
        paperText(paper)
      )
  },
  {
    label: "regression discontinuity designs",
    reason: "regression-discontinuity, RD-design, or cutoff-assignment evidence in record text",
    test: (paper) =>
      /\b(regression discontinuity|fuzzy regression discontinuity|sharp regression discontinuity|rd design|cutoff|electoral threshold)\b/i.test(
        paperText(paper)
      )
  },
  {
    label: "instrumental variables",
    reason: "instrumental-variable, weak-instrument, or two-stage-least-squares evidence in record text",
    test: (paper) =>
      /\b(instrumental variables|instrumental variable|weak instruments|two-stage least squares|2sls|local average treatment|abadie's kappa|partial linear instrumental)\b/i.test(
        paperText(paper)
      )
  },
  {
    label: "difference-in-differences",
    reason: "DiD, staggered-adoption, group-time ATT, or event-study evidence in record text",
    test: (paper) =>
      /\b(difference-in-differences|difference in differences|difference-in-difference|difference in difference|generalized difference-in-difference|diff-in-diff|staggered adoption|event study|group-time average treatment effects|parallel trends)\b/i.test(
        paperText(paper)
      )
  },
  {
    label: "quasi-experimental designs",
    reason: "synthetic-control evidence supports the broader quasi-experimental-design label while the specific synthetic-control label remains internal-candidate only",
    test: (paper) =>
      /\b(synthetic control|synthetic controls|synthetic-control)\b/i.test(
        paperText(paper)
      )
  },
  {
    label: "resampling methods",
    reason: "bootstrap, permutation, jackknife, or resampling-inference evidence in record text",
    test: (paper) =>
      /\b(bootstrap|resampling|permutation test|permutation|jackknife|bootstrap confidence interval|bootstrap confidence region)\b/i.test(
        paperText(paper)
      )
  },
  {
    label: "survey experiments",
    reason: "survey-experiment, vignette-experiment, randomized-survey, or information-treatment evidence in record text",
    test: (paper) =>
      /\b(survey experiment|survey experiments|vignette experiment|information treatment|survey-embedded experiment|randomized survey|experimental survey)\b/i.test(
        paperText(paper)
      )
  },
  {
    label: "functional data analysis",
    reason: "functional-data, functional-regression, or functional-PCA evidence in record text",
    test: (paper) =>
      /\b(functional data analysis|functional regression|function-on-function|scalar-on-function|functional principal components|functional data|functional outlier|functional covariate|functional observations)\b/i.test(
        paperText(paper)
      )
  },
  {
    label: "dimension reduction",
    reason: "dimension-reduction, manifold-learning, embedding, or factor-model evidence in record text",
    test: (paper) =>
      /\b(dimension reduction|dimensionality reduction|intrinsic dimension|manifold learning|low-dimensional|factor model|principal component|pca|t-sne|umap)\b/i.test(
        paperText(paper)
      )
  },
  {
    label: "spatial statistics",
    reason: "spatial, geostatistical, point-process, or spatial-factor evidence in record text",
    test: (paper) =>
      /\b(spatial statistics|geostatistics|point process|spatial random effects|spatial factorization|spatial dependence|spatialized|gridded|kriging|local indicators of spatial association|spatio-temporal point process|spatiotemporal point process|spatially explicit)\b/i.test(
        paperText(paper)
      )
  },
  {
    label: "time series classification",
    reason: "time-series classification archive or benchmark evidence in record text",
    test: (paper) =>
      /\b(time series classification|time-series classification|multivariate time series classification|univariate time series classification|classification archive)\b/i.test(
        paperText(paper)
      )
  },
  {
    label: "time series analysis",
    reason: "time-series, interrupted-time-series, temporal-dependence, or autocorrelation evidence in record text",
    test: (paper) =>
      /\b(time series analysis|time series|interrupted time series|controlled interrupted time series|temporal dependence|autocorrelation)\b/i.test(
        paperText(paper)
      )
  },
  {
    label: "variable selection",
    reason: "variable-selection, sparse predictor-selection, or PC-simple evidence in record text",
    test: (paper) =>
      /\b(variable selection|high-dimensional variable selection|feature selection|predictor selection|biomarker selection|subset selection|variable and covariance selection|sparse regression|adaptive lasso|elastic net|spike-and-slab|pc-simple|partial faithfulness)\b/i.test(
        paperText(paper)
      )
  },
  {
    label: "best subset selection",
    reason: "best-subset-selection or L0-regularized sparse-model evidence in record text",
    test: (paper) =>
      /\b(best subset selection|best-subset selection|best subsets|l0 regularization|l0-regularized|subset-size constrained|l0 constrained|l0learn|bess|abess)\b/i.test(
        paperText(paper)
      )
  },
  {
    label: "panel data methods",
    reason: "panel-data, fixed-effects, or repeated unit-level policy-panel evidence in record text",
    test: (paper) =>
      /\b(panel data|panel-data|fixed effects|fixed-effects|unit fixed effects|two-way fixed effects|policy panel|country-year|state-year|district-year|household panel)\b/i.test(
        paperText(paper)
      )
  },
  {
    label: "longitudinal data analysis",
    reason: "longitudinal, repeated-measures, wave, or panel-data evidence in record text",
    test: (paper) =>
      /\b(longitudinal|repeated measures|repeated-measures|cohort|followed over time|waves|panel data|panel-data|country-year|state-year|district-year)\b/i.test(
        paperText(paper)
      )
  },
  {
    label: "multilevel modeling",
    reason: "multilevel, nested, hierarchical, random-effects, or mixed-effects evidence in record text",
    test: (paper) =>
      /\b(multilevel|multi-level|nested units|nested data|nested structure|random effects|random-effects|mixed effects|mixed-effects|hierarchical model|hierarchical models|cross-national survey)\b/i.test(
        paperText(paper)
      )
  },
  {
    label: "high-dimensional statistics",
    reason: "high-dimensional, sparse, regularized, or genomic-feature evidence in record text",
    test: (paper) =>
      !/\bsparse demand\b/i.test(paperText(paper)) &&
      /\b(high-dimensional|high dimensional|p\s*>>\s*n|p\s*>\s*n|sparse|sparsity|lasso|elastic net|regulari[sz]ed|regulari[sz]ation|penali[sz]ed|variable selection|genomics|transcriptomic|gene expression|microarray)\b/i.test(
        paperText(paper)
      )
  },
  {
    label: "forecasting competitions",
    reason: "forecasting competition or benchmark evidence in record text",
    test: (paper) =>
      hasTopic(paper, "time series forecasting") &&
      /\b(forecasting competition|forecast competition|competition|challenge)\b/i.test(paperText(paper))
  }
];

function paperText(paper) {
  return [
    paper.title,
    paper.authors,
    paper.dataset,
    paper.bestFor,
    paper.note,
    paper.access,
    ...(paper.formats || []),
    ...(paper.properties || [])
  ].join(" ");
}

function hasTopic(paper, label) {
  return (paper.topics || []).includes(label);
}

function addTopic(paper, label, reason, changeLog) {
  if (!labelNames.has(label)) return false;
  paper.topics ||= [];
  if (paper.topics.includes(label)) return false;
  if (paper.topics.length >= LABEL_RULES.maxLabelsPerPaper) return false;

  paper.topics.push(label);
  changeLog.push({
    id: paper.id,
    title: paper.title,
    label,
    reason
  });
  return true;
}

const papers = JSON.parse(await readFile(PAPERS_URL, "utf8"));
const changeLog = [];

for (const paper of papers) {
  for (const rule of evidenceRules) {
    if (rule.test(paper)) {
      addTopic(paper, rule.label, rule.reason, changeLog);
    }
  }

  let changed = true;
  while (changed) {
    changed = false;
    for (const rule of parentRules) {
      if (rule.children.some((child) => hasTopic(paper, child))) {
        changed =
          addTopic(paper, rule.label, `parent label for ${rule.children.join(", ")}`, changeLog) ||
          changed;
      }
    }
  }

  paper.topics = (paper.topics || []).filter((topic, index, topics) => {
    return labelNames.has(topic) && topics.indexOf(topic) === index;
  });
}

await writeFile(PAPERS_URL, `${JSON.stringify(papers, null, 2)}\n`);

const addedByLabel = changeLog.reduce((counts, change) => {
  counts[change.label] = (counts[change.label] || 0) + 1;
  return counts;
}, {});

console.log(
  JSON.stringify(
    {
      papers: papers.length,
      labelsAdded: changeLog.length,
      addedByLabel,
      skippedBecauseMaxLabels: papers.filter((paper) => (paper.topics || []).length > LABEL_RULES.maxLabelsPerPaper).length,
      sampleChanges: changeLog.slice(0, 20)
    },
    null,
    2
  )
);
