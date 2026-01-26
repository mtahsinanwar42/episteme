import cron from "node-cron";
import { UPDATE_SCHEDULER_TIME_PATTERN } from "../utils/constants.js";

export function createSchedulerService({ refDataService }) {

  async function refreshTopicsJob() {
    console.log("[Scheduler] refreshTopics started");

    try {
      const before = await refDataService.getTopics();
      const after = await refDataService.refreshTopics();

      const beforeSet = new Set(before);
      const afterSet = new Set(after);

      const added = after.filter(t => !beforeSet.has(t));
      const removed = before.filter(t => !afterSet.has(t));

      console.log(
        `[Scheduler] refreshTopics finished (${after.length} topics)`
      );

      if (added.length) {
        console.log(`[Scheduler] topics added (${added.length})`);
      }

      if (removed.length) {
        console.log(`[Scheduler] topics removed (${removed.length})`);
      }
    } catch (err) {
      console.error("[Scheduler] refreshTopics failed:", err);
    }
  }

  function start() {
    cron.schedule(UPDATE_SCHEDULER_TIME_PATTERN.TOPICS, refreshTopicsJob, {
      scheduled: true,
    });

    console.log(`[Scheduler] jobs have started`);
  }

  return {
    start,
  };
}
