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
    name: "regression discontinuity designs",
    level: "low",
    parents: ["quasi-experimental designs", "treatment effect estimation"],
    definition: "Datasets useful for sharp, fuzzy, dynamic, or bias-aware regression discontinuity designs.",
    includeWhen: [
      "regression discontinuity design, electoral threshold, cutoff-based assignment, fuzzy RD, sharp RD, or dynamic RD is central to the paper or replication resource",
      "the dataset or replication package is useful for estimating or teaching causal effects at an assignment cutoff"
    ],
    avoidWhen: [
      "a cutoff is mentioned only descriptively and not used as a regression discontinuity design"
    ],
    evidenceTerms: ["regression discontinuity", "fuzzy regression discontinuity", "sharp regression discontinuity", "rd design", "cutoff", "electoral threshold"]
  },
  {
    name: "instrumental variables",
    level: "low",
    parents: ["quasi-experimental designs", "treatment effect estimation"],
    definition: "Datasets and replication packages useful for instrumental-variable identification, weak-instrument analysis, local average treatment effects, or IV-based semiparametric causal estimation.",
    includeWhen: [
      "instrumental variables, weak instruments, LATE, two-stage least squares, Abadie kappa, or partial-linear IV methods are central to the paper or replication package",
      "the dataset or code supports empirical or simulation work for IV identification or inference"
    ],
    avoidWhen: [
      "instrumental language refers to measurement instruments rather than causal/econometric instrumental variables"
    ],
    evidenceTerms: ["instrumental variables", "instrumental variable", "weak instruments", "two-stage least squares", "2sls", "local average treatment", "abadie's kappa", "partial linear instrumental"]
  },
  {
    name: "difference-in-differences",
    level: "low",
    parents: ["quasi-experimental designs", "treatment effect estimation"],
    definition: "Datasets useful for difference-in-differences designs, including staggered adoption, group-time treatment effects, doubly robust DiD, event-study variants, or policy panels with treated and comparison units.",
    includeWhen: [
      "DiD identification, staggered treatment timing, parallel trends, event-study contrasts, or group-time treatment effects are central to the paper or resource",
      "the paper/package provides accessible examples, replication data, or code for DiD estimation"
    ],
    avoidWhen: [
      "the paper only uses a before-after comparison without a DiD design",
      "difference language is descriptive rather than referring to the DiD research design"
    ],
    evidenceTerms: ["difference-in-differences", "difference in differences", "difference-in-difference", "difference in difference", "generalized difference-in-difference", "diff-in-diff", "staggered adoption", "event study", "group-time average treatment effects", "parallel trends"]
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
    name: "resampling methods",
    level: "mid",
    parents: [],
    definition: "Datasets and replication packages useful for bootstrap, permutation, jackknife, or other resampling-based statistical inference examples.",
    includeWhen: [
      "bootstrap, permutation, jackknife, resampling-based confidence intervals, or resampling-based uncertainty quantification are central to the paper or resource",
      "the accessible data/code lets users reproduce resampling experiments, confidence regions, or related inference procedures"
    ],
    avoidWhen: [
      "bootstrap or permutation is only a minor robustness detail rather than a meaningful reason to use the dataset"
    ],
    evidenceTerms: ["bootstrap", "resampling", "permutation test", "permutation", "jackknife", "bootstrap confidence interval", "bootstrap confidence region"]
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
    name: "high-dimensional statistics",
    level: "high",
    parents: [],
    definition: "Datasets useful for statistical methods with many covariates or features, including high-throughput genomics, sparse modeling, regularization, variable selection, or p-greater-than-n examples.",
    includeWhen: [
      "the dataset has many predictors, genes, molecular features, image/pathology features, or other high-dimensional covariates central to the statistical question",
      "the paper or dataset is useful for sparse modeling, regularized regression, variable selection, penalized likelihood, or p-greater-than-n methodology"
    ],
    avoidWhen: [
      "the paper merely uses ordinary machine learning, classification, or prediction language without a high-dimensional-data or regularization focus",
      "the dataset is only a generic benchmark platform without evidence that high-dimensional structure is the reason a student would search for it"
    ],
    evidenceTerms: ["high-dimensional", "high dimensional", "p >> n", "p>n", "sparse", "sparsity", "lasso", "elastic net", "regularization", "regularized", "penalized", "variable selection", "genomics", "transcriptomic", "gene expression", "microarray"]
  },
  {
    name: "dimension reduction",
    level: "mid",
    parents: ["high-dimensional statistics"],
    definition: "Datasets useful for statistical dimension reduction, intrinsic dimension estimation, manifold learning, low-dimensional embeddings, or factor-structure examples in high-dimensional data.",
    includeWhen: [
      "dimension reduction, dimensionality reduction, intrinsic dimension estimation, manifold learning, low-dimensional embedding, PCA/factor models, or sufficient dimension-reduction methodology is central",
      "the paper or package provides accessible datasets, examples, or workflows for evaluating dimension-reduction methods"
    ],
    avoidWhen: [
      "visualization is incidental and no dimension-reduction methodology is central",
      "the paper merely uses an embedding inside a generic deep-learning system without a statistical dimension-reduction question"
    ],
    evidenceTerms: ["dimension reduction", "dimensionality reduction", "intrinsic dimension", "manifold learning", "embedding", "low-dimensional", "factor model", "principal component", "pca", "t-sne", "umap"]
  },
  {
    name: "functional data analysis",
    level: "mid",
    parents: ["high-dimensional statistics"],
    definition: "Datasets useful for statistical methods where curves, functions, images, or other high-/infinite-dimensional functional observations are modeled directly.",
    includeWhen: [
      "functional observations, function-on-function regression, scalar-on-function regression, functional principal components, Gaussian-process functional data models, or functional outlier detection are central",
      "the paper or package provides accessible examples, datasets, or workflows for functional data methods"
    ],
    avoidWhen: [
      "functional language is used informally and the data are ordinary vector predictors",
      "the paper only applies a generic model to time series without treating observations as functional data"
    ],
    evidenceTerms: ["functional data analysis", "functional regression", "function-on-function", "scalar-on-function", "functional principal components", "functional data", "functional outlier", "functional covariate", "functional observations"]
  },
  {
    name: "variable selection",
    level: "mid",
    parents: ["high-dimensional statistics"],
    definition: "Datasets useful for selecting relevant predictors or biomarkers in high-dimensional models, including sparse regression, lasso-type methods, subset selection, or Bayesian variable-selection examples.",
    includeWhen: [
      "the paper or dataset foregrounds variable selection, feature selection, biomarker selection, subset selection, lasso, sparse regression, or related high-dimensional predictor-selection methodology",
      "the dataset has accessible high-dimensional covariates or package examples specifically used to compare variable-selection procedures"
    ],
    avoidWhen: [
      "prediction is the goal but no variable-selection or sparse-modeling question is central",
      "feature importance is only a post-hoc interpretation of a generic prediction model"
    ],
    evidenceTerms: ["variable selection", "high-dimensional variable selection", "feature selection", "predictor selection", "biomarker selection", "subset selection", "variable and covariance selection", "sparse regression", "sparse", "lasso", "adaptive lasso", "elastic net", "penalized", "regularized", "spike-and-slab", "inclusion indicators", "pc-simple", "partial faithfulness", "p >> n", "p>n"]
  },
  {
    name: "best subset selection",
    level: "low",
    parents: ["variable selection", "high-dimensional statistics"],
    definition: "Datasets useful for exact or approximate best subset selection in regression, generalized linear models, Cox models, or related sparse model-selection problems.",
    includeWhen: [
      "best subset selection, L0-regularized sparse modeling, subset-size constrained regression, or related sparse model selection is central",
      "the paper or package provides accessible examples, simulations, tutorials, or datasets for best subset selection methods"
    ],
    avoidWhen: [
      "the paper only mentions selecting predictors generically without a subset-selection method",
      "the method is ordinary lasso or elastic net without a best-subset or L0-selection focus"
    ],
    evidenceTerms: ["best subset selection", "best-subset selection", "best subsets", "l0 regularization", "l0-regularized", "subset-size constrained", "l0 constrained", "L0Learn", "BeSS", "abess"]
  },
  {
    name: "graphical models",
    level: "mid",
    parents: ["high-dimensional statistics"],
    definition: "Datasets useful for probabilistic graphical models, Gaussian graphical models, Markov random fields, network-structured conditional dependence, or Bayesian graph-structure learning.",
    includeWhen: [
      "the paper or dataset centrally involves graphical models, conditional independence graphs, precision-matrix structure, Markov random fields, or Bayesian graph-structure learning",
      "the resource provides accessible examples, data, simulations, or software workflows for graph-structured statistical models"
    ],
    avoidWhen: [
      "graph language refers only to generic graph neural networks, graph databases, or visualization without a statistical graphical-model framework",
      "the paper is about application-domain networks without conditional-dependence or graphical-model methodology"
    ],
    evidenceTerms: ["graphical model", "graphical-model", "graphical models", "gaussian graphical model", "markov random field", "conditional independence", "conditional dependence", "precision matrix", "structure learning", "decomposable models", "chordal graph", "birth-death mcmc", "g-wishart", "undirected graph estimation"]
  },
  {
    name: "spatial statistics",
    level: "high",
    parents: [],
    definition: "Datasets useful for spatially structured statistical models, geostatistics, point processes, spatial random effects, or spatial dimension-reduction methods.",
    includeWhen: [
      "spatial location, spatial dependence, geostatistical structure, point-process events, or spatially structured latent factors are central to the statistical method",
      "the dataset supports spatial or spatio-temporal statistical modeling rather than merely containing place names or coordinates"
    ],
    avoidWhen: [
      "the paper only uses a geographic application domain without spatial statistical methodology",
      "spatial language is incidental and the dataset is mainly a generic prediction or computer-vision benchmark"
    ],
    evidenceTerms: ["spatial statistics", "geostatistics", "point process", "spatial random effects", "spatial factorization", "spatial dependence", "spatialized", "gridded", "kriging", "local indicators of spatial association", "spatio-temporal point process", "spatially explicit"]
  },
  {
    name: "risk prediction",
    level: "mid",
    parents: ["survival analysis"],
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
    name: "time series classification",
    level: "low",
    parents: ["time series analysis"],
    definition: "Datasets useful for classifying ordered time series, including univariate or multivariate time-series classification archives and benchmark collections.",
    includeWhen: [
      "the resource provides labeled time-series classification datasets or an archive/benchmark for comparing time-series classifiers",
      "classification of ordered series, rather than forecasting future values, is central"
    ],
    avoidWhen: [
      "the dataset is mainly for forecasting, anomaly detection, or generic sequence prediction rather than classifying complete time series",
      "the paper only uses time series as application data without a time-series classification benchmark or method"
    ],
    evidenceTerms: ["time series classification", "multivariate time series classification", "univariate time series classification", "classification archive", "time-series classification", "tsc"]
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
    name: "compositional data analysis",
    proposedLevel: "mid",
    proposedParents: [],
    status: "watch",
    definition: "Datasets useful for statistical analysis of compositional vectors or constrained proportions, including Bayesian compositional models.",
    currentEvidence: [
      {
        paperId: "openalex-W3217151720",
        reason: "Bayesian compositional single-cell data analysis with accessible scCODA code and example resources."
      },
      {
        paperId: "zenodo-15228007-oib-compositional-multivariate-statistics",
        reason: "Zenodo project code for compositional data analysis of ocean island basalt compositions using log-ratio transformations."
      }
    ],
    admitWhen: [
      "at least three high-confidence catalog records use accessible datasets for compositional-data methodology",
      "the label improves search beyond broader Bayesian inference or high-dimensional statistics labels",
      "the records involve compositional constraints or proportion vectors as a central statistical issue"
    ],
    evidenceTerms: ["compositional data", "compositional", "simplex", "log-ratio", "aitchison"]
  },
  {
    name: "synthetic control methods",
    proposedLevel: "low",
    proposedParents: ["quasi-experimental designs", "treatment effect estimation"],
    status: "watch",
    definition: "Datasets and replication packages useful for synthetic-control causal designs, including spillovers or multiple-outcome extensions.",
    currentEvidence: [
      {
        paperId: "zenodo-19066186-synthetic-control-spillover-effects",
        reason: "Replication package for identification and Bayesian inference for synthetic control methods with spillover effects."
      },
      {
        paperId: "zenodo-18931234-synthetic-controls-multiple-outcomes",
        reason: "Replication package for synthetic controls with multiple outcomes."
      }
    ],
    admitWhen: [
      "at least three high-confidence records provide accessible data/code for synthetic-control methodology",
      "synthetic control is central to the paper rather than a passing robustness comparison",
      "the label improves search beyond broader quasi-experimental designs"
    ],
    evidenceTerms: ["synthetic control", "synthetic controls", "synthetic-control"]
  },
];

export const LABEL_RULES = {
  minLabelsPerPaper: 3,
  maxLabelsPerPaper: 6,
  minimumReuseForNewLabel: 3,
  scoreThreshold: 2,
  newLabelCooldown: "Create no new label unless at least three candidate papers support it."
};
