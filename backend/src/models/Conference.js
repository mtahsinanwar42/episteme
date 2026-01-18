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
      startAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "start_at",
      },
      endAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "end_at",
      },
      submissionPeriodStartAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "submission_period_start_at",
      },
      submissionPeriodEndAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "submission_period_end_at",
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
      tableName: "conference",
      freezeTableName: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      validate: {
        datesOrder() {
          if (this.startAt && this.endAt && this.startAt > this.endAt) {
            throw new Error("startAt must be <= endAt");
          }

          if (this.submissionPeriodStartAt && this.submissionPeriodEndAt && this.submissionPeriodStartAt > this.submissionPeriodEndAt) {
            throw new Error("submissionPeriodStartAt must be <= submissionPeriodEndAt");
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
