<template>
  <el-dialog v-model="show">
    <pro-table
      ref="proTableRef"
      :api-config="{ url: '/shop/list' }"
      :columns="columns"
      row-key="orgId"
    />
  </el-dialog>
</template>

<script>
import ProTable from '@/components/ElProComponents/ProTable'
export default {
  components: {
    ProTable
  },
  data() {
    return {
      show: false,
      columns: [
        {},
        {},
        {},
        {},
      ]
    }
  },
  methods: {
    selectOrg() {
      this.show = true
    },
  }
}
</script>

<style>

</style>