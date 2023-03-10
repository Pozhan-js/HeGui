<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:config:add']"
          type="primary"
          size="mini"
          @click="handleAdd"
        >新增参数配置</el-button>
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
      <el-form-item label="参数名称" prop="configName">
        <el-input
          v-model="queryParams.configName"
          placeholder="请输入参数名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="参数键名" prop="configKey">
        <el-input
          v-model="queryParams.configKey"
          placeholder="请输入参数键名"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="系统内置" prop="configType">
        <el-select
          v-model="queryParams.configType"
          placeholder="系统内置"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in typeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-row>
        <el-form-item label="创建时间">
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
        <el-col :span="1.5">
          <el-button
            v-hasPermi="['system:config:remove']"
            size="mini"
            @click="handleClearCache"
          >清理缓存</el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table
      ref="multipleTable"
      v-loading="loading"
      :max-height="maxHeight"
      style="margin-top: 20px"
      :data="configList"
      :row-key="(row) => row.configId"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="80" align="center" />
      <!-- <el-table-column label="参数主键" align="center" prop="configId" /> -->
      <el-table-column
        min-width="140"
        label="参数名称"
        align="center"
        prop="configName"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        min-width="140"
        label="参数键名"
        align="center"
        prop="configKey"
        :show-overflow-tooltip="true"
      />
      <el-table-column min-width="100" label="参数键值" align="center" prop="configValue" />
      <el-table-column
        min-width="100"
        label="系统内置"
        align="center"
        prop="configType"
        :formatter="typeFormat"
      />
      <el-table-column
        min-width="140"
        label="备注"
        align="center"
        prop="remark"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        min-width="100"
        label="创建时间"
        align="center"
        prop="createTime"
      >
        <template slot-scope="scope">
          {{ formatDate(scope.row.createTime)[0] }}<br>
          {{ formatDate(scope.row.createTime)[1] }}
        </template>
      </el-table-column>
      <el-table-column
        min-width="60"
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['system:config:edit']"
            size="mini"
            type="text"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            v-hasPermi="['system:config:remove']"
            size="mini"
            type="text"
            @click="handleDelete(scope.row)"
          >删除</el-button>
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

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="参数名称" prop="configName">
          <el-input v-model="form.configName" placeholder="请输入参数名称" />
        </el-form-item>
        <el-form-item label="参数键名" prop="configKey">
          <el-input v-model="form.configKey" placeholder="请输入参数键名" />
        </el-form-item>
        <el-form-item label="参数键值" prop="configValue">
          <el-input v-model="form.configValue" placeholder="请输入参数键值" />
        </el-form-item>
        <el-form-item label="系统内置" prop="configType">
          <el-radio-group v-model="form.configType">
            <el-radio
              v-for="dict in typeOptions"
              :key="dict.dictValue"
              :label="dict.dictValue"
            >{{ dict.dictLabel }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            placeholder="请输入内容"
          />
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
  listConfig,
  getConfig,
  delConfig,
  addConfig,
  updateConfig,
  clearCache
} from '@/api/system/config'
import SetTableMaxHeight from '@/mixin/SetTableMaxHeight'

export default {
  name: 'Config',
  mixins: [SetTableMaxHeight],
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
      // 总条数
      total: 0,
      // 参数表格数据
      configList: [],
      // 全选
      checked: false,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 类型数据字典
      typeOptions: [],
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        configName: null,
        configKey: null,
        configType: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        configName: [
          { required: true, message: '参数名称不能为空', trigger: 'blur' }
        ],
        configKey: [
          { required: true, message: '参数键名不能为空', trigger: 'blur' }
        ],
        configValue: [
          { required: true, message: '参数键值不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
    this.getDicts('sys_yes_no').then((response) => {
      this.typeOptions = response.data
    })
  },
  methods: {
    /** 查询参数列表 */
    getList() {
      this.loading = true
      listConfig(this.addDateRange(this.queryParams, this.dateRange)).then(
        (response) => {
          this.configList = response.rows
          this.total = response.total
          this.loading = false
        }
      )
    },
    // 参数系统内置字典翻译
    typeFormat(row, column) {
      return this.selectDictLabel(this.typeOptions, row.configType)
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        configId: null,
        configName: null,
        configKey: null,
        configValue: null,
        configType: 'Y',
        remark: null
      }
      this.resetForm('form')
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
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加参数'
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.configId)
      this.single = selection.length != 1
      this.multiple = !selection.length
      this.checked = this.configList.length === selection.length
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const configId = row.configId || this.ids
      getConfig(configId).then((response) => {
        this.form = response.data
        this.open = true
        this.title = '修改参数'
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.$confirm(
            `是否确定${this.form.configId != undefined ? '修改' : '新增'}参数?`,
            '警告',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          )
            .then(() => {
              return this.form.configId != undefined
                ? updateConfig(this.form)
                : addConfig(this.form)
            })
            .then((res) => {
              this.msgSuccess(
                `${this.form.configId != undefined ? '修改' : '新增'}成功~`
              )
              this.open = false
              this.getList()
            })
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const configIds = row.configId || this.ids
      this.$confirm(
        `是否确认${
          typeof configIds === 'object'
            ? '批量删除'
            : '删除"' + row.configName + '"'
        }参数配置？`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return delConfig(configIds)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('删除成功')
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        'system/config/export',
        {
          ...this.queryParams
        },
        `config_${new Date().getTime()}.xlsx`
      )
    },
    /** 清理缓存按钮操作 */
    handleClearCache() {
      clearCache().then((response) => {
        this.msgSuccess('清理成功')
      })
    },
    // 全部选中
    toggleSelection(value) {
      if (value) {
        this.$refs.multipleTable.clearSelection()
        this.configList.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    }
  }
}
</script>
