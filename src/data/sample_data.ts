import { Market } from "./types";

export const capacityData = [
  {
    market: "ATL",
    market_name: "Atlanta, GA",
    otms: 0.4856,
    otms_change: 0.0101,
    score: 77,
    score_change: 2,
    score_last_14: [
      {
        x: 0,
        y: 75,
      },
      {
        x: 1,
        y: 81,
      },
      {
        x: 2,
        y: 91,
      },
      {
        x: 3,
        y: 86,
      },
      {
        x: 4,
        y: 88,
      },
      {
        x: 5,
        y: 82,
      },
      {
        x: 6,
        y: 100,
      },
      {
        x: 7,
        y: 100,
      },
      {
        x: 8,
        y: 100,
      },
      {
        x: 9,
        y: 97,
      },
      {
        x: 10,
        y: 100,
      },
      {
        x: 11,
        y: 82,
      },
      {
        x: 12,
        y: 67,
      },
      {
        x: 13,
        y: 77,
      },
    ],
    otri: 27.772,
    otri_change: -12.0509,
  },
  {
    market: "ONT",
    market_name: "Ontario, CA",
    otms: 0.1458,
    otms_change: 0.003,
    score: 21,
    score_change: -24,
    score_last_14: [
      {
        x: 0,
        y: 45,
      },
      {
        x: 1,
        y: 51,
      },
      {
        x: 2,
        y: 43,
      },
      {
        x: 3,
        y: 55,
      },
      {
        x: 4,
        y: 58,
      },
      {
        x: 5,
        y: 57,
      },
      {
        x: 6,
        y: 29,
      },
      {
        x: 7,
        y: 40,
      },
      {
        x: 8,
        y: 32,
      },
      {
        x: 9,
        y: 23,
      },
      {
        x: 10,
        y: 25,
      },
      {
        x: 11,
        y: 10,
      },
      {
        x: 12,
        y: 15,
      },
      {
        x: 13,
        y: 21,
      },
    ],
    otri: 32.2034,
    otri_change: 7.4867,
  },
  {
    market: "DAL",
    market_name: "Dallas, TX",
    otms: 0.194,
    otms_change: -0.0082,
    score: 74,
    score_change: -5,
    score_last_14: [
      {
        x: 0,
        y: 79,
      },
      {
        x: 1,
        y: 76,
      },
      {
        x: 2,
        y: 68,
      },
      {
        x: 3,
        y: 66,
      },
      {
        x: 4,
        y: 82,
      },
      {
        x: 5,
        y: 73,
      },
      {
        x: 6,
        y: 75,
      },
      {
        x: 7,
        y: 91,
      },
      {
        x: 8,
        y: 91,
      },
      {
        x: 9,
        y: 89,
      },
      {
        x: 10,
        y: 100,
      },
      {
        x: 11,
        y: 97,
      },
      {
        x: 12,
        y: 81,
      },
      {
        x: 13,
        y: 74,
      },
    ],
    otri: 91.5307,
    otri_change: 5.4237,
  },
  {
    market: "MDT",
    market_name: "Harrisburg, PA",
    otms: 0.2386,
    otms_change: 0.0082,
    score: 38,
    score_change: 17,
    score_last_14: [
      {
        x: 0,
        y: 21,
      },
      {
        x: 1,
        y: 24,
      },
      {
        x: 2,
        y: 23,
      },
      {
        x: 3,
        y: 30,
      },
      {
        x: 4,
        y: 29,
      },
      {
        x: 5,
        y: 31,
      },
      {
        x: 6,
        y: 34,
      },
      {
        x: 7,
        y: 31,
      },
      {
        x: 8,
        y: 43,
      },
      {
        x: 9,
        y: 30,
      },
      {
        x: 10,
        y: 25,
      },
      {
        x: 11,
        y: 27,
      },
      {
        x: 12,
        y: 36,
      },
      {
        x: 13,
        y: 38,
      },
    ],
    otri: 86.5386,
    otri_change: 3.0297,
  },
  {
    market: "JOT",
    market_name: "Joliet, IL",
    otms: 0.2565,
    otms_change: -0.0104,
    score: 56,
    score_change: -42,
    score_last_14: [
      {
        x: 0,
        y: 98,
      },
      {
        x: 1,
        y: 100,
      },
      {
        x: 2,
        y: 100,
      },
      {
        x: 3,
        y: 94,
      },
      {
        x: 4,
        y: 86,
      },
      {
        x: 5,
        y: 95,
      },
      {
        x: 6,
        y: 100,
      },
      {
        x: 7,
        y: 95,
      },
      {
        x: 8,
        y: 93,
      },
      {
        x: 9,
        y: 74,
      },
      {
        x: 10,
        y: 74,
      },
      {
        x: 11,
        y: 62,
      },
      {
        x: 12,
        y: 75,
      },
      {
        x: 13,
        y: 56,
      },
    ],
    otri: 47.5301,
    otri_change: -2.422,
  },
];

export const markets: Market[] = capacityData.map((data) => {
  return {
    label: data.market_name,
    id: data.market,
  };
});
