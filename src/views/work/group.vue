<template>
  <div>
    <pro-table
      ref="proTableRef"
      :api-config="{ url: '/workwechat/groupChat/list' }"
      :params="params"
      :columns="columns"
      row-key="activityBargainId"
    >
      <template #action_column_content="{row}">
        <el-button type="text" size="mini" @click="handleLinkMarketing(row)">关联市场</el-button>
        <el-button type="text" size="mini" @click="handleUpdateTags(row)">标签</el-button>
      </template>
    </pro-table>
    <marketing ref="marketing"/>
  </div>
</template>

<script>
import ProTable from "@/components/ElProComponents/ProTable";
import Marketing from './components/marketing.vue'

export default {
  components: { ProTable, Marketing },
  data: () => ({
    perms: {
      edit: ['workwechat:groupChat:edit'],
      bind: ['workwechat:groupChat:bing'],
    },
    params: {
      orderByColumn: "create_time",
      isAsc: "desc",
    },
    columns: [
      { label: "群名称", prop: "chatName" },
      { label: "标签数", prop: "tagNum", hideInSearch: true },
      { label: "群主", prop: "ownerName", hideInSearch: true },
      { label: "群人数", prop: "num", hideInSearch: true },
      { label: "进群/退群(当日)", prop: "activityEndTime", hideInSearch: true },
      { label: "状态", prop: "status", valueType: 'dictSelect', fieldProps: { dict: 'workwechat_customer_status' } },
      { label: "组织", prop: "activityEndTime", hideInSearch: true },
      { label: "店铺名称", prop: "activityEndTime", hideInSearch: true },
      { label: "配送员人数", prop: "activityEndTime", hideInSearch: true },
      // { label: "操作", prop: "action", hideInSearch: true },
    ],
  }),
  methods: {

    handlePreview(row) {
      this.$router.checkPermAndPush({
        path: "/marketing/bargain/preview",
        query: {
          activityBargainId: row.activityBargainId,
        },
      });
    },

    handleLinkMarketing(row) {
      this.$refs.marketing.selectOrg()
    },

    handleUpdateTags() {

    },
  },
};
</script>

