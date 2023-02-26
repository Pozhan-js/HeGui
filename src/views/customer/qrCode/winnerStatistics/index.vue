<template>
  <pro-table
    :api-config="{ url: '/winning/record/analyze' }"
    :columns="columns"
    :params="params"
    :before-search-submit="formatSearchParams"
    :rowKey = "row => row.id"
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
  }),
  computed: {
    columns() {
      return [
        { label: '市场名称', prop: 'companyName',  valueType: 'text', order: 0 },
        { label: '产品名称', prop: 'prodName', minWidth: 90, valueType: 'text', order: 1 },
        { label: '生产批次', prop: 'productionBatch', hideInSearch: true, minWidth: 100, valueType: 'text'},
        { label: '扫码时间', prop: 'scanCodeTime', minWidth: 100, valueType: 'dateRange', paramsRange: ['scanCodeBeginTime', 'scanCodeEndTime']},
        { label: '生产日期', prop: 'productionTime', hideInSearch: true, minWidth: 100, valueType: 'dateTimeRange'},
        { label: '扫码数量', prop: 'total', hideInSearch: true, minWidth: 100, valueType: 'text', render: (h, {text}) => (<div>{text>>0}</div>)},
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
      // console.log(this.formatSearchParams(obj).getParams())
      this.download('winning/record/analyze/export', this.formatSearchParams(obj).getParams())
    },
  }
}
</script>
