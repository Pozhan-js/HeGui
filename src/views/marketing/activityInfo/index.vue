<template>
  <div>
    <pro-table
      ref="proTable"
      :api-config="{ url: '/activity/info/list' }"
      :columns="columns"
      :params="params"
      :before-search-submit="formatSearchParams"
      :row-key="(row) => row.activityId"
      @reset-search="dateValue = undefined"
    >
      <template #title="">    
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              type="primary"
              size="mini"
              @click="handleAdd"
              v-hasPermi="['marketing:activityInfo:add']"
              >新增活动信息
            </el-button>
          </el-col>
        </el-row>
      </template>

      <template #action_column_content="scope">
        <el-button
          v-if="scope.row.status === 'overdue' || scope.row.timeStatus == 2 "
          v-hasPermi="['marketing:activityInfo:remove']"
          size="mini"
          type="text"
          @click="handleDelete(scope.row)"
        >删除
        </el-button>
        <el-button
          v-if="scope.row.timeStatus !=2 && scope.row.status != 'overdue'"
          v-hasPermi="['marketing:activityInfo:edit']" 
          size="mini"
          type="text" 
          class="outer-link--text"
          @click="handleUpdate(scope.row, 'update')"
          >修改
        </el-button>
        <template v-if="scope.row.timeStatus !=2 ">
          <el-button
            v-if="scope.row.status !== 'overdue'"
            v-hasPermi="['marketing:activityInfo:editStatus']"
            size="mini"
            type="text"
            @click="handleStates(scope.row, 'overdue')"
          >
            失效
          </el-button>
          <el-button
            v-if="scope.row.status !== 'overdue'"
            v-hasPermi="['marketing:activityInfo:editStatus']"
            size="mini"
            type="text"
            @click="handleStates(scope.row, scope.row.status === 'enable' ? 'disable' : 'enable')"
          >
            {{ scope.row.status === 'disable' ? "启用" : "禁用" }}
          </el-button>
        </template>
      </template>
    </pro-table>

    <dialog-edit ref="editRef" @updateList="updateList" :type="type"/>
  </div>
</template>

<script>
import {delActivityInfo, updateActivityInfoStatus} from "@/api/marketing/activityInfo";
import ProTable from "@/components/ElProComponents/ProTable";
import DialogEdit from './edit'

export default {
  components: {
    ProTable,
    DialogEdit
  },
  data: () => ({
    params: {
      orderByColumn:"activity_id",
      isAsc:"desc"
    },
    SearchConfig: {
      span: 6,
    },
    type: '',
  }),
  computed: {
    columns() {
      return [
        {
          label: "组织",
          prop: "orgId",
          hideInTable: true,
          valueType: "treeSelect",
        },
        {
          label: "序号",
          width: 60,
          hideInSearch: true,
          tableColumnProps: { type: "index" },
        },
        {
          label: "活动名称",
          prop: "activityName",
          hideInSearch: true,
          minWidth: 90,
          render:(row, {record}) => (<el-button type="text" onClick={()=>this.handleUpdate(record, 'review')}>{record.activityName}</el-button>)
        },
        {
          label: "推广渠道",
          prop: "activityChannel",
          hideInSearch: true,
          minWidth: 90,
          valueType: 'dictSelect', 
          fieldProps: { dict: 'activity_channel' },
        },
        {
          label: "组织",
          prop: "orgName",
          hideInSearch: true,
          minWidth: 90,
          valueType: "text",
        },
        {
          label: "活动开始时间",
          prop: "activityStartTime",
          hideInSearch: true,
          minWidth: 90,
          render: (h, { record }) => (
            <BreakTime dateTime={record.activityStartTime} />
          ),
        },
        {
          label: "活动结束时间",
          prop: "activityEndTime",
          hideInSearch: true,
          minWidth: 90,
          render: (h, { record }) => (
            <BreakTime dateTime={record.activityEndTime} />
          ),
        },
        {
          label: "活动创建时间",
          prop: "createTime",
          hideInSearch: true,
          minWidth: 90,
          render: (h, { record }) => <BreakTime dateTime={record.createTime} />,
        },
        {
          label: "发放优惠券张数",
          prop: "receiveCouponNum",
          hideInSearch: true,
          minWidth: 90
        },
        {
          label: "发放积分量",
          prop: "receiveScore",
          hideInSearch: true,
          minWidth: 90,
          valueType: "text",
        },
        {
          label: "发放次数",
          prop: "receiveNum",
          hideInSearch: true,
          minWidth: 90,
          valueType: "text",
        },
        {
          label: "支付金额（使用优惠券）",
          prop: "payAmount",
          hideInSearch: true,
          minWidth: 90,
          valueType: "money",
        },
        {
          label: "状态",
          prop: "timeStatus",
          minWidth: 90,
          valueType: 'dictSelect', fieldProps: { dict: 'share_activity_status' },
          order: 1
        },
        { label: "操作", prop: "action", hideInSearch: true },
      ];
    },
  },
  
  methods: {
    formatSearchParams(obj) {
      return {
        ...obj,
      };
    },
    
    /** 新增按钮操作 */
    handleAdd() {
      this.type="add"
      this.$refs.editRef.open = true;
      this.$refs.editRef.reset();
      this.$refs.editRef.getList()
      this.$refs.editRef.title = "新增二维码引流活动（根据用户授权的位置信息确认市场发市场券，如果不在范围内则发全国通用券）"
    },
    /** 修改按钮操作 */
    handleUpdate(row, type) {
      this.type=type
      this.$refs.editRef.title = `${type=='update' ? '修改' :  '查看'}二维码引流活动（根据用户授权的位置信息确认市场发市场券，如果不在范围内则发全国通用券）`
      this.$refs.editRef.getInfo(row.activityId)
    },
   
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm(`是否删除${row.activityName}?`, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
      .then(() => {
        return delActivityInfo( row.activityId);
      })
      .then(() => {
        this.$refs?.proTable?.getListData();
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
        return updateActivityInfoStatus({ activityId: row.activityId, status })
      })
      .then(() => {
        setTimeout(()=>{
            this.$refs?.proTable?.getListData()
          }, 1000)
        this.msgSuccess(`${{ 'overdue': '失效', 'enable': '启用', 'disable': '禁用' }[status]}成功`)
      })
    },
    updateList() {
      this.$refs?.proTable?.getListData()
    }
  },
};
</script>
