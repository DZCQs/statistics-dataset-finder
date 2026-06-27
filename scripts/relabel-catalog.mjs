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
    children: ["time series forecasting", "hierarchical forecasting"]
  }
];

const evidenceRules = [
  {
    label: "statistical learning",
    reason: "direct statistical-learning evidence in record text",
    test: (paper) =>
      hasTopic(paper, "risk prediction") &&
      /\b(machine learning|supervised learning|classification|random forest|support vector|neural network|deep learning|lasso|elastic net|gradient boosting|xgboost)\b/i.test(
        paperText(paper)
      )
  },
  {
    label: "forecasting competitions",
    reason: "forecasting competition or benchmark evidence in record text",
    test: (paper) =>
      hasTopic(paper, "time series forecasting") &&
      /\b(forecasting competition|forecast competition|competition|challenge|benchmark)\b/i.test(paperText(paper))
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
    ...(paper.properties || []),
    ...(paper.topics || [])
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
  for (const rule of parentRules) {
    if (rule.children.some((child) => hasTopic(paper, child))) {
      addTopic(paper, rule.label, `parent label for ${rule.children.join(", ")}`, changeLog);
    }
  }

  for (const rule of evidenceRules) {
    if (rule.test(paper)) {
      addTopic(paper, rule.label, rule.reason, changeLog);
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
