<template>
  <pro-table
    :api-config="{ url: '/supplier/account/info/list' }"
    :columns="columns"
    :params="params"
    :before-search-submit="formatSearchParams"
    :rowKey = "row => row.supplierAccountId"
    @reset-search="dateValue = undefined"
  > 
    <template #search-btns="obj">
      <el-col :span="1.5">
        <el-button v-hasPermi="['merchant:supplierAccountInfo:export']" size="mini" @click="handleExport(obj)">导出</el-button>
      </el-col>
    </template>
    <template #BankCardInfo_column="item">
        <el-table-column
        :label="item.label"
        align="center"
      >
        <el-table-column
          v-for="children in item.childrens"
          :label="children.label"
          :key="children.prop"
          :prop = "children.prop"
          align="center"
        >
        </el-table-column>
      </el-table-column>
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
  }),
  computed: {
    columns() {

      return [
        { label: "组织", prop: "orgId",hideInTable: true, valueType: "treeSelect", order: 0 },
        { label: "序号", width: 60, hideInSearch: true, tableColumnProps: { type: "index" } },
        { label: "组织", prop: "orgName", hideInSearch: true, minWidth: 90, valueType: "text" },
        { label: "供应商名称", prop: "shopName", hideInSearch: true, minWidth: 90, valueType: "text" },
        { label: '企业名称', prop: 'companyName', hideInSearch: true, minWidth: 90,  valueType: 'text'},
        { label: '证件号', prop: 'licenseNumber', hideInSearch: true, minWidth: 100, valueType: 'text' },
        { label: '卡类型', prop: 'accountType', minWidth: 60, valueType: 'dictSelect', fieldProps: { dict: 'supplier_card_type' }},
        { label: '打款银行卡信息', prop: 'BankCardInfo', hideInSearch: true, childrens: [
            { label: "开户行", prop: "bankInfo", minWidth: 90, valueType: "text" },
            { label: "开户名称", prop: "bankName", minWidth: 120, valueType: "text" },
            { label: '卡号', prop: 'bankCardNo', minWidth: 120, valueType: 'text' },
            { label: '支行信息', prop: 'bankBranches', minWidth: 120, valueType: 'text' },
            { label: '支行银行号', prop: 'branchBankNumber', minWidth: 120, valueType: 'text'},
          ]
        },
        { label: '绑定时间', minWidth: 100, valueType: 'dateTimeRange', paramsRange: ['bindBeginTime', 'bindEndTime'], order: 1, render: (h, { record }) => (<BreakTime dateTime={record.bindTime} /> ),},
        { label: '是否默认', prop: 'isDefault', minWidth: 70, valueType: 'dictSelect', fieldProps: { dict: 'supplier_is_default' }, order: 2},
        { label: '开户许可证', prop: 'openingPermit', hideInSearch: true, minWidth: 90, valueType: 'text'},
      ]
    }
  },
  methods: {
    formatSearchParams(obj) {
      return {
        ...obj,
      }
    },
    handleExport({ getParams }) {
      const params = getParams()
      this.download('supplier/account/info/export', this.formatSearchParams(params))
    }
  }
}
</script>
