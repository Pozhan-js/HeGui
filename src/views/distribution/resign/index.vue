<template>
  <div class="app-container">
    <el-form
      v-show="showSearch"
      ref="queryForm"
      class="search-form"
      :model="queryParams"
      :inline="true"
      label-width="120px"
    >
      <el-form-item label="配送员编号" prop="distributionId">
        <el-input
          v-model="queryParams.distributionId"
          placeholder="请输入配送员编号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="配送员" prop="idTag">
        <el-input
          v-model="queryParams.idTag"
          placeholder="请输入姓名或手机号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="组织" prop="orgId">
        <Cascader
          v-model="queryParams.orgId"
          :options="orgOptions"
          change-on-select
          expand-trigger="hover"
          style="width: 300px"
          placeholder="请选择组织"
          :field-names="{ value: 'id', label: 'label', children: 'children' }"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-row>
        <el-form-item label="入职时间" prop="entryTime">
          <el-date-picker
            v-model="queryParams.entryTime"
            clearable
            size="small"
            type="daterange"
            value-format="yyyy-MM-dd"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item label="离职时间" prop="departureTime">
          <el-date-picker
            v-model="queryParams.departureTime"
            clearable
            size="small"
            type="daterange"
            value-format="yyyy-MM-dd"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
      </el-row>
      <el-row
        :gutter="10"
        class="mb8"
        style="margin-left: 115px; margin-top: 5px"
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
            v-hasPermi="['distribution:distributioninfo:departureexport']"
            size="mini"
            @click="handleExport"
          >导出
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-tabs v-model="queryParams.status" class="tabContainer" style="margin-top: 20px" type="card" @tab-click="tabCheck">
      <el-tab-pane label="全部" name="all" />
      <el-tab-pane v-for="dict in statusOptions" :key="dict.dictValue" :label="dict.dictLabel" :name="dict.dictValue" />
    </el-tabs>

    <el-table
      ref="multipleTable"
      v-loading="loading"
      :max-height="maxHeight"
      :data="distributioninfoList"
      :row-key="(row) => row.distributionId"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="80" align="center" />
      <el-table-column
        min-width="100"
        label="配送员编号"
        align="center"
        prop="distributionId"
      />
      <el-table-column min-width="90" label="姓名" align="center" prop="makiName" />
      <el-table-column min-width="100" label="手机号码" align="center" prop="telephone" />
      <el-table-column min-width="100" label="入职申请时间" align="center">
        <template slot-scope="{row}">
          <break-time :date-time="row.entryApplyDate" />
        </template>
      </el-table-column>
      <el-table-column min-width="110" label="缴纳质保金时间" align="center" prop="firstAmountDate">
        <template slot-scope="{row}">
          <break-time :date-time="row.firstAmountDate" />
        </template>
      </el-table-column>
      <el-table-column min-width="100" label="质保金金额" align="center" prop="amount">
        <template slot-scope="scope">
          {{ scope.row.amount && toDecimal2(scope.row.amount / 100) }}
        </template>
      </el-table-column>
      <el-table-column min-width="100" label="保险到期账期" align="center" prop="insurance" />
      <el-table-column min-width="100" label="离职申请时间" align="center">
        <template slot-scope="{row}">
          <break-time :date-time="row.departureApplyDate" />
        </template>
      </el-table-column>
      <el-table-column min-width="100" label="离职审核时间" align="center" prop="departureAgreeDate">
        <template slot-scope="{row}">
          <break-time :date-time="row.departureAgreeDate" />
        </template>
      </el-table-column>
      <el-table-column min-width="100" label="资产余额" align="center" prop="assetsAmount">
        <template slot-scope="scope">
          {{ scope.row.assetsAmount && toDecimal2(scope.row.assetsAmount / 100) }}
        </template>
      </el-table-column>
      <el-table-column min-width="100" label="待结算金额" align="center" prop="waitSettlementAmount">
        <template slot-scope="scope">
          {{ scope.row.waitSettlementAmount && toDecimal2(scope.row.waitSettlementAmount / 100) }}
        </template>
      </el-table-column>
      <el-table-column
        min-width="80"
        label="状态"
        align="center"
        prop="status"
        :formatter="statusFormat"
      />
      <!-- <el-table-column label="申请时间" align="center" prop="" />
      <el-table-column label="审核人" align="center" prop="" /> -->
      <el-table-column
        label="操作"
        align="center"
        width="80"
        fixed="right"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <div v-if="scope.row.status === 4">
            <el-button
              v-hasPermi="['distribution:distributioninfo:resign']"
              size="mini"
              type="text"
              @click="handleOpen(scope.row, 'agree')"
            >
              离职通过
            </el-button>
            <el-button
              v-hasPermi="['distribution:distributioninfo:resign']"
              size="mini"
              type="text"
              @click="handleOpen(scope.row, 'refuse')"
            >
              离职拒绝
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-row>
      <el-col :span="1.5" style="margin-top: 30px; margin-left: 30px">
        <el-checkbox
          v-model="checked"
          @change="toggleSelection"
        >当页全选</el-checkbox>
      </el-col>
      <el-col :span="9" style="margin-top: 26px; margin-left: 10px">
        <div v-if="queryParams.status == 4">
          <el-button
            v-hasPermi="['distribution:distributioninfo:resign']"
            size="mini"
            :disabled="multiple"
            @click="handleOpen({}, 'agree')"
          >离职通过
          </el-button>
          <el-button
            v-hasPermi="['distribution:distributioninfo:resign']"
            size="mini"
            :disabled="multiple"
            @click="handleOpen({}, 'refuse')"
          >离职拒绝
          </el-button>
        </div>
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
    <el-dialog
      :title="{ agree: '通过离职', refuse: '拒绝离职' }[type]"
      :visible.sync="open"
      width="800px"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="125px">
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注"
            maxlength="30"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="this.$store.state.isLoading" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listAuditlist,
  resignBy,
  resignRefuse
} from '@/api/distribution/resign'
import { getOrgTree } from '@/api/utils'
import { Cascader } from 'ant-design-vue'
import SetTableMaxHeight from '@/mixin/SetTableMaxHeight'

export default {
  name: 'Distributioninfo',
  components: {
    Cascader
  },
  mixins: [SetTableMaxHeight],
  data() {
    return {
      prefix: sessionStorage.getItem('prefix'),
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
      // 总条数
      total: 0,
      // 配送员信息表格数据
      distributioninfoList: [],
      type: null,
      open: false,
      form: {},
      // 全选
      checked: false,
      // 组织数据
      orgOptions: [],
      // 配送员状态
      statusOptions: [
        { dictLabel: '待审核', dictValue: '4' },
        { dictLabel: '不通过', dictValue: '5' }
      ],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orgId: null,
        distributionId: null,
        idTag: null,
        entryTime: null,
        departureTime: null,
        status: 'all'
      },
      rules: {
        remark: [
          { required: true, message: '离职备注不能为空', trigger: 'blur' }
        ]
      }
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

    // this.getDicts("distribution_status").then((response) => {
    //   this.statusOptions = response.data;
    // });
  },
  methods: {
    tabCheck() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 查询参数格式化 */
    queryParamFomat() {
      const params = {
        ...this.queryParams
      }
      if (params.status === 'all') delete params.status
      if (this.queryParams.entryTime && this.queryParams.entryTime.length === 2) {
        params.entrySTime = this.queryParams.entryTime[0]
        params.entryETime = this.queryParams.entryTime[1]
      }
      if (this.queryParams.departureTime && this.queryParams.departureTime.length === 2) {
        params.departureSTime = this.queryParams.departureTime[0]
        params.departureETime = this.queryParams.departureTime[1]
      }
      delete params.entryTime
      delete params.departureTime
      return params
    },
    /** 查询配送员信息列表 */
    getList() {
      this.loading = true
      listAuditlist(this.queryParamFomat()).then((response) => {
        this.distributioninfoList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 配送员状态
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.queryParams.orgId = null
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.distributionId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
      this.checked = this.distributioninfoList.length === selection.length
    },
    /** 打开审核 */
    handleOpen(rows, type) {
      this.resetForm('form')
      this.form = {
        rows,
        remark: null
      }
      this.type = type
      this.open = true
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          console.log(this.form.rows, this.form.remark)
          if (this.type === 'agree') {
            this.handeleResignBy(this.form.rows, this.form.remark)
          } else if (this.type === 'refuse') {
            this.handeleResignRefuse(this.form.rows, this.form.remark)
          }
        }
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.form = {}
      this.type = null
    },
    // 配送员离职通过
    handeleResignBy(rows, remark) {
      const distributionIds = rows.distributionId || this.ids
      this.$confirm(
        `是否确认${typeof distributionIds === 'object' ? '批量通过' : `通过"` + rows.makiName + '"'}配送员离职审批?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        return resignBy({ distributionIds: typeof distributionIds === 'object' ? distributionIds : [distributionIds], remark })
      }).then((res) => {
        this.msgSuccess(`配送员离职审批成功~`)
        this.getList()
        this.cancel()
      })
    },
    // 配送员离职拒绝
    handeleResignRefuse(rows, remark) {
      const distributionIds = rows.distributionId || this.ids
      this.$confirm(
        `是否确认${typeof distributionIds === 'object' ? '批量拒绝' : '拒绝"' + rows.makiName + '"'}配送员离职审批?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        return resignRefuse({ distributionIds: typeof distributionIds === 'object' ? distributionIds : [distributionIds], remark })
      }).then((res) => {
        this.msgSuccess(`配送员离职拒绝成功~`)
        this.getList()
        this.cancel()
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('/distribution/info/departureexport', this.queryParamFomat())
    },
    toggleSelection(value) {
      if (value) {
        this.$refs.multipleTable.clearSelection()
        this.distributioninfoList.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    }
  }
}
</script>
