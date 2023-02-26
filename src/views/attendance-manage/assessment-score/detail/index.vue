<template>
  <pro-table
    ref="proTableRef"
    :api-config="{ url: '/examineGradeRecord/list' }"
    :columns="columns"
    :row-key="(row) => row.examineGradeRuleId"
    :before-search-submit="formatSearchParams"
    :on-reset="handleReset"
    :postData="postData"
  >
    <el-form-item slot="orgId_search_item" label="组织">
      <org-select v-model="params.orgId"/>
    </el-form-item>
    <el-form-item slot="groupId_search_item" label="所属分组">
      <group-select :orgId="params.orgId" v-model="queryParamsGroupIds"/>
    </el-form-item>
    <template #search-btns="obj">
      <el-col :span="1.5">
        <el-button v-hasPermi="['distribution:examineGradeRecord:export']" size="mini" @click="handleExport(obj)">导出</el-button>
      </el-col>
    </template>

    <el-tabs
      slot="table-title"
      v-model="params.isLeader"
      class="tabContainer"
      type="card"
      @tab-click="handleTabClick"
    >
      <el-tab-pane
        v-for="dict in isLeaderOptions"
        :key="dict.dictValue"
        :label="dict.dictLabel"
        :name="dict.dictValue"
      />
    </el-tabs>
    <template #action_column_content="{row}">
      <template v-if="row.status == 0">
        <el-button
          v-if="!row.isEdit"
          size="mini"
          type="text"
          @click="row.isEdit = true"
          v-hasPermi="['distribution:examineGradeRecord:edit']"
        >修改
        </el-button>
        <template v-else>
          <el-button
            size="mini"
            type="text"
            @click="handleUpdate(row)"
          >确认
          </el-button>
          <el-button
            size="mini"
            type="text"
            @click="handleCancel(row)"
          >取消
          </el-button>
        </template>
      </template>
    </template>
  </pro-table>
</template>

<script>
import {updateExamineGradeRecord} from "@/api/distribution/examineGradeRecord";
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
        isLeader: '0'
      },
      form: {},
      // 是否组长选项
      isLeaderOptions: []
    }
  },
  watch: {
    queryParamsGroupIds(val, preVal) {
      this.params.groupIds = val.length ? val.join(',') : undefined
    },
  },
  computed: {
    columns() {
      // 动态评分
      const renderDynamicScore = (h, {record}) =>{
        return (<el-input-number disabled = {!record.isEdit} size="mini" v-model= {record.inputDynamicScore} />)
      }
      // 执行评分
      const renderExecutionScore = (h, {record}) =>{
        return (<el-input-number disabled = {!record.isEdit} size="mini" v-model= {record.inputExecutionScore} />)
      }
      // 配送员信息
      const renderDistributionInfo = ({record}) =>{
        return `${record.distributionName} ${record.distributionPhone}`
      }

      const rows = [
        { label: '组织', prop: 'orgId', hideInTable: true, valueType: 'treeSelect', order: 0 },
        { label: '所属分组', prop: 'groupId', hideInTable: true, order: 1},
        { label: '月份', prop: 'period', minWidth: 90, valueType: 'dateMonth', order: 2},
        { label: '配送员', prop: 'distributionInfo', hideInSearch: true, minWidth: 130, valueType: 'text', renderText: renderDistributionInfo},
        { label: '配送员姓名', prop: 'distributionName', hideInTable: true, order: 3, },
        { label: '配送员手机号', prop: 'distributionPhone', hideInTable: true, order: 3},
        { label: '配送员类型', prop: 'distributionType', minWidth: 100, valueType: 'dictSelect', fieldProps: { dict: 'distribution_type' },},
        { label: '组织', prop: 'orgName', hideInSearch: true, minWidth: 130, valueType: 'text', order: 0 },
        { label: '所属分组', prop: 'distributionGroupName', hideInSearch: true, minWidth: 100, valueType: 'text',order: 1},
        { label: '组长基准值', prop: 'baseScoreNum', valueType: 'text'},
        { label: '考勤评分', prop: 'attendanceScore', hideInSearch: true, minWidth: 100, valueType: 'text'},
        { label: '满意度评分', prop: 'satisfactionScore', hideInSearch: true, minWidth: 100, valueType: 'text'},
        { label: '准时率评分', prop: 'punctualityScore', hideInSearch: true, minWidth: 100, valueType: 'text'},
        { label: '执行评分', prop: 'executionScore', hideInSearch: true, minWidth: 136, render: renderExecutionScore},
        { label: '动态考核评分', prop: 'dynamicScore', hideInSearch: true, minWidth: 120, render:renderDynamicScore},
        { label: '总分', prop: 'totalScoreStr', hideInSearch: true, minWidth: 90, hideInSearch: true, valueType: 'text'},
        { label: '操作', prop: 'action', minWidth: 90, hideInSearch: true},
      ]
      
      return this.params.isLeader == '1' ? rows : rows.filter(item => !['baseScoreNum', 'executionScore'].includes(item.prop))
    }
  },
  created() {
    this.getDicts('distribution_is_leader').then((response) => {
      this.isLeaderOptions = response.data
    })
  },
  methods: {
    // 处理数值 新增修改要 * 100    ，详情列表要 100
    formatValues(obj, operator) {
      // 需要处理的数据字段 
      const values = ['satisfactionScore', 'punctualityScore', 'baseScoreNum', 'attendanceScore', 'dynamicScore', 'executionScore']
      for(const key in obj) {
        if(values.includes(key)) obj[key] = operator == '/' ? obj[key] / 100 : obj[key] * 100
      }
    },
    // 处理返回的数据
    postData(data) {
      return data.map(item=>{
        this.formatValues(item, '/')
        return { ...item, isEdit: false, inputExecutionScore: item.executionScore, inputDynamicScore: item.dynamicScore}
      })
    },
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
    },
    // tab 查询
    handleTabClick() {
      this.$refs.proTableRef.reloadAndRest()
    },
    handleExport({ getParams }) {
      const params = getParams()
      this.download('examineGradeRecord/export', this.formatSearchParams(params))
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      const queryParams = {
        examineGradeRecordId: row.examineGradeRecordId,
        dynamicScore: row.inputDynamicScore * 100
      }
      if(row.isLeader == "1") queryParams.executionScore = row.inputExecutionScore * 100
      updateExamineGradeRecord(queryParams).then(res=>{
        this.msgSuccess(`考核评分修改成功`);
        // row.executionScore = row.inputExecutionScore
        // row.dynamicScore = row.inputDynamicScore
        row.isEdit = false
        this.$refs.proTableRef.getListData()
      })
    },
    /** 取消按钮操作 */
    handleCancel(row) {
      row.inputExecutionScore = row.executionScore
      row.inputDynamicScore = row.dynamicScore
      row.isEdit = false
    }
  }
}
</script>
