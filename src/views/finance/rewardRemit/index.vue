<template>
  <div class="app-container">
    <el-form
      v-show="showSearch"
      ref="queryForm"
      class="search-form"
      :model="queryParams"
      :inline="true"
      label-width="90px"
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
      <el-form-item label="配送员" prop="distributionInfo">
        <el-input
          v-model="queryParams.distributionInfo"
          placeholder="请输入配送员姓名或手机号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="帐期" prop="dimension">
        <el-date-picker
          v-model="queryParams.dimension"
          size="small"
          align="right"
          type="month"
          value-format="yyyy-MM"
          placeholder="请选择帐期"
        />
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>

      <el-row
        :gutter="10"
        class="mb8"
        style="margin-left: 85px; margin-top: 5px"
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
            v-hasPermi="['finance:cashout:rewardPunishment:remitexport']"
            size="mini"
            @click="handleExport"
          >导出
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-tabs
      v-model="queryParams.remitStatus"
      style="margin-top: 20px"
      class="tabContainer"
      type="card"
      @tab-click="handleQuery"
    >
      <el-tab-pane label="全部" name="all" />
      <el-tab-pane
        v-for="dict in finance_remit_type"
        :key="dict.dictValue"
        :label="dict.dictLabel"
        :name="dict.dictValue"
      />
    </el-tabs>

    <el-table
      ref="multipleTable"
      v-loading="loading"
      style="margin-top: 20px"
      :data="cashoutList"
      :row-key="(row) => row.cashoutId"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="80" :selectable="row => row.operate === 1" align="center" />
      <el-table-column label="账期" align="center" prop="cycleTime" />
      <el-table-column label="组织" align="center" prop="orgName" />
      <el-table-column label="供应商名称" align="center" prop="supplierName" />
      <el-table-column label="配送员姓名" align="center" prop="makiName" />
      <el-table-column label="配送员手机号" align="center" prop="telephone" />
      <el-table-column label="总订单数" align="center" prop="totalOrder" />
      <el-table-column label="总包数" align="center" prop="totalPakage" />
      <el-table-column label="日奖励(元)" align="center" prop="dayliyReward">
        <template slot-scope="{row}">
          <jump path="/attendance/attendanceReward" :query="{ applayNumber: row.cashoutId, type: 1}">
            {{ toDecimal2(row.dayliyReward / 100) }}
          </jump>
        </template>
      </el-table-column>
      <el-table-column label="月奖励(元)" align="center" prop="monthReward">
        <template slot-scope="{row}">
          <jump path="/attendance/attendanceReward" :query="{ applayNumber: row.cashoutId, type: 2}">
            {{ toDecimal2(row.monthReward / 100) }}
          </jump>
        </template>
      </el-table-column>
      <el-table-column label="奖励金额(元)" align="center" prop="orderReward">
        <template slot-scope="{row}">
          <jump path="/attendance/orderReward" :query="{ applayNumber: row.cashoutId, incomeTypeList: 3}">
            {{ toDecimal2(row.orderReward / 100) }}
          </jump>
        </template>
      </el-table-column>
      <el-table-column label="日处罚(元)" align="center" prop="dayliyPunish">
        <template slot-scope="{row}">
          <jump path="/attendance-manage/detailed/day" :query="{ distributionInfo: row.telephone, date: row.cycleTime, orgId: row.orgId }">
            {{ toDecimal2(row.dayliyPunish / 100) }}
          </jump>
        </template>
      </el-table-column>
      <el-table-column label="月处罚(元)" align="center" prop="monthPunish">
        <template slot-scope="{row}">
          <jump path="/attendance-manage/detailed/month" :query="{ distributionInfo: row.telephone, date: row.cycleTime, orgId: row.orgId }">
            {{ toDecimal2(row.monthPunish / 100) }}
          </jump>
        </template>
      </el-table-column>
      <el-table-column label="处罚金额(元)" align="center" prop="orderPunishment">
        <template slot-scope="{row}">
          <jump path="/attendance/orderReward" :query="{ applayNumber: row.cashoutId, incomeTypeList: 4}">
            {{ toDecimal2(row.orderPunishment / 100) }}
          </jump>
        </template>
      </el-table-column>
      <el-table-column
        label="总计(元)"
        align="center"
        prop="totalAmount"
        :formatter="(_, r, v) => toDecimal2(v / 100)"
      />
      <el-table-column label="打款时间" align="center" prop="remitTime">
        <template slot-scope="{row}">
          {{ formatDate(row.remitTime)[0] }}<br>
          {{ formatDate(row.remitTime)[1] }}
        </template>
      </el-table-column>
      <el-table-column label="历史节点" align="center" prop="nodeName" />
      <el-table-column
        label="状态"
        align="center"
        prop="status"
        :formatter="statusFormat"
      />
      <el-table-column label="日志" align="center" prop="logging" />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row }">
          <el-button
            v-if="row.operate === 1 && row.repeat === 0"
            v-hasPermi="['finance:cashout:rewardPunishment:remitagree']"
            size="mini"
            type="text"
            @click="remit(row)"
          >打款
          </el-button>
          <el-button
            v-if="row.operate === 1 && row.repeat === 1"
            v-hasPermi="['finance:cashout:rewardPunishment:remitagree']"
            size="mini"
            type="text"
            @click="remit(row)"
          >重新打款
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-row>
      <el-col :span="12" style="min-height: 1px">
        <el-row v-if="queryParams.remitStatus === '3'">
          <el-col :span="1.5" style="margin-top: 30px; margin-left: 30px">
            <el-checkbox
              v-model="checked"
              @change="toggleSelection"
            >当页全选</el-checkbox>
          </el-col>
          <el-col :span="9" style="margin-top: 26px; margin-left: 10px">
            <el-button
              v-hasPermi="['finance:cashout:rewardPunishment:remitagree']"
              size="mini"
              :disabled="multiple"
              @click="remit()"
            >批量打款
            </el-button>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="11">
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
  auditRewardPunishmentRemit,
  listRewardRemit
} from '@/api/finance/cashout'
import { getOrgTree } from '@/api/utils'
import { Cascader } from 'ant-design-vue'
import { remit } from '@/utils/audit'
const getDefaultForm = () => ({
  pageNum: 1,
  pageSize: 10,
  remitStatus: 'all',
  isAsc: 'desc',
  orderByColumn: 'create_time'
})
export default {
  name: 'Cashout',
  components: {
    Cascader
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      finance_remit_type: [],
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
      // 结算提现表格数据
      cashoutList: [],
      // 全选状态
      checked: false,
      // 弹出层标题
      title: '',
      // 总状态字典
      statusOptions: [],
      // 查询参数
      queryParams: getDefaultForm(),
      // 表单参数
      form: {}
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
    this.getDicts('finance_remit_type').then((res) => {
      if (res.code === 200) {
        this.finance_remit_type = res.data
      }
    })
    this.getDicts('finance_cashout_status').then((response) => {
      this.statusOptions = response.data
    })
  },
  methods: {
    getQuery() {
      return {
        ...this.queryParams,
        flowNo: 3,
        remitStatus:
          this.queryParams.remitStatus === 'all'
            ? undefined
            : this.queryParams.remitStatus
      }
    },
    /** 查询结算提现列表 */
    getList() {
      this.loading = true
      listRewardRemit(this.getQuery()).then((response) => {
        this.cashoutList = response.rows
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
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection
      this.single = selection.length !== 1
      this.multiple = !selection.length
      this.checked = this.cashoutList.length === selection.length
    },
    remit(row) {
      const msg = []
      const cashOutIds = []
      if (row) {
        cashOutIds.push(row.cashoutId)
        msg.push('是否确认通过`' + row.makiName + '`的审核?')
      } else {
        this.ids.forEach(i => cashOutIds.push(i.cashoutId))
        msg.push('是否确认批量通过审核?')
      }
      remit({
        message: msg.join(''),
        onInputComplete: arg => auditRewardPunishmentRemit({
          cashOutIds,
          followNo: 3,
          ...arg
        }),
        onSuccess: this.getList
      })
    },

    /** 导出按钮操作 */
    handleExport() {
      this.download('cashout/rewardPunishment/remit/export', this.getQuery())
    },
    // 全选
    toggleSelection(value) {
      if (value) {
        this.$refs.multipleTable.clearSelection()
        this.$refs.multipleTable.toggleAllSelection()
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    }
  }
}
</script>
