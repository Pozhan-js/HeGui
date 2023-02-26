<template>
  <div>
    <pro-table
      :api-config="{ url: '/distribution/collect/list' }"
      :columns="columns"
      :params="params"
      :before-search-submit="formatSearchParams"
      :rowKey = "row => row.collectId"
      @reset-search="dateValue = undefined"
    > 
      <template #search-btns="obj">
        <el-col :span="1.5">
          <el-button v-hasPermi="['distribution:distributionCollect:export']" size="mini" @click="handleExport(obj)">导出</el-button>
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
      
      <template #action_column_content="scope">
        <el-button
          v-hasPermi="['distribution:distributionCollect:historyList']"
          size="mini"
          type="text"
          @click="handleCheckHistory(scope.row)"
        >查看
        </el-button>
      </template>
    </pro-table>
    <el-dialog
      title="账号信息"
      :visible.sync="dialogVisible"
    >
      <el-table :data="historyLogs">
        <el-table-column align="center" property="bindTime" label="绑定时间" />
        <el-table-column align="center" property="bankInfo" label="开户行" />
        <el-table-column align="center" property="bankBranches" label="支行信息" />
        <el-table-column align="center" property="bankCardno" label="卡号" />
        <el-table-column align="center" property="unbindTime" label="解绑时间" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import ProTable from '@/components/ElProComponents/ProTable'
import { getDistributionCollect }  from "@/api/distribution/distributionCollect";
export default {
  components: {
    ProTable
  },
  data: () => ({
    params: {},
    dialogVisible: false,
    historyLogs: []
  }),
  computed: {
    columns() {
      return [
        { label: "组织", prop: "orgId",hideInTable: true, valueType: "treeSelect", order: 0 },
        { label: "配送员", prop: "idTag", hideInTable: true, minWidth: 90, valueType: "text", placehold: '配送员姓名或手机号' },
        { label: "配送员编号", prop: "distributionCode", hideInSearch: true, minWidth: 90, valueType: "text" },
        { label: "组织", prop: "orgName", hideInSearch: true, minWidth: 90, valueType: "text" },
        { label: "姓名", prop: "makiName", hideInSearch: true, minWidth: 90, valueType: "text" },
        { label: '手机号码', prop: 'telephone', hideInSearch: true,  valueType: 'text'},
        { label: '收款类型', prop: 'collectType', minWidth: 100, valueType: 'dictSelect', fieldProps: { dict: 'distribution_collect_type' }},
        { label: '证件号', prop: 'idCard', hideInSearch: true, minWidth: 90, valueType: 'text' },
        { label: '支付宝账号', prop: 'alipayAccount', hideInSearch: true, minWidth: 90, valueType: 'text' },
        { label: '打款银行卡信息', prop:'BankCardInfo', hideInSearch: true, childrens: [
            { label: "开户行", prop: "bankInfo", minWidth: 90, valueType: "text" },
            { label: '卡号', prop: 'bankCardno',  valueType: 'text' },
            { label: '预留手机号', prop: 'bankPhone', minWidth: 90, valueType: 'text' },
            { label: '支行信息', prop: 'bankBranches', minWidth: 100, valueType: 'text'},
          ]
        },
        { label: '绑定时间', prop: 'bindTime', minWidth: 100, valueType: 'dateTimeRange', paramsRange: ['bindStartTime', 'bindEndTime'], order: 1, render: (h, { record }) => (<BreakTime dateTime={record.bindTime} /> ),},
        { label: '历史绑定明细', prop: 'action', hideInSearch: true, minWidth: 100},
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
      this.download('/distribution/collect/export', this.formatSearchParams(params))
    },
    handleCheckHistory(row) {
      getDistributionCollect({idCard: row.idCard}).then(response => {
          this.historyLogs = response.data;
          this.dialogVisible = true
      });
    },
  }
}
</script>
