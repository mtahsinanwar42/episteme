export default (sequelize, DataTypes) => {
  const ContentSubmissionPayment = sequelize.define(
    "ContentSubmissionPayment",
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
      usrId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: "usr_id",
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        field: "amount",
      },
      currency: {
        type: DataTypes.CHAR(3),
        allowNull: false,
        field: "currency",
      },
      provider: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "provider",
      },
      providerPaymentId: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "provider_payment_id",
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "status",
        defaultValue: 0,
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
      tableName: "content_submission_payment",
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

  return ContentSubmissionPayment;
};
