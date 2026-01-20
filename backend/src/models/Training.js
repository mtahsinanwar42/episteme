export default (sequelize, DataTypes) => {
  const Training = sequelize.define(
    "Training",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        field: "id",
      },
      title: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "title",
      },
      metadataFileId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: "metadata_file_id",
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
      tableName: "training",
      freezeTableName: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      hooks: {
        beforeCreate(training) {
          const now = new Date();
          training.createdAt = training.createdAt ?? now;
          training.updatedAt = training.updatedAt ?? now;
        },
        beforeUpdate(training) {
          training.updatedAt = new Date();
        },
      },
    }
  );

  return Training;
};
