<template>
  <router-view v-if="routerView" />
  <div v-else class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['finance:allowanceRule:add']"
          type="primary"
          size="mini"
          @click="handleAdd"
        >新增管理津贴
        </el-button>
      </el-col>
    </el-row>
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
      <el-form-item label="规则名称" prop="ruleName">
        <el-input
          v-model="queryParams.ruleName"
          placeholder="请输入规则名称"
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
        <!-- <el-col :span="1.5">
          <el-button
            size="mini"
            @click="handleExport"
            v-hasPermi="['finance:allowanceRule:export']"
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
      :data="allowanceRuleList"
      :row-key="(row) => row.allowanceRuleId"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="80" align="center" />
      <el-table-column min-width="120" label="组织" align="center" prop="orgName" />
      <el-table-column
        min-width="120"
        label="管理津贴规则名称"
        align="center"
        prop="ruleName"
      >
        <template slot-scope="scope">
          <el-button class="outer-link--text" type="text" @click="handleCheck(scope.row)">{{ scope.row.ruleName }}</el-button>
        </template>
      </el-table-column>

      <el-table-column
        min-width="100"
        label="开始时间"
        align="center"
        prop="beginTime"
      >
        <template slot-scope="{row}">
          <break-time :date-time="row.beginTime"/>
        </template>
      </el-table-column>
      <el-table-column
        min-width="100"
        label="结束时间"
        align="center"
        prop="endTime"
      >
        <template slot-scope="{row}">
          <break-time :date-time="row.endTime"/>
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
          <break-time :date-time="row.createTime"/>
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
            v-hasPermi="['finance:allowanceRule:enabled']"
            size="mini"
            type="text"
            @click="handleStaus(scope.row, scope.row.status == 1 ? 2 : 1)"
          >
            {{ scope.row.status == 1 ? '停用' : '启用' }}
          </el-button>
          <el-button
            v-if="scope.row.status == 2"
            v-hasPermi="['finance:allowanceRule:expired']"
            size="mini"
            type="text"
            @click="handleStaus(scope.row,3)"
          >失效
          </el-button>
          <el-button
            v-hasPermi="['finance:allowanceRule:edit']"
            class="outer-link--text"
            size="mini"
            type="text"
            @click="handleUpdate(scope.row)"
          >修改
          </el-button>
          <el-button
            v-if="scope.row.status == 3"
            v-hasPermi="['finance:allowanceRule:remove']"
            size="mini"
            type="text"
            @click="handleDelete(scope.row)"
          >删除
          </el-button>
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
        <el-button
          v-hasPermi="['finance:allowanceRule:remove']"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >删除</el-button>
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
  delAllowanceRule,
  listAllowanceRule,
  disabled, enabled, expired
} from '@/api/finance/allowanceRule'
import { getOrgTree } from '@/api/utils'
import { Cascader } from 'ant-design-vue'
import SetTableMaxHeight from '@/mixin/SetTableMaxHeight'

export default {
  name: 'AllowanceRule',
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
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 组织机构数据
      orgOptions: [],
      // 总条数
      total: 0,
      // 提成规则表格数据
      allowanceRuleList: [],
      // 全选
      checked: false,
      // 状态字典
      statusOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orgId: null,
        ruleName: null,
        status: null
      },
      // 保存查询条件
      searchParams: {}
    }
  },
  created() {
    if (this.routerView) {
      return
    }
    this.getList()
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
      }
    })
    this.getDicts('finance_rule_status').then((response) => {
      this.statusOptions = response.data
    })
  },
  methods: {
    /** 查询提成规则列表 */
    getList() {
      this.loading = true
      listAllowanceRule(this.queryParams).then((response) => {
        this.searchParams = {
          ...this.queryParams
        }
        this.allowanceRuleList = response.rows
        this.total = response.total
        this.loading = false
      })
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
        status: null
      }
      localStorage.removeItem('AllowanceRule')
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.allowanceRuleId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
      this.checked = this.allowanceRuleList.length === selection.length
    },
    /** 新增 */
    handleAdd() {
      const path = '/finance/allowanceRule/subsidyadd'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem(
          'AllowanceRule',
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
      const path = '/finance/allowanceRule/subsidyupdate'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem(
          'AllowanceRule',
          JSON.stringify(this.searchParams)
        )
      }
      this.$router.push({
        path,
        query: {
          allowanceRuleId: row.allowanceRuleId,
          type: 'update'
        }
      })
    },
    /** 查看 */
    handleCheck(row) {
      const path = '/finance/allowanceRule/subsidyupdate'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem(
          'AllowanceRule',
          JSON.stringify(this.searchParams)
        )
      }
      this.$router.push({
        path,
        query: {
          allowanceRuleId: row.allowanceRuleId,
          type: 'check'
        }
      })
    },
    /** 状态修改 */
    handleStaus(row, status) {
      this.$confirm(
        `是否确认${{ 1: '启用', 2: '禁用', 3: '失效' }[status]}"${row.ruleName}"提成规则?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        switch (status) {
          case 1:
            return enabled(row.allowanceRuleId)
          case 2:
            return disabled(row.allowanceRuleId)
          case 3:
            return expired(row.allowanceRuleId)
        }
      }).then(res => {
        this.getList()
        this.msgSuccess(`${{ 1: '启用', 2: '禁用', 3: '失效' }[status]}提成规则成功~`)
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const allowanceRuleIds = row.allowanceRuleId || this.ids
      this.$confirm(
        `是否确认${typeof allowanceRuleIds === 'object' ? '批量删除' : '删除"' + row.ruleName + '"'}提成规则?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          return delAllowanceRule(allowanceRuleIds)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('删除成功')
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        'finance/allowanceRule/export',
        {
          ...this.queryParams
        },
        `finance_allowanceRule.xlsx`
      )
    },
    toggleSelection(value) {
      if (value) {
        this.$refs.multipleTable.clearSelection()
        this.allowanceRuleList.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    }
  }
}
</script>
