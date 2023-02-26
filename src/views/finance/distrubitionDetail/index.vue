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
      <el-form-item label="订单编号" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入订单编号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="配送员" prop="distributionInfo">
        <el-input
          v-model="queryParams.distributionInfo"
          placeholder="请输入名称或手机号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
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
            v-for="dict in finance_settlement_detail_status"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="收益类型" prop="incomeTypeList">
        <el-select
          v-model="queryParams.incomeTypeList"
          placeholder="请选择收益类型"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in finance_income_type"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="时间维度" prop="timeKey">
        <el-row style="width: 600px">
          <el-col :span="8">
            <el-select
              v-model="queryParams.timeKey"
              style="width: 100%"
              size="small"
            >
              <el-option label="下单时间" :value="1" />
              <el-option label="支付时间" :value="2" />
              <el-option label="推单时间" :value="3" />
              <el-option label="完成时间" :value="4" />
            </el-select>
          </el-col>
          <el-col :span="16">
            <RangePicker
              clearable
              size="small"
              :s-time.sync="queryParams.beginTime"
              :e-time.sync="queryParams.endTime"
            />
          </el-col>
        </el-row>
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
            size="mini"
            @click="handleQuery"
          >筛选
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            class="gray-btn"
            size="mini"
            @click="resetQuery"
          >重置</el-button>
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

    <el-tabs
      v-model="queryParams.status"
      style="margin-top: 20px"
      class="tabContainer"
      type="card"
      @tab-click="handleQuery"
    >
      <el-tab-pane label="全部" name="all" />
      <el-tab-pane
        v-for="dict in finance_settlement_detail_status"
        :key="dict.dictValue"
        :label="dict.dictLabel"
        :name="dict.dictValue"
      />
    </el-tabs>

    <el-table ref="multipleTable" v-loading="loading" :max-height="maxHeight" style="margin-top: 20px" :data="distrubitionDetailList">
      <el-table-column min-width="120" label="订单编号" align="center" prop="orderNo">
        <template slot-scope="{ row }">
          <jump
            class="outer-link--text"
            path="/order/delivery/allorder"
            :query="{ orderValue: row.orderNo, orderKey: 'orderNo' }"
          >
            {{ row.orderNo }}
          </jump>
        </template>
      </el-table-column>
      <el-table-column
        min-width="120"
        label="组织"
        align="center"
        prop="orgName"
      />
      <el-table-column
        min-width="110"
        label="配送员信息"
        align="center"
        prop="distributionId"
      >
        <template slot-scope="scope">
          <div>{{ scope.row.distributionName }}</div>
          <div>{{ scope.row.distributionPhone }}</div>
        </template>
      </el-table-column>
      <el-table-column
        min-width="110"
        label="是否组长/专兼职"
        align="center"
        prop="distributionId"
      >
        <template slot-scope="scope">
          <div v-if="scope.row.isGroupLeader != null">{{ scope.row.isGroupLeader ? '是' : '否' }}</div>
          <div v-if="scope.row.distributionType != null">{{ selectDictLabel(distributionTypeOptions, scope.row.distributionType) }}</div>
        </template>s
      </el-table-column>
      <el-table-column label="组员" align="center" prop="realDistributionName" />
      <el-table-column
        min-width="100"
        label="收益类型"
        align="center"
        prop="incomeType"
        :formatter="
          (row) => selectDictLabel(finance_income_type, row.incomeType)
        "
      />
      <el-table-column
        min-width="120"
        label="下单时间/支付时间"
        align="center"
        prop="orderTime"
      >
        <template slot-scope="scope">
          <div>{{ scope.row.orderTime }}</div>
          <div>{{ scope.row.payTime }}</div>
        </template>
      </el-table-column>
      <el-table-column
        min-width="120"
        label="推单时间/完成时间"
        align="center"
        prop="pushTime"
      >
        <template slot-scope="scope">
          <div>{{ scope.row.pushTime }}</div>
          <div>{{ scope.row.completeTime }}</div>
        </template>
      </el-table-column>
      <el-table-column
        min-width="80"
        label="距离/时长/是否超时"
        align="center"
        prop="distributionDistance"
      >
        <template slot-scope="scope">
          <div v-if="scope.row.distributionDistance != null">
            {{ scope.row.distributionDistance }}米
          </div>
          <div v-if="scope.row.distributionTime != null">
            {{ scope.row.distributionTime | formatMinute }}
          </div>
          <div v-if="scope.row.finishOnTime != null">
            {{ scope.row.finishOnTime ? '否' : '是' }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        min-width="90"
        label="订单实付金额"
        align="center"
        prop="actualPayAmount"
        :formatter="(_, r, v) => toDecimal2(v / 100)"
      />

      <el-table-column
        min-width="80"
        label="收益"
        align="center"
        prop="accpetAmount"
        :formatter="(_, r, v) => toDecimal2(v / 100)"
      />
      <el-table-column
        min-width="70"
        label="状态"
        align="center"
        prop="status"
        :formatter="
          (row) => selectDictLabel(finance_settlement_detail_status, row.status)
        "
      />
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { listDistrubitionDetail } from '@/api/finance/distrubitionDetail'
import { getOrgTree } from '@/api/utils'
import { Cascader } from 'ant-design-vue'
import QueryTag from '@/components/QueryTag'
import SetTableMaxHeight from '@/mixin/SetTableMaxHeight'

const getDefaultForm = () => ({
  pageNum: 1,
  pageSize: 10,
  timeKey: 1,
  status: 'all',
  isAsc: 'desc',
  orderByColumn: 'complete_time'
})
export default {
  name: 'DistrubitionDetail',
  components: { QueryTag, Cascader },
  mixins: [SetTableMaxHeight],
  filters: {
    formatMinute(val) {
      const minute = Math.floor(val / 60)
      const second = val % 60
      return `${minute}分${second ? second + '秒' : ''}`
    }
  },
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
      distributionTypeOptions: [],
      // 组织数据
      orgOptions: [],
      // 总条数
      total: 0,
      // 配送员结算明细表格数据
      distrubitionDetailList: [],
      finance_income_type: [],
      finance_settlement_detail_status: [],
      // 查询参数
      queryParams: getDefaultForm(),
      tags: [
        [
          { type: 'settlementId', name: '结算批次' },
          { type: 'distributionId', name: '配送员编号' },
          { type: 'cycleTime', name: '帐期时间' }
        ]
      ]
    }
  },
  created() {
    Object.assign(this.queryParams, { ...this.$route.query, timeKey: this.$route.query.timeKey ? parseInt(this.$route.query.timeKey) : 1 })
    this.getList()
    // 查询组织
    this.getDicts('distribution_type').then((response) => {
      this.distributionTypeOptions = response.data
    })
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
      }
    })
    this.getDicts('finance_order_detail_status').then((res) => {
      this.finance_settlement_detail_status = res.data
    })
    this.getDicts('finance_income_type').then((res) => {
      this.finance_income_type = res.data
    })
  },
  methods: {
    getQuery() {
      const { timeKey, beginTime, status, endTime, ...other } =
        this.queryParams
      let times
      switch (timeKey) {
        case 1:
          times = { orderBeginTime: beginTime, orderEndTime: endTime }
          break
        case 2:
          times = { payBeginTime: beginTime, payEndTime: endTime }
          break
        case 3:
          times = { pushBeginTime: beginTime, pushEndTime: endTime }
          break
        case 4:
          times = { completeBeginTime: beginTime, completeEndTime: endTime }
          break
      }
      return {
        ...other,
        ...times,
        status: status === 'all' ? undefined : status
      }
    },
    /** 查询配送员结算明细列表 */
    getList() {
      this.loading = true
      listDistrubitionDetail(this.getQuery()).then((response) => {
        this.distrubitionDetailList = response.rows
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
    /** 导出按钮操作 */
    handleExport() {
      this.download('/distributionDetail/export', this.getQuery())
    }
  }
}
</script>
