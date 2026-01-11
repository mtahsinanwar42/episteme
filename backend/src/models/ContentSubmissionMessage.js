export default (sequelize, DataTypes) => {
  const ContentSubmissionMessage = sequelize.define(
    "ContentSubmissionMessage",
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
      contentSubmissionVersionId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: "content_submission_version_id",
      },
      sndrId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: "sndr_id",
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "message",
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "created_at",
        defaultValue: DataTypes.NOW,
      },
    },
    {
      schema: "episteme",
      tableName: "content_submission_message",
      freezeTableName: true,
      timestamps: false,
      hooks: {
        beforeCreate(row) {
          row.createdAt = row.createdAt ?? new Date();
        },
      },
    }
  );

  return ContentSubmissionMessage;
};
