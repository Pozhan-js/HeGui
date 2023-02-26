<template>
  <el-form-item
    :label="label"
    :prop="propName"
    v-bind="formItemProps"
  >
    <component
      :is="curComponent.name"
      :value="value"
      :value-type="valueType"
      :options="options"
      style="width: 100%"
      @change="$emit('input', $event)"
      v-bind="curComponent.props"
      v-on="$listeners"
    />
  </el-form-item>
</template>

<script>
import DictSelect from '@/components/DictSelect'
import ProDigitRange from '../ProField/ProDigitRange'
import ProCombine from '../ProField/ProCombine'
import ProSelect from '../ProField/ProSelect'
import { Cascader } from 'ant-design-vue'
import moment from 'moment'

const getValueTypeEnum = () => ({
  treeSelect: {
    name: 'cascader',
    props: { placeholder: '请选择', allowClear: true, changeOnSelect: true, fieldNames: { value: 'id', label: 'label', children: 'children' }, expandTrigger: 'hover' }
  },
  text: {
    name: 'el-input',
    props: { placeholder: '请输入' }
  },
  money: {
    name: 'el-input-number',
    props: { placeholder: '请输入' }
  },
  moneyRange: {
    name: 'pro-digit-range',
    props: { placeholder: '请输入' }
  },
  digitRange: {
    name: 'pro-digit-range',
    props: { placeholder: '请输入' }
  },
  select: {
    name: 'pro-select',
    props: { placeholder: '请选择', filterable: true }
  },
  dictSelect: {
    name: 'dict-select',
    props: { placeholder: '请选择', filterable: true }
  },
  timeRange: {
    name: 'el-time-picker',
    props: { isRange: true, startPlaceholder: '开始时间', endPlaceholder: '结束时间', valueFormat: 'HH:mm:ss', showShortcuts: false }
  },
  dateRange: {
    name: 'el-date-picker',
    props: { type: 'daterange', startPlaceholder: '开始日期', endPlaceholder: '结束日期', valueFormat: 'yyyy-MM-dd', showShortcuts: false }
  },
  dateTimeRange: {
    name: 'el-date-picker',
    props: { type: 'datetimerange', startPlaceholder: '开始时间', endPlaceholder: '结束时间', valueFormat: 'yyyy-MM-dd HH:mm:ss', defaultTime: ['00:00:00', '23:59:59'], showShortcuts: true }
  },
  dateMonth: {
    name: 'el-date-picker',
    props: { type: 'month', placeholder: '请选择', valueFormat: 'yyyy-MM' }
  },
  dateTime: {
    name: 'el-date-picker',
    props: { type: 'datetime', placeholder: '请选择', valueFormat: 'yyyy-MM-dd HH:mm:ss' }
  }
})

export default {
  components: {
    DictSelect,
    ProDigitRange,
    ProCombine,
    ProSelect,
    Cascader
  },
  inheritAttrs: false,
  props: {
    value: [String, Number, Array, Date, Object],
    valueType: String,
    propName: String,
    formItemProps: Object,
    fieldProps: Object,
    label: String,
    options: Array,
    combineOptions: Array
  },
  computed: {
    curComponent() {
      const comp = getValueTypeEnum()[this.valueType]
      if (!comp) {
        throw new Error(JSON.stringify(this.$props))
      }
      if (comp.props.showShortcuts) {
        comp.props.pickerOptions = this.getPickerOptions()
      }
      if (comp.props.placeholder) {
        comp.props.placeholder += this.label
      }
      if (this.combineOptions) {
        comp.props.insideName = comp.name
        comp.props.combineOptions = this.combineOptions
        comp.name = 'pro-combine'
      }

      comp.props = {
        clearable: true,
        ...comp.props,
        ...this.fieldProps
      }
      return comp
    }
  },
  methods: {
    getPickerOptions() {
      return {
        shortcuts: [
          {
            text: '今天',
            onClick(picker) {
              const start = moment().startOf('day')
              const end = moment().endOf('day')
              picker.$emit('pick', [start.toDate(), end.toDate()])
            }
          },
          {
            text: '昨天',
            onClick(picker) {
              const start = moment().subtract(1, 'day').startOf('day')
              const end = moment().subtract(1, 'day').endOf('day')
              picker.$emit('pick', [start.toDate(), end.toDate()])
            }
          },
          {
            text: '近七天',
            onClick(picker) {
              const start = moment().subtract(7, 'day').startOf('day')
              const end = moment().endOf('day')
              picker.$emit('pick', [start.toDate(), end.toDate()])
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const start = moment().subtract(30, 'day').startOf('day')
              const end = moment().endOf('day')
              picker.$emit('pick', [start.toDate(), end.toDate()])
            }
          }
        ]
      }
    }
  }
}
</script>
