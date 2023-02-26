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
    params: Object
  },
  computed: {
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
      ]
    },
    selectedIds() {
      return this.value?.map(i => i.couponId) ?? []
    },
    selectedRecords() {
      const ret = {}
      this.value.forEach(i => {
        ret[i.couponId] = i
      })
      return ret
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
    handleTableSelection(selection) {
      this.selected = selection.map(i => this.selectedRecords[i.couponId] || i)
    },
    handleConfirmDialog() {
      this.$emit('input', this.selected.map(i => ({ 
        couponName: i.couponName,
        couponRule: i.couponRule,
        type: i.type,
        couponId: i.couponId,
        remainingNum: i.remainingNum,
        ...this.selectedRecords[i.couponId]
      })))
      this.showDialog = false
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
