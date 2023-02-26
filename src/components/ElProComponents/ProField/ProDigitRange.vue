<template>
  <el-row>
    <el-col :span="11">
      <el-input-number
        :value="number_0"
        :controls="false"
        v-bind="$attrs"
        style="width: 100%"
        @input="handleInput($event, 0)"
        @change="handleChange"
      />
    </el-col>
    <el-col :offset="1" :span="1" class="text-center" style="transform: translateX(-50%);">—</el-col>
    <el-col :span="11">
      <el-input-number
        :value="number_1"
        :controls="false"
        v-bind="$attrs"
        style="width: 100%"
        @input="handleInput($event, 1)"
        @change="handleChange"
      />
    </el-col>
  </el-row>
</template>

<script>
export default {
  name: 'ProDigitRange',
  inheritAttrs: false,
  props: {
    value: Array
  },
  data: (vm) => ({
    number_0: vm.value?.[0],
    number_1: vm.value?.[1]
  }),
  watch: {
    value(newVal) {
      this.number_0 = newVal?.[0]
      this.number_1 = newVal?.[1]
    }
  },
  methods: {
    handleInput(val, i) {
      this['number_' + i] = val
    },
    handleChange() {
      this.$emit('change', [this.number_0, this.number_1])
    }
  }
}
</script>
