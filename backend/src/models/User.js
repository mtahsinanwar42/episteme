import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import { generateHash } from "../utils/hashing.js";

export default (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        field: "id",
      },
      firstName: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "first_name",
      },
      lastName: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "last_name",
      },
      phone: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "phone_number",
      },
      email: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
        field: "email",
      },
      passwordHash: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "password_hash",
      },
      password: {
        type: DataTypes.VIRTUAL,
        set(value) {
          this.setDataValue("password", value);
          this._plainPassword = value;
        },
      },

      roles: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: false,
        field: "roles",
        defaultValue: ["USER"],
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "status",
        defaultValue: 0,
      },
      statusUpdateNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "status_update_notes",
      },
      cvFileId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: "cv_file_id",
      },
      photoFileId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: "photo_file_id",
      },
      linkedinUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "linkedin_url",
      },
      institution: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "institution",
      },
      occupation: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "occupation",
      },
      country: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "country",
      },
      resetPasswordToken: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "reset_password_token",
      },
      resetPasswordExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "reset_password_expires_at",
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
      tableName: "user",
      freezeTableName: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      hooks: {
        beforeCreate(user) {
          const now = new Date();
          user.createdAt = user.createdAt ?? now;
          user.updatedAt = user.updatedAt ?? now;
        },
        beforeUpdate(user) {
          user.updatedAt = new Date();
        },
        async beforeSave(user) {
          if (user._plainPassword) {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(user._plainPassword, salt);

            user.setDataValue("passwordHash", hash);
            user.changed("passwordHash", true);

            user._plainPassword = null;
          }
        },
      },
    }
  );

  User.prototype.getGeneratedToken = function () {
    return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
  };

  User.prototype.prepareResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = generateHash(resetToken);
    this.resetPasswordExpiresAt = Date.now() + 10 * 60 * 1000;

    return resetToken;
  };
  User.prototype.matchPassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.passwordHash);
  };

  return User;
};
