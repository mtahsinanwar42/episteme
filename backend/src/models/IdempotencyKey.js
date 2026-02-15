export default (sequelize, DataTypes) => {
  const IdempotencyKey = sequelize.define(
    "IdempotencyKey",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        field: "id",
      },
      scope: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "scope",
      },
      key: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "key",
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "expires_at",
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
      tableName: "idempotency_key",
      freezeTableName: true,
      createdAt: "createdAt",
      updatedAt: false,
      hooks: {
        beforeCreate(record) {
          record.createdAt = record.createdAt ?? new Date();
        },
      },
    }
  );

  return IdempotencyKey;
};
