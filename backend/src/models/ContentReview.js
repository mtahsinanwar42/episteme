export default (sequelize, DataTypes) => {
  const ContentReview = sequelize.define(
    "ContentReview",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        field: "id",
      },
      contentReviewAssignmentId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: "content_review_assignment_id",
      },
      contentSubmissionVersionId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: "content_submission_version_id",
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "comment",
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "created_at",
        defaultValue: DataTypes.NOW,
      },
      recommendation: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "recommendation",
      },
    },
    {
      schema: "episteme",
      tableName: "content_review",
      freezeTableName: true,
      timestamps: false,
      hooks: {
        beforeCreate(row) {
          row.createdAt = row.createdAt ?? new Date();
        },
      },
    }
  );

  return ContentReview;
};