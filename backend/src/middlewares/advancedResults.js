import { Op } from "sequelize";
import { DEFAULT_PAGE_LIMIT } from "../utils/constants.js";

export const advancedResults = (model, { include = [], transform } = {}) => async (req, res, next) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, Number.parseInt(req.query.limit, 10) || DEFAULT_PAGE_LIMIT);
  const offset = limit * (page - 1);

  const queryObj = { ...req.query };
  ["select", "sort", "page", "limit"].forEach((k) => delete queryObj[k]);

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
      limit,
      offset,
      distinct: true,
    });

    const totalCount = result.count;
    let data = result.rows;

    if (typeof transform === "function") {
      data = await Promise.resolve(transform(data, { req }));
    }

    const pagination = {};
    const endIndex = page * limit;

    if (endIndex < totalCount) pagination.next = { page: page + 1, limit };
    if (offset > 0) pagination.prev = { page: page - 1, limit };

    res.advancedResults = {
      success: true,
      dataCount: data.length,
      totalCount,
      pagination,
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
};

function buildWhere(queryObj) {
  const where = {};
  const operatorRegex = /^(.+)\[(gt|gte|lt|lte|in|like|iLike)\]$/;

  for (const [key, rawValue] of Object.entries(queryObj)) {
    const match = key.match(operatorRegex);

    if (!match) {
      where[key] = coerceValue(rawValue);
      continue;
    }

    const field = match[1];
    const op = match[2];

    if (!Object.prototype.hasOwnProperty.call(where, field) || typeof where[field] !== "object" || Array.isArray(where[field])) {
      where[field] = {};
    }

    const handler = OPERATOR_HANDLERS[op];
    if (handler) handler(field, rawValue, where);
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
