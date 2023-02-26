<template>
  <el-select
    :value="value"
    placeholder="请选择所属分组"
    multiple
    clearable
    size="small"
    style="width: 300px"
    @change="v => $emit('input', v)"
  >
    <el-option
      v-for="group in groupOptions"
      :key="group.id"
      :label="group.name"
      :value="group.id"
    />
  </el-select>
</template>

<script>
import { getDropDown } from '@/api/selectUtils'

export default {
  props: {
    value: Array,
    orgId: String | Array
  },
  data(){
    return { 
      groupOptions: []
    }
  },
  watch: {
    orgId: {
      handler(val) {
        getDropDown('distributionGroup', {orgId:val}).then((res) => {
          this.groupOptions = res.data
          this.$emit('input', [])
        })
      },
      immediate: true,
      deep: true
    }
  },
}
</script>

<style>

</style>