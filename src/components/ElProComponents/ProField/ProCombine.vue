<template>
  <el-input
    v-if="valueType === 'text'"
    v-model="vals"
    v-bind="$attrs"
    :placeholder="placeholderText"
    class="input-with-select"
  >
    <el-select
      slot="prepend"
      v-model="keys"
      clearable
      filterable
      style="width: 100%"
    >
      <el-option
        v-for="option in combineOptions"
        :key="option.label"
        :label="option.label"
        :value="option.value"
      />
    </el-select>
  </el-input>
  <el-row v-else>
    <el-col :span="8">
      <el-select
        v-model="keys"
        clearable
        filterable
        style="width: 100%"
      >
        <el-option
          v-for="option in combineOptions"
          :key="option.label"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
    </el-col>
    <el-col :span="16">
      <component
        :is="insideName"
        v-model="vals"
        v-bind="$attrs"
        :placeholder="placeholderText"
        style="width: 100%"
      />
    </el-col>
  </el-row>
</template>

<script>
import moment from 'moment'
import Decimal from 'decimal.js'

export default {
  name: 'ProCombine',
  inheritAttrs: false,
  props: {
    value: [String, Number, Array, Object],
    valueType: String,
    insideName: String,
    combineOptions: Array
  },
  data: () => ({
    keys: undefined,
    vals: undefined
  }),
  computed: {
    placeholderText() {
      const label = this.combineOptions.find(i => i.value === this.keys)?.label ?? ''
      if (this.valueType === 'text') {
        return `请输入${label}`
      } else {
        return `请选择${label}`
      }
    }
  },
  watch: {
    value(newVal) {
      if (newVal === void 0) {
        this.keys = void 0
        this.vals = void 0
      }
    },
    keys(newV) {
      this.handleChange(newV, this.vals)
    },
    vals(newV) {
      this.handleChange(this.keys, newV)
    }
  },
  methods: {
    handleChange(keys, vals) {
      if (typeof keys === 'string') {
        this.$emit('change', {
          [keys]: vals
        })
      } else {
        const obj = {}
        const value = this.getValueArray(vals)
        keys?.forEach((key, i) => {
          obj[key] = value?.[i]
        })
        this.$emit('change', obj)
      }
    },
    getValueArray(vals) {
      if (!vals) {
        return vals
      }
      const mul100 = (v) => typeof v === 'undefined' ? undefined : new Decimal(v).mul(100).toNumber()

      switch (this.valueType) {
        case 'dateRange':
          return [moment(vals[0]).startOf('day').format('yyyy-MM-DD HH:mm:ss'), moment(vals[1]).startOf('day').format('yyyy-MM-DD HH:mm:ss')]
        case 'moneyRange':
          return [mul100(vals[0]), mul100(vals[1])]
        default:
          return vals
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .input-with-select {
    /deep/ .el-input-group__prepend {
      width: 45%;
      padding: 0;
      background-color: #fff;
      .el-select {
        margin-left: 0;
      }
    }
  }
</style>
