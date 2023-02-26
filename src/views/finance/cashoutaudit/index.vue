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
      <el-form-item label="申请时间" prop="applyBeginTime">
        <RangePicker
          clearable
          size="small"
          :s-time.sync="queryParams.applyBeginTime"
          :e-time.sync="queryParams.applyEndTime"
          placeholder="选择申请时间"
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
          >筛选</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button class="gray-btn" size="mini" @click="resetQuery">重置</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            v-hasPermi="['finance:cashout:supplier:auditexport']"
            size="mini"
            @click="handleExport"
          >导出
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-tabs
      v-model="queryParams.auditStatus"
      :max-height="maxHeight"
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
      <el-table-column type="selection" :selectable="row => row.operate === 1" width="80" align="center" />
      <el-table-column min-width="100" label="组织" align="center" prop="orgName" />
      <el-table-column min-width="100" label="供应商名称" align="center" prop="shopName" />
      <el-table-column
        min-width="140"
        label="申请单号"
        align="center"
        prop="cashoutId"
      />
      <el-table-column
        min-width="120"
        label="申请时间"
        align="center"
        prop="applyTime"
      />
      <el-table-column
        min-width="100"
        label="实付货款(元)"
        align="center"
        prop="revenue"
      >
        <template slot-scope="{row}">
          <jump class="outer-link--text" path="/supplier/supplier-detail" :query="{ applayNumber: row.cashoutId}">
            {{ toDecimal2(row.revenue / 100) }}
          </jump>
        </template>
      </el-table-column>
      <el-table-column
        min-width="100"
        label="促销费用(元)"
        align="center"
        prop="promotionAmount"
      >
        <template slot-scope="{row}">
          <jump class="outer-link--text" path="/supplier/supplier-detail" :query="{ applayNumber: row.cashoutId}">
            {{ toDecimal2(row.promotionAmount / 100) }}
          </jump>
        </template>
      </el-table-column>
      <el-table-column min-width="100" label="历史节点" align="center" prop="nodeName" />
      <el-table-column
        min-width="80"
        label="状态"
        align="center"
        prop="status"
        :formatter="statusFormat"
      />
      <el-table-column
        min-width="80"
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row }">
          <el-button
            v-if="row.operate === 1"
            v-hasPermi="['finance:cashout:supplier:auditagree']"
            size="mini"
            type="text"
            @click="handlePass(row)"
          >通过
          </el-button>

        </template>
      </el-table-column>
    </el-table>

    <el-row>
      <el-col :span="12" style="min-height: 1px">
        <el-row v-if="queryParams.auditStatus === '1'">
          <el-col :span="1.5" style="margin-top: 30px; margin-left: 30px">
            <el-checkbox
              v-model="checked"
              @change="toggleSelection"
            >当页全选</el-checkbox>
          </el-col>
          <el-col :span="9" style="margin-top: 26px; margin-left: 10px">
            <el-button
              v-hasPermi="['finance:cashout:supplier:auditagree']"
              size="mini"
              :disabled="multiple"
              @click="handlePass(ids)"
            >批量通过
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
  listCashoutAudit,
  auditAgree, auditSupplierAgree
} from '@/api/finance/cashout'
import { getOrgTree } from '@/api/utils'
import { Cascader } from 'ant-design-vue'
import { audit } from '@/utils/audit'
import { auditListAmountorderAuditAgree } from '@/api/distribution/amountorder'
import SetTableMaxHeight from '@/mixin/SetTableMaxHeight'

const getDefaultForm = () => ({
  pageNum: 1,
  pageSize: 10,
  auditStatus: 'all',
  isAsc: 'desc',
  orderByColumn: 'create_time'
})
export default {
  name: 'Cashout',
  components: {
    Cascader
  },
  mixins: [SetTableMaxHeight],
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
    this.getDicts('finance_aduit_type').then((res) => {
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
        flowNo: 4,
        auditStatus:
          this.queryParams.auditStatus === 'all'
            ? undefined
            : this.queryParams.auditStatus
      }
    },
    /** 查询结算提现列表 */
    getList() {
      this.loading = true
      listCashoutAudit(this.getQuery()).then((response) => {
        this.cashoutList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 总状态字典翻译
    statusFormat(row, column) {
      console.log(this.statusOptions, row.status)
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
    handlePass(row) {
      const isArray = Array.isArray(row)
      const ids = isArray ? this.ids.map(i => i.cashoutId) : [row.cashoutId]
      const message = isArray ? `是否确认批量审核通过?` : `是否确认通过${row.shopName}的审核?`
      audit({
        message: message,
        onInputComplete: arg => auditSupplierAgree({
          cashOutIds: ids,
          ...arg
        }),
        onSuccess: this.getList
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('cashout/supplier/audit/export', this.getQuery())
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
