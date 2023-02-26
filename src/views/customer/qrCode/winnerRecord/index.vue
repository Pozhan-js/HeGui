<template>
  <pro-table
    :api-config="{ url: '/winning/record/list' }"
    :columns="columns"
    :params="params"
    :before-search-submit="formatSearchParams"
    :row-key = "row => row.winningRecordId"
    @reset-search="dateValue = undefined"
  >
    <template #search-btns="obj">
      <el-col :span="1.5">
        <el-button v-hasPermi="['winning:record:export']" size="mini" @click="handleExport(obj)">导出</el-button>
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
  data: () => ({
    params: {},
    SearchConfig: {
      span: 6
    },
  }),
  computed: {
    columns() {
      return [
        { label: '组织', prop: 'orgId', hideInTable:true, valueType: 'treeSelect', order: 0 },
        { label: '组织', prop: 'orgName', hideInSearch:true, minWidth: 90, valueType: 'text' },
        { label: '市场名称', prop: 'companyName', minWidth: 90, valueType: 'text', order: 1 },
        { label: '用户信息', hideInSearch: true, minWidth: 90,
          render: (h, { record }) => (
            <jump path="/customer/customerInfo" query={{customerId: record.customerId}}>
              <div>{ record.customerId }</div>
              <img
                src={record.avatar ? record.avatar : '/avatar.png'}
                style="width: 40px; height: 40px; border-radius: 50%"
              />
              <div class="outer-link--text">{ record.nickname }</div>
            </jump>
          )
        },
        { label: '活动名称', prop: 'eventName', minWidth: 90, valueType: 'text', order: 2 },
        { label: '奖项名称', prop: 'prizeName', minWidth: 90, valueType: 'text', order: 3 },
        { label: '奖品名称', prop: 'awardName', minWidth: 90, valueType: 'text', order: 4 },
        { label: '红包金额', prop: 'money', hideInSearch: true, minWidth: 90, valueType: 'money' },
        { label: '产品名称', prop: 'prodName', hideInSearch:true, minWidth: 90, valueType: 'text' },
        { label: '数码串', prop: 'code', minWidth: 90,  valueType: 'text', order: 8 },
        { label: '中奖状态', prop: 'isLucky', minWidth: 90, valueType: 'dictSelect', fieldProps: { dict: 'winning_is_lucky' }, order: 5 },
        { label: '发放状态', prop: 'isSend', minWidth: 90,  valueType: 'dictSelect', fieldProps: { dict: 'winning_is_send' }, order: 6 },
        { label: '提现状态', prop: 'isRequest', minWidth: 90,  valueType: 'dictSelect', fieldProps: { dict: 'winning_is_request' }, order: 7 },
        { label: '会员搜索', hideInTable:true, minWidth: 90, valueType: 'text', combineOptions: [
          {label: '收货人姓名', value:'receiverName'},
          {label: '收货人手机号', value:'receiverPhone'}
        ], order: 8, span: 8},
        { label: '时间维度', prop: 'timeType', hideInTable:true, minWidth: 90, valueType: 'dateTimeRange', combineOptions: [
          {label: '扫码时间', value: ['scanCodeBeginTime', 'scanCodeEndTime']},
          {label: '兑奖时间', value: ['redeemBeginTime', 'redeemEndTime']},
        ], order: 9, span: 10},
        { label: '发送数量', prop: 'total', hideInSearch: true, minWidth: 90, valueType: 'text'},
        { label: '扫码时间', prop: 'scanCodeTime', hideInSearch: true,  minWidth: 90, render:(h, {record}) =>(<BreakTime dateTime={record.scanCodeTime} />) },
        { label: '兑奖时间', prop: 'redeemTime', hideInSearch: true, minWidth: 90, render:(h, {record}) =>(<BreakTime dateTime={record.redeemTime} />) },
        { label: '收货人信息', prop: 'receiver', hideInSearch: true, minWidth: 100, 
          render: (h, { record }) => (
            <div>
              <div>{ record.receiverName }</div>
              <div>{ record.receiverPhone }</div>
              <div>{ record.address }</div>
            </div>
          )
        },
      ]
    }
  },
  methods: {
    formatSearchParams(obj) {
      return {
        ...obj,
      }
    },
    handleExport(obj) {
      this.download('/winning/record/export', this.formatSearchParams(obj))
    },
  }
}
</script>
