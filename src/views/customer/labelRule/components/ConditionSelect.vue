<template>
  <el-select v-bind="$attrs" no-data-text="请先选择判断属性" v-on="$listeners" @change="onChange">
    <el-option v-for="item in list" :key="item.conditionId" :value="item.conditionId" :label="item.conditionName" />
  </el-select>
</template>

<script>
import {
  getLabelConditionList
} from '@/api/customer/label'
export default {
  props: {
    property: Object
  },
  data() {
    return {
      list: []
    }
  },
  watch: {
    property(current, prev) {
      if (!current) return
      if (current.propertyType !== prev?.propertyType) {
        this.list = []
      }
      if (current.propertyId !== prev?.propertyId) {
        this.$emit('input', undefined)
      }
      this.queryList()
    }
  },
  created() {
    if (this.property?.propertyType != null) this.queryList()
  },
  methods: {
    queryList() {
      getLabelConditionList({ propertyType: this.property.propertyType }).then(res => {
        this.list = res.data
        this.updateConditionCode(this.$attrs.value)
      })
    },
    updateConditionCode(value) {
      const current = this.list.find(i => i.conditionId === value)
      this.$emit('update:conditionCode', current?.conditionCode)
    },
    onChange(value) {
      this.updateConditionCode(value)
      this.$emit('change', value)
    }
  }
}
</script>

<style>

</style>
