# Statistics catalog discovery sidecar: 2026-11-24

## Discovery summary

The broad API pass returned **1,954 raw candidates**, reduced to **1,633 unique records** and **1,572 records novel to the 2,292-paper catalog**. The pass rotated across Bayesian computation, missing data and nonresponse, record linkage and disclosure control, meta-analysis, survey methods, causal/econometric methods, and forecasting.

The artifact-level review pool contained **7 candidates with clear dataset sources**. Six passed metadata, access, and novelty checks and were added; one passed the data-source checks but was rejected as a duplicate already in the catalog. Thus the pipeline counts are **1,954 raw, 1,633 unique, 1,572 novel, 7 reviewed high-confidence resources, 7 with clear dataset sources, and 6 added**.

| Source | Raw | Unique | Novel |
|---|---:|---:|---:|
| OpenAlex | 560 | 550 | 523 |
| Crossref | 420 | 361 | 351 |
| Harvard Dataverse | 420 | 248 | 230 |
| DataCite | 353 | 283 | 280 |
| Figshare | 171 | 164 | 163 |
| Semantic Scholar | 30 | 27 | 25 |

Semantic Scholar returned HTTP 429 for 25 of 28 queries, while three queries succeeded and supplied 30 raw records. Zenodo returned HTTP 403 for all 28 queries and therefore contributed no counted API records. DataCite and manual first-party repository checks retained repository breadth without treating failed endpoints as successful coverage.

## Accepted records

All six records below were absent by normalized title, paper DOI, dataset URL, and repository identifier. Paper metadata was checked against Crossref, and resource access was verified from the first-party Figshare or Harvard Dataverse record. Label recommendations use only current official labels.

### Bayesian Semiparametric Multivariate Density Deconvolution

- **Authors/year:** Abhra Sarkar, Debdeep Pati, Antik Chakraborty, Bani K. Mallick, Raymond J. Carroll (2018 issue; published online 2017)
- **Paper:** [10.1080/01621459.2016.1260467](https://doi.org/10.1080/01621459.2016.1260467)
- **Data:** [Taylor & Francis Figshare 5596492](https://tandf.figshare.com/articles/dataset/Bayesian_Semiparametric_Multivariate_Density_Deconvolution/5596492)
- **Verified artifacts:** the first-party record returned HTTP 200 and links the paper DOI. `Software.zip` was inspected directly and contains five R programs, four `MVT_Decon_HTR_Initial_Values_*.RData` files, `Simulated_Data_Set.RData`, and a README describing that simulated dataset; the record also provides the supplementary PDF.
- **Labels:** `density estimation`, `measurement error models`, `bayesian inference`, `bayesian nonparametric methods`.

### Bayesian Semiparametric Density Deconvolution in the Presence of Conditionally Heteroscedastic Measurement Errors

- **Authors/year:** Abhra Sarkar, Bani K. Mallick, John Staudenmayer, Debdeep Pati, Raymond J. Carroll (2014)
- **Paper:** [10.1080/10618600.2014.899237](https://doi.org/10.1080/10618600.2014.899237)
- **Data:** [Taylor & Francis Figshare 976116](https://tandf.figshare.com/articles/dataset/Bayesian_Semiparametric_Density_Deconvolution_in_the_Presence_of_Conditionally_Heteroscedastic_Measurement_Errors/976116)
- **Verified artifacts:** the first-party record returned HTTP 200 and links the paper DOI. Its unrestricted inventory contains `Data_similar_to_FOLATE_from_EATS.csv`, `bayesdeconvfuncts.R`, `deconvolution_Bayes.R`, `ReadMe.txt`, and `BayesDecon_SupplementaryFiles.pdf`.
- **Labels:** `density estimation`, `measurement error models`, `bayesian inference`, `bayesian nonparametric methods`.

### Bayesian Semiparametric Analysis of Multivariate Continuous Responses, With Variable Selection

- **Authors/year:** Georgios Papageorgiou, Benjamin C. Marshall (2020)
- **Paper:** [10.1080/10618600.2020.1739534](https://doi.org/10.1080/10618600.2020.1739534)
- **Data:** [Taylor & Francis Figshare 11973537](https://tandf.figshare.com/articles/dataset/Bayesian_Semiparametric_Analysis_of_Multivariate_Continuous_Responses_With_Variable_Selection/11973537)
- **Verified artifacts:** the first-party record returned HTTP 200 and links the paper DOI. Direct inspection of `ucgs_a_1739534_sm3253.zip` found `DataExamples/AMI.R`, `DataExamples/Marks.R`, `DataExamples/Simulation.R`, `BNSP_2.1.1.tar.gz`, and `Supplement.pdf`.
- **Labels:** `bayesian inference`, `bayesian nonparametric methods`, `variable selection`, `mixture models`, and the required `high-dimensional statistics` parent added by the catalog relabeler.

### BIVAS: A Scalable Bayesian Method for Bi-Level Variable Selection With Applications

- **Authors/year:** Mingxuan Cai, Mingwei Dai, Jingsi Ming, Heng Peng, Jin Liu, Can Yang (2020 issue; published online 2019)
- **Paper:** [10.1080/10618600.2019.1624365](https://doi.org/10.1080/10618600.2019.1624365)
- **Data:** [Taylor & Francis Figshare 8243270](https://tandf.figshare.com/articles/dataset/BIVAS_A_Scalable_Bayesian_Method_for_Bi-Level_Variable_Selection_With_Applications/8243270)
- **Verified artifacts:** the first-party record returned HTTP 200 and links the paper DOI. Direct inspection of `ucgs_a_1624365_sm1740.zip` found `BVIAS_BSGS.R`, `MCMC.R`, `EMVS.R`, `BIVAS_FE.R`, `BIVAS_weak_signal.R`, `multi-task.R`, `BF_largeRho.R`, and `bi-level.R`; the record also contains `ucgs_a_1624365_sm1756.pdf`.
- **Labels:** `bayesian inference`, `variational inference`, `variable selection`, `high-dimensional statistics`.

### A Meta-Analysis of Country-Level Studies on Environmental Change and Migration

- **Authors/year:** Roman Hoffmann, Anna Dimitrova, Raya Muttarak, Jesus Crespo Cuaresma, Jonas Peisker (2020)
- **Paper:** [10.1038/s41558-020-0898-6](https://doi.org/10.1038/s41558-020-0898-6)
- **Data:** [Harvard Dataverse DVN/HYRXVV](https://doi.org/10.7910/DVN/HYRXVV)
- **Verified artifacts:** the first-party Dataverse API returned HTTP 200. All four files are unrestricted: `Environmental Change and Migration_Code File.R`, `Environmental Change and Migration_Country Level Data.xlsx`, `Environmental Change and Migration_Main Meta Data.xlsx`, and `Environmental Change and Migration_Meta and Country Data.rdata`.
- **Labels:** `meta-analysis`; retain `needs-label-review` rather than add an application-domain label.

### The Expectancy-Disconfirmation Model and Citizen Satisfaction with Public Services: A Meta-Analysis and an Agenda for Best Practice

- **Authors/year:** Jiasheng Zhang, Wenna Chen, Nicolai Petrovsky, Richard M. Walker (2021)
- **Paper:** [10.1111/puar.13368](https://doi.org/10.1111/puar.13368)
- **Data:** [Harvard Dataverse DVN/RLP0UE](https://doi.org/10.7910/DVN/RLP0UE)
- **Verified artifacts:** the first-party Dataverse API returned HTTP 200. The unrestricted inventory contains `EDT Meta Analysis R Code.R` and ten study-input tables: `A.tab`, `B.tab`, `C.tab`, `C1.tab`, `D.tab`, `D1.tab`, `E.tab`, `E1.tab`, `F.tab`, and `F1.tab`.
- **Labels:** `meta-analysis`; retain `needs-label-review` rather than add an application-domain label.

## Duplicate decisions and rejections

- **Rejected as an existing catalog record:** *Record Linkage for Character-Based Surnames: Evidence from Chinese Exclusion* (paper DOI [10.1016/j.eeh.2022.101493](https://doi.org/10.1016/j.eeh.2022.101493), Dataverse [DVN/LWPOJQ](https://doi.org/10.7910/DVN/LWPOJQ)). Its replication archive is valid and unrestricted, but the paper and archive are already represented in the catalog.
- **Retained after fuzzy-title review:** the 2017 multivariate density-deconvolution paper is related to the catalog's 2022 *Bayesian Semiparametric Covariate Informed Multivariate Density Deconvolution*, but is not a duplicate. The records have different paper DOIs (`10.1080/01621459.2016.1260467` versus `10.1080/10618600.2022.2060239`), different Figshare archives (5596492 versus 19497645), different authorship, and distinct software and simulation resources.
- **Not accepted from the broad pool:** discovery metadata alone did not establish a paper-connected, accessible dataset or replication artifact. Candidates were also excluded when required bibliographic metadata was incomplete or when exact/fuzzy checks found an existing catalog record.

## Why only six are accepted

The 1,572 novel discovery records are a screening pool, not 1,572 verified dataset papers. This run accepted only the six records for which the paper identity, first-party resource relationship, access status, concrete file inventory, and catalog novelty were all verified. Semantic Scholar rate limiting and complete Zenodo API denial reduced API-level follow-through, while the independent sidecar search ended before producing additional artifact-verified records. The quota was not padded with paper-only pages, repository records lacking a confirmed paper relationship, unverifiable supplements, or duplicates. No new or promoted label is supported by this six-record batch.

## Catalog integration and label health

- The catalog now contains 2,298 records. Both relabel passes completed successfully; the first added one required `high-dimensional statistics` parent and the second made zero changes.
- `assess-labels.mjs` reports 82 registry labels and 82 active labels, with no registry hierarchy issues, underused official labels, unknown labels, wrong label counts, weak assignments, or candidate labels.
- No label was created, changed, promoted, or added to `LABEL_CANDIDATES`. The candidate-label registry remains empty, so no candidate is close to promotion.
- The batch most affected `bayesian inference` (+4), `bayesian nonparametric methods` (+3), and `meta-analysis` (+2). Density estimation, measurement error models, high-dimensional statistics, and variable selection each gained two records; mixture models and variational inference each gained one.
- Independent catalog checks found no new duplicate ID, normalized title, paper URL, or missing required field. All six additions have review flags, known official labels, and complete direct-parent relationships.
- Pre-existing catalog debt remains: four normalized-title duplicate groups, 14 records with no topics, and 323 missing direct-parent assignments across 313 older records. The `survival models` and `survival analysis` assignments also remain nearly redundant (Jaccard approximately 0.97). These concerns were not introduced or expanded by this batch.

Basic validation passed for JSON parsing, module syntax, relabel idempotence, label assessment, and `git diff --check`. All six dataset-resource URLs returned successful responses. Five publisher landing pages returned HTTP 403 after their DOI redirects resolved successfully; their paper identities were separately confirmed through Crossref and the first-party resource metadata.
