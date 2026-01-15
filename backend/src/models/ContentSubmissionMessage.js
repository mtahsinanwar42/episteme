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
      senderUsrId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: "sender_usr_id",
      },
      senderUsrType: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "sender_usr_type",
      },
      receiverUsrId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: "receiver_usr_id",
      },
      visibilityScope: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "visibility_scope",
        validate: {
          isIn: [["USER_ADMIN", "ADMIN_REVIEWER"]],
        },
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
