<template>
  <el-form-item label="组织" prop="orgId">
    <Cascader
      v-model="queryParams.orgId"
      :options="obj.orgOptions"
      style="width: 300px"
      change-on-select
      expand-trigger="hover"
      placeholder="请选择组织"
      :field-names="{ value: 'id', label: 'label', children: 'children' }"
    />
  </el-form-item>
</template>

<script>
  import { Cascader } from "ant-design-vue";
  // import { getOrgTree } from "@/api/utils"
  export default {
    name:'OrgField',
    components: {
      Cascader
    },
    props: {
      queryParams: {
        type: Object
      }
    },
    // data() {
    //   return {
    //     orgOptions: null
    //   }
    // },
    inject: ['obj'],
    // created() {
    //   // 查询组织
    //   getOrgTree().then((res) => {
    //     if (res.code === 200) {
    //       this.orgOptions = res.data
    //     }
    //   })
    // },
  }
</script>

<style lang="scss" scoped>
  
</style>