export const sortValidationArray = (
  data: any[],
  key: string,
  direction: String
): any[] => {
  return data.sort((a, b) => {
    if (a[key] === undefined) a[key] = "N/A";
    if (b[key] === undefined) b[key] = "N/A";
    if (direction === "asc") {
      if (typeof a[key].value === "number") {
        return a[key].value - b[key].value;
      } else {
        return a[key].value.localeCompare(b[key].value);
      }
    } else {
      if (typeof a[key].value === "number") {
        return b[key].value - a[key].value;
      } else {
        return b[key].value.localeCompare(a[key].value);
      }
    }
  });
};

export const sortArray = (
  data: any[],
  key: string,
  direction: String
): any[] => {
  return data.sort((a, b) => {
    if (a[key] && b[key]) {
      if (a[key] === undefined) a[key] = "N/A";
      if (b[key] === undefined) b[key] = "N/A";
      if (typeof a[key] === "number" && !b[key]) b[key] = 0;
      if (typeof b[key] === "number" && !a[key]) a[key] = 0;
      if (direction === "asc") {
        if (typeof a[key] === "number" || typeof a[key] === "boolean") {
          return a[key] - b[key];
        } else {
          return a[key].localeCompare(b[key]);
        }
      } else {
        if (typeof a[key] === "number" || typeof a[key] === "boolean") {
          return b[key] - a[key];
        } else {
          return b[key].localeCompare(a[key]);
        }
      }
    }
  });
};
