<template>
  <div class="spark-chart">
    <div
      class="chart"
      :class="[colorType, `chart-${id}`]"
      ref="sparkLine"
    ></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted, watch } from "vue";
import moment from "moment";
import { createUUID } from "../helpers";
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
  bisect,
  curveMonotoneX,
  color,
  DSVRowAny,
} from "d3";

export interface DataItem {
  x: String | Number;
  y: Number;
}

export default defineComponent({
  props: {
    sparkData: {
      type: Object as () => DataItem[],
      required: true,
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
    color: {
      type: String,
      default: "error",
    },
    showMouseTracker: {
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
    const id = createUUID();

    /**
     * Track data prop changes reactively
     */
    const data = computed((): object[] => {
      return props.sparkData ? props.sparkData : [];
    });

    const max = computed((): number => {
      return data.value ? (d3_max(data.value, (d: any) => d.y) as number) : 0;
    });

    // Creates the domain and range of the x-axis. (scale)
    const x = computed(() => {
      return d3_scaleLinear()
        .domain([0, DATA_COUNT])
        .range([0, INNER_WIDTH * 1.15]);
    });
    // Creates the domain and range of the y-axis. (scale)
    const y = computed(() => {
      return d3_scaleLinear()
        .domain([0, max.value + 0.25])
        .range([INNER_HEIGHT, 0]);
    });
    const sparkLine = ref<HTMLElement | null>(null);

    /**
     * Determines the color type of the data line
     */
    const colorType = computed(() => {
      return ["success", "error", "neutral", "warning"].includes(props.color)
        ? (props.color as any)
        : "error";
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

      // TRACKER
      const tracker = svg
        .append("g")
        .attr("class", "tracker")
        .style("opacity", 0);

      tracker.append("circle").attr("r", 3);

      const tooltip = d3_select(`.chart-${id}`)
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

      tooltip.append("div").attr("class", "tooltip-text").text("text!");

      svg
        .append("rect")
        .style("fill", "none")
        .style("stroke", "none")
        .style("pointer-events", "all")
        .attr("width", WIDTH)
        .attr("height", (HEIGHT as number) * 0.84)
        .attr("transform", "translate(-0.5, 0)")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout);

      // Shows line tracking data point circle when entering
      // position tracking area.
      function mouseover<MouseEvent>(): void {
        tracker.style("opacity", 1);
        tooltip.style("opacity", 1);
      }

      // Hides line tracking data point circle.
      function mouseout<MouseEvent>(): void {
        tracker.style("opacity", 0);
        tooltip.style("opacity", 0);
      }

      function mousemove<MouseEvent>(d: MouseEvent): void {
        if (tracker) {
          // Gets x values of the mouse when moving in the position tracking area.
          var x0 = d3_pointer(d)[0];
          // var x1 = x.value.invert(d3_pointer(d)[0]);
          const x1 = x.value.invert(x0);
          // Gets y values based on the x values of the mouse when moving in the position tracking area.
          const bisect = d3_bisector((d: any) => d.x).left;
          const i = bisect(data.value, x1);

          const d0: any = data.value[i];
          const d1 = Math.floor(x.value(d0.x));

          var y0 = y.value(d0.y);
          // Update line tracking data point circle with x and y values as mouse moves.
          tracker
            .select("circle")
            .attr("cx", d1)
            .attr("cy", y0 as number);

          tooltip
            .attr("style", "left:" + (d1 + 40) + "px;top:" + (y0 - 10) + "px;")
            .select(`.tooltip-text`)
            .text(d0.y);
        }
      }

      updateLines();
    });

    /**
     * Update sparkline
     */
    const updateLines = () => {
      // const line2 = d3_line()
      //   //.curve(curveMonotoneX)
      //   .x((d, i) => x.value(d.x) as number)
      //   .y((d) => y.value(d.y as any) as number);

      const line = d3_line()
        .curve(curveMonotoneX)
        .x((d: any) => x.value(d.x as number) as number)
        .y((d: any) => y.value(d.y as any) as number);

      d3_select(`.line-${id}`)
        .datum(data.value)
        .attr("d", line as any);
      // d3_select(`.line2-${id}`)
      //   .datum(data.value)
      //   .attr("d", line2 as any);
    };

    /**
     * Watches for sparkData value changes and updates the value svg element with new value string on change
     */
    watch(
      () => props.sparkData,
      (newValue, oldValue) => {
        updateLines();
      }
    );

    return { sparkLine, colorType, id };
  },
});
</script>

<style lang="scss">
@import "./src/styles/_global-utilities.scss";
body {
  position: relative;
}
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
    width: 100%;
    &.neutral {
      stroke: $system-color-100;

      .tracker {
        fill: $system-color-100;
      }
    }
    &.success {
      stroke: $success;
    }
    &.warning {
      stroke: $testwarning;
    }
    &.error {
      stroke: $error;
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

    .tooltip {
      fill: $system-color-100;
      stroke: lighten($system-color-100, 5%);
    }

    .t-text {
      font-size: 12px;
      stroke: #000;
      fill: #000;
    }

    .tracker {
      -webkit-transition: all 0.25s;
      -moz-transition: all 0.25s;
      -ms-transition: all 0.25s;
      -o-transition: all 0.25s;
      transition: all 0.25s;
    }
  }
}
.tooltip {
  width: 22px;
  padding: 1px;
  border: 1px solid #aaa;
  border-radius: 3px;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  position: absolute;
  background-color: #fff;
  font-size: 12px;
  z-index: 10;
  left: 0;
  pointer-events: none;
  -webkit-transition: all 0.25s;
  -moz-transition: all 0.25s;
  -ms-transition: all 0.25s;
  -o-transition: all 0.25s;
  transition: all 0.25s;
}

.tooltip div {
  margin: 1px 0;
  color: #000;
}
</style>
