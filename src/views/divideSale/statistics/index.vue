<template>
  <div class="app-container">
    <el-form class="search-form" :model="queryParams" ref="queryForm" :inline="true" label-width="100px">
      <el-form-item label="客户编号" prop="promoteCustomerId">
        <el-input
          v-model="queryParams.promoteCustomerId"
          placeholder="请输入客户编号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="订单号" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入订单号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-row
        :gutter="10"
        class="mb8"
        style="margin-left: 75px; margin-top: 5px"
      >
        <el-col :span="1.5">
          <el-button class="blue-btn" type="primary" size="mini" @click="handleQuery"
          >筛选
          </el-button
          >
        </el-col>
        <el-col :span="1.5">
          <el-button class="gray-btn" size="mini" @click="resetQuery">重置</el-button>
        </el-col>
      </el-row>
    </el-form>

    <!-- <el-tabs class="tabContainer" style="margin-top: 20px" type="card" v-model="queryParams.tabStatus" @tab-click="tabCheck">
      <el-tab-pane label="明细数据" name="all" />
    </el-tabs> -->

    <el-table style="margin-top: 20px" v-loading="loading" :data="statisticsList">
      <el-table-column label="订单号" align="center" prop="orderNo"/>
      <el-table-column label="下单时间" align="center" prop="preorderTime"/>
      <el-table-column label="分销客户" align="center" prop="promoteCustomerId"/>
      <el-table-column label="客户等级" align="center" prop="promoteCustomerLevelName"/>
      <el-table-column label="商品名称*数量" align="center">
        <template slot-scope="scope">
        <div v-for="(item, index) in scope.row.orderPromoteDetailList" :key="index">
          {{ item.goodsName }} * {{ item.goodsNum }}
        </div>
        </template>
      </el-table-column>
      <el-table-column label="返利金额（元）" align="center" prop="promoteIncome" :formatter="(_,row) => toDecimal2(_.promoteIncome / 100)"/>
      <el-table-column label="购买客户" align="center" prop="customerId"/>
      <el-table-column label="提现状态" align="center">
        <template slot-scope="scope">
          <div>{{ statusFormat(scope.row.withdrawStatus) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button class="outer-link--text" type="text" @click="handleDetails(scope.row.orderId)">订单详情</el-button>
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
import { listStatistics } from '@/api/divideSale/statistics'

export default {
  name: 'Statistics',
  components: {  },
  data() {
    return {
      // 总条数
      total: 0,
      // 配送员考勤奖励明细表格数据
      statisticsList: [],
      // 类型(0日类型,1月类型)字典
      typeOptions: [],
      // 提现状态字典
      withdrawStatus: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orderNo: null,
        promoteCustomerId: null,
        isAsc: 'desc',
        orderByColumn: 'preorder_time',
        // tabStatus: 'all'
      },
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
      this.queryParams.pageNum = 1;
      this.getList()
    },
    /** 查询配送员考勤奖励明细列表 */
    getList() {
      this.loading = true
      const params = {
        ...this.queryParams
      }
      listStatistics(params).then(response => {
        this.statisticsList = response.rows
        this.total = response.total
        this.loading = false
      })
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
    /** 订单详情 */
    handleDetails(orderId) {
      const path = "/order/delivery/allorder/details"
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      this.$router.push({
        path,
        query: {
          orderId,
        },
      });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('couponReceive/export', this.queryParams)
    },
    statusFormat(status) {
      return this.selectDictLabel(this.withdrawStatus, status)
    },
  }
}
</script>
