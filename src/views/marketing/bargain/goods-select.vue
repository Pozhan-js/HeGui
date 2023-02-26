<template>
  <div>
    <slot name="trigger" :showSelectDialog="showSelectDialog"></slot>
    <el-dialog :visible.sync="showDialog" title="请选择活动商品">
      <pro-table
        ref="proTableRef"
        :api-config="{ url: '/shopGoods/goodsStockList' }"
        :params="{ orgId }"
        :columns="columns"
        manual-request
        row-key="goodsId"
        container-class-name="pro-table-container"
        @selection-change="handleTableSelection"
      >
        <template #table-footer-btns="{ checkedList }">
          <el-button
            :disabled="!checkedList.length"
            type="primary"
            size="small"
            style="position: absolute; left: 15px"
            @click="handleConfirmDialog(checkedList)"
            >确定</el-button
          >
          <el-button size="small" @click="showDialog = false"
            >取消</el-button
          >
        </template>
      </pro-table>
    </el-dialog>
  </div>
</template>

<script>
import ProTable from '@/components/ElProComponents/ProTable'

export default {
  name: "TableSelect",
  components: { ProTable },
  props: {
    orgId: [String, Number]
  },
  data() {
    const renderGroup = ({ record }) => {
      return record.groupNameList?.join("，");
    };

    return {
      showDialog: false,
      columns: [
        {
          prop: "selection",
          width: 105,
          hideInSearch: true,
          tableColumnProps: { type: "selection" },
        },
        {
          label: "商品分组",
          prop: "groupNameList",
          hideInSearch: true,
          renderText: renderGroup,
        },
        { label: "商品名称", prop: "goodsName", span: 8 },
        {
          label: "价格（元）",
          prop: "price",
          valueType: "money",
          hideInSearch: true,
        },
        { label: "总库存", prop: "totalStock", hideInSearch: true },
      ],
    };
  },
  methods: {
    showSelectDialog() {
      if (this.orgId == null) {
        this.$message.error('请先选择活动区域')
        return
      }
      this.showDialog = true
      this.$nextTick(() => {
        this.$refs.proTableRef.reload()
      })
    },
    handleTableSelection(selection) {
      if (!this.tableCompRef) {
        this.tableCompRef = this.$refs.proTableRef.getComponentRef("table");
      }
      if (selection.length > 1) {
        // 强制单选
        this.tableCompRef?.toggleRowSelection(selection[0], false);
      }
    },
    handleConfirmDialog(checked) {
      const item = checked[0]
      this.$emit('select', item)
      this.showDialog = false
    }
  },
};
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
