import cron from "node-cron";
import { UPDATE_SCHEDULER_TIME_PATTERN } from "../utils/constants.js";
import { findConferencesToAutoFinish, markConferenceAsFinished } from "../repositories/conference.js";
import { sequelize } from "../config/db.js";

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
  async function refreshCountriesJob() {
    console.log("[Scheduler] refreshCountries started");

    try {
      const before = await refDataService.getCountries();
      const after = await refDataService.refreshCountries();

      const beforeSet = new Set(before);
      const afterSet = new Set(after);

      const added = after.filter(c => !beforeSet.has(c));
      const removed = before.filter(c => !afterSet.has(c));

      console.log(
        `[Scheduler] refreshCountries finished (${after.length} countries)`
      );

      if (added.length) {
        console.log(`[Scheduler] countries added (${added.length})`);
      }

      if (removed.length) {
        console.log(`[Scheduler] countries removed (${removed.length})`);
      }
    } catch (err) {
      console.error("[Scheduler] refreshCountries failed:", err);
    }
  }

  async function transitionConferenceStatusJob() {
    console.log("[Scheduler] transitionConferenceStatus started");

    try {
      const conferenceIds = await findConferencesToAutoFinish({});
      let finishedCount = 0;

      for (const conferenceId of conferenceIds) {
        try {
          await sequelize.transaction(async (t) => {
            await markConferenceAsFinished({ conferenceId }, { t });
          });
          finishedCount += 1;
        } catch (err) {
          console.error(
            `[Scheduler] transitionConferenceStatus failed for conferenceId=${conferenceId}:`,
            err
          );
        }
      }

      console.log(
        `[Scheduler] transitionConferenceStatus finished (${finishedCount}/${conferenceIds.length} conferences transitioned)`
      );
    } catch (err) {
      console.error("[Scheduler] transitionConferenceStatus failed:", err);
    }
  }

  function start() {
    cron.schedule(UPDATE_SCHEDULER_TIME_PATTERN.TOPICS, refreshTopicsJob, {
      scheduled: true,
    });
    cron.schedule(UPDATE_SCHEDULER_TIME_PATTERN.COUNTRIES, refreshCountriesJob, {
      scheduled: true,
    });
    cron.schedule(UPDATE_SCHEDULER_TIME_PATTERN.CONFERENCE_STATUS_TRANSITION, transitionConferenceStatusJob, {
      scheduled: true,
    });

    console.log(`[Scheduler] jobs have started`);
  }

  return {
    start,
  };
}
