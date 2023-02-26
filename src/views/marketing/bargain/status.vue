<template>
  <div>
    <pro-table
      ref="proTableRef"
      :api-config="{ url: '/bargain/record/list' }"
      :params="params"
      :columns="columns"
      row-key="bargainRecordId"
    >
      <template #nickname_column_content="{row}">
        <customer-link :row="row" />
      </template>
      <template #helpUserNum_column_content="{row}">
        <div>{{ row.helpUserNum }} /  {{ row.effectUserNum }}</div>
      </template>
      <template #bargainTotalPrice_column_content="{row}">
        <div>{{ remainingAmount(row) }}</div>
      </template>
    </pro-table>
    <promote ref="promoteRef" />
  </div>
</template>

<script>
import Promote from "@/views/components/promote";
import ProTable from "@/components/ElProComponents/ProTable";
import CustomerLink from "@/components/CustomerLink";
import { disableBargainProcess, enableBargainProcess, removeBargainProcess } from "@/api/marketing/bargain";
import Decimal from 'decimal.js';

export default {
  components: { ProTable, Promote, CustomerLink },
  data: () => ({
    params: {
      orderByColumn: "create_time",
      isAsc: "desc",
    },
    columns: [
      { label: '活动区域', prop: 'orgId', hideInTable: true, valueType: 'treeSelect', order: 0 },
      { label: "发起人昵称", prop: "nickname", order: 3 },
      { label: "发起人编号", prop: "customerId" },
      { label: "活动名称", prop: "activityName", order: 4 },
      { label: "活动区域", prop: "orgName", hideInSearch: true },
      { label: "发起时间", prop: "datetime", valueType: 'dateTimeRange', paramsRange: ['shareBeginTime', 'shareEndTime'], hideInTable: true },
      { label: "发起时间", prop: "shareTime", hideInSearch: true },
      { label: "结束时间", prop: "endTime", hideInSearch: true },
      { label: "浏览量", prop: "browseNum", hideInSearch: true },
      { label: "访客量", prop: "visitorsNum", hideInSearch: true },
      { label: "最低价（元）", prop: "floorPrice", hideInSearch: true, valueType: 'money' },
      { label: "砍后价格（元）", prop: "bargainTotalPrice", hideInSearch: true, valueType: 'money' },
      { label: "帮砍人数/应参与人数", prop: "helpUserNum", hideInSearch: true },
      {
        label: "状态",
        prop: "status",
        order: 1,
        valueType: "dictSelect",
        fieldProps: { dict: "bargain_status" },
      },
    ],
  }),
  created() {
    Object.assign(this.params, this.$route.query)
  },
  methods: {
    remainingAmount({ goodsPrice, bargainTotalPrice }) {
      return new Decimal(goodsPrice).sub(bargainTotalPrice).div(100).toFixed(2)
    },
    async handleRemove(row) {
      await this.$confirm(`是否确认删除${row.goodsName}发起的砍价活动？`, "警告", { type: "warning" });
      await removeBargainProcess(row.scoreGoodsId);
      this.$refs.proTableRef.reload();
      this.msgSuccess("删除成功");
    },

    async handleEnable(row) {
      await this.$confirm(`是否确认启用${row.goodsName}发起的砍价活动？`, "警告", { type: "warning" });
      await enableBargainProcess(row.scoreGoodsId);
      this.$refs.proTableRef.reload();
      this.msgSuccess("启用成功");
    },

    async handleDisable(row) {
      await this.$confirm(`是否确认禁用${row.goodsName}发起的砍价活动？`, "警告", { type: "warning" });
      await disableBargainProcess(row.scoreGoodsId);
      this.$refs.proTableRef.reload();
      this.msgSuccess("禁用成功");
    },
  },
};
</script>

