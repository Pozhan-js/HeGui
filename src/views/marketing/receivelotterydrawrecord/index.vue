<template>
  <pro-table
    ref="proTableRef"
    :api-config="{ url: '/receivelotterydrawrecord/list' }"
    :columns="columns"
    row-key="lotteryRecordId"
    :before-search-submit="formatSearchParams"
    :on-reset="handleReset"
  >
    <template #search-btns="{getParams}">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['marketing:lotteryRecord:export']"
          size="mini"
          @click="download('receivelotterydrawrecord/export', getParams())"
        >导出</el-button>
      </el-col>
    </template>
    <el-form-item slot="activityType_search_item" label="营销游戏类型">
      <dict-select v-model="formData.activityTypes" dict="lottery_activity_type" :out-dicts.sync="activityTypes" multiple clearable placeholder="营销游戏类型" style="width: 100%" />
    </el-form-item>
  </pro-table>
</template>

<script>
import ProTable from '@/components/ElProComponents/ProTable'
import { listAllActivity } from '@/api/marketing/activity'
import DictSelect from '@/components/DictSelect.vue'

export default {
  components: { ProTable, DictSelect },
  data: () => ({
    activityList: [],
    activityTypes: [],
    formData: {
      lotteryActivityId: undefined,
    }
  }),
  computed: {
    columns() {
      return [
        { label: '奖励唯一id', prop: 'lotteryTimesRecordId', hideInSearch: true },
        { label: '会员ID', prop: 'customerId', hideInSearch: true },
        { label: '会员名称', prop: 'customerName', order: 1},
        { label: '手机号', prop: 'customerPhone', order: 3},
        { label: '营销游戏类型', prop: 'activityType', order: 2, renderText: ({ record }) => this.selectDictLabel(this.activityTypes, record.activityType) },
        { label: '活动名称', prop: 'activityName', order: 4},
        { label: '活动区域', prop: 'orgId', valueType: 'treeSelect', hideInSearch: true, renderText: ({ record }) => record.orgName },
        { label: '活动开始时间', prop: 'startTime', hideInSearch: true, render: (h, {record}) => (<BreakTime dateTime={record.startTime} />) },
        { label: '活动结束时间', prop: 'endTime', hideInSearch: true, render: (h, {record}) => (<BreakTime dateTime={record.endTime} />) },
        { label: '奖励渠道', prop: 'timesType', hideInSearch: true, valueType: 'dictSelect', fieldProps: { dict: 'lottery_reward_type' }},
        { label: '奖励抽奖次数', prop: 'num', hideInSearch: true },
        { label: '奖励时间', hideInSearch: true, prop: 'createTime', valueType: 'dateTimeRange', paramsRange: ['rewardBeginTime', 'rewardEndTime'], render: (h, {record}) => (<BreakTime dateTime={record.createTime} />) },
      ]
    }
  },
  created() {
    this.getAllActivity()
  }, 
  methods: {
    formatSearchParams(obj) {
      const { lotteryActivityId, awardIds, activityTypes } = this.formData
      return {
        ...obj,
        lotteryActivityId,
        activityTypes: activityTypes?.length ? activityTypes.join(',') : undefined,
        awardIds: (Array.isArray(awardIds) ? awardIds.join(',') : awardIds) || undefined,
        orderByColumn: 'create_time',
        isAsc: 'desc'
      }
    },
    getAllActivity() {
      listAllActivity()
        .then(res => {
          this.activityList = res.data
        })
    },

    handleReset() {
      this.formData = {
        lotteryActivityId: undefined,
      }
    }
  }
}
</script>
