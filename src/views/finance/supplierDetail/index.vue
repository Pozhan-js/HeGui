<template>
  <div class="app-container">
    <el-form
      v-show="showSearch"
      ref="queryForm"
      class="search-form"
      :model="queryParams"
      :inline="true"
      label-width="80px"
    >
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
      <el-form-item label="下单时间" prop="orderBeginTime">
        <RangePicker
          clearable
          size="small"
          :s-time.sync="queryParams.orderBeginTime"
          :e-time.sync="queryParams.orderEndTime"
          placeholder="选择完成时间"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
          size="small"
        >
          <el-option value="all" label="全部" />
          <el-option
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
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
      <el-form-item>
        <query-tag :tags="tags" />
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
        <!--        <el-col :span="1.5">-->
        <!--          <el-button-->
        <!--            size="mini"-->
        <!--            @click="handleExport"-->
        <!--            v-hasPermi="['finance:supplierDetail:export']"-->
        <!--          >导出-->
        <!--          </el-button>-->
        <!--        </el-col>-->
      </el-row>
    </el-form>
    <el-tabs
      v-model="queryParams.status"
      style="margin-top: 20px"
      class="tabContainer"
      type="card"
      @tab-click="handleQuery"
    >
      <el-tab-pane label="全部" name="all" />
      <el-tab-pane
        v-for="dict in statusOptions"
        :key="dict.dictValue"
        :label="dict.dictLabel"
        :name="dict.dictValue"
      />
    </el-tabs>
    <el-table
      ref="multipleTable"
      v-loading="loading"
      style="margin-top: 20px"
      :data="supplierDetailList"
    >
      <el-table-column min-width="130" label="订单编号" align="center" prop="orderNo">
        <template slot-scope="{ row }">
          <jump class="outer-link--text" path="/order/delivery/allorder" :query="{orderValue: row.orderNo, orderKey: 'orderNo'}">
            {{ row.orderNo }}
          </jump>
        </template>
      </el-table-column>
      <el-table-column min-width="110" label="组织" align="center" prop="orgName" />
      <el-table-column min-width="100" label="经销商信息" align="center" prop="shopName">
        <template slot-scope="{ row }">
          <div>{{ row.shopName }}</div>
          <div>{{ row.shopPhone }}</div>
        </template>
      </el-table-column>
      <el-table-column min-width="100" label="名称/包数" align="center" prop="goods">
        <template slot-scope="{ row }">
          <div v-for="(item, index) in row.goods" :key="index">
            {{ item.name }} {{ item.number }}
          </div>
        </template>
      </el-table-column>
      <el-table-column min-width="130" label="下单时间/完成时间" align="center" prop="orderTime">
        <template slot-scope="scope">
          <div>{{ scope.row.orderTime }}</div>
          <div>{{ scope.row.completeTime }}</div>
        </template>
      </el-table-column>
      <el-table-column
        min-width="80"
        label="状态"
        align="center"
        prop="status"
        :formatter="statusFormat"
      />
      <el-table-column
        min-width="100"
        label="总销售额"
        align="center"
        prop="totalSales"
        :formatter="(_, r, v) => toDecimal2(v / 100)"
      />
      <el-table-column
        min-width="100"
        label="应付货款"
        align="center"
        prop="needPaymentAmount"
        :formatter="(_, r, v) => toDecimal2(v / 100)"
      />
      <el-table-column
        min-width="100"
        label="促销费用"
        align="center"
        prop="promotionAmount"
        :formatter="(_, r, v) => toDecimal2(v / 100)"
      />
      <el-table-column
        min-width="100"
        label="实付货款"
        align="center"
        prop="actualPaymentAmount"
        :formatter="(_, r, v) => toDecimal2(v / 100)"
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
import { listSupplierDetail } from '@/api/finance/supplierDetail'
import { Cascader } from 'ant-design-vue'
import { getOrgTree } from '@/api/utils'
import QueryTag from '@/components/QueryTag'
const getDefaultForm = () => ({
  pageNum: 1,
  pageSize: 10,
  status: 'all',
  isAsc: 'desc',
  orderByColumn: 'complete_time'
})
export default {
  name: 'SupplierDetail',
  components: { QueryTag, Cascader },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 组织数据
      orgOptions: [],
      // 总条数
      total: 0,
      // 供应商结算明细表格数据
      supplierDetailList: [],
      tags: [{ type: 'applayNumber', name: '申请流水号' }],
      // 全选状态
      checked: false,
      // 是否显示弹出层
      open: false,
      // 总状态字典
      statusOptions: [],
      // 查询参数
      queryParams: getDefaultForm()
    }
  },
  created() {
    Object.assign(this.queryParams, this.$route.query)
    this.getList()
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
      }
    })
    this.getDicts('finance_order_detail_status').then((response) => {
      this.statusOptions = response.data
    })
  },
  methods: {
    getQuery() {
      return {
        ...this.queryParams,
        status:
          this.queryParams.status === 'all'
            ? undefined
            : this.queryParams.status
      }
    },
    /** 查询供应商结算明细列表 */
    getList() {
      this.loading = true
      listSupplierDetail(this.getQuery()).then((response) => {
        this.supplierDetailList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 总状态字典翻译
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status)
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
      this.queryParams = getDefaultForm()
      this.$router.push({ query: {}})
      this.handleQuery()
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('supplierDetail/export', this.getQuery())
    }
  }
}
</script>
