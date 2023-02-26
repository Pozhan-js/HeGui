<template>
  <div class="app-container">
    <el-form
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
       <el-form-item label="所属分组" prop="groupId">
        <group-select :orgId="queryParams.orgId" v-model="queryParamsGroupIds"/>
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
      <el-form-item label="配送员类型" prop="distributionType">
        <dict-select v-model="queryParams.distributionType" clearable dict="distribution_type"/>
      </el-form-item>
      <el-form-item label="月份" prop="month">
        <RangeCalendar
          time-type="2"
          :s-time.sync="queryParams.beginTime"
          :e-time.sync="queryParams.endTime"
        />
      </el-form-item>
      <!-- <el-form-item label="状态" prop="distributionStatus">
        <dict-select v-model="queryParams.distributionStatus" dict="distribution_job_status" />
      </el-form-item> -->
      <el-form-item>
        <query-tag :tags="tags" @close-tag="handleCloseTag" />
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
        <el-col :span="1.5">
          <el-button
            v-hasPermi="['distribution:attendance:details:export']"
            size="mini"
            @click="handleExport"
          >导出
          </el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table
      v-loading="loading"
      style="margin-top: 20px"
      :data="detailsList"
    >
      <el-table-column
        label="月份"
        align="center"
        prop="attendanceMonth"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.attendanceMonth, "{y}-{m}") }}</span>
        </template>
      </el-table-column>
      <el-table-column label="组织" align="center" prop="orgName" />
      <el-table-column label="供应商名称" align="center" prop="shopName" />
      <el-table-column
        label="配送员"
        align="center"
        prop="distributionName"
      />
      <el-table-column
        label="手机号"
        align="center"
        prop="distributionPhone"
      />
      <el-table-column
        label="配送员类型"
        align="center"
        prop="distributionTypeName"
      />
      <el-table-column
        label="状态"
        align="center"
        prop="distributionStatusName"
      />
      <el-table-column label="所属分组" align="center" prop="groupName" />
      <el-table-column
        label="排班内应到天数"
        align="center"
        prop="scheduleShouldDays"
      />
      <el-table-column
        label="排班内实到天数"
        align="center"
        prop="scheduleAttendanceDays"
      />
      <el-table-column
        label="排班内迟到天数"
        align="center"
        prop="scheduleLateDays"
      />
      <el-table-column
        label="排班内早退天数"
        align="center"
        prop="scheduleLeaveEarlyDays"
      />
      <el-table-column
        label="排班内缺勤天数"
        align="center"
        prop="scheduleAbsenteeismDays"
      />
      <el-table-column
        label="排班外实到天数"
        align="center"
        prop="scheduleOutDays"
      />
      <el-table-column
        label="排班外工作时长（分钟）"
        align="center"
        prop="scheduleOutWorkTime"
      />
      <el-table-column label="惩罚金额（元）" align="center" prop="punishAmount" width="80px">
        <template slot-scope="scope">
          {{ scope.row.punishAmount && toDecimal2(scope.row.punishAmount / 100) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" prop="action" width="80px">
        <template slot-scope="{row}">
          <el-button v-if="row.scheduleShouldDays != 0" type="text" v-hasPermi="['distribution:attendance:appeal:add']" @click="handleAppeal(row)">申诉</el-button>
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

    <el-dialog
      ref="dialog"
      title="申诉"
      :visible.sync="open"
      append-to-body
      width="800px"
      @closed="resetForm"
    > 
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="120px"
      > 
        <el-form-item label="申诉类型" prop="appealType">
          <dict-select v-model="form.appealType" dict="attendance_appeal_type"/>
        </el-form-item>
        <el-form-item label="申诉前后" prop="appealAfterDays">
          由{{currentAppealRow[form.appealType] ? currentAppealRow[form.appealType] : '-'}}天改为
          <el-input-number :min="0" :max="31" v-model="form.appealAfterDays"/>
          天
        </el-form-item>
        <el-form-item label="申诉内容" prop="content">
          <el-input 
            type="textarea" 
            v-model="form.content"  
            placeholder="请输入申诉内容"
            :autosize="{ minRows: 3, maxRows: 5 }"
            show-word-limit />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          :loading="this.$store.state.isLoading"
          @click="submitForm"
        >确 定</el-button>
        <el-button @click="open = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listDetails,
  addAppeal
} from '@/api/attendance/month'
import DictSelect from '@/components/DictSelect.vue'
import GroupSelect from '@/components/GroupSelect.vue'
import RangeCalendar from '@/components/RangeCalendar.vue'
import { Cascader } from 'ant-design-vue'
import QueryTag from '@/components/QueryTag'
import { getOrgTree } from '@/api/utils'
import moment from 'moment'
import { flatten, searchSuperior } from '@/utils/array'


export default {
  name: 'Details',
  components: {
    DictSelect,
    Cascader,
    RangeCalendar,
    QueryTag,
    GroupSelect
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 组织机构数据
      orgOptions: [],
      // 总条数
      total: 0,
      // 考勤月明细表格数据
      detailsList: [],
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        beginTime: moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD 00:00:00'),
        endTime: moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD HH:mm:ss'),
        orgId: null,
        distributionInfo: null,
        distributionType: null,
        distributionStatus: null
      },
      tags: [
        [
          { type: 'orgId', name: '组织' },
          { type: 'distributionInfo', name: '配送员信息' },
          { type: 'date', name: '月份' }
        ]
      ],
      // 配送员组ID集合
      queryParamsGroupIds: [],
      // 申诉表单数据
      form: {},
      // 表单验证
      rules: {
        appealType: [{required: true,  message: '请选择申诉类型', trigger: 'change'}],
        appealAfterDays: [
          {required: true,  message: '请输入申诉天数', trigger: 'blur'},
          {validator: (rule, value, callback) => {
            if(value == this.currentAppealRow[this.form.appealType]) {
              return callback(new Error('申诉后天数不能等于申诉前天数'))
            } else if(value > this.currentAppealRow.scheduleShouldDays ) {
              return callback(new Error('申诉后天数不能大于应到天数'))
            } else {
              return callback()
            }
          }, trigger: 'blur'}
        ],
        content: [{required: true,  message: '申诉内容不能为空', trigger: 'blur'}],
      },
      // 当前考勤申诉对像
      currentAppealRow: {}
    }
  },
  watch: {
    queryParamsGroupIds(val, preVal) {
       this.queryParams.groupIds =  val.length ? val.join(',') : undefined
    },
  },
  created() {
    const hasRouteQuery = Object.keys(this.$route.query).length
    !hasRouteQuery && this.getList()
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
        if (hasRouteQuery) {
          this.queryToParams(this.$route.query)
          this.getList()
        }
      }
    })
  },
  methods: {
    /** 查询考勤月明细列表 */
    getList() {
      this.loading = true
      listDetails(this.queryParams).then((response) => {
        this.detailsList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams.beginTime = null
      this.queryParams.endTime = null
      this.queryParamsGroupIds = []
      this.queryParams.groupIds = null
      this.queryParams.orgId = null
      this.resetForm('queryForm')
      if (Object.keys(this.$route.query).length) {
        this.$router.replace({ query: {}})
      }
      this.handleQuery()
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        'attendance/month/export/data',
        {
          ...this.queryParams
        }
      )
    },
    queryToParams(query) {
      const params = Object.create(null)
      Object.keys(query).forEach(key => {
        if (key === 'date') {
          const formatter = 'yyyy-MM-DD HH:mm:ss'
          const date = moment(query.date)
          params.beginTime = date.startOf('month').format(formatter)
          params.endTime = date.endOf('month').format(formatter)
        } else if (key === 'orgId') {
          const orgArr = flatten(this.orgOptions, 'children')
          params.orgId = searchSuperior(query.orgId, 'id', orgArr, 'parentId')
        } else {
          params[key] = query[key]
        }
      })
      this.queryParams = {
        ...this.queryParams,
        ...params
      }
    },
    handleCloseTag() {
      this.queryParams.beginTime = null
      this.queryParams.endTime = null
      this.queryParams.orgId = null
      this.queryParams.distributionInfo = null
    },
    // 申诉
    handleAppeal(row) {
      this.currentAppealRow = row
      this.open = true
    },
    resetForm() {
      this.form = {}
    },
    // 提交申诉
    submitForm(){
      this.$refs['form'].validate((valid) => {
        if(valid) {
          this.$confirm(
            `是否确认申诉`,
            '警告',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          )
            .then(() => {
              this.form.attendanceMonthDetailsId =  this.currentAppealRow.attendanceMonthDetailsId
              this.form.appealBeforeDays = this.currentAppealRow[this.form.appealType]
              return addAppeal(this.form)
            })
            .then(() => {
              this.msgSuccess(`申诉成功！`)
              this.open = false
            })
        }
      })
    }
  }
}
</script>
