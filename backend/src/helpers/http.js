import axios from "axios";

export async function getText(url, { headers = {}, timeoutMs = 30_000 } = {}) {
  const res = await axios.get(url, {
    responseType: "text",
    timeout: timeoutMs,
    headers: {
      Accept: "text/plain,application/json;q=0.9,*/*;q=0.8",
      ...headers,
    },

    validateStatus: (s) => s >= 200 && s < 300,
  });

  return res.data;
}

export async function getJson(url, { headers = {}, timeoutMs = 30_000 } = {}) {
  const res = await axios.get(url, {
    responseType: "json",
    timeout: timeoutMs,
    headers: {
      Accept: "application/json",
      ...headers,
    },
    validateStatus: (s) => s >= 200 && s < 300,
  });

  return res.data;
}
