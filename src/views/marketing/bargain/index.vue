<template>
  <div>
    <pro-table
      ref="proTableRef"
      :api-config="{ url: '/bargain/info/list' }"
      :params="params"
      :columns="columns"
      row-key="activityBargainId"
    >
      <el-row slot="title" class="mb10">
        <el-col :span="20">
          <el-button type="primary" size="mini" @click="handleCreate" v-hasPermi="perms.create">立即新增</el-button>
        </el-col>
      </el-row>

      <template #shareUserNum_column_content="{row}">
        <jump path="/marketing/bargain/status" :query="{ activityBargainId: row.activityBargainId}">
          {{ row.shareUserNum }}
        </jump>
      </template>

      <template #action_column_content="{row}">
        <el-button v-hasPermi="perms.promote" v-if="!isOver(row) && isEnable(row) && !isExpire(row)" type="text" size="mini" @click="handlePromote(row)">推广</el-button>
        <el-button v-hasPermi="perms.update" v-if="!isExpire(row)" type="text" size="mini" @click="handleUpdate(row)">编辑</el-button>
        <el-button v-hasPermi="perms.preview" type="text" size="mini" @click="handlePreview(row)">查看</el-button>

        <!-- 如果活动没有结束 -->
        <span v-if="!isOver(row)" key="status-group">
          <el-button v-hasPermi="perms.enable" v-if="isDisable(row)" type="text" size="mini" @click="handleEnable(row)">启用</el-button>
          <el-button v-hasPermi="perms.disable" v-if="isEnable(row)" type="text" size="mini" @click="handleDisable(row)">停用</el-button>
          <el-button v-hasPermi="perms.expire" v-if="!isExpire(row)" type="text" size="mini" @click="handleExpire(row)">失效</el-button>
        </span>

        <!-- 如果活动已经失效, 或者已经结束 -->
        <el-button v-if="isOver(row) || isExpire(row)" v-hasPermi="perms.remove" type="text" size="mini" @click="handleRemove(row)">删除</el-button>
      </template>
    </pro-table>
    <promote ref="promoteRef" />
  </div>
</template>

<script>
import Promote from "@/views/components/promote";
import ProTable from "@/components/ElProComponents/ProTable";
import { promoteQR, toggleStatus, removeAct } from "@/api/marketing/bargain";
import Jump from '@/components/Jump.vue'

export default {
  components: { ProTable, Promote, Jump },
  data: () => ({
    perms: {
      create: ["marketing:bargainInfo:add"],
      preview: ["marketing:bargainInfo:query"],
      update: ["marketing:bargainInfo:edit"],
      promote: ["marketing:bargainInfo:genQrCode"],
      disable: ["marketing:bargainInfo:editStatus"],
      enable: ["marketing:bargainInfo:editStatus"],
      expire: ["marketing:bargainInfo:editStatus"],
      remove: ['marketing:bargainInfo:remove']
    },
    params: {
      orderByColumn: "create_time",
      isAsc: "desc",
    },
    columns: [
      { label: "活动名称", prop: "activityName", order: 2 },
      { label: "活动区域", prop: "orgName", hideInSearch: true },
      { label: '活动区域', prop: 'orgId', hideInTable: true, valueType: 'treeSelect', order: 0 },
      { label: "开始时间", prop: "activityStartTime", hideInSearch: true },
      { label: "结束时间", prop: "activityEndTime", hideInSearch: true },
      { label: "浏览量", prop: "browseNum", hideInSearch: true },
      { label: "访客量", prop: "visitorsNum", hideInSearch: true },
      { label: "发起人数", prop: "shareUserNum", hideInSearch: true },
      { label: "帮砍人数", prop: "helpUserNum", hideInSearch: true },
      { label: "成功数", prop: "buyOrderNum", hideInSearch: true },
      { label: "总库存", prop: "activityInventoryNum", hideInSearch: true },
      { label: "剩余库存", prop: "residueInventoryNum", hideInSearch: true },
      {
        label: "状态",
        prop: "timeStatus",
        order: 1,
        valueType: "dictSelect",
        fieldProps: { dict: "share_activity_status" },
      },
      { label: "操作", prop: "action", hideInSearch: true },
    ],
  }),
  methods: {

    isOver(act) {
      return act.timeStatus === 2
    },

    isExpire(act) {
      return act.status === 'overdue'
    },

    isDisable(act) {
      return act.status === 'disable'
    },

    isEnable(act) {
      return act.status === 'enable'
    },

    async handlePromote(row) {
      const result = await promoteQR(row.activityBargainId)
      this.$refs.promoteRef.setData({
        link: result.msg,
        open: true,
        type: "base64",
      });
      this.$refs.promoteRef.generate();
    },

    handleCreate(row) {
      this.$router.checkPermAndPush({
        path: "/marketing/bargain/create",
        query: {
          activityBargainId: row.activityBargainId,
        },
      });
    },

    handleUpdate(row) {
      this.$router.checkPermAndPush({
        path: "/marketing/bargain/update",
        query: {
          activityBargainId: row.activityBargainId,
        },
      });
    },

    handlePreview(row) {
      this.$router.checkPermAndPush({
        path: "/marketing/bargain/preview",
        query: {
          activityBargainId: row.activityBargainId,
        },
      });
    },

    async handleRemove(row) {
      await this.$confirm(`是否确认删除${row.activityName}活动？`, "警告", { type: "warning" });
      await removeAct(row.activityBargainId);
      this.$refs.proTableRef.reload();
      this.msgSuccess("删除成功");
    },

    async handleEnable(row) {
      await this.$confirm(`是否确认启用${row.activityName}活动？`, "警告", { type: "warning" });
      await toggleStatus({ activityBargainId: row.activityBargainId, status: 'enable' });
      this.$refs.proTableRef.reload();
      this.msgSuccess("启用成功");
    },

    async handleDisable(row) {
      await this.$confirm(`是否确认停用${row.activityName}活动？`, "警告", { type: "warning" });
      await toggleStatus({ activityBargainId: row.activityBargainId, status: 'disable' });
      this.$refs.proTableRef.reload();
      this.msgSuccess("禁用成功");
    },

    async handleExpire(row) {
      await this.$confirm(`是否确认失效${row.activityName}活动？`, "警告", { type: "warning" });
      await toggleStatus({ activityBargainId: row.activityBargainId, status: 'overdue' });
      this.$refs.proTableRef.reload();
      this.msgSuccess("失效成功");
    },
  },
};
</script>

