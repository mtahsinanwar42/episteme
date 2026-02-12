import ErrorResponse from "./ErrorResponse.js";

export function normalizeTextArray(value, { fieldName }) {
  if (value == null || value === "") {
    return null;
  }

  let raw;
  if (Array.isArray(value)) {
    raw = value;
  } else if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (!Array.isArray(parsed)) {
          throw new ErrorResponse(400, `${fieldName} must be an array`);
        }
        raw = parsed;
      } catch {
        throw new ErrorResponse(400, `${fieldName} must be a valid JSON array`);
      }
    } else {
      raw = trimmed.split(",");
    }
  } else {
    raw = String(value).split(",");
  }
  const items = raw.map((item) => String(item).trim()).filter((item) => item.length > 0);

  if (items.length === 0) {
    throw new ErrorResponse(400, `${fieldName} cannot be empty`);
  }

  return items;
}

export function normalizeNumberArray(value, { fieldName }) {
  if (value == null || value === "") {
    return null;
  }

  const raw = Array.isArray(value) ? value : String(value).split(",");
  const items = raw.map((item) => Number(item));

  if (items.some((item) => Number.isNaN(item) || !Number.isInteger(item))) {
    throw new ErrorResponse(400, `${fieldName} must contain valid integers`);
  }

  return items;
}

export function toOptionalInteger(value, { fieldName }) {
  if (value == null || value === "") {
    return null;
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed) || !Number.isInteger(parsed)) {
    throw new ErrorResponse(400, `${fieldName} must be an integer`);
  }

  return parsed;
}

export function toOptionalDateText(value, { fieldName }) {
  if (value == null || value === "") {
    return null;
  }

  const dateText = String(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
    throw new ErrorResponse(400, `${fieldName} must be in YYYY-MM-DD format`);
  }

  const date = new Date(`${dateText}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    throw new ErrorResponse(400, `${fieldName} is not a valid date`);
  }

  const normalized = date.toISOString().slice(0, 10);
  if (normalized !== dateText) {
    throw new ErrorResponse(400, `${fieldName} is not a valid date`);
  }

  return dateText;
}
