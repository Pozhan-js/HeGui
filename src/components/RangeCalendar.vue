<template>
  <el-date-picker
    :value="value"
    :editable="false"
    :clearable="false"
    v-bind="$attrs"
    :format="timeType === '3' ? 'yyyy 第 WW 周' : undefined"
    :type="{
      1: 'date',
      2: 'month',
      3: 'week',
    }[timeType]"
    placeholder="请选择时间"
    v-on="$listeners"
    @input="onChange"
  />
</template>

<script>
import moment from 'moment'

export default {
  name: 'RangeCalendar',
  props: {
    sTime: String,
    eTime: String,
    timeType: String
  },
  computed: {
    mode() {
      return {
        1: 'month',
        2: 'year'
      }[this.timeType]
    },
    value() {
      if (!this.sTime) return null
      return new Date(this.sTime)
    }
  },
  watch: {
    timeType() {
      this.onChange(this.value)
    }
  },
  created() {
    this.$options.componentName = 'ElTimeSelect'
    this.initSTime = this.sTime
    this.initETime = this.eTime
    this.$on('fieldReset', (initialValue) => {
      if (initialValue != null) {
        console.log(this.initSTime, this.initETime)
        this.$emit('update:sTime', this.initSTime)
        this.$emit('update:eTime', this.initETime)
      }
    })
  },
  methods: {
    // 日历组件日期点击
    onChange(value) {
      const date = moment(value)
      const formatter = 'yyyy-MM-DD HH:mm:ss'
      switch (this.timeType) {
        // 日
        case '1':
          this.$emit('update:sTime', date.startOf('day').format(formatter))
          this.$emit('update:eTime', date.endOf('day').format(formatter))
          break
        // 月
        case '2':
          this.$emit('update:sTime', date.startOf('month').format(formatter))
          this.$emit('update:eTime', date.endOf('month').format(formatter))
          break
        // 周
        case '3':
          this.$emit('update:sTime', date.startOf('week').format(formatter))
          this.$emit('update:eTime', date.endOf('week').format(formatter))
      }
    }
  }
}
</script>
