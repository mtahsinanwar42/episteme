import crypto from "crypto";

export function createEventEnvelope({
  type,
  payload,
  version = 1,
  correlationId = null,
  actor = { system: true },
  occurredAt = new Date().toISOString(),
}) {
  const raw = `${type}:${version}:${occurredAt}:${JSON.stringify(payload)}`;
  const id = crypto.createHash("sha256").update(raw).digest("hex");

  return {
    id,
    type,
    version,
    occurredAt,
    correlationId,
    actor,
    payload,
  };
}

export function parseBrokers(v) {
  return (v || "").split(",").map(s => s.trim()).filter(Boolean);
}