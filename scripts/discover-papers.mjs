import { mkdir, writeFile } from "node:fs/promises";
import { LABEL_REGISTRY, LABEL_RULES } from "../labels.mjs";

const DEFAULT_LIMIT = 25;
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

function clean(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
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
  return {
    score: hits.length,
    evidence: hits
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
      datasetUrl: idUrl,
      paperUrl: idUrl,
      access: "open",
      formats: [],
      properties: ["candidate"],
      topics: [],
      abstract,
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

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Semantic Scholar failed: ${response.status}`);
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

  const response = await fetch(url);
  if (!response.ok) throw new Error(`arXiv failed: ${response.status}`);
  return parseArxivFeed(await response.text(), query);
}

function screenCandidate(paper) {
  const labels = scoreLabels(paper);
  const dataset = datasetScore(paper);
  return {
    ...paper,
    topics: labels.map((item) => item.label),
    discovery: {
      datasetEvidence: dataset.evidence,
      datasetScore: dataset.score,
      labelEvidence: labels
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
const allCandidates = [];
const errors = [];

for (const query of DISCOVERY_QUERIES) {
  for (const [source, search] of [
    ["semantic-scholar", searchSemanticScholar],
    ["arxiv", searchArxiv]
  ]) {
    try {
      const results = await search(query, limit);
      allCandidates.push(...results.map((paper) => ({ ...paper, source })));
    } catch (error) {
      errors.push({ query, source, error: error.message });
    }
  }
}

const screened = dedupe(allCandidates)
  .map(screenCandidate)
  .filter((paper) => {
    return (
      paper.discovery.datasetScore > 0 &&
      paper.topics.length >= LABEL_RULES.minLabelsPerPaper &&
      paper.datasetUrl &&
      paper.paperUrl
    );
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
  `${JSON.stringify({ createdAt: new Date().toISOString(), errors, candidates: screened }, null, 2)}\n`
);

console.log(
  JSON.stringify(
    {
      searchedQueries: DISCOVERY_QUERIES.length,
      candidates: screened.length,
      errors
    },
    null,
    2
  )
);
