export const LABEL_REGISTRY = [
  {
    name: "missing data",
    level: "mid",
    parents: [],
    definition: "Datasets useful for studying incomplete observations, missingness mechanisms, nonresponse, or imputation workflows.",
    includeWhen: [
      "the paper or dataset foregrounds missing data, imputation, nonresponse, attrition, incomplete records, or censoring-related missingness",
      "the dataset is commonly useful for missing-data methodology even if the paper is not only about imputation"
    ],
    avoidWhen: [
      "missingness is only an incidental nuisance and not a meaningful reason to use the dataset"
    ],
    evidenceTerms: ["missing", "imputation", "nonresponse", "attrition", "incomplete", "mnar", "mar", "mcar", "censoring"]
  },
  {
    name: "multiple imputation",
    level: "low",
    parents: ["missing data"],
    definition: "Datasets useful for evaluating or teaching multiple-imputation procedures for incomplete data.",
    includeWhen: [
      "the paper or dataset directly discusses imputation, missingness masks, missing-data mechanisms, or incomplete-data analysis"
    ],
    avoidWhen: [
      "the dataset merely has occasional missing values without an imputation-oriented research use"
    ],
    evidenceTerms: ["multiple imputation", "imputation", "missingness masks", "missing data", "mice", "mcar", "mar", "mnar"]
  },
  {
    name: "nonignorable missing data",
    level: "low",
    parents: ["missing data"],
    definition: "Datasets useful for MNAR, NMAR, nonignorable nonresponse, or value-dependent missingness research.",
    includeWhen: [
      "the paper explicitly discusses MNAR, nonignorable missingness, value-dependent missingness, or missing not at random"
    ],
    avoidWhen: [
      "the paper only covers generic missing data or MAR/MCAR settings"
    ],
    evidenceTerms: ["nonignorable", "mnar", "nmar", "missing not at random", "value-dependent", "not at random"]
  },
  {
    name: "causal inference",
    level: "high",
    parents: [],
    definition: "Datasets useful for causal-effect questions, potential-outcome reasoning, experiments, observational causal designs, or policy evaluation.",
    includeWhen: [
      "the paper or dataset is directly useful for causal effect estimation, randomized or quasi-experimental designs, confounding adjustment, or heterogeneous effects",
      "a more specific causal label is also assigned and the broader causal-inference view would help users compare datasets across designs"
    ],
    avoidWhen: [
      "causality is mentioned only rhetorically and the dataset is mainly descriptive or predictive"
    ],
    evidenceTerms: ["causal inference", "causal", "potential outcomes", "counterfactual", "treatment effect", "program evaluation", "policy evaluation", "intervention"]
  },
  {
    name: "treatment effect estimation",
    level: "mid",
    parents: ["causal inference"],
    definition: "Datasets useful for estimating causal treatment effects, including average, conditional, or individual effects.",
    includeWhen: [
      "the paper studies interventions, treatments, policy changes, experiments, or potential outcomes"
    ],
    avoidWhen: [
      "the paper is only predictive or descriptive without a treatment/control interpretation"
    ],
    evidenceTerms: ["treatment effect", "causal", "potential outcomes", "counterfactual", "program evaluation", "intervention"]
  },
  {
    name: "propensity score methods",
    level: "low",
    parents: ["treatment effect estimation"],
    definition: "Datasets useful for matching, weighting, or adjustment using propensity scores.",
    includeWhen: [
      "the dataset is a standard benchmark for matching, weighting, confounding adjustment, or observational treatment comparisons"
    ],
    avoidWhen: [
      "the dataset is randomized and propensity scores are not a central use case"
    ],
    evidenceTerms: ["propensity", "matching", "weighting", "observational", "confounding", "covariate adjustment"]
  },
  {
    name: "quasi-experimental designs",
    level: "mid",
    parents: ["causal inference"],
    definition: "Datasets useful for nonrandom causal designs such as natural experiments, regression discontinuity, difference-in-differences, or instrumental variables.",
    includeWhen: [
      "the dataset has a cutoff, instrument, policy change, natural experiment, or before-after comparison"
    ],
    avoidWhen: [
      "the paper is a randomized experiment or generic observational comparison without a quasi-experimental design"
    ],
    evidenceTerms: ["quasi-experimental", "regression discontinuity", "difference-in-differences", "instrumental variables", "natural experiment", "policy change", "cutoff", "lottery"]
  },
  {
    name: "heterogeneous treatment effects",
    level: "low",
    parents: ["treatment effect estimation"],
    definition: "Datasets useful for conditional, subgroup, individualized, or heterogeneous treatment-effect research.",
    includeWhen: [
      "the paper or benchmark is designed for CATE, ITE, subgroup effects, or effect heterogeneity"
    ],
    avoidWhen: [
      "the dataset only supports a simple average treatment effect use case"
    ],
    evidenceTerms: ["heterogeneous", "conditional treatment", "individual treatment", "cate", "ite", "subgroup"]
  },
  {
    name: "randomized experiments",
    level: "mid",
    parents: ["causal inference"],
    definition: "Datasets from randomized experiments, trials, lotteries, or randomized interventions.",
    includeWhen: [
      "random assignment, lottery assignment, randomized treatment, or clinical/field trial design is central"
    ],
    avoidWhen: [
      "the paper uses observational or quasi-experimental identification"
    ],
    evidenceTerms: ["randomized", "random assignment", "trial", "lottery", "experiment", "clinical trial"]
  },
  {
    name: "complex survey design",
    level: "mid",
    parents: ["survey methodology"],
    definition: "Datasets useful for stratification, clustering, sampling weights, design effects, or public-use survey microdata.",
    includeWhen: [
      "the dataset includes survey design variables, weights, strata, clusters, or public-use survey sampling documentation"
    ],
    avoidWhen: [
      "the data are simply collected by questionnaire without a complex sampling design"
    ],
    evidenceTerms: ["survey", "strata", "cluster", "sampling", "weights", "complex survey", "public-use microdata", "design"]
  },
  {
    name: "survey weighting",
    level: "low",
    parents: ["complex survey design"],
    definition: "Datasets useful for design weights, calibration, post-stratification, replicate weights, or weighted survey estimation.",
    includeWhen: [
      "weights, replicate weights, calibration, post-stratification, or weighted estimation are central to the dataset use"
    ],
    avoidWhen: [
      "the dataset has no documented weights or weighting use case"
    ],
    evidenceTerms: ["weights", "weighted", "survey weighting", "replicate weights", "calibration", "post-stratification"]
  },
  {
    name: "nonresponse adjustment",
    level: "mid",
    parents: ["survey methodology","missing data"],
    definition: "Datasets useful for unit nonresponse, item nonresponse, attrition adjustment, or response-bias correction.",
    includeWhen: [
      "nonresponse, attrition, response bias, or incomplete survey participation is a meaningful statistical issue"
    ],
    avoidWhen: [
      "nonresponse is not documented or not a realistic research focus"
    ],
    evidenceTerms: ["nonresponse", "non-response", "item nonresponse", "unit nonresponse", "attrition", "response bias"]
  },
  {
    name: "survey methodology",
    level: "high",
    parents: [],
    definition: "Datasets useful for survey sampling, survey weighting, nonresponse adjustment, small-area estimation, and design-based or model-assisted survey research.",
    includeWhen: [
      "the dataset has survey design, weighting, nonresponse, public-use microdata, or domain-estimation structure central to the statistical use",
      "a more specific survey label is also assigned and the broader survey-methodology view would help users compare related survey datasets"
    ],
    avoidWhen: [
      "the data were merely collected with a questionnaire but have no sampling-design or survey-methodology role"
    ],
    evidenceTerms: ["survey methodology", "survey", "sampling", "weights", "nonresponse", "small area", "design-based", "public-use microdata"]
  },
  {
    name: "small area estimation",
    level: "mid",
    parents: ["survey methodology"],
    definition: "Datasets useful for domain, subgroup, geographic, or under-sampled population estimation.",
    includeWhen: [
      "the dataset supports subgroup/domain/geographic estimates with survey data or public microdata"
    ],
    avoidWhen: [
      "the paper does not involve domains, areas, subpopulations, or geographic estimation"
    ],
    evidenceTerms: ["small area", "domain", "subgroup", "geographic", "population estimation", "under-sampled"]
  },
  {
    name: "longitudinal data analysis",
    level: "mid",
    parents: [],
    definition: "Datasets with repeated measurements over time on individuals, households, units, or cohorts.",
    includeWhen: [
      "the same units are followed over time, or repeated measures are central to the dataset"
    ],
    avoidWhen: [
      "the data are repeated cross-sections rather than repeated measurements on units"
    ],
    evidenceTerms: ["longitudinal", "repeated measures", "cohort", "followed", "waves", "trajectories", "over time"]
  },
  {
    name: "panel data methods",
    level: "low",
    parents: ["longitudinal data analysis"],
    definition: "Datasets useful for fixed effects, repeated unit-level observations, policy panels, or household/economic panels.",
    includeWhen: [
      "panel structure or fixed-effects style repeated unit analysis is a primary use"
    ],
    avoidWhen: [
      "the data are longitudinal but not naturally analyzed as panel data"
    ],
    evidenceTerms: ["panel", "fixed effects", "household", "economic trajectories", "before-after", "establishment"]
  },
  {
    name: "multilevel modeling",
    level: "mid",
    parents: [],
    definition: "Datasets useful for clustered, nested, hierarchical, random-effects, or mixed-effects models.",
    includeWhen: [
      "the dataset has nested units, clusters, schools, counties, classrooms, sites, families, or repeated measures"
    ],
    avoidWhen: [
      "there is no meaningful grouping or random-effects structure"
    ],
    evidenceTerms: ["multilevel", "hierarchical", "clustered", "nested", "random effects", "mixed effects", "school", "county", "classroom"]
  },
  {
    name: "survival models",
    level: "mid",
    parents: ["survival analysis"],
    definition: "Datasets useful for time-to-event modeling, censoring, Cox models, or clinical survival examples.",
    includeWhen: [
      "time-to-event outcomes, censoring, survival time, hazards, or event histories are central"
    ],
    avoidWhen: [
      "the dataset has time stamps but no time-to-event outcome"
    ],
    evidenceTerms: ["survival", "time-to-event", "censoring", "cox", "hazard", "event histories"]
  },
  {
    name: "survival analysis",
    level: "high",
    parents: [],
    definition: "Datasets useful for statistical analysis of time-to-event outcomes, censoring, hazards, event histories, or survival prediction.",
    includeWhen: [
      "time-to-event outcomes, censoring, hazards, or event histories are central to the dataset",
      "a more specific survival label is assigned and the broader survival-analysis view would help users compare datasets"
    ],
    avoidWhen: [
      "the data have dates or follow-up time but no event-time analysis use"
    ],
    evidenceTerms: ["survival analysis", "survival", "time-to-event", "censoring", "cox", "hazard", "event history"]
  },
  {
    name: "statistical learning",
    level: "high",
    parents: [],
    definition: "Datasets useful for supervised learning, machine-learning prediction, classification, regularized modeling, or benchmark prediction workflows in statistical research.",
    includeWhen: [
      "machine learning, supervised learning, classification, regularized prediction, or statistical-learning benchmarks are central to the paper or dataset",
      "the dataset supports methodological comparison across predictive learners rather than only one applied prediction model"
    ],
    avoidWhen: [
      "the paper only reports an ordinary prediction model without statistical-learning or machine-learning methodology"
    ],
    evidenceTerms: ["statistical learning", "machine learning", "supervised learning", "classification", "random forest", "support vector", "neural network", "deep learning", "lasso", "elastic net", "gradient boosting", "xgboost"]
  },
  {
    name: "risk prediction",
    level: "mid",
    parents: ["statistical learning","survival analysis"],
    definition: "Datasets useful for prognostic modeling, risk scores, clinical prediction, or prediction of future events.",
    includeWhen: [
      "the dataset is used for predicting disease, mortality, failure, or future event risk"
    ],
    avoidWhen: [
      "prediction is incidental and not the statistical research purpose"
    ],
    evidenceTerms: ["risk prediction", "prognostic", "prediction", "risk", "mortality", "clinical prediction"]
  },
  {
    name: "time series forecasting",
    level: "mid",
    parents: ["time series analysis"],
    definition: "Datasets useful for forecasting future values from ordered time series.",
    includeWhen: [
      "forecasting future values is the primary use, especially competition or benchmark time-series data"
    ],
    avoidWhen: [
      "the data are longitudinal panel data rather than forecasting series"
    ],
    evidenceTerms: ["forecast", "forecasting", "time series", "competition", "future values"]
  },
  {
    name: "time series analysis",
    level: "high",
    parents: [],
    definition: "Datasets useful for statistical analysis of ordered observations over time, including forecasting, temporal dependence, and benchmark time-series examples.",
    includeWhen: [
      "ordered temporal series, forecasting, temporal dependence, or time-series benchmark structure is central",
      "a more specific time-series label is assigned and the broader time-series view would help users compare datasets"
    ],
    avoidWhen: [
      "the data are longitudinal individual records rather than time-series methodology examples"
    ],
    evidenceTerms: ["time series analysis", "time series", "forecast", "forecasting", "temporal dependence", "autocorrelation"]
  },
  {
    name: "forecasting competitions",
    level: "low",
    parents: ["time series forecasting"],
    definition: "Datasets from organized forecasting competitions or benchmark collections used for comparing forecasting methods.",
    includeWhen: [
      "the dataset is explicitly from a forecasting competition, benchmark challenge, or established forecasting benchmark collection"
    ],
    avoidWhen: [
      "the paper merely forecasts an outcome but is not using a competition or benchmark-collection dataset"
    ],
    evidenceTerms: ["forecasting competition", "forecast competition", "competition", "challenge", "benchmark"]
  },
  {
    name: "hierarchical forecasting",
    level: "low",
    parents: ["time series forecasting"],
    definition: "Datasets useful for coherent forecasts across grouped, aggregated, or hierarchical time series.",
    includeWhen: [
      "the dataset includes hierarchical/grouped time series or forecast reconciliation use cases"
    ],
    avoidWhen: [
      "the data are ordinary independent time series without hierarchy"
    ],
    evidenceTerms: ["hierarchical forecasting", "forecast reconciliation", "hierarchical time series", "grouped time series"]
  },
  {
    name: "bayesian inference",
    level: "high",
    parents: [],
    definition: "Datasets useful for posterior modeling, Bayesian hierarchical analysis, Bayesian computation, or Bayesian methodological examples with accessible data.",
    includeWhen: [
      "the paper or dataset is directly useful for Bayesian posterior inference, Bayesian hierarchical modeling, posterior simulation, or Bayesian computation",
      "a more specific Bayesian label is also assigned and the broader Bayesian-inference view would help users compare datasets across Bayesian methods"
    ],
    avoidWhen: [
      "Bayesian terminology is incidental and the dataset is not useful for Bayesian methodology"
    ],
    evidenceTerms: ["bayesian inference", "bayesian", "posterior", "prior", "mcmc", "stan", "markov chain monte carlo", "bayesian hierarchical"]
  },
  {
    name: "mcmc diagnostics",
    level: "low",
    parents: ["bayesian inference"],
    definition: "Datasets useful for diagnosing Markov chain Monte Carlo behavior, posterior simulation quality, divergences, or sampling pathologies.",
    includeWhen: [
      "the dataset is used as a Bayesian computation example where posterior simulation, MCMC behavior, or diagnostics are central"
    ],
    avoidWhen: [
      "the paper is Bayesian but does not involve posterior simulation or computational diagnostics"
    ],
    evidenceTerms: ["mcmc", "markov chain", "posterior simulation", "diagnostics", "divergences", "stan", "sampling"]
  },
  {
    name: "bayesian hierarchical models",
    level: "mid",
    parents: ["bayesian inference","multilevel modeling"],
    definition: "Datasets useful for Bayesian multilevel, partial-pooling, hierarchical, or exchangeable-parameter models.",
    includeWhen: [
      "the dataset is a standard example for Bayesian hierarchical modeling or partial pooling"
    ],
    avoidWhen: [
      "the paper is generally Bayesian but not hierarchical or multilevel"
    ],
    evidenceTerms: ["bayesian hierarchical", "partial pooling", "hierarchical bayesian", "exchangeability", "stan", "posterior"]
  }
];

export const LABEL_CANDIDATES = [
  {
    name: "difference-in-differences",
    proposedLevel: "low",
    proposedParents: ["quasi-experimental designs", "treatment effect estimation"],
    status: "watch",
    definition: "Datasets useful for difference-in-differences designs, including staggered adoption, heterogeneity-robust DiD estimators, event-study variants, or policy panels with treated and comparison units.",
    currentEvidence: [
      {
        paperId: "card-krueger",
        reason: "Classic minimum-wage policy panel example with before/after treated and comparison units."
      },
      {
        paperId: "arxiv-2605.04124",
        reason: "Design-based variance estimation for heterogeneity-robust difference-in-differences estimators with explicit replication code/data."
      }
    ],
    admitWhen: [
      "at least three high-confidence catalog records have explicit DiD, event-study, or staggered-adoption use",
      "the records have accessible datasets or replication data/code, not only methodological discussion",
      "the label improves search beyond the existing quasi-experimental designs parent label"
    ],
    evidenceTerms: ["difference-in-differences", "difference in differences", "diff-in-diff", "event study", "staggered adoption"]
  }
];

export const LABEL_RULES = {
  minLabelsPerPaper: 3,
  maxLabelsPerPaper: 6,
  minimumReuseForNewLabel: 3,
  scoreThreshold: 2,
  newLabelCooldown: "Create no new label unless at least three candidate papers support it."
};
