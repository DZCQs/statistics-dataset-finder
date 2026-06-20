import { readFile, writeFile } from "node:fs/promises";
import { LABEL_REGISTRY, LABEL_RULES } from "../labels.mjs";

const candidatePath = process.argv[2];

if (!candidatePath) {
  console.error("Provide a JSON file containing one paper or an array of papers.");
  process.exit(1);
}

function textFor(paper) {
  return [
    paper.title,
    paper.authors,
    paper.dataset,
    paper.abstract,
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

function scoreLabel(paper, label) {
  const text = textFor(paper);
  const evidence = label.evidenceTerms.filter((term) => text.includes(term.toLowerCase()));
  return {
    label: label.name,
    score: evidence.length,
    evidence
  };
}

function assignLabels(paper) {
  const scored = LABEL_REGISTRY
    .map((label) => scoreLabel(paper, label))
    .filter((item) => item.score >= LABEL_RULES.scoreThreshold)
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));

  return scored.slice(0, LABEL_RULES.maxLabelsPerPaper);
}

function normalizePaper(paper, assigned) {
  return {
    id: paper.id,
    title: paper.title,
    authors: paper.authors || "Unknown authors",
    year: Number(paper.year) || new Date().getFullYear(),
    citations: Number(paper.citations) || 0,
    dataset: paper.dataset,
    datasetUrl: paper.datasetUrl,
    paperUrl: paper.paperUrl,
    access: paper.access || "open",
    formats: paper.formats || [],
    properties: paper.properties || ["documentation"],
    topics: assigned.map((item) => item.label),
    bestFor: paper.bestFor || paper.summary || "Curator review needed.",
    note: paper.note || "Added through the label-assessment workflow."
  };
}

function validateRequired(paper) {
  const required = ["id", "title", "dataset", "datasetUrl", "paperUrl"];
  return required.filter((field) => !paper[field]);
}

const current = JSON.parse(await readFile(new URL("../data/papers.json", import.meta.url), "utf8"));
const incomingRaw = JSON.parse(await readFile(candidatePath, "utf8"));
const incoming = Array.isArray(incomingRaw) ? incomingRaw : [incomingRaw];
const existingIds = new Set(current.map((paper) => paper.id));
const additions = [];
const rejected = [];

for (const paper of incoming) {
  const missing = validateRequired(paper);
  const assigned = assignLabels(paper);

  if (missing.length || existingIds.has(paper.id) || assigned.length < LABEL_RULES.minLabelsPerPaper) {
    rejected.push({
      id: paper.id || null,
      title: paper.title || null,
      missing,
      duplicate: existingIds.has(paper.id),
      assigned
    });
    continue;
  }

  const normalized = normalizePaper(paper, assigned);
  additions.push({
    paper: normalized,
    labelEvidence: assigned
  });
  existingIds.add(normalized.id);
}

if (additions.length) {
  current.push(...additions.map((item) => item.paper));
  await writeFile(new URL("../data/papers.json", import.meta.url), `${JSON.stringify(current, null, 2)}\n`);
}

console.log(
  JSON.stringify(
    {
      added: additions,
      rejected,
      note:
        rejected.length > 0
          ? "Rejected papers need more metadata, are duplicates, or did not match enough existing labels."
          : "All candidate papers were added with existing labels."
    },
    null,
    2
  )
);
