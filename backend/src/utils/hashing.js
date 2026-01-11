import fs from "fs";
import crypto from 'crypto';

export const generateHash = (token) => {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
}

export const generateContentSha256 = (path) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(path);

    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
};
