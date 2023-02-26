<template>
  <div>
    <router-view v-if="routerView" />
    <div v-else class="app-container">
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button
            v-hasPermi="['customer:level:add']"
            type="primary"
            size="mini"
            @click="handleAdd"
          >新增等级
          </el-button>
        </el-col>
      </el-row>
      <el-form
        v-show="showSearch"
        ref="queryForm"
        class="search-form"
        :model="queryParams"
        :inline="true"
        label-width="120px"
      >
        <el-form-item label="等级名称" prop="levelName">
          <el-input
            v-model="queryParams.levelName"
            placeholder="请输入等级名称"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="等级状态" prop="status">
          <el-select
            v-model="queryParams.status"
            placeholder="请选择等级状态"
            clearable
            size="small"
          >
            <el-option
              v-for="dict in levelStatusOptions"
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
              v-hasPermi="['customer:level:export']"
              >导出
            </el-button>
          </el-col> -->
        </el-row>
      </el-form>

      <el-table
        ref="multipleTable"
        v-loading="loading"
        style="margin-top: 20px"
        :max-height="maxHeight"
        :data="levelList"
        :row-key="(row) => row.levelId"
        @selection-change="handleSelectionChange"
      >
        <!-- <el-table-column type="selection" width="80" align="center" /> -->
        <el-table-column min-width="80" label="等级" align="center" prop="level" />
        <el-table-column min-width="90" label="等级名称" align="center" prop="levelName" />
        <el-table-column min-width="100" label="成长值标准" align="center" prop="growthNum" />
        <el-table-column min-width="100" label="配送权益" align="center" prop="deliverFeeBenefits" />
        <el-table-column min-width="100" label="消费优惠" align="center" prop="consumeDiscount" />
        <el-table-column min-width="90" label="分销权益" align="center" prop="distributionFlag" />
        <el-table-column min-width="100" label="有效期至" align="center" prop="expiry" />
        <el-table-column min-width="90" label="状态" align="center">
          <template slot-scope="scope">
            <div>{{ levelStatusFormat(scope.row) }}</div>
            <el-button
              v-hasPermi="['customer:level:levelStatus']"
              size="mini"
              type="text"
              @click="handleStatus(scope.row)"
            >
              {{ scope.row.status === 1 ? '失效' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column min-width="100" label="创建时间" align="center">
          <template slot-scope="scope">
            <break-time :date-time="scope.row.createTime" />
          </template>
        </el-table-column>
        <el-table-column min-width="120" label="卡面" align="center" prop="levelBackgroundUrl">
          <template slot-scope="scope">
            <img style="width: 120px;" :src="prefix + scope.row.levelBackgroundUrl">
          </template>
        </el-table-column>
        <el-table-column min-width="90" label="最后编辑人" align="center" prop="updateBy" />
        <el-table-column
          label="操作"
          min-width="60"
          align="center"
          fixed="right"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="scope">

            <el-button
              v-if="scope.row.status === 1"
              v-hasPermi="['customer:level:edit']"
              class="outer-link--text"
              size="mini"
              type="text"
              @click="handleUpdate(scope.row)"
            >修改
            </el-button>
            <el-button
              v-hasPermi="['customer:level:remove']"
              size="mini"
              type="text"
              @click="handleDelete(scope.row)"
            >删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-row>
        <el-col :span="12" style="margin-top: 26px; margin-left: 10px" />
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
  </div>
</template>

<script>
import {
  delLevel,
  listLevel,
  enabled,
  disabled
} from '@/api/customer/level'
import SetTableMaxHeight from '@/mixin/SetTableMaxHeight'

export default {
  name: 'Level',
  components: {},
  mixins: [ SetTableMaxHeight ],
  data() {
    return {
      routerView:
        window.location.hash.split('?')[0].split('/').length > 3,
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
      // 客户等级表格数据
      levelList: [],
      // 全选
      checked: false,
      // 等级状态(1代表在用2代表失效)字典
      levelStatusOptions: [],
      // 删除标志字典
      delFlagOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        levelName: null,
        status: null,
        orderByColumn: 'growth_num',
        isAsc: 'desc'
      },
      searchParams: {}
    }
  },
  created() {
    this.getList()
    this.getDicts('customer_level_status').then((response) => {
      this.levelStatusOptions = response.data
    })
    this.getDicts('sys_yes_no').then((response) => {
      this.delFlagOptions = response.data
    })
  },
  methods: {
    /** 查询客户等级列表 */
    getList() {
      this.loading = true
      listLevel(this.queryParams).then((response) => {
        this.searchParams = {
          ...this.queryParams
        }
        this.levelList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 等级状态(1代表在用2代表失效)字典翻译
    levelStatusFormat(row, column) {
      return this.selectDictLabel(this.levelStatusOptions, row.status)
    },
    // 删除标志字典翻译
    delFlagFormat(row, column) {
      return this.selectDictLabel(this.delFlagOptions, row.delFlag)
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
      localStorage.removeItem('CouponInfo')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.levelId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
      this.checked = this.levelList.length === selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      const path = '/customer/level/add'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem('Level', JSON.stringify(this.searchParams))
      }
      this.$router.push({
        path
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      const path = '/customer/level/update'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      if (this.searchParams) {
        localStorage.setItem('Level', JSON.stringify(this.searchParams))
      }
      this.$router.push({
        path,
        query: {
          type: 'update',
          levelId: row.levelId
        }
      })
    },
    // 修改状态
    handleStatus(rows) {
      this.$confirm(`是否确认${rows.status == '1' ? '失效' : '启用'}"${rows.levelName}"客户等级?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          return rows.status == '1' ? disabled(rows.levelId) : enabled(rows.levelId)
        })
        .then(() => {
          this.msgSuccess(`${rows.status === '1' ? '失效' : '启用'}客户等级成功~`)
          this.getList()
        })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const levelIds = row.levelId || this.ids
      this.$confirm(
        `是否确认${
          typeof levelIds === 'object' ? '批量删除' : '删除"' + row.levelName +
        '"'}客户等级?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return delLevel(levelIds)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('删除成功~')
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        'customer/level/export',
        {
          ...this.queryParams
        },
        `customer_level.xlsx`
      )
    },
    toggleSelection(value) {
      if (value) {
        this.$refs.multipleTable.clearSelection()
        this.levelList.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    }
  }
}
</script>
