<template>
  <span class="coupon-select">
    <slot name="trigger" :showSelectDialog="showSelectDialog"></slot>
    <el-dialog :visible.sync="showDialog" title="发优惠券" width="1200px">
      <pro-table
        ref="proTableRef"
        :api-config="{ url: '/marketing/couponInfo/can/issue' }"
        :columns="columns"
        :params="params"
        row-key="couponId"
        container-class-name="pro-table-container"
        @selection-change="handleTableSelection"
        :onLoad="setDefaultCoupon"
        manual-request
      >
      <template #action_column_content="{row}">
        <el-input-number v-model="row.giftNumber" :min="1" :disabled="!isSelectCurrent(row)" :max="+row.remainingNum" :step="1" :precision="0" style="width: 130px"/>
      </template>
        <template #table-footer-btns="{ checkedList }">
          <el-button :disabled="!checkedList.length" type="primary" size="small" @click="handleConfirmDialog">确定</el-button>
          <el-button size="small" @click="showDialog = false">取消</el-button>
        </template>
      </pro-table>
    </el-dialog>
  </span>
</template>

<script>
import ProTable from '@/components/ElProComponents/ProTable'

export default {
  name: "TableSelect",
  components: { ProTable },
  props: {
    orgId: [String, Number],
    value: Array,
  },
  computed: {
    params: () => ({
      issueCouponFlagList: 'score_mall,marketing_activity',
      effectivePeriodTypeList: 'received_effective,received_specify_effective'
    }),
    columns() {
      return [
        {
          prop: "selection",
          width: 105,
          hideInSearch: true,
          tableColumnProps: { type: "selection" },
        },
        { label: '优惠券名称', prop: 'couponName' },
        { label: '内容', prop: 'couponRule', hideInSearch: true },
        { label: '类型', prop: 'type', valueType: "dictSelect", fieldProps: { dict: "coupon_type" } },
        { label: '总张数', prop: 'totalNumberSheet', hideInSearch: true },
        { label: '剩余张数', prop: 'remainingNum', hideInSearch: true },
        { label: '开始时间', prop: 'effectiveBeginTime', hideInSearch: true },
        { label: '结束时间', prop: 'effectiveEndTime', hideInSearch: true },
        { label: "赠送数量", prop: "action", hideInSearch: true, width: 200 },
      ]
    },
    selectedIds() {
      return this.value?.map(i => i.couponId) ?? []
    },
  },
  watch: {
    value() {
      this.selected = this.value
    },
  },
  data() {
    return {
      showDialog: false,
      selected: [],
    };
  },
  methods: {
    setDefaultCoupon(data) {
      if (!this.tableCompRef) {
        this.tableCompRef = this.$refs.proTableRef.getComponentRef("table");
      }
      this.tableCompRef?.$nextTick(() => {
        data.forEach(row => {
          if (this.selectedIds.includes(row.couponId)) {
            this.tableCompRef?.toggleRowSelection(row, true);
            const defaultItem = this.value.find(i => i.couponId === row.couponId)
            row.giftNumber = defaultItem.giftNumber
            row.signExtraId = defaultItem.signExtraId
            row.signRuleCouponId = defaultItem.signRuleCouponId
          }
        })
      })
    },
    showSelectDialog() {
      this.showDialog = true
      this.$nextTick(() => {
        this.$refs.proTableRef.reload()
      })
    },
    isSelectCurrent(item) {
      return this.selected.includes(item)
    },
    handleTableSelection(selection) {
      this.selected = selection
    },
    handleConfirmDialog() {
      if (this.selected.every(i => i.giftNumber != null)) {
        this.$emit('input', this.selected.map(i => ({ 
          couponId: i.couponId,
          couponName: i.couponName,
          giftNumber: i.giftNumber,
          signExtraId: i.signExtraId,
          signRuleCouponId: i.signRuleCouponId
        })))
        this.showDialog = false
      } else {
        this.msgError('请填写卡券数量')
      }
    }
  },
};
</script>

<style>
.coupon-select .el-input__inner {
  border-color: #DCDFE6 !important;
}
</style>

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
