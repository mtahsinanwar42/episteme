import { DataTypes } from "sequelize";

import UserModel from "./User.js";
import ConferenceModel from "./Conference.js";
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
  const File = FileModel(sequelize, DataTypes);
  const ContentSubmission = ContentSubmissionModel(sequelize, DataTypes);
  const ContentSubmissionVersion = ContentSubmissionVersionModel(sequelize, DataTypes);
  const ContentSubmissionMessage = ContentSubmissionMessageModel(sequelize, DataTypes);
  const ContentReviewAssignment = ContentReviewAssignmentModel(sequelize, DataTypes);
  const ContentReview = ContentReviewModel(sequelize, DataTypes);
  const ContentSubmissionPayment = ContentSubmissionPaymentModel(sequelize, DataTypes);

  User.belongsTo(File, { foreignKey: "cvFileId", as: "cvFile" });
  User.belongsTo(File, { foreignKey: "photoFileId", as: "photoFile" })

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

  ContentSubmission.hasMany(ContentSubmissionMessage, { foreignKey: "contentSubmissionId", as: "messages" });
  ContentSubmissionMessage.belongsTo(ContentSubmission, { foreignKey: "contentSubmissionId", as: "submission" });

  ContentSubmissionVersion.hasMany(ContentSubmissionMessage, {
    foreignKey: "contentSubmissionVersionId",
    as: "messages",
  });
  ContentSubmissionMessage.belongsTo(ContentSubmissionVersion, {
    foreignKey: "contentSubmissionVersionId",
    as: "version",
  });

  User.hasMany(ContentSubmissionMessage, { foreignKey: "sndrId", as: "sentMessages" });
  ContentSubmissionMessage.belongsTo(User, { foreignKey: "sndrId", as: "sender" });

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
    as: "reviews",
  });
  ContentReview.belongsTo(ContentSubmissionVersion, {
    foreignKey: "contentSubmissionVersionId",
    as: "version",
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
  };
};
