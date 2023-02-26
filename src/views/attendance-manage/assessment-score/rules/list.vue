<template>
  <pro-table
    ref="proTable"
    :api-config="{ url: '/examineGradeRule/list' }"
    :columns="columns"
    row-key="distributionIsLeader"
    :before-search-submit="formatSearchParams"
    :on-reset="handleReset"
  >
    <div slot="title" class="mb8">
      <el-button
        type="primary"
        size="mini"
        @click="handleAdd"
        v-hasPermi="['distribution:examineGradeRule:add']"
      >新增规则
      </el-button>
    </div>
    
    <el-form-item slot="orgId_search_item" label="组织">
      <org-select v-model="params.orgId"/>
    </el-form-item>
    <el-form-item slot="groupId_search_item" label="所属分组">
      <group-select :orgId="params.orgId" v-model="queryParamsGroupIds"/>
    </el-form-item>

    <template #action_column_content="scope">
      <el-button
        v-if="scope.row.status != 3"
        v-hasPermi="['distribution:examineGradeRule:expired']"
        size="mini"
        type="text"
        @click="handleStates(scope.row)"
      >
        失效
      </el-button>
      <el-button
        v-if="scope.row.status != 3"
        v-hasPermi="['distribution:examineGradeRule:enabled']"
        size="mini"
        type="text"
        @click="handleEna(scope.row)"
      >
        {{ scope.row.status == 2 ? "启用" : "禁用" }}
      </el-button>
      <el-button
        size="mini"
        type="text"
        @click="handleUpdate(scope.row)"
        v-hasPermi="['distribution:examineGradeRule:query']"
      >修改
      </el-button>
      <el-button
        size="mini"
        type="text"
        @click="handleDelete(scope.row)"
        v-hasPermi="['distribution:examineGradeRule:remove']"
      >删除
      </el-button>
    </template>
  </pro-table>
</template>

<script>
import {delExamineGradeRule, expired, enabled, disabled} from "@/api/distribution/examineGradeRule";
import ProTable from '@/components/ElProComponents/ProTable'
import GroupSelect from '@/components/GroupSelect.vue'
import OrgSelect from '@/components/OrgSelect.vue'

export default {
  name: 'ExamineGradeRule',
  components: {
    ProTable,
    GroupSelect,
    OrgSelect
  },
  data() {
    return {
      queryParamsGroupIds: [],
      params: {}
    }
  },
  watch: {
    queryParamsGroupIds(val, preVal) {
      this.params.groupIds = val.length ? val.join(',') : undefined
    },
  },
  computed: {
    columns() {
      return [
        { label: '组织', prop: 'orgId', hideInTable: true, valueType: 'treeSelect', order: 0 },
        { label: '组织', prop: 'orgName', hideInSearch: true, minWidth: 160, valueType: 'text' },
        { label: '所属分组', prop: 'distributionGroupName', hideInSearch: true, minWidth: 100, valueType: 'text'},
        { label: '所属分组', prop: 'groupId', hideInTable: true, order: 1},
        { label: '规则名称', prop: 'ruleName', minWidth: 90, valueType: 'text', order: 2, 
          render:(h, {record})=>(
            <Jump 
              path="/attendance-manage/assessment-score/rules/update" 
              query={{examineGradeRuleId : record.examineGradeRuleId, type: 'check'}}>
              {record.ruleName}
            </Jump>)
        },
        {
          label: "开始时间",
          prop: "beginTime",
          hideInSearch: true,
          minWidth: 120,
          render: (h, { record }) => <BreakTime dateTime={record.beginTime} />,
        },
        {
          label: "结束时间",
          prop: "endTime",
          hideInSearch: true,
          minWidth: 120,
          render: (h, { record }) => <BreakTime dateTime={record.endTime} />,
        },
        {
          label: "规则状态",
          prop: "status",
          minWidth: 90,
          valueType: 'dictSelect', fieldProps: { dict: 'attendance_grade_rule_status' },
          order: 1
        },
        { label: '操作', prop: 'action', minWidth: 100, hideInSearch: true},
      ]
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
    },
    
    /** 新增 */
    handleAdd() {
      const path = '/attendance-manage/assessment-score/rules/add'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      this.$router.push({
        path,
        query: {
          type: 'add'
        }
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      const path = '/attendance-manage/assessment-score/rules/update'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      
      this.$router.push({
        path,
        query: {
          examineGradeRuleId : row.examineGradeRuleId ,
          type: 'update'
        }
      })
    },
    /** 查看 */
    handleCheck(row) {
      const path = '/attendance-manage/assessment-score/rules/check'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      this.$router.push({
        path,
        query: {
          examineGradeRuleId: row.examineGradeRuleId,
          type: 'check'
        }
      })
    },
    
    /** 删除按钮操作 */
    handleDelete(row) {
      const examineGradeRuleIds = row.examineGradeRuleId || this.ids;
      const type = typeof examineGradeRuleIds === 'object' ?  '批量删除' : '删除"' + row.ExamineGradeRuleName + '"'
      this.$confirm(`是否确认考核评分规则?`, "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
      }).then(() => {
          return delExamineGradeRule(examineGradeRuleIds);
      }).then(() => {
          setTimeout(()=>{
            this.$refs?.proTable?.getListData()
          }, 1000)
          this.msgSuccess("删除成功")
      })
    },
    
    /** 失效 */
    handleStates(row) {
      this.$confirm(`是否确认失效"${row.ruleName}"考核评分规则?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        expired(row.examineGradeRuleId).then((res) => {
          setTimeout(()=>{
            this.$refs?.proTable?.getListData()
          }, 1000)
          this.msgSuccess('失效考勤奖励规则成功~')
        })
      })
    },
    /** 禁用启用 */
    handleEna(row) {
      this.$confirm(`是否确认${+row.status === 2 ? '启用' : '禁用'}"${row.ruleName}"考核评分规则?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return +row.status === 2 ? enabled(row.examineGradeRuleId) : disabled(row.examineGradeRuleId)
      }).then(() => {
        setTimeout(()=>{
          this.$refs?.proTable?.getListData()
        }, 1000)
        this.msgSuccess(`${+row.status === 2 ? '启用' : '禁用'}考核评分规则成功~`)
      })
    },
  }
}
</script>
