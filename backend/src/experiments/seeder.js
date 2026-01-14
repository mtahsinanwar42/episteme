import dotenv from "dotenv";
import colors from "colors";
import { sequelize, connectDb } from "../config/db.js";
import { initModels } from "../models/index.js";
import { CONTENT_SUBMISSION_UPLOADER_USER_TYPE, REVIEW_RECOMMENDATION, USER_STATUS } from "../utils/constants.js";

dotenv.config();
await connectDb();

const {
  User,
  Conference,
  File,
  ContentSubmission,
  ContentSubmissionVersion,
  ContentReviewAssignment,
  ContentReview,
  ContentSubmissionPayment,
  Training,
  Announcement,
  Blog,
  Activity,
} = initModels(sequelize);


const users = [
  {
    firstName: "Admin",
    lastName: "User",
    phone: "+31616849000",
    email: "admin@episteme.org",
    password: "admin",
    roles: ["ADMIN"],
    status: USER_STATUS.ACTIVE,
    institution: "Episteme University",
    occupation: "Student",
    country: "Netherlands",
    linkedInUrl: "https://www.linkedin.com/in/admin/",
  },
  {
    firstName: "Regular",
    lastName: "User",
    phone: "+8801710912970",
    email: "author@episteme.org",
    password: "author",
    roles: ["USER"],
    status: USER_STATUS.ACTIVE,
    institution: "Episteme University",
    occupation: "Student",
    country: "Netherlands",
    linkedInUrl: "https://www.linkedin.com/in/user/",
  },
  {
    firstName: "Reviewer",
    lastName: "User",
    phone: "01710912970",
    email: "reviewer@episteme.org",
    password: "reviewer",
    roles: ["REVIEWER", "USER"],
    status: USER_STATUS.ACTIVE,
    institution: "Episteme University",
    occupation: "Researcher",
    country: "Netherlands",
    linkedInUrl: "https://www.linkedin.com/in/reviewer/",
  },
];

const conferenceData = {
  title: "EPISTEME 2026 – Open Science Conference",
  slug: "episteme-2026",
  startAt: "2026-05-10",
  endAt: "2026-05-15",
  submissionPeriodStartAt: "2026-04-15",
  submissionPeriodEndAt: "2026-04-30",
};

const blogData = {
  title: "Welcome to Episteme",
  status: 1,
};

const trainingData = {
  title: "Open Science Basics",
  status: 1,
};

const announcementData = {
  title: "Conference Registration Open",
  status: 1,
};

const activityData = {
  title: "Keynote Speech by Dr. Jane Doe",
  status: 1,
};

async function destroyData() {
  try {
    await ContentReview.destroy({ where: {} });
    await ContentReviewAssignment.destroy({ where: {} });
    await ContentSubmissionPayment.destroy({ where: {} });
    await ContentSubmissionVersion.destroy({ where: {} });
    await ContentSubmission.destroy({ where: {} });
    await File.destroy({ where: {} });
    await Conference.destroy({ where: {} });
    await User.destroy({ where: {} });
    await Blog.destroy({ where: {} });
    await Training.destroy({ where: {} });
    await Announcement.destroy({ where: {} });
    await Activity.destroy({ where: {} });

    console.log("Data Destroyed".green.inverse);
    process.exit();
  } catch (err) {
    console.error(err.red);
    process.exit(1);
  }
}

async function importData() {
  try {
    const [admin, author, reviewer] = await User.bulkCreate(users, {
      individualHooks: true,
      returning: true,
    });
    const conference = await Conference.create(conferenceData);

    await Activity.create(activityData);
    await Blog.create(blogData);
    await Training.create(trainingData);
    await Announcement.create(announcementData);

    const file1 = File.build({
      name: "paper_v1.pdf",
      storageKey: "submissions/paper_v1.pdf",
      size: 120000,
      mimeType: "application/pdf",
      uploadedBy: author.id,
    });
    file1.setFileBuffer(Buffer.from("Paper version 1"));
    await file1.save();

    const file2 = File.build({
      name: "paper_v2.pdf",
      storageKey: "submissions/paper_v2.pdf",
      size: 135000,
      mimeType: "application/pdf",
      uploadedBy: author.id,
    });
    file2.setFileBuffer(Buffer.from("Paper version 2"));
    await file2.save();

    const submission1 = await ContentSubmission.create({
      ownerUsrId: author.id,
      title: "AI-Driven Knowledge Graphs for Open Science",
      topics: ["AI", "Open Science", "Knowledge Graphs"],
      conferenceId: conference.id,
    });

    const v1 = await ContentSubmissionVersion.create({
      contentSubmissionId: submission1.id,
      uploaderUsrId: author.id,
      uploaderUsrType: CONTENT_SUBMISSION_UPLOADER_USER_TYPE.USER,
      uploaderNotes: "Initial submission of the graph paper.",
      fileId: file1.id,
      versionNo: 1,
    });

    const v2 = await ContentSubmissionVersion.create({
      contentSubmissionId: submission1.id,
      uploaderUsrId: author.id,
      uploaderUsrType: CONTENT_SUBMISSION_UPLOADER_USER_TYPE.USER,
      uploaderNotes: "Initial submission of the graph paper.",
      fileId: file2.id,
      versionNo: 2,
    });

    submission1.currentContentSubmissionVersionId = v2.id;
    await submission1.save();

    const assignment1 = await ContentReviewAssignment.create({
      contentSubmissionId: submission1.id,
      reviewerUsrId: reviewer.id,
      assignedByUsrId: admin.id,
    });

    await ContentReview.create({
      contentReviewAssignmentId: assignment1.id,
      contentSubmissionVersionId: v2.id,
      comment: "Strong paper, well-written and relevant.",
      recommendation: 1,
    });

    await ContentSubmissionPayment.create({
      contentSubmissionId: submission1.id,
      usrId: author.id,
      amount: 150.0,
      currency: "EUR",
      provider: "stripe",
      providerPaymentId: "pi_test_123456",
      status: 1,
    });

    const file3 = File.build({
      name: "graph_paper_v1.pdf",
      storageKey: "submissions/graph_paper_v1.pdf",
      size: 98000,
      mimeType: "application/pdf",
      uploadedBy: author.id,
    });
    file3.setFileBuffer(Buffer.from("Graph paper version 1"));
    await file3.save();

    const file4 = File.build({
      name: "graph_paper_v2.pdf",
      storageKey: "submissions/graph_paper_v2.pdf",
      size: 112000,
      mimeType: "application/pdf",
      uploadedBy: author.id,
    });
    file4.setFileBuffer(Buffer.from("Graph paper version 2"));
    await file4.save();

    const submission2 = await ContentSubmission.create({
      ownerUsrId: author.id,
      title: "Graph-Based Peer Review Systems",
      topics: ["Graphs", "Peer Review", "Distributed Systems"],
      conferenceId: conference.id,
    });

    const v1b = await ContentSubmissionVersion.create({
      contentSubmissionId: submission2.id,
      uploaderUsrId: author.id,
      uploaderUsrType: CONTENT_SUBMISSION_UPLOADER_USER_TYPE.USER,
      uploaderNotes: "Initial submission of the graph paper.",
      fileId: file3.id,
      versionNo: 1,
    });

    const v2b = await ContentSubmissionVersion.create({
      contentSubmissionId: submission2.id,
      uploaderUsrId: author.id,
      uploaderUsrType: CONTENT_SUBMISSION_UPLOADER_USER_TYPE.USER,
      uploaderNotes: "2nd submission of the graph paper.",
      fileId: file4.id,
      versionNo: 2,
    });

    submission2.currentContentSubmissionVersionId = v2b.id;
    await submission2.save();

    const assignment2 = await ContentReviewAssignment.create({
      contentSubmissionId: submission2.id,
      reviewerUsrId: reviewer.id,
      assignedByUsrId: admin.id,
      assignedByNotes: "Please focus on the methodology section.",
    });

    await ContentReview.create({
      contentReviewAssignmentId: assignment2.id,
      contentSubmissionVersionId: v2b.id,
      comment: "Interesting concept, but needs stronger experiments.",
      recommendation: REVIEW_RECOMMENDATION.NEEDS_REVISION,
    });

    await ContentSubmissionPayment.create({
      contentSubmissionId: submission2.id,
      usrId: author.id,
      amount: 150.0,
      currency: "EUR",
      provider: "stripe",
      providerPaymentId: "pi_test_654321",
      status: 1,
    });

    console.log("Data Imported".green.inverse);
    process.exit();
  } catch (err) {
    console.error(err.red);
    process.exit(1);
  }
}

if (process.argv[2] === "-d") {
  await destroyData();
} else {
  await importData();
}
