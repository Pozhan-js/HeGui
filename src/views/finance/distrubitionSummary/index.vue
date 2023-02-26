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
      <el-form-item label="结算时间" prop="completeBeginTime">
        <RangePicker
          clearable
          size="small"
          :s-time.sync="queryParams.completeBeginTime"
          :e-time.sync="queryParams.completeEndTime"
          placeholder="选择结算时间"
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
            v-hasPermi="['finance:distribution:export']"
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

    <el-table ref="multipleTable" v-loading="loading" style="margin-top: 20px" :data="distrubitionSummaryList">
      <el-table-column label="配送员" align="center" prop="distributionName" />
      <el-table-column label="手机号" align="center" prop="distributionPhone" />
      <el-table-column label="组织" align="center" prop="orgName" />
      <el-table-column
        label="状态"
        align="center"
        prop="status"
        :formatter="row => selectDictLabel(finance_settlement_detail_status, row.status)"
      />
      <el-table-column label="总收益(元)" align="center" prop="revenueAmount">
        <template slot-scope="{row}">
          <jump
            v-if="row.status === '1'"
            path="/deliver/detail"
            :query="{
              distributionId: row.distributionId,
              cycleTime: row.cycleTime,
            }"
          >
            {{ toDecimal2(row.revenueAmount / 100) }}
          </jump>
          <jump
            v-else
            path="/deliver/detail"
            :query="{
              settlementId: row.settlementId,
              distributionId: row.distributionId,
            }"
          >
            {{ toDecimal2(row.revenueAmount / 100) }}
          </jump>
        </template>
      </el-table-column>
      <el-table-column label="结算时间" align="center" prop="settlementTime" />
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
import {
  listDistrubitionSummary
} from '@/api/finance/distrubitionSummary'
import { getOrgTree } from '@/api/utils'
import { Cascader } from 'ant-design-vue'
const getDefaultForm = () => ({
  pageNum: 1,
  pageSize: 10,
  status: 'all',
  isAsc: 'desc',
  orderByColumn: 'update_time'
})
export default {
  name: 'DistrubitionSummary',
  components: {
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
      finance_settlement_detail_status: [],
      total: 0,
      // 配送员结算汇总表格数据
      distrubitionSummaryList: [],
      // 查询参数
      queryParams: getDefaultForm()
    }
  },
  created() {
    this.getList()
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
      }
    })
    this.getDicts('finance_settlement_detail_status').then(res => {
      this.finance_settlement_detail_status = res.data
    })
  },
  methods: {
    getQuery() {
      return {
        ...this.queryParams,
        status: this.queryParams.status === 'all'
          ? undefined
          : this.queryParams.status
      }
    },
    /** 查询配送员结算汇总列表 */
    getList() {
      this.loading = true
      listDistrubitionSummary(this.getQuery()).then(response => {
        this.distrubitionSummaryList = response.rows
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
      this.download('distribution/export', this.getQuery())
    }
  }
}
</script>
