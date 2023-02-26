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
      <el-form-item label="申请时间" prop="applyBeginTime">
        <RangePicker
          clearable
          size="small"
          :s-time.sync="queryParams.applyBeginTime"
          :e-time.sync="queryParams.applyEndTime"
          placeholder="选择申请时间"
        />
      </el-form-item>
      <el-form-item label="配送员" prop="distributionInfo">
        <el-input
          v-model="queryParams.distributionInfo"
          placeholder="请输入配送员名称或手机号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable size="small">
          <el-option
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="差异状态" prop="judgment">
        <dict-select v-model="queryParams.judgment" dict="finance_remit_difference" clearable size="small" />
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
            v-hasPermi="['finance:cashout:distributionIncome:remitexport']"
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
        v-for="dict in finance_aduit_type"
        :key="dict.dictValue"
        :label="dict.dictLabel"
        :name="dict.dictValue"
      />
    </el-tabs>
    <el-table
      ref="multipleTable"
      v-loading="loading"
      style="margin-top: 20px"
      :data="distrubitionList"
      :row-key="(row) => row.cashoutId"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" :selectable="row => row.operate === 1 && !row.judgment" width="80" align="center" />
      <el-table-column label="配送员" align="center" prop="makiName" />
      <el-table-column label="手机号" align="center" prop="telephone" />
      <el-table-column label="组织" align="center" prop="orgName" />
      <el-table-column label="申请流水号" align="center" prop="cashoutId" />
      <el-table-column label="申请时间" align="center" prop="applyTime">
        <template slot-scope="{row}">
          {{ formatDate(row.applyTime)[0] }}<br>
          {{ formatDate(row.applyTime)[1] }}
        </template>
      </el-table-column>
      <el-table-column label="打款时间" align="center" prop="remitTime">
        <template slot-scope="{row}">
          {{ formatDate(row.remitTime)[0] }}<br>
          {{ formatDate(row.remitTime)[1] }}
        </template>
      </el-table-column>
      <el-table-column label="总收益(元)" align="center" prop="totalAmount" :formatter="(_, r, v) => toDecimal2(v / 100)" />
      <el-table-column label="历史节点" align="center" prop="nodeName" />
      <el-table-column
        label="总状态"
        align="center"
        prop="status"
        :formatter="statusFormat"
      />
      <el-table-column label="日志" align="center" prop="logging" />
      <el-table-column label="有差异" align="center" prop="judgment" width="60">
        <template slot-scope="{row}">
          <el-button
            size="mini"
            type="text"
            :style="{color: row.judgment ? '#f56c6c' : '#67c23a'}"
          >{{ row.judgment ? '是' : '否' }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button
            v-if="row.operate === 1 && row.repeat === 0 && !row.judgment"
            v-hasPermi="['finance:cashout:distributionIncome:remitagree']"
            size="mini"
            type="text"
            @click="remit(row)"
          >打款
          </el-button>
          <el-button
            v-if="row.operate === 1 && row.repeat === 1 && !row.judgment"
            v-hasPermi="['finance:cashout:distributionIncome:remitagree']"
            size="mini"
            type="text"
            @click="remit(row)"
          >重新打款
          </el-button>
          <el-button
            v-if="row.status === '6'"
            v-hasPermi="['payment:transferPlus:transferStatus']"
            size="mini"
            type="text"
            @click="queryStatus(row)"
          >状态查询
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
              v-hasPermi="['finance:cashout:distributionIncome:remitagree']"
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
  listRemitDistrubition,
  queryTransferStatus
} from '@/api/finance/distrubition'
import { Cascader } from 'ant-design-vue'
import DictSelect from '@/components/DictSelect.vue'
import {
  auditDistributionIncomeRemit
} from '@/api/finance/cashout'
import { remit } from '@/utils/audit'
import { getOrgTree } from '@/api/utils'
const getDefaultForm = () => ({
  pageNum: 1,
  pageSize: 10,
  remitStatus: 'all',
  isAsc: 'desc',
  orderByColumn: 'create_time'
})
export default {
  name: 'Distrubition',
  components: { Cascader, DictSelect },
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
      // 配送收益结算中间表表格数据
      distrubitionList: [],
      finance_aduit_type: [],
      // 全选状态
      checked: false,
      // 状态(1:待结算、2:已结算)字典
      statusOptions: [],
      // 查询参数
      queryParams: getDefaultForm()
    }
  },
  created() {
    this.getList()
    getOrgTree().then((res) => {
      this.orgOptions = res.data
    })
    this.getDicts('finance_cashout_status').then(response => {
      this.statusOptions = response.data
    })
    this.getDicts('finance_remit_type').then(response => {
      this.finance_aduit_type = response.data
    })
  },
  methods: {
    getQuery() {
      return {
        ...this.queryParams,
        flowNo: 2,
        remitStatus: this.queryParams.remitStatus === 'all' ? undefined : this.queryParams.remitStatus
      }
    },
    async queryStatus(row) {
      this.$confirm(
        `是否确认查询此条记录打款状态?`,
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).then(() => {
        return queryTransferStatus(row.cashoutId)
      }).then(res => {
        this.msgSuccess(`查询成功~`);
        this.getList();
      })
    },
    /** 查询配送收益结算中间表列表 */
    getList() {
      this.loading = true
      listRemitDistrubition(this.getQuery()).then(response => {
        this.distrubitionList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 状态(1:待结算、2:已结算)字典翻译
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
      this.checked = this.distrubitionList.length === selection.length
    },

    remit(row) {
      const msg = []
      const cashOutIds = []
      if (row) {
        cashOutIds.push(row.cashoutId)
        msg.push('是否确认给' + row.makiName + '打款?')
      } else {
        this.ids.forEach(i => cashOutIds.push(i.cashoutId))
        msg.push('是否确认批量打款?')
      }
      remit({
        message: msg.join(''),
        onInputComplete: arg => auditDistributionIncomeRemit({
          cashOutIds,
          ...arg
        }),
        onSuccess: this.getList
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('cashout/distributionIncome/remit/export', this.getQuery())
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
