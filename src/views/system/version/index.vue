<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:version:add']"
          type="primary"
          size="mini"
          @click="handleAdd"
        >新建版本
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
      <!-- <el-form-item
        label="版本号"
        prop="versionNo"
      >
        <el-input
          v-model="queryParams.versionNo"
          placeholder="请输入版本号"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->
      <el-form-item label="当前版本" prop="versionNo">
        <el-select
          v-model="queryParams.versionNo"
          placeholder="请选择当前版本"
          clearable
          size="small"
        >
          <el-option
            v-for="version in versionstatusOptions"
            :key="version"
            :label="version"
            :value="version"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="使用端" prop="appType">
        <el-select
          v-model="queryParams.appType"
          placeholder="请选择使用端"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in appTypeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="系统" prop="sysType">
        <el-select
          v-model="queryParams.sysType"
          placeholder="请选择系统类型"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in sysTypeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择更新状态"
          clearable
          size="small"
        >
          <el-option
            v-for="status in pubStatueOptions"
            :key="status.value"
            :label="status.label"
            :value="status.value"
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
            v-hasPermi="['system:version:list']"
            class="blue-btn"
            type="primary"
            size="mini"
            @click="handleQuery"
          >筛选</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button class="gray-btn" size="mini" @click="resetQuery">重置</el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table
      ref="multipleTable"
      v-loading="loading"
      :max-height="maxHeight"
      style="margin-top: 20px"
      :data="versionList"
      :row-key="(row) => row.id"
    >
      <el-table-column min-width="70" label="版本号" align="center" prop="versionNo" />
      <el-table-column
        min-width="90"
        label="使用端"
        align="center"
        prop="appType"
        :formatter="appTypeFormat"
      />
      <el-table-column
        min-width="100"
        label="更新时间"
        align="center"
      >
        <template slot-scope="{row}">
          <break-time :date-time="row.updateDate"/>
        </template>
      </el-table-column>

      <el-table-column
        min-width="100"
        label="创建时间"
        align="center"
      >
        <template slot-scope="{row}">
          <break-time :date-time="row.createDate"/>
        </template>
      </el-table-column>
      <!-- <el-table-column label="版本内容" align="center" prop="versionContent" /> -->
      <el-table-column min-width="100" label="已更新人数" align="center" prop="upgradeCount" />

      <el-table-column
        min-width="90"
        label="上线状态"
        align="center"
        prop="status"
        :formatter="statusFormat"
      />

      <el-table-column
        min-width="90"
        label="升级策略"
        align="center"
        prop="upStrategy"
        :formatter="upStrategyFormat"
      />
      <el-table-column min-width="100" label="发布账号" align="center" prop="pubByName" />
      <el-table-column
        min-width="100"
        label="发布时间"
        align="center"
        prop="upDate"
      >
        <template slot-scope="{row}">
          {{ formatDate(row.upDate)[0] }}<br>
          {{ formatDate(row.upDate)[1] }}
        </template>
      </el-table-column>
      <el-table-column
        min-width="300"
        label="安装包地址"
        align="center"
        prop="appPackagePath"
      />
      <el-table-column min-width="100" label="操作系统类型" align="center" prop="sysType" />
      <el-table-column
        min-width="76"
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['system:version:query']"
            size="mini"
            type="text"
            @click="handleUpdate(scope.row, true)"
          >查看
          </el-button>
          <el-button
            v-hasPermi="['system:version:edit']"
            size="mini"
            type="text"
            :disabled="updateable(scope.row)"
            @click="handleUpdate(scope.row)"
          >修改
          </el-button>
          <el-button
            v-hasPermi="['system:version:publish']"
            size="mini"
            type="text"
            :disabled="!!scope.row.status"
            @click="handlePublish(scope.row)"
          >发布
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
    <!-- 添加或修改app版本控制对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px" :disabled="isReview">
        <el-form-item label="版本号" prop="versionNo">
          <el-input v-model="form.versionNo" placeholder="请输入版本号" />
        </el-form-item>
        <el-form-item label="使用端" prop="appType">
          <el-select v-model="form.appType" placeholder="请选择使用端">
            <el-option
              v-for="dict in appTypeOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="parseInt(dict.dictValue)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="系统" prop="sysType">
          <el-select v-model="form.sysType" placeholder="请选择操作系统">
            <el-option
              v-for="dict in sysTypeOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="升级策略" prop="upStrategy">
          <el-radio-group v-model="form.upStrategy">
            <el-radio
              v-for="upStrategy in upStrategyOptions"
              :key="upStrategy.value"
              :label="upStrategy.value"
              :value="upStrategy.value"
            >{{ upStrategy.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="发布时间" prop="upDate">
          <el-date-picker
            v-model="form.upDate"
            clearable
            size="small"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="选择发布时间"
          />
        </el-form-item>

        <el-form-item label="发布状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="status in pubStatueOptions"
              :key="status.value"
              :label="status.value"
              :value="status.value"
            >{{ status.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-show="form.sysType == 'android'" label="安装包" prop="appPackagePath">
          <FileUpload
            ref="upload"
            v-model="apkUrl"
            :file-url="apkFileUrl"
            :file-size="100"
            :show-file-list="false"
            type="apk"
            :file-type="['apk']"
            @beforeUpload="handleBeforeUpload"
          />
        </el-form-item>
        <el-form-item label="安装包地址" prop="appPackagePath">
          <el-input
            v-model="form.appPackagePath"
            placeholder="请输入安装包地址"
          />
        </el-form-item>
        <el-form-item label="版本内容" prop="versionContent">
          <el-input
            v-model="form.versionContent"
            type="textarea"
            :rows="2"
            placeholder="请输入内容"
          />
        </el-form-item>
      </el-form>
      <div v-if="!isReview" slot="footer" class="dialog-footer">
        <el-button
          v-hasPermi="['system:version:edit']"
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
  addVersion,
  getVersion,
  listVersion,
  updateVersion,
  updateStatusVersion,
  listVersionNo
} from '@/api/system/version'
import FileUpload from '@/components/FileUpload'
import SetTableMaxHeight from '@/mixin/SetTableMaxHeight'

const sysPathObj = {
  ios: 'itms-apps://itunes.apple.com/cn/app/id1591000870?mt=8',
  android: ''
}

export default {
  name: 'Version',
  components: {
    FileUpload
  },
  mixins: [SetTableMaxHeight],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 组织机构数据
      orgOptions: [],
      // 总条数
      total: 0,
      // app版本控制表格数据
      versionList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // app平台字典
      appTypeOptions: [],
      // 上线状态字典
      statusOptions: [],
      // 系统版本号
      versionstatusOptions: [],
      // 操作系统类型  1、ios; 2、android;字典
      sysTypeOptions: [],

      // 更新状态
      pubStatueOptions: [],
      // 升职策略
      upStrategyOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        versionNo: '',
        params: null,
        extend: null,
        appType: null,
        sysType: null,
        status: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        versionNo: [
          { required: true, message: '版本号不能为空', trigger: 'blur' }
        ],
        appType: [
          { required: true, message: '使用端不能为空', trigger: 'blur' }
        ],
        sysType: [{ required: true, message: '系统不能为空', trigger: 'blur' }],
        upStrategy: [
          { required: true, message: '升级策略不能为空', trigger: 'blur' }
        ],
        upDate: [
          { required: true, message: '发布时间不能为空', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '发布状态不能为空', trigger: 'blur' }
        ],
        appPackagePath: [
          { required: true, message: '安装包地址不能为空', trigger: 'blur' }
        ],
        versionContent: [
          { required: true, message: '版本内容不能为空', trigger: 'blur' }
        ]
      },
      // 版本查看
      isReview: false,
      // apk上传api地址
      apkFileUrl: '/system/mss/version/upload',
      // 文件地址前缀
      prefix: sessionStorage.getItem('prefix'),
      // apk服务器地址
      apkUrl: ''
    }
  },
  watch: {
    apkUrl(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.$set(this.form, 'appPackagePath', newVal ? this.prefix + newVal : '')
        sysPathObj.android = this.form.appPackagePath
      }
    },
    'form.sysType'(val) {
      this.$set(this.form, 'appPackagePath', sysPathObj[val])
    }
  },
  created() {
    this.getList()
    this.pubStatueOptions = [
      { value: 0, label: '未发布' },
      { value: 1, label: '已发布' }
    ]
    this.upStrategyOptions = [
      { value: 1, label: '不要求' },
      { value: 2, label: '提醒' },
      { value: 3, label: '强制' }
    ]
    this.getDicts('sys_app_type').then((response) => {
      this.appTypeOptions = response.data
    })
    this.getDicts('sys_sys_type').then((response) => {
      this.sysTypeOptions = response.data
    })
    // 查询系统版本号
    listVersionNo().then((response) => {
      this.versionstatusOptions = response.data
    })
  },
  methods: {
    /** 查询app版本控制列表 */
    getList() {
      this.loading = true
      listVersion(this.queryParams).then((response) => {
        this.versionList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // app平台字典翻译
    appTypeFormat(row) {
      return this.selectDictLabel(this.appTypeOptions, row.appType)
    },
    // 上线状态字典翻译
    statusFormat(row) {
      return this.pubStatueOptions[row.status].label
    },
    // 操作系统类型  1、ios; 2、android;字典翻译
    sysTypeFormat(row) {
      return this.selectDictLabel(this.sysTypeOptions, row.sysType)
    },
    // 升级策略
    upStrategyFormat(row) {
      return this.upStrategyOptions[row.upStrategy - 1].label
    },
    // 是否已发布
    updateable(row) {
      return (
        row.status == 1 && new Date(row.upDate).getTime() < new Date().getTime()
      )
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        upStrategy: 1,
        status: 0
      }

      this.resetAndroidPath()
      this.resetForm('form')
    },
    // 重置android下载路径
    resetAndroidPath() {
      this.apkUrl = ''
      if (this.$refs.upload) {
        this.$refs.upload.fileList = []
        this.$refs.upload.currentFile = null
      }
      sysPathObj.android = ''
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.isReview = false
      this.title = '添加版本控制'
    },
    /** 修改按钮操作 */
    handleUpdate(row, isReview) {
      this.isReview = isReview
      this.reset()
      const id = row.id || this.ids
      getVersion(id).then((response) => {
        this.form = response.data
        if (this.form.sysType == 'android') sysPathObj.android = this.form.appPackagePath
        this.open = true
        this.title = `${isReview ? '查看' : '修改'}版本控制`
      })
    },
    /** 发布按钮操作 */
    handlePublish(row) {
      this.$confirm(`是否确认发布系统版本${row.versionNo}?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          return updateStatusVersion({
            id: row.id,
            status: row.status ? 0 : 1
          })
        })
        .then(() => {
          this.getList()
          this.msgSuccess('发布成功')
        })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const type = this.form.id != null ? '修改' : '新增'
          this.$confirm(`是否确认${type}版本控制?`, '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(() => {
              return this.form.id != null
                ? updateVersion(this.form)
                : addVersion(this.form)
            })
            .then(() => {
              this.msgSuccess(`${type}app版本控制成功`)
              this.open = false
              this.resetAndroidPath()
              this.getList()
            })
        }
      })
    },
    // 文件上传前清除原路径
    handleBeforeUpload() {
      this.apkUrl = ''
      this.form.appPackagePath = ''
      sysPathObj.android = ''
    }
  }
}
</script>
