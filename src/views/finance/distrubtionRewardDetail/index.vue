<template>
  <pro-table
    ref="proTable"
    :api-config="{ url: '/attendanceReward/list/byCondition' }"
    :columns="columns"
    :row-key="(row) => row.examineGradeRuleId"
    :before-search-submit="formatSearchParams"
    :params = "params"
    :on-reset="handleReset"
  >
    <el-form-item slot="orgId_search_item" label="组织"  clearable>
      <org-select v-model="params.orgId"/>
    </el-form-item>
    <el-form-item slot="groupId_search_item" label="所属分组">
      <group-select :orgId="params.orgId" v-model="queryParamsGroupIds" clearable/>
    </el-form-item>
    <el-form-item slot="distributionInfo_search_item" label="配送员信息">
      <el-input v-model="params.distributionInfo" placeholder="配送员姓名或手机号" clearable/>
    </el-form-item>
    <template #search-btns="obj">
      <el-col :span="1.5">
        <el-button v-hasPermi="['finance:attendanceReward:export']" size="mini" @click="handleExport(obj)">导出</el-button>
      </el-col>
    </template>
    
    <template #distributionRole_column="item">
      <el-table-column
        align="center"
        :label="item.label"
        :formatter="distribustionRoleFormat"
      />
    </template>
  </pro-table>
</template>

<script>
import ProTable from '@/components/ElProComponents/ProTable'
import GroupSelect from '@/components/GroupSelect.vue'
import OrgSelect from '@/components/OrgSelect.vue'


export default {
  components: {
    ProTable,
    GroupSelect,
    OrgSelect
  },
  data() {
    return {
      queryParamsGroupIds: [],
      params: {
        distributionInfo: ''
      },
      form: {},
      isLeaderDicts: {},
      distributionTypeDicts: {}
    }
  },
  watch: {
    queryParamsGroupIds(val, preVal) {
      this.params.groupIds = val.length ? val.join(',') : undefined
    },
  },
  computed: {
    columns() {
      // 配送员信息
      const renderDistributionInfo = ({record}) =>{
        return `${record.distributionName} ${record.distributionPhone}`
      }
      const rows = [
        { label: '组织', prop: 'orgId', hideInTable: true, valueType: 'treeSelect', order: 0 },
        { label: '所属分组', prop: 'groupId', hideInTable: true, order: 1},
        { label: '日期', prop: 'dimension', minWidth: 90, valueType: 'dateRange', order: 2, paramsRange: ['cycleBeginTime', 'cycleEndTime']}, 
        { label: '配送员编号', prop: 'distributionId', hideInSearch: true, minWidth: 90, valueType: 'text'},
        { label: '配送员信息', prop: 'distributionInfo', minWidth: 130, valueType: 'text', renderText: renderDistributionInfo},
        { label: '组织', prop: 'orgName', hideInSearch: true, minWidth: 130, valueType: 'text', order: 0 },
        { label: '所属分组', prop: 'groupName', hideInSearch: true, minWidth: 100, valueType: 'text',order: 1},
        { label: '是否组长', prop: 'isLeader', hideInTable: true, valueType: 'dictSelect', fieldProps: { dict: 'distribution_is_leader' }},
        { label: '配送员类型', prop: 'distributionType', hideInTable: true, valueType: 'dictSelect', fieldProps: { dict: 'distribution_type' }},
        { label: '是否组长/专兼职', prop: 'distributionRole', hideInSearch: true,  minWidth: 100, valueType: 'text'},
        { label: '质保金首缴时间', prop: 'firstAmountDate', hideInSearch: true, minWidth: 100, valueType: 'dateTime', render: (h, {record}) => (<BreakTime dateTime={record.firstAmountDate} />)},
        { label: '班次', prop: 'scheduleType', valueType: 'dictSelect', hideInSearch: true, fieldProps: { dict: 'distribution_schedule_type' }},
        { label: '工作总时长（分钟）', prop: 'totalWorkTime', hideInSearch: true, minWidth: 100, 
          render:(h, {record}) => (
            <jump path="/attendance-manage/detailed/day" query={{distributionInfo: record.distributionName}}>
              { record.totalWorkTime }
            </jump>
        )},
        { label: '排班内工作时长（分钟）', prop: 'scheduleWorkTime', hideInSearch: true, minWidth: 100, 
          render:(h, {record}) => (
            <jump path="/attendance-manage/detailed/day" query={{distributionInfo: record.distributionName}}>
              { record.scheduleWorkTime }
            </jump>
        )},
        { label: '总订单数', prop: 'totalOrder', hideInSearch: true, minWidth: 100,  render:(h, {record}) => (
            <jump path="/order/delivery/allorder" query={{distribution: record.distributionName}}>
              { record.totalOrder }
            </jump>
        )},
        { label: '超时订单数', prop: 'overtimeOrderNum', hideInSearch: true, minWidth: 100,  render:(h, {record}) => (
            <jump path="/order/delivery/allorder" query={{distribution: record.distributionName}}>
              { record.overtimeOrderNum }
            </jump>
        )},
        { label: '投诉订单数', prop: 'complaintOrderNum', hideInSearch: true, minWidth: 100,  render:(h, {record}) => (
            <jump path="/order/delivery/allorder" query={{distribution: record.distributionName}}>
              { record.complaintOrderNum }
            </jump>
        )},
        { label: '自然订单数', prop: 'naturalOrderNum', hideInSearch: true, minWidth: 100,  render:(h, {record}) => (
            <jump path="/order/delivery/allorder" query={{distribution: record.distributionName, orderType: 'initiative'}}>
              { record.naturalOrderNum }
            </jump>
        )},
        { label: '奖励类型', prop: 'type', minWidth: 80, valueType: 'dictSelect', fieldProps: { dict: 'attendance_reward_type' }},
        { label: '奖励金额', prop: 'rewardAmount', hideInSearch: true, minWidth: 100, valueType: 'money'},
      ]
      
      return this.params.isLeader == '1' ? rows : rows.filter(item => !['baseScoreNum', 'executionScore'].includes(item.prop))
    }
  },
  created() {
    this.getDicts('distribution_type').then((res) => {
      this.distributionTypeDicts = res.data
    })
    this.getDicts('distribution_is_leader').then((response) => {
      this.isLeaderDicts = response.data
    })

    if (Object.keys(this.$route.query).length > 0) {
      this.params = Object.assign(this.params, this.$route.query)
    }
  },
  methods: {
    formatSearchParams(obj) {
      return {
        ...obj,
        ...this.params
      }
    },
    handleReset(){
      this.queryParamsGroupIds = []
      this.params.orgId = undefined
      this.params.groupIds = undefined
      this.params.distributionInfo = ''
    },
    handleExport({ getParams }) {
      const params = getParams()
      this.download('attendanceReward/new/export', this.formatSearchParams(params))
    },
    // 字典翻译
    distribustionRoleFormat(row) {
      return this.selectDictLabel(this.isLeaderDicts, row.isLeader) + '/' + this.selectDictLabel(this.distributionTypeDicts, row.distributionType)
    },
  }
}
</script>
