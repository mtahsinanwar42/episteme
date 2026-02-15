export const currentTimestamp = () => {
  const d = new Date();

  return (
    d.getUTCFullYear() +
    String(d.getUTCMonth() + 1).padStart(2, "0") +
    String(d.getUTCDate()).padStart(2, "0") +
    "T" +
    String(d.getUTCHours()).padStart(2, "0") +
    String(d.getUTCMinutes()).padStart(2, "0") +
    String(d.getUTCSeconds()).padStart(2, "0") +
    "_" +
    String(d.getUTCMilliseconds()).padStart(3, "0")
  );
};

export const toDate = (v) => (v instanceof Date ? v : new Date(v));

export const parseOptionalDateInput = (value) => {
  if (value === undefined || value === null) {
    return {
      isProvided: false,
      isEmpty: false,
      isInvalid: false,
      date: null,
    };
  }

  const dateText = String(value).trim();
  if (!dateText) {
    return {
      isProvided: true,
      isEmpty: true,
      isInvalid: false,
      date: null,
    };
  }

  const dateOnlyMatch = dateText.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1]);
    const month = Number(dateOnlyMatch[2]);
    const day = Number(dateOnlyMatch[3]);

    const parsedDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
    const isSameDate =
      parsedDate.getUTCFullYear() === year
      && parsedDate.getUTCMonth() + 1 === month
      && parsedDate.getUTCDate() === day;

    if (!isSameDate) {
      return {
        isProvided: true,
        isEmpty: false,
        isInvalid: true,
        date: null,
      };
    }

    return {
      isProvided: true,
      isEmpty: false,
      isInvalid: false,
      date: parsedDate,
    };
  }

  const parsedDate = new Date(dateText);
  if (Number.isNaN(parsedDate.getTime())) {
    return {
      isProvided: true,
      isEmpty: false,
      isInvalid: true,
      date: null,
    };
  }

  return {
    isProvided: true,
    isEmpty: false,
    isInvalid: false,
    date: parsedDate,
  };
};

export const isCurrentDateOrFuture = (date) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  return date >= startOfToday;
};
