import {
  courses,
  demand,
  fields,
  jobs,
  occupations,
  primaryLearner,
  regions,
  syntheticLearners,
} from "../data/demoData.js";

const weights = {
  semanticFit: 0.32,
  qualificationFit: 0.2,
  payGain: 0.18,
  nearbyJobs: 0.13,
  demand: 0.17,
};

export function createInitialProfile() {
  return {
    name: primaryLearner.name,
    region: primaryLearner.region,
    education: primaryLearner.education,
    stream: primaryLearner.stream,
    year: primaryLearner.year,
    targetOccupation: "Data Analyst",
    targetOccupationId: primaryLearner.targetOccupationId,
    wageExpectationMonthly: primaryLearner.wageExpectationMonthly,
    language: "English",
    credentials: primaryLearner.credentials,
    skills: primaryLearner.skills,
    constraints: ["near Coimbatore"],
    missingFields: [],
    confidence: 1,
  };
}

function normalize(value) {
  return String(value || "").toLowerCase();
}

function profileText(profile) {
  return [
    profile.education,
    profile.stream,
    profile.year,
    profile.targetOccupation,
    ...(profile.credentials || []),
    ...(profile.skills || []),
  ]
    .map(normalize)
    .join(" ");
}

function targetOccupationId(profile) {
  const raw = normalize(profile.targetOccupation);
  const exact = occupations.find((occupation) => normalize(occupation.title) === raw);
  if (exact) return exact.id;
  if (raw.includes("data")) return "data-analyst";
  if (raw.includes("bank") || raw.includes("bfsi")) return "banking-ops";
  if (raw.includes("mis") || raw.includes("office")) return "mis-coordinator";
  if (raw.includes("cnc") || raw.includes("machine")) return "cnc-operator";
  if (raw.includes("health")) return "healthcare-support";
  if (raw.includes("solar")) return "solar-technician";
  if (raw.includes("scheme") || raw.includes("field")) return "scheme-field";
  return "";
}

export function normalizeExtractedProfile(profile) {
  return {
    ...profile,
    name: profile.name?.trim() || "Learner",
    region: regions.includes(profile.region) ? profile.region : "Coimbatore",
    wageExpectationMonthly: Math.max(6000, Number(profile.wageExpectationMonthly || 12000)),
    credentials: Array.isArray(profile.credentials) ? profile.credentials : [],
    skills: Array.isArray(profile.skills) ? profile.skills : [],
    constraints: Array.isArray(profile.constraints) ? profile.constraints : [],
    missingFields: Array.isArray(profile.missingFields) ? profile.missingFields : [],
    targetOccupationId: targetOccupationId(profile),
    confidence: Math.max(0, Math.min(1, Number(profile.confidence || 0))),
  };
}

function requirementMatches(text, group) {
  return group.some((keyword) => text.includes(keyword));
}

function qualificationFit(profile, occupation) {
  const text = profileText(profile);
  const matched = occupation.requiredGroups.filter((group) => requirementMatches(text, group));
  const missing = occupation.requiredGroups.length - matched.length;

  if (missing === 0) return { score: 1, missing, status: "Ready" };
  if (missing === 1) return { score: 0.76, missing, status: "One course short" };
  if (missing === 2) return { score: 0.42, missing, status: "Needs attention" };
  return { score: 0.25, missing, status: "Closest reachable" };
}

function getCourse(courseId) {
  return courses.find((course) => course.id === courseId);
}

function getDemand(region, field) {
  return (
    demand.find((row) => row.region === region && row.field === field) ||
    demand.find((row) => row.field === field) || {
      region,
      field,
      hiringStrength: 0.35,
      capacity: 6,
    }
  );
}

function getJob(region, occupationId) {
  return (
    jobs.find((job) => job.region === region && job.occupationId === occupationId) ||
    jobs.find((job) => job.occupationId === occupationId) || {
      id: `no-nearby-${occupationId}`,
      occupationId,
      region: "Nearest available region",
      openings: 0,
      distanceKm: 120,
      employer: "No nearby openings in current snapshot",
      sourceName: "Synthetic no-nearby state",
      sourceUrl: "",
    }
  );
}

function payGainScore(profile, occupation) {
  const expectation = Math.max(7000, Number(profile.wageExpectationMonthly || 12000));
  const gain = (occupation.basePayMonthly - expectation) / expectation;
  return Math.max(0.12, Math.min(1, gain / 1.25));
}

function crowdingStats(region, occupationId, learnerPool = syntheticLearners) {
  const occupation = occupations.find((row) => row.id === occupationId);
  const capacity = getDemand(region, occupation?.field).capacity;
  const aspirants = learnerPool.filter(
    (learner) => learner.region === region && learner.targetOccupationId === occupationId,
  ).length;
  const sampleTooSmall = aspirants < 5;
  const ratio = capacity > 0 ? aspirants / capacity : 0;
  const penalty = sampleTooSmall ? 0 : Math.max(0, Math.min(28, (ratio - 0.78) * 22));
  return { aspirants, capacity, ratio, penalty, sampleTooSmall };
}

export function buildCandidateFacts(profile) {
  const normalized = normalizeExtractedProfile(profile);
  return occupations.map((occupation) => {
    const course = getCourse(occupation.bridgeCourseId);
    const job = getJob(normalized.region, occupation.id);
    const demandRow = getDemand(normalized.region, occupation.field);
    const fit = qualificationFit(normalized, occupation);
    return {
      id: occupation.id,
      title: occupation.title,
      field: occupation.field,
      basePayMonthly: occupation.basePayMonthly,
      timeToJobWeeks: occupation.timeToJobWeeks,
      requiredSkills: occupation.skills,
      learnerEducation: normalized.education,
      learnerCredentials: normalized.credentials,
      qualificationStatus: fit.status,
      missingRequirementCount: fit.missing,
      bridgeCourse: course
        ? {
            id: course.id,
            title: course.title,
            provider: course.provider,
            durationWeeks: course.durationWeeks,
          }
        : null,
      nearbyJobs: {
        openings: job.openings,
        distanceKm: job.distanceKm,
        employer: job.employer,
        sourceName: job.sourceName,
      },
      demand: {
        hiringStrength: demandRow.hiringStrength,
        regionalCapacity: demandRow.capacity,
      },
    };
  });
}

export function rankRecommendations(profile, semanticScores, learnerPool = syntheticLearners) {
  const normalized = normalizeExtractedProfile(profile);
  const semanticById = new Map(semanticScores.map((row) => [row.occupationId, row]));

  const scored = occupations.map((occupation) => {
    const semantic = semanticById.get(occupation.id);
    if (!semantic) throw new Error(`Missing AI semantic score for ${occupation.id}.`);

    const fit = qualificationFit(normalized, occupation);
    const job = getJob(normalized.region, occupation.id);
    const demandRow = getDemand(normalized.region, occupation.field);
    const crowd = crowdingStats(normalized.region, occupation.id, learnerPool);
    const course = getCourse(occupation.bridgeCourseId);
    const targetMatch = normalized.targetOccupationId === occupation.id ? 0.05 : 0;
    const semanticFit = Math.min(1, semantic.score + targetMatch);
    const nearbyJobScore = Math.min(1, job.openings / 160);
    const payScore = payGainScore(normalized, occupation);

    const rawScore =
      100 *
      (weights.semanticFit * semanticFit +
        weights.qualificationFit * fit.score +
        weights.payGain * payScore +
        weights.nearbyJobs * nearbyJobScore +
        weights.demand * demandRow.hiringStrength);

    const finalScore = Math.max(0, rawScore - crowd.penalty);

    return {
      ...occupation,
      semanticFit,
      aiRationale: semantic.rationale,
      qualificationFit: fit.score,
      readinessStatus: fit.status,
      missingRequirementCount: fit.missing,
      payGainScore: payScore,
      nearbyJobScore,
      demandStrength: demandRow.hiringStrength,
      rawScore,
      finalScore,
      crowdingPenalty: crowd.penalty,
      crowding: crowd,
      course,
      job,
      wageDelta: occupation.basePayMonthly / normalized.wageExpectationMonthly,
    };
  });

  const ranked = scored.sort((a, b) => {
    if (b.finalScore !== a.finalScore) return b.finalScore - a.finalScore;
    if (b.basePayMonthly !== a.basePayMonthly) return b.basePayMonthly - a.basePayMonthly;
    if (b.job.openings !== a.job.openings) return b.job.openings - a.job.openings;
    return a.id.localeCompare(b.id);
  });

  const selfSelected = ranked.find((row) => row.id === normalized.targetOccupationId);
  const top = ranked.slice(0, 3);

  return {
    profile: normalized,
    top,
    all: ranked,
    selfSelected,
    weights,
    crowdingSummary: summarizeCrowding(normalized.region, learnerPool),
  };
}

export function summarizeCrowding(region, learnerPool = syntheticLearners) {
  return occupations
    .map((occupation) => ({
      occupationId: occupation.id,
      title: occupation.title,
      field: occupation.field,
      ...crowdingStats(region, occupation.id, learnerPool),
    }))
    .sort((a, b) => b.ratio - a.ratio);
}

export function buildCounselorRows(currentRun) {
  const selectedRows = [primaryLearner, ...syntheticLearners.slice(0, 17)];
  return selectedRows.map((learner, index) => {
    const occupation =
      index === 0 && currentRun?.top?.[0]
        ? currentRun.top[0]
        : occupations.find((row) => row.id === learner.targetOccupationId) || occupations[0];
    const crowd = crowdingStats(learner.region, learner.targetOccupationId);
    let status = "Ready";
    if (crowd.ratio > 1.1) status = "Crowding warning";
    if (learner.credentials.length < 2) status = "Needs attention";
    if (occupation.bridgeCourseId && index % 4 === 0) status = "One course short";
    return {
      ...learner,
      recommendedTitle: occupation.title,
      status,
      crowd,
      readiness: Math.max(42, Math.round(92 - crowd.penalty - (index % 5) * 6)),
    };
  });
}

export function buildGovernmentCells(currentRun) {
  const supply = new Map();
  for (const learner of syntheticLearners) {
    const occupation = occupations.find((row) => row.id === learner.targetOccupationId);
    if (!occupation) continue;
    const key = `${learner.region}::${occupation.field}`;
    supply.set(key, (supply.get(key) || 0) + 1);
  }

  if (currentRun?.top?.[0]) {
    const key = `${currentRun.profile.region}::${currentRun.top[0].field}`;
    supply.set(key, (supply.get(key) || 0) + 1);
  }

  return fields.map((field) => ({
    field,
    cells: regions.map((region) => {
      const demandRow = demand.find((row) => row.region === region && row.field === field);
      const count = supply.get(`${region}::${field}`) || 0;
      if (!demandRow && count === 0) {
        return { region, field, supply: 0, capacity: 0, status: "No data", intensity: 0 };
      }
      const capacity = demandRow?.capacity || 4;
      const ratio = count / capacity;
      let status = "Balanced";
      if (ratio === 0 && demandRow?.hiringStrength > 0.65) status = "High need";
      else if (ratio < 0.55) status = "Need";
      else if (ratio > 1.15) status = "Surplus";
      return {
        region,
        field,
        supply: count,
        capacity,
        status,
        intensity:
          status === "High need" ? 4 : status === "Need" ? 3 : status === "Balanced" ? 2 : 1,
      };
    }),
  }));
}

export function buildExplanationPayload(runResult, preferredLanguage) {
  return {
    preferredLanguage,
    learner: {
      name: runResult.profile.name,
      region: runResult.profile.region,
      education: runResult.profile.education,
      targetOccupation: runResult.profile.targetOccupation,
      confidence: runResult.profile.confidence,
      missingFields: runResult.profile.missingFields,
    },
    recommendations: runResult.top.map((row) => ({
      title: row.title,
      field: row.field,
      finalScore: Math.round(row.finalScore),
      rawScore: Math.round(row.rawScore),
      payMonthly: row.basePayMonthly,
      wageDelta: Number(row.wageDelta.toFixed(1)),
      jobsNearby: row.job.openings,
      distanceKm: row.job.distanceKm,
      course: row.course?.title,
      timeToJobWeeks: row.timeToJobWeeks,
      readinessStatus: row.readinessStatus,
      crowdingPenalty: Math.round(row.crowdingPenalty),
      aiRationale: row.aiRationale,
    })),
    selfSelectedPath: runResult.selfSelected
      ? {
          title: runResult.selfSelected.title,
          crowdingRatio: Number(runResult.selfSelected.crowding.ratio.toFixed(2)),
          aspirants: runResult.selfSelected.crowding.aspirants,
          capacity: runResult.selfSelected.crowding.capacity,
          finalScore: Math.round(runResult.selfSelected.finalScore),
        }
      : null,
  };
}
