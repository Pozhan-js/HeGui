<template>
  <el-dialog :visible.sync="visible" title="设置奖品" append-to-body destroy-on-close>
    <pro-table
      ref="proTableRef"
      :api-config="{ url: '/marketing/couponInfo/list' }"
      :columns="columns"
      :params="params"
      row-key="couponId"
      container-class-name="pro-table-container"
      :on-reset="handleReset"
      @selection-change="handleTableSelection"
    >
      <template #action_column_content="{}">
        <el-button type="text" size="mini">运营发券</el-button>
        <el-button type="text" size="mini">加标签</el-button>
      </template>
      <template #table-footer-btns="{checkedList}">
        <el-button :disabled="!checkedList.length" type="primary" size="small" style="position: absolute; left: 15px" @click="confirmDialog(checkedList)">确定</el-button>
        <el-button size="small" @click="cancelDialog">取消</el-button>
      </template>
    </pro-table>
  </el-dialog>
</template>

<script>
import ProTable from '@/components/ElProComponents/ProTable'

export default {
  components: {
    ProTable
  },
  props: {
    couponListParams: Object
  },
  data: () => ({
    visible: false
  }),
  computed: {
    params() {
      return {
        activityTypeFlag: 'marketing_activity',
        status: 1,
        ...this.couponListParams
      }
    },
    columns() {
      const renderThreshold = ({ record }) => {
        if (record.useThreshold === 'full_yuan') {
          return `满${this.toDecimal2(record.orderFull / 100)}元`
        } else {
          return '无门槛'
        }
      }
      const renderBeginTime = ({ record }) => {
        switch (record.effectivePeriodType) {
          case 'time_limit':
            return record.effectiveBeginTime
          case 'received_effective':
            return '领取后立即生效'
          case 'received_specify_effective':
            return `领取后${record.effectiveReceivedDay}天生效`
        }
      }
      const renderEndTime = ({ record }) => {
        if (record.effectivePeriodType === 'time_limit') {
          return record.effectiveEndTime
        }
        return `有效期领取后${record.effectiveValidityDay}天`
      }

      return [
        { prop: 'selection', width: 80, hideInSearch: true, tableColumnProps: { type: 'selection' }},
        { label: '活动名称', prop: 'couponName', span: 8 },
        { label: '类型', prop: 'type', hideInSearch: true, valueType: 'dictSelect', fieldProps: { dict: 'coupon_type' }},
        { label: '门槛', prop: 'useThreshold', hideInSearch: true, renderText: renderThreshold },
        { label: '优惠', prop: 'couponDiscountFlag', hideInSearch: true },
        { label: '已领取', prop: 'receivedNum', hideInSearch: true },
        { label: '已使用', prop: 'usedNum', hideInSearch: true },
        { label: '开始时间', prop: 'beginTime', hideInSearch: true, renderText: renderBeginTime },
        { label: '结束时间', prop: 'endTime', hideInSearch: true, renderText: renderEndTime },
        { label: '状态', prop: 'status', span: 8, valueType: 'dictSelect', fieldProps: { dict: 'coupon_pck_status' }}
      ]
    }
  },
  methods: {
    confirmDialog(checked) {
      this.$emit('confirm', checked[0])
      this.visible = false
    },
    openDialog() {
      this.visible = true
    },
    cancelDialog() {
      this.visible = false
    },
    handleTableSelection(selection) {
      if (!this.tableCompRef) {
        this.tableCompRef = this.$refs.proTableRef.getComponentRef('table')
      }
      if (selection.length > 1) {
        // 强制单选
        this.tableCompRef?.toggleRowSelection(selection[0], false)
      }
    },
    handleReset() {
      this.tableCompRef?.clearSelection()
    }
  }
}
</script>

<style lang="scss" scoped>
  /deep/ .pro-table-container {
    .el-table__header-wrapper .el-checkbox {
      display: none;
    }
    .table-footer {
      position: relative;
      .el-checkbox {
        display: none;
      }
    }
  }
</style>
