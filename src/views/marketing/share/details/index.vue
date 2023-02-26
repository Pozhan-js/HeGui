<template>
  <div>
    <pro-table
      :api-config="{ url: '/customer/share/list' }"
      :columns="columns"
      :params="params"
      :before-search-submit="formatSearchParams"
      :row-key = "row => row.customerShareId"
      @reset-search="dateValue = undefined"
    >
      <template #action_column_content="scope">
        <el-button type="text" size="mini" @click="handleViewDetail(scope.row)">详情</el-button>
      </template>
    </pro-table>
    <el-dialog title="详情" :visible.sync="dialogVisible" >
      <div class="dialog-title-info">活动发起人: {{customerShareRecord && customerShareRecord.nickname}} | {{customerShareRecord &&customerShareRecord.customerId}}</div>
      <div class="el-table" v-loading="loading">
        <div v-for="(row, index) in list" :key="index">
          <el-row class="el-table__header">
            <el-col class="th" :span="1">{{index + 1}}</el-col>
            <el-col class="th" :span="7">分享时间：{{row.shareTime}}</el-col>
            <el-col class="th" :span="5">奖品类型：优惠券</el-col>
            <el-col class="th" :span="7">奖品内容：{{row.rewardName}}</el-col>
            <el-col class="th" :span="4">状态：{{formatterStatus(row.status)}}</el-col>
          </el-row>
          <div class="el-table__body-wrapper">
            <template v-if="row.customerShareReceiveList.length">
              <el-row class="el-table__row el-table__row-header">
                <el-col class="td" :span="6">被分享人</el-col>
                <el-col class="td" :span="8">参与时间</el-col>
                <el-col class="td" :span="8">发放状态</el-col>
              </el-row>
              <div class="el-table__body">
                <el-row class="el-table__row"  v-for="(item, index) in row.customerShareReceiveList" :key="index" v-show="index < row.showLimitNum">
                  <el-col class="td" :span="6">{{item.receiveCustomerName ? item.receiveCustomerName : '游客'}}</el-col>
                  <el-col class="td" :span="8">{{item.clickTime}}</el-col>
                  <el-col class="td" :span="8">{{formatterStatus(item.status)}}</el-col>
                </el-row>
              </div>
              <div class="text-center" v-if="row.customerShareReceiveList.length > 5" >
                <el-button class="collapse" type="text" size="mini"  @click="handleClickCollapse(row)">
                  <i class="ml5" :class="row.customerShareReceiveList.length > row.showLimitNum ? 'el-icon-arrow-down' : 'el-icon-arrow-up'" />
                </el-button>
              </div>
            </template>
            <div v-else class="el-table__empty-block" style="height: 100%; "><span class="el-table__empty-text">暂无数据</span></div>
          </div>
        </div>

        <div v-if="list.length === 0" class="el-table__empty-block" style="height: 100%; "><span class="el-table__empty-text">暂无数据</span></div>
      </div>
      <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="detailQueryParams.pageNum"
          :limit.sync="detailQueryParams.pageSize"
          :page-sizes="[2, 4, 6, 8]"
          @pagination="getShareRecordList(customerShareRecord.customerShareId)"
        />
    </el-dialog>
  </div>
</template>

<script>
import ProTable from '@/components/ElProComponents/ProTable'
import {
  shareRecordList
} from "@/api/marketing/shareInfo";

export default {
  components: {
    ProTable
  },
  data: () => ({
    params: {
      orderByColumn:"customer_share_id",
      isAsc:"desc"
    },
    SearchConfig: {
      span: 6
    },
    queryParams: {
      pageNum: 1,
      pageSize: 10
    },
    // 弹框详情内容
    dialogVisible: false,
    loading: false,
    detailQueryParams: {
      orderByColumn:'customer_share_record_id',
      isAsc:'desc',
      pageNum: 1,
      pageSize: 2
    },
    customerShareRecord: null,
    list: [],
    total: 0,
    isCollapseOpen: false,
    prizeGrantOptions: null
  }),
  computed: {
    columns() {
      return [
        { label: '分享人信息', prop: 'shareName', minWidth: 90,
          render: (h, { record }) => (
            <jump path="/customer/customerInfo" query={{customerId: record.customerId}}>
                <img
                  src={record.avatar ? record.avatar : '/avatar.png'}
                  style="width: 40px; height: 40px; border-radius: 50%"
                />
                <div class="outer-link--text">{ record.nickname }</div>
                <div>{ record.customerId }</div>
            </jump>
          ), order: 1 
        },
        { label: '被分享人信息', prop: 'shareReceiveName', hideInTable:true, valueType: 'text', order: 2 },
        { label: '分享时间', prop: 'createTime', valueType: 'dateTimeRange', minWidth: 110, newLine: true, order: 3, span: 8 },
        { label: '分享次数', prop: 'shareNum', hideInSearch:true, minWidth: 80, valueType: 'text' },
        { label: '组织', prop: 'orgName', hideInSearch:true, minWidth: 110, valueType: 'text' },
        { label: '组织', prop: 'orgId', hideInTable:true, valueType: 'treeSelect', order: 5 },
        { label: '获得奖励', prop: 'rewardName', hideInSearch: true, minWidth: 100, valueType: 'text' },
        { label: '活动名称', prop: 'activityName', minWidth: 90, valueType: 'text', order: 1 },
        { label: '被分享人数', prop: 'receiveUserNum',  hideInSearch: true, minWidth: 80, valueType: 'text' },
        { label: '奖励份数', prop: 'rewardNum', hideInSearch:true, minWidth: 80, valueType: 'text' },
        { label: '操作', prop: 'action', hideInSearch: true }

      ]
    }
  },
  created() {
    if(this.$route.query.activityName) {
      this.params.activityName = this.$route.query.activityName
    }
    this.getDicts('share_prize_grant_status').then((response) => {
      this.prizeGrantOptions = response.data
    })
  },
  methods: {
    formatSearchParams(obj) {
      return {
        ...obj,
      }
    },
    formatterStatus(status) {
      return this.prizeGrantOptions.find( item=> item.dictValue === status).dictLabel
    },
    handleViewDetail(row) {
      this.customerShareRecord = row
      this.getShareRecordList(row.customerShareId)
      this.dialogVisible = true
    },
    getShareRecordList(customerShareId) {
      this.loading = true
      shareRecordList({...this.detailQueryParams, customerShareId}).then(res=>{
        this.list = res.rows.map(item=>{
          item.showLimitNum =  item.customerShareReceiveList.length > 5 ? 5 : item.customerShareReceiveList.length
          return item
        })
        this.total = res.total
        this.loading = false
      })
    },
    handleClickCollapse(row) {
      row.showLimitNum = row.showLimitNum >= row.customerShareReceiveList.length ? 5 :  row.customerShareReceiveList.length
    },
  },
  
}
</script>

<style lang="scss" scoped>
.el-table {
  padding: 10px;
  &__header{
    background-color: #e3e3e3;
  }
  .th, .td {
    word-break: break-word;
    color: #515a6e;
    height: 40px;
    line-height: 20px;
    font-size: 13px;
    padding: 10px;
    display: inline-block;
  }
  .el-table__row-header {
    font-weight: 600;
  }
}

.dialog-title-info{
  font-weight: 600;
  padding: 0 20px 10px;
}
/deep/ .flex{
  display: flex;
}
</style>
