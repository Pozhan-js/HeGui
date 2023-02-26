<template>
  <div v-if="!againOptions.open" class="app-container">
    <el-form
      v-show="showSearch"
      ref="queryForm"
      class="search-form"
      :model="queryParams"
      :inline="true"
      label-width="120px"
    >
      <el-form-item label="组织" prop="orgId">
        <Cascader
          v-model="queryParams.orgId"
          :options="orgOptions"
          placeholder="请选择所在组织"
          change-on-select
          :field-names="{ value: 'id', label: 'label', children: 'children' }"
        />
      </el-form-item>
      <el-form-item label="所属分组" prop="groupIds">
        <group-select :orgId="queryParams.orgId" v-model="queryParamsGroupIds"/>
      </el-form-item>
      <el-form-item label="月份" prop="cycleTime">
        <RangeCalendar
          time-type="2"
          :s-time.sync="queryParams.beginTime"
          :e-time.sync="queryParams.endTime"
        />
      </el-form-item>
      <el-form-item label="配送员类型" prop="distributionType">
        <dict-select v-model="queryParams.distributionType" clearable dict="distribution_type" @get-dict-done = "getDistributionDict" />
      </el-form-item>
       <el-form-item label="配送员" prop="distributionInfo">
        <el-input
          v-model="queryParams.distributionInfo"
          placeholder="姓名/手机号/编号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-row
        :gutter="15"
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
        <el-col :span="1.5">
          <el-button
            v-hasPermi="['distribution:schedule:export']"
            size="mini"
            @click="handleExport"
          >导出
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            v-hasPermi="['distribution:schedule:import']"
            size="mini"
            @click="handleImportExport"
          >导入
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            v-hasPermi="['distribution:schedule:export:template']"
            size="mini"
            @click="openExportModal"
          >导出模板
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-tabs v-model="monthTab" type="card" class="workforce-tab tabContainer">
      <el-tab-pane label="上半月" name="firstHalf" />
      <el-tab-pane label="下半月" name="latterHalf" />
    </el-tabs>
    <el-table
      v-loading="loading"
      :data="scheduleList"
    >
      <el-table-column label="月份" align="center" prop="cycleTime" />
      <el-table-column label="组织" align="center" prop="orgName" />
      <el-table-column label="配送员信息" align="center" prop="distributionName" />
      <el-table-column label="电话" align="center" prop="distributionPhone" />
      <el-table-column label="状态" align="center" prop="distributionStatusName" />
      <el-table-column label="所属分组" align="center" prop="groupName" />
      <el-table-column label="配送员类型" align="center" prop="distributionType" :formatter="distributionTypeFormat"/>
      <el-table-column v-for="day in monthList" :key="day" :label="day + 1 + ''" align="center" width="60px">
        <template slot-scope="scope">
          <span v-if="scope.row.distributionAttendanceScheduleDetails[day]">
            {{ scope.row.distributionAttendanceScheduleDetails[day].scheduleTypeName }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.distributionStatus === 2"
            v-hasPermi="['distribution:schedule:edit']"
            :disabled="isBeforeMonth"
            :loading="againOptions.loadingIndex === scope.$index"
            size="mini"
            type="text"
            :style="{'pointer-events': againOptions.loadingIndex === -1 ? 'auto' : 'none'}"
            @click="handleUpdate(scope)"
          >
            {{ scope.row.distributionAttendanceScheduleDetails.length ? '重排' : '排班' }}
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

    <!-- 导出考勤排班模板对话框 -->
    <el-dialog
      ref="dialog"
      title="导出考勤模板"
      :visible.sync="open"
      width="500px"
      append-to-body
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="月份" prop="month">
          <el-date-picker
            v-model="form.month"
            clearable
            size="small"
            type="month"
            value-format="yyyy-MM"
            placeholder="选择账期(月份)"
          />
        </el-form-item>
        <el-form-item label="组织" prop="orgId">
          <Cascader
            v-model="form.orgId"
            :options="orgOptions"
            :get-popup-container="() => $refs.dialog.$el"
            placeholder="请选择所在组织"
            change-on-select
            :field-names="{ value: 'id', label: 'label', children: 'children' }"
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item label="所属分组" prop="groupIds">
          <group-select :orgId="form.orgId" v-model="formGroupIds"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          :loading="this.$store.state.isLoading"
          @click="handleExportTemplate"
        >确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 导入排班对话框 -->
    <el-dialog
      title="导入排班"
      :visible.sync="importOptions.open"
      width="800px"
      append-to-body
      @closed="handleImportClosed"
    >
      <el-steps :active="importOptions.step" :finish-status="importOptions.stepStaus" style="margin: 0 60px">
        <el-step title="上传文件" />
        <el-step title="数据校验" />
        <el-step :title="importOptions.stepStaus === 'error' ? '导入失败' : '导入完成'" />
      </el-steps>
      <p v-if="importOptions.stepStaus === 'error'" style="margin: 30px 0 0 40px">
        请导出失败文件：
        <a style="color: #46a6ff;" :href="importOptions.uploadErrorUrl">{{ importOptions.uploadErrorFileName }}</a>
      </p>
      <div slot="footer" style="text-align: right;">
        <el-upload
          v-show="importOptions.step === 0"
          ref="upload"
          :limit="1"
          accept=".xlsx, .xls"
          :action="importOptions.uploadUrl"
          name="file"
          :headers="importOptions.uploadHeaders"
          :on-progress="handleFileUploadProgress"
          :on-change="handleFileChange"
          :on-remove="() => importOptions.disabled = false"
          :on-success="handleFileSuccess"
          :auto-upload="false"
          style="margin-bottom: 20px;"
        >
          <el-button :slot="importOptions.disabled ? 'tip' : 'trigger'" :disabled="importOptions.disabled">选择文件</el-button>
        </el-upload>
        <el-button v-if="importOptions.step === 0" type="primary" @click="submitFileForm">开始上传</el-button>
        <el-button v-else type="primary" :loading="importOptions.uploading" @click="() => importOptions.open = false">确认</el-button>
      </div>
    </el-dialog>
  </div>
  <Again
    v-else
    :row="againOptions.row"
    :dicts="againOptions.dicts"
    :is-sortreset="againOptions.isSortreset"
    @update-success="handleCloseAgain"
    @cancel="handleCloseAgain"
  />
</template>

<script>
import {
  listSchedule,
  firstSchedule
} from '@/api/attendance/workforce'

import GroupSelect from '@/components/GroupSelect.vue'
import DictSelect from '@/components/DictSelect.vue'
import { Cascader } from 'ant-design-vue'
import RangeCalendar from '@/components/RangeCalendar.vue'
import Again from './again.vue'
import { getOrgTree } from '@/api/utils'
import moment from 'moment'
import { getToken } from '@/utils/auth'

export default {
  name: 'Schedule',
  components: {
    DictSelect,
    Cascader,
    RangeCalendar,
    Again,
    GroupSelect
  },
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
      // 考勤排班表格数据
      scheduleList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        params: null,
        distributionInfo: null,
        orgId: null,
        beginTime: null,
        endTime: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        orgId: [{ required: true, message: '组织不能为空', trigger: 'blur' }],
        month: [{ required: true, message: '月份不能为空', trigger: 'blur' }]
      },
      monthTab: 'firstHalf',
      monthData: [],
      againOptions: {
        open: false,
        row: null,
        dicts: null,
        isSortreset: false,
        loadingIndex: -1
      },
      importOptions: {
        open: false,
        step: 0,
        stepStaus: 'process',
        uploadUrl: process.env.VUE_APP_BASE_API + '/attendance/schedule/upload/data',
        uploadHeaders: { Authorization: 'Bearer ' + getToken() },
        uploading: false,
        disabled: false,
        uploadErrorUrl: '',
        uploadErrorFileName: ''
      },
      groupsQuery: {
        pageNum: 1,
        pageSize: 99999,
      },

      distributionDicts: [],
      queryParamsGroupIds: [],
      formGroupIds: []
    }
  },
  computed: {
    monthList() {
      if (this.monthTab === 'firstHalf') {
        return this.monthData.slice(0, 15)
      } else {
        return this.monthData.slice(15)
      }
    },
    isBeforeMonth() {
      return moment(this.queryParams.endTime).isBefore(new Date())
    }
  },
  watch: {
    'queryParams.beginTime'(val, preVal) {
      preVal && this.handleQuery()
      const date = moment(val).endOf('month').date()
      this.monthData = [...new Array(date).keys()]
    },
    queryParamsGroupIds(val, preVal) {
       this.queryParams.groupIds =  val.length ? val.join(',') : undefined
    },
    formGroupIds(val, preVal) {
      this.form.groupIds =  val.length ? val.join(',') : undefined
    }
  },
  created() {
    this.initMonthTime()
    this.getList()
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
        
      }
    })
    this.getDicts('distribution_attendance_schedule_type').then(res => {
      this.againOptions.dicts = res.data
    })
  },
  methods: {
    /** 查询考勤排班列表 */
    getList() {
      this.loading = true
      listSchedule(this.queryParams).then((response) => {
        this.scheduleList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        month: null,
        orgId: null
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
      this.monthTab = 'firstHalf'
      this.initMonthTime()
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 修改按钮操作 */
    handleUpdate({ row, $index }) {
      if (row.distributionAttendanceScheduleDetails.length) {
        this.againOptions.row = row
        this.againOptions.open = true
        this.againOptions.isSortreset = true
      } else {
        this.againOptions.isSortreset = false
        if (this.againOptions.loadingIndex !== -1) {
          return
        }
        this.againOptions.loadingIndex = $index
        firstSchedule({ month: row.cycleTime, distributionId: row.distributionId })
          .then(res => {
            this.againOptions.row = { ...row, distributionAttendanceScheduleDetails: res.data }
            this.againOptions.open = true
          })
          .finally(() => {
            this.againOptions.loadingIndex = -1
          })
      }
    },
    handleCloseAgain() {
      this.againOptions.open = false
      this.againOptions.row = null
      this.againOptions.loadingIndex = -1
      this.getList()
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('attendance/schedule/export/data', {
        ...this.queryParams
      })
    },
    openExportModal() {
      const { beginTime, orgId } = this.queryParams
      this.form = {
        month: moment(beginTime).format('YYYY-MM'),
        orgId
      }
      this.open = true
    },
    handleExportTemplate() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.download('attendance/schedule/export/stencil', {
            ...this.form
          }, {
            ignoreExcelPassword: true
          })
        }
      })
    },
    handleImportExport() {
      this.importOptions.open = true
    },
    initMonthTime() {
      const date = moment()
      const formatter = 'yyyy-MM-DD HH:mm:ss'
      this.queryParams.beginTime = date.startOf('month').format(formatter)
      this.queryParams.endTime = date.endOf('month').format(formatter)
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.importOptions.uploading = true
      this.importOptions.step = 1
    },
    handleFileChange(file) {
      switch (file.status) {
        case 'ready':
          this.importOptions.disabled = true
          break
        case 'success':
          if (file?.response.code !== 200) {
            // hack <el-upload> 无法再次 submit
            file.status = 'ready'
          }
          break
      }
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.importOptions.uploading = false
      if (response?.data?.flag) {
        this.importOptions.step = 2
        this.msgSuccess('导入排班成功')
        this.getList()
      } else {
        if (response.code !== 200) {
          this.importOptions.step = 0
          return this.$message.error(response.msg)
        }
        this.$refs.upload.clearFiles()
        this.importOptions.step = 3
        this.importOptions.stepStaus = 'error'
        this.importOptions.uploadErrorUrl = response?.data?.url
        this.importOptions.uploadErrorFileName = response?.data?.fileName
      }
    },
    // 提交上传文件
    submitFileForm() {
      if (this.$refs.upload?.uploadFiles?.length) {
        this.$refs.upload.submit()
      } else {
        this.warning('请先选择文件')
      }
    },
    handleImportClosed() {
      this.$refs.upload.clearFiles()
      this.importOptions.step = 0
      this.importOptions.stepStaus = 'process'
      this.importOptions.uploading = false
      this.importOptions.disabled = false
      this.importOptions.uploadErrorUrl = ''
      this.importOptions.uploadErrorFileName = ''
    },
    // 配送员类型字典
    getDistributionDict(data) {
      this.distributionDicts = data
    },
    // 配送员类型(1专职配送员，2.兼职配送员)字典翻译
    distributionTypeFormat(row, column) {
      return this.selectDictLabel(
        this.distributionDicts,
        row.distributionType
      )
    },
  }
}
</script>

<style>
  .workforce-tab .el-tabs__header {
    margin: 30px 0 0 0;
  }
</style>
