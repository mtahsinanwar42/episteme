export default (sequelize, DataTypes) => {
  const ContentSubmissionVersion = sequelize.define(
    "ContentSubmissionVersion",
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
      uploaderUsrId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: "uploader_usr_id",
      },
      uploaderUsrType: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "uploader_usr_type",
      },
      changeLog: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "change_log",
      },
      fileId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: "file_id",
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "created_at",
        defaultValue: DataTypes.NOW,
      },
      versionNo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "version_no",
      },
    },
    {
      schema: "episteme",
      tableName: "content_submission_version",
      freezeTableName: true,
      timestamps: false,
      hooks: {
        beforeCreate(row) {
          row.createdAt = row.createdAt ?? new Date();
        },
      },
    }
  );

  return ContentSubmissionVersion;
};
