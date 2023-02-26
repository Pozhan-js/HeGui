<template>
  <div class="app-container">
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
      <el-form-item label="统计时间">
        <el-date-picker
          v-model="timeValue"
          clearable
          size="small"
          :picker-options="pickerOptions"
          type="datetimerange"
          value-format="yyyy-MM-dd HH:mm:ss"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      <el-form-item label="班次" prop="scheduleType">
        <dict-select v-model="queryParams.scheduleType" dict="distribution_schedule_type" />
      </el-form-item>
      <el-form-item label="签退原因" prop="signOutReason">
        <dict-select v-model="queryParams.signOutReason" dict="sign_out_type" />
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
            v-hasPermi="['distribution:signinrecord:export']"
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
          <span>{{ parseTime(scope.row.calendarTime, "{y}{m}") }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="工作日"
        align="center"
        prop="attendanceMonth"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.calendarTime, "{y}-{m}-{d}") }}</span>
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
        label="电子围栏"
        align="center"
        prop="TODO"
      />
      <el-table-column
        label="状态"
        align="center"
        prop="distributionStatusName"
      />
      <el-table-column label="所属分组" align="center" prop="groupName" />
      <el-table-column label="班次" align="center" prop="scheduleTypeName" />
      <el-table-column label="上班时间" align="center" prop="workOnTime" />
      <el-table-column label="下班时间" align="center" prop="workOffTime" />
      <el-table-column
        label="签到开始时间"
        align="center"
        prop="signInTime"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.signInTime, "{h}:{i}") }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="签退完成时间"
        align="center"
        prop="signOutTime"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.signOutTime, "{h}:{i}") }}</span>
        </template>
      </el-table-column>
      <el-table-column label="工作时长（分钟）" align="center" prop="workTime" width="80px" />
      <el-table-column label="签退原因" align="center" prop="signOutReasonName" />
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
</template>

<script>
import {
  listDetails
} from '@/api/attendance/clockin'
import DictSelect from '@/components/DictSelect.vue'
import GroupSelect from '@/components/GroupSelect.vue'
import { Cascader } from 'ant-design-vue'
import { getOrgTree } from '@/api/utils'
import moment from 'moment'

export default {
  name: 'Details',
  components: {
    DictSelect,
    Cascader,
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
      // 考勤月明细表格数据
      detailsList: [],
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orderByColumn: 'sign_in_time',
        isAsc: 'desc',
        orgId: null,
        distributionInfo: null,
        scheduleType: null,
        signOutReason: null,
        beginTime: null,
        endTime: null,
        distributionType: null,
      },
      timeValue: null,
      pickerOptions: {
        shortcuts: [
          {
            text: '今天',
            onClick(picker) {
              const start = new Date(moment(new Date()).startOf('day'))
              const end = new Date(moment(new Date()).endOf('day'))
              picker.$emit('pick', [
                new Date(moment(start).startOf('day')),
                new Date(moment(end).endOf('day'))
              ])
            }
          },
          {
            text: '昨天',
            onClick(picker) {
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24)
              picker.$emit('pick', [
                new Date(moment(start).startOf('day')),
                new Date(moment(start).endOf('day'))
              ])
            }
          },
          {
            text: '近七天',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [
                new Date(moment(start).startOf('day')),
                new Date(moment(end).endOf('day'))
              ])
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [
                new Date(moment(start).startOf('day')),
                new Date(moment(end).endOf('day'))
              ])
            }
          }
        ]
      },
      // 配送员组ID集合
      queryParamsGroupIds: []
    }
  },
  watch: {
    queryParamsGroupIds(val, preVal) {
       this.queryParams.groupIds =  val.length ? val.join(',') : undefined
    },
  },
  created() {
    this.getList()
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
      }
    })
  },
  methods: {
    /** 查询考勤月明细列表 */
    getList() {
      this.loading = true
      if (this.timeValue?.length === 2) {
        this.queryParams.beginTime = this.timeValue[0]
        this.queryParams.endTime = this.timeValue[1]
      } else {
        this.queryParams.beginTime = null
        this.queryParams.endTime = null
      }
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
      this.resetForm('queryForm')
      this.timeValue = null
      this.queryParams.beginTime = null
      this.queryParams.endTime = null
      this.queryParamsGroupIds = []
      this.queryParams.groupIds = null
      this.queryParams.orgId = null
      this.handleQuery()
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        'distribution/signinrecord/export/data',
        {
          ...this.queryParams
        }
      )
    }
  }
}
</script>
