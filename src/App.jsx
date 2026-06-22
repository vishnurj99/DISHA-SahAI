import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Brain,
  Briefcase,
  CheckCircle2,
  Database,
  Gauge,
  GraduationCap,
  IndianRupee,
  Landmark,
  Languages,
  Loader2,
  LogOut,
  MapPinned,
  Network,
  Play,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
  Users,
  WifiOff,
} from "lucide-react";
import { occupations, regions, sampleInputs } from "./data/demoData.js";
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

const trackMeta = {
  learner: {
    label: "Learner",
    icon: Sparkles,
    description: "Career pathways and next steps.",
  },
  counselor: {
    label: "Counselor",
    icon: Users,
    description: "Assigned learners and readiness.",
  },
  government: {
    label: "Government",
    icon: Landmark,
    description: "Regional supply and demand.",
  },
};

const testUsers = [
  {
    id: "asha",
    name: "Asha R.",
    role: "learner",
    org: "Govt Arts College, Coimbatore",
    purpose: "View career pathways and next steps.",
  },
  {
    id: "revathi",
    name: "Revathi Narayanan",
    role: "counselor",
    org: "District Skill Centre",
    purpose: "Review assigned learners and readiness.",
  },
  {
    id: "tn-admin",
    name: "TN Skill Mission Admin",
    role: "government",
    org: "Tamil Nadu Skill Mission",
    purpose: "Monitor regional supply and demand.",
  },
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
  const [sessionUser, setSessionUser] = useState(null);
  const [inputText, setInputText] = useState(sampleInputs.english);
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
    const language = profile?.language || editableProfile.language || "English";
    try {
      const extracted = profile
        ? normalizeExtractedProfile(profile)
        : normalizeExtractedProfile(await extractProfile(input, language));

      const candidates = buildCandidateFacts(extracted);
      const semantic = await scoreSemanticFit(extracted, candidates);
      const ranked = rankRecommendations(extracted, semantic.scores);
      const explanationResponse = await generateExplanation(
        buildExplanationPayload(ranked, ranked.profile.language || language),
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

  function renderTrack() {
    if (!sessionUser) return null;
    if (sessionUser.role === "learner") {
      return (
        <IntakeView
          inputText={inputText}
          setInputText={setInputText}
          runState={runState}
          runPipeline={runPipeline}
          editableProfile={editableProfile}
          setEditableProfile={setEditableProfile}
          currentRun={currentRun}
        />
      );
    }
    if (sessionUser.role === "counselor") return <CounselorView currentRun={currentRun} />;
    return <GovernmentView currentRun={currentRun} />;
  }

  if (!sessionUser) {
    return (
      <LoginView
        modelHealth={modelHealth}
        onLogin={setSessionUser}
      />
    );
  }

  const userTrack = trackMeta[sessionUser.role];
  const TrackIcon = userTrack.icon;

  return (
    <div className="app-shell">
      <aside className="role-shell">
        <div className="brand-block">
          <span className="brand-mark">D</span>
          <div>
            <div className="role-kicker">DISHA</div>
            <strong>AI Career Pathways</strong>
          </div>
        </div>
        <div className="session-card" aria-label="Current user">
          <span className="avatar large">{sessionUser.name.charAt(0)}</span>
          <div>
            <span className="section-kicker">Signed in as</span>
            <h2>{sessionUser.name}</h2>
            <p>{sessionUser.org}</p>
          </div>
        </div>
        <div className="track-lock">
          <TrackIcon size={18} />
          <div>
            <strong>{userTrack.label}</strong>
          </div>
        </div>
        <button type="button" className="logout-button" onClick={() => setSessionUser(null)}>
          <LogOut size={17} />
          Logout
        </button>
        <ModelBadge health={modelHealth} />
      </aside>

      <main className="main">
        {renderTrack()}
      </main>
    </div>
  );
}

function LoginView({ modelHealth, onLogin }) {
  return (
    <main className="login-page">
      <section className="login-shell">
        <HeaderBand
          eyebrow="DISHA"
          title="Sign in to DISHA"
          copy="Access the workspace for career guidance, counseling, regional planning, and operations readiness."
          right={
            <div className="source-stack">
              <SourceChip icon={BadgeCheck} label="Verified records" detail="Profile and credentials" />
              <SourceChip icon={ShieldCheck} label="Role access" detail="Focused workspace" />
            </div>
          }
        />
        <div className="login-content">
          <section className="panel login-panel">
            <div className="panel-heading">
              <div>
                <span className="section-kicker">Access</span>
                <h2>Select your profile</h2>
              </div>
              <Users size={24} />
            </div>
            <div className="user-grid">
              {testUsers.map((user) => {
                const meta = trackMeta[user.role];
                const Icon = meta.icon;
                return (
                  <button
                    type="button"
                    className="user-card"
                    key={user.id}
                    onClick={() => onLogin(user)}
                  >
                    <span className="avatar">{user.name.charAt(0)}</span>
                    <span className="user-card-copy">
                      <strong>{user.name}</strong>
                      <small>{user.org}</small>
                      <span className="track-pill">
                        <Icon size={15} />
                        {meta.label}
                      </span>
                      <span className="user-purpose">{user.purpose}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
          <section className="panel login-status-panel">
            <div className="panel-heading">
              <div>
                <span className="section-kicker">Status</span>
                <h2>System readiness</h2>
              </div>
              <Brain size={24} />
            </div>
            <ModelBadge health={modelHealth} />
          </section>
        </div>
      </section>
    </main>
  );
}

function ModelBadge({ health }) {
  const ready = health.state === "ready";
  const Icon = ready ? CheckCircle2 : health.state === "checking" ? Loader2 : WifiOff;
  return (
    <div className={`model-badge ${health.state}`}>
      <Icon size={17} className={health.state === "checking" ? "spin" : ""} />
      <div>
        <strong>{ready ? "AI ready" : health.state === "checking" ? "Checking AI" : "AI unavailable"}</strong>
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
  runState,
  runPipeline,
  editableProfile,
  setEditableProfile,
  currentRun,
}) {
  return (
    <section className="view">
      <HeaderBand
        eyebrow="Career Pathways"
        title="Learner pathways"
        copy="Review verified credits, choose an aspiring role, and compare the gaps to public course options."
        right={
          <div className="source-stack">
            <SourceChip icon={BadgeCheck} label="Verified record" detail="Credits and credentials" />
            <SourceChip icon={Network} label="Public courses" detail="Govt and open sources" />
          </div>
        }
      />

      <section className="panel credit-ledger-panel">
        <div className="panel-heading">
          <div>
            <span className="section-kicker">Current learning record</span>
            <h2>Credits and completed courses</h2>
          </div>
          <Database size={24} />
        </div>
        <AcademicCreditsTable records={editableProfile.academicCredits || []} />
      </section>

      <div className="workspace-grid">
        <section className="panel intake-panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">Profile</span>
              <h2>Learner profile</h2>
            </div>
            <Languages size={24} />
          </div>
          <textarea
            className="profile-input"
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            rows={9}
          />
          <div className="action-row">
            <button
              type="button"
              className="primary-button"
              onClick={() => runPipeline({ input: inputText })}
              disabled={runState.status === "loading"}
            >
              {runState.status === "loading" ? <Loader2 size={18} className="spin" /> : <Play size={18} />}
              Generate recommendation
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
              <span className="section-kicker">Aspiring role</span>
              <h2>Role and constraints</h2>
            </div>
            <Target size={24} />
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
            <h2>Ready for gap analysis</h2>
            <p>Generate a recommendation to compare the selected role with completed credits, missing requirements, and public courses.</p>
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
        Update role analysis
      </button>
    </div>
  );
}

function AcademicCreditsTable({ records }) {
  const completedRecords = records.filter(
    (record) => record.selected !== false && String(record.status || "Completed").toLowerCase().includes("completed"),
  );
  if (!records.length) {
    return (
      <div className="abc-records empty-credits">
        <p>No verified credit records are available for this learner.</p>
      </div>
    );
  }
  const selectedCredits = completedRecords
    .reduce((total, record) => total + Number(record.credit || 0), 0);
  const sourceCount = new Set(completedRecords.map((record) => record.university)).size;
  return (
    <div className="abc-records">
      <div className="credit-summary">
        <Stat icon={ShieldCheck} value={String(completedRecords.length).padStart(2, "0")} label="Completed courses" />
        <Stat icon={GraduationCap} value={String(selectedCredits).padStart(2, "0")} label="Current credits" />
        <Stat icon={Database} value={sourceCount || "n/a"} label="Record sources" />
      </div>
      <div className="abc-heading">
        <div>
          <span className="section-kicker">Academic Bank of Credits / NQR-ready</span>
          <h3>Verified course ledger</h3>
        </div>
        <strong>{String(selectedCredits).padStart(2, "0")} credits</strong>
      </div>
      <div className="abc-table" role="table" aria-label="Academic Bank of Credits records">
        <div className="abc-row abc-header" role="row">
          <span>University</span>
          <span>Course</span>
          <span>Subject</span>
          <span>Code</span>
          <span>Year</span>
          <span>Credit</span>
          <span>Status</span>
        </div>
        {records.map((record) => (
          <div className="abc-row" role="row" key={`${record.subjectCode}-${record.year}`}>
            <span>{record.university}</span>
            <span>{record.course}</span>
            <span>{record.subjectName}</span>
            <span>{record.subjectCode}</span>
            <span>{record.year}</span>
            <span>{String(record.credit).padStart(2, "0")}</span>
            <span>{record.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecommendationResults({ currentRun }) {
  const top = currentRun.top[0];
  const aspiringPath = currentRun.selfSelected || top;
  const crowded = currentRun.crowdingSummary[0];
  return (
    <div className="results-stack">
      <RoleGapPanel pathway={aspiringPath} profile={currentRun.profile} />

      <section className="anti-herding">
        <div className="alert-icon">
          <AlertTriangle size={23} />
        </div>
        <div>
          <span className="section-kicker">Market crowding insight</span>
          <h2>{aspiringPath.title} is checked against cohort crowding</h2>
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
              <span className="section-kicker">Recommendation summary</span>
              <h2>Pathway rationale</h2>
            </div>
            <Sparkles size={24} />
          </div>
          <MarkdownText text={currentRun.explanation} />
          <div className="health-strip">
            <Stat icon={Brain} value={currentRun.semantic.scores.length} label="Pathways reviewed" />
            <Stat icon={ShieldCheck} value={percent(currentRun.profile.confidence)} label="Profile confidence" />
          </div>
        </div>

        <div className="panel source-panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">Evidence</span>
              <h2>Public courses for selected role</h2>
            </div>
            <BookOpen size={24} />
          </div>
          <div className="course-list">
            {aspiringPath.gapAnalysis.recommendedCourses.map((course) => (
              <a key={course.id} href={course.sourceUrl} target="_blank" rel="noreferrer">
                <strong>{course.title}</strong>
                <span>{course.provider} · {course.authority} · {course.durationWeeks} weeks</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function MarkdownText({ text }) {
  const normalized = String(text || "")
    .replace(/(^|[^*])\s\*\s+(?=\S)/g, "$1\n* ")
    .replace(/\s+(\*\*[^*]+\*\*)/g, "\n$1");
  const lines = normalized
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const blocks = [];

  for (const line of lines) {
    if (/^[-*]\s+/.test(line)) {
      const previous = blocks[blocks.length - 1];
      if (previous?.type === "list") previous.items.push(line.replace(/^[-*]\s+/, ""));
      else blocks.push({ type: "list", items: [line.replace(/^[-*]\s+/, "")] });
    } else {
      blocks.push({ type: "paragraph", text: line });
    }
  }

  return (
    <div className="markdown-copy">
      {blocks.map((block, blockIndex) =>
        block.type === "list" ? (
          <ul key={`list-${blockIndex}`}>
            {block.items.map((item, itemIndex) => (
              <li key={`${item}-${itemIndex}`}>
                <InlineMarkdown text={item} />
              </li>
            ))}
          </ul>
        ) : (
          <p key={`${block.text}-${blockIndex}`}>
            <InlineMarkdown text={block.text} />
          </p>
        ),
      )}
    </div>
  );
}

function InlineMarkdown({ text }) {
  const parts = String(text || "").split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }
    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

function RoleGapPanel({ pathway, profile }) {
  const matched = pathway.gapAnalysis?.matchedRequirements || [];
  const missing = pathway.gapAnalysis?.missingRequirements || [];
  const courses = pathway.gapAnalysis?.recommendedCourses || [];
  const requirementTotal = matched.length + missing.length;
  return (
    <section className="panel role-gap-panel">
      <div className="panel-heading">
        <div>
          <span className="section-kicker">Selected role gap analysis</span>
          <h2>{pathway.title}</h2>
        </div>
        <Target size={24} />
      </div>
      <div className="gap-summary-grid">
        <Stat icon={CheckCircle2} value={`${matched.length}/${requirementTotal}`} label="Requirements matched" />
        <Stat icon={AlertTriangle} value={missing.length} label="Open gaps" />
        <Stat icon={BookOpen} value={courses.length} label="Public course options" />
        <Stat icon={MapPinned} value={profile.region} label="Learner region" />
      </div>
      <div className="gap-columns">
        <div className="gap-column">
          <h3>Profile evidence</h3>
          <div className="gap-list">
            {matched.map((requirement) => (
              <div className="gap-item matched" key={requirement.gapTag}>
                <CheckCircle2 size={18} />
                <div>
                  <strong>{requirement.label}</strong>
                  <span>
                    {requirement.evidence.length
                      ? requirement.evidence.map((item) => item.label).join(", ")
                      : "Profile evidence found"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="gap-column">
          <h3>Gaps to close</h3>
          <div className="gap-list">
            {missing.length ? (
              missing.map((requirement) => (
                <div className="gap-item missing" key={requirement.gapTag}>
                  <AlertTriangle size={18} />
                  <div>
                    <strong>{requirement.label}</strong>
                    <span>Look for: {requirement.keywords.slice(0, 4).join(", ")}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="gap-item matched">
                <CheckCircle2 size={18} />
                <div>
                  <strong>No required gaps found</strong>
                  <span>The verified record covers the listed role requirements.</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="gap-column course-column">
          <h3>Courses to fill gaps</h3>
          <div className="course-list compact">
            {courses.map((course) => (
              <a key={course.id} href={course.sourceUrl} target="_blank" rel="noreferrer">
                <strong>{course.title}</strong>
                <span>{course.provider} · {course.authority}</span>
                <small>{course.durationWeeks} weeks · {sourceTypeLabel(course.sourceType)}</small>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function sourceTypeLabel(sourceType) {
  if (sourceType === "government-of-india") return "Government of India";
  if (sourceType === "state-government") return "State government";
  return "Public/open source";
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
        <Metric icon={Target} value={percent(pathway.semanticFit)} label="Profile fit" />
        <Metric icon={BarChart3} value={`-${Math.round(pathway.crowdingPenalty)}`} label="Crowding penalty" />
      </div>
      <div className="explainability">
        <strong>{pathway.readinessStatus}: {pathway.gapAnalysis.matchedRequirements.length}/{pathway.gapAnalysis.requirements.length} requirements matched</strong>
        <p>{pathway.aiRationale}</p>
        <p>Course: {pathway.course?.title} from {pathway.course?.provider}. Time to job: {pathway.timeToJobWeeks} weeks.</p>
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
        copy="Review learner readiness, recommended pathways, and market crowding signals."
        right={
          <div className="source-stack">
            <SourceChip icon={Users} label="Assigned learners" detail="Priority caseload" />
            <SourceChip icon={AlertTriangle} label="Crowding flags" detail="Capacity aware" />
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
        copy="Compare learner demand with regional capacity and identify gaps for planning."
        right={
          <div className="source-stack">
            <SourceChip icon={MapPinned} label="5 regions" detail="District view" />
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
