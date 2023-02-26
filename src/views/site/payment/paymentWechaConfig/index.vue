<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['payment:paymentWechatConfig:add']"
          type="primary"
          size="mini"
          @click="handleAdd"
        >新增支付配置
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
      <el-form-item label="名称" prop="configName">
        <el-input
          v-model="queryParams.configName"
          placeholder="请输入名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
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
      <el-form-item label="商户号" prop="mchId">
        <el-input
          v-model="queryParams.mchId"
          placeholder="请输入商户号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="分组" prop="category">
        <el-select
          v-model="queryParams.category"
          placeholder="请选择分组"
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
            v-hasPermi="['payment:paymentWechatConfig:export']"
            >导出
          </el-button>
        </el-col> -->
      </el-row>
    </el-form>

    <el-table
      ref="multipleTable"
      v-loading="loading"
      style="margin-top: 20px"
      :data="paymentWechaConfigList"
      :row-key="(row) => row.wechatConfigId"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="80" align="center" />
      <!-- <el-table-column label="主键id" align="center" prop="wechatConfigId" /> -->
      <el-table-column min-width="90" label="名称" align="center" prop="configName" />
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
      <el-table-column min-width="100" label="商户号" align="center" prop="mchId" />
      <!-- <el-table-column label="商户秘钥" align="center" prop="mchKey" /> -->
      <el-table-column
        min-width="90"
        label="分组"
        align="center"
        prop="category"
        :formatter="categoryFormat"
      />
      <el-table-column
        min-width="90"
        label="支付类型"
        align="center"
        prop="configName"
      />
      <el-table-column
        min-width="80"
        label="状态"
        align="center"
        prop="status"
        :formatter="statusFormat"
      />
      <el-table-column
        min-width="60"
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            @click="handleVerification(scope.row)"
          >验签
          </el-button>
          <el-button
            v-hasPermi="['payment:paymentWechatConfig:status']"
            size="mini"
            type="text"
            @click="
              handleStatus(
                scope.row,
                scope.row.status === 0 ? 1 : 0
              )
            "
          >
            {{ scope.row.status === 1 ? "关闭" : "开启" }}
          </el-button>
          <el-button
            v-hasPermi="['payment:paymentWechatConfig:edit']"
            size="mini"
            type="text"
            @click="handleUpdate(scope.row)"
          >修改
          </el-button>
          <el-button
            v-hasPermi="['payment:paymentWechatConfig:remove']"
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
          v-hasPermi="['payment:paymentWechatConfig:remove']"
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

    <!-- 添加或修改微信支付配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="名称" prop="configName">
          <el-input v-model="form.configName" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="appid" prop="appid">
          <el-input v-model="form.appid" placeholder="请输入appid" />
        </el-form-item>
        <el-form-item label="appSecret" prop="appsecret">
          <el-input v-model="form.appsecret" placeholder="请输入appSecret" />
        </el-form-item>
        <el-form-item label="公众号token" prop="token">
          <el-input v-model="form.token" placeholder="请输入公众号token" />
        </el-form-item>
        <el-form-item label="商户号" prop="mchId">
          <el-input v-model="form.mchId" placeholder="请输入商户号" />
        </el-form-item>
        <el-form-item label="商户秘钥" prop="mchKey">
          <el-input
            v-model="form.mchKey"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 6 }"
            placeholder="请输入商户秘钥"
          />
        </el-form-item>
        <el-form-item label="证书" prop="cert">
          <FileUpload
            v-model="form.cert"
            :type="'certificate'"
            :file-type="['p12']"
          />
        </el-form-item>
        <el-form-item label="证书序列号" prop="serialNo">
          <el-input v-model="form.serialNo" placeholder="请输入证书序列号" />
        </el-form-item>
        <el-form-item label="分组" prop="category">
          <el-select
            v-model="form.category"
            style="width: 100%"
            placeholder="请选择分组"
          >
            <el-option
              v-for="dict in categoryOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="parseInt(dict.dictValue)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="支付类型" prop="tradeType">
          <el-select
            v-model="form.tradeType"
            style="width: 100%"
            placeholder="请选择支付类型"
          >
            <el-option
              v-for="dict in tradeTypeOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
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
  addPaymentWechaConfig,
  delPaymentWechaConfig,
  getPaymentWechaConfig,
  listPaymentWechaConfig,
  updatePaymentWechaConfig,
  enabled,
  disabled,
  getVerification
} from '@/api/site/payment/paymentWechaConfig'
import FileUpload from '@/components/FileUpload'

export default {
  name: 'PaymentWechaConfig',
  components: {
    FileUpload
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
      // 总条数
      total: 0,
      // 微信支付配置表格数据
      paymentWechaConfigList: [],
      // 全选
      checked: false,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 图片前缀
      prefix: sessionStorage.getItem('prefix'),
      // 分组(1：app,2：小程序，3公众号)字典
      categoryOptions: [],
      // 状态字典
      statusOptions: [],
      // 支付类型
      tradeTypeOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        extend: null,
        configName: null,
        appid: null,
        appsecret: null,
        token: null,
        mchId: null,
        category: null,
        status: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        configName: [
          { required: true, message: '配置名称不能为空', trigger: 'blur' }
        ],
        appid: [
          { required: true, message: 'appid不能为空', trigger: 'blur' }
        ],
        appsecret: [
          { required: true, message: 'appSecret不能为空', trigger: 'blur' }
        ],
        token: [
          { required: true, message: 'token不能为空', trigger: 'blur' }
        ],
        mchId: null,
        mchKey: null,
        cert: [
          { required: true, message: '证书不能为空', trigger: 'blur' }
        ],
        serialNo: [
          { required: true, message: '证书序列号不能为空', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '分组不能为空', trigger: 'blur' }
        ],
        tradeType: [
          { required: true, message: '支付类型不能为空', trigger: 'blur' }
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
    this.getDicts('payment_trade_type').then((response) => {
      this.tradeTypeOptions = response.data
    })
  },
  methods: {
    /** 查询微信支付配置列表 */
    getList() {
      this.loading = true
      listPaymentWechaConfig(this.queryParams).then((response) => {
        this.paymentWechaConfigList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 分组(1：app,2：小程序，3公众号)字典翻译
    categoryFormat(row, column) {
      return this.selectDictLabel(this.categoryOptions, row.category)
    },
    // 状态字典翻译
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        configName: null,
        appid: null,
        appsecret: null,
        token: null,
        mchId: null,
        mchKey: null,
        serialNo: null,
        cert: null,
        category: null,
        tradeType: null
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
      this.checked = this.paymentWechaConfigList.length === selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加微信支付配置'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const wechatConfigId = row.wechatConfigId || this.ids
      getPaymentWechaConfig(wechatConfigId).then((response) => {
        this.form = {
          wechatConfigId: response.data.wechatConfigId,
          configName: response.data.configName,
          appid: response.data.appid,
          appsecret: response.data.appsecret,
          token: response.data.token,
          mchId: response.data.mchId,
          mchKey: response.data.mchKey,
          serialNo: response.data.serialNo,
          cert: response.data.cert,
          category: response.data.category,
          tradeType: response.data.tradeType
        }
        this.open = true
        this.title = '修改微信支付配置'
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.$confirm(
            `是否确认${this.form.wechatConfigId != null ? '修改' : '新增'}微信支付配置?`,
            '警告',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          ).then(() => {
            const params = {
              ...this.form,
              cert:
                this.form.cert && this.form.cert.split(this.prefix).length > 1
                  ? this.form.cert.split(this.prefix)[1]
                  : this.form.cert
            }
            return this.form.wechatConfigId != null ? updatePaymentWechaConfig(params) : addPaymentWechaConfig(params)
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
        `是否确认${typeof wechatConfigIds === 'object' ? '批量删除' : '删除"' + row.configName + '"'}微信支付配置?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return delPaymentWechaConfig(wechatConfigIds)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('删除成功')
        })
    },
    // 配置开关
    handleStatus(row, status) {
      this.$confirm(
        `是否确认${
          { 1: '开启', 0: '关闭' }[status]
        }"${row.configName}"支付配置?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return status === 0 ? disabled(row.wechatConfigId) : enabled(row.wechatConfigId)
        })
        .then(() => {
          this.getList()
          this.msgSuccess(`${{ 1: '开启', 0: '关闭' }[status]}成功`)
        })
    },
    // 验签
    handleVerification(row) {
      this.$confirm(
        `是否确定验签"${row.configName}"微信支付配置?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        getVerification(row.tradeType).then(res => {
          this.getList()
          this.msgSuccess(`验签成功`)
        })
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
        'payment/paymentWechaConfig/export',
        {
          ...this.queryParams
        },
        `payment_paymentWechaConfig.xlsx`
      )
    },
    toggleSelection(value) {
      if (value) {
        this.$refs.multipleTable.clearSelection()
        this.paymentWechaConfigList.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    }
  }
}
</script>
