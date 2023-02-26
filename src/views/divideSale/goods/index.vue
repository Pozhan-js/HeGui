<template>
  <div class="app-container">
    <el-form
      ref="queryForm"
      class="search-form"
      :model="queryParams"
      :inline="true"
      label-width="100px"
    >
      <el-form-item label="商品名称" prop="goodsId">
        <el-select
          v-model="queryParams.goodsId"
          filterable
          placeholder="请选择商品"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in goodsOptions"
            :key="dict.goodsId"
            :label="dict.goodsName"
            :value="dict.goodsId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="组织" prop="orgId">
        <Cascader
          v-model="queryParams.orgId"
          :options="orgOptions"
          style="width: 300px"
          change-on-select
          expand-trigger="hover"
          placeholder="请选择组织"
          :field-names="{ value: 'id', label: 'label', children: 'children' }"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="日期" prop="statisticsTime">
        <el-date-picker
          v-model="queryParams.statisticsTime"
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
      </el-row>
    </el-form>

    <el-table
      v-loading="loading"
      style="margin-top: 20px"
      :data="statisticsList"
    >
      <el-table-column label="商品" align="center" prop="goodsName" />
      <el-table-column
        label="分销订单数"
        align="center"
        prop="promoteOrderNum"
      />
      <el-table-column
        label="分销订单金额"
        align="center"
        prop="promoteOrderAmount"
        :formatter="(_, row) => toDecimal2(_.promoteOrderAmount / 100)"
      />
      <el-table-column label="全部订单数" align="center" prop="orderNum" />
      <el-table-column
        label="全部订单金额"
        align="center"
        prop="orderAmount"
        :formatter="(_, row) => toDecimal2(_.orderAmount / 100)"
      />
      <el-table-column label="分销订单数占比" align="center">
        <template slot-scope="scope">
          {{ scope.row.promoteOrderNum && scope.row.orderNum ? toDecimal2((scope.row.promoteOrderNum / scope.row.orderNum) * 100) : 0 }}%
        </template>
      </el-table-column>
      <el-table-column label="分销订单额占比" align="center">
        <template slot-scope="scope">
          {{ parseInt(scope.row.promoteOrderAmount) && parseInt(scope.row.orderAmount) ? toDecimal2((parseInt(scope.row.promoteOrderAmount) / parseInt(scope.row.orderAmount)) * 100) : 0 }}%
        </template>
      </el-table-column>
      <el-table-column
        label="分销客户数"
        align="center"
        prop="promoteCustomerNum"
      />
      <el-table-column
        label="使用分销客户数"
        align="center"
        prop="promoteBuyerNum"
      />
      <el-table-column label="全部客户数" align="center" prop="customerNum" />
      <el-table-column
        label="全部返利金额"
        align="center"
        prop="income"
        :formatter="(_, row) => toDecimal2(_.income / 100)"
      />
      <el-table-column label="新客户数" align="center" prop="newCustomerNum" />
      <el-table-column label="新客人均返利成本" align="center" prop="income">
        <template slot-scope="scope">
          {{
            scope.row.newCustomerNum && scope.row.income
              ? toDecimal2(scope.row.income / scope.row.newCustomerNum / 100)
              : "-"
          }}
        </template>
      </el-table-column>
      <el-table-column label="组织" align="center" prop="orgName" />
      <el-table-column
        label="时间"
        align="center"
        prop="statisticsDate"
        :formatter="(_,row) => dataFormat(_.statisticsTime)"
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
import { Cascader } from 'ant-design-vue'
import { listGoods } from '@/api/divideSale/goods'
import moment from 'moment'
import { getOrgTree } from '@/api/utils'
import { getDropDown } from '@/api/selectUtils'

export default {
  name: 'Goods',
  components: {
    Cascader
  },
  data() {
    return {
      // 总条数
      total: 0,
      // 配送员考勤奖励明细表格数据
      statisticsList: [],
      // 组织数据
      orgOptions: [],
      // 商品下拉信息
      goodsOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orgId: null,
        goodsId: null,
        statisticsTime: new Date(),
        orderByColumn: 'order_amount',
        isAsc: 'asc'
      }
    }
  },
  created() {
    this.getList()
    // 商品下拉
    getDropDown('goodsList').then(res => {
      this.goodsOptions = res.data
    })
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
        statisticsTime: moment(this.queryParams.statisticsTime)
          .startOf('month')
          .format('YYYY-MM-DD HH:mm:ss')
      }
      // 查询组织
      getOrgTree().then((res) => {
        this.orgOptions = res.data
      })
      listGoods(params).then((response) => {
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
    }
  }
}
</script>
