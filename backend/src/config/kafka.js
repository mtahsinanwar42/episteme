import { Kafka, logLevel } from "kafkajs";
import { parseBrokers } from "../utils/kafka.js";

const enabled = (process.env.KAFKA_ENABLED || "false").toLowerCase() === "true";
const kafka = enabled
  ? new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID || "app",
    brokers: parseBrokers(process.env.KAFKA_BROKERS),
    logLevel: logLevel.INFO,
  })
  : null;

let producer;

export async function startKafkaProducer() {
  if (!enabled) {
    return;
  }

  producer = kafka.producer();
  await producer.connect();
}

export async function stopKafkaProducer() {
  if (!producer) {
    return;
  }

  await producer.disconnect();
  producer = undefined;
}

export async function publishEvent({ topic, key, value, headers }) {
  if (!enabled) {
    return;
  }

  if (!producer) {
    throw new Error("Kafka producer not started");
  }

  if (!topic) {
    throw new Error("publishEvent: topic is required");
  }

  if (value === undefined || value === null) {
    throw new Error("publishEvent: value is required");
  }

  const msgValue =
    Buffer.isBuffer(value) || typeof value === "string"
      ? value
      : JSON.stringify(value);

  const hdrs = {};

  if (headers) {
    for (const [k, v] of Object.entries(headers)) {
      if (v === undefined || v === null) continue;
      hdrs[k] = String(v);
    }
  }

  await producer.send({
    topic,
    messages: [{
      key: key ? String(key) : undefined,
      value: msgValue,
      headers: hdrs
    }],
  });
}
