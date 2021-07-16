<template>
  <div class="load-icon"></div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    active: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style lang="scss">
@import "./src/styles/_global-utilities.scss";

.load-icon {
  position: relative;
  height: 25px;
  width: 25px;
  display: inline-block;
  margin: 0px;
  position: relative;
  left: 0px;
  bottom: 0px;
  &:before,
  &:after {
    content: "";
    position: absolute;
    height: 100%;
    width: 100%;
    opacity: 0;
    border: 3px solid $brand-primary;
    border-radius: 40px;
    animation: pulsate 1.5s ease-out infinite;
    left: 0px;
    top: 0px;
    right: 0px;
    bottom: 0px;
    margin: auto;
    box-sizing: border-box;
  }
  &:after {
    animation-delay: -0.75s;
  }
  &.complete {
    display: none;
  }
}

@keyframes pulsate {
  0% {
    transform: scale(0.1, 0.1);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: scale(1, 1);
    opacity: 0;
  }
}
</style>
