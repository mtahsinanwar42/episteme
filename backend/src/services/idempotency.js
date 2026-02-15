import { Op } from "sequelize";

export function createIdempotencyService({ IdempotencyKey }) {
  if (!IdempotencyKey) {
    throw new Error("createIdempotencyService requires { IdempotencyKey } model");
  }

  async function acquireKey(scope, key, ttlMs) {
    const expiresAt = new Date(Date.now() + ttlMs);

    const [, created] = await IdempotencyKey.findOrCreate({
      where: { scope, key },
      defaults: { expiresAt },
    });

    return created;
  }

  async function cleanupExpiredKeys() {
    const deleted = await IdempotencyKey.destroy({
      where: { expiresAt: { [Op.lt]: new Date() } },
    });

    if (deleted > 0) {
      console.log(`[IdempotencyKey] Cleaned up ${deleted} expired keys`);
    }
  }

  return {
    acquireKey,
    cleanupExpiredKeys,
  };
}
