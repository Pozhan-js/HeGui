<template>
  <div class="app-container">
    <el-form ref="queryForm" class="search-form" :model="queryParams" :inline="true" label-width="100px">
      <el-form-item label="客户编号" prop="promoteCustomerId">
        <el-input
          v-model="queryParams.promoteCustomerId"
          placeholder="请输入客户编号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="日期" prop="statisticsDate">
        <el-date-picker
          v-model="queryParams.statisticsDate"
          type="month"
          value-format="yyyy-MM"
          placeholder="选择月"
        />
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
            v-hasPermi="['data:customer_promote:export', 'finance:customer_promote:export']"
            size="mini"
            @click="handleExport"
          >导出
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-tabs v-model="queryParams.tabStatus" class="tabContainer" style="margin-top: 20px" type="card" @tab-click="tabCheck">
      <el-tab-pane label="分销收益明细" name="details">
        <el-table v-loading="loading" style="margin-top: 20px" :data="statisticsList">
          <el-table-column label="分销订单号" align="center" prop="orderNo" />
          <el-table-column label="订单时间" align="center" prop="preorderTime" />
          <el-table-column label="分销客户编码" align="center" prop="promoteCustomerId" />
          <el-table-column label="分销客户名称" align="center" prop="promoteCustomerName" />
          <el-table-column label="分销员手机号" align="center" prop="promoteCustomerTelephone" />
          <el-table-column label="商品名称*数量" align="center">
            <template slot-scope="scope">
              <div v-for="(item, index) in scope.row.orderPromoteDetailList" :key="index">
                {{ item.goodsName }} * {{ item.goodsNum }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="分销订单包数" align="center" prop="goodsNum" />
          <el-table-column label="分销订单金额" align="center" prop="orderTotalAmount" :formatter="(_,row) => toDecimal2(_.orderTotalAmount / 100)" />
          <el-table-column label="提成金额" align="center" prop="promoteIncome" :formatter="(_,row) => toDecimal2(_.promoteIncome / 100)" />
          <el-table-column label="状态" align="center" prop="withdrawStatus">
            <template slot-scope="scope">
              <div>{{ statusFormat(scope.row.withdrawStatus) }}</div>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="分销收益统计" name="statistics">
        <el-table v-loading="loading" style="margin-top: 20px" :data="statisticsList">
          <el-table-column label="分销客户编码" align="center" prop="customerId" />
          <el-table-column label="分销员姓名" align="center" prop="customerName" />
          <el-table-column label="分销员手机号" align="center" prop="customerTelehpone" />
          <el-table-column label="分销订单数" align="center" prop="promoteOrderNum" />
          <el-table-column label="分销订单金额" align="center" prop="promoteOrderTotalAmount" :formatter="(_,row) => toDecimal2(_.promoteOrderTotalAmount / 100)" />
          <el-table-column label="当月已提取金额" align="center" prop="withdrawAmount" :formatter="(_,row) => toDecimal2(_.withdrawAmount / 100)" />
          <el-table-column label="年累计未提取" align="center" prop="notWithdrawAmountYear" :formatter="(_,row) => toDecimal2(_.notWithdrawAmountYear / 100)" />
          <el-table-column label="年累计已提取" align="center" prop="withdrawAmountYear" :formatter="(_,row) => toDecimal2(_.withdrawAmountYear / 100)" />
          <el-table-column label="年累计总提成" align="center" prop="promoteTotalIncomeYear" :formatter="(_,row) => toDecimal2(_.promoteTotalIncomeYear / 100)" />
        </el-table>
      </el-tab-pane>
    </el-tabs>

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
import { listDetails, listStatistics } from '@/api/divideSale/finance'
import moment from 'moment'

export default {
  name: 'Finance',
  components: { },
  data() {
    return {
      // 总条数
      total: 0,
      // 配送员考勤奖励明细表格数据
      statisticsList: [],
      // 提现状态字典
      withdrawStatus: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        promoteCustomerId: null,
        statisticsDate: new Date(),
        tabStatus: 'details',
        isAsc: 'desc',
        orderByColumn: 'preorder_time'
      }
    }
  },
  created() {
    this.getDicts('customer_promote_withdraw_status').then((response) => {
      this.withdrawStatus = response.data
    })
    this.getList()
  },
  methods: {
    tabCheck() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 查询配送员考勤奖励明细列表 */
    getList() {
      this.loading = true
      const params = {
        ...this.queryParams,
        statisticsDate: moment(this.queryParams.statisticsDate).startOf('month').format('YYYY-MM-DD HH:mm:ss')
      }
      delete params.tabStatus
      if (this.queryParams.tabStatus === 'details') {
        listDetails(params).then(response => {
          this.statisticsList = response.rows
          this.total = response.total
          this.loading = false
        })
      } else {
        params.orderByColumn = 'promote_total_income'
        listStatistics(params).then(response => {
          this.statisticsList = response.rows
          this.total = response.total
          this.loading = false
        })
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.queryParams.pageSize = 10
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 导出按钮操作 */
    handleExport() {
      const params = {
        promoteCustomerId: this.queryParams.promoteCustomerId,
        statisticsDate: moment(this.queryParams.statisticsDate).startOf('month').format('YYYY-MM-DD HH:mm:ss')
      }
      this.download(this.queryParams.tabStatus === 'details' ? '/customer_promote/export' : '/orderPromoteCustomerStatistics/statistics/export', { ...params })
    },
    statusFormat(status) {
      return this.selectDictLabel(this.withdrawStatus, status)
    }
  }
}
</script>
