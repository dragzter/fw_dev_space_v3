<template>
  <div class="resize-observer" ref="observable" :data-dims="elDims"></div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onActivated,
  onDeactivated,
  onMounted,
  onUnmounted,
  onUpdated,
  ref,
  watch,
} from "vue";

export default defineComponent({
  emits: ["resize"],
  setup(props, { slots, emit }) {
    // Track element dimensions to determine resize events
    const elWidth = ref<Number>(0);
    const elHeight = ref<Number>(0);
    // Track mutation observer so we can deactivate it when its no longer needed
    const elObserver = ref<MutationObserver | null>(null);
    // Observable element reference
    const observable = ref<HTMLElement | null>(null);

    /**
     * When a resize event is detected, update tracked dims and emit resize event.
     * @returns void
     */
    function onResize(): void {
      updateDims();
      emit("resize", { width: elWidth.value, height: elHeight.value });
    }

    /**
     * Initialize the Mutation Observer.
     * @returns void
     */
    function initObserver() {
      // Tracking only attribute changes, this will react to data-dims updates are Rect boundaries are recalculated
      const config = { attributes: true };

      // Create Mutation Observer
      const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          // If the detected mutation is an attribute change, call resize event handler
          if (mutation.type === "attributes") {
            onResize();
          }
        });
      });

      // Bind Mutation Observer - track mutations as configured on the observable element
      observer.observe(observable.value as HTMLElement, config);
      // Track Mutation observer for disconnection later
      elObserver.value = observer;
    }

    /**
     * Update the tracked dimension values of the observed element.
     * @returns void
     */
    function updateDims(): void {
      const boxSize = (observable.value as HTMLElement).getBoundingClientRect();
      elWidth.value = boxSize.width;
      elHeight.value = boxSize.height;
    }

    /**
     * Computed attribute to track for triggering resize event.
     * @returns String
     */
    const elDims = computed((): String => {
      return `${elWidth.value} ${elHeight.value}`;
    });

    // When we mount a component, initialize the Mutation Observer and set initial element dims.
    onMounted(() => {
      if (observable.value) {
        updateDims();
        initObserver();
      }
    });

    // When unmounting, discard Mutation Observer.
    onUnmounted(() => {
      if (elObserver.value) elObserver.value.disconnect();
    });

    // For keep-alive components we want to update dims when reactived.
    onActivated(() => {
      updateDims();
    });

    // For keep-alive components, we want to discard Mutation Observer when deactivated.
    onDeactivated(() => {
      if (elObserver.value) elObserver.value.disconnect();
    });

    return { observable, elDims };
  },
});
</script>

<style lang="scss">
@import "../../styles/_global-utilities.scss";

.resize-observer {
  z-index: -999 !important;
  position: absolute;
  left: 0 !important;
  top: 0 !important;
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
}
</style>
