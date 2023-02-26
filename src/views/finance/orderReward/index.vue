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
      <el-form-item label="订单号" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入订单号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="配送员" prop="distributionInfo">
        <el-input
          v-model="queryParams.distributionInfo"
          placeholder="请输入配送员姓名或手机号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="下单时间" prop="orderBeginTime">
        <RangePicker
          clearable
          size="small"
          :s-time.sync="queryParams.orderBeginTime"
          :e-time.sync="queryParams.orderEndTime"
          placeholder="选择下单时间"
        />
      </el-form-item>

      <el-form-item label="类型" prop="incomeTypeList">
        <el-select v-model="queryParams.incomeTypeList" placeholder="请选择类型" size="small">
          <el-option
            v-for="dict in typeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
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
        <el-col :span="1.5">
          <el-button
            v-hasPermi="['finance:distributionDetail:export']"
            size="mini"
            @click="handleExport"
          >导出
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table v-loading="loading" style="margin-top: 20px" :data="attendanceRewardList">
      <el-table-column label="账期" align="center" prop="cycleTime" width="100" />
      <el-table-column label="订单编号" align="center" prop="orderNo">
        <template slot-scope="{ row }">
          <jump path="/order/delivery/allorder" :query="{orderValue: row.orderNo, orderKey: 'orderNo'}">
            {{ row.orderNo }}
          </jump>
        </template>
      </el-table-column>
      <el-table-column label="下单时间" align="center" prop="orderTime" width="180" />
      <el-table-column label="操作时间" align="center" prop="operaterTime" width="180" />
      <el-table-column label="组织" align="center" prop="orgName" />
      <el-table-column label="经销商名称" align="center" prop="shopName" />
      <el-table-column label="配送员姓名" align="center" prop="distributionName" />
      <el-table-column label="配送员手机号" align="center" prop="distributionPhone" />
      <el-table-column label="类型" align="center" prop="incomeType" :formatter="typeFormat" />
      <el-table-column
        label="奖励金额(元)"
        align="center"
        prop="accpetAmount"
        :formatter="(_, r, v) => toDecimal2(v / 100)"
      />
      <el-table-column
        label="处罚金额(元)"
        align="center"
        prop="punishmentAmount"
        :formatter="(_, r, v) => toDecimal2(v / 100)"
      />
      <el-table-column label="备注" align="center" prop="remark" />
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
import {
  listOrderReward
} from '@/api/finance/attendanceReward'
import { getOrgTree } from '@/api/utils'
import { Cascader } from 'ant-design-vue'
import QueryTag from '@/components/QueryTag'
const getDefaultForm = () => ({
  pageNum: 1,
  pageSize: 10,
  isAsc: 'desc',
  orderByColumn: 'order_time'
})
export default {
  name: 'AttendanceReward',
  components: {
    QueryTag,
    Cascader
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
      // 组织数据
      orgOptions: [],
      // 总条数
      total: 0,
      // 配送员考勤奖励明细表格数据
      attendanceRewardList: [],
      // 类型(0日类型,1月类型)字典
      typeOptions: [],
      // 查询参数
      queryParams: getDefaultForm(),
      tags: [
        [
          { type: 'applayNumber', name: '申请流水号' },
          { type: 'incomeTypeList', name: '奖励类型' }
        ]
      ]
    }
  },
  created() {
    Object.assign(this.queryParams, this.$route.query)
    this.getList()
    // 查询组织
    getOrgTree().then((res) => {
      this.orgOptions = res.data
    })
    this.getDicts('finance_reward_punishment_type').then(response => {
      this.typeOptions = response.data
      // this.queryParams.type = response.data[0]?.dictValue
    })
    this.getDicts('finance_income_type').then((response) => {
      this.statusOptions = response.data
    })
  },
  methods: {
    /** 查询配送员考勤奖励明细列表 */
    getList() {
      this.loading = true
      listOrderReward(this.queryParams).then(response => {
        this.attendanceRewardList = response.rows
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
      this.queryParams = getDefaultForm()
      this.$router.push({ query: {}})
      this.handleQuery()
    },
    // 类型(0日类型,1月类型)字典翻译
    typeFormat(row, column) {
      return this.selectDictLabel(this.typeOptions, row.incomeType)
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('distributionDetail/orderRewardPunishment/export', this.queryParams)
    }
  }
}
</script>
