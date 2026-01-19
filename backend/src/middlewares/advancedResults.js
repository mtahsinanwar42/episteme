import { Op } from "sequelize";
import { DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_NO } from "../utils/constants.js";

export const advancedResults = (model, { include = [], transform } = {}) => async (req, res, next) => {
  const paginate = !/^(false|0|no)$/i.test(String(req.query.paginate ?? "true"));
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || DEFAULT_PAGE_NO);
  const limit = Math.max(1, Number.parseInt(req.query.limit, 10) || DEFAULT_PAGE_LIMIT);
  const offset = limit * (page - 1);

  const queryObj = { ...req.query };
  ["select", "sort", "page", "limit", "paginate"].forEach((k) => delete queryObj[k]);

  const where = buildWhere(queryObj);
  const attributes = req.query.select
    ? req.query.select.split(",").map((s) => s.trim()).filter(Boolean)
    : undefined;
  const order = req.query.sort ? parseSort(req.query.sort) : [["createdAt", "DESC"]];

  try {
    const result = await model.findAndCountAll({
      where,
      include,
      attributes,
      order,
      ...(paginate ? { limit, offset } : {}),
      distinct: true,
    });

    const total = result.count;
    let data = result.rows;

    const pagination = {};

    if (paginate) {
      const endIndex = page * limit;

      if (endIndex < total) {
        pagination.next = { page: page + 1, limit };
      }

      if (offset > 0) {
        pagination.prev = { page: page - 1, limit };
      }
    }

    if (typeof transform === "function") {
      data = await Promise.resolve(transform(data, { req }));
    }

    res.advancedResults = {
      success: true,
      total,
      pagination: paginate ? pagination : undefined,
      data,
    };

    next();
  } catch (err) {
    next(err);
  }
};

const OPERATOR_HANDLERS = {
  in: (field, rawValue, where) => {
    const items = String(rawValue)
      .split(",")
      .map((v) => coerceValue(v.trim()))
      .filter((v) => v !== "");
    where[field][Op.in] = items;
  },
  like: (field, rawValue, where) => {
    where[field][Op.like] = `%${String(rawValue)}%`;
  },
  iLike: (field, rawValue, where) => {
    where[field][Op.iLike] = `%${String(rawValue)}%`;
  },
  gt: (field, rawValue, where) => {
    where[field][Op.gt] = coerceValue(rawValue);
  },
  gte: (field, rawValue, where) => {
    where[field][Op.gte] = coerceValue(rawValue);
  },
  lt: (field, rawValue, where) => {
    where[field][Op.lt] = coerceValue(rawValue);
  },
  lte: (field, rawValue, where) => {
    where[field][Op.lte] = coerceValue(rawValue);
  },
  contains: (field, rawValue, where) => {
    where[field][Op.contains] = [String(rawValue).trim()];
  },
  overlap: (field, rawValue, where) => {
    const items = String(rawValue)
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    where[field][Op.overlap] = items;
  },
};

function buildWhere(queryObj) {
  const where = {};
  const operatorRegex = /^(.+)\[(gt|gte|lt|lte|in|like|iLike|contains|overlap)\]$/;

  for (const [key, rawValue] of Object.entries(queryObj)) {
    const match = key.match(operatorRegex);

    if (match) {
      const field = match[1];
      const op = match[2];

      if (!where[field] || typeof where[field] !== "object" || Array.isArray(where[field])) {
        where[field] = {};
      }

      OPERATOR_HANDLERS[op]?.(field, rawValue, where);
      continue;
    }

    if (rawValue && typeof rawValue === "object" && !Array.isArray(rawValue)) {
      const field = key.endsWith("=") ? key.slice(0, -1) : key;

      if (!where[field] || typeof where[field] !== "object") {
        where[field] = {};
      }

      for (const [op, v] of Object.entries(rawValue)) {
        OPERATOR_HANDLERS[op]?.(field, v, where);
      }
      continue;
    }

    where[key] = coerceValue(rawValue);
  }

  return where;
}

function parseSort(sortStr) {
  return String(sortStr)
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean)
    .map((field) => (field.startsWith("-") ? [field.slice(1), "DESC"] : [field, "ASC"]));
}

function coerceValue(v) {
  if (v === null || v === undefined) {
    return v;
  }

  const s = String(v).trim();

  if (s === "") {
    return v;
  }

  if (/^(true|false)$/i.test(s)) {
    return s.toLowerCase() === "true"
  };

  const num = Number(s);
  if (!Number.isNaN(num) && s !== "") {
    return num;
  }

  return v;
}
