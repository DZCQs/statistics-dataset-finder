import { readFile, writeFile, mkdir } from "node:fs/promises";
import { LABEL_REGISTRY, LABEL_RULES } from "../labels.mjs";

const TARGET = Number(process.argv.find((arg) => arg.startsWith("--target="))?.split("=")[1]) || 400;
const MAX_PAGES = Number(process.argv.find((arg) => arg.startsWith("--pages="))?.split("=")[1]) || 5;
const PER_PAGE = 50;
const REQUEST_DELAY_MS = 1200;
const OPENALEX_MAILTO = "dataset.finder@example.com";
const OUTPUT_URL = new URL("../data/openalex-candidates.json", import.meta.url);

const DATASET_SEEDS = [
  {
    name: "NHANES",
    url: "https://www.cdc.gov/nchs/nhanes/",
    aliases: ["NHANES", "National Health and Nutrition Examination Survey"],
    labels: ["complex survey design", "survey weighting", "missing data", "risk prediction"]
  },
  {
    name: "Health and Retirement Study",
    url: "https://hrs.isr.umich.edu/about",
    aliases: ["Health and Retirement Study", "HRS"],
    labels: ["longitudinal data analysis", "panel data methods", "missing data", "survival models"]
  },
  {
    name: "Panel Study of Income Dynamics",
    url: "https://psidonline.isr.umich.edu/",
    aliases: ["Panel Study of Income Dynamics", "PSID"],
    labels: ["panel data methods", "longitudinal data analysis", "complex survey design", "survey weighting"]
  },
  {
    name: "National Longitudinal Surveys",
    url: "https://www.nlsinfo.org/",
    aliases: ["National Longitudinal Survey", "NLSY", "National Longitudinal Surveys"],
    labels: ["longitudinal data analysis", "panel data methods", "missing data", "treatment effect estimation"]
  },
  {
    name: "Add Health",
    url: "https://addhealth.cpc.unc.edu/data/",
    aliases: ["Add Health", "National Longitudinal Study of Adolescent to Adult Health"],
    labels: ["longitudinal data analysis", "complex survey design", "missing data", "multilevel modeling"]
  },
  {
    name: "Medical Expenditure Panel Survey",
    url: "https://meps.ahrq.gov/mepsweb/",
    aliases: ["Medical Expenditure Panel Survey", "MEPS"],
    labels: ["complex survey design", "survey weighting", "panel data methods", "risk prediction"]
  },
  {
    name: "American Community Survey",
    url: "https://www.census.gov/programs-surveys/acs/data.html",
    aliases: ["American Community Survey", "ACS"],
    labels: ["complex survey design", "survey weighting", "small area estimation", "multilevel modeling"]
  },
  {
    name: "IPUMS USA",
    url: "https://usa.ipums.org/usa/",
    aliases: ["IPUMS", "IPUMS USA"],
    labels: ["complex survey design", "survey weighting", "small area estimation", "panel data methods"]
  },
  {
    name: "General Social Survey",
    url: "https://gss.norc.org/",
    aliases: ["General Social Survey", "GSS"],
    labels: ["complex survey design", "survey weighting", "missing data", "multilevel modeling"]
  },
  {
    name: "Behavioral Risk Factor Surveillance System",
    url: "https://www.cdc.gov/brfss/",
    aliases: ["Behavioral Risk Factor Surveillance System", "BRFSS"],
    labels: ["complex survey design", "survey weighting", "small area estimation", "risk prediction"]
  },
  {
    name: "SEER",
    url: "https://seer.cancer.gov/data/",
    aliases: ["SEER", "Surveillance, Epidemiology, and End Results"],
    labels: ["survival models", "risk prediction", "longitudinal data analysis", "missing data"]
  },
  {
    name: "MIMIC-IV",
    url: "https://physionet.org/content/mimiciv/",
    aliases: ["MIMIC-IV", "MIMIC III", "MIMIC-III", "Medical Information Mart for Intensive Care"],
    labels: ["risk prediction", "survival models", "longitudinal data analysis", "missing data"]
  },
  {
    name: "Framingham Heart Study",
    url: "https://biolincc.nhlbi.nih.gov/studies/framcohort/",
    aliases: ["Framingham Heart Study", "Framingham Offspring Study"],
    labels: ["longitudinal data analysis", "risk prediction", "survival models", "missing data"]
  },
  {
    name: "UK Biobank",
    url: "https://www.ukbiobank.ac.uk/enable-your-research/apply-for-access",
    aliases: ["UK Biobank"],
    labels: ["risk prediction", "survival models", "longitudinal data analysis", "missing data"]
  },
  {
    name: "MIMIC-CXR",
    url: "https://physionet.org/content/mimic-cxr/",
    aliases: ["MIMIC-CXR"],
    labels: ["risk prediction", "longitudinal data analysis", "missing data", "survival models"]
  },
  {
    name: "M4 Competition",
    url: "https://github.com/Mcompetitions/M4-methods/tree/master/Dataset",
    aliases: ["M4 competition", "M4 forecasting competition"],
    labels: ["time series forecasting", "hierarchical forecasting", "risk prediction"]
  },
  {
    name: "M5 Forecasting",
    url: "https://www.kaggle.com/competitions/m5-forecasting-accuracy/data",
    aliases: ["M5 forecasting", "M5 competition"],
    labels: ["time series forecasting", "hierarchical forecasting", "panel data methods"]
  },
  {
    name: "ACIC Causal Inference Challenge",
    url: "https://aciccomp.org/",
    aliases: ["ACIC", "Atlantic Causal Inference Conference challenge"],
    labels: ["treatment effect estimation", "heterogeneous treatment effects", "propensity score methods", "randomized experiments"]
  },
  {
    name: "LaLonde NSW",
    url: "https://users.nber.org/~rdehejia/nswdata2.html",
    aliases: ["LaLonde", "National Supported Work", "NSW data"],
    labels: ["treatment effect estimation", "propensity score methods", "quasi-experimental designs", "heterogeneous treatment effects"]
  },
  {
    name: "IHDP",
    url: "https://www.fredjo.com/",
    aliases: ["Infant Health and Development Program", "IHDP"],
    labels: ["treatment effect estimation", "heterogeneous treatment effects", "propensity score methods", "randomized experiments"]
  },
  {
    name: "National Health Interview Survey",
    url: "https://www.cdc.gov/nchs/nhis/",
    aliases: ["National Health Interview Survey", "NHIS"],
    labels: ["complex survey design", "survey weighting", "missing data", "risk prediction"]
  },
  {
    name: "Current Population Survey",
    url: "https://www.census.gov/programs-surveys/cps/data.html",
    aliases: ["Current Population Survey", "CPS"],
    labels: ["complex survey design", "survey weighting", "panel data methods", "small area estimation"]
  },
  {
    name: "Survey of Income and Program Participation",
    url: "https://www.census.gov/programs-surveys/sipp/data.html",
    aliases: ["Survey of Income and Program Participation", "SIPP"],
    labels: ["complex survey design", "survey weighting", "panel data methods", "longitudinal data analysis"]
  },
  {
    name: "Demographic and Health Surveys",
    url: "https://dhsprogram.com/data/",
    aliases: ["Demographic and Health Surveys", "DHS Program", "DHS data"],
    labels: ["complex survey design", "survey weighting", "small area estimation", "multilevel modeling"]
  },
  {
    name: "World Values Survey",
    url: "https://www.worldvaluessurvey.org/WVSContents.jsp",
    aliases: ["World Values Survey", "WVS"],
    labels: ["complex survey design", "survey weighting", "multilevel modeling", "missing data"]
  },
  {
    name: "European Social Survey",
    url: "https://www.europeansocialsurvey.org/data/",
    aliases: ["European Social Survey", "ESS"],
    labels: ["complex survey design", "survey weighting", "multilevel modeling", "missing data"]
  },
  {
    name: "Survey of Health, Ageing and Retirement in Europe",
    url: "https://share-eric.eu/data/",
    aliases: ["Survey of Health, Ageing and Retirement in Europe", "SHARE data"],
    labels: ["longitudinal data analysis", "panel data methods", "survival models", "missing data"]
  },
  {
    name: "English Longitudinal Study of Ageing",
    url: "https://www.elsa-project.ac.uk/accessing-elsa-data",
    aliases: ["English Longitudinal Study of Ageing", "ELSA"],
    labels: ["longitudinal data analysis", "panel data methods", "survival models", "missing data"]
  },
  {
    name: "China Health and Retirement Longitudinal Study",
    url: "https://charls.charlsdata.com/",
    aliases: ["China Health and Retirement Longitudinal Study", "CHARLS"],
    labels: ["longitudinal data analysis", "panel data methods", "missing data", "survival models"]
  },
  {
    name: "Alzheimer's Disease Neuroimaging Initiative",
    url: "https://adni.loni.usc.edu/data-samples/access-data/",
    aliases: ["Alzheimer's Disease Neuroimaging Initiative", "ADNI"],
    labels: ["longitudinal data analysis", "risk prediction", "survival models", "missing data"]
  },
  {
    name: "The Cancer Genome Atlas",
    url: "https://www.cancer.gov/ccg/research/genome-sequencing/tcga",
    aliases: ["The Cancer Genome Atlas", "TCGA"],
    labels: ["survival models", "risk prediction", "missing data", "multilevel modeling"]
  },
  {
    name: "eICU Collaborative Research Database",
    url: "https://physionet.org/content/eicu-crd/",
    aliases: ["eICU Collaborative Research Database", "eICU"],
    labels: ["risk prediction", "survival models", "longitudinal data analysis", "missing data"]
  },
  {
    name: "National Survey on Drug Use and Health",
    url: "https://www.samhsa.gov/data/data-we-collect/nsduh-national-survey-drug-use-and-health",
    aliases: ["National Survey on Drug Use and Health", "NSDUH"],
    labels: ["complex survey design", "survey weighting", "missing data", "risk prediction"]
  },
  {
    name: "Youth Risk Behavior Surveillance System",
    url: "https://www.cdc.gov/yrbs/data/",
    aliases: ["Youth Risk Behavior Surveillance System", "YRBSS", "YRBS"],
    labels: ["complex survey design", "survey weighting", "missing data", "risk prediction"]
  },
  {
    name: "Early Childhood Longitudinal Study",
    url: "https://nces.ed.gov/ecls/",
    aliases: ["Early Childhood Longitudinal Study", "ECLS"],
    labels: ["longitudinal data analysis", "complex survey design", "survey weighting", "multilevel modeling"]
  },
  {
    name: "Programme for International Student Assessment",
    url: "https://www.oecd.org/pisa/data/",
    aliases: ["Programme for International Student Assessment", "PISA"],
    labels: ["complex survey design", "survey weighting", "multilevel modeling", "small area estimation"]
  },
  {
    name: "Trends in International Mathematics and Science Study",
    url: "https://timssandpirls.bc.edu/timss-landing.html",
    aliases: ["Trends in International Mathematics and Science Study", "TIMSS"],
    labels: ["complex survey design", "survey weighting", "multilevel modeling", "small area estimation"]
  },
  {
    name: "Fragile Families and Child Wellbeing Study",
    url: "https://ffcws.princeton.edu/documentation",
    aliases: ["Fragile Families and Child Wellbeing Study", "Fragile Families"],
    labels: ["longitudinal data analysis", "panel data methods", "missing data", "multilevel modeling"]
  },
  {
    name: "National Longitudinal Study of Adolescent to Adult Health",
    url: "https://addhealth.cpc.unc.edu/data/",
    aliases: ["National Longitudinal Study of Adolescent to Adult Health", "Add Health"],
    labels: ["longitudinal data analysis", "complex survey design", "missing data", "multilevel modeling"]
  },
  {
    name: "Clinical Practice Research Datalink",
    url: "https://cprd.com/data",
    aliases: ["Clinical Practice Research Datalink", "CPRD"],
    labels: ["risk prediction", "survival models", "longitudinal data analysis", "missing data"]
  }
];

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function slug(value) {
  return clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function abstractFromInvertedIndex(index) {
  if (!index) return "";
  const words = [];
  for (const [word, positions] of Object.entries(index)) {
    for (const position of positions) words[position] = word;
  }
  return clean(words.join(" "));
}

function textFor(work, seed) {
  return [work.title, work.abstract, seed.name, ...seed.aliases].join(" ").toLowerCase();
}

function scoreLabels(work, seed) {
  const text = textFor(work, seed);
  const seeded = seed.labels
    .filter((label) => label !== "missing data")
    .map((label) => ({ label, score: 3, evidence: [seed.name] }));
  const evidence = LABEL_REGISTRY.map((label) => {
    const hits = label.evidenceTerms.filter((term) => text.includes(term.toLowerCase()));
    return { label: label.name, score: hits.length, evidence: hits };
  }).filter((item) => item.score >= LABEL_RULES.scoreThreshold && labelAllowedByContext(item.label, text));

  const merged = new Map();
  for (const item of [...seeded, ...evidence]) {
    const current = merged.get(item.label);
    if (!current || item.score > current.score) merged.set(item.label, item);
  }

  return [...merged.values()]
    .filter((item) => LABEL_REGISTRY.some((label) => label.name === item.label))
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
    .slice(0, LABEL_RULES.maxLabelsPerPaper);
}

function labelAllowedByContext(label, text) {
  const hasAny = (terms) => terms.some((term) => text.includes(term));
  if (label === "heterogeneous treatment effects") {
    return hasAny([
      "heterogeneous treatment",
      "treatment heterogeneity",
      "conditional treatment",
      "individual treatment",
      "subgroup treatment"
    ]) || /\bcate\b|\bite\b/i.test(text);
  }
  if (label === "treatment effect estimation") {
    return hasAny(["treatment", "causal", "intervention", "potential outcome", "program evaluation"]);
  }
  if (label === "propensity score methods") {
    return hasAny(["propensity", "matching", "confounding", "observational treatment"]);
  }
  if (label === "quasi-experimental designs") {
    return hasAny(["regression discontinuity", "difference-in-differences", "instrumental variable", "natural experiment", "policy change"]);
  }
  if (label === "mcmc diagnostics") {
    return hasAny(["mcmc", "markov chain", "stan", "posterior simulation", "diagnostic"]);
  }
  if (label === "bayesian hierarchical models") {
    return hasAny(["bayesian", "posterior", "partial pooling"]);
  }
  if (label === "missing data") {
    return hasAny(["missing data", "imputation", "missingness", "nonresponse", "attrition", "mnar", "mar ", "mcar"]);
  }
  return true;
}

function hasDatasetMention(work, seed) {
  const text = `${work.title} ${work.abstract}`.toLowerCase();
  return seed.aliases.some((alias) => {
    const normalized = alias.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (/^[a-z0-9-]{2,6}$/i.test(alias)) {
      return new RegExp(`\\b${normalized}\\b`, "i").test(text);
    }
    return text.includes(alias.toLowerCase());
  });
}

function hasMethodSignal(work) {
  const text = `${work.title} ${work.abstract}`.toLowerCase();
  return [
    "model",
    "estimat",
    "predict",
    "imputation",
    "missing",
    "survey",
    "weight",
    "causal",
    "treatment",
    "survival",
    "hazard",
    "forecast",
    "longitudinal",
    "panel",
    "multilevel",
    "hierarchical",
    "regression"
  ].some((term) => text.includes(term));
}

async function fetchOpenAlex(url) {
  await sleep(REQUEST_DELAY_MS);
  const response = await fetch(url);
  if (response.status === 429) {
    await sleep(10000);
    return fetchOpenAlex(url);
  }
  if (!response.ok) throw new Error(`OpenAlex failed: ${response.status}`);
  return response.json();
}

async function writeCheckpoint(candidates, errors) {
  await mkdir(new URL("../data", import.meta.url), { recursive: true });
  await writeFile(
    OUTPUT_URL,
    `${JSON.stringify({ createdAt: new Date().toISOString(), target: TARGET, maxPages: MAX_PAGES, errors, candidates }, null, 2)}\n`
  );
}

async function searchSeed(seed, page) {
  const query = `${seed.aliases[0]} statistical model data`;
  const url = new URL("https://api.openalex.org/works");
  url.searchParams.set("search", query);
  url.searchParams.set("filter", "has_abstract:true,type:article,from_publication_date:2000-01-01");
  url.searchParams.set("sort", "cited_by_count:desc");
  url.searchParams.set("per-page", String(PER_PAGE));
  url.searchParams.set("page", String(page));
  url.searchParams.set("mailto", OPENALEX_MAILTO);
  const data = await fetchOpenAlex(url);
  return data.results || [];
}

function normalizeWork(raw, seed) {
  const work = {
    title: clean(raw.title || raw.display_name),
    abstract: abstractFromInvertedIndex(raw.abstract_inverted_index),
    authors: (raw.authorships || [])
      .map((authorship) => authorship.author?.display_name)
      .filter(Boolean)
      .slice(0, 6)
      .join(", "),
    year: raw.publication_year || null,
    citations: raw.cited_by_count || 0,
    paperUrl: raw.doi || raw.primary_location?.landing_page_url || raw.id,
    openalexUrl: raw.id
  };
  const labels = scoreLabels(work, seed);
  return {
    id: `oa-${slug(seed.name)}-${slug(work.title)}`,
    title: work.title,
    authors: work.authors || "Unknown authors",
    year: work.year,
    citations: work.citations,
    dataset: seed.name,
    datasetUrl: seed.url,
    paperUrl: work.paperUrl,
    access: "open-link",
    formats: ["public dataset", "article metadata"],
    properties: ["existing-dataset", "auto-discovered", "needs-review"],
    topics: labels.map((item) => item.label),
    bestFor: `Finding a ${seed.name} example for ${labels.map((item) => item.label).join(", ")}.`,
    note: `Auto-discovered with OpenAlex from dataset seed "${seed.name}". Review the abstract and dataset use before treating this as curated.`,
    discovery: {
      source: "openalex",
      openalexUrl: work.openalexUrl,
      labelEvidence: labels
    }
  };
}

const existing = JSON.parse(await readFile(new URL("../data/papers.json", import.meta.url), "utf8"));
const existingKeys = new Set(existing.map((paper) => (paper.paperUrl || paper.title).toLowerCase()));
const candidates = [];
const errors = [];

for (const seed of DATASET_SEEDS) {
  console.error(`Searching ${seed.name}...`);
  for (let page = 1; page <= MAX_PAGES && candidates.length < TARGET; page += 1) {
    try {
      const works = await searchSeed(seed, page);
      let added = 0;
      for (const raw of works) {
        const work = {
          title: clean(raw.title || raw.display_name),
          abstract: abstractFromInvertedIndex(raw.abstract_inverted_index)
        };
        const paperUrl = (raw.doi || raw.primary_location?.landing_page_url || raw.id || "").toLowerCase();
        if (!paperUrl || existingKeys.has(paperUrl)) continue;
        if (!hasDatasetMention(work, seed) || !hasMethodSignal(work)) continue;

        const normalized = normalizeWork(raw, seed);
        if (normalized.topics.length < LABEL_RULES.minLabelsPerPaper) continue;
        candidates.push(normalized);
        added += 1;
        existingKeys.add((normalized.paperUrl || normalized.title).toLowerCase());
        if (candidates.length >= TARGET) break;
      }
      console.error(`  page ${page}: +${added}, total ${candidates.length}`);
    } catch (error) {
      errors.push({ seed: seed.name, page, error: error.message });
      console.error(`  page ${page}: ${error.message}`);
    }
  }
  await writeCheckpoint(candidates, errors);
}

await writeCheckpoint(candidates, errors);

console.log(JSON.stringify({ target: TARGET, candidates: candidates.length, errors }, null, 2));
