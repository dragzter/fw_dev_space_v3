<template>
  <div class="widget-canvas">
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Container from "./components/Container.vue";

export default defineComponent({
  name: "App",
  components: {
    Container,
  },
});
</script>

<style lang="scss">
@import "./styles/_global-utilities.scss";

body {
  background: #222235;

  .widget-canvas {
    max-width: 1434px;
    margin: auto;
    width: 100%;
    height: 100%;
  }

  ul {
    padding-left: 0;
  }
  p,
  h1,
  h6,
  h4,
  h3,
  h2,
  h5,
  li,
  a,
  span,
  .label {
    color: #e4eaff;
  }

  h6 {
    margin-bottom: $spacing-6h;
  }
  li {
    list-style: none;
  }
}
</style>
