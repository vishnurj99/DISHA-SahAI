import {
  courses,
  demand,
  jobs,
  occupations,
  primaryLearner,
  syntheticLearners,
} from "../src/data/demoData.js";

const errors = [];

const courseIds = new Set(courses.map((course) => course.id));
const occupationIds = new Set(occupations.map((occupation) => occupation.id));
const allowedCourseSourceTypes = new Set(["government-of-india", "state-government", "public-open"]);

for (const course of courses) {
  for (const key of ["provider", "sourceType", "authority", "sourceName", "sourceUrl"]) {
    if (typeof course[key] !== "string" || !course[key].trim()) {
      errors.push(`${course.id} missing ${key}`);
    }
  }
  if (!allowedCourseSourceTypes.has(course.sourceType)) {
    errors.push(`${course.id} has unsupported sourceType ${course.sourceType}`);
  }
  if (!Array.isArray(course.eligibleGapTags) || course.eligibleGapTags.length === 0) {
    errors.push(`${course.id} must map to at least one eligibleGapTag`);
  }
}

for (const occupation of occupations) {
  if (!courseIds.has(occupation.bridgeCourseId)) {
    errors.push(`${occupation.id} references missing course ${occupation.bridgeCourseId}`);
  }
  if (!Array.isArray(occupation.requirements) || occupation.requirements.length === 0) {
    errors.push(`${occupation.id} must include labeled requirements`);
  } else {
    const bridgeCourse = courses.find((course) => course.id === occupation.bridgeCourseId);
    const courseGapTags = new Set(bridgeCourse?.eligibleGapTags || []);
    for (const [index, requirement] of occupation.requirements.entries()) {
      const prefix = `${occupation.id} requirements[${index}]`;
      for (const key of ["label", "gapTag"]) {
        if (typeof requirement[key] !== "string" || !requirement[key].trim()) {
          errors.push(`${prefix} missing ${key}`);
        }
      }
      if (!Array.isArray(requirement.keywords) || requirement.keywords.length === 0) {
        errors.push(`${prefix} must include keywords`);
      }
      if (requirement.gapTag && !courseGapTags.has(requirement.gapTag)) {
        errors.push(`${occupation.bridgeCourseId} does not cover ${occupation.id} gap ${requirement.gapTag}`);
      }
    }
  }
  if (!jobs.some((job) => job.occupationId === occupation.id)) {
    errors.push(`${occupation.id} has no job evidence row`);
  }
  if (!demand.some((row) => row.field === occupation.field)) {
    errors.push(`${occupation.id} has no demand row for field ${occupation.field}`);
  }
}

for (const job of jobs) {
  if (!occupationIds.has(job.occupationId)) {
    errors.push(`${job.id} references missing occupation ${job.occupationId}`);
  }
  if (!job.sourceName) errors.push(`${job.id} missing sourceName`);
}

function validateAcademicCredits(learner) {
  if (!Array.isArray(learner.academicCredits) || learner.academicCredits.length === 0) {
    errors.push(`${learner.id} must include Academic Bank of Credits records`);
    return;
  }
  for (const [index, record] of learner.academicCredits.entries()) {
    const prefix = `${learner.id} academicCredits[${index}]`;
    for (const key of ["university", "course", "subjectName", "subjectCode", "status"]) {
      if (typeof record[key] !== "string" || !record[key].trim()) {
        errors.push(`${prefix} missing ${key}`);
      }
    }
    if (typeof record.year !== "number") errors.push(`${prefix} missing numeric year`);
    if (typeof record.credit !== "number") errors.push(`${prefix} missing numeric credit`);
    if (typeof record.selected !== "boolean") errors.push(`${prefix} missing selected boolean`);
  }
}

validateAcademicCredits(primaryLearner);

for (const learner of syntheticLearners) {
  if (!occupationIds.has(learner.targetOccupationId)) {
    errors.push(`${learner.id} references missing target occupation ${learner.targetOccupationId}`);
  }
  if (!learner.synthetic) errors.push(`${learner.id} must be clearly marked synthetic`);
  validateAcademicCredits(learner);
}

if (errors.length) {
  console.error("Data validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Data validation passed: ${syntheticLearners.length} synthetic learners with ABC records, ${occupations.length} occupations, ${courses.length} courses, ${jobs.length} job rows.`,
);
