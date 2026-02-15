import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import colors from "colors";
import { QueryTypes } from "sequelize";
import { sequelize, connectDb } from "../config/db.js";
import { initModels } from "../models/index.js";
import {
  ACTIVITY_STATUS,
  ANNOUNCEMENT_STATUS,
  BLOG_STATUS,
  CONFERENCE_STATUS,
  CONTENT_SUBMISSION_MSG_VISIBILITY_SCOPE,
  CONTENT_SUBMISSION_PAYMENT_STATUS,
  CONTENT_SUBMISSION_SRC_PREFIX,
  CONTENT_SUBMISSION_STATUS,
  CONTENT_SUBMISSION_UPLOADER_USER_TYPE,
  MONTH_ABBR,
  REVIEW_ASSIGNMENT_STATUS,
  USER_ROLE,
  USER_STATUS,
  TRAINING_STATUS,
  NOTIFICATION_TYPE,
} from "../utils/constants.js";
import { createRefDataService } from "../services/referenceData.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../..");
const seederDataDir = path.join(__dirname, "data");

const storageBaseDir = process.env.FILE_STORAGE_PATH || "./storage";
const normalizedStorageBase = storageBaseDir
  .replace(/\\/g, "/")
  .replace(/^\.\//, "")
  .replace(/^\/+/, "")
  .replace(/\/+$/, "");
const storageAbsRoot = path.resolve(projectRoot, storageBaseDir);

const ALLOWED_BUCKETS = new Set(["assets", "submissions", "cvs", "profile_photos"]);

await connectDb();

const {
  User,
  Conference,
  File,
  ContentSubmission,
  ContentSubmissionVersion,
  ContentSubmissionMessage,
  ContentReviewAssignment,
  ContentSubmissionPayment,
  Training,
  Announcement,
  Blog,
  Activity,
  Notification,
} = initModels(sequelize);

export const ADMIN_USER_SEED = {
  firstName: "Admin",
  lastName: "User",
  phone: "+31616849000",
  email: "admin@episteme.org",
  password: "admin",
  roles: [USER_ROLE.ADMIN],
  status: USER_STATUS.ACTIVE,
  institution: "Episteme University",
  occupation: "Program Chair",
  country: "Netherlands",
  linkedinUrl: "https://www.linkedin.com/in/admin/",
};

export async function initializeBaseData() {
  const refDataService = createRefDataService({});

  const [adminUser, countries, topics] = await Promise.all([
    (async () => {
      const existing = await User.findOne({ where: { email: ADMIN_USER_SEED.email } });
      if (!existing) {
        const [created] = await User.bulkCreate([ADMIN_USER_SEED], {
          individualHooks: true,
          returning: true,
        });
        return created;
      }
      return existing;
    })(),
    refDataService.getCountries(),
    refDataService.getTopics(),
  ]);

  console.log(`Reference data ready (${countries.length} countries, ${topics.length} topics)`.cyan);
  return adminUser;
}

const users = [
  {
    firstName: "Alice",
    lastName: "Morgan",
    phone: "+31612340001",
    email: "user1@episteme.org",
    password: "user1",
    roles: [USER_ROLE.USER],
    status: USER_STATUS.ACTIVE,
    institution: "Delft University of Technology",
    occupation: "PhD Candidate",
    country: "Netherlands",
    linkedinUrl: "https://www.linkedin.com/in/alicemorgan/",
  },
  {
    firstName: "Bob",
    lastName: "Chen",
    phone: "+31612340002",
    email: "user2@episteme.org",
    password: "user2",
    roles: [USER_ROLE.USER],
    status: USER_STATUS.ACTIVE,
    institution: "ETH Zurich",
    occupation: "Research Assistant",
    country: "Switzerland",
    linkedinUrl: "https://www.linkedin.com/in/bobchen/",
  },
  {
    firstName: "Clara",
    lastName: "Silva",
    phone: "+31612340003",
    email: "user3@episteme.org",
    password: "user3",
    roles: [USER_ROLE.USER],
    status: USER_STATUS.ACTIVE,
    institution: "University of Lisbon",
    occupation: "Postdoctoral Researcher",
    country: "Portugal",
    linkedinUrl: "https://www.linkedin.com/in/clarasilva/",
  },
  {
    firstName: "David",
    lastName: "Okafor",
    phone: "+31612340004",
    email: "reviewer1@episteme.org",
    password: "reviewer1",
    roles: [USER_ROLE.REVIEWER],
    status: USER_STATUS.ACTIVE,
    institution: "University of Oxford",
    occupation: "Associate Professor",
    country: "United Kingdom",
    linkedinUrl: "https://www.linkedin.com/in/davidokafor/",
  },
  {
    firstName: "Elena",
    lastName: "Petrova",
    phone: "+31612340005",
    email: "reviewer2@episteme.org",
    password: "reviewer2",
    roles: [USER_ROLE.REVIEWER],
    status: USER_STATUS.ACTIVE,
    institution: "Technical University of Munich",
    occupation: "Senior Researcher",
    country: "Germany",
    linkedinUrl: "https://www.linkedin.com/in/elenapetrova/",
  },
  {
    firstName: "Fatih",
    lastName: "Yilmaz",
    phone: "+31612340006",
    email: "reviewer3@episteme.org",
    password: "reviewer3",
    roles: [USER_ROLE.REVIEWER],
    status: USER_STATUS.ACTIVE,
    institution: "Bogazici University",
    occupation: "Professor",
    country: "Turkey",
    linkedinUrl: "https://www.linkedin.com/in/fatihyilmaz/",
  },
  {
    firstName: "Grace",
    lastName: "Kim",
    phone: "+31612340007",
    email: "userreviewer@episteme.org",
    password: "userreviewer",
    roles: [USER_ROLE.USER, USER_ROLE.REVIEWER],
    status: USER_STATUS.ACTIVE,
    institution: "KAIST",
    occupation: "Assistant Professor",
    country: "South Korea",
    linkedinUrl: "https://www.linkedin.com/in/gracekim/",
  },
];

const conferenceSeedData = [
  {
    title: "Episteme Systems Engineering Summit 2026",
    slug: "episteme-systems-engineering-summit-2026",
    startAt: "2026-06-10",
    endAt: "2026-06-13",
    submissionPeriodStartAt: "2026-01-10",
    submissionPeriodEndAt: "2026-04-20",
    status: CONFERENCE_STATUS.ACTIVE,
    metadataFileName: "CONFERENCE_1.json",
  },
  {
    title: "Episteme Event-Driven Architecture Forum 2026",
    slug: "episteme-event-driven-architecture-forum-2026",
    startAt: "2026-07-22",
    endAt: "2026-07-24",
    submissionPeriodStartAt: "2026-01-20",
    submissionPeriodEndAt: "2026-05-05",
    status: CONFERENCE_STATUS.ACTIVE,
    metadataFileName: "CONFERENCE_2.json",
  },
  {
    title: "Episteme Secure Platforms Congress 2026",
    slug: "episteme-secure-platforms-congress-2026",
    startAt: "2025-10-08",
    endAt: "2025-10-11",
    submissionPeriodStartAt: "2025-06-10",
    submissionPeriodEndAt: "2025-08-01",
    status: CONFERENCE_STATUS.FINISHED,
    metadataFileName: "CONFERENCE_3.json",
  },
];

const announcementSeedData = [
  {
    title: "MVP Release and Roadmap Update",
    status: ANNOUNCEMENT_STATUS.ONGOING,
    metadataFileName: "ANNOUNCEMENT_1.json",
  },
  {
    title: "Workflow Validation and Reliability Update",
    status: ANNOUNCEMENT_STATUS.ONGOING,
    metadataFileName: "ANNOUNCEMENT_2.json",
  },
  {
    title: "Reviewer Early Access Program",
    status: ANNOUNCEMENT_STATUS.UPCOMING,
    metadataFileName: "ANNOUNCEMENT_3.json",
  },
];

const blogSeedData = [
  {
    title: "Designing Status-Driven Workflows That Scale",
    status: BLOG_STATUS.PUBLISHED,
    metadataFileName: "BLOG_1.json",
  },
  {
    title: "Date-Time Handling for Distributed Systems",
    status: BLOG_STATUS.PUBLISHED,
    metadataFileName: "BLOG_2.json",
  },
  {
    title: "Query Optimization in Real APIs",
    status: BLOG_STATUS.PUBLISHED,
    metadataFileName: "BLOG_3.json",
  },
];

const activitySeedData = [
  {
    title: "Refactor Night: From Spaghetti to Services",
    status: ACTIVITY_STATUS.PUBLISHED,
    metadataFileName: "ACTIVITY_1.json",
  },
  {
    title: "Systems Design Gym: Shipping a Feature",
    status: ACTIVITY_STATUS.PUBLISHED,
    metadataFileName: "ACTIVITY_2.json",
  },
  {
    title: "Dev Productivity Show & Tell",
    status: ACTIVITY_STATUS.PUBLISHED,
    metadataFileName: "ACTIVITY_3.json",
  },
];

const trainingSeedData = [
  {
    title: "Backend API Fundamentals",
    status: TRAINING_STATUS.ONGOING,
    metadataFileName: "TRAINING_1.json",
  },
  {
    title: "Event-Driven Systems with Kafka",
    status: TRAINING_STATUS.ONGOING,
    metadataFileName: "TRAINING_2.json",
  },
  {
    title: "Observability for Production Services",
    status: TRAINING_STATUS.UPCOMING,
    metadataFileName: "TRAINING_3.json",
  },
];

const metadataHeroImageMap = new Map([
  ["ACTIVITY_1.JSON", "IMG_1.jpg"],
  ["ACTIVITY_2.JSON", "IMG_2.jpg"],
  ["ACTIVITY_3.JSON", "IMG_3.jpg"],
  ["BLOG_1.JSON", "IMG_4.jpg"],
  ["BLOG_2.JSON", "IMG_5.jpg"],
  ["BLOG_3.JSON", "IMG_6.jpg"],
  ["TRAINING_1.JSON", "IMG_7.jpg"],
  ["TRAINING_2.JSON", "IMG_8.jpg"],
  ["TRAINING_3.JSON", "IMG_9.jpg"],
  ["ANNOUNCEMENT_1.JSON", "IMG_10.jpg"],
  ["ANNOUNCEMENT_2.JSON", "IMG_11.jpg"],
  ["ANNOUNCEMENT_3.JSON", "IMG_12.jpg"],
  ["CONFERENCE_1.JSON", "IMG_13.jpg"],
  ["CONFERENCE_2.JSON", "IMG_14.jpg"],
  ["CONFERENCE_3.JSON", "IMG_15.jpg"],
]);

const submissionTemplates = [
  {
    title: "AI-Driven Knowledge Graphs for Open Science",
    abstract: "This paper presents a graph-native framework for integrating heterogeneous scholarly metadata to improve discovery, traceability, and reproducibility in open-science workflows.",
    topics: ["Computer science", "Context (archaeology)"],
    fileKey: "S1",
  },
  {
    title: "Graph-Based Peer Review Systems",
    abstract: "We propose a reviewer-assignment and conflict-detection model based on graph structure, reducing bias and improving expertise matching across interdisciplinary submissions.",
    topics: ["Work (physics)", "Context (archaeology)"],
    fileKey: "S2",
  },
  {
    title: "Observability-Driven Editorial Pipelines",
    abstract: "This work introduces observability metrics and alerting patterns for editorial pipelines, enabling faster issue detection and more reliable submission processing.",
    topics: ["Context (archaeology)", "Work (physics)"],
    fileKey: "S3",
  },
];

const userSubmissionData = {
  user1: [
    { templateIdx: 0, conferenceIdx: 0, titleSuffix: " — Delft Perspective" },
    { templateIdx: 1, conferenceIdx: 1, titleSuffix: " — Delft Perspective" },
    { templateIdx: 2, conferenceIdx: 0, titleSuffix: " — Delft Perspective" },
  ],
  user2: [
    { templateIdx: 0, conferenceIdx: 1, titleSuffix: " — ETH Perspective" },
    { templateIdx: 1, conferenceIdx: 0, titleSuffix: " — ETH Perspective" },
    { templateIdx: 2, conferenceIdx: 0, titleSuffix: " — ETH Perspective" },
  ],
  user3: [
    { templateIdx: 0, conferenceIdx: 1, titleSuffix: " — Lisbon Perspective" },
    { templateIdx: 1, conferenceIdx: 0, titleSuffix: " — Lisbon Perspective" },
    { templateIdx: 2, conferenceIdx: 1, titleSuffix: " — Lisbon Perspective" },
  ],
  userreviewer: [
    { templateIdx: 0, conferenceIdx: 0, titleSuffix: " — KAIST Perspective" },
    { templateIdx: 1, conferenceIdx: 1, titleSuffix: " — KAIST Perspective" },
    { templateIdx: 2, conferenceIdx: 1, titleSuffix: " — KAIST Perspective" },
  ],
};

const messageTemplatesBySubmission = [
  [
    {
      senderKey: "owner",
      senderUsrType: USER_ROLE.USER,
      visibilityScope: CONTENT_SUBMISSION_MSG_VISIBILITY_SCOPE.USER_ADMIN,
      message: "I have submitted my paper. Please let me know if you need any clarifications on the methodology section.",
    },
    {
      senderKey: "admin",
      senderUsrType: USER_ROLE.ADMIN,
      receiverKey: "owner",
      visibilityScope: CONTENT_SUBMISSION_MSG_VISIBILITY_SCOPE.USER_ADMIN,
      message: "Thank you for your submission. We have received it and will begin the review process shortly.",
    },
    {
      senderKey: "owner",
      senderUsrType: USER_ROLE.USER,
      visibilityScope: CONTENT_SUBMISSION_MSG_VISIBILITY_SCOPE.USER_ADMIN,
      message: "Could you provide an estimated timeline for the review? I have a conference deadline approaching.",
    },
    {
      senderKey: "admin",
      senderUsrType: USER_ROLE.ADMIN,
      receiverKey: "owner",
      visibilityScope: CONTENT_SUBMISSION_MSG_VISIBILITY_SCOPE.USER_ADMIN,
      message: "Reviewers have been assigned. You can expect feedback within 2-3 weeks.",
    },
  ],
  [
    {
      senderKey: "owner",
      senderUsrType: USER_ROLE.USER,
      visibilityScope: CONTENT_SUBMISSION_MSG_VISIBILITY_SCOPE.USER_ADMIN,
      message: "Paper submitted. I have included supplementary material as appendices within the document.",
    },
    {
      senderKey: "admin",
      senderUsrType: USER_ROLE.ADMIN,
      receiverKey: "owner",
      visibilityScope: CONTENT_SUBMISSION_MSG_VISIBILITY_SCOPE.USER_ADMIN,
      message: "Submission received. We noticed the document is quite long — please confirm the appendices are essential.",
    },
    {
      senderKey: "owner",
      senderUsrType: USER_ROLE.USER,
      visibilityScope: CONTENT_SUBMISSION_MSG_VISIBILITY_SCOPE.USER_ADMIN,
      message: "Yes, the appendices contain proofs and benchmark data that support the core claims. They are necessary for a thorough review.",
    },
  ],
  [
    {
      senderKey: "owner",
      senderUsrType: USER_ROLE.USER,
      visibilityScope: CONTENT_SUBMISSION_MSG_VISIBILITY_SCOPE.USER_ADMIN,
      message: "Submitted my paper on editorial pipelines. Happy to provide additional experiment logs if needed.",
    },
    {
      senderKey: "admin",
      senderUsrType: USER_ROLE.ADMIN,
      receiverKey: "owner",
      visibilityScope: CONTENT_SUBMISSION_MSG_VISIBILITY_SCOPE.USER_ADMIN,
      message: "Thank you. Your submission is now in the review queue.",
    },
    {
      senderKey: "owner",
      senderUsrType: USER_ROLE.USER,
      visibilityScope: CONTENT_SUBMISSION_MSG_VISIBILITY_SCOPE.USER_ADMIN,
      message: "Just wanted to follow up — any update on whether reviewers have been assigned?",
    },
    {
      senderKey: "admin",
      senderUsrType: USER_ROLE.ADMIN,
      receiverKey: "owner",
      visibilityScope: CONTENT_SUBMISSION_MSG_VISIBILITY_SCOPE.USER_ADMIN,
      message: "Yes, reviewers are assigned and evaluating your paper. We will update you once reviews are complete.",
    },
  ],
];

async function destroyData() {
  try {
    await sequelize.query(`
      TRUNCATE TABLE
        episteme.idempotency_key,
        episteme.notification,
        episteme.content_review,
        episteme.content_review_assignment,
        episteme.content_submission_payment,
        episteme.content_submission_message,
        episteme.content_submission_version,
        episteme.content_submission,
        episteme.activity,
        episteme.blog,
        episteme.training,
        episteme.announcement,
        episteme.conference,
        episteme.file,
        episteme."user"
      RESTART IDENTITY CASCADE;
    `);
    await sequelize.query(`ALTER SEQUENCE episteme.content_submission_form_id_seq RESTART WITH 1;`);

    if (path.resolve(storageAbsRoot) === path.resolve(projectRoot)) {
      throw new Error("Refusing to delete storage: resolved storage path points to project root.");
    }

    await fs.rm(storageAbsRoot, { recursive: true, force: true });

    console.log("Data Destroyed".green.inverse);
    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error(err);
    await sequelize.close();
    process.exit(1);
  }
}

async function walkFiles(dirPath) {
  const out = [];
  const stack = [dirPath];

  while (stack.length > 0) {
    const current = stack.pop();
    const entries = await fs.readdir(current, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (entry.isFile()) {
        out.push(fullPath);
      }
    }
  }

  return out.sort((a, b) => a.localeCompare(b));
}

function getMimeType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  const mimeMap = {
    ".json": "application/json",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".pdf": "application/pdf",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };

  return mimeMap[ext] || "application/octet-stream";
}

function getBucketAndVisibility(filePath) {
  const rel = path.relative(seederDataDir, filePath).replace(/\\/g, "/");
  const [bucket] = rel.split("/");
  if (!ALLOWED_BUCKETS.has(bucket)) {
    throw new Error(`Unsupported bucket directory in seeder data: ${rel}`);
  }

  const visibility = (bucket === "assets" || bucket === "profile_photos") ? "public" : "private";
  return { bucket, visibility };
}

async function saveFileToStorageAndDb({ sourcePath, uploadedBy }) {
  const { bucket, visibility } = getBucketAndVisibility(sourcePath);
  const baseName = path.basename(sourcePath);
  const targetAbsPath = path.join(storageAbsRoot, visibility, bucket, baseName);

  await fs.mkdir(path.dirname(targetAbsPath), { recursive: true });
  let fileBuffer = await fs.readFile(sourcePath);

  if (bucket === "assets" && baseName.toLowerCase().endsWith(".json")) {
    const mappedHeroImage = metadataHeroImageMap.get(baseName.toUpperCase());
    if (mappedHeroImage) {
      const parsed = JSON.parse(fileBuffer.toString("utf8"));
      parsed.heroImagePath = `${normalizedStorageBase}/public/assets/${mappedHeroImage}`;
      fileBuffer = Buffer.from(`${JSON.stringify(parsed, null, 2)}\n`, "utf8");
    }
  }

  await fs.writeFile(targetAbsPath, fileBuffer);

  const relToProject = path.relative(projectRoot, targetAbsPath).replace(/\\/g, "/").replace(/^\/+/, "");
  const storageRelPath = relToProject || `${normalizedStorageBase}/${visibility}/${bucket}/${baseName}`;

  const fileRow = File.build({
    name: baseName,
    storageKey: storageRelPath.replace(/\\/g, "/"),
    size: fileBuffer.length,
    mimeType: getMimeType(baseName),
    uploadedBy,
  });
  fileRow.setFileBuffer(fileBuffer);
  await fileRow.save();

  return fileRow;
}

async function createResourcesWithMetadata({
  Model,
  rows,
  metadataFilesByName,
  metadataFilesById,
  keyName = "metadataFileName",
}) {
  const created = [];
  for (const row of rows) {
    const raw = row[keyName];
    let metadataFile = null;

    if (raw != null && metadataFilesByName) {
      const rawText = String(raw).trim();
      const rawUpper = rawText.toUpperCase();
      const baseUpper = path.basename(rawText).toUpperCase();

      metadataFile = metadataFilesByName.get(rawUpper)
        || metadataFilesByName.get(baseUpper)
        || metadataFilesByName.get(`${baseUpper}.JSON`.replace(".JSON.JSON", ".JSON"));
    }

    if (!metadataFile && raw != null && metadataFilesById && Number.isInteger(Number(raw))) {
      metadataFile = metadataFilesById.get(Number(raw)) || null;
    }

    if (!metadataFile) {
      throw new Error(`Metadata file not uploaded: ${row[keyName]}`);
    }

    const payload = { ...row, metadataFileId: metadataFile.id };
    delete payload[keyName];

    created.push(await Model.create(payload));
  }
  return created;
}

// ---------------------------------------------------------------------------
// Submission bundle creator (PENDING_APPROVAL — no reviews)
// ---------------------------------------------------------------------------

async function createPendingSubmissionBundle({
  ownerUser,
  adminUser,
  reviewerUsers,
  conference,
  title,
  abstract,
  topics,
  fileInitial,
  paymentProviderPaymentId,
  messages,
}) {
  const formId = await generateFormIdForSeed({
    conferenceStartAt: conference.startAt,
    srcPrefix: CONTENT_SUBMISSION_SRC_PREFIX.CONFERENCE,
  });

  // Create submission with PENDING_APPROVAL status
  const submission = await ContentSubmission.create({
    formId,
    ownerUsrId: ownerUser.id,
    title,
    abstract,
    topics,
    conferenceId: conference.id,
    currentStatus: CONTENT_SUBMISSION_STATUS.PENDING_APPROVAL,
    doi: null,
    statusUpdateNotes: null,
  });

  // Create single initial version (v1 by author)
  const v1 = await ContentSubmissionVersion.create({
    contentSubmissionId: submission.id,
    uploaderUsrId: ownerUser.id,
    uploaderUsrType: CONTENT_SUBMISSION_UPLOADER_USER_TYPE.USER,
    changeLog: "Initial submission uploaded by author.",
    fileId: fileInitial.id,
    versionNo: 1,
  });

  submission.currentContentSubmissionVersionId = v1.id;
  await submission.save();

  const assignmentNotes = [
    "Please evaluate methodology rigor and experimental design.",
    "Focus on novelty, clarity of contribution, and related work coverage.",
    "Assess technical soundness, reproducibility, and presentation quality.",
    "Evaluate overall contribution significance and practical applicability.",
    ];

  for (let i = 0; i < reviewerUsers.length; i++) {
    await ContentReviewAssignment.create({
      contentSubmissionId: submission.id,
      reviewerUsrId: reviewerUsers[i].id,
      assignedByUsrId: adminUser.id,
      assignedByNotes: assignmentNotes[i % assignmentNotes.length],
      status: REVIEW_ASSIGNMENT_STATUS.ASSIGNED,
      statusUpdateNotes: null,
    });
  }

  const resolveUser = (key) => {
    if (key === "owner") return ownerUser;
    if (key === "admin") return adminUser;
    if (key === "reviewer") return reviewerUsers[0];
    return null;
  };

  for (const msg of messages) {
    const sender = resolveUser(msg.senderKey);
    const receiver = msg.receiverKey ? resolveUser(msg.receiverKey) : null;

    await ContentSubmissionMessage.create({
      contentSubmissionId: submission.id,
      senderUsrId: sender.id,
      senderUsrType: msg.senderUsrType,
      receiverUsrId: receiver ? receiver.id : null,
      visibilityScope: msg.visibilityScope,
      message: msg.message,
    });
  }

  await ContentSubmissionPayment.create({
    contentSubmissionId: submission.id,
    usrId: ownerUser.id,
    amount: 500.0,
    currency: "EUR",
    provider: "stripe",
    providerPaymentId: paymentProviderPaymentId,
    status: CONTENT_SUBMISSION_PAYMENT_STATUS.CAPTURED,
  });

  return submission;
}

async function generateFormIdForSeed({ conferenceStartAt, srcPrefix }) {
  const startDate = new Date(conferenceStartAt);
  if (Number.isNaN(startDate.getTime())) {
    throw new Error("Invalid conferenceStartAt for formId generation in seed");
  }

  if (!Object.values(CONTENT_SUBMISSION_SRC_PREFIX).includes(srcPrefix)) {
    throw new Error("Invalid ContentSubmission source prefix in seed");
  }

  const month = MONTH_ABBR[startDate.getMonth()];
  const year = startDate.getFullYear();

  const sql = `
    SELECT NEXTVAL('episteme.content_submission_form_id_seq')
  `;

  const [row] = await sequelize.query(sql, {
    type: QueryTypes.SELECT,
  });

  const sequence = Number(row.nextval);
  return `EPI-${srcPrefix}-${month}-${year}-${String(sequence).padStart(3, "0")}`;
}

async function importData() {
  try {
    const admin = await initializeBaseData();

    const createdUsers = await User.bulkCreate(users, {
      individualHooks: true,
      returning: true,
    });

    const userMap = {};
    for (const u of createdUsers) {
      const prefix = u.email.split("@")[0];
      userMap[prefix] = u;
    }

    const user1 = userMap["user1"];
    const user2 = userMap["user2"];
    const user3 = userMap["user3"];
    const reviewer1 = userMap["reviewer1"];
    const reviewer2 = userMap["reviewer2"];
    const reviewer3 = userMap["reviewer3"];
    const userreviewer = userMap["userreviewer"];

    const allSeederFiles = await walkFiles(seederDataDir);
    const uploadedFiles = [];

    for (const filePath of allSeederFiles) {
      const uploadedBy = filePath.includes(`${path.sep}profile_photos${path.sep}`) ? user1.id : admin.id;
      uploadedFiles.push(await saveFileToStorageAndDb({ sourcePath: filePath, uploadedBy }));
    }

    const filesByBaseName = new Map(uploadedFiles.map((f) => [f.name.toUpperCase(), f]));
    const metadataFilesByName = new Map(
      uploadedFiles
        .filter((f) => f.name.toLowerCase().endsWith(".json"))
        .flatMap((f) => {
          const nameUpper = f.name.toUpperCase();
          const keyUpper = String(f.storageKey || "").toUpperCase();
          return [
            [nameUpper, f],
            [keyUpper, f],
          ];
        })
    );
    const metadataFilesById = new Map(
      uploadedFiles
        .filter((f) => f.name.toLowerCase().endsWith(".json"))
        .map((f) => [Number(f.id), f])
    );

    const profilePhoto = filesByBaseName.get("PP_M_TAHSIN_ANWAR_OCT_2025.JPG");
    const cvFile = filesByBaseName.get("CV_M_TAHSIN_ANWAR_OCT_2025.PDF");

    if (profilePhoto) {
      user1.photoFileId = profilePhoto.id;
      reviewer1.photoFileId = profilePhoto.id;
      userreviewer.photoFileId = profilePhoto.id;
    }
    if (cvFile) {
      reviewer1.cvFileId = cvFile.id;
      reviewer2.cvFileId = cvFile.id;
      reviewer3.cvFileId = cvFile.id;
      userreviewer.cvFileId = cvFile.id;
    }
    await user1.save();
    await reviewer1.save();
    await reviewer2.save();
    await reviewer3.save();
    await userreviewer.save();

    const conferences = await createResourcesWithMetadata({
      Model: Conference,
      rows: conferenceSeedData,
      metadataFilesByName,
      metadataFilesById,
    });

    await createResourcesWithMetadata({
      Model: Activity,
      rows: activitySeedData,
      metadataFilesByName,
      metadataFilesById,
    });
    await createResourcesWithMetadata({
      Model: Blog,
      rows: blogSeedData,
      metadataFilesByName,
      metadataFilesById,
    });
    await createResourcesWithMetadata({
      Model: Announcement,
      rows: announcementSeedData,
      metadataFilesByName,
      metadataFilesById,
    });
    await createResourcesWithMetadata({
      Model: Training,
      rows: trainingSeedData,
      metadataFilesByName,
      metadataFilesById,
    });

    const submissionFiles = {};
    for (const key of ["S1", "S2", "S3"]) {
      const initial = filesByBaseName.get(`${key}.DOCX`);
      if (!initial) {
        throw new Error(`Missing submission file: ${key}.docx`);
      }
      submissionFiles[key] = initial;
    }

    const allReviewers = [reviewer1, reviewer2, reviewer3, userreviewer];
    const externalReviewers = [reviewer1, reviewer2, reviewer3];

    const submittingUsers = {
      user1: { user: user1, reviewers: allReviewers },
      user2: { user: user2, reviewers: allReviewers },
      user3: { user: user3, reviewers: allReviewers },
      userreviewer: { user: userreviewer, reviewers: externalReviewers },
    };

    let submissionCounter = 0;
    for (const [userKey, config] of Object.entries(submittingUsers)) {
      const subData = userSubmissionData[userKey];

      for (let i = 0; i < subData.length; i++) {
        submissionCounter++;
        const { templateIdx, conferenceIdx, titleSuffix } = subData[i];
        const template = submissionTemplates[templateIdx];

        await createPendingSubmissionBundle({
          ownerUser: config.user,
          adminUser: admin,
          reviewerUsers: config.reviewers,
          conference: conferences[conferenceIdx],
          title: `${template.title}${titleSuffix}`,
          abstract: `${template.abstract} ${titleSuffix.replace(/^ â€” /, "")}.`,
          topics: template.topics,
          fileInitial: submissionFiles[template.fileKey],
          paymentProviderPaymentId: `pi_seed_${userKey}_s${i + 1}_pending`,
          messages: messageTemplatesBySubmission[templateIdx],
        });
      }
    }

    const submissionRows = await ContentSubmission.findAll({
      attributes: ["id", "title"],
    });

    function normalizeTitleKey(value) {
      return String(value ?? "")
        .normalize("NFKC")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim()
        .replace(/\s+/g, " ");
    }

    const submissionIdByTitle = new Map(
      submissionRows.map((submission) => [normalizeTitleKey(submission.title), Number(submission.id)])
    );

    function extractSubmissionTitle(message) {
      const match = String(message).match(/"([^"]+)"/);
      return match ? match[1] : null;
    }

    function resolveSubmissionId(submissionTitle) {
      const normalizedTitle = normalizeTitleKey(submissionTitle);
      const directId = submissionIdByTitle.get(normalizedTitle);

      if (directId) {
        return directId;
      }

      for (const [key, id] of submissionIdByTitle.entries()) {
        if (key.includes(normalizedTitle) || normalizedTitle.includes(key)) {
          return id;
        }
      }

      return null;
    }

    const submissionLinkedNotificationTypes = new Set([
      NOTIFICATION_TYPE.SUBMISSION_CREATED_TO_ADMIN,
      NOTIFICATION_TYPE.SUBMISSION_STATUS_UPDATED,
      NOTIFICATION_TYPE.SUBMISSION_MSG_CREATED,
      NOTIFICATION_TYPE.SUBMISSION_VERSION_CREATED,
      NOTIFICATION_TYPE.SUBMISSION_REVIEW_CREATED,
      NOTIFICATION_TYPE.REVIEW_ASSIGNMENT_CREATED,
      NOTIFICATION_TYPE.REVIEW_ASSIGNMENT_STATUS_UPDATED_BY_ADMIN,
      NOTIFICATION_TYPE.REVIEW_ASSIGNMENT_STATUS_UPDATED_BY_REVIEWER,
    ]);

    const notificationSeedData = [
      {
        usrId: user1.id,
        type: NOTIFICATION_TYPE.SUBMISSION_STATUS_UPDATED,
        title: "Submission Status Updated",
        message: "Your submission \"AI-Driven Knowledge Graphs for Open Science — Delft Perspective\" status has been updated to Pending Approval.",
        resourceType: "ContentSubmission",
        isRead: false,
      },
      {
        usrId: user1.id,
        type: NOTIFICATION_TYPE.REVIEW_ASSIGNMENT_CREATED,
        title: "Reviewers Assigned",
        message: "Reviewers have been assigned to your submission \"AI-Driven Knowledge Graphs for Open Science — Delft Perspective\".",
        resourceType: "ContentReviewAssignment",
        isRead: false,
      },
      {
        usrId: user1.id,
        type: NOTIFICATION_TYPE.SUBMISSION_MSG_CREATED,
        title: "New Message",
        message: "You have a new message regarding your submission \"Graph-Based Peer Review Systems — Delft Perspective\".",
        resourceType: "ContentSubmission",
        isRead: false,
      },
      {
        usrId: user2.id,
        type: NOTIFICATION_TYPE.SUBMISSION_STATUS_UPDATED,
        title: "Submission Status Updated",
        message: "Your submission \"AI-Driven Knowledge Graphs for Open Science — ETH Perspective\" status has been updated to Pending Approval.",
        resourceType: "ContentSubmission",
        isRead: false,
      },
      {
        usrId: user2.id,
        type: NOTIFICATION_TYPE.SUBMISSION_MSG_CREATED,
        title: "New Message",
        message: "You have a new message regarding your submission \"Graph-Based Peer Review Systems — ETH Perspective\".",
        resourceType: "ContentSubmission",
        isRead: false,
      },
      {
        usrId: user3.id,
        type: NOTIFICATION_TYPE.SUBMISSION_STATUS_UPDATED,
        title: "Submission Status Updated",
        message: "Your submission \"AI-Driven Knowledge Graphs for Open Science — Lisbon Perspective\" status has been updated to Pending Approval.",
        resourceType: "ContentSubmission",
        isRead: false,
      },
      {
        usrId: reviewer1.id,
        type: NOTIFICATION_TYPE.REVIEW_ASSIGNMENT_CREATED,
        title: "New Review Assignment",
        message: "You have been assigned to review \"AI-Driven Knowledge Graphs for Open Science — Delft Perspective\".",
        resourceType: "ContentReviewAssignment",
        isRead: false,
      },
      {
        usrId: reviewer1.id,
        type: NOTIFICATION_TYPE.REVIEW_ASSIGNMENT_CREATED,
        title: "New Review Assignment",
        message: "You have been assigned to review \"Graph-Based Peer Review Systems — ETH Perspective\".",
        resourceType: "ContentReviewAssignment",
        isRead: false,
      },
      {
        usrId: reviewer2.id,
        type: NOTIFICATION_TYPE.REVIEW_ASSIGNMENT_CREATED,
        title: "New Review Assignment",
        message: "You have been assigned to review \"Observability-Driven Editorial Pipelines — Delft Perspective\".",
        resourceType: "ContentReviewAssignment",
        isRead: false,
      },
      {
        usrId: admin.id,
        type: NOTIFICATION_TYPE.SUBMISSION_CREATED_TO_ADMIN,
        title: "New Submission Received",
        message: "A new submission \"AI-Driven Knowledge Graphs for Open Science — Delft Perspective\" has been submitted by Alice Morgan.",
        resourceType: "ContentSubmission",
        isRead: false,
      },
      {
        usrId: admin.id,
        type: NOTIFICATION_TYPE.SUBMISSION_CREATED_TO_ADMIN,
        title: "New Submission Received",
        message: "A new submission \"Graph-Based Peer Review Systems — ETH Perspective\" has been submitted by Bob Chen.",
        resourceType: "ContentSubmission",
        isRead: false,
      },
      {
        usrId: admin.id,
        type: NOTIFICATION_TYPE.REVIEW_ASSIGNMENT_STATUS_UPDATED_BY_REVIEWER,
        title: "Review Assignment Updated",
        message: "Reviewer David Okafor has updated their assignment status for \"AI-Driven Knowledge Graphs for Open Science — Delft Perspective\".",
        resourceType: "ContentReviewAssignment",
        isRead: false,
      },
      {
        usrId: admin.id,
        type: NOTIFICATION_TYPE.SUBMISSION_CREATED_TO_ADMIN,
        title: "New Submission Received",
        message: "A new submission \"Observability-Driven Editorial Pipelines — Delft Perspective\" has been submitted by Alice Morgan.",
        resourceType: "ContentSubmission",
        isRead: false,
      },
      {
        usrId: admin.id,
        type: NOTIFICATION_TYPE.SUBMISSION_CREATED_TO_ADMIN,
        title: "New Submission Received",
        message: "A new submission \"Observability-Driven Editorial Pipelines — ETH Perspective\" has been submitted by Bob Chen.",
        resourceType: "ContentSubmission",
        isRead: false,
      },
      {
        usrId: admin.id,
        type: NOTIFICATION_TYPE.SUBMISSION_CREATED_TO_ADMIN,
        title: "New Submission Received",
        message: "A new submission \"Graph-Based Peer Review Systems — Lisbon Perspective\" has been submitted by Clara Silva.",
        resourceType: "ContentSubmission",
        isRead: false,
      },
      {
        usrId: admin.id,
        type: NOTIFICATION_TYPE.SUBMISSION_MSG_CREATED,
        title: "New Submission Message",
        message: "Alice Morgan sent a new message for \"AI-Driven Knowledge Graphs for Open Science — Delft Perspective\".",
        resourceType: "ContentSubmission",
        isRead: false,
      },
      {
        usrId: admin.id,
        type: NOTIFICATION_TYPE.SUBMISSION_MSG_CREATED,
        title: "New Submission Message",
        message: "Bob Chen sent a new message for \"Graph-Based Peer Review Systems — ETH Perspective\".",
        resourceType: "ContentSubmission",
        isRead: false,
      },
      {
        usrId: admin.id,
        type: NOTIFICATION_TYPE.SUBMISSION_VERSION_CREATED,
        title: "Submission Version Uploaded",
        message: "A revised version was uploaded for \"Observability-Driven Editorial Pipelines — Delft Perspective\".",
        resourceType: "ContentSubmission",
        isRead: false,
      },
      {
        usrId: admin.id,
        type: NOTIFICATION_TYPE.SUBMISSION_REVIEW_CREATED,
        title: "New Review Submitted",
        message: "A new review has been submitted for \"AI-Driven Knowledge Graphs for Open Science — ETH Perspective\".",
        resourceType: "ContentSubmissionReview",
        isRead: false,
      },
      {
        usrId: admin.id,
        type: NOTIFICATION_TYPE.SUBMISSION_REVIEW_CREATED,
        title: "New Review Submitted",
        message: "A new review has been submitted for \"Graph-Based Peer Review Systems — Delft Perspective\".",
        resourceType: "ContentSubmissionReview",
        isRead: false,
      },
      {
        usrId: admin.id,
        type: NOTIFICATION_TYPE.REVIEW_ASSIGNMENT_CREATED,
        title: "Review Assignment Created",
        message: "A new reviewer assignment has been created for \"Observability-Driven Editorial Pipelines — ETH Perspective\".",
        resourceType: "ContentReviewAssignment",
        isRead: false,
      },
      {
        usrId: admin.id,
        type: NOTIFICATION_TYPE.REVIEW_ASSIGNMENT_STATUS_UPDATED_BY_REVIEWER,
        title: "Review Assignment Updated",
        message: "Reviewer Elena Petrova has updated their assignment status for \"Graph-Based Peer Review Systems — Lisbon Perspective\".",
        resourceType: "ContentReviewAssignment",
        isRead: false,
      },
      {
        usrId: admin.id,
        type: NOTIFICATION_TYPE.REVIEW_ASSIGNMENT_STATUS_UPDATED_BY_REVIEWER,
        title: "Review Assignment Updated",
        message: "Reviewer Fatih Yilmaz has updated their assignment status for \"Observability-Driven Editorial Pipelines — ETH Perspective\".",
        resourceType: "ContentReviewAssignment",
        isRead: false,
      },
      {
        usrId: admin.id,
        type: NOTIFICATION_TYPE.SUBMISSION_STATUS_UPDATED,
        title: "Submission Status Updated",
        message: "Submission \"AI-Driven Knowledge Graphs for Open Science — Lisbon Perspective\" status has been updated to Under Review.",
        resourceType: "ContentSubmission",
        isRead: false,
      },
    ];

    const normalizedNotificationSeedData = notificationSeedData.map((entry) => {
      if (!submissionLinkedNotificationTypes.has(entry.type)) {
        return entry;
      }

      const submissionTitle = extractSubmissionTitle(entry.message);
      const submissionId = submissionTitle ? resolveSubmissionId(submissionTitle) : null;

      if (!submissionId) {
        throw new Error(`Unable to resolve submissionId for notification: ${entry.type} | ${entry.message}`);
      }

      return {
        ...entry,
        resourceType: "ContentSubmission",
        resourceId: submissionId,
      };
    });

    await Notification.bulkCreate(normalizedNotificationSeedData, { individualHooks: true });

    console.log(`Data Imported (${createdUsers.length + 1} users, ${submissionCounter} submissions, ${normalizedNotificationSeedData.length} notifications)`.green.inverse);
    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error(err);
    await sequelize.close();
    process.exit(1);
  }
}

const isDirectExecution =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);

if (isDirectExecution) {
  if (process.argv[2] === "-d") {
    await destroyData();
  } else {
    await importData();
  }
}

