<template>
  <div class="arrow" :class="type"></div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    type: {
      type: String,
      default: "up",
    },
  },
});
</script>

<style lang="scss">
@import "./src/styles/_global-utilities.scss";

.arrow {
  $main-axis-size: 0.37em;
  $off-axis-size: 0.37em;
  width: $main-axis-size;
  height: $off-axis-size;
  position: relative;
  &:before,
  &:after {
    position: absolute;
    left: 0;
    top: 0;
    width: 0;
    height: 0;
    content: "";
    display: inline-block;
    border-radius: $border-radius-small;
  }
  &.up {
    &:before,
    &:after {
      border-left: $off-axis-size solid transparent !important;
      border-right: $off-axis-size solid transparent !important;
      border-bottom: $main-axis-size solid $system-color-100;
    }
  }
  &.down {
    &:before,
    &:after {
      border-left: $off-axis-size solid transparent !important;
      border-right: $off-axis-size solid transparent !important;
      border-top: $main-axis-size solid $system-color-100;
    }
  }
  &.right {
    &:before,
    &:after {
      border-top: $off-axis-size solid transparent !important;
      border-bottom: $off-axis-size solid transparent !important;
      border-left: $main-axis-size solid $system-color-100;
    }
  }
  &.left {
    &:before,
    &:after {
      border-top: $off-axis-size solid transparent !important;
      border-bottom: $off-axis-size solid transparent !important;
      border-right: $main-axis-size solid $system-color-100;
    }
  }
  &.success {
    &:before,
    &:after {
      border-color: $success;
    }
  }
  &.error {
    &:before,
    &:after {
      border-color: $error;
    }
  }
  &.active {
    &:before,
    &:after {
      border-color: $brand-primary;
    }
  }
  &:after {
    //filter: blur(3px);
    opacity: 0.65;
  }
}
</style>
