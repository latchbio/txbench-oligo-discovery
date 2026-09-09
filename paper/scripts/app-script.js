
(function(){
  const NS = "http://www.w3.org/2000/svg";
  function el(tag, attrs){
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svgOf(id){ return document.getElementById(id); }

  // =====================================================================
  // EDITABLE TEXT STATE — every value here is HTML that renders verbatim.
  // This object is the single source of truth for the page's prose; the
  // template below (buildSheetHtml) is re-run from it on every publish,
  // so the published document never comes from serializing the live DOM.
  // =====================================================================
  const DEFAULT_STATE = {
    title: "TxBench-Oligonucleotide Discovery",
    authors: "Martin Jacko, Jackson Brougher, Alex Urrutia, Hannah Le, Arjun Banerjee, Dillon Flood, Kenny Workman&nbsp;<span class=\"mono\" style=\"font-size:11.5px;color:var(--ink-mute)\"><br>[author list to confirm]A</span>",
    affil: "LatchBio, San Francisco, CA, USA",
    subtitle: "Benchmarking AI Agents on Experimentally Grounded Decisions Discovery of&nbsp; ASO/siRNA Therapeutics",
    abstract: "Artificial intelligence (AI) agents promise to accelerate drug discovery by compressing interpretation and decision-making loops, but practical deployment requires trusted evaluation on realistic program decisions. We introduce TxBench-Oligonucleotide Discovery, a verifiable benchmark of 113 evaluations&nbsp; that tests whether AI agents, working with no internet access, can recover these decisions from&nbsp; experimental data that would be available to a scientist. Each evaluation is derived from a published or internally curated ASO or siRNA study and graded deterministically against a decision reconstructed from its underlying data, across a 10-section taxonomy spanning target feasibility and drug library design, in vitro pharmacology and safety, and translational readiness. Across the full campaign with 21 model–harness configurations spanning 12 models and 4 execution harnesses, agents passed 38.5% of valid grading runs (2,730/7,098). The strongest configuration was GPT-6 Astra on OpenAI Codex that passed 55.5% of endpoint attempts (95% CI 47.2–63.7). As drug discovery programs increasingly rely on AI-assisted analysis, these results underscore the practical stakes and the corresponding need for benchmarks like this one to track real capability before broader deployment. Model rankings also vary substantially by evaluation, so no single configuration is uniformly reliable across the ASO/siRNA discovery pipeline, cautioning against deploying any one model as a general-purpose scientific collaborator without task-level validation.",
    introP1: "Progress in a drug discovery program is driven by an intertwined series of assay results converted into go/no-go calls. At the discovery stage, oligonucleotide therapeutics are designed and characterized across incommensurable types of preclinical work from target and sequence selection, chemical modifications, delivery-format design, in vitro potency, off-target profiling, and phenotypic rescue to animal testing of safety/tolerability, pharmacokinetics, pharmacodynamics, and biodistribution. The correct interpretation often depends on information the measurement itself does not explicitly point to. For example, whether an off-target hit reflects seed-mediated silencing or a hybridization-independent, chemistry-driven effect; whether a hepatotoxicity signal is caused by phosphorothioate backbone loading rather than a specific sequence motif; whether a loss of in vivo knockdown durability reflects target re-expression rather than a decline in oligonucleotide exposure. Each of these problems requires a multi-factorial analysis with&nbsp;deep domain expertise&nbsp;to reach a&nbsp;judgment. Getting it wrong can advance an unsafe candidate, discard a viable one, or misdirect the next round of experiments, producing&nbsp; a major capital and time inefficiency and ultimately resulting in a missed opportunity to produce a therapeutic product with a positive social impact through extension or improved quality of life.",
    introP2: "A decision-centered evaluation of AI agents has a precedent in a line of benchmarks from LatchBio. TxBench-PP evaluated whether AI agents could recover consequential decisions from small-molecule preclinical pharmacology data, finding that the strongest model–harness configuration, Claude Opus 4.8 on Pi, passed 59.3% of attempts and that most failures reflected scientific judgment rather than computational error. TxBench-Antibody extended the same approach to therapeutic antibody discovery across ten competencies, finding an almost identical pattern: the best configuration, Claude Opus 5 on Claude Code, passed 53.0% of attempts, 82.3% of failures traced to drug-discovery interpretation rather than method or metric errors, and model rankings reversed across competencies, decision types, and evidence sources. VariantBench applied the same construction discipline to genetic variant discovery and interpretation, finding that no model–harness pair exceeded a 50% pass rate across 118 evaluations, and that agents were proficient at running routine pipelines but struggled to adjust their analysis to what the data actually showed.",
    introP3: "TxBench-Oligonucleotide Discovery extends this line of work to oligonucleotide therapeutics, a modality that sits methodologically between small-molecule pharmacology and monoclonal antibody discovery but carries its own class of decision: chemistry-versus-sequence attribution, seed-region off-target liability, compartment- and delivery-route-specific efficacy claims, and the discovery-to-translation arc particular to ASOs and siRNAs. Existing LLM evaluations in this modality have so far targeted a single predictive endpoint, efficacy from sequence (Sundar 2026); TxBench-Oligonucleotide Discovery instead grades the full decision an agent reaches from staged experimental evidence, across the entire discovery-to-translation arc rather than one prediction task. As in the three related benchmarks, every TxBench-Oligonucleotide Discovery evaluation is grounded in real experimental data, requires a structured and deterministically gradable answer, and is built to test whether the <i>decision</i> a scientist would make from that data is scientifically defensible.",
    constrP1: "TxBench-Oligonucleotide Discovery evaluations are built by independently reconstructing a consequential research decision from ASO/siRNA experimental datasets from published articles or patents. As in other&nbsp; TxBench-lineage benchmarks, construction proceeds by identifying a genuine decision point in the source study, staging the subset of data an agent would actually have access to at that point, and grading the terminal decision, not the intermediate arithmetic, deterministically.",
    constrP2: "The current approved set comprises 113 evaluations drawn from 20+ discovery programs and ASO Atlas 2.0 (Hill 2026). The individual research studies are spanning chemistry and knockdown catalogs, off-target profiling series (Kuijper 2025; Holgersen 2021), a hepatotoxicity sequence-screen series (Burdick 2014), duplex biophysics and dose-response panels (Hagedorn 2018), phosphorothioate-backbone protein-binding studies (Vickers 2019), subcellular-fractionation and RNA-FISH mechanism studies (Didiot 2018), a CNS-directed SOD1 ASO program (McCampbell 2018), splice-correction and isoform-quantification studies (Guo 2025; Klim 2019), myotonic-dystrophy off-target studies (Wheeler 2012; Elboujnouni 2023), two KCNT1 studies (a locus-resolution off-target study, Golinski 2026, and a divalent-siRNA seizure-suppression study, Andreone 2025), a tissue-pharmacokinetics study (Backstrom 2024), a 2′-fluoro ASO hepatotoxicity study (Shen 2018), an oligonucleotide cytotoxicity-chemistry study (Janas 2017), an siRNA off-target-specificity study (Lee 2015), and a CACNA1C splice-modulating ASO study for Timothy syndrome (Chen 2024), alongside disease-specific programs targeting ATXN2, MAPT, MDT1, Huntington's disease, STMN2, and KCNT1.",
    anatomyP1: "TxBench-Oligonucleotide Discovery organizes its 113 evaluations along the Oligo-Discovery-TxBench taxonomy, a 10-section scale spanning three tiers of the discovery-to-translation arc: target feasibility and library design (§1–§3), in vitro pharmacology and safety (§4–§6), and translational readiness (§7–§10) (Figure 1A). Coverage is deliberately non-uniform and focuses on stages with key data-driven decisions. Sequence and physicochemical design (§2), chemistry evaluation (§3), and off-target profiling and cytotoxicity (§6) are all well represented in the earlier and middle tiers. Coverage skews further downstream still: preclinical safety and toxicology (§8) and in vivo PK/PD and biodistribution (§9) together account for 41 of 113 evaluations while candidate benchmarking (§10) sits at a two-evaluation floor.",
    anatomyP2: "A second, coarser decision-structure classification tags each evaluation by the scientific operation or judgment its passing answer requires, rather than its position in the discovery pipeline (Figure 1B). Safety assessment (32 evaluations) is the largest category, followed by target pharmacology (19, pooling target engagement, target validity, and mechanism-of-action calls), specificity assessment (18, pooling selectivity profiling with differential expression and response), and PK/PD characterization (14, pooling dose-response and exposure/PK analyses); program-level integration (12), a supporting-analysis category (10, pooling secondary analysis, cheminformatics, QC, and normalization tasks), and lead identification (8, pooling biomarker discovery and hit prioritization) round out the remaining evaluations. This scheme parses the same evaluations along a different axis than the §1–§10 taxonomy. Pipeline stage tracks when a decision occurs, decision structure tracks what kind of judgment it demands, allowing difficulty attributable to the kind of judgment required be distinguished from difficulty attributable to pipeline position.",
    cap1a: "<b>N=113.</b> §8–§9 hold 36% of the set; §10 sits at the coverage floor. Circle area ∝ evaluation count.",
    cap1b: "Decision-structure labels; sorted by count, not pipeline order.",
    cap1c: "The all-must-pass conjunction is a composition wrapper, not a boolean pass/fail check.",
    cap1d: "N=113. Evaluations grouped by the primary evidence and analysis family their underlying dataset draws from.",
    fig1Caption: "<b>Figure 1: Benchmark anatomy.</b> <b>A,</b> Discovery-decision-path labels place each evaluation along the ten-section taxonomy (§1–§10, tiers as legend); circle area is proportional to evaluation count. <b>B,</b> Decision-structure labels classify each evaluation by the scientific operation or judgment its passing answer requires, independent of pipeline position. <b>C,</b> Assay-and-evidence-type labels summarize the principal data and analytical family each evaluation's underlying dataset is built from. <b>D,</b> Evaluations grouped by the disease or biological context named in their own task text; a lower bound on true indication-specific coverage, since some evaluations describe their subject without repeating the disease name explicitly. <b>E,</b> Evaluations grouped by the specific gene target named in their own task text; likewise a lower bound on true target-specific coverage. <b>F,</b> Evaluations grouped by the tissue, organ, or cultured cell type their underlying dataset was generated in, assigned to the single most prominent tissue named where more than one is mentioned; also a lower bound, with minor named categories (cerebrospinal fluid, blood/plasma, fibroblast) pooled into ‘Other named tissue.’",
    validP1: "<span class=\"subhead\">Two lens families generate evaluation ideas side by side.</span> A lens is a structured idea-generation heuristic used during construction to surface candidate evaluation ideas, either by mining a source paper directly or by targeting domain-specific judgment calls. TxBench-Oligonucleotide Discovery draws on two such families during construction (Figure 2A): nine General lenses (decision-mining, figure-recreation, surprises-mining, cross-source-mining, certified-references-match, skill-mining, literature-sweep, interview-questions, and trap-alignment) that mine a source paper's Methods, figures, and Results directly, and a three-lens oligo-specific pack (Key Program Decisions &amp; Technical Judgement, Drug Development Pitfalls and Optimization, ASO/siRNA Quiddity) built for oligonucleotide-specific judgment calls, including the ASO Atlas programs that have no single source paper to mine. Both families feed the same pool of candidate evaluation ideas, alongside direct construction from primary data; no per-evaluation record of which lens, if any, inspired a given evaluation is kept.",
    validP2: "Because lens origin is not recorded per evaluation, coverage is instead estimated by backwards-mapping: evaluations are deep-read after construction and matched to the lens they most plausibly originated from (Figure 2B). The three oligo-specific lenses show strong matches to 54 evaluations for Key Program Decisions &amp; Technical Judgement and 19 each for Drug Development Pitfalls and Optimization and ASO/siRNA Quiddity; a residual General slice (21 evaluations) stands in for evaluations traceable to the General lenses or direct construction rather than the oligo-specific pack. Because the three named lenses' matches are not mutually exclusive (a single evaluation can match more than one), the General slice is an upper bound on General-only coverage, not an exact count.",
    validP3: "The Key Program Decisions &amp; Technical Judgement lens (twelve categories of real development judgment calls, from target selection through regulatory strategy) accounts for the largest matched share of the three oligo-specific lenses. Its matched evaluations break down across nine of the lens's twelve categories (Figure 2C): dose selection and PK/PD decisions is the largest, followed by sequence and chemistry design and toxicology and safety judgement calls.",
    validP4: "Every evaluation is graded by a deterministic, multi-part grader rather than a single tolerance check (Figure 2D), assembled from leaf checks: atomic, single-criterion checks, as distinct from a composition wrapper that combines multiple checks into one verdict. Boolean pass/fail gates (119 instances) and numeric-range bands (96) are the two most common leaf types, typically composed under an all-must-pass conjunction (77 instances), which requires a correct answer on each component for an agent to pass, mirroring real-life decision outcomes in drug discovery. Label-set overlap scores, symmetric numeric-tolerance windows, marker-gene precision/recall floors, per-key dictionary matches, and a single ordered-sequence match check round out the remaining grader vocabulary.",
    cap2a: "<b>Subset/scope/compartment</b> dominates by a wide margin.",
    cap2b: "Zero-count rows are later-stage benchmark territory, not gaps in this set.",
    cap2c: "Post-hoc, inferred read, not ground truth.",
    fig2Caption: "<b>Figure 2: Construction lenses and failure-mode design.</b> <b>A,</b> Idea-generation lens library: nine General lenses that mine a source paper's Methods, figures, and Results directly, plus a three-lens oligo-specific pack for oligonucleotide-specific judgment calls; both feed the same construction pipeline, and no per-evaluation record of originating lens is kept. <b>B,</b> Backwards-mapped strong-match counts across the three oligo-specific lenses, plus a residual General slice, summing to all 113 evaluations; matches are not mutually exclusive, so the General slice is an upper bound. <b>C,</b> Backwards-mapped alignment to the Key Program Decisions &amp; Technical Judgement lens categories for the matched evaluations; categories with no match are omitted. <b>D,</b> Grader-type usage across all graders in the 113 evaluations; the all-must-pass conjunction is a composition wrapper, not a boolean pass/fail check. <b>E,</b> Per-evaluation failure-mode tags, populated on 55 of 113 evaluations (170 tag instances).",
    validNote: "<b>Design note.</b> The lenses are implemented in construction, not a post-hoc audit. Following the philosopher of science Michael Polanyi's observation that expert judgment is only partly formalizable (Polanyi 1966): a benchmark author cannot fully enumerate in advance every scientifically consequential decision to probe, but structured idea-generation lenses surface those decisions during construction so they can become graded evaluations.",
    validP5: "<span class=\"subhead\">Failure modes are tagged directly at construction, not inferred after the fact.</span> A per-evaluation failure-mode taxonomy tags each evaluation with its trap: a specific scientific failure mode a grader is deliberately built to catch, tagged at construction time rather than inferred afterward (Figure 2E). This field is populated on 55 of 113 evaluations (170 tag instances) and is dominated, by a wide margin, by subset/scope/compartment errors: picking the wrong biological subset, comparator, or baseline rather than making an arithmetic mistake. Batch/condition/platform comparability, metric/statistic mismatch, and replicate/unit-of-analysis errors follow; causal/epistemic overreach, biological interpretation, and normalization/representation errors contribute roughly equal shares, with QC/control-artifact, marker/reference/label-scope, and threshold/resolution-instability errors filling out the remainder. This distribution closely mirrors the failure taxonomies reported for TxBench-Antibody (scope/denominator/estimand errors: 34.7% of evaluable failures) and TxBench-PP (method and calibration errors: 71% of reviewed failures), suggesting this may be a cross-modality attractor for agent failure in decision-centered biology benchmarks generally.",
    fig3P1: "<span class=\"subhead\">No configuration exceeds 56% of endpoint attempts.</span> The full campaign covers 113 evaluations across 21 model-harness configurations (12 models &times; 4 execution harnesses: Pi, Claude Code, OpenAI Codex, Grok Build), for 7,098 valid grading runs, with agents working in a sandboxed environment with no internet access. Pass rate is defined per evaluation as correct results over valid grading runs, then averaged across evaluations per configuration; error bars are 95% Student-t intervals over those per-evaluation means, matching the convention used in TxBench-PP and TxBench-Antibody. The strongest configuration, GPT-6 Astra on OpenAI Codex, passed 55.5% of endpoint attempts (95% CI 47.2&ndash;63.7); pooled across every configuration, agents passed 38.5% of valid grading runs (2,730/7,098) (Figure 3A).",
    fig3P2: "Repeatability across the three attempts per evaluation (Figure 3B) shows the same pattern reported for TxBench-PP and TxBench-Antibody: a configuration that fails once usually fails all three times rather than splitting evenly, and the strongest configurations still fail all three attempts on roughly a third of evaluations (34&ndash;36%).",
    fig3P2b: "<span class=\"subhead\">Three evaluations were excluded from a configuration's denominator by content refusal.</span> Trajectory review traces these failures to Anthropic's own API-level content-safety classifier refusing mid-conversation (api_refusal_category: 'bio'), not to a sandbox, tooling, or grading defect. The refusal is checkpoint-specific: claude-opus-4-8 and claude-sonnet-5 refuse on a majority of attempts on some of these evaluations and rarely or never on others, while claude-opus-5 never refuses on any of them despite evaluating identical prompts and data. Because refusal tracks the specific checkpoint rather than the underlying, benign task content, these evaluations were removed from the affected configurations' denominators rather than scored as incorrect.",
    fig3P3: "<span class=\"subhead\">Harness choice shows a consistent home-field pattern for Claude, but not for GPT.</span> Matched Pi-vs-alternate-harness comparisons (Figure 3C) are available for nine of the twelve models (the three Gemini configurations and Grok 4.5 were only run on Pi). All three Claude checkpoints score higher on Claude Code than on Pi (Opus 5: 42.2% vs. 48.1%, &Delta;=&minus;5.9; Sonnet 5: 36.2% vs. 39.3%, &Delta;=&minus;3.1; Opus 4.8: 39.3% vs. 39.6%, &Delta;=&minus;0.4), a uniform advantage for the family's own harness, though the size of that advantage varies considerably. GPT shows no equivalent pattern: GPT-6 Astra and GPT-5.6-luna score marginally higher on OpenAI Codex (&Delta;=&minus;2.1 and &minus;0.6), while GPT-5.6-sol, GPT-5.5, and GPT-5.6-terra score higher on Pi instead (&Delta;=+4.4, +3.2, +0.9); three of five GPT configurations favor the non-native harness. The one available Grok comparison, Grok 4.6, also favors Pi over its own Grok Build harness (&Delta;=+1.2). Across all nine comparisons the mean absolute shift is 2.4 points (median 2.1), bounded by Claude Opus 5 (&minus;5.9) and GPT-5.6-sol (+4.4) at the extremes; each configuration's own 95% CI is wide enough to overlap the other harness's point estimate in every one of the nine pairs, so none of these differences should be read as a settled reversal, only as evidence that harness is a real, if second-order, source of variance in reported pass rate.",
    fig3Caption: "<b>Figure 3: Endpoint pass rate and repeatability.</b> <b>A,</b> Model&ndash;harness pass rate across all 21 configurations (95% CI over per-evaluation means; n=113 evaluations/configuration, fewer for four configurations with partial platform failures, see execution-reliability discussion below). <b>B,</b> Repeatability across the three attempts per evaluation; bars sum to the evaluations with a complete triplicate. <b>C,</b> Matched Pi-versus-alternate-harness score differences within the same model (95% CI whiskers).",
    fig5P1: "<span class=\"subhead\">Pass rate varies substantially across the taxonomy.</span> GPT-6 Astra is the strongest configuration across the three middle, more procedural pipeline stages: screening &amp; hit-calling (§4, 75.0%), potency &amp; efficacy (§5, 63.6%), and off-target &amp; cytotoxicity (§6, 56.7%); several of its clearest wins there are large-table quantitative-extraction tasks: computing dose-response potency parameters from large patent-derived knockdown tables, confirming a prospectively-ranked potency screen against a fixed confirmation-assay condition, and attributing transcriptome-wide splicing changes to an oligonucleotide's own predicted binding site rather than off-target noise; each reaches 100% for GPT-6 Astra against 0–33% for the other three families on the identical evaluation. Claude Opus 5 shows the opposite specialization, performing well in phenotype rescue (§7, 73.3% vs. 0–20% for the rest) and other tasks that require biological judgment about a disease model's functional outcome rather than a knockdown percentage: reading Kaplan–Meier survival curves in a disease-model animal study, interpreting immunohistochemical tissue staining as a disease-phenotype endpoint, and judging whether a reported functional or clinical score constitutes real efficacy benefit; Opus passes these outright where the other three families mostly fail. No configuration is uniformly weakest at the same stage: Gemini 3.7 Flash reaches 0% at phenotype rescue (§7) and candidate benchmarking (§10), the latter on an n=2 floor where a single evaluation swings the whole rate; read §10 with the same caution already noted for Figure 1A.",
    fig5P2: "<span class=\"subhead\">Assay type separates strong and weak performance sharply.</span> Pass rate by assay type and model (Figure 5B) spans a wider range across assay types than across models: oligo sequence design (53.7% mean), dose response (53.3%), and organ/tissue toxicity (51.9%) are the strongest categories, while splicing/isoform analysis (15.2%) and RNA-seq (20.7%) are the weakest, a wider spread than separates the strongest model overall, GPT-6 Astra (49.8% mean), from the weakest, gpt-5.6-luna (20.4%). The matrix's highest cell, 72%, is reached twice, by Claude Opus 5 on dose response and by Grok 4.6 on biomarker panel; its lowest, 0%, is reached by Gemini 3.7 Flash on QC/experimental design and by Claude Sonnet 5 on splicing/isoform analysis. GPT-6 Astra tops four of the eleven assay types (oligo off-target prediction, organ/tissue toxicity, the pooled \"other\" category, and QC/experimental design), but no model dominates uniformly: Claude Opus 5 leads dose response, Gemini 3.7 Flash leads target knockdown, Gemini 3.5 Flash leads RNA-seq, Grok 4.5 leads splicing/isoform analysis, and gpt-5.6-terra leads oligo sequence design.",
    fig5Caption: "<b>Figure 5: Pass rate by taxonomy section and assay type.</b> <b>A,</b> Pass rate by the same §1&ndash;§10 discovery-stage taxonomy as Figure 1A (per-section n as given there), joined to the rollout via each evaluation's own section assignment; top configuration per family highlighted. <b>B,</b> Pass rate by assay type (a derived, keyword-based grouping; top 10 types shown, the rest pooled) and model.",
    full4P2: "<span class=\"subhead\">More computation does not consistently improve accuracy.</span> Cost and token accounting (Figure 7A–B) show more spend does not reliably buy accuracy: GPT-6 Astra on Pi reaches 53.4% at $0.20/run, cheaper than several configurations passing 15–20 points less. The dashed line tracks each model family's own best-passing configuration as cost rises: OpenAI's best configuration is also the campaign's overall best (55.5%), while Claude's, Gemini's, and Grok's family-best configurations all land in a narrower 39–48% band regardless of spend. Figure 7C lists the cost/pass-rate non-dominated configurations explicitly (the true Pareto frontier over all 21 configurations, independent of family): four configurations are never beaten on both cost and pass rate simultaneously, and GPT-6 Astra on Pi reaches a 53.4% pass rate at just $0.198/run.",
    fig6P1: "<span class=\"subhead\">Time horizon, grader complexity, and failure modes all leave a mark on pass rate.</span> Time horizon distinguishes short-form evaluations, which ask for a single decision from one experimental snapshot, from long-form evaluations, which require tracking a decision across a sequence of timepoints or experiments (Figure 6A); long-form evaluations (n=14) show a somewhat harder overall pass rate than short-form (n=99): 36.7% vs. 38.7% pooled pass rate. Grader complexity shows no clean monotonic relationship to pass rate across the full campaign (Figure 6B) with standard errors overlap across most adjacent complexity levels, and even the largest step, from 35.3% at complexity 4 to 57.6% at complexity 5, reads as a modest bump against that full range rather than a real trend, consistent with no clean effect of grader complexity on pass rate. The per-evaluation failure-mode tag (Figure 2E) predicts real difficulty directly, ahead of the full model-trajectory failure review: mean pass rate for evaluations carrying each individual tag ranges from 14% to 37% (Figure 6C).",
    fig6Caption: "<b>Figure 6: Time horizon, grader complexity, and failure-mode tags.</b> <b>A,</b> Pass rate by time-horizon tag: short-form (single-timepoint) versus long-form (multi-timepoint) evaluations, pooled across all 21 configurations. <b>B,</b> Pass rate versus grader complexity (leaf checks composing the grader), pooled across all 21 configurations; error bars are &plusmn;1 standard error of the mean over per-evaluation pass rates within each complexity level. <b>C,</b> Mean pass rate for evaluations carrying each per-evaluation failure-mode tag (Figure 2E), sorted descending; error bars are &plusmn;1 standard error of the mean over per-evaluation pass rates within each tag. Categories are not mutually exclusive: an evaluation can carry more than one tag, so each bar is an independent mean over its own, overlapping subset of evaluations rather than a share of a fixed total; bars are not expected to sum to 100%.",
    fig4P1: "<span class=\"subhead\">Individual models diverge even when aggregate pass rates look similar.</span> Reducing each evaluation to a per-model pass/fail verdict (mean pass rate ≥ 50%, one harness per model, Pi where available, the same convention as Figures 5B and 7B) and comparing all 66 pairs across the 12 models surfaces real structure with Cohen’s kappa across the 66 pairs (chance-corrected agreement on the same binarized verdicts) ranging from &minus;0.01 to 0.56, mean 0.24. This represents slight-to-moderate agreement, though not a clean per-family partition visualized in a 2-D similarity map (Figure 4A). The hierarchical clustering (Figure 4B)&nbsp; groups the gpt-5.x sub-family and grok-4.5/4.6 tightly. GPT-6 Astra sits apart from every other model, joining the rest last and at the greatest distance with mean kappa 0.16 against the other eleven models, the lowest of any model. Claude Sonnet 5 is the one model whose closest pairing crosses family lines: it clusters with Gemini 3.5 Flash (kappa 0.32) rather than with Claude Opus 4.8 (kappa 0.27) or Opus 5 (kappa 0.23), which instead group with Gemini 3.7 Flash and the grok-4.5/4.6 pair on the tree’s other main branch. The full pairwise agreement matrix (Figure 4C) gives the exact per-pair values behind that picture. Evaluation-level head-to-head comparisons for three representative pairs confirm this isn’t purely aggregate noise: GPT-6 Astra beat Claude Opus 5 on 54 evaluations against 32 in the other direction (27 tied; Figure 4D; kappa 0.07), a similar pattern to its comparison against Grok 4.6 (50 against 33, 30 tied; Figure 4E; kappa 0.14). The comparison between Claude Opus 5 and Grok 4.6 (Figure 4F) is more evenly split (38 against 36, 39 tied; kappa 0.28).",
    fig4HCaption: "<b>Figure 4: Agent-to-agent similarity and evaluation-level head-to-head comparisons.</b> <b>A,</b> 2-D similarity map (classical multidimensional scaling on pairwise evaluation-level agreement, treated as a distance) across all 12 models; arbitrary units, first two dimensions capture 46% of total variance, so treat exact distances as approximate. Cohen's kappa on the same pairwise verdicts ranges &minus;0.01&ndash;0.56 across the 66 pairs (mean 0.24). <b>B,</b> Hierarchical clustering (average linkage) of the same pairwise distances (100&minus;agreement). <b>C,</b> Full pairwise agreement matrix (percent of evaluations where both models' pass/fail verdicts match), ordered by hierarchical clustering; diagonal omitted. <b>D,</b> GPT-6 Astra versus Claude Opus 5. <b>E,</b> GPT-6 Astra versus Grok 4.6. <b>F,</b> Claude Opus 5 versus Grok 4.6. Panels D&ndash;F pool a model's two execution harnesses (3 attempts each) into 0&ndash;6 successes per evaluation; bubble area is proportional to evaluation count, and bubble color follows the family color of whichever axis model wins that evaluation (gray marks ties).",
    full4P4: "<span class=\"subhead\">Execution failures and cost outliers concentrate in two model checkpoints.</span> Four configurations show a reduced denominator relative to the nominal 113 evaluations (Figure 3A; Figure 3C): claude-opus-4-8 / Claude Code (n=111), claude-opus-4-8 / Pi (n=112), claude-sonnet-5 / Claude Code (n=112), and claude-sonnet-5 / Pi (n=112), because every attempt on one or two specific evaluations returned a platform-level execution failure rather than a graded answer, and was excluded from the denominator rather than scored as incorrect. On one specific evaluation, all three attempts fail at the platform level for claude-opus-4-8 and claude-sonnet-5 under both of their harnesses (Claude Code and Pi alike) while claude-opus-5 completed the identical evaluation cleanly (3/3 correct) under Claude Code, pointing to an environment or tooling compatibility issue tied to the older Claude checkpoints rather than a capability gap; claude-opus-4-8 / Claude Code fails a second, unrelated evaluation as well. The same two model checkpoints also account for every cost outlier in the full rollout: all seven attempts costing more than 8× their evaluation's median cost (up to $25.82 against a $2.46 median) belong to claude-opus-4-8, and six of the seven still failed, consistent with occasional tool-loop or retry thrashing rather than more thorough analysis. Neither pattern changes the ranking in Figure 3A.&nbsp;",
    cap4a: "N=21 configs, 95% CI over per-eval means (n=113 evals/config, fewer for four configs with partial platform failures; see Figure 3 execution-reliability caveat).",
    cap4b: "Bars sum to 113 (or fewer, per note above) evaluations with a complete 3-attempt triplicate.",
    cap4c: "Log-scale axes. Dashed line connects the non-dominated (highest pass rate for its cost/tokens) configurations.",
    cap4d: "Top configuration per family highlighted; §-labels match the same §1–§10 taxonomy as Figure 1A.",
    cap4e: "Dot = mean pass rate, 95% CI whiskers. Delta = Pi &minus; alternate harness, in percentage points.",
    cap4f: "Pooling each model's two harnesses (3 attempts each) &rarr; 0&ndash;6 successes per evaluation. Bubble area &prop; evaluation count; teal favors the x-axis model, orange the y-axis model.",
    cap4g: "Top 10 assay types by evaluation count; the rest are pooled into “Minor assay types, combined.” One harness per model (Pi where available).",
    cap4h: "One point = one complexity level (leaf checks composing the grader). Full campaign, all 21 configs pooled. No clean monotonic trend.",
    cap4i: "Full campaign, all 21 configs pooled. Long-form evaluations trail short-form by 2.0 points.",
    fig4Caption: "<b>Figure 7: Cost and token accounting.</b> <b>A,</b> Pass rate versus mean cost per completed run (log-scale axis, y-axis truncated to 20&ndash;60%); color marks model family, marker shape marks execution harness, the small number beside each point gives its rank by pass rate (1 = highest, matching the Configuration list at right), and the dashed line connects each model family's single best-passing configuration, in order of cost. <b>B,</b> Pass rate versus mean token usage per completed run (log-scale axis, same y-axis and rank numbering as A); dashed line again connects each family's best-passing configuration, in order of tokens. <b>C,</b> The cost/pass-rate non-dominated configurations across the full campaign (independently computed as the true Pareto frontier over all 21 configurations, not the same as the per-family line in A&ndash;B), listed explicitly with cost per correct answer (cost per run divided by pass rate).",
    discHeadline: "<span class=\"subhead\">Frontier agents are not yet reliable oligonucleotide-discovery decision-makers.</span> Across the full campaign, no model&ndash;harness configuration exceeded 56% of endpoint attempts; the strongest, GPT-6 Astra on OpenAI Codex, passed 55.5% (95% CI 47.2&ndash;63.7), and pooled across all 21 configurations agents passed just 38.5% of valid grading runs (Figure 3A). Repeatability compounds the gap: even the strongest configurations fail all three attempts on roughly a third of evaluations (Figure 3B), so a single passing run is a weak signal of genuine competence on a given decision.",
    discSpecialization: "<span class=\"subhead\">Model specialization, not a uniform skill gap.</span> The per-evaluation failure-mode taxonomy is dominated, by a wide margin, by subset/scope/compartment errors&nbsp; rather than by raw computational mistakes (Figure 2E), the same pattern reported for TxBench-Antibody and TxBench-PP. Rankings are not uniform across evaluations either: reducing every evaluation to a per-model pass/fail verdict and comparing all 66 pairs across the 12 models shows real structure rather than a single competence ordering, though not a clean per-family split: the gpt-5.x sub-family and grok-4.5/4.6 cluster tightly, Claude Sonnet 5 pairs most closely with Gemini 3.5 Flash rather than its own family, and GPT-6 Astra, the strongest configuration overall, sits apart from every other model and joins the rest last (Figure 4A–C). Head-to-head comparisons confirm this is not aggregate noise: GPT-6 Astra beats Claude Opus 5 on more evaluations than it loses, and a similar pattern holds against Grok 4.6, while Claude Opus 5 and Grok 4.6 split close to evenly (Figure 4D–F). A single leaderboard number therefore obscures which specific evaluations a configuration is likely to get right; the failure-mode and similarity results together suggest that improving pooled pass rate and improving scope/comparator judgment are the most consequential.",
    discP2: "TxBench-Oligonucleotide Discovery extends a decision-centered benchmarking approach shared with TxBench-PP, TxBench-Antibody, and VariantBench. Across all three sister benchmarks, the strongest model–harness configurations passed roughly 40–60% of endpoint attempts on realistic, decision-centered biology tasks, and the large majority of failures were attributed to scientific-judgment errors (scope, comparator, and estimand selection; cross-context portability; and evidentiary calibration) rather than to raw computational execution. TxBench-Oligonucleotide Discovery's own failure-mode design taxonomy, dominated by subset/scope/compartment traps, is consistent with this pattern across all four benchmarks, though this remains a hypothesis about benchmark <i>design</i> until it can be checked against TxBench-Oligonucleotide Discovery's own model-trajectory failure analysis. TxBench-Antibody additionally reported that model rankings reversed across competencies, decision types, and evidence sources; the agent-to-agent similarity results here (Figure 4) extend that finding: aggregate pass rate is a poor predictor of which specific evaluations a given configuration will solve, so a single per-benchmark leaderboard is likely to understate real cross-model differences in a similar way across this whole benchmark family.",
    discConclusion: "TxBench-Oligonucleotide Discovery shows that frontier AI agents can already recover a meaningful share of the decisions an ASO/siRNA discovery program depends on, but not yet reliably enough to substitute for expert judgment: the strongest configuration, GPT-6 Astra on OpenAI Codex, passes just over half of endpoint attempts, and pooled across the full campaign agents pass just under two-fifths of valid grading runs. Failures concentrate in scope, comparator, and baseline selection rather than in raw computation, echoing the same failure pattern reported for TxBench-PP and TxBench-Antibody, and model performance is structured by pipeline stage and decision type rather than by a single uniform capability gap: the strongest configuration overall is not the strongest configuration for every kind of decision. A single leaderboard number is therefore the wrong basis for deciding which model to trust with which class of oligonucleotide discovery judgment.",
    discForward: "As AI agents take on a growing share of oligonucleotide discovery workflows, decision-centered evaluation of this kind lets a program match model choice to the specific judgment a given stage requires, rather than to an aggregate score that obscures where a model is strong. TxBench-Oligonucleotide Discovery joins TxBench-PP, TxBench-Antibody, and VariantBench as part of a growing family of benchmarks built directly from primary experimental data and graded deterministically against the decision a scientist would actually reach; extending this same discipline to the remaining stages of the discovery-to-translation arc, and to the next generation of models as they arrive, is the clearest path to knowing when an AI agent is ready to be trusted with a given class of drug discovery decision.",
    methP1: "Benchmark composition and data. TxBench-Oligonucleotide Discovery comprises 113 evaluations derived from 21 ASO/siRNA discovery programs. Each evaluation includes an agent-facing task, a deterministic grader (Figure 2D), and benchmark metadata recording its taxonomy section, internal task type, time-horizon classification, and (where populated) a failure-mode tag.",
    methP2: "Task format and grading. All evaluations use deterministic grading over a structured final answer, built from typed leaf checks composed under all-must-pass conjunctions where an evaluation requires more than one check.",
    methP3: "Outcome classification and aggregation. Per-evaluation pass rate is computed as correct results over valid grading runs; per-configuration pass rate (Figure 3A) is the mean of those per-evaluation rates, with 95% Student-t confidence intervals over the per-evaluation means. Time-horizon (Figure 6A) and grader-complexity (Figure 6B) breakdowns pool correct and valid counts across all 21 model&ndash;harness configurations, grouping evaluations by the number of leaf checks composing each evaluation's grader and by its metadata.time_horizon tag, respectively.",
    methNote: "<b>Design note.</b> A grader is only useful if failure is well-specified: Popper’s requirement that a test admit a decisive way to fail, which is what the boolean pass/fail and numeric-range checks are built to do. But when an evaluation fails, Duhem–Quine holism applies: the failure can be attributed to the target decision or to an auxiliary interpretive choice bundled with it (scope, comparator, baseline), which is why the failure-mode taxonomy (Figure 2E) is dominated by scope/comparator errors rather than raw computation.",
    ref1: "Ramasamy, R., Le, H., Brougher, J., Urrutia, A., Banerjee, A., Poust, S. &amp; Workman, K. TxBench – Antibody Discovery: Benchmarking AI Agents on Experimentally Grounded Decisions in Therapeutic Antibody Discovery. LatchBio.",
    ref2: "Le, H., Ramasamy, R., Urrutia, A., Yazdani, M., Proctor, T. &amp; Workman, K. TxBench-PP: Analyzing AI Agent Performance on Small-Molecule Preclinical Pharmacology. <i>arXiv:submit/7725456 [cs.AI]</i>, 17 June 2026.",
    ref3: "Bhowmick, A., Rahmatpour, N., Sharma, S., Xu, Q., Gupta, A., Lagwankar, A., Banerjee, A. &amp; Zou, C. VariantBench: An Agentic Benchmark for Genetic Variant Discovery and Interpretation. LatchBio.",
    ref4: "Hill, B., Jaques, M.R., Nair, R.R., Whiffin, N., Wood, M.J.A., Sanders, S.J., Oliver, P.L., Hill, A.C. &amp; Rinaldi, C. Accurately modeling RNase H-mediated antisense oligonucleotide efficacy. <i>Molecular Therapy Nucleic Acids</i> 37(3):103004, 2026.",
    ref5: "Sundar, A., Wei, Z. &amp; Griesmer, S. Benchmarking Large Language Models for Predicting Therapeutic Antisense Oligonucleotide Efficacy. <i>bioRxiv</i> 2026.02.17.706455, 2026.",
    ref6: "Andreone, B.J. et al. Durable suppression of seizures in a preclinical model of KCNT1 genetic epilepsy with divalent small interfering RNA. <i>Epilepsia</i> 66(5):1677–1690, 2025.",
    ref7: "Bäckström, E., Bonetti, A., Johnsson, P., Öhlin, S., Dahlén, A., Andersson, P., Andersson, S. &amp; Gennemark, P. Tissue pharmacokinetics of antisense oligonucleotides. <i>Molecular Therapy Nucleic Acids</i> 35(1):102133, 2024.",
    ref8: "Burdick, A.D. et al. Sequence motifs associated with hepatotoxicity of locked nucleic acid-modified antisense oligonucleotides. <i>Nucleic Acids Research</i> 42(8):4882–4891, 2014.",
    ref9: "Chen, X., Birey, F., Li, M.-Y., Revah, O., Levy, R., Thete, M.V., Reis, N., Kaganovsky, K., Onesto, M., Sakai, N., Hudacova, Z., Hao, J., Meng, X., Nishino, S., Huguenard, J. &amp; Pașca, S.P. Antisense oligonucleotide therapeutic approach for Timothy syndrome. <i>Nature</i> 628(8009):818–825, 2024.",
    ref10: "Didiot, M.C. et al. Nuclear localization of huntingtin mRNA is specific to cells of neuronal origin. <i>Cell Reports</i> 24(10):2553–2560, 2018.",
    ref11: "El Boujnouni, N., van der Bent, M.L., Willemse, M., 't Hoen, P.A.C., Brock, R. &amp; Wansink, D.G. Block or degrade? Balancing on- and off-target effects of antisense strategies against transcripts with expanded triplet repeats in DM1. <i>Molecular Therapy Nucleic Acids</i> 32:622–636, 2023.",
    ref12: "Golinski, S.R., Soriano, K., Briegel, A.C. et al. RNA targeting therapy for a prenatally enriched potassium channel associated with severe childhood epilepsy and premature death. <i>Nature Communications</i> 17:5864, 2026.",
    ref13: "Hagedorn, P.H., Pontoppidan, M., Bisgaard, T.S. et al. Identifying and avoiding off-target effects of RNase H-dependent antisense oligonucleotides in mice. <i>Nucleic Acids Research</i> 46(11):5366–5380, 2018.",
    ref14: "Holgersen, E.M., Gandhi, S., Zhou, Y. et al. Transcriptome-wide off-target effects of steric-blocking oligonucleotides. <i>Nucleic Acid Therapeutics</i> 31(6):392–403, 2021.",
    ref15: "Janas, M.M., Jiang, Y., Schlegel, M.K., Waldron, S., Kuchimanchi, S. &amp; Barros, S.A. Impact of oligonucleotide structure, chemistry, and delivery method on in vitro cytotoxicity. <i>Nucleic Acid Therapeutics</i> 27(1):11–22, 2017.",
    ref16: "Klim, J.R., Williams, L.A., Limone, F. et al. ALS-implicated protein TDP-43 sustains levels of STMN2, a mediator of motor neuron growth and repair. <i>Nature Neuroscience</i> 22(2):167–179, 2019.",
    ref17: "Kuijper, E.C., van der Graaf, L., Pepers, B.A. et al. Determining off-target effects of splice-switching antisense oligonucleotides using short read RNAseq in neuronally differentiated human induced pluripotent stem cells. <i>Human Molecular Genetics</i> 34(22):1912–1925, 2025.",
    ref18: "Lee, H.-S., Seok, H., Lee, D.H., Ham, J., Lee, W., Youm, E.M., Yoo, J.S., Lee, Y.-S., Jang, E.-S. &amp; Chi, S.W. Abasic pivot substitution harnesses target specificity of RNA interference. <i>Nature Communications</i> 6:10154, 2015.",
    ref19: "McCampbell, A., Cole, T., Wegener, A.J. et al. Antisense oligonucleotides extend survival and reverse decrement in muscle response in ALS models. <i>Journal of Clinical Investigation</i> 128(8):3558–3567, 2018.",
    ref20: "Shen, W., De Hoyos, C.L., Sun, H., Vickers, T.A., Liang, X.H. &amp; Crooke, S.T. Acute hepatotoxicity of 2′ fluoro-modified 5–10–5 gapmer phosphorothioate oligonucleotides in mice correlates with intracellular protein binding and the loss of DBHS proteins. <i>Nucleic Acids Research</i> 46(5):2204–2217, 2018.",
    ref21: "Vickers, T.A., Rahdar, M., Prakash, T.P. &amp; Crooke, S.T. Kinetic and subcellular analysis of PS-ASO/protein interactions with P54nrb and RNase H1. <i>Nucleic Acids Research</i> 47(20):10865–10880, 2019.",
    ref22: "Wheeler, T.M., Leger, A.J., Pandey, S.K. et al. Targeting nuclear RNA for in vivo correction of myotonic dystrophy. <i>Nature</i> 488(7409):111–115, 2012.",
    ref23: "Polanyi, M. The Tacit Dimension. Doubleday &amp; Company, 1966.",
    refNote: "Full citations for Andreone 2025, Burdick 2014, Chen 2024, Hagedorn 2018, Vickers 2019, Didiot 2018, McCampbell 2018, Kuijper 2025, Holgersen 2021, Golinski 2026, Wheeler 2012, Elboujnouni 2023, Shen 2018, Backstrom 2024, Janas 2017, and Lee 2015 are given above (refs. 6–22). Hill 2025 in early construction records is the bioRxiv preprint of the same Hill 2026 study (ref. 4). ASO Atlas, the siRNA-discovery program, and the ATXN2, MAPT, and part of the MDT1 disease-specific programs are internally constructed from primary data with no single source paper. A distinct Guo 2025 splice-correction source could not be matched to a specific published paper with confidence: the DOI initially proposed for it (10.1093/nar/gkaf1063) resolves to an unrelated paper (Prakash et al., APOC3 siRNA), and is omitted pending verification against internal project records.",
    footerLeft: "",
    footerRight: "",
  
  };

  // STATE is the live working copy. On a fresh publish there is no
  // #state-data blob, so it falls back to DEFAULT_STATE; on a page loaded
  // from a saved version, it hydrates from the JSON this same script wrote
  // at publish time (see buildFullDocument) — never from re-parsing this
  // script's own hardcoded defaults, which would silently discard edits.
  let STATE = DEFAULT_STATE;
  (function loadState(){
    try{
      const raw = document.getElementById("state-data");
      if (raw && raw.textContent.trim()){
        STATE = Object.assign({}, DEFAULT_STATE, JSON.parse(raw.textContent));
      }
    }catch(e){ STATE = DEFAULT_STATE; }
  })();

  function ed(key){ return `contenteditable="true" data-bind="${key}"`; }
  function P(key){ return `<p ${ed(key)}>${STATE[key]}</p>`; }
  function LI(key, cls){ return `<li ${cls?`class="${cls}"`:""} ${ed(key)}>${STATE[key]}</li>`; }
  function CAP(key){ return `<figcaption ${ed(key)}>${STATE[key]}</figcaption>`; }
  function SP(key, tag){ tag = tag||"span"; return `<${tag} ${ed(key)}>${STATE[key]}</${tag}>`; }

  // =====================================================================
  // TEMPLATE — the canonical source of the page. Run once on load (into
  // #sheet) and again, from the same STATE, inside publishNow().
  // =====================================================================
  function buildSheetHtml(S){
    return `
  <header class="masthead">
    <div class="kicker">
      <span class="eyebrow">Oligo-Discovery-TxBench · working draft</span>
      <span class="draft-tag">Manuscript + figures, not final</span>
    </div>
    <h1 class="title" ${ed("title")}>${S.title}</h1>
    <p class="subtitle" ${ed("subtitle")}>${S.subtitle}</p>
    <p class="authors" ${ed("authors")}>${S.authors}</p>
    <p class="affil" ${ed("affil")}>${S.affil}</p>
  </header>

  <div class="edit-hint" id="editHint"><span class="dot"></span><span>Click any paragraph, caption, or list item to edit it: a "Save changes" bar appears once you do.</span></div>

  <div class="abstract">
    <h2>Abstract</h2>
    <p ${ed("abstract")}>${S.abstract}</p>
  </div>

  <section class="paper-section">
    <div class="section-head"><h2 class="sec-title">Introduction</h2></div>
    <div class="prose">${P("introP1")}${P("introP2")}${P("introP3")}</div>
  </section>

  <section class="paper-section">
    <div class="section-head"><h2 class="sec-title">Benchmark Construction</h2></div>
    <div class="prose">${P("constrP1")}${P("constrP2")}</div>
  </section>

  <section class="paper-section">
    <div class="section-head"><h2 class="sec-title">Benchmark Anatomy</h2></div>
    <div class="prose">${P("anatomyP1")}${P("anatomyP2")}</div>

    <figure style="margin-bottom:16px;">
      <div class="fig-panel">
        <h4><span class="panel-letter">A</span> Discovery decision path</h4>
        <div class="legend-row">
          <span class="legend-item"><span class="legend-swatch" style="background:var(--tier1)"></span>Target Feasibility &amp; Library Design</span>
          <span class="legend-item"><span class="legend-swatch" style="background:var(--tier2)"></span>In Vitro Pharmacology &amp; Safety</span>
          <span class="legend-item"><span class="legend-swatch" style="background:var(--tier3)"></span>Translational Readiness</span>
        </div>
        <svg id="chart-taxonomy" class="chart-svg" viewBox="0 0 1020 175"></svg>
      </div>
    </figure>

    <figure class="two-col" style="grid-template-columns:1fr 1fr;margin-bottom:12px;">
      <div class="fig-panel">
        <h4><span class="panel-letter">B</span> Tasks and decisions</h4>
        <svg id="chart-tasktype" class="chart-svg" viewBox="0 0 350 250"></svg>
      </div>
      <div class="fig-panel">
        <h4><span class="panel-letter">C</span> Assay and evidence types</h4>
        <svg id="chart-assaytype" class="chart-svg" viewBox="0 0 350 172"></svg>
      </div>
    </figure>

    <figure class="three-col" style="margin-top:4px;">
      <div class="fig-panel">
        <h4><span class="panel-letter">D</span> Disease indication</h4>
        <svg id="chart-disease" class="chart-svg" viewBox="0 0 340 132"></svg>
      </div>
      <div class="fig-panel">
        <h4><span class="panel-letter">E</span> Target gene</h4>
        <svg id="chart-genetarget" class="chart-svg" viewBox="0 0 340 132"></svg>
      </div>
      <div class="fig-panel">
        <h4><span class="panel-letter">F</span> Tissue or cell type</h4>
        <svg id="chart-tissue" class="chart-svg" viewBox="0 0 340 132"></svg>
      </div>
    </figure>

    <p class="figure-caption" ${ed("fig1Caption")}>${S.fig1Caption}</p>

  </section>

  <section class="paper-section">
    <div class="section-head"><h2 class="sec-title">Construction Lenses and Failure-Mode Design</h2></div>
    <div class="prose">${P("validP1")}${P("validP2")}${P("validP3")}${P("validP4")}</div>

    <div class="visual-note">
      <p ${ed("validNote")}>${S.validNote}</p>
    </div>

    <figure>
      <div class="fig-panel">
        <h4><span class="panel-letter">A</span> Idea generation lens library</h4>
        <svg id="chart-lens-pipeline" class="chart-svg" viewBox="0 0 800 330"></svg>
      </div>
    </figure>

    <figure class="two-col" style="grid-template-columns:1fr 1.3fr;">
      <div class="fig-panel">
        <h4><span class="panel-letter">B</span> Lens alignment summary</h4>
        <svg id="chart-lens" class="chart-svg" viewBox="0 0 320 234"></svg>
      </div>
      <div class="fig-panel">
        <h4><span class="panel-letter">C</span> Key Program Decisions &amp; Technical Judgement lens</h4>
        <svg id="chart-kjd" class="chart-svg" viewBox="0 0 420 210"></svg>
      </div>
    </figure>

    <figure class="two-col" style="grid-template-columns:1fr 1.3fr;">
      <div class="fig-panel">
        <h4><span class="panel-letter">D</span> Grader type usage</h4>
        <svg id="chart-gradertype" class="chart-svg" viewBox="0 0 310 156"></svg>
      </div>
      <div class="fig-panel">
        <h4><span class="panel-letter">E</span> Per eval failure mode tags</h4>
        <svg id="chart-failuremode" class="chart-svg" viewBox="0 0 400 188"></svg>
      </div>
    </figure>

    <p class="figure-caption" ${ed("fig2Caption")}>${S.fig2Caption}</p>

    <div class="prose">
      <p ${ed("validP5")}>${S.validP5}</p>
    </div>
  </section>

  <div class="visual-note">
    <p ${ed("methNote")}>${S.methNote}</p>
  </div>

  <section class="paper-section">
    <div class="section-head"><h2 class="sec-title">Results</h2></div>

    <div class="prose">${P("fig3P1")}${P("fig3P2")}${P("fig3P2b")}${P("fig3P3")}</div>

    <figure class="two-col" style="grid-template-columns:1fr 1fr;">
      <div class="fig-panel">
        <h4><span class="panel-letter">A</span> Model harness pass rate</h4>
        <svg id="chart-fig3-passrate" class="chart-svg" viewBox="0 0 440 540"></svg>
        <div class="legend-row" style="margin-top:8px;margin-bottom:0;">
          <span class="legend-item"><span class="legend-swatch" style="background:var(--claude)"></span>Claude</span>
          <span class="legend-item"><span class="legend-swatch" style="background:var(--fam-gpt)"></span>GPT</span>
          <span class="legend-item"><span class="legend-swatch" style="background:var(--gemini)"></span>Gemini</span>
          <span class="legend-item"><span class="legend-swatch" style="background:var(--grok)"></span>Grok</span>
        </div>
      </div>
      <div class="fig-panel">
        <h4><span class="panel-letter">B</span> Repeatability across three attempts</h4>
        <svg id="chart-fig3-repeat" class="chart-svg" viewBox="0 0 440 540"></svg>
        <div class="legend-row" style="flex-wrap:nowrap;margin-top:8px;margin-bottom:0;">
          <span class="legend-item" style="font-weight:600;white-space:nowrap;">Passed:</span>
          <span class="legend-item"><span class="legend-swatch" style="background:var(--rule-strong)"></span>0</span>
          <span class="legend-item"><span class="legend-swatch" style="background:var(--accent-400)"></span>1</span>
          <span class="legend-item"><span class="legend-swatch" style="background:var(--accent)"></span>2</span>
          <span class="legend-item"><span class="legend-swatch" style="background:var(--accent-700)"></span>3</span>
        </div>
      </div>
    </figure>

    <figure style="max-width:560px;">
      <div class="fig-panel">
        <h4><span class="panel-letter">C</span> Score difference across harnesses</h4>
        <svg id="chart-full-harnessdelta" class="chart-svg" viewBox="0 0 700 410"></svg>
        <div class="legend-row" style="margin-top:8px;margin-bottom:0;">
          <span class="legend-item"><span class="legend-swatch" style="background:var(--accent)"></span>Pi</span>
          <span class="legend-item"><span class="legend-swatch" style="background:var(--ink-mute)"></span>alternate harness</span>
        </div>
      </div>
    </figure>

    <p class="figure-caption" ${ed("fig3Caption")}>${S.fig3Caption}</p>
  </section>

  <section class="paper-section">
    <div class="prose">${P("fig4P1")}</div>

    <figure>
      <div class="fig-panel">
        <h4><span class="panel-letter">A</span> Cross model agreement, 2D map</h4>
        <svg id="chart-sim-mds" class="chart-svg" viewBox="0 0 740 460"></svg>
      </div>
    </figure>

    <figure class="two-col" style="grid-template-columns:1fr 1fr;margin-bottom:10px;">
      <div class="fig-panel">
        <h4><span class="panel-letter">B</span> Cross model agreement, hierarchical clustering</h4>
        <svg id="chart-sim-dendro" class="chart-svg" viewBox="0 0 380 386"></svg>
      </div>
      <div class="fig-panel">
        <h4><span class="panel-letter">C</span> Cross model agreement, pairwise matrix</h4>
        <svg id="chart-sim-matrix" class="chart-svg" viewBox="0 0 470 360"></svg>
      </div>
    </figure>

    <figure class="three-col">
      <div class="fig-panel">
        <h4><span class="panel-letter">D</span> GPT-6 Astra vs. Opus 5</h4>
        <svg id="chart-h2h-1" class="chart-svg" viewBox="0 0 260 260"></svg>
      </div>
      <div class="fig-panel">
        <h4><span class="panel-letter">E</span> GPT-6 Astra vs. Grok 4.6</h4>
        <svg id="chart-h2h-2" class="chart-svg" viewBox="0 0 260 260"></svg>
      </div>
      <div class="fig-panel">
        <h4><span class="panel-letter">F</span> Opus 5 vs. Grok 4.6</h4>
        <svg id="chart-h2h-3" class="chart-svg" viewBox="0 0 260 260"></svg>
      </div>
    </figure>

    <p class="figure-caption" ${ed("fig4HCaption")}>${S.fig4HCaption}</p>
  </section>

  <section class="paper-section">
    <div class="prose">${P("fig5P1")}${P("fig5P2")}</div>

    <figure>
      <div class="fig-panel">
        <h4><span class="panel-letter">A</span> Pass rate by taxonomy section</h4>
        <svg id="chart-full-stage" class="chart-svg" viewBox="0 0 900 340"></svg>
      </div>
    </figure>

    <figure>
      <div class="fig-panel">
        <h4><span class="panel-letter">B</span> Pass rate by assay type</h4>
        <svg id="chart-full-assay" class="chart-svg" viewBox="0 0 900 470"></svg>
      </div>
    </figure>

    <p class="figure-caption" ${ed("fig5Caption")}>${S.fig5Caption}</p>
  </section>

  <section class="paper-section">
    <div class="prose">${P("fig6P1")}</div>

    <figure class="two-col" style="grid-template-columns:1fr 1fr;">
      <div class="fig-panel">
        <h4><span class="panel-letter">A</span> Time horizon</h4>
        <svg id="chart-timehorizon" class="chart-svg" viewBox="0 0 320 140"></svg>
        <div style="display:flex;gap:18px;margin-top:10px">
          <div style="flex:1;text-align:left;padding:14px 8px;border:1px solid var(--border);border-radius:6px">
            <div class="mono" style="font-size:10px;color:var(--ink-mute);margin-bottom:6px">SHORT-FORM &middot; n=104</div>
            <div style="font-size:26px;font-weight:600;font-variant-numeric:tabular-nums;text-align:center">36.8%</div>
            <div class="mono" style="font-size:10px;color:var(--ink-mute)">2,408/6,536</div>
          </div>
          <div style="flex:1;text-align:left;padding:14px 8px;border:1px solid var(--border);border-radius:6px">
            <div class="mono" style="font-size:10px;color:var(--ink-mute);margin-bottom:6px">LONG-FORM &middot; n=16</div>
            <div style="font-size:26px;font-weight:600;font-variant-numeric:tabular-nums;text-align:center">32.3%</div>
            <div class="mono" style="font-size:10px;color:var(--ink-mute)">322/998</div>
          </div>
        </div>
      </div>
      <div class="fig-panel">
        <h4><span class="panel-letter">B</span> Grader complexity vs. pass rate</h4>
        <svg id="chart-complexity" class="chart-svg" viewBox="0 0 420 330"></svg>
      </div>
    </figure>

    <figure class="two-col" style="grid-template-columns:1fr 1fr;">
      <div class="fig-panel">
        <h4><span class="panel-letter">C</span> Failure mode tag vs. pass rate</h4>
        <svg id="chart-failuremode-pr" class="chart-svg" viewBox="0 0 350 221"></svg>
      </div>
    </figure>

    <p class="figure-caption" ${ed("fig6Caption")}>${S.fig6Caption}</p>
  </section>

  <section class="paper-section">
    <div class="prose">${P("full4P2")}${P("full4P4")}</div>

    <figure style="display:grid; grid-template-columns:1fr 300px; grid-template-rows:auto auto; gap:20px; align-items:start;">
      <div class="fig-panel" style="grid-column:1; grid-row:1;">
        <h4><span class="panel-letter">A</span> Pass rate vs. cost</h4>
        <svg id="chart-full-cost" class="chart-svg" viewBox="0 0 400 330"></svg>
      </div>
      <div class="fig-panel" style="grid-column:2; grid-row:1;">
      <div class="legend-block">
        <div class="legend-block-label">Model family</div>
        <div class="legend-row" style="margin-bottom:0; gap:10px;">
          <span class="legend-item"><span class="legend-swatch" style="background:var(--claude)"></span>Claude</span>
          <span class="legend-item"><span class="legend-swatch" style="background:var(--fam-gpt)"></span>GPT</span>
          <span class="legend-item"><span class="legend-swatch" style="background:var(--gemini)"></span>Gemini</span>
          <span class="legend-item"><span class="legend-swatch" style="background:var(--grok)"></span>Grok</span>
        </div>
      </div>
      <div class="legend-block">
        <div class="legend-block-label">Harness</div>
        <div class="legend-row" style="margin-bottom:0; gap:10px;">
          <span class="legend-item">&#9679; Pi</span>
          <span class="legend-item">&#9632; Claude Code</span>
          <span class="legend-item">&#9650; OpenAI Codex</span>
          <span class="legend-item">&#9670; Grok Build</span>
        </div>
      </div>
      <div class="legend-block">
        <div class="legend-block-label">Configuration (ranked by pass rate)</div>
        <div class="config-rank-list">
          <span><span class="rank-num">1.</span>gpt-6-astra / OpenAI Codex (55.5%)</span>
          <span><span class="rank-num">2.</span>gpt-6-astra / Pi (53.4%)</span>
          <span><span class="rank-num">3.</span>claude-opus-5 / Claude Code (48.1%)</span>
          <span><span class="rank-num">4.</span>grok-4.6 / Pi (44.0%)</span>
          <span><span class="rank-num">5.</span>grok-4.6 / Grok Build (42.8%)</span>
          <span><span class="rank-num">6.</span>claude-opus-5 / Pi (42.2%)</span>
          <span><span class="rank-num">7.</span>claude-opus-4-8 / Claude Code (39.6%)</span>
          <span><span class="rank-num">8.</span>gemini-3.7-flash / Pi (39.5%)</span>
          <span><span class="rank-num">9.</span>claude-opus-4-8 / Pi (39.3%)</span>
          <span><span class="rank-num">10.</span>claude-sonnet-5 / Claude Code (39.3%)</span>
          <span><span class="rank-num">11.</span>gpt-5.6-sol / Pi (38.9%)</span>
          <span><span class="rank-num">12.</span>gemini-3.5-flash / Pi (38.6%)</span>
          <span><span class="rank-num">13.</span>grok-4.5 / Pi (38.3%)</span>
          <span><span class="rank-num">14.</span>claude-sonnet-5 / Pi (36.2%)</span>
          <span><span class="rank-num">15.</span>gpt-5.6-sol / OpenAI Codex (34.5%)</span>
          <span><span class="rank-num">16.</span>gpt-5.5 / Pi (33.6%)</span>
          <span><span class="rank-num">17.</span>gpt-5.6-terra / Pi (33.3%)</span>
          <span><span class="rank-num">18.</span>gpt-5.6-terra / OpenAI Codex (32.4%)</span>
          <span><span class="rank-num">19.</span>gpt-5.5 / OpenAI Codex (30.4%)</span>
          <span><span class="rank-num">20.</span>gpt-5.6-luna / OpenAI Codex (23.9%)</span>
          <span><span class="rank-num">21.</span>gpt-5.6-luna / Pi (23.3%)</span>
        </div>
      </div>
      </div>
      <div class="fig-panel" style="grid-column:1; grid-row:2;">
        <h4><span class="panel-letter">B</span> Pass rate vs. token usage</h4>
        <svg id="chart-full-tokens" class="chart-svg" viewBox="0 0 400 330"></svg>
      </div>
      <div class="fig-panel" style="grid-column:2; grid-row:2;">
        <h4><span class="panel-letter">C</span> Cost/pass rate frontier</h4>
        <table class="pareto-table compact">
          <thead><tr><th>Config</th><th>$/run</th><th>Pass %</th><th>$/correct</th></tr></thead>
          <tbody>
            <tr><td>gpt-5.6-luna<span class="cfg-harness">Pi</span></td><td>$0.049</td><td>23.3%</td><td>$0.210</td></tr>
            <tr><td>gpt-5.6-luna<span class="cfg-harness">OpenAI Codex</span></td><td>$0.053</td><td>23.9%</td><td>$0.222</td></tr>
            <tr><td>gpt-6-astra<span class="cfg-harness">Pi</span></td><td>$0.198</td><td>53.4%</td><td>$0.371</td></tr>
            <tr><td>gpt-6-astra<span class="cfg-harness">OpenAI Codex</span></td><td>$0.800</td><td>55.5%</td><td>$1.441</td></tr>
          </tbody>
        </table>
      </div>
    </figure>

    <p class="figure-caption" ${ed("fig4Caption")}>${S.fig4Caption}</p>
  </section>

  <section class="paper-section">
    <div class="section-head"><h2 class="sec-title">Discussion</h2></div>
    <div class="prose">
      ${P("discHeadline")}
      ${P("discSpecialization")}
      <p ${ed("discP2")}><span class="subhead">Relationship to prior work.</span> ${S.discP2}</p>
      <p ${ed("discConclusion")}><span class="subhead">Conclusion.</span> ${S.discConclusion}</p>
      <p ${ed("discForward")}><span class="subhead">Outlook.</span> ${S.discForward}</p>
    </div>
  </section>

  <section class="paper-section">
    <div class="section-head"><h2 class="sec-title">Methods</h2></div>
    <div class="prose">${P("methP1")}${P("methP2")}${P("methP3")}</div>
  </section>

  <section class="paper-section">
    <div class="section-head"><h2 class="sec-title">References</h2></div>
    <ol class="ref-list">
      ${LI("ref1")}${LI("ref2")}${LI("ref3")}${LI("ref4")}${LI("ref5")}${LI("ref6")}${LI("ref7")}${LI("ref8")}${LI("ref9")}${LI("ref10")}${LI("ref11")}${LI("ref12")}${LI("ref13")}${LI("ref14")}${LI("ref15")}${LI("ref16")}${LI("ref17")}${LI("ref18")}${LI("ref19")}${LI("ref20")}${LI("ref21")}${LI("ref22")}${LI("ref23")}
    </ol>
    <p class="ref-note" ${ed("refNote")}>${S.refNote}</p>
  </section>

  <footer class="colophon">
    <span ${ed("footerLeft")}>${S.footerLeft}</span>
    <span ${ed("footerRight")}>${S.footerRight}</span>
  </footer>
`;
  }

  // =====================================================================
  // CHART RENDERERS (unchanged data; not part of the editable text model)
  // =====================================================================
  function hbar(id, data, opts){
    const svg = svgOf(id);
    const W = opts.W, H = opts.H;
    const left = opts.left || 190, right = opts.right || 46, top = opts.top || 6;
    const rowH = opts.rowH || 20, gap = opts.gap || 8;
    const hasCi = data.some(d=>d.ci!=null);
    const autoMax = Math.max(...data.map(d=>d.value + (d.ci||0))) * 1.08;
    const max = opts.max || autoMax;
    const plotW = W - left - right;
    let y = top;
    let curGroup = null;
    data.forEach((d,i)=>{
      if (opts.groupLabels && d.group !== curGroup){
        curGroup = d.group;
        const gl = el("text", {x:0, y:y+11, class:"tier-label"});
        gl.textContent = opts.groupLabels[d.group];
        svg.appendChild(gl);
        y += 20;
      }
      const w = (d.value/max) * plotW;
      const fill = d.fill || (opts.groupColor ? opts.groupColor[d.group] : "var(--accent)");
      const rect = el("rect", {x:left, y, width:Math.max(w,1.5), height:rowH-6, rx:2.5, fill});
      if (d.n != null){
        const title = el("title");
        title.textContent = `${d.label}: ${d.value}% pass` + (d.ci!=null?` (±${d.ci.toFixed(1)} SE)`:"") + `, n=${d.n} evals`;
        rect.appendChild(title);
      }
      svg.appendChild(rect);
      if (d.ci != null){
        const cy = y + (rowH-6)/2;
        const xLo = left + Math.max(0, (d.value-d.ci)/max) * plotW;
        const xHi = left + Math.min(max, d.value+d.ci)/max * plotW;
        const capH = 4;
        svg.appendChild(el("line", {x1:xLo, x2:xHi, y1:cy, y2:cy, stroke:"var(--ink-mute)", "stroke-width":1.1}));
        svg.appendChild(el("line", {x1:xLo, x2:xLo, y1:cy-capH/2, y2:cy+capH/2, stroke:"var(--ink-mute)", "stroke-width":1.1}));
        svg.appendChild(el("line", {x1:xHi, x2:xHi, y1:cy-capH/2, y2:cy+capH/2, stroke:"var(--ink-mute)", "stroke-width":1.1}));
      }
      const labAttrs = {x:left-8, y:y+(rowH-6)/2+3.5, class:"bar-label", "text-anchor":"end"};
      if (opts.textSize) labAttrs.style = `font-size:${opts.textSize}px`;
      const lab = el("text", labAttrs);
      lab.textContent = d.label;
      svg.appendChild(lab);
      const valX = hasCi ? left + Math.min(max, d.value+(d.ci||0))/max*plotW + 7 : left+w+7;
      const valAttrs = {x:valX, y:y+(rowH-6)/2+3.5, class:"bar-value"};
      if (opts.textSize) valAttrs.style = `font-size:${opts.textSize}px`;
      const val = el("text", valAttrs);
      val.textContent = opts.valueFmt ? opts.valueFmt(d.value) : d.value;
      svg.appendChild(val);
      y += rowH;
    });
    svg.setAttribute("viewBox", `0 0 ${W} ${y+6}`);
  }

  function pathChart(id, items, opts){
    const svg = svgOf(id);
    const W = opts.W;
    const marginX = opts.marginX || 50;
    const top = opts.top || 30;
    const minR = opts.minR || 11, maxR = opts.maxR || 28;
    const plotW = W - marginX*2;
    const step = items.length > 1 ? plotW/(items.length-1) : 0;
    const values = items.map(d=>d.value);
    const vMin = Math.min(...values), vMax = Math.max(...values);
    const rScale = v => vMax===vMin ? (minR+maxR)/2 :
      minR + (maxR-minR) * ((Math.sqrt(v)-Math.sqrt(vMin)) / (Math.sqrt(vMax)-Math.sqrt(vMin)));
    const cy = top + maxR + 4;
    svg.appendChild(el("line", {x1:marginX, x2:marginX+plotW, y1:cy, y2:cy, stroke:"var(--rule-strong)", "stroke-width":1.4}));
    let maxLines = 1;
    const wrap = (label)=>{
      const words = label.split(" ");
      const lines = []; let cur = "";
      words.forEach(w=>{
        const test = cur ? cur+" "+w : w;
        if (test.length > 10 && cur){ lines.push(cur); cur = w; } else { cur = test; }
      });
      if (cur) lines.push(cur);
      return lines.slice(0,3);
    };
    items.forEach((d,i)=>{
      const cx = marginX + step*i;
      const r = rScale(d.value);
      const color = opts.groupColor ? opts.groupColor[d.group] : "var(--accent)";
      if (i > 0){
        const px = marginX + step*(i-1);
        const mx = (px+cx)/2;
        svg.appendChild(el("path", {d:`M${mx-4},${cy-4} L${mx+4},${cy} L${mx-4},${cy+4}`, fill:"var(--rule-strong)"}));
      }
      const tag = el("text", {x:cx, y:top-14, "text-anchor":"middle", style:`font-size:12.5px;font-weight:600;letter-spacing:.03em;fill:${color};font-family:'IBM Plex Mono',monospace;`});
      tag.textContent = d.tag;
      svg.appendChild(tag);
      svg.appendChild(el("circle", {cx, cy, r, fill:color, opacity:0.92}));
      const val = el("text", {x:cx, y:cy+4.5, "text-anchor":"middle", style:"font-size:13px;font-weight:700;fill:#fff;font-family:'IBM Plex Mono',monospace;"});
      val.textContent = d.value;
      svg.appendChild(val);
      const lines = wrap(d.label);
      maxLines = Math.max(maxLines, lines.length);
      const labelTop = cy + maxR + 17;
      lines.forEach((ln,li)=>{
        const t = el("text", {x:cx, y:labelTop + li*14, "text-anchor":"middle", class:"bar-label", style:"font-size:12px;"});
        t.textContent = ln;
        svg.appendChild(t);
      });
    });
    const H = cy + maxR + 17 + maxLines*14 + 6;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  }

  function vgroup(id, categories, series, opts){
    const svg = svgOf(id);
    const W = opts.W, H = opts.H;
    const left = 30, right = 10, top = 14, bottom = 34;
    const plotW = W-left-right, plotH = H-top-bottom;
    const max = opts.max || Math.max(...series.flatMap(s=>s.values)) * 1.15;
    const catW = plotW/categories.length;
    const barW = Math.min(16, catW/(series.length+1.4));
    [0,0.25,0.5,0.75,1].forEach(f=>{
      const yy = top + plotH*(1-f);
      svg.appendChild(el("line", {x1:left, x2:left+plotW, y1:yy, y2:yy, class:"grid-line"}));
      const t = el("text", {x:left-6, y:yy+3, class:"axis-tick", "text-anchor":"end"});
      t.textContent = Math.round(max*f);
      svg.appendChild(t);
    });
    categories.forEach((cat,ci)=>{
      const cx = left + catW*ci + catW/2;
      series.forEach((s,si)=>{
        const v = s.values[ci];
        const h = (v/max)*plotH;
        const x = cx - (series.length*barW)/2 + si*barW;
        const y = top+plotH-h;
        svg.appendChild(el("rect", {x, y, width:barW-2, height:Math.max(h,1), rx:2, fill:s.color}));
        const t = el("text", {x:x+(barW-2)/2, y:y-4, class:"bar-value", "text-anchor":"middle", style:"font-size:8.6px"});
        t.textContent = v;
        svg.appendChild(t);
      });
      const lab = el("text", {x:cx, y:top+plotH+16, class:"axis-tick", "text-anchor":"middle"});
      lab.textContent = cat;
      svg.appendChild(lab);
    });
    svg.appendChild(el("line", {x1:left, x2:left+plotW, y1:top+plotH, y2:top+plotH, class:"baseline"}));
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  }

  function hstack(id, rows, segKeys, colors, opts){
    const svg = svgOf(id);
    const W = opts.W;
    const left = opts.left || 92, top = 8, rowH = opts.rowH || 34, gap = opts.gap != null ? opts.gap : 20;
    const plotW = W-left-14;
    const total = opts.total || 120;
    const step = opts.step || 20;
    const pitch = rowH+gap;
    rows.forEach((r,ri)=>{
      let x = left;
      const y = top + ri*pitch + gap/2;
      const lab = el("text", {x:left-8, y:y+rowH/2+3.5, class:"bar-label", "text-anchor":"end"});
      lab.textContent = r.name;
      svg.appendChild(lab);
      segKeys.forEach((k,ki)=>{
        const v = r[k];
        const w = (v/total)*plotW;
        svg.appendChild(el("rect", {x, y, width:Math.max(w-1.5,0), height:rowH, fill:colors[ki]}));
        if (w > 22){
          const t = el("text", {x:x+w/2, y:y+rowH/2+3.5, "text-anchor":"middle", style:"font-size:10.5px;font-weight:600;fill:#fff"});
          t.textContent = v;
          svg.appendChild(t);
        }
        x += w;
      });
    });
    const axisY = top + rows.length*(rowH+gap) - gap + 10;
    svg.appendChild(el("line",{x1:left,x2:left+plotW,y1:axisY,y2:axisY,class:"baseline"}));
    for(let v=0; v<=total; v+=step){
      const x = left + (v/total)*plotW;
      const t = el("text",{x,y:axisY+16,class:"axis-tick","text-anchor":"middle"});
      t.textContent = v; svg.appendChild(t);
    }
    let H = axisY + 16 + 10;
    if (opts.xLabel){
      const xlab = el("text",{x:left+plotW/2, y:H+10, class:"axis-tick", "text-anchor":"middle"});
      xlab.textContent = opts.xLabel;
      svg.appendChild(xlab);
      H += 18;
    }
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  }

  function donutSingle(id, data, opts){
    const svg = svgOf(id);
    const W = opts.W;
    const total = data.reduce((a,d)=>a+d.value,0);
    const r = opts.r || 50, hole = opts.hole || 30;
    const rightLegend = opts.legendPos === "right";
    const top = opts.top==null?10:opts.top;
    const cx = rightLegend ? (opts.leftPad==null?12:opts.leftPad) + r : W/2;
    const cy = r + top;
    function polar(cx,cy,rad,angleDeg){
      const a = (angleDeg-90) * Math.PI/180;
      return {x: cx + rad*Math.cos(a), y: cy + rad*Math.sin(a)};
    }
    function arcPath(cx,cy,rOuter,rInner,startAngle,endAngle){
      const largeArc = (endAngle-startAngle) > 180 ? 1 : 0;
      const p1 = polar(cx,cy,rOuter,startAngle), p2 = polar(cx,cy,rOuter,endAngle);
      const p3 = polar(cx,cy,rInner,endAngle), p4 = polar(cx,cy,rInner,startAngle);
      return `M${p1.x},${p1.y} A${rOuter},${rOuter} 0 ${largeArc} 1 ${p2.x},${p2.y} L${p3.x},${p3.y} A${rInner},${rInner} 0 ${largeArc} 0 ${p4.x},${p4.y} Z`;
    }
    let angle = 0;
    data.forEach(d=>{
      const sweep = (d.value/total)*360;
      if (sweep > 0.3){
        svg.appendChild(el("path",{d:arcPath(cx,cy,r,hole,angle,angle+sweep), fill:d.fill, stroke:"var(--paper)","stroke-width":1.5}));
      }
      angle += sweep;
    });
    if (opts.centerWord){
      const cw = el("text",{x:cx,y:cy+4,"text-anchor":"middle",style:"font-size:11px;font-weight:700;fill:var(--ink);font-family:'IBM Plex Mono',monospace;"});
      cw.textContent = opts.centerWord; svg.appendChild(cw);
    } else {
      const ct = el("text",{x:cx,y:cy-3,"text-anchor":"middle",style:"font-size:18px;font-weight:700;fill:var(--ink);font-family:'IBM Plex Mono',monospace;"});
      ct.textContent = total; svg.appendChild(ct);
      const ct2 = el("text",{x:cx,y:cy+13,"text-anchor":"middle",class:"axis-tick"});
      ct2.textContent = opts.centerLabel || "evals"; svg.appendChild(ct2);
    }

    if (rightLegend){
      const rowH = opts.legendRowH || 15;
      const legendX = cx + r + (opts.legendGap==null?18:opts.legendGap);
      const legendTop = cy - (data.length-1)*rowH/2;
      data.forEach((d,i)=>{
        const y = legendTop + i*rowH;
        svg.appendChild(el("rect",{x:legendX, y:y-9, width:10, height:10, rx:2, fill:d.fill}));
        const t = el("text",{x:legendX+15, y:y+1, class:"bar-label", style:"font-size:12px;"});
        t.textContent = `${d.label} (${d.value})`;
        svg.appendChild(t);
      });
      const H = Math.max(2*r + top + (opts.bottom==null?10:opts.bottom), legendTop + (data.length-1)*rowH + 16);
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      return;
    }
    const legendTop = cy + r + 20;
    const cols = opts.legendCols || 2;
    const colW = W/cols;
    const rowH = 15;
    data.forEach((d,i)=>{
      const col = i % cols, row = Math.floor(i/cols);
      const x = 8 + col*colW, y = legendTop + row*rowH;
      svg.appendChild(el("rect",{x, y:y-8, width:9, height:9, rx:2, fill:d.fill}));
      const t = el("text",{x:x+14, y, class:"bar-label", style:"font-size:9.5px;"});
      t.textContent = `${d.label} (${d.value})`;
      svg.appendChild(t);
    });
    const nRows = Math.ceil(data.length/cols);
    const H = legendTop + nRows*rowH + 4;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  }

  function scatterTrend(id, points, opts){
    const svg = svgOf(id);
    const W = opts.W, H = opts.H;
    const left = 34, top = 12, bottom = 30;
    const plotW = W-left-14, plotH = H-top-bottom;
    const xMax = opts.xMax;
    const yMin = opts.yMin != null ? opts.yMin : 0, yMax = opts.yMax != null ? opts.yMax : 100;
    const xScale = x => left + (x-0.5)/(xMax+1) * plotW;
    const yScale = y => top + plotH - ((y-yMin)/(yMax-yMin))*plotH;
    const yStep = (yMax-yMin)/5;
    for(let v=yMin; v<=yMax+0.001; v+=yStep){
      const yy = yScale(v);
      svg.appendChild(el("line", {x1:left, x2:left+plotW, y1:yy, y2:yy, class:"grid-line"}));
      const t = el("text", {x:left-6, y:yy+3, class:"axis-tick", "text-anchor":"end"});
      t.textContent = Math.round(v);
      svg.appendChild(t);
    }
    for(let x=1;x<=xMax;x++){
      const t = el("text", {x:xScale(x), y:top+plotH+16, class:"axis-tick", "text-anchor":"middle"});
      t.textContent = opts.xTickFmt ? opts.xTickFmt(x) : x;
      svg.appendChild(t);
    }
    const xlab = el("text", {x:left+plotW/2, y:H-2, class:"axis-tick", "text-anchor":"middle"});
    xlab.textContent = "grader complexity (leaf checks)";
    svg.appendChild(xlab);
    if (opts.yLabel){
      const ylab = el("text", {x:10, y:top+plotH/2, class:"axis-tick", "text-anchor":"middle", transform:`rotate(-90 10 ${top+plotH/2})`});
      ylab.textContent = opts.yLabel;
      svg.appendChild(ylab);
    }
    svg.appendChild(el("line", {x1:left, x2:left, y1:top, y2:top+plotH, class:"baseline"}));
    let d = "";
    points.forEach((p,i)=>{ d += (i===0?"M":"L") + xScale(p.x) + " " + yScale(p.y) + " "; });
    svg.appendChild(el("path", {d, fill:"none", stroke:"var(--accent)", "stroke-width":2, opacity:0.85}));
    points.forEach(p=>{
      const r = 4 + Math.sqrt(p.n)*0.9;
      const cx = xScale(p.x), cy = yScale(p.y);
      let topEdge = cy - r;
      if (p.ci != null){
        const loVal = Math.max(yMin, p.y - p.ci), hiVal = Math.min(yMax, p.y + p.ci);
        const yLo = yScale(loVal), yHi = yScale(hiVal);
        const capW = 6;
        svg.appendChild(el("line", {x1:cx, x2:cx, y1:yHi, y2:yLo, stroke:"var(--ink-mute)", "stroke-width":1.2}));
        svg.appendChild(el("line", {x1:cx-capW/2, x2:cx+capW/2, y1:yHi, y2:yHi, stroke:"var(--ink-mute)", "stroke-width":1.2}));
        svg.appendChild(el("line", {x1:cx-capW/2, x2:cx+capW/2, y1:yLo, y2:yLo, stroke:"var(--ink-mute)", "stroke-width":1.2}));
        topEdge = Math.min(topEdge, yHi);
      }
      const c = el("circle", {cx, cy, r, fill:"var(--accent)", opacity:0.88});
      const label = opts.xTickFmt ? opts.xTickFmt(p.x) : p.x;
      const title = el("title"); title.textContent = `complexity ${label}: mean ${p.y}% pass` + (p.ci!=null?` (±${p.ci.toFixed(1)} SE)`:"") + `, n=${p.n} evals`;
      c.appendChild(title);
      svg.appendChild(c);
      const nt = el("text", {x:cx, y:topEdge-6, class:"axis-tick", "text-anchor":"middle"});
      nt.textContent = `n=${p.n}`;
      svg.appendChild(nt);
    });
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  }

  function timeHorizonDiagram(id, opts){
    const svg = svgOf(id);
    const W = opts.W, H = opts.H;
    const left = 92, right = 16, rowH = 52;
    const plotW = W-left-right;
    const rows = [
      {label:"Short-form", sub:"single experimental snapshot", dots:1},
      {label:"Long-form", sub:"sequence of timepoints/experiments", dots:5},
    ];
    rows.forEach((r,i)=>{
      const y = 18 + i*rowH;
      const lab = el("text",{x:left-10,y:y+4,class:"bar-label","text-anchor":"end",style:"font-weight:600;"});
      lab.textContent = r.label; svg.appendChild(lab);
      const lineEnd = r.dots===1 ? left+plotW*0.22 : left+plotW;
      svg.appendChild(el("line",{x1:left,x2:lineEnd,y1:y,y2:y,stroke:"var(--ink-mute)","stroke-width":1.4}));
      const n = r.dots;
      for(let k=0;k<n;k++){
        const x = n===1 ? left+plotW*0.11 : left + (k/(n-1))*plotW;
        const isEndpoint = (n===1) || (k===n-1);
        svg.appendChild(el("circle",{cx:x,cy:y,r:isEndpoint?5:3.2,fill:isEndpoint?"var(--accent)":"var(--rule-strong)"}));
      }
      const sub = el("text",{x:left, y:y+20, class:"axis-tick"});
      sub.textContent = r.sub; svg.appendChild(sub);
    });
    const leg1 = el("text",{x:left, y:H-4, class:"axis-tick", style:"fill:var(--accent);"});
    leg1.textContent = "● graded decision";
    svg.appendChild(leg1);
    const leg2 = el("text",{x:left+108, y:H-4, class:"axis-tick"});
    leg2.textContent = "● intermediate";
    svg.appendChild(leg2);
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  }

  function lensPipelineDiagram(id, opts){
    const svg = svgOf(id);
    const W = opts.W, H = opts.H;
    const pillW = 216, pillH = 24, gap = 8;
    const customPillW = 250, customPillH = 34;
    const stockLenses = ["decision-mining","figure-recreation","surprises-mining","cross-source-mining","certified-references-match","skill-mining","literature-sweep","interview-questions","trap-alignment"];
    const customLenses = [
      ["ASO/siRNA Quiddity"],
      ["Drug Development Pitfalls","and Optimization"],
      ["Key Program Decisions &","Technical Judgement"],
    ];
    const leftX = 14, rightX = W-14-customPillW;
    const centerW = 168, centerH = 60;
    const topPad = 34;
    const leftTotalH = stockLenses.length*(pillH+gap)-gap;
    const rightTotalH = customLenses.length*(customPillH+gap)-gap;
    const leftTop = topPad, rightTop = topPad + (leftTotalH-rightTotalH)/2;
    const centerX = (W-centerW)/2, centerY = topPad + leftTotalH/2 - centerH/2;

    const lh = el("text",{x:leftX,y:leftTop-13,class:"axis-tick",style:"font-weight:600;"});
    lh.textContent = "General lenses (9)"; svg.appendChild(lh);
    const rh = el("text",{x:rightX,y:rightTop-13,class:"axis-tick",style:"font-weight:600;"});
    rh.textContent = "Oligo-specific pack (3)"; svg.appendChild(rh);

    stockLenses.forEach((lab,i)=>{
      const y = leftTop + i*(pillH+gap);
      svg.appendChild(el("rect",{x:leftX,y,width:pillW,height:pillH,rx:12,fill:"var(--paper)",stroke:"var(--rule-strong)","stroke-width":1}));
      const t = el("text",{x:leftX+12,y:y+pillH/2+3.5,class:"bar-label",style:"font-size:9.5px;"});
      t.textContent = lab; svg.appendChild(t);
    });
    customLenses.forEach((lines,i)=>{
      const y = rightTop + i*(customPillH+gap);
      svg.appendChild(el("rect",{x:rightX,y,width:customPillW,height:customPillH,rx:12,fill:"var(--accent-100)",stroke:"var(--accent)","stroke-width":1}));
      const lineH = 13;
      const startY = y + customPillH/2 - (lines.length-1)*lineH/2 + 3.5;
      lines.forEach((line,li)=>{
        const t = el("text",{x:rightX+12,y:startY+li*lineH,class:"bar-label",style:"font-size:9.5px;"});
        t.textContent = line; svg.appendChild(t);
      });
    });

    const leftBracketX = leftX+pillW+16, rightBracketX = rightX-16;
    svg.appendChild(el("line",{x1:leftBracketX,x2:leftBracketX,y1:leftTop+pillH/2,y2:leftTop+leftTotalH-pillH/2,stroke:"var(--ink-mute)","stroke-width":1.2}));
    svg.appendChild(el("line",{x1:leftBracketX,x2:centerX-4,y1:leftTop+leftTotalH/2-pillH/2,y2:centerY+centerH/2,stroke:"var(--ink-mute)","stroke-width":1.2}));
    svg.appendChild(el("line",{x1:rightBracketX,x2:rightBracketX,y1:rightTop+pillH/2,y2:rightTop+rightTotalH-pillH/2,stroke:"var(--accent-ink)","stroke-width":1.2}));
    svg.appendChild(el("line",{x1:rightBracketX,x2:centerX+centerW+4,y1:rightTop+rightTotalH/2,y2:centerY+centerH/2,stroke:"var(--accent-ink)","stroke-width":1.2}));

    svg.appendChild(el("rect",{x:centerX,y:centerY,width:centerW,height:centerH,rx:8,fill:"var(--ink)"}));
    const ct = el("text",{x:centerX+centerW/2,y:centerY+centerH/2-3,class:"bar-label","text-anchor":"middle",style:"fill:var(--page);font-weight:600;font-size:11px;"});
    ct.textContent = "Candidate evaluation"; svg.appendChild(ct);
    const ct2 = el("text",{x:centerX+centerW/2,y:centerY+centerH/2+13,class:"bar-label","text-anchor":"middle",style:"fill:var(--page);font-size:9.5px;"});
    ct2.textContent = "ideas"; svg.appendChild(ct2);

    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  }

  // ---- new chart types for Figure 3 (full evaluation campaign) ----

  function forestChart(id, rows, opts){
    const svg = svgOf(id);
    const W = opts.W, left = opts.left || 210, right = opts.right || 50, top = 8, rowH = 22;
    const plotW = W-left-right;
    const max = opts.max || 100;
    const step = opts.step || 20;
    const xScale = v => left + (v/max)*plotW;
    for(let v=0; v<=max; v+=step){
      const x = xScale(v);
      svg.appendChild(el("line",{x1:x,x2:x,y1:top,y2:top+rows.length*rowH+14,class:"grid-line"}));
      const t = el("text",{x, y: top+rows.length*rowH+26, class:"axis-tick", "text-anchor":"middle"});
      t.textContent = v; svg.appendChild(t);
    }
    rows.forEach((r,i)=>{
      const y = top + i*rowH + rowH/2;
      const color = opts.groupColor[r.group] || "var(--accent)";
      const lab = el("text",{x:left-8,y:y+3.5,class:"bar-label","text-anchor":"end"});
      lab.textContent = r.label; svg.appendChild(lab);
      svg.appendChild(el("line",{x1:xScale(r.lo),x2:xScale(r.hi),y1:y,y2:y,stroke:color,"stroke-width":1.6}));
      svg.appendChild(el("circle",{cx:xScale(r.value),cy:y,r:4.2,fill:color}));
      const val = el("text",{x:xScale(r.hi)+6,y:y+3.5,class:"bar-value"});
      val.textContent = r.value.toFixed(1) + "%"; svg.appendChild(val);
    });
    const axisY = top + rows.length*rowH + 4;
    svg.appendChild(el("line",{x1:left,x2:left+plotW,y1:axisY,y2:axisY,class:"baseline"}));
    let H = top+rows.length*rowH+40;
    if (opts.xLabel){
      const xlab = el("text",{x:left+plotW/2, y:H+12, class:"axis-tick", "text-anchor":"middle"});
      xlab.textContent = opts.xLabel;
      svg.appendChild(xlab);
      H += 20;
    }
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  }

  function markerShape(shape, cx, cy, size, fill, opacity){
    const attrs = {fill, opacity};
    if (shape === "square") return el("rect",{x:cx-size*0.85, y:cy-size*0.85, width:size*1.7, height:size*1.7, rx:1, ...attrs});
    if (shape === "triangle"){
      const h = size*1.9;
      return el("path",{d:`M${cx},${cy-h*0.62} L${cx+h*0.58},${cy+h*0.38} L${cx-h*0.58},${cy+h*0.38} Z`, ...attrs});
    }
    if (shape === "diamond"){
      const s = size*1.15;
      return el("path",{d:`M${cx},${cy-s} L${cx+s},${cy} L${cx},${cy+s} L${cx-s},${cy} Z`, ...attrs});
    }
    return el("circle",{cx,cy,r:size,...attrs});
  }

  function scatterFrontier(id, points, opts){
    const svg = svgOf(id);
    const W = opts.W, H = opts.H;
    const left = 34, top = 12, right = 14, bottom = 34;
    const plotW = W-left-right, plotH = H-top-bottom;
    const log = !!opts.logX;
    const xs = points.map(p=>p.x);
    const xMin = opts.xMin || Math.min(...xs), xMax = opts.xMax || Math.max(...xs);
    const xPos = x => log
      ? left + (Math.log(x)-Math.log(xMin))/(Math.log(xMax)-Math.log(xMin)) * plotW
      : left + (x-xMin)/(xMax-xMin) * plotW;
    const yMin = opts.yMin || 0, yMax = opts.yMax || 100;
    const yPos = y => top + plotH - ((y-yMin)/(yMax-yMin))*plotH;
    const yTicks = opts.yTicks || [0,20,40,60,80,100].filter(v=>v>=yMin && v<=yMax);
    yTicks.forEach(v=>{
      const yy = yPos(v);
      svg.appendChild(el("line",{x1:left,x2:left+plotW,y1:yy,y2:yy,class:"grid-line"}));
      const t = el("text",{x:left-6,y:yy+3,class:"axis-tick","text-anchor":"end"});
      t.textContent=v; svg.appendChild(t);
    });
    svg.appendChild(el("line",{x1:left,x2:left,y1:top,y2:top+plotH,class:"baseline"}));
    const bestByGroup = {};
    points.forEach(p=>{ if (!bestByGroup[p.group] || p.value > bestByGroup[p.group].value) bestByGroup[p.group] = p; });
    const champions = Object.values(bestByGroup).sort((a,b)=>a.x-b.x);
    if (champions.length>1){
      let d = "";
      champions.forEach((p,i)=>{ d += (i===0?"M":"L") + xPos(p.x) + " " + yPos(p.value) + " "; });
      svg.appendChild(el("path",{d, fill:"none", stroke:"var(--ink-mute)","stroke-width":1.2,"stroke-dasharray":"3,3"}));
    }
    points.forEach(p=>{
      const harness = p.label.split(" / ")[1];
      const shape = (opts.harnessShape && opts.harnessShape[harness]) || "circle";
      const c = markerShape(shape, xPos(p.x), yPos(p.value), 4.6, opts.groupColor[p.group]||"var(--accent)", 0.9);
      const title = el("title"); title.textContent = `${p.label}: ${p.value}% pass, x=${p.x}`;
      c.appendChild(title);
      svg.appendChild(c);
    });
    if (opts.showRank){
      const placed = [];
      const candidates = [];
      [9, 15, 21].forEach(r=>{
        for (let a=0; a<360; a+=30){
          const rad = a*Math.PI/180;
          candidates.push([r*Math.cos(rad), r*Math.sin(rad)]);
        }
      });
      const ordered = points.slice().sort((a,b)=>xPos(a.x)-xPos(b.x));
      ordered.forEach(p=>{
        const px = xPos(p.x), py = yPos(p.value);
        let chosen = candidates[candidates.length-1];
        for (const c of candidates){
          const lx = px+c[0], ly = py+c[1];
          if (!placed.some(q=>Math.hypot(q[0]-lx,q[1]-ly) < 12)){ chosen = c; break; }
        }
        const lx = px+chosen[0], ly = py+chosen[1];
        placed.push([lx,ly]);
        const t = el("text",{x:lx, y:ly, style:"font-size:8px;font-weight:600;", fill:"var(--ink-mute)"});
        t.textContent = p.rank; svg.appendChild(t);
      });
    }
    (opts.xTicks || []).forEach(v=>{
      const x = xPos(v);
      const t = el("text",{x,y:top+plotH+14,class:"axis-tick","text-anchor":"middle"});
      t.textContent = v; svg.appendChild(t);
    });
    const xlab = el("text",{x:left+plotW/2,y:H-2,class:"axis-tick","text-anchor":"middle"});
    xlab.textContent = opts.xLabel || "";
    svg.appendChild(xlab);
    if (opts.yLabel){
      const ylab = el("text",{x:10,y:top+plotH/2,class:"axis-tick","text-anchor":"middle",transform:`rotate(-90 10 ${top+plotH/2})`});
      ylab.textContent = opts.yLabel;
      svg.appendChild(ylab);
    }
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  }

  function lineChartMulti(id, xLabels, series, opts){
    const svg = svgOf(id);
    const W = opts.W, H = opts.H;
    const left = 34, top = 14, right = opts.right || 190, bottom = 34;
    const plotW = W-left-right, plotH = H-top-bottom;
    const n = xLabels.length;
    const xPos = i => left + (n>1 ? i/(n-1)*plotW : plotW/2);
    const yMax = opts.yMax || 100;
    const yPos = v => top + plotH - (v/yMax)*plotH;
    [0,20,40,60,80,100].forEach(v=>{
      if (v>yMax) return;
      const yy = yPos(v);
      svg.appendChild(el("line",{x1:left,x2:left+plotW,y1:yy,y2:yy,class:"grid-line"}));
      const t = el("text",{x:left-6,y:yy+3,class:"axis-tick","text-anchor":"end"});
      t.textContent=v; svg.appendChild(t);
    });
    xLabels.forEach((lab,i)=>{
      const t = el("text",{x:xPos(i),y:top+plotH+16,class:"axis-tick","text-anchor":"middle"});
      t.textContent = lab; svg.appendChild(t);
    });
    const finals = [];
    series.forEach(s=>{
      const color = opts.groupColor[s.group] || "var(--accent)";
      let d = "";
      s.values.forEach((v,i)=>{ if (v!=null) d += (d===""?"M":"L") + xPos(i) + " " + yPos(v) + " "; });
      svg.appendChild(el("path",{d, fill:"none", stroke:color, "stroke-width":2, opacity:0.92}));
      s.values.forEach((v,i)=>{ if (v!=null) svg.appendChild(el("circle",{cx:xPos(i),cy:yPos(v),r:3.4,fill:color})); });
      const lastIdx = s.values.map((v,i)=>v!=null?i:-1).filter(i=>i>=0).pop();
      finals.push({name:s.name, x:xPos(lastIdx), y:yPos(s.values[lastIdx]), color});
    });
    finals.sort((a,b)=>a.y-b.y);
    const minGap = 13;
    let prevY = null;
    finals.forEach(f=>{
      const y = (prevY!=null && (f.y-prevY)<minGap) ? prevY+minGap : f.y;
      prevY = y;
      const t = el("text",{x:f.x+7,y:y+3.5,style:`font-size:9.5px;font-weight:600;fill:${f.color};font-family:'IBM Plex Mono',monospace;`});
      t.textContent = f.name; svg.appendChild(t);
    });
    if (opts.yLabel){
      const ylab = el("text",{x:10,y:top+plotH/2,class:"axis-tick","text-anchor":"middle",transform:`rotate(-90 10 ${top+plotH/2})`});
      ylab.textContent = opts.yLabel;
      svg.appendChild(ylab);
    }
    if (opts.xLabel){
      const xlab = el("text",{x:left+plotW/2,y:top+plotH+30,class:"axis-tick","text-anchor":"middle"});
      xlab.textContent = opts.xLabel;
      svg.appendChild(xlab);
    }
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  }

  function pairedDelta(id, rows, opts){
    const svg = svgOf(id);
    const W = opts.W, left = 150, right = 90, top = 10, rowH = 40;
    const plotW = W-left-right;
    const max = opts.max || 65;
    const step = opts.step || 20;
    const xScale = v => left + (v/max)*plotW;
    for(let v=0; v<=max; v+=step){
      const x = xScale(v);
      svg.appendChild(el("line",{x1:x,x2:x,y1:top,y2:top+rows.length*rowH+10,class:"grid-line"}));
      const t = el("text",{x,y:top+rows.length*rowH+22,class:"axis-tick","text-anchor":"middle"});
      t.textContent=v; svg.appendChild(t);
    }
    rows.forEach((r,i)=>{
      const y = top + i*rowH + rowH/2;
      const lab = el("text",{x:left-8,y:y+3.5,class:"bar-label","text-anchor":"end"});
      lab.textContent = r.model; svg.appendChild(lab);
      svg.appendChild(el("line",{x1:xScale(r.piLo),x2:xScale(r.piHi),y1:y-6,y2:y-6,stroke:"var(--accent)","stroke-width":1.4}));
      svg.appendChild(el("circle",{cx:xScale(r.pi),cy:y-6,r:3.6,fill:"var(--accent)"}));
      svg.appendChild(el("line",{x1:xScale(r.altLo),x2:xScale(r.altHi),y1:y+6,y2:y+6,stroke:"var(--ink-mute)","stroke-width":1.4}));
      svg.appendChild(el("circle",{cx:xScale(r.alt),cy:y+6,r:3.6,fill:"var(--ink-mute)"}));
      if (r.altName){
        const altLab = el("text",{x:xScale(r.altLo)-6,y:y+16,class:"axis-tick","text-anchor":"end",style:"font-size:8px;"});
        altLab.textContent = r.altName; svg.appendChild(altLab);
      }
      const sign = r.delta>=0 ? "+" : "";
      const t = el("text",{x:left+plotW+8,y:y+3.5,class:"bar-value"});
      t.textContent = `${sign}${r.delta.toFixed(1)}%`; svg.appendChild(t);
    });
    const axisY = top + rows.length*rowH + 4;
    svg.appendChild(el("line",{x1:left,x2:left+plotW,y1:axisY,y2:axisY,class:"baseline"}));
    let H = top+rows.length*rowH+34;
    if (opts.xLabel){
      const xlab = el("text",{x:left+plotW/2, y:H+2, class:"axis-tick", "text-anchor":"middle"});
      xlab.textContent = opts.xLabel;
      svg.appendChild(xlab);
      H += 16;
    }
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  }

  function headToHeadGrid(id, cells, opts){
    const svg = svgOf(id);
    const W = opts.W, maxVal = 6;
    const left = 42, top = 10, right = 8, bottom = opts.xLabel ? 56 : 40;
    const plotW = W-left-right, plotH = W-top-bottom;
    const cell = (v)=> left + (v/maxVal)*plotW;
    for(let v=0;v<=maxVal;v++){
      const x = cell(v), y = top+plotH-(v/maxVal)*plotH;
      svg.appendChild(el("line",{x1:x,x2:x,y1:top,y2:top+plotH,class:"grid-line"}));
      svg.appendChild(el("line",{x1:left,x2:left+plotW,y1:y,y2:y,class:"grid-line"}));
    }
    svg.appendChild(el("line",{x1:left,y1:top+plotH,x2:left+plotW,y2:top,stroke:"var(--rule-strong)","stroke-width":1,"stroke-dasharray":"2,2"}));
    const maxN = Math.max(...cells.map(c=>c.n));
    cells.forEach(c=>{
      const cx = cell(c.x), cy = top+plotH-(c.y/maxVal)*plotH;
      const r = 3 + Math.sqrt(c.n/maxN)*11;
      let fill = "var(--rule-strong)";
      if (c.x>c.y) fill = opts.xColor || "var(--accent-700)"; else if (c.y>c.x) fill = opts.yColor || "var(--gpt)";
      svg.appendChild(el("circle",{cx,cy,r,fill,opacity:0.85}));
      if (r>7){
        const t = el("text",{x:cx,y:cy+3,"text-anchor":"middle",style:"font-size:8.5px;font-weight:600;fill:#fff;font-family:'IBM Plex Mono',monospace;"});
        t.textContent = c.n; svg.appendChild(t);
      }
    });
    for(let v=0;v<=maxVal;v++){
      const t1 = el("text",{x:cell(v),y:top+plotH+22,class:"axis-tick","text-anchor":"middle"});
      t1.textContent=v; svg.appendChild(t1);
      const t2 = el("text",{x:left-20,y:top+plotH-(v/maxVal)*plotH+3,class:"axis-tick","text-anchor":"end"});
      t2.textContent=v; svg.appendChild(t2);
    }
    if (opts.xLabel){
      const xlab = el("text",{x:left+plotW/2, y:top+plotH+38, class:"axis-tick", "text-anchor":"middle"});
      xlab.textContent = opts.xLabel;
      svg.appendChild(xlab);
    }
    if (opts.yLabel){
      const ylab = el("text",{x:12, y:top+plotH/2, class:"axis-tick", "text-anchor":"middle", transform:`rotate(-90 12 ${top+plotH/2})`});
      ylab.textContent = opts.yLabel;
      svg.appendChild(ylab);
    }
    svg.setAttribute("viewBox", `0 0 ${W} ${W}`);
  }

  function lerpColor(hexA, hexB, f){
    const pa = [1,3,5].map(i=>parseInt(hexA.slice(i,i+2),16));
    const pb = [1,3,5].map(i=>parseInt(hexB.slice(i,i+2),16));
    const p = pa.map((a,i)=>Math.round(a + (pb[i]-a)*f));
    return `rgb(${p[0]},${p[1]},${p[2]})`;
  }

  function bubbleMatrix(id, rowLabels, colLabels, cells, opts){
    opts = opts || {};
    const svg = svgOf(id);
    const W = opts.W;
    const legendRight = opts.legendPos === "right";
    const legendW = legendRight ? (opts.legendW || 90) : 0;
    const left = opts.left || 260, top = opts.top==null?6:opts.top, right = (opts.right==null?8:opts.right) + legendW, bottom = opts.bottom==null?90:opts.bottom;
    const legendH = legendRight ? 0 : 40;
    const rowH = opts.rowH || 34;
    const plotW = W-left-right;
    const colW = plotW/colLabels.length;
    const H = top + rowLabels.length*rowH + bottom + legendH;
    const maxR = Math.min(rowH,colW)/2 - 3;
    const colorLo = opts.colorLo || "#f0e6cc", colorHi = opts.colorHi || "#a8791f";
    const colorMid = opts.colorMid;
    const scaleColor = colorMid
      ? (f => f<0.5 ? lerpColor(colorLo, colorMid, f/0.5) : lerpColor(colorMid, colorHi, (f-0.5)/0.5))
      : (f => lerpColor(colorLo, colorHi, f));
    const [domainLo, domainHi] = opts.domain || [0,100];
    const norm = v => (v-domainLo)/(domainHi-domainLo);
    rowLabels.forEach((lab,ri)=>{
      const y = top + ri*rowH + rowH/2;
      const t = el("text",{x:left-8,y:y+3.5,class:"bar-label","text-anchor":"end"});
      t.textContent = lab; svg.appendChild(t);
    });
    colLabels.forEach((lab,ci)=>{
      const x = left + ci*colW + colW/2;
      const y = top + rowLabels.length*rowH + 10;
      const t = el("text",{x:0,y:0,class:"axis-tick","text-anchor":"end",transform:`translate(${x},${y}) rotate(-40)`});
      t.textContent = lab; svg.appendChild(t);
    });
    cells.forEach(c=>{
      const cx = left + c.c*colW + colW/2, cy = top + c.r*rowH + rowH/2;
      const f = Math.max(0, Math.min(1, norm(c.v)));
      const r = 3 + f * maxR;
      const fill = scaleColor(f);
      const circ = el("circle",{cx,cy,r,fill});
      const title = el("title"); title.textContent = `${rowLabels[c.r]} × ${colLabels[c.c]}: ${c.v}%` + (c.n!=null?` (n=${c.n})`:"");
      circ.appendChild(title);
      svg.appendChild(circ);
    });

    // color-scale legend — same lerpColor(colorLo,colorHi) fn and stops the bubbles use above,
    // so the swatch is always calibrated to what's actually on the chart, never a separate guess.
    const gradId = `${id}-grad`;
    const defs = el("defs",{});
    const legFmt = opts.legendFmt || (v=>`${Math.round(v)}%`);
    if (legendRight){
      const barW = 10, barTop = top, barBottom = top + rowLabels.length*rowH, barH = barBottom-barTop;
      const barX = W - legendW + 20;
      const grad = el("linearGradient",{id:gradId, x1:"0%", y1:"100%", x2:"0%", y2:"0%"});
      [0,0.25,0.5,0.75,1].forEach(t=>{
        const stop = el("stop",{offset:`${t*100}%`});
        stop.setAttribute("stop-color", scaleColor(t));
        grad.appendChild(stop);
      });
      defs.appendChild(grad); svg.appendChild(defs);
      const title = el("text",{x:barX-4,y:barTop-10,class:"axis-tick",style:"font-weight:600;","text-anchor":"end"});
      title.textContent = opts.legendTitle || "Pass rate"; svg.appendChild(title);
      svg.appendChild(el("rect",{x:barX,y:barTop,width:barW,height:barH,rx:2,fill:`url(#${gradId})`,stroke:"var(--rule-strong)","stroke-width":0.5}));
      [[1,"end"],[0.5,"middle"],[0,"start"]].forEach(([t,baseline])=>{
        const y = barBottom - t*barH;
        const lab = el("text",{x:barX+barW+6,y:y+3.5,class:"axis-tick"});
        lab.textContent = legFmt(domainLo + t*(domainHi-domainLo)); svg.appendChild(lab);
      });
    } else {
      const legY = top + rowLabels.length*rowH + bottom - 10;
      const legX = left, legW = 160, legHgt = 9;
      const grad = el("linearGradient",{id:gradId, x1:"0%", y1:"0%", x2:"100%", y2:"0%"});
      [0,0.25,0.5,0.75,1].forEach(t=>{
        const stop = el("stop",{offset:`${t*100}%`});
        stop.setAttribute("stop-color", scaleColor(t));
        grad.appendChild(stop);
      });
      defs.appendChild(grad); svg.appendChild(defs);
      const title = el("text",{x:legX,y:legY-7,class:"axis-tick",style:"font-weight:600;"});
      title.textContent = opts.legendTitle || "Pass rate"; svg.appendChild(title);
      svg.appendChild(el("rect",{x:legX,y:legY,width:legW,height:legHgt,rx:2,fill:`url(#${gradId})`,stroke:"var(--rule-strong)","stroke-width":0.5}));
      [[0,"start"],[0.5,"middle"],[1,"end"]].forEach(([t,anchor])=>{
        const lab = el("text",{x:legX+t*legW,y:legY+legHgt+12,class:"axis-tick","text-anchor":anchor});
        lab.textContent = legFmt(domainLo + t*(domainHi-domainLo)); svg.appendChild(lab);
      });
    }
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  }

  function dendrogramChart(id, leaves, segments, opts){
    const svg = svgOf(id);
    const W = opts.W;
    const left = opts.left || 132, right = opts.right || 14, top = opts.top || 10;
    const rowH = opts.rowH || 30;
    const plotH = leaves.length*rowH;
    const axisH = 42;
    const H = top + plotH + axisH;
    const plotW = W - left - right;
    const maxH = opts.maxHeight;
    const xOf = dc => left + (dc/maxH)*plotW;
    const yOf = ic => top + ((ic-5)/10)*rowH + rowH/2;
    segments.forEach(seg=>{
      const pts = seg.ic.map((v,k)=>`${xOf(seg.dc[k])},${yOf(v)}`).join(" ");
      svg.appendChild(el("polyline",{points:pts, fill:"none", stroke:"var(--ink-mute)", "stroke-width":1.3}));
    });
    leaves.forEach((lab,i)=>{
      const y = top + i*rowH + rowH/2;
      const t = el("text",{x:left-8,y:y+3.5,class:"bar-label","text-anchor":"end"});
      t.textContent = lab; svg.appendChild(t);
      svg.appendChild(el("circle",{cx:left,cy:y,r:2.6,fill:"var(--accent)"}));
    });
    const axisY = top + plotH + 10;
    svg.appendChild(el("line",{x1:left,x2:left+plotW,y1:axisY,y2:axisY,class:"baseline"}));
    [0,20,40].filter(v=>v<=maxH+1).forEach(v=>{
      const x = xOf(v);
      svg.appendChild(el("line",{x1:x,x2:x,y1:axisY,y2:axisY+3,stroke:"var(--rule-strong)","stroke-width":1}));
      const t = el("text",{x,y:axisY+13,class:"axis-tick","text-anchor":"middle"});
      t.textContent = v; svg.appendChild(t);
    });
    const axLab = el("text",{x:left+plotW/2,y:H-2,class:"axis-tick","text-anchor":"middle"});
    axLab.textContent = "disagreement, %";
    svg.appendChild(axLab);
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  }

  function mdsScatter(id, points, opts){
    const svg = svgOf(id);
    const W = opts.W, H = opts.H;
    const padL = 38, padR = 14, padT = 14, padB = 40;
    const legendH = 26;
    const plotW = W - padL - padR, plotH = H - padT - padB - legendH;
    const maxAbs = Math.max(...points.map(p=>Math.max(Math.abs(p.x),Math.abs(p.y)))) * 1.28;
    const xOf = x => padL + (x+maxAbs)/(2*maxAbs) * plotW;
    const yOf = y => padT + (maxAbs-y)/(2*maxAbs) * plotH;
    const rawStep = maxAbs/3;
    const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const norm = rawStep/mag;
    const niceStep = (norm<1.5?1:norm<3?2:norm<7?5:10) * mag;
    const nTicks = Math.floor(maxAbs/niceStep);
    for (let i=-nTicks; i<=nTicks; i++){
      const v = i*niceStep;
      const xg = xOf(v), yg = yOf(v);
      svg.appendChild(el("line",{x1:xg,x2:xg,y1:padT,y2:padT+plotH,class:"grid-line",opacity:i===0?1:0.4}));
      svg.appendChild(el("line",{x1:padL,x2:padL+plotW,y1:yg,y2:yg,class:"grid-line",opacity:i===0?1:0.4}));
      const tx = el("text",{x:xg,y:padT+plotH+14,class:"axis-tick","text-anchor":"middle"});
      tx.textContent = Math.round(v); svg.appendChild(tx);
      const ty = el("text",{x:padL-6,y:yg+3,class:"axis-tick","text-anchor":"end"});
      ty.textContent = Math.round(v); svg.appendChild(ty);
    }
    const xlab = el("text",{x:padL+plotW/2,y:padT+plotH+28,class:"axis-tick","text-anchor":"middle",style:"font-weight:600;"});
    xlab.textContent = "Dimension 1"; svg.appendChild(xlab);
    const ylab = el("text",{x:12,y:padT+plotH/2,class:"axis-tick","text-anchor":"middle",style:"font-weight:600;",transform:`rotate(-90 12 ${padT+plotH/2})`});
    ylab.textContent = "Dimension 2"; svg.appendChild(ylab);
    points.forEach(p=>{
      const cx = xOf(p.x), cy = yOf(p.y);
      svg.appendChild(el("circle",{cx,cy,r:5,fill:p.color}));
      const t = el("text",{x:cx+(p.dx==null?7:p.dx), y:cy+(p.dy==null?3.5:p.dy), class:"axis-tick", "text-anchor":p.anchor||"start"});
      t.textContent = p.label; svg.appendChild(t);
    });
    const families = [["Claude","var(--claude)"],["OpenAI","var(--fam-gpt)"],["Gemini","var(--gemini)"],["Grok","var(--grok)"]];
    const legY = H-10;
    let lx = padL;
    families.forEach(([name,color])=>{
      svg.appendChild(el("circle",{cx:lx+4,cy:legY,r:4,fill:color}));
      const t = el("text",{x:lx+11,y:legY+3.5,class:"axis-tick"});
      t.textContent = name; svg.appendChild(t);
      lx += 11 + name.length*5.6 + 14;
    });
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  }

  function renderCharts(){
    const discoveryPath = [
      {tag:"§1", label:"Target feasibility", value:4, group:1},
      {tag:"§2", label:"Sequence & Physchem Design", value:16, group:1},
      {tag:"§3", label:"Chemistry Evaluation", value:10, group:1},
      {tag:"§4", label:"Screening & hit ID", value:4, group:2},
      {tag:"§5", label:"Potency & Efficacy", value:11, group:2},
      {tag:"§6", label:"Off-target & Cytotoxicity", value:20, group:2},
      {tag:"§7", label:"Phenotype rescue", value:5, group:3},
      {tag:"§8", label:"Safety & Toxicity", value:26, group:3},
      {tag:"§9", label:"PK/PD & Biodistribution", value:15, group:3},
      {tag:"§10", label:"Candidate benchmarking", value:2, group:3},
    ];
    pathChart("chart-taxonomy", discoveryPath, { W:1020, marginX:60, top:34, minR:11, maxR:27,
      groupColor:{1:"var(--tier1)",2:"var(--tier2)",3:"var(--tier3)"} });

    const taskTypeData = [
      ["Assess safety",32],["Assess target pharmacology",19],["Assess specificity",18],
      ["Characterize PK/PD",14],["Integrate a program decision",12],["Identify leads",8],
      ["Run supporting analysis",10]
    ].map(([label,value])=>({label,value,fill:"var(--accent)"}));
    hbar("chart-tasktype", taskTypeData, {W:350, left:195, right:22, rowH:16, max:34, textSize:9.5});

    const assayType = [
      ["PK, biodistribution & toxicology",41],["Off-target & mechanism profiling",35],
      ["Duplex biophysics & binding",12],["Cytotoxicity & dose-response",10],
      ["Protein & splice-isoform assays",9],["Expression & knockdown assays",6]
    ].map(([label,value])=>({label,value,fill:"var(--accent)"}));
    hbar("chart-assaytype", assayType, {W:350, left:205, right:22, rowH:18, gap:0, max:43, textSize:9});

    const rampGold = n => Array.from({length:n}, (_,i)=> n>1 ? lerpColor("#3a3833","#e6d5a3", i/(n-1)) : "#3a3833");

    const diseaseNamed = [
      ["ALS/FTD spectrum",17],["Tauopathy (MAPT)",10],["Myotonic dystrophy type 1",5],
      ["Huntington's disease",4],["KCNT1 epilepsy",2],
    ];
    const diseaseColors = rampGold(diseaseNamed.length);
    const diseaseData = diseaseNamed.map(([label,value],i)=>({label,value,fill:diseaseColors[i]}))
      .concat([{label:"General or blinded", value:75, fill:"var(--rule-strong)"}]);
    donutSingle("chart-disease", diseaseData, {W:340, r:52, hole:32, top:14, legendPos:"right", legendGap:20, legendRowH:20, centerWord:"Disease"});

    const targetNamed = [
      ["ATXN2",10],["MAPT",10],["DMPK",5],["SOD1",4],["HTT",4],["STMN2",3],["KCNT1",2],
    ];
    const targetColors = rampGold(targetNamed.length);
    const targetData = targetNamed.map(([label,value],i)=>({label,value,fill:targetColors[i]}))
      .concat([{label:"General or blinded", value:75, fill:"var(--rule-strong)"}]);
    donutSingle("chart-genetarget", targetData, {W:340, r:52, hole:32, top:14, legendPos:"right", legendGap:20, legendRowH:20, centerWord:"Target"});

    const tissueNamed = [
      ["Liver / hepatocyte",35],["Brain, spinal cord & neurons",25],["Cultured cell line",12],
      ["Skeletal / cardiac muscle",3],["Kidney / renal",1],["Other named tissue",5],
    ];
    const tissueColors = rampGold(tissueNamed.length);
    const tissueData = tissueNamed.map(([label,value],i)=>({label,value,fill:tissueColors[i]}))
      .concat([{label:"General or blinded", value:32, fill:"var(--rule-strong)"}]);
    donutSingle("chart-tissue", tissueData, {W:340, r:52, hole:32, top:14, legendPos:"right", legendGap:20, legendRowH:20, centerWord:"Tissue"});

    const graderType = [
      ["Boolean pass/fail check",119],["Numeric-range check",96],["All-must-pass conjunction",77],["Label-set overlap score",28],
      ["Numeric-tolerance window",20],["Marker-gene precision/recall check",15],["Key-value dictionary match",8],["Ordered-sequence match",1]
    ].map(([label,value])=>({label,value,fill:"var(--accent)"}));
    hbar("chart-gradertype", graderType, {W:340, left:205, right:20, rowH:18, max:145, textSize:8.5});

    const failureMode = [
      ["Subset / scope / compartment",41],["Batch / condition / platform comparability",21],
      ["Metric / statistic mismatch",18],["Replicate / unit of analysis",18],
      ["Causal / epistemic overreach",13],["Biological interpretation",12],
      ["Normalization / representation",12],["QC / control artifact",11],
      ["Marker / reference / label scope",11],["Threshold / resolution instability",11],
      ["Readout selection and scope",2]
    ].map(([label,value])=>({label,value,fill:"var(--accent)"}));
    hbar("chart-failuremode", failureMode, {W:400, left:240, right:30, rowH:16, max:52, textSize:9.5});

    const kjd = [
      ["Dose Selection & PK/PD Decisions",18],["Sequence & Chemistry Design",12],
      ["Toxicology & Safety Judgement Calls",11],["Analytical Method & Spec. Decisions",7],
      ["Go/No-Go & Portfolio Decisions",5],["Modality & Mechanism Selection",5],
      ["Preclinical Study Design",4],["Target Selection & Validation",1],
      ["Delivery Technology Decisions",1],
    ].map(([label,value])=>({label,value,fill:"var(--accent)"}));
    hbar("chart-kjd", kjd, {W:420, left:190, right:30, rowH:22, max:21});

    const lensColors = rampGold(3);
    const lensMatchData = [
      {label:"Quiddity", value:19, fill:lensColors[0]},
      {label:"Pitfalls", value:19, fill:lensColors[1]},
      {label:"Key Program Decisions", value:54, fill:lensColors[2]},
      {label:"General", value:21, fill:"var(--rule-strong)"},
    ];
    donutSingle("chart-lens", lensMatchData, {W:320, r:70, hole:50, legendCols:1, centerLabel:"evaluations"});

    lensPipelineDiagram("chart-lens-pipeline", {W:800, H:330});

    // ---- FIG. 4: full evaluation campaign (real, computed rollout data) ----
    const familyColor = {Claude:"var(--claude)", OpenAI:"var(--fam-gpt)", Gemini:"var(--gemini)", Grok:"var(--grok)"};

    const PASSRATE = [{"label":"gpt-6-astra / OpenAI Codex","value":55.5,"lo":47.2,"hi":63.7,"group":"OpenAI"},{"label":"gpt-6-astra / Pi","value":53.4,"lo":44.9,"hi":61.9,"group":"OpenAI"},{"label":"claude-opus-5 / Claude Code","value":48.1,"lo":40.1,"hi":56.1,"group":"Claude"},{"label":"grok-4.6 / Pi","value":44.0,"lo":35.9,"hi":52.0,"group":"Grok"},{"label":"grok-4.6 / Grok Build","value":42.8,"lo":35.1,"hi":50.4,"group":"Grok"},{"label":"claude-opus-5 / Pi","value":42.2,"lo":34.4,"hi":50.0,"group":"Claude"},{"label":"claude-opus-4-8 / Claude Code","value":39.6,"lo":32.0,"hi":47.3,"group":"Claude"},{"label":"gemini-3.7-flash / Pi","value":39.5,"lo":31.1,"hi":47.9,"group":"Gemini"},{"label":"claude-opus-4-8 / Pi","value":39.3,"lo":31.6,"hi":46.9,"group":"Claude"},{"label":"claude-sonnet-5 / Claude Code","value":39.3,"lo":31.7,"hi":46.9,"group":"Claude"},{"label":"gpt-5.6-sol / Pi","value":38.9,"lo":31.0,"hi":46.9,"group":"OpenAI"},{"label":"gemini-3.5-flash / Pi","value":38.6,"lo":30.8,"hi":46.5,"group":"Gemini"},{"label":"grok-4.5 / Pi","value":38.3,"lo":30.6,"hi":46.1,"group":"Grok"},{"label":"claude-sonnet-5 / Pi","value":36.2,"lo":28.7,"hi":43.6,"group":"Claude"},{"label":"gpt-5.6-sol / OpenAI Codex","value":34.5,"lo":27.2,"hi":41.8,"group":"OpenAI"},{"label":"gpt-5.5 / Pi","value":33.6,"lo":25.9,"hi":41.4,"group":"OpenAI"},{"label":"gpt-5.6-terra / Pi","value":33.3,"lo":25.8,"hi":40.9,"group":"OpenAI"},{"label":"gpt-5.6-terra / OpenAI Codex","value":32.4,"lo":25.1,"hi":39.8,"group":"OpenAI"},{"label":"gpt-5.5 / OpenAI Codex","value":30.4,"lo":23.2,"hi":37.6,"group":"OpenAI"},{"label":"gpt-5.6-luna / OpenAI Codex","value":23.9,"lo":16.9,"hi":30.9,"group":"OpenAI"},{"label":"gpt-5.6-luna / Pi","value":23.3,"lo":16.8,"hi":29.8,"group":"OpenAI"}];
    forestChart("chart-fig3-passrate", PASSRATE, {W:440, left:122, right:42, groupColor:familyColor, max:60, step:10, xLabel:"endpoint pass rate (%)"});

    const REPEAT = [{"name":"gpt-6-astra / OpenAI Codex","passed_0":38,"passed_1":10,"passed_2":17,"passed_3":48},{"name":"gpt-6-astra / Pi","passed_0":41,"passed_1":14,"passed_2":7,"passed_3":51},{"name":"claude-opus-5 / Claude Code","passed_0":41,"passed_1":19,"passed_2":15,"passed_3":38},{"name":"grok-4.6 / Pi","passed_0":47,"passed_1":17,"passed_2":15,"passed_3":34},{"name":"grok-4.6 / Grok Build","passed_0":44,"passed_1":22,"passed_2":18,"passed_3":29},{"name":"claude-opus-5 / Pi","passed_0":48,"passed_1":16,"passed_2":20,"passed_3":29},{"name":"claude-opus-4-8 / Claude Code","passed_0":46,"passed_1":23,"passed_2":14,"passed_3":27},{"name":"gemini-3.7-flash / Pi","passed_0":59,"passed_1":9,"passed_2":10,"passed_3":35},{"name":"claude-opus-4-8 / Pi","passed_0":49,"passed_1":17,"passed_2":20,"passed_3":25},{"name":"claude-sonnet-5 / Claude Code","passed_0":47,"passed_1":25,"passed_2":13,"passed_3":27},{"name":"gpt-5.6-sol / Pi","passed_0":52,"passed_1":18,"passed_2":12,"passed_3":30},{"name":"gemini-3.5-flash / Pi","passed_0":56,"passed_1":9,"passed_2":22,"passed_3":26},{"name":"grok-4.5 / Pi","passed_0":52,"passed_1":20,"passed_2":13,"passed_3":28},{"name":"claude-sonnet-5 / Pi","passed_0":50,"passed_1":24,"passed_2":12,"passed_3":24},{"name":"gpt-5.6-sol / OpenAI Codex","passed_0":54,"passed_1":22,"passed_2":16,"passed_3":21},{"name":"gpt-5.5 / Pi","passed_0":61,"passed_1":15,"passed_2":12,"passed_3":25},{"name":"gpt-5.6-terra / Pi","passed_0":61,"passed_1":13,"passed_2":17,"passed_3":22},{"name":"gpt-5.6-terra / OpenAI Codex","passed_0":58,"passed_1":21,"passed_2":13,"passed_3":21},{"name":"gpt-5.5 / OpenAI Codex","passed_0":63,"passed_1":15,"passed_2":17,"passed_3":18},{"name":"gpt-5.6-luna / OpenAI Codex","passed_0":75,"passed_1":11,"passed_2":11,"passed_3":16},{"name":"gpt-5.6-luna / Pi","passed_0":70,"passed_1":20,"passed_2":10,"passed_3":13}];
    hstack("chart-fig3-repeat", REPEAT, ["passed_0","passed_1","passed_2","passed_3"],
      ["var(--rule-strong)","var(--accent-400)","var(--accent)","var(--accent-700)"], {W:440, left:122, rowH:16, gap:6, total:120, step:20, xLabel:"evaluations (n)"});

    const COSTTOKEN = [{"label":"claude-opus-4-8 / Claude Code","cost":2.052,"tok":0.845,"value":39.6,"group":"Claude"},{"label":"claude-opus-4-8 / Pi","cost":1.879,"tok":0.552,"value":39.3,"group":"Claude"},{"label":"claude-opus-5 / Claude Code","cost":1.349,"tok":0.762,"value":48.1,"group":"Claude"},{"label":"claude-opus-5 / Pi","cost":1.064,"tok":0.412,"value":42.2,"group":"Claude"},{"label":"claude-sonnet-5 / Claude Code","cost":1.097,"tok":1.558,"value":39.3,"group":"Claude"},{"label":"claude-sonnet-5 / Pi","cost":1.269,"tok":1.557,"value":36.2,"group":"Claude"},{"label":"gemini-3.5-flash / Pi","cost":1.097,"tok":1.934,"value":38.6,"group":"Gemini"},{"label":"gemini-3.7-flash / Pi","cost":0.532,"tok":1.889,"value":39.5,"group":"Gemini"},{"label":"gpt-5.5 / OpenAI Codex","cost":0.978,"tok":0.618,"value":30.4,"group":"OpenAI"},{"label":"gpt-5.5 / Pi","cost":0.965,"tok":0.446,"value":33.6,"group":"OpenAI"},{"label":"gpt-5.6-luna / OpenAI Codex","cost":0.053,"tok":0.942,"value":23.9,"group":"OpenAI"},{"label":"gpt-5.6-luna / Pi","cost":0.049,"tok":0.792,"value":23.3,"group":"OpenAI"},{"label":"gpt-5.6-sol / OpenAI Codex","cost":0.615,"tok":0.376,"value":34.5,"group":"OpenAI"},{"label":"gpt-5.6-sol / Pi","cost":0.48,"tok":0.325,"value":38.9,"group":"OpenAI"},{"label":"gpt-5.6-terra / OpenAI Codex","cost":0.276,"tok":0.404,"value":32.4,"group":"OpenAI"},{"label":"gpt-5.6-terra / Pi","cost":0.244,"tok":0.286,"value":33.3,"group":"OpenAI"},{"label":"gpt-6-astra / OpenAI Codex","cost":0.8,"tok":0.238,"value":55.5,"group":"OpenAI"},{"label":"gpt-6-astra / Pi","cost":0.198,"tok":0.135,"value":53.4,"group":"OpenAI"},{"label":"grok-4.5 / Pi","cost":0.453,"tok":0.488,"value":38.3,"group":"Grok"},{"label":"grok-4.6 / Grok Build","cost":0.7,"tok":0.669,"value":42.8,"group":"Grok"},{"label":"grok-4.6 / Pi","cost":0.587,"tok":0.479,"value":44.0,"group":"Grok"}];
    const harnessShape = {"Pi":"circle","Claude Code":"square","OpenAI Codex":"triangle","Grok Build":"diamond"};
    const COSTTOKEN_RANKED = COSTTOKEN.slice().sort((a,b)=>b.value-a.value).map((p,i)=>({...p, rank:i+1}));
    const rankByLabel = Object.fromEntries(COSTTOKEN_RANKED.map(p=>[p.label,p.rank]));
    scatterFrontier("chart-full-cost", COSTTOKEN.map(p=>({...p, x:p.cost, rank:rankByLabel[p.label]})), {W:400, H:330, logX:true, xMin:0.04, xMax:2.5, xTicks:[0.05,0.1,0.2,0.5,1,2], yMin:20, yMax:60, yTicks:[20,30,40,50,60], showRank:true, groupColor:familyColor, harnessShape, xLabel:"mean cost per completed run (USD, log)", yLabel:"pass rate (%)"});
    scatterFrontier("chart-full-tokens", COSTTOKEN.map(p=>({...p, x:p.tok, rank:rankByLabel[p.label]})), {W:400, H:330, logX:true, xMin:0.1, xMax:2.2, xTicks:[0.1,0.2,0.5,1,2], yMin:20, yMax:60, yTicks:[20,30,40,50,60], showRank:true, groupColor:familyColor, harnessShape, xLabel:"mean total tokens per run (millions, log)", yLabel:"pass rate (%)"});

    const STAGE_LABELS = ["§1","§2","§3","§4","§5","§6","§7","§8","§9","§10"];
    const STAGE_SERIES = [{"name":"gpt-6-astra / OpenAI Codex","group":"OpenAI","values":[33.3,52.1,60.0,75.0,63.6,56.7,20.0,60.3,55.6,33.3]},{"name":"claude-opus-5 / Claude Code","group":"Claude","values":[66.7,54.2,73.3,33.3,48.5,41.7,73.3,39.7,37.8,50.0]},{"name":"grok-4.6 / Pi","group":"Grok","values":[33.3,31.2,53.3,25.0,45.5,40.0,20.0,52.6,55.6,50.0]},{"name":"gemini-3.7-flash / Pi","group":"Gemini","values":[41.7,25.0,70.0,8.3,48.5,41.7,0.0,48.7,35.6,0.0]}];
    lineChartMulti("chart-full-stage", STAGE_LABELS, STAGE_SERIES, {W:900, H:340, groupColor:familyColor, yLabel:"pass rate (%)", xLabel:"stage"});

    const HARNESSDELTA = [{"model":"gpt-6-astra","altName":"OpenAI Codex","pi":53.4,"piLo":44.9,"piHi":61.9,"alt":55.5,"altLo":47.2,"altHi":63.7,"delta":-2.1},{"model":"grok-4.6","altName":"Grok Build","pi":44.0,"piLo":35.9,"piHi":52.0,"alt":42.8,"altLo":35.1,"altHi":50.4,"delta":1.2},{"model":"claude-opus-5","altName":"Claude Code","pi":42.2,"piLo":34.4,"piHi":50.0,"alt":48.1,"altLo":40.1,"altHi":56.1,"delta":-5.9},{"model":"claude-opus-4-8","altName":"Claude Code","pi":39.3,"piLo":31.6,"piHi":46.9,"alt":39.6,"altLo":32.0,"altHi":47.3,"delta":-0.4},{"model":"gpt-5.6-sol","altName":"OpenAI Codex","pi":38.9,"piLo":31.0,"piHi":46.9,"alt":34.5,"altLo":27.2,"altHi":41.8,"delta":4.4},{"model":"claude-sonnet-5","altName":"Claude Code","pi":36.2,"piLo":28.7,"piHi":43.6,"alt":39.3,"altLo":31.7,"altHi":46.9,"delta":-3.1},{"model":"gpt-5.5","altName":"OpenAI Codex","pi":33.6,"piLo":25.9,"piHi":41.4,"alt":30.4,"altLo":23.2,"altHi":37.6,"delta":3.2},{"model":"gpt-5.6-terra","altName":"OpenAI Codex","pi":33.3,"piLo":25.8,"piHi":40.9,"alt":32.4,"altLo":25.1,"altHi":39.8,"delta":0.9},{"model":"gpt-5.6-luna","altName":"OpenAI Codex","pi":23.3,"piLo":16.8,"piHi":29.8,"alt":23.9,"altLo":16.9,"altHi":30.9,"delta":-0.6}];
    pairedDelta("chart-full-harnessdelta", HARNESSDELTA, {W:700, max:60, step:10, xLabel:"pass rate (%)"});

    const H2H_A = [{"x":0,"y":0,"n":15},{"x":0,"y":1,"n":3},{"x":0,"y":2,"n":1},{"x":0,"y":3,"n":2},{"x":0,"y":4,"n":4},{"x":0,"y":5,"n":5},{"x":0,"y":6,"n":5},{"x":1,"y":0,"n":2},{"x":1,"y":1,"n":2},{"x":1,"y":6,"n":3},{"x":2,"y":0,"n":1},{"x":2,"y":5,"n":1},{"x":2,"y":6,"n":2},{"x":3,"y":0,"n":1},{"x":3,"y":1,"n":1},{"x":3,"y":2,"n":2},{"x":3,"y":4,"n":1},{"x":3,"y":5,"n":2},{"x":4,"y":0,"n":2},{"x":4,"y":1,"n":1},{"x":4,"y":2,"n":1},{"x":4,"y":3,"n":1},{"x":4,"y":5,"n":1},{"x":4,"y":6,"n":1},{"x":5,"y":0,"n":4},{"x":5,"y":1,"n":1},{"x":5,"y":2,"n":4},{"x":5,"y":3,"n":1},{"x":5,"y":4,"n":2},{"x":5,"y":6,"n":1},{"x":6,"y":0,"n":10},{"x":6,"y":1,"n":4},{"x":6,"y":2,"n":3},{"x":6,"y":3,"n":3},{"x":6,"y":4,"n":4},{"x":6,"y":5,"n":6},{"x":6,"y":6,"n":10}];
    const H2H_B = [{"x":0,"y":0,"n":10},{"x":0,"y":1,"n":6},{"x":0,"y":2,"n":3},{"x":0,"y":3,"n":4},{"x":0,"y":4,"n":4},{"x":0,"y":5,"n":4},{"x":0,"y":6,"n":4},{"x":1,"y":0,"n":3},{"x":1,"y":2,"n":1},{"x":1,"y":3,"n":1},{"x":1,"y":5,"n":1},{"x":1,"y":6,"n":1},{"x":2,"y":0,"n":1},{"x":2,"y":2,"n":2},{"x":2,"y":6,"n":1},{"x":3,"y":0,"n":4},{"x":3,"y":1,"n":1},{"x":3,"y":2,"n":2},{"x":4,"y":0,"n":2},{"x":4,"y":1,"n":2},{"x":4,"y":2,"n":1},{"x":4,"y":5,"n":2},{"x":5,"y":0,"n":4},{"x":5,"y":1,"n":3},{"x":5,"y":2,"n":1},{"x":5,"y":3,"n":3},{"x":5,"y":5,"n":1},{"x":5,"y":6,"n":1},{"x":6,"y":0,"n":9},{"x":6,"y":1,"n":4},{"x":6,"y":2,"n":4},{"x":6,"y":3,"n":1},{"x":6,"y":4,"n":2},{"x":6,"y":5,"n":3},{"x":6,"y":6,"n":17}];
    const H2H_C = [{"x":0,"y":0,"n":18},{"x":0,"y":1,"n":3},{"x":0,"y":2,"n":5},{"x":0,"y":3,"n":2},{"x":0,"y":4,"n":2},{"x":0,"y":6,"n":5},{"x":1,"y":0,"n":4},{"x":1,"y":1,"n":3},{"x":1,"y":3,"n":1},{"x":1,"y":4,"n":1},{"x":1,"y":5,"n":2},{"x":1,"y":6,"n":1},{"x":2,"y":0,"n":3},{"x":2,"y":1,"n":4},{"x":2,"y":2,"n":2},{"x":2,"y":3,"n":1},{"x":2,"y":5,"n":1},{"x":3,"y":0,"n":1},{"x":3,"y":2,"n":1},{"x":3,"y":3,"n":3},{"x":3,"y":5,"n":1},{"x":3,"y":6,"n":1},{"x":4,"y":0,"n":1},{"x":4,"y":1,"n":3},{"x":4,"y":2,"n":1},{"x":4,"y":3,"n":1},{"x":4,"y":4,"n":1},{"x":4,"y":5,"n":1},{"x":4,"y":6,"n":3},{"x":5,"y":0,"n":1},{"x":5,"y":1,"n":1},{"x":5,"y":2,"n":2},{"x":5,"y":3,"n":1},{"x":5,"y":5,"n":4},{"x":5,"y":6,"n":6},{"x":6,"y":0,"n":5},{"x":6,"y":1,"n":2},{"x":6,"y":2,"n":3},{"x":6,"y":4,"n":2},{"x":6,"y":5,"n":2},{"x":6,"y":6,"n":8}];
    headToHeadGrid("chart-h2h-1", H2H_A, {W:260, xLabel:"GPT-6 Astra", yLabel:"Claude Opus 5", xColor:"var(--fam-gpt)", yColor:"var(--claude)"});
    headToHeadGrid("chart-h2h-2", H2H_B, {W:260, xLabel:"GPT-6 Astra", yLabel:"Grok 4.6", xColor:"var(--fam-gpt)", yColor:"var(--grok)"});
    headToHeadGrid("chart-h2h-3", H2H_C, {W:260, xLabel:"Claude Opus 5", yLabel:"Grok 4.6", xColor:"var(--claude)", yColor:"var(--grok)"});

    const ASSAY_ROWS = ["Oligo off-target prediction (n=20)","Minor assay types, combined (n=17)","Oligo sequence design (n=14)","Organ / tissue toxicity (n=15)","Target knockdown (n=10)","Other (n=9)","QC / experimental design (n=7)","Dose response (n=6)","Biomarker panel (n=6)","RNA-seq (n=5)","Splicing / isoform analysis (n=4)"];
    const ASSAY_COLS = ["gpt-6-astra","grok-4.6","claude-opus-5","gemini-3.5-flash","claude-opus-4-8","gemini-3.7-flash","grok-4.5","claude-sonnet-5","gpt-5.5","gpt-5.6-sol","gpt-5.6-terra","gpt-5.6-luna"];
    const ASSAY_CELLS = [{"r":0,"c":0,"v":51},{"r":0,"c":1,"v":34},{"r":0,"c":2,"v":51},{"r":0,"c":3,"v":28},{"r":0,"c":4,"v":40},{"r":0,"c":5,"v":35},{"r":0,"c":6,"v":35},{"r":0,"c":7,"v":34},{"r":0,"c":8,"v":30},{"r":0,"c":9,"v":45},{"r":0,"c":10,"v":25},{"r":0,"c":11,"v":23},{"r":1,"c":0,"v":39},{"r":1,"c":1,"v":42},{"r":1,"c":2,"v":43},{"r":1,"c":3,"v":26},{"r":1,"c":4,"v":30},{"r":1,"c":5,"v":30},{"r":1,"c":6,"v":32},{"r":1,"c":7,"v":39},{"r":1,"c":8,"v":21},{"r":1,"c":9,"v":20},{"r":1,"c":10,"v":24},{"r":1,"c":11,"v":21},{"r":2,"c":0,"v":57},{"r":2,"c":1,"v":50},{"r":2,"c":2,"v":62},{"r":2,"c":3,"v":55},{"r":2,"c":4,"v":50},{"r":2,"c":5,"v":64},{"r":2,"c":6,"v":43},{"r":2,"c":7,"v":41},{"r":2,"c":8,"v":57},{"r":2,"c":9,"v":64},{"r":2,"c":10,"v":66},{"r":2,"c":11,"v":35},{"r":3,"c":0,"v":67},{"r":3,"c":1,"v":60},{"r":3,"c":2,"v":36},{"r":3,"c":3,"v":64},{"r":3,"c":4,"v":64},{"r":3,"c":5,"v":58},{"r":3,"c":6,"v":56},{"r":3,"c":7,"v":44},{"r":3,"c":8,"v":47},{"r":3,"c":9,"v":47},{"r":3,"c":10,"v":44},{"r":3,"c":11,"v":36},{"r":4,"c":0,"v":60},{"r":4,"c":1,"v":60},{"r":4,"c":2,"v":34},{"r":4,"c":3,"v":37},{"r":4,"c":4,"v":26},{"r":4,"c":5,"v":67},{"r":4,"c":6,"v":50},{"r":4,"c":7,"v":37},{"r":4,"c":8,"v":37},{"r":4,"c":9,"v":53},{"r":4,"c":10,"v":40},{"r":4,"c":11,"v":23},{"r":5,"c":0,"v":67},{"r":5,"c":1,"v":37},{"r":5,"c":2,"v":41},{"r":5,"c":3,"v":41},{"r":5,"c":4,"v":49},{"r":5,"c":5,"v":26},{"r":5,"c":6,"v":33},{"r":5,"c":7,"v":33},{"r":5,"c":8,"v":33},{"r":5,"c":9,"v":30},{"r":5,"c":10,"v":30},{"r":5,"c":11,"v":19},{"r":6,"c":0,"v":71},{"r":6,"c":1,"v":29},{"r":6,"c":2,"v":33},{"r":6,"c":3,"v":10},{"r":6,"c":4,"v":19},{"r":6,"c":5,"v":0},{"r":6,"c":6,"v":14},{"r":6,"c":7,"v":40},{"r":6,"c":8,"v":19},{"r":6,"c":9,"v":10},{"r":6,"c":10,"v":24},{"r":6,"c":11,"v":14},{"r":7,"c":0,"v":67},{"r":7,"c":1,"v":56},{"r":7,"c":2,"v":72},{"r":7,"c":3,"v":61},{"r":7,"c":4,"v":67},{"r":7,"c":5,"v":56},{"r":7,"c":6,"v":39},{"r":7,"c":7,"v":50},{"r":7,"c":8,"v":61},{"r":7,"c":9,"v":50},{"r":7,"c":10,"v":39},{"r":7,"c":11,"v":22},{"r":8,"c":0,"v":33},{"r":8,"c":1,"v":72},{"r":8,"c":2,"v":17},{"r":8,"c":3,"v":33},{"r":8,"c":4,"v":33},{"r":8,"c":5,"v":33},{"r":8,"c":6,"v":39},{"r":8,"c":7,"v":22},{"r":8,"c":8,"v":17},{"r":8,"c":9,"v":28},{"r":8,"c":10,"v":11},{"r":8,"c":11,"v":11},{"r":9,"c":0,"v":20},{"r":9,"c":1,"v":33},{"r":9,"c":2,"v":7},{"r":9,"c":3,"v":47},{"r":9,"c":4,"v":7},{"r":9,"c":5,"v":7},{"r":9,"c":6,"v":20},{"r":9,"c":7,"v":27},{"r":9,"c":8,"v":20},{"r":9,"c":9,"v":20},{"r":9,"c":10,"v":20},{"r":9,"c":11,"v":20},{"r":10,"c":0,"v":16},{"r":10,"c":1,"v":9},{"r":10,"c":2,"v":16},{"r":10,"c":3,"v":0},{"r":10,"c":4,"v":16},{"r":10,"c":5,"v":25},{"r":10,"c":6,"v":34},{"r":10,"c":7,"v":0},{"r":10,"c":8,"v":16},{"r":10,"c":9,"v":34},{"r":10,"c":10,"v":16},{"r":10,"c":11,"v":0}];
    bubbleMatrix("chart-full-assay", ASSAY_ROWS, ASSAY_COLS, ASSAY_CELLS, {W:900, left:260,
      colorLo:"#3a3833", colorMid:"#f0eeeb", colorHi:"#a8791f", legendPos:"right", legendTitle:"Pass rate"});

    scatterTrend("chart-complexity", [
      {x:1,y:39.7,ci:10.7,n:8},{x:2,y:37.8,ci:4.1,n:30},{x:3,y:32.6,ci:4.0,n:35},{x:4,y:35.3,ci:5.6,n:21},
      {x:5,y:57.6,ci:6.6,n:10},{x:6,y:44.2,ci:14.0,n:5},{x:7,y:54.4,ci:2.9,n:4},
    ], {W:420, H:330, xMax:7, yMin:0, yMax:100, xTickFmt:x=>x===7?">7":x, yLabel:"pass rate (%)"});

    timeHorizonDiagram("chart-timehorizon", {W:320, H:140});

    const failureModePR = [
      ["Causal / epistemic overreach",37.0,7.2,13],["Biological interpretation",32.3,7.0,11],["Replicate / unit of analysis",32.0,5.6,16],
      ["Batch / condition / platform comparability",29.0,5.2,19],["Normalization / representation",28.6,6.1,11],["Metric / statistic mismatch",27.6,5.5,18],
      ["Subset / scope / compartment",26.3,3.8,34],["QC / control artifact",24.6,6.4,11],["Marker / reference / label scope",24.2,5.2,9],
      ["Threshold / resolution instability",22.8,7.8,11],["Readout selection and scope",14.3,1.6,2],
    ].map(([label,value,ci,n])=>({label,value,ci,n,fill:"var(--accent)"}));
    hbar("chart-failuremode-pr", failureModePR, {W:350, left:195, right:30, rowH:19, gap:0, max:50, textSize:8,
      valueFmt:v=>`${v}%`});

    // --- agent-similarity panels (Figure 4A-C) ---
    // Derived from per-evaluation pass/fail (pass_rate>=0.5), one harness per model
    // (Pi where available, same convention as Figures 5B/7B), 12 models, 66 pairs, n up
    // to 120 evaluations per pair (119 where claude-opus-4-8/claude-sonnet-5 lost 1 eval
    // each to the platform-failure cluster noted in Figure 3's execution-reliability caveat).
    const SIM_LEAVES = ["gpt-6-astra","claude-opus-4-8","claude-opus-5","gemini-3.7-flash","grok-4.5","grok-4.6","gpt-5.6-sol","gpt-5.6-luna","gpt-5.5","gpt-5.6-terra","claude-sonnet-5","gemini-3.5-flash"];
    const SIM_CELLS = [{"r":0,"c":1,"v":60.7},{"r":0,"c":2,"v":53.1},{"r":0,"c":3,"v":61.9},{"r":0,"c":4,"v":60.2},{"r":0,"c":5,"v":56.6},{"r":0,"c":6,"v":64.6},{"r":0,"c":7,"v":49.6},{"r":0,"c":8,"v":61.9},{"r":0,"c":9,"v":58.4},{"r":0,"c":10,"v":53.6},{"r":0,"c":11,"v":55.8},{"r":1,"c":0,"v":60.7},{"r":1,"c":2,"v":70.5},{"r":1,"c":3,"v":67.0},{"r":1,"c":4,"v":68.8},{"r":1,"c":5,"v":61.6},{"r":1,"c":6,"v":67.0},{"r":1,"c":7,"v":64.3},{"r":1,"c":8,"v":62.5},{"r":1,"c":9,"v":67.0},{"r":1,"c":10,"v":66.1},{"r":1,"c":11,"v":64.3},{"r":2,"c":0,"v":53.1},{"r":2,"c":1,"v":70.5},{"r":2,"c":3,"v":62.8},{"r":2,"c":4,"v":62.8},{"r":2,"c":5,"v":64.6},{"r":2,"c":6,"v":51.3},{"r":2,"c":7,"v":57.5},{"r":2,"c":8,"v":57.5},{"r":2,"c":9,"v":61.1},{"r":2,"c":10,"v":63.4},{"r":2,"c":11,"v":60.2},{"r":3,"c":0,"v":61.9},{"r":3,"c":1,"v":67.0},{"r":3,"c":2,"v":62.8},{"r":3,"c":4,"v":69.9},{"r":3,"c":5,"v":64.6},{"r":3,"c":6,"v":70.8},{"r":3,"c":7,"v":66.4},{"r":3,"c":8,"v":66.4},{"r":3,"c":9,"v":64.6},{"r":3,"c":10,"v":65.2},{"r":3,"c":11,"v":63.7},{"r":4,"c":0,"v":60.2},{"r":4,"c":1,"v":68.8},{"r":4,"c":2,"v":62.8},{"r":4,"c":3,"v":69.9},{"r":4,"c":5,"v":75.2},{"r":4,"c":6,"v":67.3},{"r":4,"c":7,"v":69.9},{"r":4,"c":8,"v":68.1},{"r":4,"c":9,"v":66.4},{"r":4,"c":10,"v":68.8},{"r":4,"c":11,"v":65.5},{"r":5,"c":0,"v":56.6},{"r":5,"c":1,"v":61.6},{"r":5,"c":2,"v":64.6},{"r":5,"c":3,"v":64.6},{"r":5,"c":4,"v":75.2},{"r":5,"c":6,"v":58.4},{"r":5,"c":7,"v":59.3},{"r":5,"c":8,"v":57.5},{"r":5,"c":9,"v":59.3},{"r":5,"c":10,"v":61.6},{"r":5,"c":11,"v":56.6},{"r":6,"c":0,"v":64.6},{"r":6,"c":1,"v":67.0},{"r":6,"c":2,"v":51.3},{"r":6,"c":3,"v":70.8},{"r":6,"c":4,"v":67.3},{"r":6,"c":5,"v":58.4},{"r":6,"c":7,"v":69.0},{"r":6,"c":8,"v":76.1},{"r":6,"c":9,"v":76.1},{"r":6,"c":10,"v":58.0},{"r":6,"c":11,"v":55.8},{"r":7,"c":0,"v":49.6},{"r":7,"c":1,"v":64.3},{"r":7,"c":2,"v":57.5},{"r":7,"c":3,"v":66.4},{"r":7,"c":4,"v":69.9},{"r":7,"c":5,"v":59.3},{"r":7,"c":6,"v":69.0},{"r":7,"c":8,"v":77.0},{"r":7,"c":9,"v":77.0},{"r":7,"c":10,"v":67.9},{"r":7,"c":11,"v":61.9},{"r":8,"c":0,"v":61.9},{"r":8,"c":1,"v":62.5},{"r":8,"c":2,"v":57.5},{"r":8,"c":3,"v":66.4},{"r":8,"c":4,"v":68.1},{"r":8,"c":5,"v":57.5},{"r":8,"c":6,"v":76.1},{"r":8,"c":7,"v":77.0},{"r":8,"c":9,"v":80.5},{"r":8,"c":10,"v":64.3},{"r":8,"c":11,"v":65.5},{"r":9,"c":0,"v":58.4},{"r":9,"c":1,"v":67.0},{"r":9,"c":2,"v":61.1},{"r":9,"c":3,"v":64.6},{"r":9,"c":4,"v":66.4},{"r":9,"c":5,"v":59.3},{"r":9,"c":6,"v":76.1},{"r":9,"c":7,"v":77.0},{"r":9,"c":8,"v":80.5},{"r":9,"c":10,"v":68.8},{"r":9,"c":11,"v":69.0},{"r":10,"c":0,"v":53.6},{"r":10,"c":1,"v":66.1},{"r":10,"c":2,"v":63.4},{"r":10,"c":3,"v":65.2},{"r":10,"c":4,"v":68.8},{"r":10,"c":5,"v":61.6},{"r":10,"c":6,"v":58.0},{"r":10,"c":7,"v":67.9},{"r":10,"c":8,"v":64.3},{"r":10,"c":9,"v":68.8},{"r":10,"c":11,"v":67.9},{"r":11,"c":0,"v":55.8},{"r":11,"c":1,"v":64.3},{"r":11,"c":2,"v":60.2},{"r":11,"c":3,"v":63.7},{"r":11,"c":4,"v":65.5},{"r":11,"c":5,"v":56.6},{"r":11,"c":6,"v":55.8},{"r":11,"c":7,"v":61.9},{"r":11,"c":8,"v":65.5},{"r":11,"c":9,"v":69.0},{"r":11,"c":10,"v":67.9}];
    bubbleMatrix("chart-sim-matrix", SIM_LEAVES, SIM_LEAVES, SIM_CELLS, {W:470, left:112, top:16, rowH:24, bottom:76, colorLo:"#f0e6cc", colorHi:"#a8791f", legendTitle:"Agreement", legendPos:"right", domain:[52,84]});

    const SIM_SEGMENTS = [
{"ic":[15.0,15.0,25.0,25.0],"dc":[0.0,29.46,29.46,0.0]},
      {"ic":[45.0,45.0,55.0,55.0],"dc":[0.0,24.78,24.78,0.0]},
      {"ic":[35.0,35.0,50.0,50.0],"dc":[0.0,32.74,32.74,24.78]},
      {"ic":[20.0,20.0,42.5,42.5],"dc":[29.46,35.4,35.4,32.74]},
      {"ic":[85.0,85.0,95.0,95.0],"dc":[0.0,19.47,19.47,0.0]},
      {"ic":[75.0,75.0,90.0,90.0],"dc":[0.0,23.01,23.01,19.47]},
      {"ic":[65.0,65.0,82.5,82.5],"dc":[0.0,26.25,26.25,23.01]},
      {"ic":[105.0,105.0,115.0,115.0],"dc":[0.0,32.14,32.14,0.0]},
      {"ic":[73.75,73.75,110.0,110.0],"dc":[26.25,36.11,36.11,32.14]},
      {"ic":[31.25,31.25,91.88,91.88],"dc":[35.4,36.74,36.74,36.11]},
      {"ic":[5.0,5.0,61.56,61.56],"dc":[0.0,42.14,42.14,36.74]}
    ];
    dendrogramChart("chart-sim-dendro", SIM_LEAVES, SIM_SEGMENTS, {W:460, left:158, right:17, top:12, rowH:29, maxHeight:42});

    const SIM_MDS = [
      {label:"claude-opus-4-8", x:-7.25, y:-2.48, color:"var(--claude)", dx:-9, dy:-10, anchor:"end"},
      {label:"claude-opus-5", x:-22.78, y:2.17, color:"var(--claude)", dx:-9, dy:4, anchor:"end"},
      {label:"claude-sonnet-5", x:-7.35, y:12.72, color:"var(--claude)", dx:0, dy:-14, anchor:"middle"},
      {label:"gemini-3.5-flash", x:-4.19, y:9.63, color:"var(--gemini)", dx:0, dy:16, anchor:"middle"},
      {label:"gemini-3.7-flash", x:-0.48, y:-5.73, color:"var(--gemini)", dx:0, dy:16, anchor:"middle"},
      {label:"gpt-5.5", x:16.39, y:3.92, color:"var(--fam-gpt)", dx:0, dy:16, anchor:"middle"},
      {label:"gpt-5.6-luna", x:10.38, y:16.12, color:"var(--fam-gpt)", dx:0, dy:-14, anchor:"middle"},
      {label:"gpt-5.6-sol", x:19.74, y:-8.40, color:"var(--fam-gpt)", dx:0, dy:16, anchor:"middle"},
      {label:"gpt-5.6-terra", x:11.86, y:8.83, color:"var(--fam-gpt)", dx:0, dy:-14, anchor:"middle"},
      {label:"gpt-6-astra", x:4.63, y:-28.24, color:"var(--fam-gpt)", dx:0, dy:16, anchor:"middle"},
      {label:"grok-4.5", x:-4.98, y:-1.21, color:"var(--grok)", dx:9, dy:14, anchor:"start"},
      {label:"grok-4.6", x:-15.97, y:-7.31, color:"var(--grok)", dx:-9, dy:4, anchor:"end"}
    ];
    mdsScatter("chart-sim-mds", SIM_MDS, {W:740, H:460});
  }

  // =====================================================================
  // WIRING — initial render, editable-text tracking, save bar, publish
  // =====================================================================
  const sheetEl = document.getElementById("sheet");
  const saveBar = document.getElementById("saveBar");
  const btnSave = document.getElementById("btnSave");
  const btnDiscard = document.getElementById("btnDiscard");
  const saveMsg = document.getElementById("saveMsg");
  let dirty = false;
  let artifactCap = null;
  let writable = true;

  function paint(){ sheetEl.innerHTML = buildSheetHtml(STATE); renderCharts(); }
  paint();

  function setDirty(v){
    dirty = v;
    saveBar.classList.toggle("show", v);
  }

  sheetEl.addEventListener("input", (e)=>{
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    if (t.getAttribute("contenteditable") !== "true") return;
    const key = t.dataset.bind;
    if (!key) return;
    STATE[key] = t.innerHTML;
    setDirty(true);
  }, true);

  btnDiscard.addEventListener("click", ()=>{ location.reload(); });

  btnSave.addEventListener("click", async ()=>{
    btnSave.disabled = true;
    btnSave.textContent = "Saving…";
    try{
      if (!artifactCap){ artifactCap = await window.claude.use("artifact"); }
      if (!artifactCap){
        saveMsg.textContent = "Editing isn't available in this view.";
        btnSave.style.display = "none";
        btnDiscard.textContent = "Dismiss";
        return;
      }
      const fullHtml = buildFullDocument();
      await artifactCap.publish(fullHtml);
      // success: the platform reloads this view to the new version.
      saveMsg.textContent = "Saved, reloading…";
    }catch(err){
      const code = err && err.code;
      if (code === "conflict"){
        // a newer version is already loading in; nothing to do.
        saveMsg.textContent = "Someone saved a newer version, reloading…";
      } else if (code === "not_writer" || code === "not_granted" || code === "consent_required"){
        writable = false;
        document.body.classList.add("read-only");
        saveMsg.textContent = "This view is read-only.";
        btnSave.style.display = "none";
        btnDiscard.textContent = "Dismiss";
      } else if (code === "rate_limited"){
        saveMsg.textContent = "Saving too fast: wait a moment and try again.";
        btnSave.disabled = false; btnSave.textContent = "Save changes";
      } else {
        saveMsg.textContent = "Save failed, try again.";
        btnSave.disabled = false; btnSave.textContent = "Save changes";
      }
    }
  });

  function buildFullDocument(){
    const titleTag = document.querySelector("title").outerHTML;
    const linkTag = document.getElementById("page-font").outerHTML;
    const styleTag = document.getElementById("page-style").outerHTML;
    const scriptTag = document.getElementById("app-script").outerHTML;
    // The sheet ships EMPTY — paint() (inside scriptTag) fills it from
    // STATE, which the script hydrates from this JSON blob on load. This
    // is what keeps the reused, never-edited script safe to re-embed
    // verbatim on every save: the edited text lives only in the data
    // blob, not baked into the script's own source.
    const stateJson = JSON.stringify(STATE).replace(/</g, "\\u003c");
    const bodyHtml = `<div class="sheet" id="sheet"></div>
<div class="save-bar" id="saveBar">
  <span class="msg"><span class="dot"></span><span id="saveMsg">Unsaved edits</span></span>
  <button class="btn-discard" id="btnDiscard" type="button">Discard</button>
  <button class="btn-save" id="btnSave" type="button">Save changes</button>
</div>
<script type="application/json" id="state-data">${stateJson}<\/script>
${scriptTag}`;
    return `<!doctype html><html data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${titleTag}${linkTag}<style>:root{color-scheme:light}body{margin:0;padding:0}img{max-width:100%}[hidden]:not([hidden=until-found]){display:none!important}</style>${styleTag}</head><body>${bodyHtml}</body></html>`;
  }

  // Resolve the capability early so the Save button doesn't stall on first click.
  if (window.claude && window.claude.use){
    window.claude.use("artifact").then(cap=>{ artifactCap = cap; });
  }
})();
