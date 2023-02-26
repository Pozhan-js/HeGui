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
      <el-form-item label="登录地址" prop="ipaddr">
        <el-input
          v-model="queryParams.ipaddr"
          placeholder="请输入登录地址"
          clearable
          style="width: 240px"
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="用户名称" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入用户名称"
          clearable
          style="width: 240px"
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="登录状态"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-row>
        <el-form-item label="登录时间">
          <el-date-picker
            v-model="dateRange"
            size="small"
            style="width: 240px"
            value-format="yyyy-MM-dd"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
      </el-row>
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
            v-hasPermi="['system:dict:export']"
            >导出</el-button
          >
        </el-col> -->
      </el-row>
    </el-form>

    <el-table
      ref="multipleTable"
      v-loading="loading"
      style="margin-top: 20px"
      :data="list"
      :row-key="(row) => row.infoId"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="80" align="center" />
      <!-- <el-table-column label="访问编号" align="center" prop="infoId" /> -->
      <el-table-column min-width="100" label="账号名称" align="center" prop="userName" />
      <el-table-column
        min-width="100"
        label="地址"
        align="center"
        prop="ipaddr"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        min-width="100"
        label="状态"
        align="center"
        prop="status"
        :formatter="statusFormat"
      />
      <el-table-column label="描述" align="center" prop="msg" />
      <el-table-column
        min-width="100"
        label="访问时间"
        align="center"
        prop="accessTime"
        width="180"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.accessTime) }}</span>
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
          v-hasPermi="['system:dict:remove']"
          plain
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >删除</el-button>
        <el-button
          v-hasPermi="['system:logininfor:remove']"
          size="mini"
          @click="handleClean"
        >清空</el-button>
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
import { list, delLogininfor, cleanLogininfor } from '@/api/system/logininfor'

export default {
  name: 'Logininfor',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 表格数据
      list: [],
      // 全选
      checked: false,
      // 状态数据字典
      statusOptions: [],
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        ipaddr: null,
        userName: null,
        status: null
      }
    }
  },
  created() {
    this.getList()
    this.getDicts('sys_common_status').then((response) => {
      this.statusOptions = response.data
    })
  },
  methods: {
    /** 查询登录日志列表 */
    getList() {
      this.loading = true
      list(this.addDateRange(this.queryParams, this.dateRange)).then(
        (response) => {
          this.list = response.rows
          this.total = response.total
          this.loading = false
        }
      )
    },
    // 登录状态字典翻译
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
      this.dateRange = []
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.infoId)
      this.multiple = !selection.length
      this.checked = this.list.length === selection.length
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const infoIds = row.infoId || this.ids
      this.$confirm(
        `是否确认${typeof infoIds === 'number' ? '删除访问编号为' + infoIds : '批量删除'
        }登录日志?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return delLogininfor(infoIds)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('删除成功')
        })
    },
    /** 清空按钮操作 */
    handleClean() {
      this.$confirm('是否确认清空所有登录日志数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(function() {
          return cleanLogininfor()
        })
        .then(() => {
          this.getList()
          this.msgSuccess('清空成功')
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        'system/logininfor/export',
        {
          ...this.queryParams
        },
        `logininfor_${new Date().getTime()}.xlsx`
      )
    },
    // 全部选中
    toggleSelection(value) {
      if (value) {
        this.$refs.multipleTable.clearSelection()
        this.list.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    }
  }
}
</script>

