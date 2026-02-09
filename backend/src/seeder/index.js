import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import colors from "colors";
import { sequelize, connectDb } from "../config/db.js";
import { initModels } from "../models/index.js";
import {
  ACTIVITY_STATUS,
  ANNOUNCEMENT_STATUS,
  BLOG_STATUS,
  CONFERENCE_STATUS,
  CONTENT_SUBMISSION_MSG_VISIBILITY_SCOPE,
  CONTENT_SUBMISSION_PAYMENT_STATUS,
  CONTENT_SUBMISSION_STATUS,
  CONTENT_SUBMISSION_UPLOADER_USER_TYPE,
  REVIEW_ASSIGNMENT_STATUS,
  REVIEW_RECOMMENDATION,
  USER_ROLE,
  USER_STATUS,
  TRAINING_STATUS,
} from "../utils/constants.js";

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
  ContentReview,
  ContentSubmissionPayment,
  Training,
  Announcement,
  Blog,
  Activity,
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

export async function createAdminUser() {
  const existing = await User.findOne({ where: { email: ADMIN_USER_SEED.email } });
  
  if (!existing) {
    const [created] = await User.bulkCreate([ADMIN_USER_SEED], {
      individualHooks: true,
      returning: true,
    });
    return created;
  }

  return existing;
}

const users = [
  {
    firstName: "Regular",
    lastName: "User",
    phone: "+8801710912970",
    email: "user@episteme.org",
    password: "user",
    roles: [USER_ROLE.USER],
    status: USER_STATUS.ACTIVE,
    institution: "Episteme University",
    occupation: "Graduate Student",
    country: "Netherlands",
    linkedinUrl: "https://www.linkedin.com/in/user/",
  },
  {
    firstName: "Reviewer",
    lastName: "User",
    phone: "01710912970",
    email: "reviewer@episteme.org",
    password: "reviewer",
    roles: [USER_ROLE.REVIEWER, USER_ROLE.USER],
    status: USER_STATUS.ACTIVE,
    institution: "Episteme University",
    occupation: "Researcher",
    country: "Netherlands",
    linkedinUrl: "https://www.linkedin.com/in/reviewer/",
  },
];

const conferenceSeedData = [
  {
    title: "Episteme Systems Engineering Summit 2026",
    slug: "episteme-systems-engineering-summit-2026",
    startAt: "2026-06-10",
    endAt: "2026-06-13",
    submissionPeriodStartAt: "2026-03-01",
    submissionPeriodEndAt: "2026-04-20",
    status: CONFERENCE_STATUS.ACTIVE,
    metadataFileName: "CONFERENCE_1.json",
  },
  {
    title: "Episteme Event-Driven Architecture Forum 2026",
    slug: "episteme-event-driven-architecture-forum-2026",
    startAt: "2026-07-22",
    endAt: "2026-07-24",
    submissionPeriodStartAt: "2026-03-15",
    submissionPeriodEndAt: "2026-05-05",
    status: CONFERENCE_STATUS.ACTIVE,
    metadataFileName: "CONFERENCE_2.json",
  },
  {
    title: "Episteme Secure Platforms Congress 2026",
    slug: "episteme-secure-platforms-congress-2026",
    startAt: "2026-09-08",
    endAt: "2026-09-11",
    submissionPeriodStartAt: "2026-04-10",
    submissionPeriodEndAt: "2026-06-01",
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

async function destroyData() {
  try {
    await sequelize.query(`
      TRUNCATE TABLE
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

  // Keep storageKey aligned with upload API behavior (multer req.file.path style).
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

async function createSubmissionBundle({
  ownerUser,
  adminUser,
  reviewerUser,
  conference,
  title,
  topics,
  currentStatus,
  doi,
  statusUpdateNotes,
  paymentProviderPaymentId,
  fileInitial,
  fileAdminEdited,
  fileReviewer,
  versionNoStart = 1,
  reviewRecommendation,
  reviewComment,
  reviewerMessage,
}) {
  const submission = await ContentSubmission.create({
    ownerUsrId: ownerUser.id,
    title,
    topics,
    conferenceId: conference.id,
    currentStatus,
    doi: doi ?? null,
    statusUpdateNotes: statusUpdateNotes ?? null,
  });

  const v1 = await ContentSubmissionVersion.create({
    contentSubmissionId: submission.id,
    uploaderUsrId: ownerUser.id,
    uploaderUsrType: CONTENT_SUBMISSION_UPLOADER_USER_TYPE.USER,
    changeLog: "Initial submission uploaded by author.",
    fileId: fileInitial.id,
    versionNo: versionNoStart,
  });

  const v2 = await ContentSubmissionVersion.create({
    contentSubmissionId: submission.id,
    uploaderUsrId: adminUser.id,
    uploaderUsrType: CONTENT_SUBMISSION_UPLOADER_USER_TYPE.ADMIN,
    changeLog: "Editorial cleanup and structure adjustments.",
    fileId: fileAdminEdited.id,
    versionNo: versionNoStart + 1,
  });

  const reviewerVersion = await ContentSubmissionVersion.create({
    contentSubmissionId: submission.id,
    uploaderUsrId: reviewerUser.id,
    uploaderUsrType: CONTENT_SUBMISSION_UPLOADER_USER_TYPE.REVIEWER,
    changeLog: "Reviewer annotated version with inline comments.",
    fileId: fileReviewer.id,
    versionNo: versionNoStart + 2,
  });

  submission.currentContentSubmissionVersionId = v2.id;
  await submission.save();

  const assignment = await ContentReviewAssignment.create({
    contentSubmissionId: submission.id,
    reviewerUsrId: reviewerUser.id,
    assignedByUsrId: adminUser.id,
    assignedByNotes: "Please focus on methodology and evaluation rigor.",
    status: REVIEW_ASSIGNMENT_STATUS.COMPLETED,
    statusUpdateNotes: "Review completed with actionable feedback.",
  });

  await ContentSubmissionMessage.create({
    contentSubmissionId: submission.id,
    senderUsrId: ownerUser.id,
    senderUsrType: USER_ROLE.USER,
    visibilityScope: CONTENT_SUBMISSION_MSG_VISIBILITY_SCOPE.USER_ADMIN,
    message: "Please let me know if any additional clarifications are needed.",
  });

  await ContentSubmissionMessage.create({
    contentSubmissionId: submission.id,
    senderUsrId: adminUser.id,
    senderUsrType: USER_ROLE.ADMIN,
    receiverUsrId: reviewerUser.id,
    visibilityScope: CONTENT_SUBMISSION_MSG_VISIBILITY_SCOPE.ADMIN_REVIEWER,
    message: "Reviewer assignment created. Kindly submit findings by end of week.",
  });

  await ContentSubmissionMessage.create({
    contentSubmissionId: submission.id,
    senderUsrId: reviewerUser.id,
    senderUsrType: USER_ROLE.REVIEWER,
    receiverUsrId: adminUser.id,
    visibilityScope: CONTENT_SUBMISSION_MSG_VISIBILITY_SCOPE.ADMIN_REVIEWER,
    message: reviewerMessage,
  });

  await ContentReview.create({
    contentReviewAssignmentId: assignment.id,
    contentSubmissionVersionId: v2.id,
    reviewerContentSubmissionVersionId: reviewerVersion.id,
    comment: reviewComment,
    recommendation: reviewRecommendation,
  });

  await ContentSubmissionPayment.create({
    contentSubmissionId: submission.id,
    usrId: ownerUser.id,
    amount: 500.0,
    currency: "EUR",
    provider: "stripe",
    providerPaymentId: paymentProviderPaymentId,
    status: CONTENT_SUBMISSION_PAYMENT_STATUS.CAPTURED,
  });

  return {
    submission,
    assignment,
    versions: { v1, v2, reviewerVersion },
  };
}

async function importData() {
  try {
    const admin = await createAdminUser();
    const [user, reviewer] = await User.bulkCreate(users, {
      individualHooks: true,
      returning: true,
    });

    const allSeederFiles = await walkFiles(seederDataDir);
    const uploadedFiles = [];

    for (const filePath of allSeederFiles) {
      const uploadedBy = filePath.includes(`${path.sep}profile_photos${path.sep}`) ? user.id : admin.id;
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
      user.photoFileId = profilePhoto.id;
      reviewer.photoFileId = profilePhoto.id;
    }
    if (cvFile) {
      reviewer.cvFileId = cvFile.id;
    }
    await user.save();
    await reviewer.save();

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

    const s1 = {
      initial: filesByBaseName.get("S1.DOCX"),
      adminEdited: filesByBaseName.get("S1_EDITED_EDITOR.DOCX"),
      reviewer: filesByBaseName.get("S1_REVIEWED_R1.DOCX"),
    };
    const s2 = {
      initial: filesByBaseName.get("S2.DOCX"),
      adminEdited: filesByBaseName.get("S2_EDITED_EDITOR.DOCX"),
      reviewer: filesByBaseName.get("S2_REVIEWED_R2.DOCX"),
    };
    const s3 = {
      initial: filesByBaseName.get("S3.DOCX"),
      adminEdited: filesByBaseName.get("S3_EDITED_EDITOR.DOCX"),
      reviewer: filesByBaseName.get("S3_REVIEWED_R3.DOCX"),
    };

    if (!s1.initial || !s1.adminEdited || !s1.reviewer) {
      throw new Error("Missing one or more S1 submission files.");
    }
    if (!s2.initial || !s2.adminEdited || !s2.reviewer) {
      throw new Error("Missing one or more S2 submission files.");
    }
    if (!s3.initial || !s3.adminEdited || !s3.reviewer) {
      throw new Error("Missing one or more S3 submission files.");
    }

    await createSubmissionBundle({
      ownerUser: user,
      adminUser: admin,
      reviewerUser: reviewer,
      conference: conferences[2],
      title: "AI-Driven Knowledge Graphs for Open Science",
      topics: ["AI", "Open Science", "Knowledge Graphs"],
      currentStatus: CONTENT_SUBMISSION_STATUS.APPROVED,
      doi: "10.5555/episteme.2026.001",
      statusUpdateNotes: "Accepted for publication after final review.",
      paymentProviderPaymentId: "pi_seed_s1_captured",
      fileInitial: s1.initial,
      fileAdminEdited: s1.adminEdited,
      fileReviewer: s1.reviewer,
      versionNoStart: 1,
      reviewRecommendation: REVIEW_RECOMMENDATION.ACCEPTED,
      reviewComment: "Strong contribution with clear methodology and reproducible setup.",
      reviewerMessage: "Review submitted. This paper is ready for acceptance.",
    });

    await createSubmissionBundle({
      ownerUser: user,
      adminUser: admin,
      reviewerUser: reviewer,
      conference: conferences[1],
      title: "Graph-Based Peer Review Systems",
      topics: ["Graphs", "Peer Review", "Distributed Systems"],
      currentStatus: CONTENT_SUBMISSION_STATUS.RETURNED,
      doi: null,
      statusUpdateNotes: "Revision requested for experiments and evaluation details.",
      paymentProviderPaymentId: "pi_seed_s2_captured",
      fileInitial: s2.initial,
      fileAdminEdited: s2.adminEdited,
      fileReviewer: s2.reviewer,
      versionNoStart: 1,
      reviewRecommendation: REVIEW_RECOMMENDATION.NEEDS_REVISION,
      reviewComment: "Promising idea. Requires stronger benchmarking and clearer threat analysis.",
      reviewerMessage: "Submitted detailed revision notes and suggestions.",
    });

    await createSubmissionBundle({
      ownerUser: user,
      adminUser: admin,
      reviewerUser: reviewer,
      conference: conferences[2],
      title: "Observability-Driven Editorial Pipelines",
      topics: ["Observability", "Workflow Automation", "Editorial Systems"],
      currentStatus: CONTENT_SUBMISSION_STATUS.REJECTED,
      doi: null,
      statusUpdateNotes: "Rejected due to insufficient empirical evidence.",
      paymentProviderPaymentId: "pi_seed_s3_captured",
      fileInitial: s3.initial,
      fileAdminEdited: s3.adminEdited,
      fileReviewer: s3.reviewer,
      versionNoStart: 1,
      reviewRecommendation: REVIEW_RECOMMENDATION.REJECTED,
      reviewComment: "Interesting framing, but evaluation depth does not meet acceptance bar.",
      reviewerMessage: "Review completed. Recommendation is reject with encouragement to resubmit.",
    });

    console.log("Data Imported".green.inverse);
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
