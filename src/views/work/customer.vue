<template>
  <div>
    <pro-table
      ref="proTableRef"
      :api-config="{ url: '/workwechat/customer/list' }"
      :params="params"
      :columns="columns"
      :before-search-submit="formatSearchParams"
      row-key="wxCustomerId"
    >


      <template #search-btns="{getParams}">
        <el-col :span="1.5" v-hasPermi="perms.export" >
          <el-button size="mini" @click="download('/workwechat/customer/export', getParams())">导出</el-button>
        </el-col>
        <el-col :span="1.5" v-hasPermi="perms.sync" >
          <el-button size="mini" @click="syncCustomerTags" :loading="syncLoading">同步客户标签</el-button>
        </el-col>
      </template>

      <template #tagIds_search_item="{queryParams}">
        <el-form-item label="客户标签" prop="tagIds">
          <el-cascader
            v-model="queryParams.tagIds"
            :options="tags"
            placeholder="请选择标签"
            :show-all-levels="false"
            style="width: 100%"
            :props="{ multiple: true, checkStrictly: false }"
          />
        </el-form-item>
      </template>

      <template #gender_column_content="{row}">
        <div>
          <span class="gender__male" v-if="row.gender === '1'">♂</span>
          <span class="gender__female" v-else-if="row.gender === '2'">♀</span>
          <span v-if="genders[row.gender]">{{genders[row.gender].label}}</span>
        </div>
      </template>

      <template #customerName_column_content="{row}">
        <customer-link :row="{nickname: row.wxname, customerId: row.wxCustomerId, ...row}" />
      </template>

      <template #userId_column_content="{row}">
        <div v-for="item in row.followers" :key="item.userId">
          {{item.userName}}
        </div>
      </template>

      <template #tagIds_column_content="{row}">
        <div v-if="row.tags">
          <el-tag v-for="item in row.tags" type="info" :key="item.customerTagId" class="mt5 ml5">
            {{item.customerTagName}}
          </el-tag>
        </div>
      </template>

      <template #addTime_column_content="{row}">
        <div v-for="item in row.followers" :key="item.userId" class="mt5 ml5">
          {{item.addTime}}
        </div>
      </template>

      <template #chatName_column_content="{row}">
        <div v-for="item in row.chats" :key="item.userId" class="mt5 ml5">
          {{item.chatName}}
        </div>
      </template>

      <template #addWay_column_content="{row}">
        <div v-for="item in row.followers" :key="item.userId" class="mt5 ml5">
          {{getAddWay(item.addWay)}}
        </div>
      </template>

      <template #status_column_content="{row}">
        <div v-for="item in row.followers" :key="item.userId" class="mt5 ml5">
          {{getCustomerStatus(item.status)}}
        </div>
      </template>

    </pro-table>
  </div>
</template>

<script>
import ProTable from "@/components/ElProComponents/ProTable";
import CustomerLink from "@/components/CustomerLink";
import { queryGroupTag, syncCustomerTags, queryUserAll } from '@/api/work/work'

const genders = [
  { label: '未知', value: 0 },
  { label: '男性', value: 1 },
  { label: '女性', value: 2 },
]

export default {
  components: { ProTable, CustomerLink },
  data: () => ({
    perms: {
      export: ['workwechat:customer:export'],
      sync: ['workwechat:groupTag:sync']
    },
    params: {
      orderByColumn: "create_time",
      isAsc: "desc",
    },
    genders,
    syncLoading: false,
    tags: [],
    members: [],
    addWays: [],
    customerStatus: [],
  }),

  computed: {
    columns() {
      return [
        { label: "客户", prop: "customerName" },
        { label: "性别", prop: "gender", valueType: 'select', options: genders },
        { label: "所属成员", prop: "userId", valueType: 'select', options: this.members },
        { label: "客户标签", prop: "tagIds" },
        { label: "添加时间", prop: "addTime", valueType: 'dateTimeRange', paramsRange: ['beginAddTime', 'endAddTime']  },
        { label: "所在群", prop: "chatName", hideInSearch: true },
        { label: "添加渠道", prop: "addWay", valueType: 'select', options: this.addWays },
        { label: "状态", prop: "status", valueType: 'select', options: this.customerStatus },
      ]
    }
  },

  created() {
    this.initDicts()
  },

  methods: {

    async syncCustomerTags() {
      try {
        this.syncLoading = true
        await syncCustomerTags({
            "tagIds":[],
            "groupIds":[]
        })
        this.msgSuccess('同步成功')
        this.queryTags()
      } finally {
        this.syncLoading = false
      }
    },

    formatSearchParams(fields) {
      return {
        ...fields,
        tagIds: fields.tagIds?.map(i => i[i.length - 1]).join(',')
      }
    },

    async initDicts() {
      this.getDicts('workwechat_addway').then(res => {
        this.addWays = res.data.map(({dictLabel, dictValue}) => ({
          label: dictLabel,
          value: dictValue
        }))
      })
      this.getDicts('workwechat_customer_status').then(res => {
        this.customerStatus = res.data.map(({dictLabel, dictValue}) => ({
          label: dictLabel,
          value: dictValue
        }))
      })
      this.queryTags()

      queryUserAll().then(res => {
        this.members = res.data.map(({userId, wxName}) => ({
          label: wxName,
          value: userId
        }))
      })
    },

    async queryTags() {
      queryGroupTag().then(res => {
        this.tags = res.data
      })
    },

    getAddWay(dict) {
      return this.addWays.find(i => i.value === dict)?.label
    },

    getCustomerStatus(dict) {
      return this.customerStatus.find(i => i.value === dict)?.label
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
  },
};
</script>

<style lang="scss" scoped>
.gender__female {
  color: #ff4278;
  font-weight: 700;
}
.gender__male {
  color: #699deb;
  font-weight: 700;
}
</style>