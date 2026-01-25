import express from "express";
import dotenv from "dotenv";
import colors from "colors";
import morgan from "morgan";
import path from "path";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import xss from "xss-clean";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import cors from "cors";

import { sequelize, connectDb } from "./config/db.js";
import { initModels } from "./models/index.js";
import { notFound, errorHandler } from "./middlewares/error.js";
import authRoutes from "./routes/auth.js";
import fileRoutes from "./routes/file.js";
import refDataRoutes from "./routes/referenceData.js";
import userRoutes from "./routes/user.js";
import conferenceRoutes from "./routes/conference.js";
import trainingRoutes from "./routes/training.js";
import blogRoutes from "./routes/blog.js";
import activityRoutes from "./routes/activity.js";
import announcementRoutes from "./routes/announcement.js";
import submissionRoutes from "./routes/contentSubmission.js";
import reviewAssignmentRoutes from "./routes/contentReviewAssignment.js";

dotenv.config();

const app = express();
const __dirname = path.resolve();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));

  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
  });
}

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.use(helmet());
app.use(xss());
app.use(hpp());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || true,
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.get("/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: "ok" });
  } catch (e) {
    res.status(503).json({ status: "down", error: "db_unreachable" });
  }
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/files', fileRoutes);
app.use('/api/v1/reference-data', refDataRoutes);

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/conferences', conferenceRoutes);
app.use('/api/v1/trainings', trainingRoutes);
app.use('/api/v1/blogs', blogRoutes);
app.use('/api/v1/activities', activityRoutes);
app.use('/api/v1/announcements', announcementRoutes);
app.use('/api/v1/submissions', submissionRoutes);
app.use('/api/v1/review-assignments', reviewAssignmentRoutes);

if (process.env.FILE_STORAGE_PATH) {
  const storageBaseAbs = path.resolve(__dirname, process.env.FILE_STORAGE_PATH);
  const publicDiskAbs = path.join(storageBaseAbs, "public");
  const publicUrlPrefix = process.env.FILE_STORAGE_PUBLIC_PATH || "/storage/public";

  app.use(publicUrlPrefix, express.static(publicDiskAbs));
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDb();
    initModels(sequelize);

    app.listen(PORT, () =>
      console.log(
        `Server running in ${process.env.NODE_ENV || "development"} on port ${PORT}`
          .cyan.underline
      )
    );
  } catch (err) {
    console.error("Failed to start server".red, err);
    process.exit(1);
  }
}

start();
