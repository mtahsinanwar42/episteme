import { ACTIVITY_STATUS } from "../utils/constants.js";

export default (sequelize, DataTypes) => {
  const Activity = sequelize.define(
    "Activity",
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
        defaultValue: ACTIVITY_STATUS.INACTIVE,
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
      tableName: "activity",
      freezeTableName: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      hooks: {
        beforeCreate(activity) {
          const now = new Date();
          activity.createdAt = activity.createdAt ?? now;
          activity.updatedAt = activity.updatedAt ?? now;
        },
        beforeUpdate(activity) {
          activity.updatedAt = new Date();
        },
      },
    }
  );

  return Activity;
};
