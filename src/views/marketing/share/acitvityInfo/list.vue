<template>
  <pro-table
    ref="proTable"
    :api-config="{ url: '/share/info/list' }"
    :columns="columns"
    :params="params"
    :before-search-submit="formatSearchParams"
    :row-key = "row => row.activityShareId"
    @reset-search="dateValue = undefined"
    >
    <div slot="title" class="mb8">
      <el-button
        type="primary"
        size="mini"
        @click="handleAdd"
        v-hasPermi="['marketing:shareInfo:add']"
      >新增活动
      </el-button>
    </div>

    <template #action_column_content="scope">
      <!-- <el-button
        v-if="scope.row.status === 'enable'"
        v-hasPermi="['marketing:shareInfo:promote']"
        size="mini"
        type="text"
        @click="handlePromote(scope.row)"
      >
        推广
      </el-button> -->
      <el-button
        v-if="scope.row.timeStatus !=2 && scope.row.status != 'overdue'"
        v-hasPermi="['marketing:shareInfo:edit']" 
        size="mini"
        type="text" 
        class="outer-link--text"
         @click="handleUpdate(scope.row)"
         >修改
      </el-button>
      <el-button
        v-if="scope.row.status === 'overdue' || scope.row.timeStatus == 2 "
        v-hasPermi="['marketing:shareInfo:remove']"
        size="mini"
        type="text"
        @click="handleDelete(scope.row)"
      >删除
      </el-button>
      <template v-if="scope.row.timeStatus !=2 ">
        <el-button
          v-if="scope.row.status !== 'overdue'"
          v-hasPermi="['marketing:shareInfo:editStatus']"
          size="mini"
          type="text"
          @click="handleStates(scope.row, 'overdue')"
        >
          失效
        </el-button>
        <el-button
          v-if="scope.row.status !== 'overdue'"
          v-hasPermi="['marketing:shareInfo:editStatus']"
          size="mini"
          type="text"
          @click="handleStates(scope.row, scope.row.status === 'enable' ? 'disable' : 'enable')"
        >
          {{ scope.row.status === 'disable' ? "启用" : "禁用" }}
        </el-button>
      </template>
    </template>
  </pro-table>
</template>

<script>
import ProTable from '@/components/ElProComponents/ProTable'
import {
  delShareInfo,
  updateShareInfoStatus
} from "@/api/marketing/shareInfo";

export default {
  components: {
    ProTable
  },
  data: () => ({
    params: {
      orderByColumn:"activity_share_id",
      isAsc:"desc"
    },
    SearchConfig: {
      span: 6
    },
  }),
  computed: {
    columns() {
      return [
        { width: 70, hideInSearch: true, tableColumnProps: {type: 'index'}},
        { label: '活动名称', prop: 'activityName', minWidth: 110, order: 0, 
          render:(h, {record}) => (
            <Jump class="outer-link--text" path="/marketing/shareAcitvity/list/shareInfoDetail" query={{type: 'review', activityShareId: record.activityShareId}}>
              {record.activityName}
            </Jump>
          )
        },
        { label: '组织', prop: 'orgId', hideInTable:true, valueType: 'treeSelect', order: 1 },
        { label: '组织', prop: 'orgName', hideInSearch:true, minWidth: 100, valueType: 'text' },
        { label: '生效日期', prop: 'activityTime', hideInSearch: true, minWidth: 130,
          render: (h, {record}) => (
            <div>
              <div>{record.activityStartTime}</div>
              至
              <div>{record.activityEndTime}</div>
            </div>
          ) 
        },
        // { label: '启用状态', prop: 'status', hideInSearch:true, minWidth: 80,  valueType: 'dictSelect', fieldProps: { dict: 'share_enable_status' } },
        { label: '活动状态', prop: 'timeStatus', minWidth: 80,  valueType: 'dictSelect', fieldProps: { dict: 'share_activity_status' } ,order: 2 },
        { label: '参与人数', prop: 'joinUserNum', hideInSearch: true, minWidth: 80, valueType: 'text'},
        { label: '发放积分', prop: 'activityTotalNum', hideInSearch: true, minWidth: 80, render:(h, {recode}) => (<span>0</span>) },
        { label: '浏览量', prop: 'browseNum', hideInSearch: true, minWidth: 90, valueType: 'text'},
        { label: '访客量', prop: 'visitorsNum', hideInSearch:true, minWidth: 90, valueType: 'text' },
        { label: '奖励份数', prop: 'rewardNum', hideInSearch: true, minWidth: 80,  valueType: 'text', render: (h, {record}) => (
          <Jump class="outer-link--text" path="/marketing/shareAcitvity/details" query={{ activityName: record.activityName}}>
            {record.rewardNum}
          </Jump>
        )},
        { label: '发放份数', prop: 'sendNum', hideInSearch: true, minWidth: 80, valueType: 'text' },
        { label: '操作', prop: 'action', hideInSearch: true, minWidth: 90},
      ]
    }
  },
  methods: {
    formatSearchParams(obj) {
      return {
        ...obj,
      }
    },
    /** 新增按钮操作 */
    handleAdd() {
      const path = '/marketing/shareAcitvity/list/add'
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
      const path = '/marketing/shareAcitvity/list/update'
      const resolver = this.$router.resolve(path)
      if (resolver.resolved?.path !== path) return this.warning('没有界面权限不支持跳转~')
      this.$router.push({
        path,
        query: {
          type: 'update',
          activityShareId: row.activityShareId
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm(`是否删除${row.activityName}?`, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
      .then(() => {
        return delShareInfo( row.activityShareId);
      })
      .then(() => {
        this.$refs?.proTable.getListData();
        this.msgSuccess("删除成功");
      });
    },
    // 失效,禁用，开启
    handleStates(row, status) {
      this.$confirm(
        `是否${{ 'overdue': '失效', 'enable': '启用', 'disable': '禁用' }[status]}${
          row.activityName
        }活动?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          return updateShareInfoStatus({ activityShareId: row.activityShareId, status })
        })
        .then(() => {
          setTimeout(()=>{
            this.$refs?.proTable.getListData();
          }, 1000)
          this.msgSuccess(`${{ 'overdue': '失效', 'enable': '启用', 'disable': '禁用' }[status]}成功`)
        })
    },
  }
}
</script>
