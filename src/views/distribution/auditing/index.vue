<template>
  <div class="app-container">
    <el-form
      v-show="showSearch"
      ref="queryForm"
      class="search-form"
      :model="queryParams"
      :inline="true"
      label-width="100px"
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
      <el-form-item label="缴纳单号" prop="amountOrderCode">
        <el-input
          v-model="queryParams.amountOrderCode"
          placeholder="请输入缴纳单号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="配送员" prop="idTag">
        <el-input
          v-model="queryParams.idTag"
          placeholder="请输入配送员名称或手机号"
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
          <el-option
            v-for="dict in amount_status"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-row>
        <el-form-item label="申请时间" prop="applySTime">
          <RangePicker
            clearable
            size="small"
            :s-time.sync="queryParams.applySTime"
            :e-time.sync="queryParams.applyETime"
            placeholder="选择申请时间"
          />
        </el-form-item>
      </el-row>
      <el-row
        :gutter="10"
        class="mb8"
        style="margin-left: 95px; margin-top: 5px"
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
            v-hasPermi="['distribution:amountorder:export']"
            size="mini"
            @click="handleExport"
          >导出
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-tabs
      v-model="queryParams.auditStatus"
      style="margin-top: 20px"
      class="tabContainer"
      type="card"
      @tab-click="handleQuery"
    >
      <el-tab-pane label="全部" name="all" />
      <el-tab-pane
        v-for="dict in amount_audit_status"
        :key="dict.dictValue"
        :label="dict.dictLabel"
        :name="dict.dictValue"
      />
    </el-tabs>

    <el-table
      ref="multipleTable"
      v-loading="loading"
      :data="auditlist"
      :row-key="(row) => row.amountOrderId"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" :selectable="row => row.operate === 1" width="80" align="center" />
      <el-table-column label="组织" align="center" prop="areaName" />
      <el-table-column label="供应商名称" align="center" prop="orgName" />
      <el-table-column
        label="申请时间"
        align="center"
        prop="orderTime"
        width="140"
      />
      <el-table-column
        label="凭证单号"
        align="center"
        prop="amountOrderCode"
        width="140"
      />
      <el-table-column label="配送员名称" align="center" prop="makiName" />
      <el-table-column label="配送员手机号" align="center" prop="telephone" />
      <el-table-column
        label="历史金额(元)"
        align="center"
        prop="beforeAmount"
        :formatter="(_, r, v) => toDecimal2(v / 100)"
      >
        <template slot-scope="{row}">
          <jump path="/amount/order" :query="{ distributionId: row.distributionId}">
            {{ toDecimal2(row.beforeAmount / 100) }}
          </jump>
        </template>
      </el-table-column>
      <el-table-column
        label="申请金额(元)"
        align="center"
        prop="amount"
        :formatter="(_, r, v) => toDecimal2(v / 100)"
      />
      <el-table-column
        label="剩余金额(元)"
        align="center"
        prop="afterAmount"
        :formatter="(_, r, v) => toDecimal2(v / 100)"
      />
      <el-table-column label="历史节点" align="center" prop="nodeName" />
      <el-table-column label="理由" align="center" prop="reason" />
      <el-table-column
        label="状态"
        align="center"
        prop="status"
        :formatter="(row) => selectDictLabel(amount_status, row.status)"
      />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.operate === 1"
            v-hasPermi="['distribution:amountorder:audit']"
            size="mini"
            type="text"
            @click="handleAuditListAmountorderAuditAgree(scope.row)"
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
              v-hasPermi="['distribution:amountorder:audit']"
              size="mini"
              :disabled="multiple"
              @click="handleAuditListAmountorderAuditAgree(ids)"
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
  auditListAmountorder,
  auditListAmountorderAuditAgree
} from '@/api/distribution/amountorder'
import { getOrgTree } from '@/api/utils'
import { Cascader } from 'ant-design-vue'
import { audit } from '@/utils/audit'
const getDefaultForm = () => ({
  pageNum: 1,
  pageSize: 10,
  isAsc: 'desc',
  auditStatus: 'all',
  orderByColumn: 'order_time'
})
export default {
  name: 'Amountorder',
  components: {
    Cascader
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
      // 组织数据
      orgOptions: [],
      // 总条数
      total: 0,
      amount_status: [],
      auditlist: [],
      // 全选
      checked: false,
      // 查询参数
      queryParams: getDefaultForm(),
      amount_audit_status: []
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
    this.getDicts('amount_status').then((res) => {
      if (res.code === 200) {
        this.amount_status = res.data
      }
    })
    this.getDicts('amount_audit_status').then((res) => {
      if (res.code === 200) {
        this.amount_audit_status = res.data
      }
    })
  },
  methods: {
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.amountOrderId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
      this.checked = this.auditlist.length === selection.length
    },
    getQuery() {
      return {
        ...this.queryParams,
        auditStatus:
          this.queryParams.auditStatus === 'all'
            ? undefined
            : this.queryParams.auditStatus
      }
    },
    /** 查询质保金列表 */
    getList() {
      this.loading = true
      auditListAmountorder(this.getQuery()).then((response) => {
        this.auditlist = response.rows
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
    /** 通过按钮操作 */
    handleAuditListAmountorderAuditAgree(row) {
      audit({
        message: !Array.isArray(row) ? `是否确认通过${row.makiName}的审核？` : `是否确认批量审核通过?`,
        onInputComplete: arg => auditListAmountorderAuditAgree({
          amountOrderIds: !Array.isArray(row) ? [row.amountOrderId] : this.ids,
          ...arg
        }),
        onSuccess: this.getList
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        'distribution/amountorder/auditexport', this.getQuery())
    },
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
