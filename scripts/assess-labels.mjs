import { readFile } from "node:fs/promises";
import { LABEL_REGISTRY, LABEL_RULES } from "../labels.mjs";

async function loadPapers() {
  const source = await readFile(new URL("../data/papers.json", import.meta.url), "utf8");
  return JSON.parse(source);
}

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
  ]
    .join(" ")
    .toLowerCase();
}

function scoreLabel(paper, label) {
  const text = paperText(paper);
  const evidenceHits = label.evidenceTerms.filter((term) => text.includes(term.toLowerCase()));
  const topicHit = (paper.topics || []).includes(label.name);
  const score = evidenceHits.length + (topicHit ? 2 : 0);
  return {
    label: label.name,
    score,
    evidence: evidenceHits
  };
}

function suggestLabels(paper) {
  return LABEL_REGISTRY
    .map((label) => scoreLabel(paper, label))
    .filter((result) => result.score >= LABEL_RULES.scoreThreshold)
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
    .slice(0, LABEL_RULES.maxLabelsPerPaper);
}

function labelUsage(papers) {
  const usage = new Map();
  for (const label of LABEL_REGISTRY) usage.set(label.name, 0);
  for (const paper of papers) {
    for (const topic of paper.topics || []) {
      usage.set(topic, (usage.get(topic) || 0) + 1);
    }
  }
  return usage;
}

function auditPaper(paper) {
  const suggestions = suggestLabels(paper);
  const assigned = paper.topics || [];
  const unknown = assigned.filter((topic) => !LABEL_REGISTRY.some((label) => label.name === topic));
  const missingSuggested = suggestions
    .map((item) => item.label)
    .filter((label) => !assigned.includes(label));
  const weakAssigned = assigned.filter((topic) => {
    const label = LABEL_REGISTRY.find((candidate) => candidate.name === topic);
    return label && scoreLabel(paper, label).score < LABEL_RULES.scoreThreshold;
  });

  return {
    id: paper.id,
    assigned,
    suggested: suggestions,
    status: {
      labelCountOk:
        assigned.length >= LABEL_RULES.minLabelsPerPaper &&
        assigned.length <= LABEL_RULES.maxLabelsPerPaper,
      unknown,
      missingSuggested,
      weakAssigned
    }
  };
}

const papers = await loadPapers();
const audits = papers.map(auditPaper);
const usage = labelUsage(papers);
const underused = [...usage.entries()]
  .filter(([, count]) => count > 0 && count < LABEL_RULES.minimumReuseForNewLabel)
  .sort((a, b) => a[0].localeCompare(b[0]));
const unknownLabels = [...new Set(audits.flatMap((audit) => audit.status.unknown))].sort();
const wrongLabelCounts = audits.filter((audit) => !audit.status.labelCountOk);
const weakAssignments = audits.filter((audit) => audit.status.weakAssigned.length);

console.log(
  JSON.stringify(
    {
      summary: {
        papers: papers.length,
        registryLabels: LABEL_REGISTRY.length,
        activeLabels: [...usage.values()].filter((count) => count > 0).length,
        rules: LABEL_RULES
      },
      labelUsage: Object.fromEntries([...usage.entries()].sort((a, b) => a[0].localeCompare(b[0]))),
      underused,
      unknownLabels,
      wrongLabelCounts: wrongLabelCounts.map(({ id, assigned }) => ({ id, assigned })),
      weakAssignments: weakAssignments.map(({ id, status }) => ({
        id,
        weakAssigned: status.weakAssigned,
        missingSuggested: status.missingSuggested
      })),
      sampleSuggestions: audits.slice(0, 8).map(({ id, assigned, suggested }) => ({
        id,
        assigned,
        suggested
      }))
    },
    null,
    2
  )
);
