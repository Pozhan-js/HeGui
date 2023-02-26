<template>
  <pro-table
    :api-config="{ url: '/customer/scoreOrder/list' }"
    :columns="columns"
    row-key="scoreOrderId"
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
  computed: {
    columns() {
      return [
        { label: '账期', prop: 'period', hideInSearch: true },
        { label: '消费者编号', prop: 'customerId' },
        { label: '消费者昵称', prop: 'nickname', render: (h, { record }) => (<CustomerLink row={record} />) },
        { label: '变动类型', prop: 'balanceType', valueType: 'dictSelect', fieldProps: { dict: 'score_balance_type' }},
        { label: '订单编号', prop: 'scoreOrderNo' },
        { label: '支付时间', prop: 'payTime', valueType: 'dateTimeRange', paramsRange: ['payStartTime', 'payEndTime'], render: (h, { record }) => (<BreakTime dateTime={record.payTime} />) },
        { label: '变更时间', prop: 'realSendTime', valueType: 'dateTimeRange', paramsRange: ['realStartTime', 'realEndTime'], render: (h, { record }) => (<BreakTime dateTime={record.realSendTime} />) },
        { label: '数量', prop: 'score', hideInSearch: true },
        { label: '状态', prop: 'status', hideInSearch: true, valueType: 'dictSelect', fieldProps: { dict: 'score_send_status' }}
      ]
    }
  },
  methods: {
    handleExport({ getParams }) {
      this.download('customer/scoreOrder/export', getParams())
    }
  }
}
</script>
