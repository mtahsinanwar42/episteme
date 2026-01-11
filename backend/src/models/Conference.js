import { CONFERENCE_STATUS } from "../utils/constants.js";

export default (sequelize, DataTypes) => {
  const Conference = sequelize.define(
    "Conference",
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
      slug: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
        field: "slug",
      },
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: "start_date",
      },
      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: "end_date",
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "status",
        defaultValue: CONFERENCE_STATUS.OPEN_FOR_SUBMISSION,
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
      tableName: "conference",
      freezeTableName: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      validate: {
        datesOrder() {
          if (this.startDate && this.endDate && this.startDate > this.endDate) {
            throw new Error("startDate must be <= endDate");
          }
        },
      },
      hooks: {
        beforeCreate(conf) {
          const now = new Date();
          conf.createdAt = conf.createdAt ?? now;
          conf.updatedAt = conf.updatedAt ?? now;
        },
        beforeUpdate(conf) {
          conf.updatedAt = new Date();
        },
      },
    }
  );

  return Conference;
};
