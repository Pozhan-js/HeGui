<template>
  <div class="app-container">
    <el-form
      v-show="showSearch"
      ref="queryForm"
      class="search-form"
      :model="queryParams"
      :inline="true"
      label-width="100px"
    >
      <el-form-item label="统计时间" prop="periodTimeType">
        <dict-select v-model="queryParams.periodTimeType" dict="data_period_time_type" />
      </el-form-item>
      <el-form-item label="统计时间" prop="payTimeBegin">
        <RangeCalendar
          :time-type="queryParams.periodTimeType"
          :s-time.sync="queryParams.payTimeBegin"
          :e-time.sync="queryParams.payTimeEnd"
        />
      </el-form-item>

      <el-form-item label="组织" prop="orgId">
        <OrgSelect v-model="queryParams.orgId" @query="handleQuery" />
      </el-form-item>

      <el-form-item label="业务类别" prop="payChannel">
        <dict-select v-model="queryParams.payChannel" :out-dicts.sync="billPayChannel" dict="bill_pay_channel" />
      </el-form-item>

      <el-row
        :gutter="10"
        class="mb8"
        style="margin-left: 75px; margin-top: 5px"
      >
        <el-col :span="1.5">
          <el-button
            class="blue-btn"
            type="primary"
            size="mini"
            @click="handleQuery"
          >筛选
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button class="gray-btn" size="mini" @click="resetQuery">重置</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            v-hasPermi="['finance:billDetail:export']"
            size="mini"
            @click="handleExport"
          >导出
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table v-loading="loading" style="margin-top: 20px" :data="list">
      <el-table-column label="日期" align="center" prop="periodTime" />
      <el-table-column label="业务类别" align="center" prop="payChannel" :formatter="(_, r, v) => selectDictLabel(billPayChannel, v)" />
      <el-table-column label="收入笔数" align="center" prop="incomeOrderNumber" />
      <el-table-column label="收入金额(元)" align="center" prop="incomeAmount" :formatter="(_, r, v) => toDecimal2(v / 100)" />
      <el-table-column label="支出笔数" align="center" prop="payOrderNumber" />
      <el-table-column label="支出金额(元)" align="center" prop="payAmount" :formatter="(_, r, v) => toDecimal2(v / 100)" />
      <el-table-column label="操作" align="center">
        <template slot-scope="{row}">
          <Jump
            path="/finance-affairs/reconciliation/detail"
            :query="{
              payChannel: row.payChannel,
              payTimeBegin: queryParams.payTimeBegin,
              payTimeEnd: queryParams.payTimeEnd,
              payType: row.payType,
            }"
          >详情</Jump>
        </template>
      </el-table-column>
    </el-table>

    <el-row>
      <el-col :span="24">
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />
      </el-col>
    </el-row>

  </div>
</template>

<script>
import { listPaymentOrderTransferStatistics } from '@/api/finance/reconciliation'
import DictSelect from '@/components/DictSelect.vue'
import RangeCalendar from '@/components/RangeCalendar.vue'
import OrgSelect from '@/components/OrgSelect.vue'
import moment from 'moment'
import Jump from '@/components/Jump.vue'

const getDefaultForm = () => ({
  pageNum: 1,
  pageSize: 10,
  isAsc: 'desc',
  orderByColumn: 'create_time',
  periodTimeType: '1',
  payTimeBegin: moment().subtract(1, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
  payTimeEnd: moment().subtract(1, 'day').endOf('day').format('YYYY-MM-DD HH:mm:ss')
})
export default {
  name: 'ReconciliationDetail',
  components: {
    DictSelect,
    RangeCalendar,
    OrgSelect,
    Jump
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      list: [],
      billPayChannel: [],
      billPayType: [],
      tradeState: [],
      // 查询参数
      queryParams: getDefaultForm()
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      listPaymentOrderTransferStatistics(this.queryParams).then(response => {
        this.list = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.queryParams.pageSize = 10
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.queryParams = getDefaultForm()
      this.handleQuery()
    },
    handleExport() {
      this.download('/paymentOrderTransfer/statistics/export', this.queryParams)
    }
  }
}
</script>
