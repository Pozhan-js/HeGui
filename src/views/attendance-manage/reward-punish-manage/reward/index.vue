<template>
  <router-view v-if="!isCurrentComponent" />
  <div v-else class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['finance:attendanceAwardRule:add']"
          type="primary"
          size="mini"
          @click="handleAdd"
        >新增考勤奖励
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
            v-hasPermi="['finance:attendanceAwardRule:export']"
            >导出
          </el-button>
        </el-col> -->
      </el-row>
    </el-form>

    <el-table
      ref="multipleTable"
      v-loading="loading"
      style="margin-top: 20px"
      :row-key="(row) => row.attendanceAwardId"
      :data="attendanceAwardRuleList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="80" align="center" />
      <el-table-column min-width="120" label="组织" align="center" prop="orgName" />
      <el-table-column min-width="120" label="名称" align="center" prop="ruleName">
        <template slot-scope="scope">
          <el-button class="outer-link--text" type="text" @click="handleCheck(scope.row)">{{ scope.row.ruleName }}</el-button>
        </template>
      </el-table-column>
      <el-table-column
        min-width="100"
        label="奖励对象"
        align="center"
        prop="awardUser"
        :formatter="awardUserFormat"
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
        min-width="120"
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.status != 3"
            v-hasPermi="['finance:attendanceAwardRule:expired']"
            size="mini"
            type="text"
            @click="handleStates(scope.row)"
          >
            失效
          </el-button>
          <el-button
            v-if="scope.row.status != 3"
            v-hasPermi="['finance:attendanceAwardRule:enabled']"
            size="mini"
            type="text"
            @click="handleEna(scope.row)"
          >
            {{ scope.row.status == 2 ? "启用" : "禁用" }}
          </el-button>
          <el-button
            v-if="scope.row.status != 3"
            v-hasPermi="['finance:attendanceAwardRule:edit']"
            size="mini"
            type="text"
            @click="handleUpdate(scope.row)"
          >修改
          </el-button>
          <el-button
            v-if="scope.row.status == 3"
            v-hasPermi="['finance:attendanceAwardRule:remove']"
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
          v-hasPermi="['finance:attendanceAwardRule:remove']"
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
  delAttendanceAwardRule,
  listAttendanceAwardRule,
  expired,
  enabled,
  disabled
} from '@/api/attendance/reward'
import { getOrgTree } from '@/api/utils'
import { Cascader } from 'ant-design-vue'

export default {
  name: 'AttendanceAwardRule',
  components: {
    Cascader
  },
  data(vm) {
    return {
      isCurrentComponent: vm.$route.name === 'Reward',
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
      // 考勤奖励规则表格数据
      attendanceAwardRuleList: [],
      // 全选
      checked: false,
      // 奖励对象字典
      awardUserOptions: [],
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
      // 搜索条件
      searchParams: null
    }
  },
  created() {
    if (Object.keys(this.$route.query).length > 0 && !this.$route.query.type) {
      this.queryParams = Object.assign(this.queryParams, this.$route.query)
    } else if (localStorage.getItem('AttendanceAwardRule')) {
      this.queryParams = {
        ...JSON.parse(localStorage.getItem('AttendanceAwardRule'))
      }
    }
    this.getList()
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
      }
    })
    this.getDicts('finance_award_user').then((response) => {
      this.awardUserOptions = response.data
    })
    this.getDicts('finance_rule_status').then((response) => {
      this.statusOptions = response.data
    })
  },
  methods: {
    /** 查询考勤奖励规则列表 */
    getList() {
      this.loading = true
      listAttendanceAwardRule(this.queryParams).then((response) => {
        this.searchParams = {
          ...this.queryParams
        }
        this.attendanceAwardRuleList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 奖励对象(1专职配送员，2兼职配送员)字典翻译
    awardUserFormat(row, column) {
      return this.selectDictLabel(this.awardUserOptions, row.awardUser)
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
      localStorage.removeItem('AttendanceAwardRule')
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.attendanceAwardId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
      this.checked = this.attendanceAwardRuleList.length === selection.length
    },
    /** 新增 */
    handleAdd() {
      const path = '/attendance-manage/reward-punish-manage/reward/add'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem('AttendanceAwardRule', JSON.stringify(this.searchParams))
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
      const path = '/attendance-manage/reward-punish-manage/reward/update'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem('AttendanceAwardRule', JSON.stringify(this.searchParams))
      }
      this.$router.push({
        path,
        query: {
          attendanceAwardId: row.attendanceAwardId,
          type: 'update'
        }
      })
    },
    /** 查看 */
    handleCheck(row) {
      const path = '/attendance-manage/reward-punish-manage/reward/update'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem('AttendanceAwardRule', JSON.stringify(this.searchParams))
      }
      this.$router.push({
        path,
        query: {
          attendanceAwardId: row.attendanceAwardId,
          type: 'check'
        }
      })
    },
    /** 失效 */
    handleStates(row) {
      this.$confirm(`是否确认失效"${row.ruleName}"考勤奖励规则?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        expired(row.attendanceAwardId).then((res) => {
          this.getList()
          this.msgSuccess('失效考勤奖励规则成功~')
        })
      })
    },
    /** 禁用启用 */
    handleEna(row) {
      this.$confirm(`是否确认${+row.status === 2 ? '启用' : '禁用'}"${row.ruleName}"考勤奖励规则?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return +row.status === 2 ? enabled(row.attendanceAwardId) : disabled(row.attendanceAwardId)
      }).then(() => {
        this.getList()
        this.msgSuccess(`${+row.status === 2 ? '启用' : '禁用'}考勤奖励规则成功~`)
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const attendanceAwardIds = row.attendanceAwardId || this.ids
      this.$confirm(
        `是否确认${typeof attendanceAwardIds === 'object' ? '批量删除' : '删除"' + row.ruleName + '"'}考勤奖励规则?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return delAttendanceAwardRule(attendanceAwardIds)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('删除成功')
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        'finance/attendanceAwardRule/export',
        {
          ...this.queryParams
        },
        `finance_attendanceAwardRule.xlsx`
      )
    },
    toggleSelection(value) {
      if (value) {
        this.$refs.multipleTable.clearSelection()
        this.attendanceAwardRuleList.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    }
  }
}
</script>
