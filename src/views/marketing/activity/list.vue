<template>
  <pro-table
    ref="proTableRef"
    :api-config="{ url: '/lotteryActivity/list' }"
    :columns="columns"
    :params="orderParams"
    row-key="lotteryActivityId"
  >
    <template #search-btns="{getParams}">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['marketing:lotteryActivity:export']"
          size="mini"
          @click="download('lotteryActivity/export', getParams())"
        >导出</el-button>
      </el-col>
    </template>
    <template #action_column_content="{row}">
      <el-button v-if="row.status === 'online' && row.timeStatus !== 'finish'" v-hasPermi="['marketing:lotteryActivity:edit']" type="text" size="mini" @click="handleChangeStatus(row, '禁用')">禁用</el-button>
      <el-button v-else-if="row.status === 'offline' && row.timeStatus !== 'finish'" v-hasPermi="['marketing:lotteryActivity:edit']" type="text" size="mini" @click="handleChangeStatus(row, '启用')">启用</el-button>
      <el-button v-if="row.timeStatus !== 'finish'" v-hasPermi="['marketing:lotteryActivity:edit']" type="text" size="mini" @click="handleOpenDetail(row, 0)">编辑</el-button>
      <el-button v-hasPermi="['marketing:lotteryActivity:query']" type="text" size="mini" @click="handleOpenDetail(row, 1)">查看</el-button>
      <el-button v-if="row.status === 'offline' && row.timeStatus === 'unstart'" v-hasPermi="['marketing:lotteryActivity:remove']" type="text" size="mini" @click="handleRemove(row)">删除</el-button>
    </template>
  </pro-table>
</template>

<script>
import ProTable from '@/components/ElProComponents/ProTable'
import { offlineActivity, onlineActivity, delActivity } from '@/api/marketing/activity'

export default {
  components: {
    ProTable
  },
  computed: {
    orderParams() {
      return {
        orderByColumn: 'create_time',
        isAsc: 'desc'
      }
    },
    columns() {
      const renderStartTime = (h, { record }) => (
        <div>
          { record.startTime}
          <div style='height:10px;line-height:10px;'>-</div>
          { record.endTime }
        </div>
      )
      return [
        { label: '活动区域', prop: 'orgId', hideInTable: true, valueType: 'treeSelect', order: 0 },
        { label: '活动编号', prop: 'lotteryActivityId', hideInSearch: true },
        { label: '活动类型', prop: 'activityType', hideInSearch: true, valueType: 'dictSelect', fieldProps: { dict: 'lottery_activity_type' }},
        { label: '活动名称', prop: 'activityName' },
        { label: '有效期', prop: 'startTime', hideInSearch: true, render: renderStartTime },
        { label: '活动时间', prop: 'endTime', hideInTable: true, valueType: 'dateTimeRange', paramsRange: ['startTime', 'endTime'] },
        { label: '活动区域', prop: 'orgName', hideInSearch: true },
        { label: '活动链接', prop: 'linkUrl', hideInSearch: true, render: (h, { record }) => <span>LOTTERY__WHEEL</span> },
        { label: '活动状态', prop: 'timeStatus', valueType: 'dictSelect', fieldProps: { dict: 'lottery_activity_time_status' }},
        { label: '启用状态', prop: 'status', valueType: 'dictSelect', fieldProps: { dict: 'lottery_activity_status' }},
        { label: '操作', prop: 'action', hideInSearch: true }
      ]
    }
  },
  methods: {
    handleChangeStatus(row, text) {
      this.$confirm(`是否确认${text}此活动?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          return row.status === 'online' ? offlineActivity(row.lotteryActivityId) : onlineActivity(row.lotteryActivityId)
        })
        .then(() => {
          this.msgSuccess(`${text}活动成功`)
          this.$refs.proTableRef.reload()
        })
    },
    handleRemove(row) {
      this.$confirm('是否确认删除此活动?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          return delActivity(row.lotteryActivityId)
        })
        .then(() => {
          this.msgSuccess('删除活动成功')
          this.$refs.proTableRef.reload()
        })
    },
    handleOpenDetail(row, type) {
      const path = '/marketing/activity/edit'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      this.$router.push({
        path,
        query: { lotteryActivityId: row.lotteryActivityId, type }
      })
    },
    handleAdd() {
      const path = '/marketing/activity/edit'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      this.$router.push({
        path
      })
    }
  }
}
</script>
