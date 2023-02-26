<template>
  <router-view v-if="routerView" />
  <div v-else class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['finance:mallDistributionFeeRule:add']"
          type="primary"
          size="mini"
          @click="handleAdd"
        >新增配送费
        </el-button>
      </el-col>
    </el-row>

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
          change-on-select
          expand-trigger="hover"
          style="width: 300px"
          placeholder="请选择组织"
          :field-names="{ value: 'id', label: 'label', children: 'children' }"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="名称" prop="ruleName">
        <el-input
          v-model="queryParams.ruleName"
          placeholder="请输入名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="类型" prop="distributionFeeType">
        <el-select
          v-model="queryParams.distributionFeeType"
          placeholder="请选择类型"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in distributionFeeTypeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
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
        style="margin-left: 75px; margin-top: 5px"
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
        <!-- <el-col :span="1.5">
          <el-button
            size="mini"
            @click="handleExport"
            v-hasPermi="['finance:IntegralFeeRule:export']"
            >导出
          </el-button>
        </el-col> -->
      </el-row>
    </el-form>

    <el-table
      ref="multipleTable"
      v-loading="loading"
      :max-height="maxHeight"
      style="margin-top: 20px"
      :row-key="(row) => row.mallDistributionFeeRuleId"
      :data="IntegralFeeRuleList"
    >
      <el-table-column type="selection" width="80" align="center" />
      <el-table-column min-width="120" label="组织" align="center" prop="orgName" />
      <el-table-column min-width="120" label="名称" align="center" prop="ruleName">
        <template slot-scope="scope">
          <el-button class="outer-link--text" native-type="" type="text" @click="handleCheck(scope.row)">{{ scope.row.ruleName }}</el-button>
        </template>
      </el-table-column>
      <el-table-column
        min-width="90"
        label="类型"
        align="center"
        prop="distributionFeeType"
        :formatter="distributionFeeTypeFormat"
      />
      <el-table-column
        min-width="100"
        label="开始时间"
        align="center"
        prop="beginTime"
      >
        <template slot-scope="{row}">
          {{ formatDate(row.beginTime)[0] }}<br>
          {{ formatDate(row.beginTime)[1] }}
        </template>
      </el-table-column>
      <el-table-column
        min-width="100"
        label="结束时间"
        align="center"
        prop="endTime"
      >
        <template slot-scope="{row}">
          {{ formatDate(row.endTime)[0] }}<br>
          {{ formatDate(row.endTime)[1] }}
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
        label="创建时间"
        align="center"
        prop="createTime"
      >
        <template slot-scope="{row}">
          {{ formatDate(row.createTime)[0] }}<br>
          {{ formatDate(row.createTime)[1] }}
        </template>
      </el-table-column>
      <el-table-column
        min-width="100"
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.status != 3"
            v-hasPermi="['finance:mallDistributionFeeRule:expired']"
            size="mini"
            type="text"
            @click="handleStand(scope.row, 3)"
          >
            失效
          </el-button>
          <el-button
            v-if="scope.row.status == 1"
            v-hasPermi="['finance:mallDistributionFeeRule:enabled']"
            size="mini"
            type="text"
            @click="handleStand(scope.row, 2)"
          >
            停用
          </el-button>
          <el-button
            v-if="scope.row.status == 2"
            v-hasPermi="['finance:mallDistributionFeeRule:enabled']"
            size="mini"
            type="text"
            @click="handleStand(scope.row, 1)"
          >
            启用
          </el-button>
          <el-button
            v-if="scope.row.status == 1"
            v-hasPermi="['order:orderInfo:recalculate']"
            size="mini"
            type="text"
            @click="handleRecalculate(scope.row)"
          >
            重算
          </el-button>
          <el-button
            v-if="scope.row.status != 3"
            v-hasPermi="['finance:mallDistributionFeeRule:add']"
            class="outer-link--text"
            size="mini"
            type="text"
            @click="handleUpdate(scope.row)"
          >修改
          </el-button>
          <el-button
            v-if="scope.row.status == 3"
            v-hasPermi="['finance:mallDistributionFeeRule:remove']"
            size="mini"
            type="text"
            @click="handleDelete(scope.row)"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <el-dialog :title="title" :visible.sync="open" width="700px" append-to-body>
      <div style="color: red;margin-bottom: 20px;">该操作谨慎操作，该操作执行后此端时间内的订单根据规则重新计算配送费，可能引起配送员投诉。</div>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="支付时间" prop="time">
          <el-date-picker
            v-model="form.time"
            type="datetimerange"
            value-format="yyyy-MM-dd HH:mm:ss"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :default-time="['00:00:00', '23:59:59']"
          />
        </el-form-item>
        <el-form-item label="配送员" prop="distributionId">
          <el-select
            v-model="form.distributionId"
            style="width: 400px;"
            placeholder="请选择类型"
            clearable
            filterable
            size="small"
          >
            <el-option
              v-for="dict in distributionList"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          :loading="this.$store.state.isLoading"
          @click="submitForm"
        >确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listIntegralFeeRule,
  enabled,
  disabled,
  expired,
  remove
} from '@/api/finance/integralFeeRule'
import { recalculate } from '@/api/finance/distributionFeeRule'
import { getOrgTree } from '@/api/utils'
import { Cascader } from 'ant-design-vue'
import { getDropDown } from '@/api/selectUtils'
import SetTableMaxHeight from '@/mixin/SetTableMaxHeight'

export default {
  name: 'IntegralFeeRule',
  components: {
    Cascader
  },
  mixins: [SetTableMaxHeight],
  data() {
    return {
      routerView:
        window.location.hash.split('?')[0].split('/').length === 4,
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 组织数据
      orgOptions: [],
      // 总条数
      total: 0,
      // 配送费规则表格数据
      IntegralFeeRuleList: [],
      // 全选
      checked: false,
      // 配送费类型(1自然订单，2推广订单)字典
      distributionFeeTypeOptions: [],
      // 状态字典
      statusOptions: [],
      // 配送员
      distributionList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orgId: null,
        ruleName: null,
        distributionFeeType: null,
        status: null,
        orderByColumn: 'create_time',
        isAsc: 'desc'
      },
      // 搜索条件
      searchParams: null,
      form: {},
      rules: {
        time: [
          { required: true, message: '支付时间不能为空', trigger: 'blur' }
        ],
        distributionId: [
          { required: true, message: '配送员不能为空', trigger: 'blur' }
        ]
      },
      open: false,
      title: ''
    }
  },
  created() {
    if (this.routerView) {
      return
    }

    if (Object.keys(this.$route.query).length > 0 && !this.$route.query.type) {
      this.queryParams = Object.assign(this.queryParams, this.$route.query)
    } else if (localStorage.getItem('IntegralFeeRule')) {
      this.queryParams = {
        ...JSON.parse(localStorage.getItem('IntegralFeeRule'))
      }
    }
    this.getList()
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
      }
    })
    this.getDicts('mall_distribution_fee_type').then((response) => {
      this.distributionFeeTypeOptions = response.data
    })
    this.getDicts('finance_rule_status').then((response) => {
      this.statusOptions = response.data
    })
    getDropDown('distributionList').then(res => {
      this.distributionList = [{
        dictLabel: '全部',
        dictValue: 'all'
      }].concat(res.data.map(item => {
        return {
          dictLabel: item.makiName,
          dictValue: item.distributionId
        }
      }))
    })
  },
  methods: {
    /** 查询配送费规则列表 */
    getList() {
      this.loading = true
      listIntegralFeeRule(this.queryParams).then((response) => {
        this.searchParams = {
          ...this.queryParams
        }
        this.IntegralFeeRuleList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 配送费类型(1自然订单，2推广订单)字典翻译
    distributionFeeTypeFormat(row, column) {
      return this.selectDictLabel(
        this.distributionFeeTypeOptions,
        row.distributionFeeType
      )
    },
    // 状态字典翻译
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
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        orgId: null,
        ruleName: null,
        distributionFeeType: null,
        status: null
      }
      localStorage.removeItem('IntegralFeeRule')
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 新增按钮操作 */
    handleAdd() {
      const path = '/finance/integralFeeRule/add'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem(
          'IntegralFeeRule',
          JSON.stringify(this.searchParams)
        )
      }
      this.$router.push({
        path,
        query: {
          type: 'add'
        }
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      const path = '/finance/integralFeeRule/update'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem(
          'IntegralFeeRule',
          JSON.stringify(this.searchParams)
        )
      }
      this.$router.push({
        path,
        query: {
          type: 'update',
          mallDistributionFeeRuleId: row.mallDistributionFeeRuleId
        }
      })
    },
    handleCheck(row) {
      const path = '/finance/IntegralFeeRule/update'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem(
          'IntegralFeeRule',
          JSON.stringify(this.searchParams)
        )
      }
      this.$router.push({
        path,
        query: {
          type: 'check',
          mallDistributionFeeRuleId: row.mallDistributionFeeRuleId
        }
      })
    },
    /** 配送费规则状态修改 */
    handleStand(rows, status) {
      this.$confirm(
        `是否确认${{ 1: '启用', 2: '停用', 3: '失效' }[status]}"${
          rows.ruleName
        }"配送费规则?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          switch (status) {
            case 1:
              return enabled(rows.mallDistributionFeeRuleId)
            case 2:
              return disabled(rows.mallDistributionFeeRuleId)
            case 3:
              return expired(rows.mallDistributionFeeRuleId)
          }
        })
        .then(() => {
          this.getList()
          this.msgSuccess(
            `${{ 1: '启用', 2: '停用', 3: '失效' }[status]}配送费规则成功~`
          )
        })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const mallDistributionFeeRuleIds = row.mallDistributionFeeRuleId || this.ids
      this.$confirm(
        `是否确认${
          typeof mallDistributionFeeRuleIds === 'object'
            ? '批量删除'
            : '删除"' + row.ruleName + '"'
        }配送费规则?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return remove(mallDistributionFeeRuleIds)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('删除成功')
        })
    },
    /** 重算 */
    handleRecalculate(row) {
      this.title = `按该${this.distributionFeeTypeFormat(row)}配送费重算`
      this.form = {
        orgId: row.orgId
      }
      this.open = true
    },
    /** 确定 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.$confirm(`是否确认重计算配送费规则？`, '警告',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          ).then(() => {
            const params = {
              ...this.form,
              distributionId: this.form.distributionId === 'all' ? null : this.form.distributionId,
              payBeginTime: this.form.time[0],
              payEndTime: this.form.time[1]
            }
            delete params.time
            return recalculate(params)
          }).then(() => {
            this.getList()
            this.cancel()
            this.msgSuccess('重计算配送费规则成功~')
          })
        }
      })
    },
    cancel() {
      this.resetForm('form')
      this.open = false
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        'finance/IntegralFeeRule/export',
        {
          ...this.queryParams
        },
        `finance_IntegralFeeRule.xlsx`
      )
    }
  }
}
</script>
