<template>
  <el-select :value="value" v-bind="$attrs" @change="$emit('change', $event)">
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value"
      :disabled="item.disabled"
    />
  </el-select>
</template>

<script>
export default {
  name: 'ProSelect',
  props: {
    value: [String, Number],
    options: Array
  }
}
</script>
