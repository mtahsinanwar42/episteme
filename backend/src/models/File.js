import crypto from "crypto";

export default (sequelize, DataTypes) => {
  const File = sequelize.define(
    "File",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        field: "id",
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "name",
      },
      storageKey: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
        field: "storage_key",
      },
      size: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: "size",
        validate: {
          min: 0,
        },
      },
      sha256: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "sha256",
      },
      mimeType: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "mime_type",
      },
      uploadedBy: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: "uploaded_by",
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
      tableName: "file",
      freezeTableName: true,
      timestamps: false,
      hooks: {
        beforeCreate(file) {
          file.createdAt = file.createdAt ?? new Date();

          if (file._fileBuffer && (!file.sha256 || file.changed("sha256") === false)) {
            file.sha256 = crypto.createHash("sha256").update(file._fileBuffer).digest("hex");
          }
        },
      },
    }
  );

  File.prototype.setFileBuffer = function (buffer) {
    this._fileBuffer = buffer;
  };

  return File;
};
