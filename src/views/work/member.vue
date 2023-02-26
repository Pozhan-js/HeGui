<template>
  <div class="customer">
    <tree-search class="customer-aside" v-hasPermi="perms.deptTree" v-model="mainDepartment" :options="departments"/>
    <pro-table
      ref="proTableRef"
      class="customer-content"
      :api-config="{ url: '/workwechat/user/list' }"
      :columns="columns"
      :params="{ mainDepartment }"
      row-key="userId"
    >

      <template #search-btns="{getParams}">
        <el-col :span="1.5" v-hasPermi="perms.export">
          <el-button size="mini" @click="download('/workwechat/user/export', getParams())">导出</el-button>
        </el-col>
        <el-col :span="1.5" v-hasPermi="perms.syncMember" >
          <el-button size="mini" @click="syncWorkUsers" :loading="userSyncLoading">同步成员</el-button>
        </el-col>
        <el-col :span="1.5" v-hasPermi="perms.syncDepartment" >
          <el-button size="mini" @click="syncDepartments" :loading="deptSyncLoading">同步部门</el-button>
        </el-col>
      </template>

      <template #wxName_column_content="{row}">
        <div>
          <customer-link :row="{nickname: row.wxName, customerId: row.userId, ...row}" :path="null" />
          <div>客户数：{{row.customerCount}}</div>
        </div>
      </template>
      <template #action_column_content="{row}">
        <el-button v-hasPermi="perms.permissions" type="text" size="mini" @click="handleUpdatePermissions(row)">管理权限</el-button>
      </template>
    </pro-table>
  </div>
</template>

<script>
import ProTable from "@/components/ElProComponents/ProTable";
import TreeSearch from './components/tree-search.vue'
import { getDepartments, syncWorkUsers, syncDepartments } from '@/api/work/work'
import CustomerLink from '@/components/CustomerLink.vue'

export default {
  components: { ProTable, TreeSearch, CustomerLink },
  data: () => ({
    perms: {
      permissions: ["workwechat:user:edit"],
      syncDepartment: ["workwechat:dept:sync"],
      syncMember: ["workwechat:user:sync"],
      export: ["workwechat:user:export"],
      deptTree: ["workwechat:dept:query"]
    },
    params: {
      orderByColumn: "create_time",
      isAsc: "desc",
    },
    userSyncLoading: false,
    deptSyncLoading: false,
    departments: [],
    mainDepartment: undefined,
    columns: [
      { label: "成员信息", prop: "wxName" },
      { label: "所属部门", prop: "deptName", hideInSearch: true },
      { label: "角色", prop: "roleName", hideInSearch: true },
      { label: "授权状态", prop: "status", hideInSearch: true },
      { label: "操作", prop: "action", hideInSearch: true },
    ],
  }),
  created() {
    this.queryDepartments()
  },
  methods: {

    async syncWorkUsers() {
      try {
        this.userSyncLoading = true
        await syncWorkUsers()
        this.msgSuccess('同步成功')
        this.$refs.proTableRef.reload()
      } finally {
        this.userSyncLoading = false
      }
    },

    async syncDepartments() {
      try {
        this.deptSyncLoading = true
        await syncDepartments()
        this.msgSuccess('同步成功')
        this.queryDepartments()
      } finally {
        this.deptSyncLoading = false
      }
    },

    async queryDepartments() {
      const result = await getDepartments()
      this.departments = [result.data]
    },

    handleUpdatePermissions(row) {
      this.$router.checkPermAndPush({
        path: "/workwechat/config/permissions",
        query: {
          userId: row.userId,
        },
      });
    },
  },
};
</script>

<style lang="scss">
.customer-aside__search .ant-cascader-menu {
  width: initial !important;
}
</style>

<style lang="scss" scoped>
.customer {
  display: flex;
  overflow: hidden;
  .customer-aside {
    margin-top: 20px;
    padding-left: 20px;
    .ant-cascader-menu {
      width: initial !important;
    }
    .customer-aside__tree {
      margin-top: 20px;
    }
  }
  .customer-content {
    flex: 1;
    overflow: hidden;
  }
}
</style>
