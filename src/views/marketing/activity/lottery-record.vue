<template>
  <pro-table
    ref="proTableRef"
    :api-config="{ url: '/lotteryrecord/list' }"
    :params="orderParams"
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
          @click="download('lotteryrecord/export', getParams())"
        >导出</el-button>
      </el-col>
    </template>
    <el-form-item slot="lotteryActivityId_search_item" label="活动名称">
      <el-select v-model="formData.lotteryActivityId" clearable placeholder="请选择活动" style="width: 100%" @change="getAwardList">
        <el-option
          v-for="item in activityList"
          :key="item.lotteryActivityId"
          :label="item.activityName"
          :value="item.lotteryActivityId"
        />
      </el-select>
    </el-form-item>
    <el-form-item slot="activityType_search_item" label="营销游戏类型">
      <dict-select v-model="formData.activityTypes" dict="lottery_activity_type" :out-dicts.sync="activityTypes" multiple clearable placeholder="营销游戏类型" style="width: 100%" />
    </el-form-item>
    <el-form-item slot="awardIds_search_item" label="中奖奖品">
      <el-select v-model="formData.awardIds" multiple clearable placeholder="请选择奖品" style="width: 100%">
        <el-option
          v-for="item in awardList"
          :key="item.lotteryActivityAwardId"
          :label="item.awardName"
          :value="item.lotteryActivityAwardId"
        />
      </el-select>
    </el-form-item>
  </pro-table>
</template>

<script>
import ProTable from '@/components/ElProComponents/ProTable'
import { listAllActivity, listAward } from '@/api/marketing/activity'
import DictSelect from '@/components/DictSelect.vue'

export default {
  components: { ProTable, DictSelect },
  data: () => ({
    activityList: [],
    activityTypes: [],
    awardList: [],
    formData: {
      lotteryActivityId: undefined,
      awardIds: undefined
    }
  }),
  computed: {
    orderParams() {
      return {
        orderByColumn: 'create_time',
        isAsc: 'desc'
      }
    },
    columns() {
      return [
        { label: '会员ID', prop: 'customerId', hideInSearch: true },
        { label: '会员名称', prop: 'customerName' },
        { label: '活动时间', prop: 'activityBeginTime', hideInTable: true, valueType: 'dateTimeRange', paramsRange: ['activityBeginTime', 'activityEndTime'] },
        { label: '手机号', prop: 'phone', renderText: ({ record }) => record.telephone },
        { label: '营销游戏类型', prop: 'activityType', renderText: ({ record }) => this.selectDictLabel(this.activityTypes, record.activityType) },
        { label: '活动区域', prop: 'orgId', hideInTable: true, valueType: 'treeSelect', renderText: ({ record }) => record.orgName },
        { label: '活动名称', prop: 'lotteryActivityId', renderText: ({ record }) => record.activityName },
        { label: '中奖奖品', prop: 'awardIds', renderText: ({ record }) => record.awardName },
        { label: '中奖日期', prop: 'lotteryTime', valueType: 'dateTimeRange', paramsRange: ['lotteryBeginTime', 'lotteryEndTime'] },
        { label: '状态', prop: 'grantState', hideInSearch: true, renderText: () => '已领取' }
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
        awardIds: (Array.isArray(awardIds) ? awardIds.join(',') : awardIds) || undefined
      }
    },
    getAllActivity() {
      listAllActivity()
        .then(res => {
          this.activityList = res.data
        })
    },
    getAwardList(id) {
      if (!id) {
        return
      }
      // 切换活动，清空奖品列表，和选中奖品
      this.$set(this.formData, 'awardIds', undefined)
      this.awardList = []
      listAward(id)
        .then(res => {
          this.awardList = res.data
        })
    },
    handleReset() {
      this.awardList = []
      this.formData = {
        lotteryActivityId: undefined,
        awardIds: undefined
      }
    }
  }
}
</script>
