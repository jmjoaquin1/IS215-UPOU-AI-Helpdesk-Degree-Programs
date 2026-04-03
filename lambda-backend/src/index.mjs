import { getFileFromS3 } from "./s3Service.mjs";

const DEFAULT_FILE_KEY =
  process.env.S3_FILE_KEY || "index/upou_program_catalog.md";

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractUserQuery(event = {}) {
  const parsedBody =
    typeof event.body === "string" ? safeJsonParse(event.body) : event.body;

  return (
    parsedBody?.query ||
    parsedBody?.message ||
    event?.queryStringParameters?.q ||
    event?.query ||
    ""
  );
}

function chooseFileKey(query) {
  const q = String(query || "").toLowerCase().trim();

  if (!q) {
    return {
      fileKey: DEFAULT_FILE_KEY,
      matchedBy: "default-fallback",
    };
  }

  const routes = [
    {
      keywords: ["mis courses", "courses in mis", "mis subjects", "mis curriculum"],
      fileKey: "courses/MIS_courses.md",
    },
    {
      keywords: [
        "master of information systems",
        "mis program",
        "about mis",
        "mis",
      ],
      fileKey: "programs/masters/master_of_information_systems.md",
    },

    {
      keywords: [
        "bachelor of arts in multimedia studies",
        "multimedia studies",
        "bams",
      ],
      fileKey: "programs/undergraduate/bachelor_of_arts_in_multimedia_studies.md",
    },
    {
      keywords: [
        "associate of science in information technology",
        "information technology program",
        "asit",
      ],
      fileKey: "programs/undergraduate/associate_of_science_in_information_technology.md",
    },

    {
      keywords: [
        "diploma in computer science",
        "computer science diploma",
        "dcs",
      ],
      fileKey: "programs/diploma/diploma_in_computer_science.md",
    },
    {
      keywords: [
        "diploma in mathematics teaching",
        "mathematics teaching diploma",
      ],
      fileKey: "programs/diploma/diploma_in_mathematics_teaching.md",
    },
    {
      keywords: ["diploma in social work", "social work diploma"],
      fileKey: "programs/diploma/diploma_in_social_work.md",
    },

    {
      keywords: [
        "doctor of philosophy in education",
        "phd in education",
      ],
      fileKey: "programs/doctorate/doctor_of_philosophy_in_education.md",
    },
    {
      keywords: ["doctor of communication"],
      fileKey: "programs/doctorate/doctor_of_communication.md",
    },

    {
      keywords: ["fics contact", "fics faculty", "fics"],
      fileKey: "faculty/FICS_contacts.md",
    },
    {
      keywords: ["fmds contact", "fmds faculty", "fmds"],
      fileKey: "faculty/FMDS_contacts.md",
    },
    {
      keywords: ["fed contact", "fed faculty", "fed"],
      fileKey: "faculty/FED_contacts.md",
    },

    {
      keywords: ["redirect directive", "bot directive", "directives"],
      fileKey: "directives/bot_redirect_directives.md",
    },
    {
      keywords: ["scope rules", "bot scope"],
      fileKey: "directives/bot_scope_rules.md",
    },
    {
      keywords: ["fallback response", "fallback responses"],
      fileKey: "directives/fallback_responses.md",
    },
  ];

  for (const route of routes) {
    const matchedKeyword = route.keywords.find((keyword) => q.includes(keyword));
    if (matchedKeyword) {
      return {
        fileKey: route.fileKey,
        matchedBy: matchedKeyword,
      };
    }
  }

  // Generic category routing
  if (
    q.includes("master") ||
    q.includes("masters") ||
    q.includes("master's") ||
    q.includes("diploma") ||
    q.includes("undergraduate") ||
    q.includes("doctorate") ||
    q.includes("program") ||
    q.includes("degree")
  ) {
    return {
      fileKey: "index/upou_program_catalog.md",
      matchedBy: "generic-program-query",
    };
  }

  return {
    fileKey: DEFAULT_FILE_KEY,
    matchedBy: "default-fallback",
  };
}

export const handler = async (event) => {
  try {
    const bucketName = process.env.S3_BUCKET_NAME;
    const userQuery = extractUserQuery(event);
    const { fileKey, matchedBy } = chooseFileKey(userQuery);

    const content = await getFileFromS3(bucketName, fileKey);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "File fetched successfully from S3",
        userQuery,
        matchedBy,
        fileKey,
        content,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error fetching file from S3",
        error: error.message,
      }),
    };
  }
};