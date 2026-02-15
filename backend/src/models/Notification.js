export default (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    "Notification",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        field: "id",
      },
      usrId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: "usr_id",
      },
      type: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "type",
      },
      title: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "title",
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "message",
      },
      resourceType: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "resource_type",
      },
      resourceId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: "resource_id",
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: "is_read",
        defaultValue: false,
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
      tableName: "notification",
      freezeTableName: true,
      createdAt: "createdAt",
      updatedAt: false,
      hooks: {
        beforeCreate(notification) {
          notification.createdAt = notification.createdAt ?? new Date();
        },
      },
    }
  );

  return Notification;
};
