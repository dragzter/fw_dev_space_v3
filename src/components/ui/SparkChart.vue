<template>
  <div :class="classes" class="spark-chart">
    <!-- <h6 :class="cssClasses" v-if="metricType" class="title subtitle">
      {{ title }}
    </h6> -->
    <component :is="!hideTooltip ? 'tooltip' : 'v-fragment'">
      <div class="chart" :class="colorType" ref="sparkLine"></div>
      <!-- <template v-slot:popup v-if="dataValue && !hideTooltip">
        <p class="value-text">
          <span class="date" v-if="dataValue.date">{{ dataValue.date }} - </span
          ><span
            class="value"
            v-if="dataValue.value"
            :class="dataValue.direction"
            >{{ dataValue.value }}</span
          >
        </p>
      </template> -->
    </component>
    <!-- <h6 v-if="!metricType" class="title subtitle">{{ title }}</h6> -->
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  ref,
  computed,
  Component,
  watch,
} from "vue";
import {
  line as d3_line,
  range as d3_range,
  select as d3_select,
  selectAll as d3_selectAll,
  bisector as d3_bisector,
  //@ts-ignore
  pointer as d3_pointer,
  scaleLinear as d3_scaleLinear,
  curveCatmullRom,
  curveBasis,
  max as d3_max,
  color,
} from "d3";
//import Tooltip from "/@/components/ui_elements/Tooltip.vue";
import moment from "moment";
import { createUUID } from "../helpers";

export interface DataItem {
  x: String | Number;
  y: Number;
}

export interface GaugeData<T> {
  min?: T | null;
  max?: T | null;
  value?: T | null;
  valueRange?: T[] | null;
  titles?: string[] | null;
}

export default defineComponent({
  props: {
    sparkData: {
      type: Object as () => DataItem[],
      required: true,
    },
    showMouseTracker: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: "error",
    },
    metricType: {
      type: String,
      default: null,
    },
    title: {
      type: String,
      default: "Price Trend (12 mo)",
    },
    width: {
      type: Number,
      default: 100,
      required: false,
    },
    cssClasses: {
      type: String,
      required: false,
    },
    height: {
      type: Number,
      default: 13,
      required: false,
    },
    hideTooltip: {
      required: false,
      default: false,
      type: Boolean,
    },
    gaugeData: {
      type: Object as () => GaugeData<number>,
      default: 0,
      required: false,
    },
    showValue: {
      required: false,
      type: Boolean,
      default: false,
    },
  },
  setup(props, ctx) {
    const WIDTH = props.width;
    const HEIGHT = props.height;
    const MARGIN = { top: 0, right: 5, bottom: 0, left: 0 };
    const INNER_WIDTH = (WIDTH as number) - MARGIN.left - MARGIN.right;
    const INNER_HEIGHT = (HEIGHT as number) - MARGIN.top - MARGIN.bottom;
    const DATA_COUNT = props.sparkData ? props.sparkData.length : 0;
    const VAL_SIZE = props.metricType === "network-lane" ? "18px" : "13px";
    const TEXT_POS_X =
      props.metricType === "network-lane" ? -19 : (WIDTH as number) * 1.25;
    const TEXT_POS_Y =
      props.metricType === "network-lane" ? 14 : (HEIGHT as number) / 1.5;
    const id = createUUID();

    const dataValue = ref<{
      date: String;
      value: String;
      direction: String;
    } | null>();

    /**
     * Track data prop changes reactively
     */
    const data = computed((): number[] => {
      return props.sparkData
        ? (props.sparkData.map((v: DataItem) => v.y) as number[])
        : [];
    });

    const max = computed((): number => {
      return data.value ? (d3_max<number>(data.value) as number) : 0;
    });

    // Creates the domain and range of the x-axis.
    const x = computed(() => {
      return d3_scaleLinear()
        .domain([0, DATA_COUNT])
        .range([0, INNER_WIDTH * 1.15]);
    });
    // Creates the domain and range of the y-axis.
    const y = computed(() => {
      return d3_scaleLinear()
        .domain([0, max.value + 0.25])
        .range([INNER_HEIGHT, 0]);
    });
    const sparkLine = ref<HTMLElement | null>(null);

    /**
     * Computed properties
     * Create a list of css classes
     */
    const classes = computed(() => {
      let _classes = [] as String[];
      props.metricType ? _classes.push(`type-${props.metricType}`) : null;
      props.cssClasses ? _classes.push(`${props.cssClasses}`) : null;
      return _classes.join(" ").trim();
    });

    /**
     * Determines the color type of the data line
     */
    const colorType = computed(() => {
      return ["success", "error", "neutral", "warning"].includes(props.color)
        ? (props.color as any)
        : "error";
    });

    // Get gague value to append to SVG object
    const gaugeValue = computed(() => {
      return props.gaugeData ? props.gaugeData.value : 0;
    });

    // On mount, create the graph.
    onMounted((): void => {
      // Main line chart
      const svg = d3_select(sparkLine.value)
        .append("svg")
        .attr("width", WIDTH as number)
        .attr("height", HEIGHT as number)
        .append("g")
        .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

      //Container for the svg defs (gradients).
      var defs = svg.append("defs");

      // Add def: filter - for the under glow effect.
      var filter = defs.append("filter").attr("id", "under-glow");

      // SVG gaussian blur added.
      filter
        .append("feGaussianBlur")
        .attr("stdDeviation", "2")
        .attr("result", "coloredBlur");
      // Merge source graphic on top of blurred layer.

      var feMerge = filter.append("feMerge");
      feMerge.append("feMergeNode").attr("in", "coloredBlur");
      feMerge.append("feMergeNode").attr("in", "SourceGraphic");

      // Background line with applied underglow filter.
      svg
        .append("path")
        .attr("class", `line2-${id}`)
        .attr("fill", "none")
        .attr("stroke-width", 1)
        .style("filter", "url(#under-glow)");

      // Main line.
      svg
        .append("path")
        .attr("class", `line-${id}`)
        .attr("fill", "none")
        .attr("stroke-width", 2);

      if (props.showMouseTracker) {
        // Line tracking data point circle.
        const circle = svg
          .append("g")
          .attr("class", "tracker")
          .append("circle")
          .attr("r", 3)
          .style("opacity", 0);

        // Mouse position tracking area.
        svg
          .append("rect")
          .style("fill", "none")
          .style("stroke", "none")
          .style("pointer-events", "all")
          .attr("width", props.showValue ? WIDTH * 0.6 : WIDTH * 0.89)
          .attr("height", (HEIGHT as number) * 0.84)
          .attr("transform", "translate(-0.5, 0)")
          .on("mouseover", mouseover)
          .on("mousemove", mousemove)
          .on("mouseout", mouseout);
        // Shows line tracking data point circle when entering
        // position tracking area.
        function mouseover<MouseEvent>(): void {
          circle.style("opacity", 1);
        }

        // Hides line tracking data point circle and resets tooltip dataValue
        // when leaving position tracking area.
        function mouseout<MouseEvent>(): void {
          circle.style("opacity", 0);
          dataValue.value = null;
        }

        // Get coordinates we need to update data point.
        function mousemove<MouseEvent>(d: MouseEvent): void {
          if (circle) {
            // Gets x values of the mouse when moving in the position tracking area.
            var x0 = d3_pointer(d)[0];
            var x1 = x.value.invert(d3_pointer(d)[0]);
            // Gets y values based on the x values of the mouse when moving in the position tracking area.
            var y0 = y.value(
              data.value[Math.floor(x1)]
                ? data.value[Math.floor(x1)]
                : data.value[0]
            );
            // Update line tracking data point circle with x and y values as mouse moves.
            circle.attr("cx", x.value(x1) as number).attr("cy", y0 as number);
            // Prevents trying to access any x value below 0 (aka negative or decimal point).
            if (x0 >= 0) {
              const selectedValue: DataItem[] = props.sparkData.filter(
                (b) => b.y === data.value[Math.floor(x1)]
              );
              // Update tooltip dataValue with current value properties.
              dataValue.value = {
                date: moment(
                  selectedValue[0] && selectedValue[0].x
                    ? selectedValue[0].x.toString()
                    : null
                ).format("M/YYYY"),
                value: `$${selectedValue[0].y.toFixed(2)}`,
                direction: selectedValue[0].y >= 0 ? "up" : "down",
              };
            }
          }
        }
      }
      if (props.showValue) {
        svg
          .append("text")
          .attr("id", "sparkValue")
          .attr("class", `sparkValue-${id}`)
          .attr("x", TEXT_POS_X)
          .attr("y", TEXT_POS_Y)
          .attr("font-size", VAL_SIZE)
          .attr("alignment-baseline", "center")
          .attr("text-anchor", "middle")
          .attr("font-weight", "bold");
      }
      updateValue();
      updateLines();
    });

    /**
     * Updates the value element text to reflect the current value
     */
    const updateValue = () => {
      d3_select(`.sparkValue-${id}`).text(gaugeValue.value as any);
    };

    /**
     *
     */
    const updateLines = () => {
      // Line chart lines using x and y values.

      /**
       * TODO: make interpolation type dynamic and unique based on chart.  Use CONFIG in LANECONFIGS
       */

      const line2 = d3_line()
        .curve(curveBasis)
        .x((d, i) => x.value(i as number) as number)
        .y((d) => y.value(d as any) as number);

      const line = d3_line()
        .curve(curveBasis)
        .x((d, i) => x.value(i as number) as number)
        .y((d) => y.value(d as any) as number);

      d3_select(`.line-${id}`)
        .datum(data.value)
        .attr("d", line as any);
      d3_select(`.line2-${id}`)
        .datum(data.value)
        .attr("d", line2 as any);
    };

    /**
     * Watches for gaugeData value changes and updates the value svg element with new value string on change
     */
    watch(
      () => props.gaugeData,
      (newValue, oldValue) => {
        updateValue();
        updateLines();
      }
    );

    return { sparkLine, colorType, dataValue, classes, id };
  },
  components: {
    //Tooltip,
  },
});
</script>

<style lang="scss">
@import "./src/styles/_global-utilities.scss";

.spark-chart {
  @extend .flex, .col, .justify-center, .align-center, .gutter-1;
  & > v-fragment {
    width: 100%;
  }
  .chart {
    height: calc(#{$h6} - #{$spacing-1});
    position: relative;
    background: transparent;
    margin-top: 5px;
    &.neutral {
      stroke: $system-color-100;

      .tracker {
        fill: $system-color-100;
      }
    }
    &.success {
      stroke: $success;

      .tracker {
        fill: $success;
      }
    }
    &.warning {
      stroke: $testwarning;
      .tracker {
        fill: $testwarning;
      }
    }
    &.error {
      stroke: $error;

      .tracker {
        fill: $error;
      }
    }

    #sparkValue {
      stroke: transparent;
      fill: $white;
      font-weight: normal;
    }

    & > svg {
      position: absolute;
      left: 0;
      right: 0;
      margin: auto;
      bottom: 0px;
      top: 0px;
      overflow: visible;
    }
  }

  &.type-network .chart > svg {
    left: auto;
    right: 28px;
    margin: 0;
  }

  &.type-network,
  &.type-list {
    &.spark-chart {
      margin-left: auto;

      &.price-history .chart > svg {
        top: 5px;
      }
    }

    h6.title.subtitle {
      font-size: 12px;
      margin: 5.5px 7.5px 2px;
    }
  }

  .tracker {
    fill: $success;
  }
  & + .tooltip-popup {
    .value-text {
      .date {
        font-weight: bold;
      }
      .value {
        font-weight: bold;
        &.up {
          color: $success;
        }
        &.down {
          color: $error;
        }
      }
    }
  }
}
.subtitle {
  font-weight: 500;
  color: $system-color-100;
  white-space: nowrap;
}

.data-circle-point {
  opacity: 1;
  &:hover {
    opacity: 1;
  }
}
</style>
