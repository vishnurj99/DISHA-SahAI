import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Brain,
  Briefcase,
  CheckCircle2,
  ClipboardCheck,
  Database,
  Gauge,
  GraduationCap,
  IndianRupee,
  Landmark,
  Languages,
  Loader2,
  MapPinned,
  Network,
  Play,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  UserRound,
  Users,
  WifiOff,
} from "lucide-react";
import { courses, occupations, regions, sampleInputs } from "./data/demoData.js";
import { checkModelHealth, extractProfile, generateExplanation, scoreSemanticFit } from "./lib/aiClient.js";
import {
  buildCandidateFacts,
  buildCounselorRows,
  buildExplanationPayload,
  buildGovernmentCells,
  createInitialProfile,
  normalizeExtractedProfile,
  rankRecommendations,
} from "./lib/recommendation.js";

const tabs = [
  { id: "intake", label: "AI Intake", icon: Sparkles },
  { id: "counselor", label: "Counselor", icon: Users },
  { id: "government", label: "Government", icon: Landmark },
  { id: "evaluation", label: "Evaluation", icon: ClipboardCheck },
];

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function percent(value) {
  return `${Math.round(value * 100)}%`;
}

function App() {
  const [activeTab, setActiveTab] = useState("intake");
  const [inputText, setInputText] = useState(sampleInputs.english);
  const [preferredLanguage, setPreferredLanguage] = useState("English");
  const [modelHealth, setModelHealth] = useState({ state: "checking", detail: "Checking model" });
  const [runState, setRunState] = useState({ status: "idle" });
  const [editableProfile, setEditableProfile] = useState(createInitialProfile());

  useEffect(() => {
    let mounted = true;
    checkModelHealth()
      .then((health) => {
        if (mounted) setModelHealth({ state: "ready", detail: `${health.provider}: ${health.model}` });
      })
      .catch((error) => {
        if (mounted) setModelHealth({ state: "error", detail: error.message });
      });
    return () => {
      mounted = false;
    };
  }, []);

  const currentRun = runState.status === "success" ? runState : null;

  async function runPipeline({ profile, input } = {}) {
    const startedAt = performance.now();
    setRunState({ status: "loading", startedAt });
    try {
      const extracted = profile
        ? normalizeExtractedProfile(profile)
        : normalizeExtractedProfile(await extractProfile(input, preferredLanguage));

      const candidates = buildCandidateFacts(extracted);
      const semantic = await scoreSemanticFit(extracted, candidates);
      const ranked = rankRecommendations(extracted, semantic.scores);
      const explanationResponse = await generateExplanation(
        buildExplanationPayload(ranked, preferredLanguage),
      );
      const latencyMs = Math.round(performance.now() - startedAt);
      setEditableProfile(ranked.profile);
      setRunState({
        status: "success",
        profile: ranked.profile,
        candidates,
        semantic,
        ...ranked,
        explanation: explanationResponse.explanation,
        latencyMs,
      });
    } catch (error) {
      setRunState({ status: "error", error: error.message });
    }
  }

  function applySample(sampleKey) {
    setInputText(sampleInputs[sampleKey]);
    setPreferredLanguage(sampleKey === "tamil" ? "Tamil" : "English");
  }

  return (
    <div className="app-shell">
      <aside className="role-shell">
        <div className="brand-block">
          <span className="brand-mark">D</span>
          <div>
            <div className="role-kicker">DISHA Phase 2</div>
            <strong>AI Career Pathways</strong>
          </div>
        </div>
        <nav className="role-switcher" aria-label="App views">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                type="button"
                key={tab.id}
                className={`role-button ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
        <ModelBadge health={modelHealth} />
      </aside>

      <main className="main">
        {activeTab === "intake" && (
          <IntakeView
            inputText={inputText}
            setInputText={setInputText}
            preferredLanguage={preferredLanguage}
            setPreferredLanguage={setPreferredLanguage}
            applySample={applySample}
            runState={runState}
            runPipeline={runPipeline}
            editableProfile={editableProfile}
            setEditableProfile={setEditableProfile}
            currentRun={currentRun}
          />
        )}
        {activeTab === "counselor" && <CounselorView currentRun={currentRun} />}
        {activeTab === "government" && <GovernmentView currentRun={currentRun} />}
        {activeTab === "evaluation" && <EvaluationView runState={runState} modelHealth={modelHealth} />}
      </main>
    </div>
  );
}

function ModelBadge({ health }) {
  const ready = health.state === "ready";
  const Icon = ready ? CheckCircle2 : health.state === "checking" ? Loader2 : WifiOff;
  return (
    <div className={`model-badge ${health.state}`}>
      <Icon size={17} className={health.state === "checking" ? "spin" : ""} />
      <div>
        <strong>{ready ? "AI model ready" : health.state === "checking" ? "Checking AI" : "AI unavailable"}</strong>
        <span>{health.detail}</span>
      </div>
    </div>
  );
}

function HeaderBand({ eyebrow, title, copy, right }) {
  return (
    <header className="header-band">
      <div className="header-left">
        <span className="eyebrow">
          <Brain size={17} />
          {eyebrow}
        </span>
        <h1>{title}</h1>
        <p>{copy}</p>
      </div>
      <div className="header-right">{right}</div>
    </header>
  );
}

function IntakeView({
  inputText,
  setInputText,
  preferredLanguage,
  setPreferredLanguage,
  applySample,
  runState,
  runPipeline,
  editableProfile,
  setEditableProfile,
  currentRun,
}) {
  return (
    <section className="view">
      <HeaderBand
        eyebrow="Working AI flow"
        title="Learner intake to ranked pathways"
        copy="Enter a learner profile in English or Tamil. The configured model extracts profile JSON, scores semantic fit, and writes the final explanation from validated facts."
        right={
          <div className="source-stack">
            <SourceChip icon={BadgeCheck} label="Synthetic DPI" detail="APAAR and credentials" />
            <SourceChip icon={Network} label="Seeded demand" detail="Jobs, courses, capacity" />
            <SourceChip icon={ShieldCheck} label="No fallback AI" detail="Model errors stop the run" />
          </div>
        }
      />

      <div className="workspace-grid">
        <section className="panel intake-panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">Profile text</span>
              <h2>AI extraction input</h2>
            </div>
            <Languages size={24} />
          </div>
          <div className="sample-row">
            <button type="button" onClick={() => applySample("english")}>Asha English</button>
            <button type="button" onClick={() => applySample("tamil")}>Asha Tamil</button>
            <button type="button" onClick={() => applySample("missing")}>Missing credentials</button>
          </div>
          <textarea
            className="profile-input"
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            rows={9}
          />
          <div className="action-row">
            <div className="language-toggle">
              {["English", "Tamil"].map((language) => (
                <button
                  type="button"
                  key={language}
                  className={preferredLanguage === language ? "active" : ""}
                  onClick={() => setPreferredLanguage(language)}
                >
                  {language}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="primary-button"
              onClick={() => runPipeline({ input: inputText })}
              disabled={runState.status === "loading"}
            >
              {runState.status === "loading" ? <Loader2 size={18} className="spin" /> : <Play size={18} />}
              Run AI recommendation
            </button>
          </div>
          {runState.status === "error" && (
            <div className="error-panel">
              <AlertTriangle size={19} />
              <span>{runState.error}</span>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">Validated profile</span>
              <h2>Extracted learner JSON</h2>
            </div>
            <Database size={24} />
          </div>
          <EditableProfile
            profile={editableProfile}
            setProfile={setEditableProfile}
            onRerun={() => runPipeline({ profile: editableProfile })}
            disabled={runState.status === "loading"}
          />
        </section>
      </div>

      {currentRun ? (
        <RecommendationResults currentRun={currentRun} />
      ) : (
        <section className="panel empty-state">
          <Sparkles size={28} />
          <div>
            <h2>No recommendation run yet</h2>
            <p>The first successful run will show extracted profile confidence, AI semantic scores, ranked pathways, evidence, and crowding logic.</p>
          </div>
        </section>
      )}
    </section>
  );
}

function EditableProfile({ profile, setProfile, onRerun, disabled }) {
  function update(key, value) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="profile-editor">
      <label>
        <span>Name</span>
        <input value={profile.name || ""} onChange={(event) => update("name", event.target.value)} />
      </label>
      <label>
        <span>Region</span>
        <select value={profile.region || "Coimbatore"} onChange={(event) => update("region", event.target.value)}>
          {regions.map((region) => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>
      </label>
      <label>
        <span>Education</span>
        <input value={profile.education || ""} onChange={(event) => update("education", event.target.value)} />
      </label>
      <label>
        <span>Target</span>
        <select
          value={profile.targetOccupation || "Data Analyst"}
          onChange={(event) => update("targetOccupation", event.target.value)}
        >
          {occupations.map((occupation) => (
            <option key={occupation.id} value={occupation.title}>{occupation.title}</option>
          ))}
        </select>
      </label>
      <label>
        <span>Expected pay</span>
        <input
          type="number"
          min="6000"
          value={profile.wageExpectationMonthly || 12000}
          onChange={(event) => update("wageExpectationMonthly", Number(event.target.value))}
        />
      </label>
      <label>
        <span>Credentials</span>
        <input
          value={(profile.credentials || []).join(", ")}
          onChange={(event) =>
            update(
              "credentials",
              event.target.value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            )
          }
        />
      </label>
      <button type="button" className="ghost-button editor-run" onClick={onRerun} disabled={disabled}>
        <RefreshCw size={17} />
        Re-run AI scoring
      </button>
    </div>
  );
}

function RecommendationResults({ currentRun }) {
  const top = currentRun.top[0];
  const crowded = currentRun.crowdingSummary[0];
  return (
    <div className="results-stack">
      <section className="anti-herding">
        <div className="alert-icon">
          <AlertTriangle size={23} />
        </div>
        <div>
          <span className="section-kicker">Anti-herding proof</span>
          <h2>{currentRun.profile.targetOccupation || "Self-selected path"} is checked against cohort crowding</h2>
          <p>
            {crowded.title} has {crowded.aspirants} aspirants for {crowded.capacity} local slots in {currentRun.profile.region}. The top recommendation is {top.title} after applying the crowding penalty and tie-break rules.
          </p>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="section-kicker">Ranked recommendations</span>
            <h2>Top pathways</h2>
          </div>
          <Gauge size={24} />
        </div>
        <div className="pathway-grid">
          {currentRun.top.map((pathway, index) => (
            <PathwayCard pathway={pathway} index={index} key={pathway.id} />
          ))}
        </div>
      </section>

      <section className="workspace-grid lower-grid">
        <div className="panel explanation-panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">Model generated</span>
              <h2>Grounded explanation</h2>
            </div>
            <Sparkles size={24} />
          </div>
          <p className="large-copy">{currentRun.explanation}</p>
          <div className="health-strip">
            <Stat icon={Brain} value={currentRun.semantic.scores.length} label="AI semantic scores" />
            <Stat icon={Gauge} value={`${currentRun.latencyMs || 0}ms`} label="End-to-end run" />
            <Stat icon={ShieldCheck} value={percent(currentRun.profile.confidence)} label="Extraction confidence" />
          </div>
        </div>

        <div className="panel source-panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">Evidence</span>
              <h2>Courses and source links</h2>
            </div>
            <BookOpen size={24} />
          </div>
          <div className="course-list">
            {currentRun.top.map((pathway) => (
              <a key={pathway.id} href={pathway.course?.sourceUrl} target="_blank" rel="noreferrer">
                <strong>{pathway.course?.title}</strong>
                <span>{pathway.course?.provider} · {pathway.course?.durationWeeks} weeks</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function PathwayCard({ pathway, index }) {
  return (
    <article className={`pathway-card ${index === 0 ? "active" : ""}`}>
      <div className="pathway-top">
        <div>
          <small>Rank {index + 1}</small>
          <strong>{pathway.title}</strong>
        </div>
        <span className="score-pill">{Math.round(pathway.finalScore)}</span>
      </div>
      <div className="pathway-metrics">
        <Metric icon={IndianRupee} value={money(pathway.basePayMonthly)} label={`${pathway.wageDelta.toFixed(1)}x expected`} />
        <Metric icon={Briefcase} value={pathway.job.openings} label={`${pathway.job.distanceKm} km jobs`} />
        <Metric icon={Target} value={percent(pathway.semanticFit)} label="AI semantic fit" />
        <Metric icon={BarChart3} value={`-${Math.round(pathway.crowdingPenalty)}`} label="Crowding penalty" />
      </div>
      <div className="explainability">
        <strong>{pathway.readinessStatus}</strong>
        <p>{pathway.aiRationale}</p>
        <p>Course: {pathway.course?.title}. Time to job: {pathway.timeToJobWeeks} weeks.</p>
      </div>
    </article>
  );
}

function CounselorView({ currentRun }) {
  const rows = useMemo(() => buildCounselorRows(currentRun), [currentRun]);
  return (
    <section className="view">
      <HeaderBand
        eyebrow="Caseload"
        title="Counselor dashboard"
        copy="The counselor sees readiness, crowding, and the latest AI-ranked learner path without reading raw model output."
        right={
          <div className="source-stack">
            <SourceChip icon={Users} label="18 shown" detail="52 synthetic learners" />
            <SourceChip icon={AlertTriangle} label="Crowding flags" detail="Same capacity logic" />
          </div>
        }
      />
      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="section-kicker">District Skill Centre</span>
            <h2>Priority learners</h2>
          </div>
          <UserRound size={24} />
        </div>
        <div className="caseload-list">
          {rows.map((row, index) => (
            <div className="caseload-row" key={row.id}>
              <span className="avatar">{row.name.charAt(0)}</span>
              <div>
                <strong>{index === 0 && currentRun ? currentRun.profile.name : row.name}</strong>
                <span>{row.region} · {row.education}</span>
              </div>
              <div>
                <strong>{row.recommendedTitle}</strong>
                <span>{row.status}</span>
              </div>
              <div className="readiness">{row.readiness}%</div>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}

function GovernmentView({ currentRun }) {
  const rows = useMemo(() => buildGovernmentCells(currentRun), [currentRun]);
  return (
    <section className="view">
      <HeaderBand
        eyebrow="Aggregate signal"
        title="Supply-demand map"
        copy="Each cell compares synthetic learner supply against regional demand capacity. The current AI recommendation is included after a successful run."
        right={
          <div className="source-stack">
            <SourceChip icon={MapPinned} label="5 regions" detail="Tamil Nadu seed" />
            <SourceChip icon={Database} label="No data state" detail="Distinct from balanced" />
          </div>
        }
      />
      <section className="panel heatmap-panel">
        <div className="heatmap">
          <div className="heatmap-head">Sector</div>
          {regions.map((region) => (
            <div className="heatmap-head" key={region}>{region}</div>
          ))}
          {rows.map((row) => (
            <div className="heatmap-row" key={row.field}>
              <div className="heatmap-sector">{row.field}</div>
              {row.cells.map((cell) => (
                <div className={`heat-cell intensity-${cell.intensity}`} key={`${cell.region}-${cell.field}`}>
                  <strong>{cell.status}</strong>
                  <span>{cell.supply}/{cell.capacity || "n/a"}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}

function EvaluationView({ runState, modelHealth }) {
  const modelOk = modelHealth.state === "ready";
  const runOk = runState.status === "success";
  return (
    <section className="view">
      <HeaderBand
        eyebrow="Submission evidence"
        title="Evaluation and validation tracker"
        copy="Use this screen during the walkthrough to show model availability, factuality guardrails, and the representative test plan."
        right={
          <div className="source-stack">
            <SourceChip icon={ClipboardCheck} label="AI metrics" detail="JSON, fit, latency" />
            <SourceChip icon={GraduationCap} label="User validation" detail="Proxy sprint testing" />
          </div>
        }
      />
      <div className="workspace-grid lower-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">Current run</span>
              <h2>AI/model checks</h2>
            </div>
            <Gauge size={24} />
          </div>
          <div className="evaluation-grid">
            <Stat icon={Brain} value={modelOk ? "Pass" : "Fail"} label="Model endpoint reachable" />
            <Stat icon={Database} value={runOk ? "Pass" : "Waiting"} label="Valid extracted JSON" />
            <Stat icon={ShieldCheck} value={runOk ? "0" : "n/a"} label="Hallucinated IDs accepted" />
            <Stat icon={Gauge} value={runOk ? `${runState.latencyMs}ms` : "n/a"} label="Observed latency" />
          </div>
        </section>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">Representative set</span>
              <h2>Cases to run before submission</h2>
            </div>
            <ClipboardCheck size={24} />
          </div>
          <ul className="check-list">
            <li>English BA Economics learner targeting a crowded analyst path.</li>
            <li>Tamil learner profile with the same Asha facts.</li>
            <li>Missing credential case with limited-information labeling.</li>
            <li>ITI/polytechnic learner for manufacturing or green energy.</li>
            <li>No nearby jobs case that widens the region honestly.</li>
          </ul>
        </section>
      </div>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="section-kicker">Guardrails as built</span>
            <h2>Responsible AI controls</h2>
          </div>
          <ShieldCheck size={24} />
        </div>
        <div className="guardrail-grid">
          <span>Model JSON schema validation</span>
          <span>Unknown course/job IDs rejected</span>
          <span>Synthetic data clearly labeled</span>
          <span>No sensitive personal data required</span>
          <span>Low confidence visible in profile</span>
          <span>No deterministic AI fallback</span>
        </div>
      </section>
    </section>
  );
}

function SourceChip({ icon: Icon, label, detail }) {
  return (
    <span className="source-chip">
      <Icon size={16} />
      <strong>{label}</strong>
      <span>{detail}</span>
    </span>
  );
}

function Stat({ icon: Icon, value, label }) {
  return (
    <div className="stat">
      <Icon size={20} />
      <div>
        <strong>{value}</strong>
        <small>{label}</small>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, value, label }) {
  return (
    <div className="metric">
      <Icon size={18} />
      <div>
        <strong>{value}</strong>
        <small>{label}</small>
      </div>
    </div>
  );
}

export default App;
