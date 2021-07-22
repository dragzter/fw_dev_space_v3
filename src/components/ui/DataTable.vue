<template>
  <div class="data-table-group">
    <div class="table-wrapper">
      <table class="data-table" :class="classes">
        <thead>
          <th
            v-for="col in columns"
            class="clickable"
            :key="col.key"
            :class="{ active: activeCol === col.key }"
            @click="handleColClick(col.key)"
          >
            <div class="col-label">
              {{ col.label }}
              <div class="sort-arrows" v-if="sortable">
                <arrow
                  :type="
                    sortDirection == 'asc' && activeCol == col.key
                      ? 'up active'
                      : 'up'
                  "
                />
                <arrow
                  :type="
                    (sortDirection == 'desc' || !sortDirection) &&
                    activeCol == col.key
                      ? 'down active'
                      : 'down'
                  "
                />
              </div>
            </div>
          </th>
        </thead>
        <tbody v-if="rows.length > 0">
          <tr
            v-for="(row, rowIndex) in rows"
            :key="row"
            :class="{
              clickable: rowClickFunction,
              active: activeRow === rowIndex,
            }"
            @click="handleRowClick(row, rowIndex)"
          >
            <td
              :class="[styleFunction(row, col)].join(' ')"
              v-for="col in columns"
              :key="col.key"
              :id="`${col.key}_${rowIndex}`"
              :style="scaleFunction(row[col.key], `${col.key}_${rowIndex}`)"
            >
              <div v-if="col.key === 'score_last_14'">
                <sparkline
                  :sparkData="row.score_last_14"
                  :color="'success'"
                  :width="200"
                  :height="30"
                />
              </div>
              <div v-else>{{ displayFunction(row, col) }}</div>
              <template v-if="col.deps && displayFunction(row, col)">
                <div v-for="dep in col.deps" :key="dep">
                  {{ displayFunction(row, dep) }}
                </div>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="rows.length == 0" class="no-data-message">
      <load-icon v-if="isLoading"></load-icon>
      <div v-else>
        <h4>{{ title }}</h4>
        <p>{{ subtitle }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export interface Column {
  type: "date" | "number" | "string";
  key: string;
  label: string;
}
interface Detail<T> {
  value: T;
  is_valid: boolean;
  message: string;
}
import { defineComponent, ref, computed, watch, PropType } from "vue";
import LoadIcon from "./LoadIcon.vue";
import SparkChart from "./SparkChart.vue";
import Sparkline from "./Sparkline.vue";

import Arrow from "./Arrow.vue";
export interface Column {
  type: "date" | "number" | "string";
  key: string;
  label: string;
  dep?: {};
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
  props: {
    scaleFunction: {
      type: Function,
      required: false,
    },
    title: {
      type: String,
      required: false,
      default: "",
    },
    subtitle: {
      type: String,
      required: false,
      default: "",
    },
    table: String,
    isLoading: Boolean,
    fixed: {
      type: Boolean,
      default: false,
    },
    isRowActive: {
      type: Boolean,
      default: false,
    },
    sortable: Boolean,
    activeCol: {
      type: String,
      required: false,
    },
    rows: {
      type: Array as () => { [key: string]: any }[],
    },
    columns: {
      type: Array as () => Column[],
    },
    styleFunction: {
      type: Function as PropType<(a: any, b: any) => string>,
      default: () => "",
    },
    displayFunction: {
      type: Function as PropType<(a: any) => any>,
      default: (row: LaneResponse, col: Column) =>
        row[col.key as keyof LaneResponse],
    },
    rowClickFunction: {
      type: Function as PropType<(a: any) => any>,
    },
    colClickFunction: {
      type: Function as PropType<(a: string, b: string) => any>,
      default: () => "",
    },
    setActiveKey: {
      type: Function as PropType<(a: string, b: string) => any>,
      default: () => "",
    },
  },
  setup(props, ctx) {
    const activeRow = ref<Number | null>(null);

    // Direction of the arrow.
    const sortDirection = ref<string | null>(null);

    /**
     * Compute classes for the data table.
     * @returns String
     */
    const classes = computed((): String => {
      let _classes: string[] = [];
      if (props.fixed) _classes.push("fixed");
      return _classes.join(" ").trim();
    });

    /**
     * Data table title.
     * @returns String
     */
    const title = computed((): String => props.title);

    /**
     * Data table subtitle.
     * @returns String
     */
    const subtitle = computed((): String => props.subtitle);

    /**
     * Handles setting the column sort and arrow active class.
     * @param col string
     * @returns Promise<void>
     */
    async function handleColClick(col: string): Promise<void> {
      await props.setActiveKey(props.table as string, col);

      if (!sortDirection.value) {
        sortDirection.value = "desc";
      } else if (sortDirection.value === "asc") {
        sortDirection.value = "desc";
      } else if (sortDirection.value === "desc") {
        sortDirection.value = "asc";
      }

      props.colClickFunction(col, sortDirection.value);
    }

    /**
     * Handles setting the active row.
     * @param row any
     * @param rowIndex Number
     * @returns void
     */
    function handleRowClick(row: any, rowIndex: Number): void {
      if (props.rowClickFunction) {
        if (activeRow.value === rowIndex) {
          props.rowClickFunction(null);
          activeRow.value = null;
        } else {
          props.rowClickFunction(row);
          activeRow.value = rowIndex;
        }
      }
    }

    // If rows change, set no active row.
    watch(
      () => props.rows,
      (newVal, oldVal) => {
        if (newVal?.length !== oldVal?.length) {
          activeRow.value = null;
        }
      },
      { deep: true }
    );

    // Reset direction when the selected column key changes.
    watch(
      () => props.activeCol,
      (newVal, oldVal) => {
        if (newVal !== oldVal) {
          sortDirection.value = null;
        }
      },
      { deep: true }
    );

    // For active rows, check if they are no longer active in the parent.
    watch(
      () => props.isRowActive,
      (newVal, oldVal) => {
        if (!newVal) {
          activeRow.value = null;
        }
      },
      { deep: true }
    );

    return {
      activeRow,
      classes,
      sortDirection,
      handleRowClick,
      handleColClick,
      title,
      subtitle,
    };
  },
  components: {
    LoadIcon,
    Arrow,
    SparkChart,
    Sparkline,
  },
});
</script>

<style lang="scss">
@import "./src/styles/_global-utilities.scss";
.data-table-group {
  position: relative;
  height: 100%;
  width: 100%;
  .clickable {
    @include clickable;
  }
  .table-wrapper {
    overflow-x: auto;
    width: 100%;
    box-sizing: border-box;
    color: $system-color;
    height: 100%;
    .data-table {
      &.fixed {
        table-layout: fixed;
      }
      white-space: nowrap;
      width: 100%;
      height: auto;
      max-height: 100%;
      thead {
        th {
          font-weight: bold;
          height: calc(1em + (2 * #{$spacing-3}));
          color: $system-color;
          position: -webkit-sticky;
          position: sticky;
          top: 0px;
          z-index: 100;
          background: $system-color-500;
          border-bottom: 2px solid $system-color-300;
          &.active {
            background: $system-color-700;
          }
          .col-label {
            @extend .flex, .align-center;
            justify-content: flex-start;
            .sort-arrows {
              margin-left: 5px;
              .arrow:nth-of-type(1) {
                margin-bottom: 7.5px;
              }
              .arrow:nth-of-type(2) {
                margin-top: 7.5px;
              }
            }
          }
        }
      }
      tbody {
        tr {
          height: calc(1em + (2 * #{$spacing-3}));
          &.active {
            background: rgba(0, 0, 0, 0.25);
          }
          &:hover {
            background: $system-color-300;
          }
          td {
            text-transform: capitalize;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            &.invalid {
              position: relative;
              // style invalid data here
              &:after {
                content: "";
                display: inline-block;
                box-sizing: border-box;
                position: absolute;
                background-color: transparentize($color: $error, $amount: 0.95);
                border: 1px solid $error;
                width: 100%;
                top: 0;
                height: 100%;
                left: 0;
              }
            }
          }
        }
      }
      th,
      td {
        text-align: left;
        padding: $spacing-1 $spacing-2;
        vertical-align: middle;
        height: 20px;
      }
    }
  }
  .no-data-message {
    @extend .flex, .justify-center, .align-center;
    width: 100%;
    min-height: 91px;
    text-align: center;
    color: $system-color-100;
    padding: $spacing-5 0;
    line-height: 1.5em;
    font-weight: bold;
    height: 100%;
    box-sizing: border-box;
    position: absolute;
    left: 0;
    top: 0;
    p {
      font-weight: normal;
    }
    .load-icon {
      width: 50px;
      height: 50px;
    }
  }
}
</style>
