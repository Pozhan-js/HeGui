<template>
  <el-input
    v-bind="$attrs"
    :value="value"
    @input="onInput"
    @change="onChange"
  />
</template>

<script>
export default {
  name: 'NoneNullInput',
  props: ['value', 'valueType'],
  methods: {
    // 格式化值
    formatValue(v) {
      let newValue;
      switch (this.valueType) {
        case 'number':
          newValue = v.replace(/[^\d]/g, '')
          break
        default:
          newValue = v
      }
      if (newValue.length === 0) {
        return undefined
      }
      return newValue
    },
    onInput(v) {
      this.$emit('input', this.formatValue(v))
    },
    onChange(v) {
      this.$emit('change', this.formatValue(v))
    }
  }
}
</script>
