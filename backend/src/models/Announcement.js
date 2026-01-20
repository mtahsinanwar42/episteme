export default (sequelize, DataTypes) => {
  const Announcement = sequelize.define(
    "Announcement",
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
      tableName: "announcement",
      freezeTableName: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      hooks: {
        beforeCreate(announcement) {
          const now = new Date();
          announcement.createdAt = announcement.createdAt ?? now;
          announcement.updatedAt = announcement.updatedAt ?? now;
        },
        beforeUpdate(announcement) {
          announcement.updatedAt = new Date();
        },
      },
    }
  );

  return Announcement;
};
