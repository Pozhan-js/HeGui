<template>
  <div>
    <pro-table
      :api-config="{ url: '/paymentTransferRecord/list' }"
      :columns="columns"
      :params="params"
      :before-search-submit="formatSearchParams"
      :rowKey = "row => row.supplierAccountId"
      @reset-search="dateValue = undefined"
    >
    </pro-table>
    <el-dialog title="转账内容" :visible.sync="dialogVisible">
      <code>{{transferContent}}</code>
    </el-dialog>
  </div>
</template>

<script>
import ProTable from '@/components/ElProComponents/ProTable'
export default {
  components: {
    ProTable
  },
  data: () => ({
    params: {
      orderByColumn: 'create_time',
      isAsc: 'desc'
    },
    dialogVisible: false,
    transferContent: ''
  }),
  computed: {
    columns() {
      return [
        { label: "转账流水号", prop: "transferOrderNo", minWidth: 138, render: (h, {record}) => (<el-button class="text-wrap" type="text" onClick={()=>this.getTransferDetail(record)}>{record.transferOrderNo}</el-button>) },
        { label: "转账平台", prop: "transferPlatform", minWidth: 70, valueType: 'dictSelect', fieldProps: { dict: 'payment_transfer_platform' }},
        { label: "转账类型", prop: "transferType", minWidth: 70, valueType: 'dictSelect', fieldProps: { dict: 'payment_transfer_type' }},
        { label: "业务类型", prop: "businessType", minWidth: 70, valueType: 'dictSelect', fieldProps: { dict: 'payment_business_type' }},
        { label: "内部业务编号", prop: "businessId", minWidth: 90, valueType: "text" },
        { label: "外部账单编号", prop: "externalCode", minWidth: 90, valueType: "text" },
        { label: '转账金额', prop: 'amount', hideInSearch: true, minWidth: 90,  valueType: 'money'},
        { label: '转账状态', prop: 'status', minWidth: 60, valueType: 'dictSelect', fieldProps: { dict: 'payment_transfer_record_status' } }, 
        { label: '支付状态', prop: 'payStatus', minWidth: 60, valueType: 'dictSelect', fieldProps: { dict: 'payment_transfer_record_payStatus' } }, 
        { label: '转账时间', prop: 'transferTime', hideInSearch: true, minWidth: 100, render: (h, { record }) => (<BreakTime dateTime={record.transferTime} /> ),},
        { label: '转账成功时间', prop: 'transferSuccessTime', hideInSearch: true, minWidth: 100, render: (h, { record }) => (<BreakTime dateTime={record.transferSuccessTime} /> ),},
        { label: '返回结果', prop: 'resultCode', hideInSearch: true, minWidth: 60, valueType: 'text'},
        { label: '返回信息', prop: 'resultMsg', hideInSearch: true, minWidth: 60, valueType: 'text'},
        { label: '错误结果', prop: 'errCode', hideInSearch: true, minWidth: 60, valueType: 'text'},
        { label: '错误信息', prop: 'errMsg', hideInSearch: true, minWidth: 60, valueType: 'text'},
      ]
    }
  },
  methods: {
    formatSearchParams(obj) {
      return {
        ...obj,
      }
    },
    getTransferDetail({transferContent}) {
      this.transferContent = transferContent
      this.dialogVisible = true
    } 
  }
}
</script>
<style >
  .text-wrap{
    white-space: break-spaces;
  }
</style>
