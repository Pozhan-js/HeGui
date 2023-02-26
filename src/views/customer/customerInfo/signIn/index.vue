<template>
  <pro-table
    :api-config="{ url: '/signLog/list' }"
    :columns="columns"
    :params="params"
    row-key="customerSignId"
  />
</template>

<script>
import ProTable from '@/components/ElProComponents/ProTable'

export default {
  components: { ProTable },
  data: (vm) => ({
    params: {
      customerId: vm.$route.query.customerId
    }
  }),
  computed: {
    columns() {
      return [
        { label: '会员编号', prop: 'customerId', hideInSearch: true },
        { label: '会员昵称', prop: 'nickname', hideInSearch: true, render: (h, { record }) => (<CustomerLink row={record} />) },
        { label: '签到时间', prop: 'signTime', valueType: 'dateTimeRange', paramsRange: ['signTimeBeginTime', 'signTimeEndTime'] },
        { label: '连续签到天数', prop: 'signContinuouNum', hideInSearch: true },
        { label: '本期连续签到天数', prop: 'signPeriodNum', hideInSearch: true }
      ]
    }
  }
}
</script>
