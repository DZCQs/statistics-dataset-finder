import { LABEL_REGISTRY } from "./labels.mjs";

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
  saved: new Set(JSON.parse(localStorage.getItem("savedPapers") || "[]"))
};

const els = {
  topicFilters: document.querySelector("#topicFilters"),
  clearTopics: document.querySelector("#clearTopics"),
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
  topicAnalytics: document.querySelector("#topicAnalytics"),
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

function uniqueValues(key) {
  return [...new Set(papers.flatMap((paper) => paper[key]))].sort((a, b) => a.localeCompare(b));
}

function initFilters() {
  els.topicFilters.innerHTML = "";
  while (els.formatFilter.options.length > 1) {
    els.formatFilter.remove(1);
  }

  renderTopicHierarchy().forEach((node) => {
    const button = document.createElement("button");
    button.className = `topic-chip level-${node.level}`;
    button.type = "button";
    button.dataset.topic = node.topic;
    button.style.setProperty("--topic-depth", node.depth);
    button.setAttribute("aria-pressed", "false");
    button.innerHTML = `
      <span>${escapeHtml(node.topic)}</span>
      <small>${levelLabels[node.level] || "Label"} · ${node.count}</small>
    `;
    button.addEventListener("click", () => {
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
      return matchesQuery && matchesTopics && matchesAccess && matchesProperties && matchesFormat && matchesSaved;
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
  renderTopicAnalytics();
  renderResults(matches);
  renderDetail(matches);
}

function renderFilters() {
  document.querySelectorAll(".topic-chip").forEach((button) => {
    button.setAttribute("aria-pressed", String(state.topics.has(button.dataset.topic)));
  });
  els.showSaved.setAttribute("aria-pressed", String(state.savedOnly));
}

function renderStats() {
  els.paperCount.textContent = papers.length;
  els.datasetCount.textContent = new Set(papers.map((paper) => paper.datasetUrl)).size;
  els.topicCount.textContent = uniqueValues("topics").length;
  els.savedCount.textContent = state.saved.size;
}

function renderTopicAnalytics() {
  const selectedTopics = [...state.topics];
  els.topicAnalytics.innerHTML = "";

  if (!selectedTopics.length) {
    els.topicAnalytics.classList.add("hidden");
    state.selectedDataset = null;
    return;
  }

  els.topicAnalytics.classList.remove("hidden");
  selectedTopics.forEach((topic) => {
    els.topicAnalytics.append(topicAnalyticsCard(topic));
  });
}

function topicAnalyticsCard(topic) {
  const topicPapers = papers.filter((paper) => paper.topics.includes(topic));
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
        <p class="eyebrow">Topic analytics</p>
        <h2>${escapeHtml(topic)}</h2>
        ${topicRelationshipMarkup(topic)}
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
        <h3>Datasets in this topic</h3>
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
    ${activeDataset ? datasetAnalyticsMarkup(activeDataset, topicPapers) : ""}
  `;

  card.querySelectorAll("[data-analytics-dataset]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedDataset = button.dataset.analyticsDataset;
      render();
    });
  });

  return card;
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

function datasetAnalyticsMarkup(dataset, scopedPapers) {
  const datasetPapers = scopedPapers.filter((paper) => paper.dataset === dataset);
  const labels = countBy(datasetPapers, (paper) => paper.topics).slice(0, 10);
  return `
    <div class="dataset-profile">
      <div>
        <h3>${escapeHtml(dataset)}</h3>
        <p>${datasetPapers.length} paper${datasetPapers.length === 1 ? "" : "s"} in the selected topic · ${minYear(datasetPapers)}-${maxYear(datasetPapers)}</p>
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
