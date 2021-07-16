<template>
  <div class="checkbox-group">
    <div class="label">
      <input
        type="checkbox"
        :checked="checked"
        @input.prevent="inputFunction"
      />
      <span class="checkbox">
        <span class="icon-bg"></span>
        <font-awesome-icon class="icon" icon="check-square" />
      </span>
      {{ label }}
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    label: {
      type: String,
      required: true,
    },
    checked: {
      type: Boolean,
      required: true,
      default: false,
    },
    inputFunction: {
      type: Function,
      required: true,
      default: () => "",
    },
  },
});
</script>

<style lang="scss">
@import "../../styles/_global-utilities.scss";
.checkbox-group {
  @include checkbox-style();
}
</style>
