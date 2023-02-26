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
      :data="configList"
      :row-key="(row) => row.unionConfigId"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="80" align="center" />
      <!-- <el-table-column label="主键id" align="center" prop="unionConfigId" /> -->
      <el-table-column min-width="90" label="名称" align="center" prop="configName" />
      <el-table-column min-width="140" label="appid" align="center" prop="appid" />
      <el-table-column min-width="200" label="银联账号" align="center" prop="acctNo" />
      <el-table-column min-width="120" label="apiV3Key" align="center" prop="apiV3Key" />
      <el-table-column min-width="100" label="收银台类型" align="center" prop="assignPayType" :formatter="assignPayTypeFormat" />
      <el-table-column label="业务功能" align="center" prop="bizFunc" :formatter="bizFuncFormat" />
      <el-table-column label="业务类型" align="center" prop="bizType" :formatter="bizTypeFormat" />
      <el-table-column label="直接调用支付工具" align="center" prop="directPayType" :formatter="directPayTypeFormat" />
      <el-table-column label="商户号" align="center" prop="mchId" />
      <el-table-column label="支付完成通知回调地址" align="center" prop="notifyUrl" />
      <el-table-column label="签名" align="center" prop="sign" />
      <el-table-column label="状态" align="center" prop="status" />
      <el-table-column label="subAppId" align="center" prop="subAppid" />
      <el-table-column label="支付页面订单主题" align="center" prop="subject" />
      <el-table-column label="允许的最晚付款时间" align="center" prop="timeoutExpress" />
      <el-table-column label="token" align="center" prop="token" />
      <el-table-column label="tradeType" align="center" prop="tradeType" :formatter="tradeTypeFormat" />
      <el-table-column label="用户标识" align="center" prop="userNo" />
      <el-table-column label="用户标识类型" align="center" prop="userType" :formatter="userTypeFormat" />
      <el-table-column min-width="60" label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
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

    <!-- 添加或修改银联支付配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="名称" prop="configName">
          <el-input v-model="form.configName" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="银联账号" prop="acctNo">
          <el-input v-model="form.acctNo" placeholder="请输入银联账号" />
        </el-form-item>
        <el-form-item label="appid" prop="appid">
          <el-input v-model="form.appid" placeholder="请输入appid" />
        </el-form-item>
        <el-form-item label="商户号" prop="mchId">
          <el-input v-model="form.mchId" placeholder="请输入商户号" />
        </el-form-item>
        <el-form-item label="回调地址" prop="notifyUrl">
          <el-input v-model="form.notifyUrl" placeholder="请输入回调地址" />
        </el-form-item>
        <el-form-item label="签名" prop="sign">
          <el-input v-model="form.sign" placeholder="请输入签名" />
        </el-form-item>
        <el-form-item label="subAppId" prop="subAppid">
          <el-input v-model="form.subAppid" placeholder="请输入subAppId" />
        </el-form-item>
        <el-form-item label="订单主题" prop="subject">
          <el-input v-model="form.subject" placeholder="请输入订单主题" />
        </el-form-item>
        <el-form-item label="允许的最晚付款时间" prop="timeoutExpress">
          <el-input v-model="form.timeoutExpress" placeholder="请输入允许的最晚付款时间" />
        </el-form-item>
        <el-form-item label="token" prop="token">
          <el-input v-model="form.token" placeholder="请输入token" />
        </el-form-item>
        <el-form-item label="用户标识" prop="userNo">
          <el-input v-model="form.userNo" placeholder="请输入用户标识" />
        </el-form-item>
        <el-form-item label="privatekeyPwd" prop="privatekeyPwd">
          <el-input v-model="form.privatekeyPwd" placeholder="请输入privatekeyPwd" />
        </el-form-item>
        <el-form-item label="收银台类型" prop="assignPayType">
          <el-select
            v-model="form.assignPayType"
            style="width: 100%"
            placeholder="请选择收银台类型"
          >
            <el-option
              v-for="dict in assignPayTypeOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="业务功能" prop="bizFunc">
          <el-select
            v-model="form.bizFunc"
            style="width: 100%"
            placeholder="请选择业务功能"
          >
            <el-option
              v-for="dict in funcOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="业务类型" prop="bizType">
          <el-select
            v-model="form.bizType"
            style="width: 100%"
            placeholder="请选择业务类型"
          >
            <el-option
              v-for="dict in bizTypeOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="支付工具" prop="directPayType">
          <el-select
            v-model="form.directPayType"
            style="width: 100%"
            placeholder="请选择支付工具"
          >
            <el-option
              v-for="dict in directPayTypeOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
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
        <el-form-item label="用户类型" prop="userType">
          <el-select
            v-model="form.userType"
            style="width: 100%"
            placeholder="请选择用户类型"
          >
            <el-option
              v-for="dict in userTypeOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="公钥信息" prop="publickeyUrl">
          <FileUpload
            v-model="form.publickeyUrl"
            :file-url="'/paymentUnionConfig/publicKeyUpload'"
            type="unionPay"
            :file-type="['p12','cer']"
          />
        </el-form-item>
        <el-form-item label="私钥信息" prop="privatekeyUrl">
          <FileUpload
            v-model="form.privatekeyUrl"
            :up-data="{ password: 'Jj123456.' }"
            type="unionPay"
            :file-url="'/paymentUnionConfig/privateKeyUpload'"
            :file-type="['p12','cer']"
          />
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
import { listConfig, addConfig, updateConfig, delConfig, getInfo } from '@/api/site/payment/unionPay'
import FileUpload from '@/components/FileUpload'

export default {
  name: 'UnionPay',
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
      // 银联支付配置表格数据
      configList: [],
      // 全选
      checked: false,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 图片前缀
      prefix: sessionStorage.getItem('prefix'),
      // 银联支付用户标识类型
      userTypeOptions: [],
      // 银联支付业务功能
      funcOptions: [],
      // 银联支付业务类型
      bizTypeOptions: [],
      // 银联支付支付工具
      directPayTypeOptions: [],
      // 银联收银台指定支付类型
      assignPayTypeOptions: [],
      // 支付类型
      tradeTypeOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        configName: [
          { required: true, message: '配置名称不能为空', trigger: 'blur' }
        ],
        acctNo: [
          { required: true, message: '银联账号不能为空', trigger: 'blur' }
        ],
        privatekeyUrl: [
          { required: true, message: '银联私钥不能为空', trigger: 'blur' }
        ],
        publickeyUrl: [
          { required: true, message: '银联公钥不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
    this.getDicts('union_pay_userType').then((response) => {
      this.userTypeOptions = response.data
    })
    this.getDicts('union_pay_biz_func').then((response) => {
      this.funcOptions = response.data
    })
    this.getDicts('union_pay_bizType').then((response) => {
      this.bizTypeOptions = response.data
    })
    this.getDicts('union_pay_directPayType').then((response) => {
      this.directPayTypeOptions = response.data
    })
    this.getDicts('union_pay_assignPayType').then((response) => {
      this.assignPayTypeOptions = response.data
    })
    this.getDicts('payment_trade_type').then((response) => {
      this.tradeTypeOptions = response.data
    })
  },
  methods: {
    /** 查询银联支付配置列表 */
    getList() {
      this.loading = true
      listConfig(this.queryParams).then((response) => {
        this.configList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 银联支付用户标识类型
    userTypeFormat(row, column) {
      return this.selectDictLabel(this.userTypeOptions, row.userType)
    },
    // 银联支付业务功能
    bizFuncFormat(row, column) {
      return this.selectDictLabel(this.funcOptions, row.bizFunc)
    },
    // 银联支付业务类型
    bizTypeFormat(row, column) {
      return this.selectDictLabel(this.funcOptions, row.bizType)
    },
    // 银联支付支付工具
    directPayTypeFormat(row, column) {
      return this.selectDictLabel(this.directPayTypeOptions, row.directPayType)
    },
    // 银联收银台指定支付类型
    assignPayTypeFormat(row, column) {
      return this.selectDictLabel(this.assignPayTypeOptions, row.assignPayType)
    },
    // 支付类型
    tradeTypeFormat(row, column) {
      return this.selectDictLabel(this.tradeTypeOptions, row.tradeType)
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {}
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
      this.ids = selection.map((item) => item.unionConfigId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
      this.checked = this.configList.length === selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加银联支付配置'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      getInfo(row.unionConfigId).then((response) => {
        this.form = {
          unionConfigId: response.data.unionConfigId,
          acctNo: response.data.acctNo,
          appid: response.data.appid,
          assignPayType: response.data.assignPayType,
          bizFunc: response.data.bizFunc,
          bizType: response.data.bizType,
          category: response.data.category,
          configName: response.data.configName,
          directPayType: response.data.directPayType,
          mchId: response.data.mchId,
          mchKey: response.data.mchKey,
          notifyUrl: response.data.notifyUrl,
          privatekeyPwd: response.data.privatekeyPwd,
          privatekeyUrl: response.data.privatekeyUrl,
          publickeyUrl: response.data.publickeyUrl,
          sign: response.data.sign,
          subAppid: response.data.subAppid,
          subject: response.data.subject,
          timeoutExpress: response.data.timeoutExpress,
          token: response.data.token,
          tradeType: response.data.tradeType,
          userNo: response.data.userNo,
          userType: response.data.userType
        }
        this.open = true
        this.title = '修改银联支付配置'
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.$confirm(
            `是否确认${this.form.unionConfigId != null ? '修改' : '新增'}银联支付配置?`,
            '警告',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          ).then(() => {
            return this.form.unionConfigId != null ? updateConfig(this.form) : addConfig(this.form)
          }).then(res => {
            this.msgSuccess(`${this.form.unionConfigId != null ? '修改' : '新增'}成功~`)
            this.open = false
            this.getList()
          })
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const unionConfigIds = row.unionConfigId || this.ids
      this.$confirm(
        `是否确认${typeof unionConfigIds === 'object' ? '批量删除' : '删除"' + row.configName + '"'}银联支付配置?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return delConfig(unionConfigIds)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('删除成功')
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
