<template>
  <span :class="{isLink: includeThisRoute}" @click="to">
    <slot />
  </span>
</template>

<script>
export default {
  name: 'Jump',
  props: {
    path: String,
    query: Object,
    params: Object
  },
  data() {
    return {
      includeThisRoute: false
    }
  },
  created() {
    try {
      const resolver = this.$router.resolve(this.path)
      this.includeThisRoute = resolver.resolved?.path === this.path
    } catch {
      this.includeThisRoute = false
    }
  },
  methods: {
    to() {
      if (this.includeThisRoute) {
        this.$router.push({ path: this.path, query: this.query, params: this.params })
      }
    }
  }
}
</script>

<style scoped>
.isLink {
  color: #1890ff;
  cursor: pointer;
}
</style>
