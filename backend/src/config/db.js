import dotenv from "dotenv";
import { Sequelize } from "sequelize";

dotenv.config();

const {
  PG_DB_HOST,
  PG_DB_PORT,
  PG_DB_NAME,
  PG_DB_USER,
  PG_DB_PASSWORD,
  PG_DB_SCHEMA,
  PG_DB_LOGGING,
  PG_DB_SSL,
} = process.env;

if (!PG_DB_HOST || !PG_DB_NAME || !PG_DB_USER) {
  throw new Error("Missing PG_DB_* environment variables. Check your .env file.");
}

const schema = PG_DB_SCHEMA || "public";

export const sequelize = new Sequelize(PG_DB_NAME, PG_DB_USER, PG_DB_PASSWORD, {
  host: PG_DB_HOST,
  port: Number(PG_DB_PORT || 5432),
  dialect: "postgres",
  logging: PG_DB_LOGGING === "true"
    ? (sql, time) => {
      if (typeof time === "number") console.log(`${sql} (${time} ms)`);
      else console.log(sql);
    }
    : false,
  benchmark: true,
  dialectOptions: {
    ...(PG_DB_SSL === "true"
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {}),
    options: `-c search_path=${schema}`,
  },

  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },

  define: {
    schema,
    freezeTableName: true,
  },
});

export async function connectDb() {
  await sequelize.authenticate();
  console.log("Database connection has been established successfully.");
}
