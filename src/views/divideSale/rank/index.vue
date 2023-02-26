<template>
  <div class="app-container">
    <el-form
      ref="queryForm"
      class="search-form"
      :model="queryParams"
      :inline="true"
      label-width="100px"
    >
      <el-form-item label="客户名称" prop="customerName">
        <el-input
          v-model="queryParams.customerName"
          placeholder="请输入客户名称"
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
          <el-button class="blue-btn" type="primary" size="mini" @click="handleQuery">筛选</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button class="gray-btn" size="mini" @click="resetQuery">重置</el-button>
        </el-col>
      </el-row>
    </el-form>

    <!-- <el-tabs class="tabContainer" style="margin-top: 20px" type="card" v-model="queryParams.tabStatus" @tab-click="tabCheck">
      <el-tab-pane label="明细数据" name="all" />
    </el-tabs> -->

    <el-table
      v-loading="loading"
      style="margin-top: 20px"
      :data="statisticsList"
    >
      <el-table-column label="客户名称" align="center" prop="customerName>">
        <template slot-scope="scope">
        <div
          style="cursor: pointer"
          @click="handleDetails(scope.row.customerId)"
        >
          <div style="color: #1890ff">{{ scope.row.customerName }}</div>
        </div>
        </template>
      </el-table-column>
      <el-table-column
        label="分销订单数"
        align="center"
        prop="promoteOrderNum"
      />
      <el-table-column
        label="分销订单金额"
        align="center"
        prop="promoteOrderTotalAmount"
        :formatter="(_, row) => toDecimal2(_.promoteOrderTotalAmount / 100)"
      />
      <el-table-column
        label="返利金额（元）"
        align="center"
        prop="promoteTotalIncome"
        :formatter="(_, row) => toDecimal2(_.promoteTotalIncome / 100)"
      />
      <el-table-column label="分销排名（金额）" align="center" prop="ranking"/>
      <!-- <el-table-column label="分销排名（金额）" align="center" prop="customerId"/> -->
      <el-table-column
        label="相较上月涨幅百分比"
        align="center"
        prop="increaseRatio"
      >
        <template slot-scope="scope">
          {{ scope.row.increaseRatio }} %
        </template>
      </el-table-column>
      <el-table-column label="相较上月涨幅绝对值" align="center">
        <template slot-scope="scope">
          {{ toDecimal2(scope.row.increaseAmount / 100) }}
          <i
            v-if="parseInt(scope.row.increaseAmount) > 0"
            class="el-icon-caret-top"
            style="font-size: 18px; color: green"
          />
          <i
            v-else
            class="el-icon-caret-bottom"
            style="font-size: 18px; color: red"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="时间"
        align="center"
        prop="statisticsDate"
        :formatter="(_, row) => dataFormat(_.statisticsDate)"
      />
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
import {listRank} from '@/api/divideSale/rank'
import moment from 'moment'

export default {
  name: 'Rank',
  components: {},
  data() {
    return {
      // 总条数
      total: 0,
      // 配送员考勤奖励明细表格数据
      statisticsList: [],
      // 类型(0日类型,1月类型)字典
      typeOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        customerName: null,
        statisticsDate: new Date(),
        orderByColumn: 'ranking',
        isAsc: 'asc'
        // tabStatus: 'all'
      }
    }
  },
  created() {
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
        statisticsDate: moment(this.queryParams.statisticsDate)
          .startOf('month')
          .format('YYYY-MM-DD HH:mm:ss')
      }
      listRank(params).then((response) => {
        this.statisticsList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    dataFormat(data) {
      return moment(data).format('YYYY-MM')
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
      this.download('couponReceive/export', this.queryParams)
    },
    /** 跳转客户画像 */
    handleDetails(customerId) {
      const path = '/customer/customerInfo/portrait'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      this.$router.push({
        path,
        query: {
          customerId
        }
      })
    }
  }
}
</script>
