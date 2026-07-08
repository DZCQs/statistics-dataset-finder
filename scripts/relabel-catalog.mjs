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
      "heterogeneous treatment effects",
      "randomized experiments"
    ]
  },
  {
    label: "survey methodology",
    children: [
      "complex survey design",
      "survey weighting",
      "nonresponse adjustment",
      "small area estimation"
    ]
  },
  {
    label: "bayesian inference",
    children: ["bayesian hierarchical models", "mcmc diagnostics"]
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
    children: ["variable selection", "dimension reduction", "functional data analysis"]
  }
];

const evidenceRules = [
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
      /\b(spatial statistics|geostatistics|point process|spatial random effects|spatial factorization|spatial dependence|local indicators of spatial association|spatio-temporal point process|spatiotemporal point process|spatially explicit)\b/i.test(
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
    label: "variable selection",
    reason: "variable-selection, sparse predictor-selection, or PC-simple evidence in record text",
    test: (paper) =>
      /\b(variable selection|high-dimensional variable selection|feature selection|predictor selection|biomarker selection|subset selection|variable and covariance selection|sparse regression|adaptive lasso|elastic net|spike-and-slab|pc-simple|partial faithfulness)\b/i.test(
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

  for (const rule of parentRules) {
    if (rule.children.some((child) => hasTopic(paper, child))) {
      addTopic(paper, rule.label, `parent label for ${rule.children.join(", ")}`, changeLog);
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
