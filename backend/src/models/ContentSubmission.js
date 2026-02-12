export default (sequelize, DataTypes) => {
  const ContentSubmission = sequelize.define(
    "ContentSubmission",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        field: "id",
      },
      ownerUsrId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: "owner_usr_id",
      },
      title: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "title",
      },
      abstract: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "abstract",
      },
      topics: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: false,
        field: "topics",
        defaultValue: [],
      },
      doi: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "doi",
      },
      conferenceId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: "conference_id",
      },
      currentContentSubmissionVersionId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: "current_content_submission_version_id",
      },
      currentStatus: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "current_status",
        defaultValue: 1,
      },
      statusUpdateNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "status_update_notes",
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "created_at",
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "updated_at",
        defaultValue: DataTypes.NOW,
      },
    },
    {
      schema: "episteme",
      tableName: "content_submission",
      freezeTableName: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      hooks: {
        beforeCreate(row) {
          const now = new Date();
          row.createdAt = row.createdAt ?? now;
          row.updatedAt = row.updatedAt ?? now;
        },
        beforeUpdate(row) {
          row.updatedAt = new Date();
        },
      },
    }
  );

  return ContentSubmission;
};
