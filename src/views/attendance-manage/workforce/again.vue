<template>
  <div class="app-container">
    <span style="margin-left: 50px">月份：</span><el-date-picker disabled :value="row.cycleTime" type="month" />
    <p style="margin: 30px 0">{{ tipText }}</p>
    <div :class="$style.againMonthContainer">
      <p v-for="(day, index) in dayList" :key="day.dayTime" :class="$style.againMonthItem">
        <span :class="$style.itemHeader">{{ index + 1 }}</span>
        <el-select v-model="day.scheduleType" :disabled="day.disabled">
          <el-option
            v-for="i in dicts"
            :key="i.dictValue"
            :value="i.dictValue"
            :label="i.dictLabel"
          />
        </el-select>
      </p>
    </div>
    <div style="margin-top: 40px">
      <el-button type="primary" @click="handleConfirm">确认</el-button>
      <el-button @click="() => $emit('cancel')">取消</el-button>
    </div>
  </div>
</template>

<script>
import { updateSchedule } from '@/api/attendance/workforce'
import moment from 'moment'

export default {
  name: 'Again',
  props: {
    row: Object,
    dicts: Array,
    isSortreset: Boolean
  },
  data() {
    return {
      dayList: null
    }
  },
  computed: {
    tipText() {
      const { distributionName, distributionPhone, cycleTime } = this.row
      return `为配送员：${distributionName} 手机号：${distributionPhone} 排 ${cycleTime} 的班`
    }
  },
  watch: {
    row: {
      handler(val) {
        const curDate = moment()
        this.dayList = val.distributionAttendanceScheduleDetails.map(item => {
          return {
            ...item,
            disabled: this.isSortreset ? false : moment(item.dayTime).isBefore(curDate, 'day')
          }
        })
      },
      immediate: true
    }
  },
  methods: {
    handleConfirm() {
      this.$confirm('是否修改排班?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const originalList = this.row.distributionAttendanceScheduleDetails
          const changedList = this.dayList.filter((item, index) => item.scheduleType !== originalList[index].scheduleType)
          const distributionAttendanceSchedules = changedList.map(item => {
            const { attendanceScheduleId, scheduleType } = item
            return {
              attendanceScheduleId,
              scheduleType
            }
          })
          return updateSchedule({ distributionAttendanceSchedules })
        })
        .then(() => {
          this.msgSuccess('修改排班成功')
          this.$emit('update-success')
        })
    }
  }
}
</script>

<style lang="scss" module>
  .againMonthContainer {
    overflow: hidden;
    .againMonthItem {
      float: left;
      width: 80px;
      margin: 0;
    }
    .itemHeader {
      display: inline-block;
      width: 100%;
      height: 35px;
      line-height: 35px;
      text-align: center;
      border: 1px solid #e9e9e9;
      background-color: #f5f5f5;
    }
  }
</style>
