import { mkdir, writeFile } from "node:fs/promises";
import { LABEL_CANDIDATES, LABEL_REGISTRY, LABEL_RULES } from "../labels.mjs";

const DEFAULT_LIMIT = 25;
const REQUEST_DELAY_MS = 3500;
const RETRY_DELAY_MS = 20000;
const DATASET_SIGNALS = [
  "dataset",
  "data set",
  "data are available",
  "publicly available",
  "available at",
  "github",
  "zenodo",
  "figshare",
  "osf",
  "dataverse",
  "physionet",
  "public-use",
  "benchmark",
  "challenge data",
  "replication data",
  "supplementary data"
];

const DISCOVERY_QUERIES = [
  "multiple imputation missing data dataset statistics",
  "nonignorable missing data dataset statistics",
  "complex survey design public use microdata statistics",
  "survey weighting dataset statistics",
  "small area estimation survey data statistics",
  "propensity score methods dataset causal inference",
  "regression discontinuity dataset statistics",
  "difference-in-differences dataset statistics",
  "heterogeneous treatment effects benchmark dataset",
  "survival models dataset biostatistics",
  "risk prediction survival dataset statistics",
  "time series forecasting benchmark dataset statistics",
  "hierarchical forecasting dataset statistics",
  "bayesian hierarchical model dataset statistics",
  "mcmc diagnostics bayesian benchmark dataset"
];

const ARXIV_STAT_CATEGORIES = ["stat.AP", "stat.ME", "stat.CO", "stat.TH"];
const ARXIV_DATA_TERMS = [
  "\"data are available\"",
  "\"publicly available\"",
  "\"replication data\"",
  "\"supplementary data\"",
  "\"data and code\"",
  "dataverse",
  "zenodo",
  "figshare",
  "github",
  "\"public-use microdata\""
];

const DATA_LINK_PATTERNS = [
  /https?:\/\/[^\s<>"')]+/gi,
  /(?:github\.com|zenodo\.org|dataverse\.harvard\.edu|figshare\.com|osf\.io|physionet\.org|openicpsr\.org|archive\.ics\.uci\.edu)[^\s<>"')]+/gi
];

const NON_STAT_NOISE = [
  "computer vision",
  "image classification",
  "object detection",
  "semantic segmentation",
  "lidar",
  "point cloud",
  "large language model",
  "language model",
  "natural language processing",
  "speech recognition",
  "remote sensing",
  "video dataset",
  "question answering"
];

function clean(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, label) {
  await sleep(REQUEST_DELAY_MS);
  let response = await fetch(url);
  if (response.status === 429) {
    await sleep(RETRY_DELAY_MS);
    response = await fetch(url);
  }
  if (!response.ok) throw new Error(`${label} failed: ${response.status}`);
  return response;
}

function slug(value) {
  return clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
}

function textFor(paper) {
  return [
    paper.title,
    paper.abstract,
    paper.dataset,
    paper.summary,
    paper.bestFor,
    paper.note,
    ...(paper.formats || []),
    ...(paper.properties || [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function datasetScore(paper) {
  const text = textFor(paper);
  const hits = DATASET_SIGNALS.filter((signal) => text.includes(signal));
  const dataLinks = extractDataLinks(text);
  return {
    score: hits.length + dataLinks.length * 2,
    evidence: [...hits, ...dataLinks]
  };
}

function scoreLabels(paper) {
  const text = textFor(paper);
  return LABEL_REGISTRY
    .map((label) => {
      const evidence = label.evidenceTerms.filter((term) => text.includes(term.toLowerCase()));
      return { label: label.name, score: evidence.length, evidence };
    })
    .filter((item) => item.score >= LABEL_RULES.scoreThreshold)
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
    .slice(0, LABEL_RULES.maxLabelsPerPaper);
}

function scoreCandidateLabels(paper) {
  const text = textFor(paper);
  return LABEL_CANDIDATES
    .map((label) => {
      const evidence = (label.evidenceTerms || []).filter((term) => text.includes(term.toLowerCase()));
      return { label: label.name, score: evidence.length, evidence };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));
}

function hasStatisticsSignal(paper) {
  const text = textFor(paper);
  const statsSignals = [
    "statistics",
    "statistical",
    "causal",
    "survey",
    "missing data",
    "imputation",
    "survival",
    "forecast",
    "time series",
    "bayesian",
    "mcmc",
    "hierarchical",
    "multilevel",
    "panel data",
    "treatment effect",
    "propensity",
    "nonresponse"
  ];
  return statsSignals.some((signal) => text.includes(signal));
}

function hasNoiseSignal(paper) {
  const text = textFor(paper);
  return NON_STAT_NOISE.some((signal) => text.includes(signal));
}

function extractArxivCategories(entry) {
  return [...entry.matchAll(/<category[^>]*term="([^"]+)"/g)].map((match) => match[1]);
}

function hasArxivStatisticsCategory(paper) {
  if (!paper.arxivCategories) return true;
  return paper.arxivCategories.some((category) => category.startsWith("stat."));
}

function extractDataLinks(text) {
  const links = DATA_LINK_PATTERNS.flatMap((pattern) => text.match(pattern) || []);
  return [...new Set(links.map((link) => link.replace(/[.,;:]+$/, "")))];
}

function inferDatasetUrl(paper) {
  const links = extractDataLinks(textFor(paper));
  const preferred = links.find((link) =>
    /github\.com|zenodo\.org|dataverse|figshare|osf\.io|physionet|openicpsr|archive\.ics\.uci/i.test(link)
  );
  return preferred || paper.datasetUrl || "";
}

function normalizeSemanticScholarPaper(raw, query) {
  const authors = (raw.authors || []).map((author) => author.name).filter(Boolean);
  const openPdfUrl = raw.openAccessPdf?.url || "";
  return {
    id: `s2-${raw.paperId || slug(raw.title)}`,
    title: clean(raw.title),
    authors: authors.length ? authors.join(", ") : "Unknown authors",
    year: raw.year || null,
    citations: raw.citationCount || 0,
    dataset: "",
    datasetUrl: openPdfUrl || raw.url || "",
    paperUrl: raw.url || openPdfUrl || "",
    access: openPdfUrl ? "open" : "request",
    formats: [],
    properties: ["candidate"],
    topics: [],
    abstract: clean(raw.abstract),
    bestFor: clean(raw.tldr?.text || raw.abstract || "Candidate paper from automated discovery."),
    note: `Discovered from Semantic Scholar query: ${query}`
  };
}

function parseArxivFeed(xml, query) {
  const entries = xml.split("<entry>").slice(1);
  return entries.map((entry) => {
    const tag = (name) => clean(entry.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`))?.[1] || "");
    const title = tag("title");
    const abstract = tag("summary");
    const idUrl = tag("id");
    const arxivCategories = extractArxivCategories(entry);
    const authors = [...entry.matchAll(/<author>\s*<name>([\s\S]*?)<\/name>\s*<\/author>/g)]
      .map((match) => clean(match[1]))
      .filter(Boolean);
    const year = Number(tag("published").slice(0, 4)) || null;
    return {
      id: `arxiv-${idUrl.split("/").pop()?.replace(/v\d+$/, "") || slug(title)}`,
      title,
      authors: authors.length ? authors.join(", ") : "Unknown authors",
      year,
      citations: 0,
      dataset: "",
      datasetUrl: "",
      paperUrl: idUrl,
      access: "open",
      formats: [],
      properties: ["candidate"],
      topics: [],
      abstract,
      arxivCategories,
      bestFor: abstract,
      note: `Discovered from arXiv query: ${query}`
    };
  });
}

async function searchSemanticScholar(query, limit) {
  const url = new URL("https://api.semanticscholar.org/graph/v1/paper/search");
  url.searchParams.set("query", query);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("fields", "paperId,title,abstract,year,url,authors,citationCount,openAccessPdf,tldr");

  const response = await fetchWithRetry(url, "Semantic Scholar");
  const data = await response.json();
  return (data.data || []).map((paper) => normalizeSemanticScholarPaper(paper, query));
}

async function searchArxiv(query, limit) {
  const url = new URL("https://export.arxiv.org/api/query");
  url.searchParams.set("search_query", `all:${query}`);
  url.searchParams.set("start", "0");
  url.searchParams.set("max_results", String(limit));
  url.searchParams.set("sortBy", "submittedDate");
  url.searchParams.set("sortOrder", "descending");

  const response = await fetchWithRetry(url, "arXiv");
  return parseArxivFeed(await response.text(), query);
}

async function searchArxivStatCategory(category, term, limit) {
  const url = new URL("https://export.arxiv.org/api/query");
  url.searchParams.set("search_query", `cat:${category} AND all:${term}`);
  url.searchParams.set("start", "0");
  url.searchParams.set("max_results", String(limit));
  url.searchParams.set("sortBy", "submittedDate");
  url.searchParams.set("sortOrder", "descending");

  const response = await fetchWithRetry(url, `arXiv ${category}`);
  return parseArxivFeed(await response.text(), `${category} ${term}`);
}

function screenCandidate(paper) {
  const datasetUrl = inferDatasetUrl(paper);
  const labels = scoreLabels(paper);
  const candidateLabels = scoreCandidateLabels(paper);
  const dataset = datasetScore({ ...paper, datasetUrl });
  return {
    ...paper,
    datasetUrl,
    topics: labels.map((item) => item.label),
    discovery: {
      datasetEvidence: dataset.evidence,
      datasetScore: dataset.score,
      labelEvidence: labels,
      candidateLabelEvidence: candidateLabels
    }
  };
}

function dedupe(papers) {
  const seen = new Set();
  return papers.filter((paper) => {
    const key = paper.paperUrl || paper.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const limitArg = Number(process.argv.find((arg) => arg.startsWith("--limit="))?.split("=")[1]);
const limit = Number.isFinite(limitArg) && limitArg > 0 ? limitArg : DEFAULT_LIMIT;
const sourceArg = process.argv.find((arg) => arg.startsWith("--sources="))?.split("=")[1];
const enabledSources = new Set((sourceArg || "arxiv-stat").split(",").map((source) => source.trim()).filter(Boolean));
const categoryArg = process.argv.find((arg) => arg.startsWith("--categories="))?.split("=")[1];
const enabledCategories = categoryArg
  ? categoryArg.split(",").map((category) => category.trim()).filter(Boolean)
  : ARXIV_STAT_CATEGORIES;
const allCandidates = [];
const errors = [];

if (enabledSources.has("semantic-scholar") || enabledSources.has("arxiv")) {
for (const query of DISCOVERY_QUERIES) {
  for (const [source, search] of [
    ["semantic-scholar", searchSemanticScholar],
    ["arxiv", searchArxiv]
  ].filter(([source]) => enabledSources.has(source))) {
    try {
      const results = await search(query, limit);
      allCandidates.push(...results.map((paper) => ({ ...paper, source })));
    } catch (error) {
      errors.push({ query, source, error: error.message });
    }
  }
}
}

if (enabledSources.has("arxiv-stat")) {
for (const category of enabledCategories) {
  for (const term of ARXIV_DATA_TERMS) {
    try {
      const results = await searchArxivStatCategory(category, term, limit);
      allCandidates.push(...results.map((paper) => ({ ...paper, source: "arxiv-stat" })));
    } catch (error) {
      errors.push({ query: `${category} ${term}`, source: "arxiv-stat", error: error.message });
    }
  }
}
}

const rawCandidates = dedupe(allCandidates).map(screenCandidate);
const reviewCandidates = rawCandidates.filter((paper) => {
  return (
    hasStatisticsSignal(paper) &&
    !hasNoiseSignal(paper) &&
    hasArxivStatisticsCategory(paper) &&
    paper.paperUrl &&
    (paper.datasetUrl || paper.discovery.datasetScore > 0 || paper.discovery.candidateLabelEvidence.length)
  );
});

const screened = reviewCandidates
  .filter((paper) => {
    return paper.datasetUrl && paper.discovery.datasetScore > 0;
  })
  .sort((a, b) => {
    return (
      b.discovery.datasetScore - a.discovery.datasetScore ||
      b.topics.length - a.topics.length ||
      (b.citations || 0) - (a.citations || 0)
    );
  });

await mkdir(new URL("../data", import.meta.url), { recursive: true });
await writeFile(
  new URL("../data/candidate-papers.json", import.meta.url),
  `${JSON.stringify(
    {
      createdAt: new Date().toISOString(),
      errors,
      rawCandidateCount: rawCandidates.length,
      reviewCandidateCount: reviewCandidates.length,
      screenedCandidateCount: screened.length,
      candidates: screened,
      reviewCandidates: reviewCandidates.slice(0, 200)
    },
    null,
    2
  )}\n`
);

console.log(
  JSON.stringify(
    {
      enabledSources: [...enabledSources],
      enabledCategories,
      searchedQueries: DISCOVERY_QUERIES.length,
      rawCandidates: rawCandidates.length,
      reviewCandidates: reviewCandidates.length,
      screenedCandidates: screened.length,
      errors
    },
    null,
    2
  )
);
