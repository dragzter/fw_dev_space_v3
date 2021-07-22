<template>
  <div class="outer">
    <div ref="checkboxContainer">
      <router-link to="/">Home</router-link>
      <h1>Page title</h1>
      <h4>Market Selection</h4>
      <checkbox
        label="Select All"
        :checked="isAllSelected"
        :inputFunction="handleSelectAll"
      />
      <scrollable-list>
        <li v-for="market in markets" :key="market.id">
          <checkbox
            :label="market.label"
            :checked="false"
            :inputFunction="() => addMarketToCall(market.id)"
          />
        </li>
      </scrollable-list>
      <button @click="buildMarketTable" class="submit">Submit</button>
      <div class="table" v-if="sortableData.length > 0">
        <data-table
          :title="'Data table title'"
          :subtitle="'Subtitle'"
          :sortable="true"
          :isLoading="false"
          :activeCol="activeCol"
          :rows="sortableData"
          :columns="previewColumns"
          :styleFunction="rowStyler"
          :displayFunction="rowDisplay"
          :setActiveKey="setActiveKey"
          :colClickFunction="handleColClick"
          :scaleFunction="colorScale"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, reactive, watch } from "vue";
import ScrollableList from "./ui/ScrollableList.vue";
import Checkbox from "./ui/Checkbox.vue";
import DataTable from "./ui/DataTable.vue";
import { capacityData, markets } from "../data/sample_data";
import { moldedTableData } from "./helpers";
import { sortArray } from "./helpers";
import { select as d3_select, scaleOrdinal as d3_scaleOrdinal } from "d3";
interface Detail<T> {
  value: T;
  is_valid: boolean;
  message: string;
}
export interface Column {
  type: "date" | "number" | "string" | "percentage";
  key: string;
  label: string;
  deps?: object[];
}
export type EquipmentType = "van" | "reefer" | "unknown";
export interface LaneSelection {
  granularity1_name: Detail<string> | string;
}
export interface PlotPoint {
  x: number;
  y: number;
}
export interface LaneResponse extends LaneSelection {
  market: string;
  market_name: string;
  otms: number;
  otms_change: number;
  score: number;
  score_change: number;
  score_last_14: PlotPoint[];
  otri: number;
  otri_change: number;
}
export default defineComponent({
  components: {
    ScrollableList,
    Checkbox,
    DataTable,
  },
  setup() {
    const activeCol = ref<string>("");
    const sortableData = ref<any[]>([]);
    const requestString = ref<string[]>([]);
    const isAllSelected = ref<boolean>(false);
    const selectedCount = ref<number>(0);
    const checkboxContainer = ref<HTMLElement>();

    const columns: Column[] = [
      {
        type: "string",
        key: "market_name",
        label: "Primary Market City",
      },
      { type: "string", key: "market", label: "SONAR Market Code" },
      { type: "percentage", key: "otms", label: "US Market Share %" },
      {
        type: "string",
        key: "otms_change",
        label: "Market Condition",
      },
      {
        type: "percentage",
        key: "score",
        label: "Market Score (1=worst; 100=best)",
      },
      {
        type: "string",
        key: "score_last_14",
        label: "14 Day Sparkline Trend for Makret Score",
      },
      {
        type: "number",
        key: "otri",
        label: "Outbound Tender Rejection",
      },
    ];
    const previewColumns = reactive(columns);

    /**
     * Handle select all logic
     */
    function handleSelectAll() {
      isAllSelected.value = !isAllSelected.value;

      if (isAllSelected.value) {
        flipCheckboxes(true);
        markets.forEach((market) => {
          if (!requestString.value.includes(market.id)) {
            requestString.value.push(market.id);
          }
        });
        selectedCount.value = markets.length;
      } else {
        resetCountersAndValues();
      }
    }

    /**
     * Uncheck checkboxes and clear request string
     */
    function resetCountersAndValues(): void {
      flipCheckboxes(false);
      selectedCount.value = 0;
      requestString.value = [];
    }

    /**
     * Toggle checked or unchecked
     */
    function flipCheckboxes(bool: boolean) {
      checkboxContainer.value
        ?.querySelectorAll("input[type=checkbox]")
        .forEach((checkbox: any) => {
          checkbox.checked = bool;
        });
    }

    /**
     * Constructs a string of markets that will be appended to API call
     * @param market: string | Three leter abbr of the market
     */
    const addMarketToCall = (market: string): void => {
      let deletePosition: number = 0;
      markets.forEach((m, i) => {
        if (m.id === market) {
          if (requestString.value.includes(market)) {
            requestString.value.forEach((str, j) => {
              if (str === market) {
                deletePosition = j;
              }
            });
            requestString.value.splice(deletePosition, 1);
            isAllSelected.value = false;
            selectedCount.value--;
          } else {
            requestString.value.push(market);
            selectedCount.value++;
          }
        }
      });

      if (selectedCount.value === markets.length) {
        isAllSelected.value = true;
      }
    };

    /**
     * Read request string and perform API to
     * retrieve appropriate markets for table.
     * @returns void
     */
    const buildMarketTable = (): void => {
      let existing: string[] = [];
      let incoming: string[] = [...requestString.value];
      sortableData.value.forEach((data) => {
        existing.push(data.market);
      });

      let existingString = existing.sort().join("");
      let incomingString = incoming.sort().join("");

      if (existingString !== incomingString) {
        const sampleResponseData = requestString.value.flatMap(
          (mrkt: string) => {
            return capacityData.filter((data) => {
              return data.market === mrkt;
            });
          }
        );
        sortableData.value = sampleResponseData;
      }
    };

    /**
     * Sets the active column sort.
     * @param col string
     * @returns void
     */
    function setActiveKey(table: string = "lanes", col: string): void {
      activeCol.value = col;
    }

    /**
     * Color Scale
     * Paints td elements based on provided values
     */
    function colorScale(str: string, el: any) {
      if (!str) {
        return; // terminate early, terminate often
      }

      // 1 to 1 mapping with colors
      const scaleData = [
        "",
        "Strong Increase",
        "Moderate Increase",
        "Moderate Decrease",
        "Strong Decrease",
      ];

      const colors = ["", "#2d8d07", "#206504", "#800808", "#db0c0c"];
      const ordinalScale = d3_scaleOrdinal().domain(scaleData).range(colors);

      setTimeout(() => {
        d3_select(`#${el}`).style("background", () => {
          return ordinalScale(str) as string;
        });
      });
    }

    /**
     * Sorts current data by asc/desc columns.
     * @param key string
     * @param direction String
     * @returns void
     */
    function sort(key: string, direction: String): void {
      sortableData.value = sortArray(sortableData.value, key, direction);
    }

    /**
     * Sorts data based on the column clicked.
     * @param col string
     * @param direction: string
     * @returns void
     */
    function handleColClick(col: string, direction: string): void {
      sort(col, direction);
    }

    /**
     * Styles lane data table row.
     * @param row LaneResponse
     * @param column Column
     * @returns string
     */
    function rowStyler(row: LaneResponse, column: Column): string {
      const value = row[column.key as keyof LaneResponse];
      return value ? `valid ${column.key}_col` : `invalid ${column.key}`;
    }

    /**
     * Displays lane data in a table row.
     * @param row LaneResponse
     * @param column Column
     * @returns any
     */
    function rowDisplay(row: LaneResponse, column: Column): any {
      const accessor = column.key ? column.key : column;
      const value = row[accessor as keyof LaneResponse];

      return value ? tableValFormatter(column.type, value) : null;
    }

    function tableValFormatter(type: string, value: any): any {
      switch (type) {
        case "number":
          return Number(value).toFixed(3);
        case "percentage":
          return `${Number(value).toFixed(2)}%`;
        case "string":
          return value;
        default:
          return value;
      }
    }

    watch(
      () => sortableData.value,
      (newVal, oldVal) => {
        sortableData.value = newVal;
      },
      { deep: true }
    );

    // function sparkDataBuilder() {
    //   const data = [];

    //   for (let i = 0; i < 14; i++) {
    //     let obj = {
    //       x: i,
    //       y: Math.floor(Math.random() * (100 - 10)) + 10,
    //     };

    //     data.push(obj);
    //   }

    //   return data;
    // }

    onMounted(() => {
      // capacityData.forEach((data: any) => {
      //   data.spark_data = sparkDataBuilder();
      // });
    });

    return {
      addMarketToCall,
      buildMarketTable,
      capacityData,
      activeCol,
      rowStyler,
      sortableData,
      previewColumns,
      rowDisplay,
      handleColClick,
      markets,
      colorScale,
      handleSelectAll,
      isAllSelected,
      checkboxContainer,
      setActiveKey,
    };
  },
});
</script>

<style lang="scss">
@import "../styles/_global-utilities.scss";

.outer {
  width: 100%;

  .checkbox {
    left: 3px;
    padding: 0px;
    background: #5bbf6f;
    border-radius: 1px;
  }

  .list {
    max-width: 400px;
  }

  .checkbox-group input[type="checkbox"] {
    left: 0;
  }

  .checkbox-group input:checked ~ .checkbox svg {
    color: #000;

    width: 16px;
    height: 16px;
    position: absolute;
    top: 1px;
    left: 1px;
  }

  .label {
    font-size: 18px;
    margin-left: 2rem;
    font-weight: 300;
  }

  table {
    border-spacing: 0;
    margin-top: 30px;
  }

  .submit {
    padding: 12px 25px;
    font-size: 18px;
    background: #dab714;
    transition: 0.2s;
    color: #000;
    cursor: pointer;
    font-weight: bold;
    border: 0;
    &:hover {
      background: lighten(#dab714, 12%);
    }
  }

  .data-table-group .table-wrapper {
    .data-table thead th {
      font-weight: 600;
      font-size: 12px;
      width: auto;
      padding: 10px 18px;
      white-space: normal;
      vertical-align: middle;
      color: #fff;
      background: #0d1013;
      border: 1px solid #000;
    }

    td {
      background: #2d343d;
      border: 1px solid #000;
      padding: 0.85rem;
      font-size: 16px;
      text-align: center !important;
      color: #fff;
      div {
      }
    }

    .market_share_col {
      color: #b5bbc3;
    }
  }
}
</style>
