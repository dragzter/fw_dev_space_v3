<template>
  <div
    class="fixed-top"
    v-if="showFixedTop"
    :class="isOverflowing ? 'overflow' : ''"
  >
    <slot name="fixed-top"></slot>
  </div>
  <ul
    class="list scrollable-list"
    :class="classes"
    :style="styles"
    ref="scrollableList"
  >
    <!-- 
    Resize observer used to test for element overflow on scrollable list 
    to assist with padding corrections from scrollbars 
    -->
    <resize-observer @resize="resized" />
    <!-- Slot in scrollable content -->
    <slot></slot>
  </ul>
  <!-- </div> -->
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onActivated,
  onMounted,
  ref,
  onUpdated,
} from "vue";
import ResizeObserver from "./ResizeObserver.vue";

export default defineComponent({
  emits: ["overflowChange"],
  props: {
    classes: {
      type: Array as () => String[],
      default: [],
    },
    styles: {
      type: Object,
    },
  },
  setup(props, ctx) {
    // Track element reference.
    const scrollableList = ref<HTMLElement | null>(null);
    // Tracks element overflow state.
    const isOverflowing = ref<boolean>(false);

    /**
     * Check if elements are overflowing parent bounds
     * and update isOverflowing state boolean to reflect results.
     * @returns void
     */
    function updateIsOverflowing(): void {
      if (scrollableList.value) {
        // Determine if styling allows overflow.
        var curOverflow = scrollableList.value.style.overflow;
        // Hide overflow if scrolling style is not specifically set
        // then we can determine if elements exceed bounds.
        if (!curOverflow || curOverflow === "visible")
          scrollableList.value.style.overflow = "hidden";
        // Check content overflowing by checking if client dims are less than scroll dim values.
        var overflowing =
          scrollableList.value.clientWidth < scrollableList.value.scrollWidth ||
          scrollableList.value.clientHeight < scrollableList.value.scrollHeight;
        // Restore scroll styling state to allow for scrolling again if needed.
        scrollableList.value.style.overflow = curOverflow;
        // Set isOverlowing to overflow boolean.
        isOverflowing.value = overflowing;
      } else {
        // No element to test, default to false.
        isOverflowing.value = false;
      }
      ctx.emit("overflowChange", isOverflowing.value);
    }

    /**
     * Compute the scrollable list class list.
     * @returns String
     */
    const classes = computed((): String => {
      let _classes = [] as String[];
      if (isOverflowing.value) _classes.push("overflow");
      props.classes.map((c) => {
        _classes.push(c);
      });
      return _classes.join(" ").trim();
    });

    /**
     * On resize event detected from ResizeObserver, update isOverflowing state again.
     * @param e any
     * @returns void
     */
    function resized(e: any): void {
      updateIsOverflowing();
    }

    // If list values change, check element overflow state.
    onUpdated(() => {
      updateIsOverflowing();
    });

    // On mount, check element overflow state.
    onMounted(() => {
      updateIsOverflowing();
    });

    // When compoenent is keep-alive, check overflow state on Activation.
    onActivated(() => {
      updateIsOverflowing();
    });
    /**
     * Determines if the fixed-top slot is populated
     *
     * @return Boolean - Slot is populated
     */
    const showFixedTop = computed(() => {
      return ctx.slots["fixed-top"];
    });

    return {
      classes,
      resized,
      isOverflowing,
      scrollableList,
      showFixedTop,
    };
  },
  components: {
    ResizeObserver,
  },
});
</script>

<style lang="scss">
@import "../../styles/_global-utilities.scss";

.fixed-top {
  margin-right: calc((2 * #{$spacing-5}) + 5px);
  &:not(.overflow) {
    margin-right: $spacing-5;
  }
}
.scrollable-list {
  height: 100%;
  overflow: hidden;
  overflow-y: auto;
  position: relative;
  padding-bottom: 10px;
  &.compact {
    @include compact-scrollbars;
  }
}
.data-sets:not(.summarize) .scrollable-list:not(.overflow) {
  .lane-data-group {
    margin-right: $spacing-5;
  }
}
</style>
