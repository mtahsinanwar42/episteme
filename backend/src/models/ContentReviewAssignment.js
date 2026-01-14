import { REVIEW_ASSIGNMENT_STATUS } from "../utils/constants.js";

export default (sequelize, DataTypes) => {
  const ContentReviewAssignment = sequelize.define(
    "ContentReviewAssignment",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        field: "id",
      },
      contentSubmissionId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: "content_submission_id",
      },
      reviewerUsrId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: "reviewer_usr_id",
      },
      assignedByUsrId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: "assigned_by_usr_id",
      },
      assignedByNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "assigned_by_notes",
      },
      assignedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "assigned_at",
        defaultValue: DataTypes.NOW,
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "status",
        defaultValue: REVIEW_ASSIGNMENT_STATUS.ASSIGNED,
      },
    },
    {
      schema: "episteme",
      tableName: "content_review_assignment",
      freezeTableName: true,
      timestamps: false,
      hooks: {
        beforeCreate(row) {
          row.assignedAt = row.assignedAt ?? new Date();
        },
      },
    }
  );

  return ContentReviewAssignment;
};
