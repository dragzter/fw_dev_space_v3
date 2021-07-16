import { capacityData } from "../data/sample_data";
import { TableDataMold } from "./types";

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

/**
 * Creates a UUID.
 * @returns String
 */
export const createUUID = (): String => {
  let dt: number = new Date().getTime();
  const uuid: String = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (c) => {
      let r: number = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);

      return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
    }
  );

  return uuid;
};

/**
 *
 * @returns DataMold[] an array of fitted data sets
 * This helps to normalize the data so we can avoid
 * having to change it elsewhere.
 */
export const moldedTableData = (): TableDataMold[] => {
  return capacityData.map((data): TableDataMold => {
    return {
      market_city: data.granularity1_name,
      market_condition: data.out_vol,
      market_code: data.granularity1,
      market_share: data.market_share,
      market_score: data.otri_ind,
      spark_trend_line: data.tlt,
      out_tender_rejection: data.tlt_ind,
    } as TableDataMold;
  });
};
