import { BLOG_STATUS } from "../utils/constants.js";

export default (sequelize, DataTypes) => {
  const Blog = sequelize.define(
    "Blog",
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
        defaultValue: BLOG_STATUS.INACTIVE,
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
      tableName: "blog",
      freezeTableName: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      hooks: {
        beforeCreate(blog) {
          const now = new Date();
          blog.createdAt = blog.createdAt ?? now;
          blog.updatedAt = blog.updatedAt ?? now;
        },
        beforeUpdate(blog) {
          blog.updatedAt = new Date();
        },
      },
    }
  );

  return Blog;
};
