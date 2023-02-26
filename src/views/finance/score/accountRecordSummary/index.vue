<template>
  <pro-table
    ref="proTableRef"
    :api-config="{ url: '/customer/score/summary/list' }"
    :columns="columns"
    :search-config="searchConfig"
    row-key="scoreRecordSummaryId"
    :before-search-submit="formatSearchParams"
    :on-reset="handleReset"
  >
    <el-form-item :slot="tabValue + '_search_item'" label="账期">
      <el-date-picker
        v-model="dateValue"
        :type="isDay ? 'date' : 'month'"
        style="width: 100%"
        placeholder="请选择账期"
        clearable
        size="small"
      />
    </el-form-item>

    <template #search-btns="obj">
      <el-col :span="1.5">
        <el-button size="mini" @click="handleExport(obj)">导出</el-button>
      </el-col>
    </template>

    <el-tabs
      slot="table-title"
      v-model="tabValue"
      class="tabContainer"
      type="card"
      @tab-click="handleTabClick"
    >
      <el-tab-pane label="日汇总" name="periodTime" />
      <el-tab-pane label="月汇总" name="period" />
    </el-tabs>
  </pro-table>
</template>

<script>
import ProTable, { PropClasses } from '@/components/ElProComponents/ProTable'
import moment from 'moment'

export default {
  components: {
    ProTable
  },
  data: (vm) => ({
    dateValue: moment().format('yyyy-MM-DD'),
    tabValue: 'periodTime',
    searchConfig: new PropClasses.SearchConfigClass({ useCollapse: false })
  }),
  computed: {
    isDay() {
      return this.tabValue === 'periodTime'
    },
    columns() {
      const dateType = this.isDay ? '日' : '月'

      return [
        { label: '账期', prop: this.tabValue, order: 3, newLine: true },
        { label: '消费者编号', prop: 'customerId', order: 1 },
        { label: '消费者昵称', prop: 'nickname', order: 2, render: (h, { record }) => (<CustomerLink row={record} />) },
        { label: '期初积分', prop: 'beforeScore', hideInSearch: true },
        { label: `本${dateType}新增`, prop: 'addScore', hideInSearch: true, render: (h, { record }) => (<span class='text-red'> + { record.addScore } </span>) },
        { label: `本${dateType}消耗`, prop: 'reduceScore', hideInSearch: true, render: (h, { record }) => (<span class='text-blue'> - { record.reduceScore } </span>) },
        { label: '期末积分', prop: 'afterScore', hideInSearch: true }
      ]
    }
  },
  methods: {
    formatSearchParams(obj) {
      const date = this.dateValue && moment(this.dateValue)
      return {
        ...obj,
        periodTime: this.isDay ? date?.format('yyyy-MM-DD') : undefined,
        period: !this.isDay ? date?.format('yyyy-MM') : undefined
      }
    },
    handleExport({ getParams }) {
      const params = getParams()
      this.download('customer/score/summary/export', this.formatSearchParams(params))
    },
    handleTabClick() {
      this.$refs.proTableRef.reloadAndRest()
    },
    handleReset() {
      this.dateValue = moment().format('yyyy-MM-DD')
    }
  }
}
</script>
