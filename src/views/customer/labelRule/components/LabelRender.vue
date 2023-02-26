<template>
  <div>
    <el-dropdown v-if="row.customerLabelRelationList.length > 1">
      <span class="el-dropdown-link">
        客群标签<i class="el-icon-arrow-down el-icon--right" />
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item
          v-for="item in row.customerLabelRelationList"
          :key="item.labelId"
        >
          {{ item.labelName }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <el-tag v-else>
      {{ row.customerLabelRelationList[0].labelName }}
    </el-tag>
  </div>
</template>

<script>
export default {
  props: {
    row: Object
  }
}
</script>

<style scoped>
.el-dropdown-link {
  cursor: pointer;
  color: #409eff;
}
.el-icon-arrow-down {
  font-size: 12px;
}
</style>
