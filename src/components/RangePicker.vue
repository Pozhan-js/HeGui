<template>
  <el-date-picker
      :value="timeRangeValue"
      type="datetimerange"
      value-format="yyyy-MM-dd HH:mm:ss"
      range-separator="至"
      start-placeholder="开始日期"
      end-placeholder="结束日期"
      :picker-options="pickerOptions"
      :default-time="['00:00:00', '23:59:59']"
      v-bind="$attrs"
      v-on="$listeners"
      @input="onChange"
      @blur="$emit('el.form.blur')"
      @change="$emit('el.form.change')"
    />
</template>

<script>
import moment from 'moment'

export default {
  name: 'RangePicker',
  props: {
    sTime: [Date, String],
    eTime: [Date, String],
  },
  data() {
    return {
      pickerOptions: {
          shortcuts: [{
            text: '今天',
            onClick(picker) {
              const start = moment().startOf('day');
              const end = moment().endOf('day');
              picker.$emit('pick', [start.toDate(), end.toDate()]);
            }
          }, {
             text: '昨天',
            onClick(picker) {
              const start = moment().subtract(1, 'day').startOf('day');
              const end = moment().subtract(1, 'day').endOf('day');
              picker.$emit('pick', [start.toDate(), end.toDate()]);
            }
          }, {
            text: '近七天',
            onClick(picker) {
              const start = moment().subtract(7, 'day').startOf('day');
              const end = moment().endOf('day');
              picker.$emit('pick', [start.toDate(), end.toDate()]);
            }
          }, {
            text: '近30天',
            onClick(picker) {
               const start = moment().subtract(30, 'day').startOf('day');
              const end = moment().endOf('day');
              picker.$emit('pick', [start.toDate(), end.toDate()]);
            }
          }]
        },
    }
  },
  created() {
    this.$options.componentName = 'ElTimeSelect'
    this.initSTime = this.sTime
    this.initETime = this.eTime
    this.$on('fieldReset', (initialValue) => {
      if (initialValue != null) {
        this.onChange([this.initSTime, this.initETime])
      }
    });
  },
  computed: {
    timeRangeValue() {
      if (this.sTime && this.eTime) {
        return [this.sTime, this.eTime]
      }
      return null
    }
  },
  methods: {
    onChange(val) {
      // clear 时 val 为 null
      this.$emit('update:sTime', val?.[0])
      this.$emit('update:eTime', val?.[1])
    }
  }
}
</script>
