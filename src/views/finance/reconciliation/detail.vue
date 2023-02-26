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
      <el-form-item label="操作时间" prop="payTimeBegin">
        <RangePicker
          clearable
          size="small"
          :s-time.sync="queryParams.payTimeBegin"
          :e-time.sync="queryParams.payTimeEnd"
          placeholder="选择操作时间"
        />
      </el-form-item>

      <el-form-item label="业务类别" prop="payChannel">
        <dict-select v-model="queryParams.payChannel" :out-dicts.sync="billPayChannel" dict="bill_pay_channel" />
      </el-form-item>

      <el-form-item label="订单编号" prop="orderNo">
        <el-input v-model="queryParams.orderNo" placeholder="请输入订单编号" />
      </el-form-item>

      <el-form-item label="订单流水" prop="orderId">
        <el-input v-model="queryParams.orderId" placeholder="请输入订单流水" />
      </el-form-item>

      <el-form-item label="支付状态" prop="tradeState">
        <dict-select v-model="queryParams.tradeState" :out-dicts.sync="tradeState" dict="wechat_trade_state" />
      </el-form-item>

      <el-form-item label="收支类型" prop="payType">
        <dict-select v-model="queryParams.payType" :out-dicts.sync="billPayType" dict="bill_pay_type" />
      </el-form-item>

      <el-form-item label="商户凭证号" prop="outTradeNo">
        <el-input v-model="queryParams.outTradeNo" placeholder="请输入商户凭证号" />
      </el-form-item>

      <el-form-item label="业务流水号" prop="transactionId">
        <el-input v-model="queryParams.transactionId" placeholder="请输入业务流水号" />
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

    <el-table :max-height="maxHeight" v-loading="loading" style="margin-top: 20px" :data="list">
      <el-table-column min-width="80" label="日期" align="center" prop="cycleTime" />
      <el-table-column min-width="80" label="业务类别" align="center" prop="payChannel" :formatter="(_, r, v) => selectDictLabel(billPayChannel, v)" />
      <el-table-column min-width="140" label="订单编号" align="center" prop="orderNo" />
      <el-table-column min-width="130" label="订单流水" align="center" prop="orderId" />
      <el-table-column min-width="80" label="支付状态" align="center" prop="tradeState" :formatter="(_, r, v) => selectDictLabel(tradeState, v)" />
      <el-table-column min-width="100" label="操作时间" align="center" prop="payTimeEnd">
        <template slot-scope="{row}">
          <break-time :date-time="row.payTimeEnd"/>
        </template>
      </el-table-column>
      <el-table-column min-width="130" label="商户凭证号" align="center" prop="outTradeNo" />
      <el-table-column min-width="100" label="业务流水号" align="center" prop="transactionId" />
      <el-table-column min-width="70" label="收支类型" align="center" prop="payType" :formatter="(_, r, v) => selectDictLabel(billPayType, v)" />
      <el-table-column min-width="100" label="收入金额" align="center" prop="incomeAmount" :formatter="(_, r, v) => toDecimal2(v / 100)" />
      <el-table-column min-width="100" label="支出金额" align="center" prop="payAmount" :formatter="(_, r, v) => toDecimal2(v / 100)" />
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
import { listOrderInfoListBillDetail } from '@/api/finance/reconciliation'
import DictSelect from '@/components/DictSelect.vue'
import SetTableMaxHeight from '@/mixin/SetTableMaxHeight'

const getDefaultForm = () => ({
  pageNum: 1,
  pageSize: 10,
  isAsc: 'desc',
  orderByColumn: 'create_time'
})
export default {
  name: 'ReconciliationDetail',
  components: {
    DictSelect
  },
  mixins: [SetTableMaxHeight],
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
    Object.assign(this.queryParams, this.$route.query)
    if (this.$route.query.length) {
      this.$router.replace({ query: {}})
    }
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      listOrderInfoListBillDetail(this.queryParams).then(response => {
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
      this.download('/orderInfo/bill/export', this.queryParams)
    }
  }
}
</script>
