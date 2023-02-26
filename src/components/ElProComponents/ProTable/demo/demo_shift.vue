<template>
  <pro-table
    ref="proTableRef"
    :api-config="{ url: '/customer/info/list' }"
    :columns="columns"
    :search-config="searchConfig"
    row-key="scoreRecordId"
    :before-search-submit="formatSearchParams"
    :on-reset="handleReset"
  >
    <div slot="title" class="mb8">
      <el-button
        v-hasPermi="['distribution:definition:add']"
        type="primary"
        size="mini"
      >新增班次
      </el-button>
    </div>
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
        <el-button v-hasPermi="['distribution:definition:export']" size="mini" @click="handleExport(obj)">导出</el-button>
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

    <template slot="extra-table-column">
      <el-table-column label="测试1" align="center" prop="test" />
      <el-table-column label="测试2" align="center" prop="test">
        <template slot-scope="scope">
          {{ scope.row.nickname }}
        </template>
      </el-table-column>
    </template>

    <template #table-footer-btns="{checkedList}">
      <el-button
        v-hasPermi="['distribution:definition:remove']"
        size="mini"
        :disabled="!checkedList.length"
      >删除
      </el-button>
      <el-button
        v-hasPermi="['distribution:definition:operation']"
        size="mini"
        :disabled="!checkedList.length"
      >
        停用
      </el-button>
    </template>
  </pro-table>
</template>

<script>
import ProTable, { PropClasses } from '@/components/ElProComponents/ProTable'
import moment from 'moment'

export default {
  components: {
    ProTable
  },
  data: () => ({
    dateValue: moment().format('yyyy-MM-DD'),
    tabValue: 'period',
    searchConfig: new PropClasses.SearchConfigClass({ resetText: 'reset' })
  }),
  computed: {
    isDay() {
      return this.tabValue === 'periodTime'
    },
    columns() {
      const dateType = this.isDay ? '日' : '月'
      const scoreFn = (h, { record }) => {
        const res = this.scoreChangeStatus(record)
        return <span class={res.className}>{res.prefix} {record.score}</span>
      }

      return [
        { prop: 'selection', width: 80, hideInSearch: true, tableColumnProps: { type: 'selection' }},
        { label: '组织', prop: 'orgId', hideInTable: true, valueType: 'treeSelect', order: 0 },
        { label: '账期', prop: this.tabValue, minWidth: 90, valueType: '', order: 6 },
        { label: '消费者编号', prop: 'customerId', minWidth: 100, order: 3, tableColumnProps: { sortable: true }},
        { label: '消费者昵称', prop: 'nickname', minWidth: 100, order: 2, render: (h, { record }) => (<CustomerLink row={record} />) },
        { label: '变动类型', prop: 'balanceType', minWidth: 100, valueType: 'dictSelect', order: 4, fieldProps: { dict: 'score_balance_type' }},
        { label: '订单编号', prop: 'serialNo', minWidth: 136, order: 1 },
        { label: '变动时间', prop: 'updateTime', minWidth: 120, valueType: 'dateTimeRange', order: 5, newLine: true, render: (h, { record }) => (<BreakTime dateTime={record.updateTime} />) },
        { label: `变动前${dateType}积分`, prop: 'beforeScore', minWidth: 100, hideInSearch: true },
        { label: '变动数量', prop: 'score', minWidth: 100, hideInSearch: true, render: scoreFn },
        { label: '变动后积分', prop: 'afterScore', minWidth: 100, hideInSearch: true },
        { label: '备注', prop: 'remark', minWidth: 150, hideInSearch: true, render: (h, { text, index }) => (<ElButton>{text} {index}</ElButton>) },
        { label: '累计消费金额', prop: 'xxx', minWidth: 100, valueType: 'moneyRange', paramsRange: ['beginConsumeAmountTotal', 'endConsumeAmountTotal'], order: 4, hideInTable: true }
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
      this.download('customer/scoreRecord/export', this.formatSearchParams(params))
    },
    // 变动积分格式化
    scoreChangeStatus({ afterScore, beforeScore }) {
      const isAbs = afterScore - beforeScore > 0
      return {
        className: isAbs ? 'text-red' : 'text-blue',
        prefix: isAbs ? '+' : '-'
      }
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
