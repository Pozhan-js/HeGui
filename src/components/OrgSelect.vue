<template>
  <Cascader
    v-if="!useElem"
    :value="normalizeValue"
    @change="onChange"
    :options="orgOptions"
    style="width: 300px"
    change-on-select
    expand-trigger="hover"
    placeholder="请选择组织"
    :fieldNames="{ value: 'id', label: 'label', children: 'children' }"
    v-bind="$attrs"
    @keyup.enter.native="$emit('query')"
  />
  <el-cascader
    v-else
    :value="normalizeValue"
    @change="onChange"
    :options="orgOptions"
    style="width: 300px"
    :props="{ value: 'id', label: 'label', expandTrigger: 'hover' }"
    placeholder="请选择组织"
    @keyup.enter.native="$emit('query')"
    v-bind="$attrs"
  />
</template>

<script>
import { Cascader } from "ant-design-vue";
import { getOrgTree } from '@/api/utils'
import { flatten, searchSuperior } from '@/utils/array'

export default {
  name: 'OrgSelect',
  components: { Cascader },
  props: {
    value: [Array, String, Number],
    useElem: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      orgOptions: []
    }
  },
  computed: {
    isArrayValue() {
      return Array.isArray(this.value)
    },
    normalizeValue() {
      if (this.isArrayValue) {
        return this.value
      }
      if (this.value && this.orgOptions.length) {
        return this.pathsValue
      }
      return undefined
    },
    pathsValue() {
      const idRecord = {}
      const paths = []
      const flattened = flatten(this.orgOptions, 'children')
      flattened.forEach(item => { idRecord[item.id] = item })
      let entry = flattened.find(i => i.id === +this.value)

      if (this.value) {
        paths.push(+this.value)
      }

      while(entry) {
        const parentId = entry.parentId
        entry = idRecord[parentId]
        if (entry) {
          paths.push(entry.id)
        }
      }
      return paths.reverse()
    },
  },
  created() {
    // 查询组织
    getOrgTree().then((res) => {
      if (res.code === 200) {
        this.orgOptions = res.data
      }
    })
  },
  methods: {
    onChange(e) {
      this.$emit('input', this.isArrayValue ? e : e.slice(-1)?.[0])
    }
  }
}
</script>

<style scoped>

</style>
