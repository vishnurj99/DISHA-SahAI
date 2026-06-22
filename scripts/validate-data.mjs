import { courses, demand, jobs, occupations, syntheticLearners } from "../src/data/demoData.js";

const errors = [];

const courseIds = new Set(courses.map((course) => course.id));
const occupationIds = new Set(occupations.map((occupation) => occupation.id));

for (const occupation of occupations) {
  if (!courseIds.has(occupation.bridgeCourseId)) {
    errors.push(`${occupation.id} references missing course ${occupation.bridgeCourseId}`);
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

for (const learner of syntheticLearners) {
  if (!occupationIds.has(learner.targetOccupationId)) {
    errors.push(`${learner.id} references missing target occupation ${learner.targetOccupationId}`);
  }
  if (!learner.synthetic) errors.push(`${learner.id} must be clearly marked synthetic`);
}

if (errors.length) {
  console.error("Data validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Data validation passed: ${syntheticLearners.length} synthetic learners, ${occupations.length} occupations, ${courses.length} courses, ${jobs.length} job rows.`,
);
