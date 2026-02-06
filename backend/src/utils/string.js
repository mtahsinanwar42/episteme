export const nullSafeLowerCaseStr = (str) => {
  return isEmpty(str) ? "" : str.toLowerCase();
}

export const equalsIgnoreCase = (str1, str2) => {
  return isNotEmpty(str1) && isNotEmpty(str2) && str1.trim().toUpperCase() === str2.trim().toUpperCase();
}

export const isNotEmpty = (str) => {
  return !isEmpty(str);
}

export const isEmpty = (str) => {
  return !str || str.trim() === "";
}

export const slugify = (str) => {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_.-]/g, "");
}

export const isValidEmail = (str) => {
  if (str === null || str === undefined || str === "") {
    return;
  }

  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

  return regex.test(str);
}

export const isValidPhone = (str) => {
  if (str === null || str === undefined || str === "") {
    return;
  }

  const regex = /^\+?[0-9][0-9\-\s]{6,20}$/;

  return regex.test(str);
}