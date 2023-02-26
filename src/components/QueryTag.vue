<template>
  <div>
    <el-tag
      v-for="tag in getInRouteTypes"
      :key="tag.type"
      closable
      @close="onClose(tag)"
      type="danger"
      style="margin-right: 10px;"
    >
      {{ tag | nameFilter }}
    </el-tag>
  </div>
</template>

<script>
export default {
  name: 'QueryTag',
  props: {
    tags: {
      type: Array,
      default: () => []
    }
  },
  filters: {
    nameFilter(i) {
      if (Array.isArray(i)) {
        return i.map(i => i.name).join('，')
      }
      return i.name
    }
  },
  computed: {
    getInRouteTypes() {
      return this.getMatchedTag.map(i => {
        if (Array.isArray(i)) {
          return i.filter(i => {
            const queryItem = this.$route.query[i.type]
            return queryItem != null && queryItem.length
          })
        }
        return i
      })
    },
    getMatchedTag() {
      return this.tags.filter(i => {
        if (Array.isArray(i)) {
          return i.some(i => this.$route.query[i.type] != null && this.$route.query[i.type].length)
        }
        return this.$route.query[i.type] != null && this.$route.query[i.type].length
      })
    }
  },
  methods: {
    onClose(tag) {
      const query = {}
      Object.entries(this.$route.query).forEach(([key, value]) => {
        if (Array.isArray(tag)) {
          if (tag.every(i => i.type !== key)) {
            query[key] = value
          }
        } else if (key !== tag.type) {
          query[key] = value
        }
      })
      this.$emit('close-tag', tag)
      this.$router.replace({ query })
    }
  }
}
</script>

<style scoped>

</style>
