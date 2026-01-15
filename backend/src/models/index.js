import { DataTypes } from "sequelize";

import UserModel from "./User.js";
import ConferenceModel from "./Conference.js";
import AnnouncementModel from "./Announcement.js";
import TrainingModel from "./Training.js";
import ActivityModel from "./Activity.js";
import BlogModel from "./Blog.js";
import FileModel from "./File.js";
import ContentSubmissionModel from "./ContentSubmission.js";
import ContentSubmissionVersionModel from "./ContentSubmissionVersion.js";
import ContentSubmissionMessageModel from "./ContentSubmissionMessage.js";
import ContentReviewAssignmentModel from "./ContentReviewAssignment.js";
import ContentReviewModel from "./ContentReview.js";
import ContentSubmissionPaymentModel from "./ContentSubmissionPayment.js";

export const initModels = (sequelize) => {
  const User = UserModel(sequelize, DataTypes);
  const Conference = ConferenceModel(sequelize, DataTypes);
  const Activity = ActivityModel(sequelize, DataTypes);
  const Announcement = AnnouncementModel(sequelize, DataTypes);
  const Blog = BlogModel(sequelize, DataTypes);
  const Training = TrainingModel(sequelize, DataTypes);
  const File = FileModel(sequelize, DataTypes);
  const ContentSubmission = ContentSubmissionModel(sequelize, DataTypes);
  const ContentSubmissionVersion = ContentSubmissionVersionModel(sequelize, DataTypes);
  const ContentSubmissionMessage = ContentSubmissionMessageModel(sequelize, DataTypes);
  const ContentReviewAssignment = ContentReviewAssignmentModel(sequelize, DataTypes);
  const ContentReview = ContentReviewModel(sequelize, DataTypes);
  const ContentSubmissionPayment = ContentSubmissionPaymentModel(sequelize, DataTypes);

  User.belongsTo(File, { foreignKey: "cvFileId", as: "cvFile" });
  User.belongsTo(File, { foreignKey: "photoFileId", as: "photoFile" });

  Conference.belongsTo(File, { foreignKey: "metadataFileId", as: "metadataFile" });
  Activity.belongsTo(File, { foreignKey: "metadataFileId", as: "metadataFile" });
  Announcement.belongsTo(File, { foreignKey: "metadataFileId", as: "metadataFile" });
  Blog.belongsTo(File, { foreignKey: "metadataFileId", as: "metadataFile" });
  Training.belongsTo(File, { foreignKey: "metadataFileId", as: "metadataFile" });

  User.hasMany(File, { foreignKey: "uploadedBy", as: "uploadedFiles" });
  File.belongsTo(User, { foreignKey: "uploadedBy", as: "uploader" });

  User.hasMany(ContentSubmission, { foreignKey: "ownerUsrId", as: "contentSubmissions" });
  ContentSubmission.belongsTo(User, { foreignKey: "ownerUsrId", as: "owner" });

  Conference.hasMany(ContentSubmission, { foreignKey: "conferenceId", as: "contentSubmissions" });
  ContentSubmission.belongsTo(Conference, { foreignKey: "conferenceId", as: "conference" });

  ContentSubmission.hasMany(ContentSubmissionVersion, {
    foreignKey: "contentSubmissionId",
    as: "versions",
  });
  ContentSubmissionVersion.belongsTo(ContentSubmission, {
    foreignKey: "contentSubmissionId",
    as: "submission",
  });

  User.hasMany(ContentSubmissionVersion, { foreignKey: "uploaderUsrId", as: "uploadedSubmissionVersions" });
  ContentSubmissionVersion.belongsTo(User, { foreignKey: "uploaderUsrId", as: "uploaderUser" });

  File.hasMany(ContentSubmissionVersion, { foreignKey: "fileId", as: "submissionVersions" });
  ContentSubmissionVersion.belongsTo(File, { foreignKey: "fileId", as: "file" });

  ContentSubmission.belongsTo(ContentSubmissionVersion, {
    foreignKey: "currentContentSubmissionVersionId",
    as: "currentVersion",
    constraints: false,
  });

  ContentSubmission.hasMany(ContentSubmissionMessage, {
    foreignKey: "contentSubmissionId",
    as: "messages",
  });
  ContentSubmissionMessage.belongsTo(ContentSubmission, {
    foreignKey: "contentSubmissionId",
    as: "submission",
  });

  User.hasMany(ContentSubmissionMessage, {
    foreignKey: "senderUsrId",
    as: "sentSubmissionMessages",
  });
  ContentSubmissionMessage.belongsTo(User, {
    foreignKey: "senderUsrId",
    as: "sender",
  });

  User.hasMany(ContentSubmissionMessage, {
    foreignKey: "receiverUsrId",
    as: "receivedSubmissionMessages",
  });
  ContentSubmissionMessage.belongsTo(User, {
    foreignKey: "receiverUsrId",
    as: "receiver",
  });

  ContentSubmission.hasMany(ContentReviewAssignment, {
    foreignKey: "contentSubmissionId",
    as: "reviewAssignments",
  });
  ContentReviewAssignment.belongsTo(ContentSubmission, {
    foreignKey: "contentSubmissionId",
    as: "submission",
  });

  User.hasMany(ContentReviewAssignment, { foreignKey: "reviewerUsrId", as: "reviewAssignments" });
  ContentReviewAssignment.belongsTo(User, { foreignKey: "reviewerUsrId", as: "reviewer" });

  User.hasMany(ContentReviewAssignment, { foreignKey: "assignedByUsrId", as: "assignedReviews" });
  ContentReviewAssignment.belongsTo(User, { foreignKey: "assignedByUsrId", as: "assignedBy" });

  ContentReviewAssignment.hasMany(ContentReview, {
    foreignKey: "contentReviewAssignmentId",
    as: "reviews",
  });
  ContentReview.belongsTo(ContentReviewAssignment, {
    foreignKey: "contentReviewAssignmentId",
    as: "assignment",
  });

  ContentSubmissionVersion.hasMany(ContentReview, {
    foreignKey: "contentSubmissionVersionId",
    as: "reviewsAsReviewedVersion",
  });
  ContentReview.belongsTo(ContentSubmissionVersion, {
    foreignKey: "contentSubmissionVersionId",
    as: "reviewedVersion",
  });

  ContentSubmissionVersion.hasMany(ContentReview, {
    foreignKey: "reviewerContentSubmissionVersionId",
    as: "reviewsAsReviewerUploadVersion",
  });
  ContentReview.belongsTo(ContentSubmissionVersion, {
    foreignKey: "reviewerContentSubmissionVersionId",
    as: "reviewerUploadVersion",
  });

  ContentSubmission.hasMany(ContentSubmissionPayment, {
    foreignKey: "contentSubmissionId",
    as: "payments",
  });
  ContentSubmissionPayment.belongsTo(ContentSubmission, {
    foreignKey: "contentSubmissionId",
    as: "submission",
  });

  User.hasMany(ContentSubmissionPayment, { foreignKey: "usrId", as: "payments" });
  ContentSubmissionPayment.belongsTo(User, { foreignKey: "usrId", as: "user" });

  return {
    User,
    Conference,
    File,
    ContentSubmission,
    ContentSubmissionVersion,
    ContentSubmissionMessage,
    ContentReviewAssignment,
    ContentReview,
    ContentSubmissionPayment,
    Activity,
    Announcement,
    Training,
    Blog,
  };
};
