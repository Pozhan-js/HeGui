<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['customer:customerWechatConfig:add']"
          type="primary"
          size="mini"
          @click="handleAdd"
        >新增授权配置
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
      <el-form-item label="appid" prop="appid">
        <el-input
          v-model="queryParams.appid"
          placeholder="请输入appid"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="公众号token" prop="token">
        <el-input
          v-model="queryParams.token"
          placeholder="请输入公众号token"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="所属分类" prop="category">
        <el-select
          v-model="queryParams.category"
          placeholder="请选择所属分类"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in categoryOptions"
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
            v-hasPermi="['customer:customerWechatConfig:export']"
            >导出
          </el-button>
        </el-col> -->
      </el-row>
    </el-form>

    <el-table
      ref="multipleTable"
      v-loading="loading"
      style="margin-top: 20px"
      :data="customerWechatConfigList"
      :row-key="(row) => row.wechatConfigId"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="80" align="center" />
      <!-- <el-table-column label="主键id" align="center" prop="wechatConfigId" /> -->
      <el-table-column min-width="140" label="appid" align="center" prop="appid" />
      <el-table-column min-width="200" label="appSecret" align="center" prop="appsecret" />
      <el-table-column min-width="120" label="公众号token" align="center" prop="token">
        <template slot-scope="scope">
          <div>{{ scope.row.token }}</div>
          <el-button
            v-if="scope.row.token"
            size="mini"
            type="text"
            @click="copyText(scope.row.token)"
          >复制</el-button>
        </template>
      </el-table-column>
      <el-table-column
        min-width="90"
        label="所属分类"
        align="center"
        prop="category"
        :formatter="categoryFormat"
      />
      <el-table-column
        min-width="90"
        label="状态"
        align="center"
      >
        <template slot-scope="scope">
          <div>{{ statusFormat(scope.row) }}</div>
          <el-button
            v-hasPermi="['customer:customerWechatConfig:status']"
            size="mini"
            type="text"
            @click="
              handleStatus(
                scope.row.wechatConfigId,
                scope.row.status === 0 ? 1 : 0
              )
            "
          >
            {{ scope.row.status === 1 ? "关闭" : "开启" }}
          </el-button>
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
            v-hasPermi="['customer:customerWechatConfig:edit']"
            size="mini"
            type="text"
            @click="handleUpdate(scope.row)"
          >修改
          </el-button>
          <el-button
            v-hasPermi="['customer:customerWechatConfig:remove']"
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
          v-hasPermi="['customer:customerWechatConfig:remove']"
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

    <!-- 添加或修改客户授权微信配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="appid" prop="appid">
          <el-input v-model="form.appid" placeholder="请输入appid" />
        </el-form-item>
        <el-form-item label="appSecret" prop="appsecret">
          <el-input v-model="form.appsecret" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="公众号token" prop="token">
          <el-input v-model="form.token" placeholder="请输入公众号token" />
        </el-form-item>
        <el-form-item label="所属分类" prop="category">
          <el-select
            v-model="form.category"
            style="width: 100%"
            placeholder="请选择所属分类"
          >
            <el-option
              v-for="dict in categoryOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="parseInt(dict.dictValue)"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="this.$store.state.isLoading" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <input
      id="copy_content"
      type="text"
      value=""
      style="position: absolute; top: 0; left: 0; opacity: 0; z-index: -10"
    >
  </div>
</template>

<script>
import {
  addCustomerWechatConfig,
  delCustomerWechatConfig,
  getCustomerWechatConfig,
  listCustomerWechatConfig,
  updateCustomerWechatConfig,
  disabled,
  enabled
} from '@/api/site/platform/customerWechatConfig'

export default {
  name: 'CustomerWechatConfig',
  components: {},
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
      // 客户授权微信配置表格数据
      customerWechatConfigList: [],
      // 全选
      checked: false,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 所属分类(1：app,2：小程序，3公众号)字典
      categoryOptions: [],
      // 状态字典
      statusOptions: [],
      // 删除标志字典
      delFlagOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        params: null,
        extend: null,
        appid: null,
        appsecret: null,
        token: null,
        category: null,
        parentId: null,
        status: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        appid: [
          { required: true, message: 'appid不能为空', trigger: 'blur' }
        ],
        appsecret: [
          { required: true, message: 'appsecret不能为空', trigger: 'blur' }
        ],
        token: [
          { required: true, message: '公众号token不能为空', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '所属分类不能为空', trigger: 'blur' }
        ]

      }
    }
  },
  created() {
    this.getList()
    this.getDicts('customer_category').then((response) => {
      this.categoryOptions = response.data
    })
    this.getDicts('open_close').then((response) => {
      this.statusOptions = response.data
    })
    this.getDicts('sys_yes_no').then((response) => {
      this.delFlagOptions = response.data
    })
  },
  methods: {
    /** 查询客户授权微信配置列表 */
    getList() {
      this.loading = true
      listCustomerWechatConfig(this.queryParams).then((response) => {
        this.customerWechatConfigList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 所属分类(1：app,2：小程序，3公众号)字典翻译
    categoryFormat(row, column) {
      return this.selectDictLabel(this.categoryOptions, row.category)
    },
    // 状态字典翻译
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    // 删除标志字典翻译
    delFlagFormat(row, column) {
      return this.selectDictLabel(this.delFlagOptions, row.delFlag)
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        appid: null,
        appsecret: null,
        token: null,
        category: null
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
      this.resetForm('queryForm')
      this.queryParams.orgId = null
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.wechatConfigId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
      this.checked = this.customerWechatConfigList.length === selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加客户授权微信配置'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const wechatConfigId = row.wechatConfigId || this.ids
      getCustomerWechatConfig(wechatConfigId).then((response) => {
        this.form = {
          appid: response.data.appid,
          appsecret: response.data.appsecret,
          token: response.data.token,
          category: response.data.category
        }
        this.open = true
        this.title = '修改客户授权微信配置'
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.$confirm(
            `是否确认${this.form.wechatConfigId != null ? '修改' : '新增'}客户授权微信配置?`,
            '警告',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          ).then(() => {
            return this.form.wechatConfigId != null ? updateCustomerWechatConfig(this.form) : addCustomerWechatConfig(this.form)
          }).then(res => {
            this.msgSuccess(`${this.form.wechatConfigId != null ? '修改' : '新增'}成功~`)
            this.open = false
            this.getList()
          })
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const wechatConfigIds = row.wechatConfigId || this.ids
      this.$confirm(
        `是否确认${typeof wechatConfigIds === 'object' ? '批量删除' : '删除"' + row.appid + '"'}客户授权微信配置?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return delCustomerWechatConfig(wechatConfigIds)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('删除成功')
        })
    },
    // 配置开关
    handleStatus(id, status) {
      this.$confirm(
        `是否确认${
          { 1: '开启', 0: '关闭' }[status]
        }授权配置?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return status === 0 ? disabled(id) : enabled(id)
        })
        .then(() => {
          this.getList()
          this.msgSuccess(`${{ 1: '开启', 0: '关闭' }[status]}成功`)
        })
    },
    // 复制文字
    copyText(text) {
      // 获取要赋值的input的元素
      const inputElement = document.getElementById('copy_content')
      // 给input框赋值
      inputElement.value = text
      // 选中input框的内容
      inputElement.select()
      // 执行浏览器复制命令
      document.execCommand('Copy')
      this.msgSuccess('复制成功')
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        'customer/customerWechatConfig/export',
        {
          ...this.queryParams
        },
        `customer_customerWechatConfig.xlsx`
      )
    },
    toggleSelection(value) {
      if (value) {
        this.$refs.multipleTable.clearSelection()
        this.customerWechatConfigList.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    }
  }
}
</script>
