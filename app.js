import { LABEL_REGISTRY } from "./labels.mjs?v=20260712-label-search";

let papers = [];

const state = {
  query: "",
  topics: new Set(),
  access: new Set(),
  properties: new Set(),
  format: "all",
  savedOnly: false,
  sort: "relevance",
  selectedId: null,
  selectedDataset: null,
  saved: readLocalSet("savedPapers"),
  watchedTopics: readLocalSet("watchedTopics"),
  watchedOnly: false
};

const els = {
  topicFilters: document.querySelector("#topicFilters"),
  clearTopics: document.querySelector("#clearTopics"),
  showWatchedTopics: document.querySelector("#showWatchedTopics"),
  formatFilter: document.querySelector("#formatFilter"),
  searchInput: document.querySelector("#searchInput"),
  results: document.querySelector("#results"),
  resultSummary: document.querySelector("#resultSummary"),
  sortSelect: document.querySelector("#sortSelect"),
  showSaved: document.querySelector("#showSaved"),
  paperDetail: document.querySelector("#paperDetail"),
  emptyDetail: document.querySelector("#emptyDetail"),
  paperCount: document.querySelector("#paperCount"),
  datasetCount: document.querySelector("#datasetCount"),
  topicCount: document.querySelector("#topicCount"),
  savedCount: document.querySelector("#savedCount"),
  labelMatchPanel: document.querySelector("#labelMatchPanel"),
  topicAnalytics: document.querySelector("#topicAnalytics"),
  watchlistPanel: document.querySelector("#watchlistPanel"),
  suggestionForm: document.querySelector("#suggestionForm"),
  formStatus: document.querySelector("#formStatus")
};

const accessLabels = {
  open: "Open download",
  "open-link": "Clear data link",
  credentialed: "Credentialed",
  request: "Request access"
};

const levelLabels = {
  high: "High-level",
  mid: "Mid-level",
  low: "Specific"
};

const labelMeta = new Map(LABEL_REGISTRY.map((label) => [label.name, label]));

function readLocalSet(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return new Set(Array.isArray(value) ? value : []);
  } catch {
    return new Set();
  }
}

function uniqueValues(key) {
  return [...new Set(papers.flatMap((paper) => paper[key]))].sort((a, b) => a.localeCompare(b));
}

function initFilters() {
  els.topicFilters.innerHTML = "";
  while (els.formatFilter.options.length > 1) {
    els.formatFilter.remove(1);
  }

  renderTopicHierarchy().forEach((node) => {
    const button = document.createElement("div");
    button.className = `topic-chip level-${node.level}`;
    button.dataset.topic = node.topic;
    button.style.setProperty("--topic-depth", node.depth);
    button.innerHTML = `
      <button class="topic-chip-main" type="button" aria-pressed="false">
        <span>${escapeHtml(node.topic)}</span>
        <small>${levelLabels[node.level] || "Label"} · ${node.count}</small>
      </button>
      <button class="watch-topic" type="button" data-watch-topic="${escapeHtml(node.topic)}" aria-label="Watch ${escapeHtml(node.topic)}" title="Watch topic">☆</button>
    `;
    button.querySelector(".topic-chip-main").addEventListener("click", () => {
      toggleSetValue(state.topics, node.topic);
      render();
    });

    if (node.isSectionStart) {
      const heading = document.createElement("div");
      heading.className = "topic-section-heading";
      heading.textContent = node.sectionLabel;
      els.topicFilters.append(heading);
    }

    els.topicFilters.append(button);
  });

  uniqueValues("formats").forEach((format) => {
    const option = document.createElement("option");
    option.value = format;
    option.textContent = titleCase(format);
    els.formatFilter.append(option);
  });
}

function renderTopicHierarchy() {
  const activeTopics = new Set(uniqueValues("topics"));
  const counts = new Map(activeTopics.values().map((topic) => [topic, papers.filter((paper) => paper.topics.includes(topic)).length]));
  const children = new Map();
  const roots = [];

  for (const topic of activeTopics) {
    const meta = labelMeta.get(topic) || { level: "mid", parents: [] };
    const activeParents = (meta.parents || []).filter((parent) => activeTopics.has(parent));
    if (!activeParents.length) {
      roots.push(topic);
    }
    activeParents.forEach((parent) => {
      if (!children.has(parent)) children.set(parent, []);
      children.get(parent).push(topic);
    });
  }

  const byLevelThenCount = (a, b) => {
    const levelRank = { high: 0, mid: 1, low: 2 };
    const aMeta = labelMeta.get(a) || { level: "mid" };
    const bMeta = labelMeta.get(b) || { level: "mid" };
    return levelRank[aMeta.level] - levelRank[bMeta.level] || (counts.get(b) || 0) - (counts.get(a) || 0) || a.localeCompare(b);
  };

  const nodes = [];
  const rootGroups = [
    { label: "High-level topic families", topics: roots.filter((topic) => labelLevel(topic) === "high") },
    { label: "Mid-level topic families", topics: roots.filter((topic) => labelLevel(topic) === "mid") },
    { label: "Specific labels", topics: roots.filter((topic) => labelLevel(topic) === "low") }
  ];

  function visit(topic, depth, sectionLabel = "", path = []) {
    if (path.includes(topic)) return;
    const meta = labelMeta.get(topic) || { level: "mid" };
    nodes.push({
      topic,
      depth,
      level: meta.level,
      count: counts.get(topic) || 0,
      isSectionStart: false,
      sectionLabel
    });
    (children.get(topic) || []).sort(byLevelThenCount).forEach((child) => visit(child, depth + 1, sectionLabel, [...path, topic]));
  }

  rootGroups.forEach((group) => {
    const sortedRoots = group.topics.sort(byLevelThenCount);
    sortedRoots.forEach((topic, index) => {
      const beforeLength = nodes.length;
      visit(topic, 0, group.label);
      if (nodes.length > beforeLength && index === 0) {
        nodes[beforeLength].isSectionStart = true;
      }
    });
  });

  return nodes;
}

function labelLevel(topic) {
  return labelMeta.get(topic)?.level || "mid";
}

function normalizeSearch(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function labelSearchText(label) {
  return normalizeSearch([
    label.name,
    label.definition,
    ...(label.evidenceTerms || []),
    ...(label.includeWhen || [])
  ].join(" "));
}

function labelAliases(label) {
  const aliases = [label.name, ...(label.evidenceTerms || [])];
  if (label.name === "difference-in-differences") aliases.push("did", "diff in diff", "diff-in-diff");
  if (label.name === "graphical models") aliases.push("graph model", "graphical model", "gaussian graphical model");
  if (label.name === "best subset selection") aliases.push("best subsets", "l0", "l0 regularization");
  if (label.name === "time series forecasting") aliases.push("forecasting", "forecast");
  if (label.name === "multiple imputation") aliases.push("mice", "imputation");
  return aliases.map(normalizeSearch).filter(Boolean);
}

function scoreLabelMatch(label, rawPart) {
  const part = normalizeSearch(rawPart);
  if (!part || part.length < 2) return 0;

  const name = normalizeSearch(label.name);
  const aliases = labelAliases(label);
  const evidence = labelSearchText(label);
  const tokens = part.split(" ").filter(Boolean);

  if (name === part || aliases.includes(part)) return 120;
  if (name.includes(part)) return 90;
  if (part.includes(name)) return 85;
  if (aliases.some((alias) => alias.includes(part) || part.includes(alias))) return 80;
  if (tokens.length > 1 && tokens.every((token) => name.includes(token))) return 70;
  if (tokens.length > 1 && tokens.every((token) => evidence.includes(token))) return 58;
  if (tokens.some((token) => aliases.includes(token))) return 45;
  if (tokens.length === 1 && evidence.split(" ").includes(tokens[0])) return 35;
  return 0;
}

function labelMatchesForPart(rawPart, limit = 6) {
  const activeTopics = new Set(uniqueValues("topics"));
  return LABEL_REGISTRY
    .filter((label) => activeTopics.has(label.name))
    .map((label) => ({
      label,
      score: scoreLabelMatch(label, rawPart),
      count: papers.filter((paper) => paper.topics.includes(label.name)).length
    }))
    .filter((match) => match.score >= 35)
    .sort((a, b) => b.score - a.score || b.count - a.count || a.label.name.localeCompare(b.label.name))
    .slice(0, limit);
}

function queryLabelMatches() {
  const query = state.query.trim();
  if (!query) return [];

  const parts = query.includes(",")
    ? query.split(",").map((part) => part.trim()).filter(Boolean)
    : [query];
  const seen = new Set();
  const matches = [];

  parts.forEach((part) => {
    labelMatchesForPart(part, query.includes(",") ? 3 : 6).forEach((match) => {
      if (seen.has(match.label.name)) return;
      seen.add(match.label.name);
      matches.push({ ...match, queryPart: part });
    });
  });

  return matches.slice(0, 8);
}

function inferredTopicsFromQuery() {
  if (state.topics.size || !state.query.trim()) return [];
  if (state.query.includes(",")) {
    const seen = new Set();
    return state.query
      .split(",")
      .map((part) => labelMatchesForPart(part, 1)[0])
      .filter(Boolean)
      .filter((match) => {
        if (seen.has(match.label.name)) return false;
        seen.add(match.label.name);
        return true;
      })
      .map((match) => match.label.name);
  }
  return queryLabelMatches().slice(0, 1).map((match) => match.label.name);
}

async function loadCatalog() {
  try {
    const response = await fetch("data/papers.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Catalog request failed with ${response.status}`);
    }
    papers = await response.json();
    state.selectedId = papers[0]?.id || null;
    initFilters();
    render();
  } catch (error) {
    els.resultSummary.textContent = "The paper catalog could not be loaded.";
    els.results.innerHTML = `<div class="no-results">${escapeHtml(error.message)}</div>`;
    console.error(error);
  }
}

function toggleSetValue(set, value) {
  if (set.has(value)) {
    set.delete(value);
  } else {
    set.add(value);
  }
}

function searchableText(paper) {
  return [
    paper.title,
    paper.authors,
    paper.dataset,
    paper.bestFor,
    paper.note,
    paper.access,
    ...paper.topics,
    ...paper.formats,
    ...paper.properties
  ].join(" ").toLowerCase();
}

function topicText(paper) {
  return paper.topics.join(" ").toLowerCase();
}

function titleText(paper) {
  return paper.title.toLowerCase();
}

function datasetText(paper) {
  return paper.dataset.toLowerCase();
}

function searchTerms() {
  const query = state.query.trim().toLowerCase();
  if (!query) return [];
  if (query.includes(",")) {
    return query
      .split(",")
      .map((term) => term.trim())
      .filter(Boolean);
  }
  return query.split(/\s+/).filter(Boolean);
}

function scorePaper(paper) {
  const terms = searchTerms();
  if (!terms.length) return 1;

  const haystack = searchableText(paper);
  const labels = topicText(paper);
  const title = titleText(paper);
  const dataset = datasetText(paper);
  const commaMode = state.query.includes(",");
  const matchedTerms = terms.filter((term) => haystack.includes(term));

  if (commaMode && matchedTerms.length !== terms.length) return 0;

  return matchedTerms.reduce((score, term) => {
    if (labels.includes(term)) return score + 5;
    if (title.includes(term)) return score + 4;
    if (dataset.includes(term)) return score + 3;
    return score + 1;
  }, 0);
}

function filteredPapers() {
  const filtered = papers
    .map((paper) => ({ paper, score: scorePaper(paper) }))
    .filter(({ paper, score }) => {
      const matchesQuery = !state.query.trim() || score > 0;
      const matchesTopics = [...state.topics].every((topic) => paper.topics.includes(topic));
      const matchesAccess = state.access.size === 0 || state.access.has(paper.access);
      const matchesProperties = [...state.properties].every((property) => paper.properties.includes(property));
      const matchesFormat = state.format === "all" || paper.formats.includes(state.format);
      const matchesSaved = !state.savedOnly || state.saved.has(paper.id);
      const matchesWatched = !state.watchedOnly || [...state.watchedTopics].some((topic) => paper.topics.includes(topic));
      return matchesQuery && matchesTopics && matchesAccess && matchesProperties && matchesFormat && matchesSaved && matchesWatched;
    });

  const sorted = filtered.sort((a, b) => {
    if (state.sort === "year-desc") return b.paper.year - a.paper.year;
    if (state.sort === "year-asc") return a.paper.year - b.paper.year;
    if (state.sort === "citations") return b.paper.citations - a.paper.citations;
    return b.score - a.score || b.paper.year - a.paper.year;
  });

  return sorted.map(({ paper }) => paper);
}

function render() {
  renderFilters();
  renderStats();
  const matches = filteredPapers();
  renderLabelMatches();
  renderTopicAnalytics(matches);
  renderWatchlist();
  renderResults(matches);
  renderDetail(matches);
}

function renderFilters() {
  document.querySelectorAll(".topic-chip").forEach((button) => {
    const topic = button.dataset.topic;
    button.classList.toggle("selected", state.topics.has(topic));
    button.querySelector(".topic-chip-main")?.setAttribute("aria-pressed", String(state.topics.has(topic)));
    button.classList.toggle("watched", state.watchedTopics.has(topic));
    const watch = button.querySelector("[data-watch-topic]");
    if (watch) {
      watch.textContent = state.watchedTopics.has(topic) ? "★" : "☆";
      watch.setAttribute("aria-label", `${state.watchedTopics.has(topic) ? "Unwatch" : "Watch"} ${topic}`);
      watch.setAttribute("title", state.watchedTopics.has(topic) ? "Unwatch topic" : "Watch topic");
    }
  });
  els.showSaved.setAttribute("aria-pressed", String(state.savedOnly));
  els.showWatchedTopics.setAttribute("aria-pressed", String(state.watchedOnly));
}

function renderStats() {
  els.paperCount.textContent = papers.length;
  els.datasetCount.textContent = new Set(papers.map((paper) => paper.datasetUrl)).size;
  els.topicCount.textContent = uniqueValues("topics").length;
  els.savedCount.textContent = state.saved.size;
}

function renderLabelMatches() {
  const matches = queryLabelMatches();
  els.labelMatchPanel.innerHTML = "";

  if (!matches.length || state.topics.size) {
    els.labelMatchPanel.classList.add("hidden");
    return;
  }

  els.labelMatchPanel.classList.remove("hidden");
  els.labelMatchPanel.innerHTML = `
    <div>
      <p class="eyebrow">Matching research labels</p>
      <h2>Use a label to open full topic analytics</h2>
    </div>
    <div class="label-match-list">
      ${matches.map((match, index) => `
        <button class="label-match${index === 0 ? " primary" : ""}" type="button" data-label-match="${escapeHtml(match.label.name)}">
          <span>${escapeHtml(match.label.name)}</span>
          <small>${escapeHtml(levelLabels[match.label.level] || "Label")} · ${match.count} papers</small>
        </button>
      `).join("")}
    </div>
  `;
}

function renderWatchlist() {
  const watched = [...state.watchedTopics].filter((topic) => uniqueValues("topics").includes(topic)).sort((a, b) => a.localeCompare(b));
  els.watchlistPanel.innerHTML = "";

  if (!watched.length) {
    els.watchlistPanel.classList.add("hidden");
    return;
  }

  els.watchlistPanel.classList.remove("hidden");
  els.watchlistPanel.innerHTML = `
    <div>
      <p class="eyebrow">Watched topics</p>
      <h2>Your local watchlist</h2>
    </div>
    <div class="watchlist-tags">
      ${watched.map((topic) => `
        <button class="watchlist-tag${state.topics.has(topic) ? " active" : ""}" type="button" data-watchlist-topic="${escapeHtml(topic)}">
          <span>${escapeHtml(topic)}</span>
          <small>${papers.filter((paper) => paper.topics.includes(topic)).length}</small>
        </button>
      `).join("")}
    </div>
  `;
}

function renderTopicAnalytics(matches) {
  const selectedTopics = [...state.topics];
  const inferredTopics = selectedTopics.length ? [] : inferredTopicsFromQuery();
  const analyticsTopics = selectedTopics.length ? selectedTopics : inferredTopics;
  els.topicAnalytics.innerHTML = "";

  if (!analyticsTopics.length) {
    els.topicAnalytics.classList.add("hidden");
    state.selectedDataset = null;
    return;
  }

  const analyticsPapers = selectedTopics.length ? matches : papersForTopics(analyticsTopics);
  els.topicAnalytics.classList.remove("hidden");
  els.topicAnalytics.append(topicAnalyticsCard(analyticsTopics, analyticsPapers, !selectedTopics.length));
}

function papersForTopics(topics) {
  return papers.filter((paper) => {
    const matchesTopics = topics.every((topic) => paper.topics.includes(topic));
    const matchesAccess = state.access.size === 0 || state.access.has(paper.access);
    const matchesProperties = [...state.properties].every((property) => paper.properties.includes(property));
    const matchesFormat = state.format === "all" || paper.formats.includes(state.format);
    const matchesSaved = !state.savedOnly || state.saved.has(paper.id);
    const matchesWatched = !state.watchedOnly || [...state.watchedTopics].some((topic) => paper.topics.includes(topic));
    return matchesTopics && matchesAccess && matchesProperties && matchesFormat && matchesSaved && matchesWatched;
  });
}

function topicAnalyticsCard(selectedTopics, topicPapers, inferred = false) {
  const isIntersection = selectedTopics.length > 1;
  const title = isIntersection ? selectedTopics.join(" + ") : selectedTopics[0];
  const datasetRows = countBy(topicPapers, (paper) => paper.dataset)
    .map(([dataset, count]) => {
      const datasetPapers = topicPapers.filter((paper) => paper.dataset === dataset);
      return {
        dataset,
        count,
        firstYear: minYear(datasetPapers),
        latestYear: maxYear(datasetPapers),
        access: topEntries(countBy(datasetPapers, (paper) => accessLabels[paper.access] || paper.access), 2)
      };
    })
    .sort((a, b) => b.count - a.count || a.dataset.localeCompare(b.dataset));

  const activeDataset = state.selectedDataset && topicPapers.some((paper) => paper.dataset === state.selectedDataset)
    ? state.selectedDataset
    : datasetRows[0]?.dataset || null;

  const card = document.createElement("article");
  card.className = "analytics-card";
  card.innerHTML = `
    <div class="analytics-head">
      <div>
        <p class="eyebrow">${inferred ? "Search-matched label analytics" : isIntersection ? "Intersection analytics" : "Topic analytics"}</p>
        <h2>${escapeHtml(title)}</h2>
        ${inferred ? `<p class="analytics-source">Matched from the search box. Select the label to keep it as an active filter.</p>` : ""}
        ${isIntersection ? topicIntersectionMarkup(selectedTopics) : topicRelationshipMarkup(selectedTopics[0])}
      </div>
      <div class="analytics-metrics">
        ${metricMarkup(topicPapers.length, "papers")}
        ${metricMarkup(new Set(topicPapers.map((paper) => paper.dataset)).size, "datasets")}
        ${metricMarkup(minYear(topicPapers), "first paper year")}
        ${metricMarkup(maxYear(topicPapers), "latest paper year")}
      </div>
    </div>
    <div class="analytics-layout">
      <div class="analytics-section">
        <h3>${isIntersection ? "Datasets in this intersection" : "Datasets in this topic"}</h3>
        <div class="dataset-list">
          ${datasetRows.slice(0, 12).map((row) => datasetRowMarkup(row, activeDataset)).join("")}
        </div>
      </div>
      <div class="analytics-section">
        <h3>Paper years</h3>
        ${barListMarkup(yearBuckets(topicPapers), topicPapers.length)}
      </div>
      <div class="analytics-section">
        <h3>Access types</h3>
        ${barListMarkup(countBy(topicPapers, (paper) => accessLabels[paper.access] || paper.access), topicPapers.length)}
      </div>
      <div class="analytics-section">
        <h3>Formats</h3>
        ${barListMarkup(countBy(topicPapers, (paper) => paper.formats[0] || "Unspecified").slice(0, 8), topicPapers.length)}
      </div>
    </div>
    ${activeDataset ? datasetAnalyticsMarkup(activeDataset, topicPapers, isIntersection) : ""}
  `;

  card.querySelectorAll("[data-analytics-dataset]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedDataset = button.dataset.analyticsDataset;
      render();
    });
  });

  return card;
}

function topicIntersectionMarkup(selectedTopics) {
  return `
    <div class="topic-relationship">
      <span class="level-pill intersection">Selected intersection</span>
      <p>Requires every selected label: ${selectedTopics.map(escapeHtml).join(", ")}</p>
    </div>
  `;
}

function topicRelationshipMarkup(topic) {
  const meta = labelMeta.get(topic);
  if (!meta) return "";
  const activeTopics = new Set(uniqueValues("topics"));
  const parents = (meta.parents || []).filter((parent) => activeTopics.has(parent));
  const children = LABEL_REGISTRY
    .filter((label) => (label.parents || []).includes(topic) && activeTopics.has(label.name))
    .map((label) => label.name);

  return `
    <div class="topic-relationship">
      <span class="level-pill ${meta.level}">${escapeHtml(levelLabels[meta.level] || meta.level)}</span>
      ${parents.length ? `<p>Contained by: ${parents.map(escapeHtml).join(", ")}</p>` : ""}
      ${children.length ? `<p>Contains: ${children.map(escapeHtml).join(", ")}</p>` : ""}
    </div>
  `;
}

function datasetAnalyticsMarkup(dataset, scopedPapers, isIntersection = false) {
  const datasetPapers = scopedPapers.filter((paper) => paper.dataset === dataset);
  const labels = countBy(datasetPapers, (paper) => paper.topics).slice(0, 10);
  return `
    <div class="dataset-profile">
      <div>
        <h3>${escapeHtml(dataset)}</h3>
        <p>${datasetPapers.length} paper${datasetPapers.length === 1 ? "" : "s"} in the selected ${isIntersection ? "intersection" : "topic"} · ${minYear(datasetPapers)}-${maxYear(datasetPapers)}</p>
      </div>
      <div class="dataset-profile-grid">
        <div>
          <h4>Labels appearing with this dataset</h4>
          ${barListMarkup(labels, datasetPapers.length)}
        </div>
        <div>
          <h4>Dataset access in this topic</h4>
          ${barListMarkup(countBy(datasetPapers, (paper) => accessLabels[paper.access] || paper.access), datasetPapers.length)}
        </div>
      </div>
    </div>
  `;
}

function metricMarkup(value, label) {
  return `<div><span>${escapeHtml(value)}</span><small>${escapeHtml(label)}</small></div>`;
}

function datasetRowMarkup(row, activeDataset) {
  const isActive = row.dataset === activeDataset;
  const yearText = row.firstYear && row.latestYear ? `${row.firstYear}-${row.latestYear}` : "Year unavailable";
  const accessText = row.access ? ` · ${row.access}` : "";
  return `
    <button class="dataset-row${isActive ? " active" : ""}" type="button" data-analytics-dataset="${escapeHtml(row.dataset)}">
      <span>${escapeHtml(row.dataset)}</span>
      <small>${row.count} paper${row.count === 1 ? "" : "s"} · ${yearText}${escapeHtml(accessText)}</small>
    </button>
  `;
}

function barListMarkup(entries, total) {
  if (!entries.length || !total) return `<p class="empty-analytics">No data available.</p>`;
  return `
    <div class="bar-list">
      ${entries.map(([label, count]) => {
        const pct = Math.round((count / total) * 100);
        return `
          <div class="bar-row">
            <div>
              <span>${escapeHtml(label)}</span>
              <small>${count}</small>
            </div>
            <div class="bar-track" aria-hidden="true"><span style="width: ${pct}%"></span></div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function countBy(items, selector) {
  const counts = new Map();
  items.forEach((item) => {
    const raw = selector(item);
    const values = Array.isArray(raw) ? raw : [raw];
    values.filter(Boolean).forEach((value) => {
      counts.set(value, (counts.get(value) || 0) + 1);
    });
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));
}

function topEntries(entries, limit) {
  return entries.slice(0, limit).map(([label, count]) => `${label}: ${count}`).join(", ");
}

function minYear(items) {
  const years = items.map((item) => Number(item.year)).filter(Boolean);
  return years.length ? Math.min(...years) : "n/a";
}

function maxYear(items) {
  const years = items.map((item) => Number(item.year)).filter(Boolean);
  return years.length ? Math.max(...years) : "n/a";
}

function yearBuckets(items) {
  const buckets = new Map();
  items.forEach((item) => {
    const year = Number(item.year);
    if (!year) return;
    const start = Math.floor(year / 5) * 5;
    const label = `${start}-${start + 4}`;
    buckets.set(label, (buckets.get(label) || 0) + 1);
  });
  return [...buckets.entries()].sort((a, b) => Number(b[0].slice(0, 4)) - Number(a[0].slice(0, 4)));
}

function renderResults(matches) {
  const activeFilters = state.topics.size + state.access.size + state.properties.size + (state.format === "all" ? 0 : 1);
  els.resultSummary.textContent = `${matches.length} paper${matches.length === 1 ? "" : "s"} found${activeFilters ? ` with ${activeFilters} active filter${activeFilters === 1 ? "" : "s"}` : ""}`;
  els.results.innerHTML = "";

  if (!matches.length) {
    const empty = document.createElement("div");
    empty.className = "no-results";
    empty.textContent = "No papers match this combination yet. Try fewer labels or submit a new candidate paper below.";
    els.results.append(empty);
    return;
  }

  matches.forEach((paper) => {
    const card = document.createElement("article");
    card.className = `paper-card${paper.id === state.selectedId ? " selected" : ""}`;
    card.innerHTML = `
      <div class="card-top">
        <span class="access-badge ${paper.access}">${accessLabels[paper.access]}</span>
        <span class="paper-meta">${paper.year} · ${paper.citations.toLocaleString()} citations</span>
      </div>
      <div>
        <h2>${escapeHtml(paper.title)}</h2>
        <div class="paper-meta">${escapeHtml(paper.authors)} · ${escapeHtml(paper.dataset)}</div>
      </div>
      <p>${escapeHtml(paper.bestFor)}</p>
      <div class="tag-row">
        ${paper.topics.slice(0, 5).map((topic) => `<span class="tag">${escapeHtml(topic)}</span>`).join("")}
      </div>
      <div class="card-actions">
        <button class="save-button ${state.saved.has(paper.id) ? "active" : ""}" type="button" data-save="${paper.id}">
          ${state.saved.has(paper.id) ? "Saved" : "Save"}
        </button>
        <button class="detail-link" type="button" data-detail="${paper.id}">Open details</button>
      </div>
    `;
    els.results.append(card);
  });
}

function renderDetail(matches) {
  const selected = papers.find((paper) => paper.id === state.selectedId && matches.includes(paper)) || matches[0];
  if (!selected) {
    els.paperDetail.classList.add("hidden");
    els.emptyDetail.classList.remove("hidden");
    return;
  }

  state.selectedId = selected.id;
  els.emptyDetail.classList.add("hidden");
  els.paperDetail.classList.remove("hidden");
  els.paperDetail.innerHTML = `
    <span class="access-badge ${selected.access}">${accessLabels[selected.access]}</span>
    <h2>${escapeHtml(selected.title)}</h2>
    <p>${escapeHtml(selected.authors)} · ${selected.year}</p>
    <dl>
      <div>
        <dt>Dataset</dt>
        <dd><a href="${selected.datasetUrl}" target="_blank" rel="noreferrer">${escapeHtml(selected.dataset)}</a></dd>
      </div>
      <div>
        <dt>Paper</dt>
        <dd><a href="${selected.paperUrl}" target="_blank" rel="noreferrer">Open paper or publication page</a></dd>
      </div>
      <div>
        <dt>Use case fit</dt>
        <dd>${escapeHtml(selected.bestFor)}</dd>
      </div>
      <div>
        <dt>Formats</dt>
        <dd>${selected.formats.map(titleCase).join(", ")}</dd>
      </div>
      <div>
        <dt>Catalog note</dt>
        <dd>${escapeHtml(selected.note)}</dd>
      </div>
    </dl>
    <div class="tag-row">
      ${selected.topics.map((topic) => `<span class="tag">${escapeHtml(topic)}</span>`).join("")}
    </div>
  `;
}

function persistSaved() {
  localStorage.setItem("savedPapers", JSON.stringify([...state.saved]));
}

function persistWatchedTopics() {
  localStorage.setItem("watchedTopics", JSON.stringify([...state.watchedTopics]));
}

function titleCase(value) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.addEventListener("input", (event) => {
  if (event.target === els.searchInput) {
    state.query = event.target.value;
    render();
  }

  if (event.target.matches("[data-filter]")) {
    const targetSet = event.target.dataset.filter === "access" ? state.access : state.properties;
    if (event.target.checked) {
      targetSet.add(event.target.value);
    } else {
      targetSet.delete(event.target.value);
    }
    render();
  }
});

document.addEventListener("click", (event) => {
  const labelMatch = event.target.closest("[data-label-match]")?.dataset.labelMatch;
  if (labelMatch) {
    state.topics.add(labelMatch);
    render();
    return;
  }

  const watchedTopic = event.target.closest("[data-watch-topic]")?.dataset.watchTopic;
  if (watchedTopic) {
    event.preventDefault();
    event.stopPropagation();
    toggleSetValue(state.watchedTopics, watchedTopic);
    persistWatchedTopics();
    render();
    return;
  }

  const watchlistTopic = event.target.closest("[data-watchlist-topic]")?.dataset.watchlistTopic;
  if (watchlistTopic) {
    toggleSetValue(state.topics, watchlistTopic);
    render();
    return;
  }

  const saveId = event.target.closest("[data-save]")?.dataset.save;
  if (saveId) {
    toggleSetValue(state.saved, saveId);
    persistSaved();
    render();
  }

  const detailId = event.target.closest("[data-detail]")?.dataset.detail;
  if (detailId) {
    state.selectedId = detailId;
    render();
  }
});

els.clearTopics.addEventListener("click", () => {
  state.topics.clear();
  render();
});

els.formatFilter.addEventListener("change", (event) => {
  state.format = event.target.value;
  render();
});

els.sortSelect.addEventListener("change", (event) => {
  state.sort = event.target.value;
  render();
});

els.showSaved.addEventListener("click", () => {
  state.savedOnly = !state.savedOnly;
  render();
});

els.showWatchedTopics.addEventListener("click", () => {
  state.watchedOnly = !state.watchedOnly;
  render();
});

els.suggestionForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const paperUrl = String(formData.get("paperUrl") || "");
  const datasetUrl = String(formData.get("datasetUrl") || "");

  if (!isSafeHttpUrl(paperUrl) || !isSafeHttpUrl(datasetUrl)) {
    els.formStatus.textContent = "Please use valid http or https links for both URLs.";
    return;
  }

  const body = new URLSearchParams(formData);

  try {
    const response = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });

    if (!response.ok) throw new Error("Submission service is unavailable.");

    event.target.reset();
    els.formStatus.textContent = "Suggestion submitted for curator review.";
  } catch {
    const suggestions = JSON.parse(localStorage.getItem("paperSuggestions") || "[]");
    suggestions.push({
      title: formData.get("title"),
      paperUrl,
      datasetUrl,
      researchArea: formData.get("researchArea"),
      note: formData.get("note"),
      createdAt: new Date().toISOString()
    });
    localStorage.setItem("paperSuggestions", JSON.stringify(suggestions));
    event.target.reset();
    els.formStatus.textContent = `Suggestion saved locally. ${suggestions.length} pending suggestion${suggestions.length === 1 ? "" : "s"}.`;
  }
});

function isSafeHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

loadCatalog();
