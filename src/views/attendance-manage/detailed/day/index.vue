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
      <el-form-item label="日期" prop="month">
        <RangePicker
          clearable
          size="small"
          :s-time.sync="queryParams.beginTime"
          :e-time.sync="queryParams.endTime"
          placeholder="选择考勤日期"
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
            v-hasPermi="['distribution:attendance:export']"
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
        label="日期"
        align="center"
        prop="calendarTime"
      />
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
        label="班次"
        align="center"
        prop="scheduleTypeName"
      />
      <el-table-column
        label="工作总时长（分钟）"
        align="center"
        prop="workTime"
        width="90px"
      >
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="openDuration(scope.row, 'all')">
            {{ scope.row.workTime }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="班次内异常时长（分钟）"
        align="center"
        prop="scheduleAbnormalTime"
        width="115px"
      >
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="openDuration(scope.row, 'abnormal')">
            {{ scope.row.scheduleAbnormalTime }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="班次内工作时长（分钟）"
        align="center"
        prop="scheduleWorkTime"
        width="115px"
      >
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="openDuration(scope.row, 'withinTheShift')">
            {{ scope.row.scheduleWorkTime }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="班次外工作时长（分钟）"
        align="center"
        prop="scheduleOutWorkTime"
        width="115px"
      >
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="openDuration(scope.row, 'outOfShift')">
            {{ scope.row.scheduleOutWorkTime }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="迟到时长（分钟）"
        align="center"
        prop="behindhandTime"
        width="80px"
      />
      <el-table-column
        label="早退时长（分钟）"
        align="center"
        prop="leaveEarlyTime"
        width="80px"
      />
      <el-table-column label="惩罚金额（元）" align="center" prop="punishAmount" width="80px">
        <template slot-scope="scope">
          {{ scope.row.punishAmount && toDecimal2(scope.row.punishAmount / 100) }}
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
      title="时长"
      :visible.sync="open"
      width="500px"
      append-to-body
    >
      <el-tabs
        v-model="dialogTabName"
        class="day-tab-container"
        type="card"
      >
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane label="班次内异常" name="abnormal" />
        <el-tab-pane label="班次内时长" name="withinTheShift" />
        <el-tab-pane label="班次外时长" name="outOfShift" />
      </el-tabs>
      <el-table :data="durationTypeList" align="center">
        <el-table-column label="开始时间" prop="beginTime">
          <template slot-scope="scope">
            {{ scope.row.beginTime | formatTime }}
          </template>
        </el-table-column>
        <el-table-column label="结束时间" prop="endTime">
          <template slot-scope="scope">
            {{ scope.row.endTime | formatTime }}
          </template>
        </el-table-column>
        <el-table-column label="时长（分钟）" prop="workTime">
          <template slot-scope="scope">
            {{ scope.row.workTime | formatMinute }}
          </template>
        </el-table-column>
        <el-table-column label="异常原因" prop="signOutReasonName" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import {
  listDetails,
  getDetails
} from '@/api/attendance/day'
import DictSelect from '@/components/DictSelect.vue'
import GroupSelect from '@/components/GroupSelect.vue'
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
    QueryTag,
    GroupSelect
  },
  filters: {
    formatTime(val) {
      return moment(val).format('HH:mm')
    },
    formatMinute(val) {
      const minute = Math.floor(val / 60)
      const second = val % 60
      return `${minute}分${second ? second + '秒' : ''}`
    }
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      open: false,
      dialogTabName: 'all',
      durationList: [],
      // 组织机构数据
      orgOptions: [],
      // 总条数
      total: 0,
      // 考勤月明细表格数据
      detailsList: [],
      // 是否显示弹出层
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orderByColumn: 'calendar_day desc , distribution_id',
        isAsc: 'desc',
        beginTime: null,
        endTime: null,
        orgId: null,
        distributionInfo: null,
        distributionStatus: null,
        distributionType: null
      },
      tags: [
        [
          { type: 'orgId', name: '组织' },
          { type: 'distributionInfo', name: '配送员信息' },
          { type: 'date', name: '日期' }
        ]
      ],
      // 配送员组ID集合
      queryParamsGroupIds: []
    }
  },
  computed: {
    durationTypeList() {
      switch (this.dialogTabName) {
        case 'all':
          return this.durationList
        default:
          return this.durationList.filter(item => item.workTimeType === this.dialogTabName)
      }
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
        'distribution/attendance/export/data',
        {
          ...this.queryParams
        }
      )
    },
    openDuration(row, name) {
      this.dialogTabName = name
      const date = moment(row.calendarTime)
      const formatter = 'yyyy-MM-DD HH:mm:ss'
      getDetails({
        distributionId: row.distributionId,
        beginTime: date.startOf('day').format(formatter),
        endTime: date.endOf('day').format(formatter)
      }).then(res => {
        this.durationList = res.rows
        this.open = true
      })
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
    }
  }
}
</script>

<style>
  .day-tab-container .el-tabs__header {
    margin: 0;
  }
</style>
