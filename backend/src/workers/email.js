import { Kafka, logLevel } from "kafkajs";
import { parseBrokers } from "../utils/kafka.js";
import { formatRecipientsForLog, sendMail } from "../utils/email/index.js";
import { IDEMPOTENCY_TTL, KAFKA_CONSUMER_GROUPS, KAFKA_EVENT_TYPES, KAFKA_TOPICS } from "../utils/constants.js";
import { createIdempotencyService } from "../services/idempotency.js";
import { sequelize } from "../config/db.js";

const enabled = (process.env.KAFKA_ENABLED || "false").toLowerCase() === "true";

const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID || "episteme-backend";
const KAFKA_BROKERS = parseBrokers(process.env.KAFKA_BROKERS);

let consumer;

export async function startEmailWorker() {
  if (!enabled) {
    console.log("Kafka disabled. [EmailWorker] Not starting.");
    return;
  }

  const kafka = new Kafka({
    clientId: KAFKA_CLIENT_ID,
    brokers: KAFKA_BROKERS,
    logLevel: logLevel.INFO,
  });

  consumer = kafka.consumer({ groupId: KAFKA_CONSUMER_GROUPS.EMAIL_WORKER });

  const { IdempotencyKey } = sequelize.models;
  const idempotencyService = createIdempotencyService({ IdempotencyKey });

  await consumer.connect();
  await consumer.subscribe({ topic: KAFKA_TOPICS.EMAIL_SEND, fromBeginning: false });

  console.log(
    `[EmailWorker] Started. topic=${KAFKA_TOPICS.EMAIL_SEND} groupId=${KAFKA_CONSUMER_GROUPS.EMAIL_WORKER} brokers=${KAFKA_BROKERS.join(",")}`
  );

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const msgKey = message.key?.toString("utf8");
      const msgValue = message.value?.toString("utf8");

      if (!msgValue) {
        console.warn("[EmailWorker] Skipping empty message value", {
          topic,
          partition,
          key: msgKey,
        });
        return;
      }

      let envelope;

      try {
        envelope = JSON.parse(msgValue);
      } catch (e) {
        console.error("[EmailWorker] Invalid JSON message, skipping", {
          topic,
          partition,
          key: msgKey,
        });
        return;
      }

      if (!envelope?.id || !envelope?.type || !envelope?.payload) {
        console.error("[EmailWorker] Invalid envelope shape, skipping", {
          id: envelope?.id,
          type: envelope?.type,
        });
        return;
      }

      if (envelope.type !== KAFKA_EVENT_TYPES.EMAIL_SEND) {
        console.log(`[EmailWorker] Ignoring type=${envelope.type} id=${envelope.id}`);
        return;
      }

      const isNew = await idempotencyService.acquireKey("email", envelope.id, IDEMPOTENCY_TTL.EMAIL);
      if (!isNew) {
        console.log(`[EmailWorker] Dedupe hit, skipping id=${envelope.id}`);
        return;
      }

      try {
        await sendMail(envelope.payload);

        console.log(
          `[EmailWorker] SENT id=${envelope.id} mailType=${envelope.payload?.mailType} to=${formatRecipientsForLog(envelope.payload.to)} subject="${envelope.payload.subject}"`
        );
      } catch (err) {
        console.error("[EmailWorker] FAILED processing message", {
          id: envelope.id,
          type: envelope.type,
          err: err?.message || String(err),
        });
      }
    },
  });
}

export async function stopEmailWorker() {
  if (!consumer) {
    return;
  }

  await consumer.disconnect();
  consumer = undefined;
}
