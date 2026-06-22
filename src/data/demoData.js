export const regions = ["Coimbatore", "Tiruchirappalli", "Madurai", "Salem", "Chennai"];

export const fields = [
  "Banking and finance",
  "IT services",
  "Manufacturing",
  "Healthcare",
  "Green energy",
  "Public service operations",
];

export const courses = [
  {
    id: "course-bfsi-ops",
    title: "Banking Operations and KYC Certificate",
    provider: "Naan Mudhalvan",
    sourceType: "state-government",
    authority: "Tamil Nadu Skill Development Corporation",
    durationWeeks: 6,
    sourceName: "Naan Mudhalvan public catalog",
    sourceUrl: "https://www.naanmudhalvan.tn.gov.in/",
    normalizedTitle: "BFSI operations bridge",
    eligibleGapTags: ["finance-foundation", "digital-records", "kyc-operations"],
    confidence: 0.84,
  },
  {
    id: "course-data-analytics",
    title: "Data Analytics with Spreadsheets and SQL",
    provider: "SWAYAM",
    sourceType: "government-of-india",
    authority: "Ministry of Education",
    durationWeeks: 8,
    sourceName: "SWAYAM public catalog",
    sourceUrl: "https://swayam.gov.in/",
    normalizedTitle: "Entry data analytics bridge",
    eligibleGapTags: ["quantitative-foundation", "analytics-tools", "data-reporting"],
    confidence: 0.82,
  },
  {
    id: "course-mis-reporting",
    title: "MIS Reporting for Office Operations",
    provider: "PMKVY",
    sourceType: "government-of-india",
    authority: "Ministry of Skill Development and Entrepreneurship",
    durationWeeks: 4,
    sourceName: "PMKVY skill course catalog",
    sourceUrl: "https://www.pmkvyofficial.org/",
    normalizedTitle: "MIS and reporting bridge",
    eligibleGapTags: ["graduate-foundation", "office-digital", "operations-reporting"],
    confidence: 0.8,
  },
  {
    id: "course-cnc",
    title: "CNC Machine Operator Foundation",
    provider: "NPTEL",
    sourceType: "government-of-india",
    authority: "NPTEL / Ministry of Education",
    durationWeeks: 10,
    sourceName: "NPTEL public catalog",
    sourceUrl: "https://nptel.ac.in/",
    normalizedTitle: "CNC operator bridge",
    eligibleGapTags: ["technical-foundation", "machine-safety", "manufacturing-qa"],
    confidence: 0.78,
  },
  {
    id: "course-healthcare",
    title: "Healthcare Front Desk and Patient Records",
    provider: "SWAYAM Plus",
    sourceType: "government-of-india",
    authority: "Ministry of Education",
    durationWeeks: 5,
    sourceName: "SWAYAM Plus industry catalog",
    sourceUrl: "https://swayam-plus.swayam2.ac.in/",
    normalizedTitle: "Healthcare support bridge",
    eligibleGapTags: ["health-science-foundation", "patient-records", "service-communication"],
    confidence: 0.79,
  },
  {
    id: "course-solar",
    title: "Solar Field Technician Basics",
    provider: "Skill India Digital",
    sourceType: "government-of-india",
    authority: "National Skill Development Corporation",
    durationWeeks: 7,
    sourceName: "Skill India Digital public catalog",
    sourceUrl: "https://www.skillindiadigital.gov.in/",
    normalizedTitle: "Solar technician bridge",
    eligibleGapTags: ["electrical-foundation", "field-safety", "solar-maintenance"],
    confidence: 0.76,
  },
  {
    id: "course-scheme-field",
    title: "Government Scheme Field Coordinator Orientation",
    provider: "Tamil Nadu Skill Development Corporation",
    sourceType: "state-government",
    authority: "Tamil Nadu Skill Development Corporation",
    durationWeeks: 2,
    sourceName: "Tamil Nadu Skill Development Corporation public catalog",
    sourceUrl: "https://www.tnskill.tn.gov.in/",
    normalizedTitle: "Public scheme field operations",
    eligibleGapTags: ["social-sector-foundation", "field-documentation", "local-language-service"],
    confidence: 0.75,
  },
];

export const occupations = [
  {
    id: "banking-ops",
    title: "Banking Operations Associate",
    field: "Banking and finance",
    basePayMonthly: 27000,
    timeToJobWeeks: "8 to 10",
    requirements: [
      {
        label: "Commerce, economics, or finance foundation",
        gapTag: "finance-foundation",
        keywords: ["economics", "commerce", "b.com", "finance"],
      },
      {
        label: "Digital records and spreadsheet skills",
        gapTag: "digital-records",
        keywords: ["digital", "spreadsheet", "computer"],
      },
      {
        label: "KYC and customer workflow readiness",
        gapTag: "kyc-operations",
        keywords: ["kyc", "customer", "banking", "insurance"],
      },
    ],
    requiredGroups: [
      ["economics", "commerce", "b.com", "finance"],
      ["digital", "spreadsheet", "computer"],
    ],
    bridgeCourseId: "course-bfsi-ops",
    skills: ["customer communication", "records handling", "basic finance", "KYC workflow"],
  },
  {
    id: "data-analyst",
    title: "Data Analyst, Entry Level",
    field: "IT services",
    basePayMonthly: 32000,
    timeToJobWeeks: "10 to 14",
    requirements: [
      {
        label: "Quantitative degree or statistics foundation",
        gapTag: "quantitative-foundation",
        keywords: ["economics", "b.sc", "statistics", "commerce", "engineering"],
      },
      {
        label: "Analytics tools, spreadsheets, SQL, or Python",
        gapTag: "analytics-tools",
        keywords: ["analytics", "sql", "python", "spreadsheet"],
      },
      {
        label: "Data communication and reporting practice",
        gapTag: "data-reporting",
        keywords: ["data analysis", "charts", "reporting", "mis"],
      },
    ],
    requiredGroups: [
      ["economics", "b.sc", "statistics", "commerce", "engineering"],
      ["analytics", "sql", "python", "spreadsheet"],
    ],
    bridgeCourseId: "course-data-analytics",
    skills: ["spreadsheets", "data cleaning", "SQL basics", "charts"],
  },
  {
    id: "mis-coordinator",
    title: "Data Operations Coordinator",
    field: "IT services",
    basePayMonthly: 24000,
    timeToJobWeeks: "6 to 9",
    requirements: [
      {
        label: "General graduate foundation",
        gapTag: "graduate-foundation",
        keywords: ["commerce", "economics", "arts", "science"],
      },
      {
        label: "Spreadsheet and office digital skills",
        gapTag: "office-digital",
        keywords: ["digital", "spreadsheet", "computer"],
      },
      {
        label: "Operations reporting and data quality",
        gapTag: "operations-reporting",
        keywords: ["mis", "reporting", "records", "data entry"],
      },
    ],
    requiredGroups: [
      ["commerce", "economics", "arts", "science"],
      ["digital", "spreadsheet", "computer"],
    ],
    bridgeCourseId: "course-mis-reporting",
    skills: ["MIS reporting", "data entry quality", "operations tracking"],
  },
  {
    id: "cnc-operator",
    title: "CNC Machine Operator",
    field: "Manufacturing",
    basePayMonthly: 21000,
    timeToJobWeeks: "8 to 12",
    requirements: [
      {
        label: "ITI, polytechnic, mechanical, or manufacturing foundation",
        gapTag: "technical-foundation",
        keywords: ["iti", "polytechnic", "mechanical", "manufacturing"],
      },
      {
        label: "Machine safety and workshop practice",
        gapTag: "machine-safety",
        keywords: ["safety", "machine", "workshop"],
      },
      {
        label: "Production quality and CNC exposure",
        gapTag: "manufacturing-qa",
        keywords: ["cnc", "production", "quality", "programming"],
      },
    ],
    requiredGroups: [
      ["iti", "polytechnic", "mechanical", "manufacturing"],
      ["safety", "machine", "workshop"],
    ],
    bridgeCourseId: "course-cnc",
    skills: ["machine setup", "production QA", "safety protocol"],
  },
  {
    id: "healthcare-support",
    title: "Healthcare Support Coordinator",
    field: "Healthcare",
    basePayMonthly: 19000,
    timeToJobWeeks: "5 to 8",
    requirements: [
      {
        label: "Science, biology, nursing, or allied foundation",
        gapTag: "health-science-foundation",
        keywords: ["science", "biology", "nursing", "arts"],
      },
      {
        label: "Patient records and digital reporting",
        gapTag: "patient-records",
        keywords: ["records", "digital", "health"],
      },
      {
        label: "Front desk communication readiness",
        gapTag: "service-communication",
        keywords: ["communication", "front desk", "customer", "service"],
      },
    ],
    requiredGroups: [
      ["science", "biology", "nursing", "arts"],
      ["records", "digital", "communication"],
    ],
    bridgeCourseId: "course-healthcare",
    skills: ["patient records", "front desk workflow", "digital reporting"],
  },
  {
    id: "solar-technician",
    title: "Solar Field Technician",
    field: "Green energy",
    basePayMonthly: 23000,
    timeToJobWeeks: "7 to 11",
    requirements: [
      {
        label: "Electrical, ITI, polytechnic, or science foundation",
        gapTag: "electrical-foundation",
        keywords: ["iti", "polytechnic", "electrical", "science"],
      },
      {
        label: "Field safety and technical work practice",
        gapTag: "field-safety",
        keywords: ["safety", "field", "technical"],
      },
      {
        label: "Solar installation and maintenance basics",
        gapTag: "solar-maintenance",
        keywords: ["solar", "installation", "maintenance", "pv"],
      },
    ],
    requiredGroups: [
      ["iti", "polytechnic", "electrical", "science"],
      ["safety", "field", "technical"],
    ],
    bridgeCourseId: "course-solar",
    skills: ["solar installation", "site safety", "maintenance logs"],
  },
  {
    id: "scheme-field",
    title: "Government Scheme Field Coordinator",
    field: "Public service operations",
    basePayMonthly: 22000,
    timeToJobWeeks: "4 to 7",
    requirements: [
      {
        label: "Arts, economics, commerce, or social-sector foundation",
        gapTag: "social-sector-foundation",
        keywords: ["arts", "economics", "commerce", "social"],
      },
      {
        label: "Field documentation and digital records",
        gapTag: "field-documentation",
        keywords: ["records", "field", "documentation", "digital"],
      },
      {
        label: "Local language service communication",
        gapTag: "local-language-service",
        keywords: ["communication", "local language", "tamil"],
      },
    ],
    requiredGroups: [
      ["arts", "economics", "commerce", "social"],
      ["communication", "records", "local language", "digital"],
    ],
    bridgeCourseId: "course-scheme-field",
    skills: ["beneficiary support", "field documentation", "Tamil communication"],
  },
];

export const jobs = [
  {
    id: "job-bfsi-cbe",
    occupationId: "banking-ops",
    region: "Coimbatore",
    openings: 240,
    distanceKm: 25,
    employer: "District bank service partners",
    sourceName: "Synthetic NCS-style job seed",
    sourceUrl: "https://www.ncs.gov.in/",
  },
  {
    id: "job-data-cbe",
    occupationId: "data-analyst",
    region: "Coimbatore",
    openings: 72,
    distanceKm: 30,
    employer: "SME analytics and back-office firms",
    sourceName: "Synthetic public job seed",
    sourceUrl: "https://www.ncs.gov.in/",
  },
  {
    id: "job-mis-cbe",
    occupationId: "mis-coordinator",
    region: "Coimbatore",
    openings: 118,
    distanceKm: 22,
    employer: "Logistics, retail, and education operators",
    sourceName: "Synthetic NCS-style job seed",
    sourceUrl: "https://www.ncs.gov.in/",
  },
  {
    id: "job-cnc-cbe",
    occupationId: "cnc-operator",
    region: "Coimbatore",
    openings: 132,
    distanceKm: 18,
    employer: "Manufacturing suppliers",
    sourceName: "Synthetic industrial cluster seed",
    sourceUrl: "https://www.msde.gov.in/",
  },
  {
    id: "job-health-mdu",
    occupationId: "healthcare-support",
    region: "Madurai",
    openings: 96,
    distanceKm: 20,
    employer: "Private hospitals and clinics",
    sourceName: "Synthetic public job seed",
    sourceUrl: "https://www.ncs.gov.in/",
  },
  {
    id: "job-solar-salem",
    occupationId: "solar-technician",
    region: "Salem",
    openings: 88,
    distanceKm: 35,
    employer: "Renewable field service partners",
    sourceName: "Synthetic green jobs seed",
    sourceUrl: "https://www.skillindiadigital.gov.in/",
  },
  {
    id: "job-field-cbe",
    occupationId: "scheme-field",
    region: "Coimbatore",
    openings: 64,
    distanceKm: 28,
    employer: "District livelihood program partners",
    sourceName: "Synthetic scheme operations seed",
    sourceUrl: "https://www.tnskill.tn.gov.in/",
  },
];

export const demand = [
  { region: "Coimbatore", field: "Banking and finance", hiringStrength: 0.82, capacity: 26 },
  { region: "Coimbatore", field: "IT services", hiringStrength: 0.48, capacity: 9 },
  { region: "Coimbatore", field: "Manufacturing", hiringStrength: 0.74, capacity: 18 },
  { region: "Coimbatore", field: "Healthcare", hiringStrength: 0.52, capacity: 14 },
  { region: "Coimbatore", field: "Green energy", hiringStrength: 0.68, capacity: 12 },
  { region: "Coimbatore", field: "Public service operations", hiringStrength: 0.64, capacity: 11 },
  { region: "Tiruchirappalli", field: "Banking and finance", hiringStrength: 0.77, capacity: 20 },
  { region: "Tiruchirappalli", field: "IT services", hiringStrength: 0.42, capacity: 8 },
  { region: "Tiruchirappalli", field: "Public service operations", hiringStrength: 0.72, capacity: 14 },
  { region: "Madurai", field: "Healthcare", hiringStrength: 0.81, capacity: 18 },
  { region: "Madurai", field: "Banking and finance", hiringStrength: 0.65, capacity: 14 },
  { region: "Salem", field: "Green energy", hiringStrength: 0.8, capacity: 16 },
  { region: "Salem", field: "Manufacturing", hiringStrength: 0.7, capacity: 17 },
  { region: "Chennai", field: "IT services", hiringStrength: 0.72, capacity: 26 },
  { region: "Chennai", field: "Banking and finance", hiringStrength: 0.76, capacity: 28 },
];

export const sampleInputs = {
  english:
    "My name is Asha R. I am 22, final year BA Economics at Govt Arts College Coimbatore. My Academic Bank of Credits record includes Microeconomics, Statistics for Economics, Data Analysis with Spreadsheets, Public Finance, and Tamil Communication. I also have Class 12 Commerce. I want a Data Analyst job, but I can also consider bank or office work. I expect around 15000 rupees per month and need work near Coimbatore.",
  tamil:
    "என் பெயர் ஆஷா. கோயம்புத்தூரில் அரசு கலைக் கல்லூரியில் BA Economics இறுதி ஆண்டு படிக்கிறேன். Academic Bank of Credits பதிவில் Microeconomics, Statistics for Economics, Data Analysis with Spreadsheets, Public Finance, Tamil Communication முடித்திருக்கிறேன். Class 12 Commerce உள்ளது. எனக்கு Data Analyst வேலை பிடிக்கும். மாதம் 15000 ரூபாய் எதிர்பார்க்கிறேன். கோயம்புத்தூர் அருகில் வேலை வேண்டும்.",
  missing:
    "I am Priya from Salem. I finished school and have some computer practice, but I do not have all certificates with me. I want a stable first job and can do field work if training is short.",
};

function abcRows(rows) {
  return rows.map((row) => ({
    selected: row.selected ?? true,
    status: row.status || "Completed",
    ...row,
  }));
}

function credentialsFromCredits(education, records, extra = []) {
  const selectedSubjects = records
    .filter((record) => record.selected)
    .map((record) => record.subjectName);
  return [education, ...extra, ...selectedSubjects];
}

const abcCreditTemplates = {
  economics: abcRows([
    {
      university: "Bharathiar University",
      course: "BA Economics",
      subjectName: "Microeconomics",
      subjectCode: "ECO501",
      year: 2025,
      credit: 6,
    },
    {
      university: "Bharathiar University",
      course: "BA Economics",
      subjectName: "Statistics for Economics",
      subjectCode: "ECO503",
      year: 2025,
      credit: 6,
    },
    {
      university: "Bharathiar University",
      course: "BA Economics",
      subjectName: "Data Analysis with Spreadsheets",
      subjectCode: "SEC214",
      year: 2025,
      credit: 4,
    },
    {
      university: "Bharathiar University",
      course: "BA Economics",
      subjectName: "Public Finance",
      subjectCode: "ECO506",
      year: 2025,
      credit: 5,
    },
    {
      university: "Tamil Nadu Open University",
      course: "Foundation",
      subjectName: "Tamil Communication",
      subjectCode: "TAM101",
      year: 2024,
      credit: 3,
    },
  ]),
  commerce: abcRows([
    {
      university: "Madurai Kamaraj University",
      course: "BCom",
      subjectName: "Financial Accounting",
      subjectCode: "COM201",
      year: 2024,
      credit: 6,
    },
    {
      university: "Madurai Kamaraj University",
      course: "BCom",
      subjectName: "Business Statistics",
      subjectCode: "COM204",
      year: 2024,
      credit: 5,
    },
    {
      university: "Madurai Kamaraj University",
      course: "BCom",
      subjectName: "Banking and Insurance",
      subjectCode: "COM307",
      year: 2025,
      credit: 5,
    },
    {
      university: "SWAYAM",
      course: "Digital Skills",
      subjectName: "Spreadsheet Applications",
      subjectCode: "DIG112",
      year: 2025,
      credit: 4,
    },
  ]),
  biology: abcRows([
    {
      university: "Madurai Kamaraj University",
      course: "BSc Biology",
      subjectName: "Cell Biology",
      subjectCode: "BIO203",
      year: 2024,
      credit: 6,
    },
    {
      university: "Madurai Kamaraj University",
      course: "BSc Biology",
      subjectName: "Biostatistics",
      subjectCode: "BIO306",
      year: 2025,
      credit: 5,
    },
    {
      university: "Tamil Nadu Open University",
      course: "Healthcare Skills",
      subjectName: "Patient Records and Digital Health",
      subjectCode: "HLT118",
      year: 2025,
      credit: 4,
    },
  ]),
  electrical: abcRows([
    {
      university: "Directorate of Employment and Training",
      course: "ITI Electrical",
      subjectName: "Electrical Wiring Practice",
      subjectCode: "ITI-ELE101",
      year: 2024,
      credit: 8,
    },
    {
      university: "Directorate of Employment and Training",
      course: "ITI Electrical",
      subjectName: "Workshop Safety",
      subjectCode: "ITI-SAF102",
      year: 2024,
      credit: 4,
    },
    {
      university: "Skill India Digital",
      course: "Green Energy",
      subjectName: "Solar PV Installation Basics",
      subjectCode: "SID-SOL201",
      year: 2025,
      credit: 4,
    },
  ]),
  mechanical: abcRows([
    {
      university: "Directorate of Technical Education",
      course: "Diploma Mechanical",
      subjectName: "Engineering Drawing and Graphics",
      subjectCode: "DME101",
      year: 2024,
      credit: 6,
    },
    {
      university: "Directorate of Technical Education",
      course: "Diploma Mechanical",
      subjectName: "Manufacturing Processes",
      subjectCode: "DME203",
      year: 2025,
      credit: 6,
    },
    {
      university: "NPTEL",
      course: "Manufacturing Skills",
      subjectName: "CNC Programming Fundamentals",
      subjectCode: "NPTEL-CNC101",
      year: 2025,
      credit: 4,
    },
  ]),
};

export const primaryLearner = {
  id: "learner-asha",
  name: "Asha R.",
  region: "Coimbatore",
  stream: "Arts",
  education: "BA Economics",
  year: "Final year",
  wageExpectationMonthly: 15000,
  targetOccupationId: "data-analyst",
  academicCredits: abcCreditTemplates.economics,
  credentials: credentialsFromCredits("BA Economics", abcCreditTemplates.economics, ["Class 12 Commerce"]),
  skills: ["basic numeracy", "spreadsheet confidence", "Tamil communication"],
};

const names = [
  "Kavin",
  "Meena",
  "Harini",
  "Arun",
  "Nisha",
  "Muthu",
  "Farah",
  "Divya",
  "Suresh",
  "Latha",
  "Ravi",
  "Keerthi",
  "Manoj",
  "Revathi",
  "Bala",
  "Yamini",
  "Gokul",
  "Sneha",
  "Ajay",
  "Malar",
];

const learnerTemplates = [
  {
    stream: "Arts",
    education: "BA Economics",
    creditTemplate: "economics",
    extraCredentials: ["Class 12 Commerce"],
    skills: ["communication", "records", "basic numeracy"],
  },
  {
    stream: "Commerce",
    education: "BCom",
    creditTemplate: "commerce",
    extraCredentials: ["Class 12 Commerce"],
    skills: ["accounts", "spreadsheet", "customer communication"],
  },
  {
    stream: "Science",
    education: "BSc Biology",
    creditTemplate: "biology",
    extraCredentials: ["Class 12 Science"],
    skills: ["records", "communication", "science"],
  },
  {
    stream: "Vocational",
    education: "ITI Electrical",
    creditTemplate: "electrical",
    extraCredentials: ["Class 10"],
    skills: ["field", "safety", "technical"],
  },
  {
    stream: "Polytechnic",
    education: "Diploma Mechanical",
    creditTemplate: "mechanical",
    extraCredentials: ["Class 10"],
    skills: ["machine", "safety", "technical"],
  },
];

const targetSequence = [
  "data-analyst",
  "data-analyst",
  "data-analyst",
  "data-analyst",
  "data-analyst",
  "banking-ops",
  "mis-coordinator",
  "cnc-operator",
  "healthcare-support",
  "solar-technician",
  "scheme-field",
  "data-analyst",
];

export const syntheticLearners = Array.from({ length: 52 }, (_, index) => {
  const template = learnerTemplates[index % learnerTemplates.length];
  const region = index < 26 ? "Coimbatore" : regions[index % regions.length];
  const targetOccupationId = targetSequence[index % targetSequence.length];
  const academicCredits = abcCreditTemplates[template.creditTemplate].map((record, recordIndex) => ({
    ...record,
    selected: index % 9 === 0 && recordIndex === 2 ? false : record.selected,
    status: index % 9 === 0 && recordIndex === 2 ? "Pending verification" : record.status,
    year: record.year - (index % 2),
  }));
  return {
    id: `synthetic-${String(index + 1).padStart(2, "0")}`,
    name: `${names[index % names.length]} ${String.fromCharCode(65 + (index % 20))}.`,
    region,
    stream: template.stream,
    education: template.education,
    year: index % 3 === 0 ? "Final year" : "Recent graduate",
    wageExpectationMonthly: 12000 + (index % 7) * 1500,
    targetOccupationId,
    academicCredits,
    credentials: credentialsFromCredits(template.education, academicCredits, template.extraCredentials),
    skills: template.skills,
    synthetic: true,
  };
});
