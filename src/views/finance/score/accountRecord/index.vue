<template>
  <pro-table
    :api-config="{ url: '/customer/scoreRecord/list' }"
    :columns="columns"
    :params="params"
    row-key="scoreRecordId"
    :on-reset="handleReset"
  >
    <template #search-btns="obj">
      <el-col :span="1.5">
        <el-button size="mini" @click="handleExport(obj)">导出</el-button>
      </el-col>
    </template>

  </pro-table>
</template>

<script>
import ProTable from '@/components/ElProComponents/ProTable'

export default {
  components: {
    ProTable
  },
  data: (vm) => ({
    params: vm.$route.query
  }),
  computed: {
    columns() {
      const scoreFn = (h, { record }) => {
        const res = this.scoreChangeStauts(record)
        return <span class={res.className}>{res.prefix} {record.score}</span>
      }

      return [
        { label: '账期', prop: 'period', order: 6, valueType: 'dateMonth' },
        { label: '消费者编号', prop: 'customerId', order: 3 },
        { label: '消费者昵称', prop: 'nickname', order: 2, render: (h, { record }) => (<CustomerLink row={record} />) },
        { label: '变动类型', prop: 'balanceType', order: 4, valueType: 'dictSelect', fieldProps: { dict: 'score_balance_type' }},
        { label: '订单编号', prop: 'serialNo', minWidth: 140, order: 1 },
        { label: '变动时间', prop: 'updateTime', order: 5, valueType: 'dateTimeRange', render: (h, { record }) => (<BreakTime dateTime={record.updateTime} />) },
        { label: '变动前积分', prop: 'beforeScore', hideInSearch: true },
        { label: '变动数量', prop: 'score', minWidth: 100, hideInSearch: true, render: scoreFn },
        { label: '变动后积分', prop: 'afterScore', hideInSearch: true },
        { label: '备注', prop: 'remark', hideInSearch: true }
      ]
    }
  },
  methods: {
    handleExport({ getParams }) {
      this.download('customer/scoreRecord/export', getParams())
    },
    handleReset() {
      if (Object.keys(this.params).length && this.params === this.$route.query) {
        const obj = {}
        Object.keys(this.params).forEach(key => {
          obj[key] = undefined
        })
        this.params = obj
        this.$nextTick(() => {
          this.$router.replace({ query: {}})
        })
        return true
      }
    },
    scoreChangeStauts({ afterScore, beforeScore }) {
      const isAbs = afterScore - beforeScore > 0
      return {
        className: isAbs ? 'text-red' : 'text-blue',
        prefix: isAbs ? '+' : '-'
      }
    }
  }
}
</script>
