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
  suggestionForm: document.querySelector("#suggestionForm"),
  formStatus: document.querySelector("#formStatus")
};

const accessLabels = {
  open: "Open download",
  "open-link": "Clear data link",
  credentialed: "Credentialed",
  request: "Request access"
};

function uniqueValues(key) {
  return [...new Set(papers.flatMap((paper) => paper[key]))].sort((a, b) => a.localeCompare(b));
}

function initFilters() {
  els.topicFilters.innerHTML = "";
  while (els.formatFilter.options.length > 1) {
    els.formatFilter.remove(1);
  }

  uniqueValues("topics").forEach((topic) => {
    const button = document.createElement("button");
    button.className = "topic-chip";
    button.type = "button";
    button.textContent = topic;
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      toggleSetValue(state.topics, topic);
      render();
    });
    els.topicFilters.append(button);
  });

  uniqueValues("formats").forEach((format) => {
    const option = document.createElement("option");
    option.value = format;
    option.textContent = titleCase(format);
    els.formatFilter.append(option);
  });
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
  const commaMode = state.query.includes(",");
  const matchedTerms = terms.filter((term) => haystack.includes(term));

  if (commaMode && matchedTerms.length !== terms.length) return 0;

  return matchedTerms.reduce((score, term) => score + (labels.includes(term) ? 4 : 1), 0);
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
  renderResults(matches);
  renderDetail(matches);
}

function renderFilters() {
  document.querySelectorAll(".topic-chip").forEach((button) => {
    button.setAttribute("aria-pressed", String(state.topics.has(button.textContent)));
  });
  els.showSaved.setAttribute("aria-pressed", String(state.savedOnly));
}

function renderStats() {
  els.paperCount.textContent = papers.length;
  els.datasetCount.textContent = new Set(papers.map((paper) => paper.datasetUrl)).size;
  els.topicCount.textContent = uniqueValues("topics").length;
  els.savedCount.textContent = state.saved.size;
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
