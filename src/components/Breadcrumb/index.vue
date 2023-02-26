<template>
  <el-breadcrumb class="app-breadcrumb" separator="/">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="(item,index) in levelList" :key="item.path">
        <span v-if="item.redirect==='noRedirect'||index==levelList.length-1" class="no-redirect">{{ item.meta.title }}</span>
        <a v-else @click.prevent="handleLink(item)">{{ item.meta.title }}</a>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script>
export default {
  data() {
    return {
      levelList: null
    }
  },
  watch: {
    $route(route) {
      // if you go to the redirect page, do not update the breadcrumbs
      if (route.path.startsWith('/redirect/')) {
        return
      }
      this.getBreadcrumb()
    }
  },
  created() {
    this.getBreadcrumb()
  },
  methods: {
    getBreadcrumb() {
      // only show routes with meta.title
      let matched = this.$route.matched.filter(item => item.meta && item.meta.title)
      const first = matched[0]

      // if (!this.isDashboard(first)) {
      //   matched = [{ path: '/index', meta: { title: '首页' }}].concat(matched)
      // }
      const levelList = []
      const newMatched = matched.filter(item => item.meta && item.meta.title && item.meta.breadcrumb !== false)
      newMatched.map(item => {
        if (item.meta.fatherName) {
          levelList.push({ path: '', redirect: "noRedirect", meta: { title: item.meta.fatherName } })
        }
        levelList.push(item)
      })
      this.levelList = levelList
    },
    isDashboard(route) {
      const name = route && route.name
      if (!name) {
        return false
      }
      return name.trim() === '首页'
    },
    handleLink(item) {
      const { redirect, path } = item
      if (redirect) {
        this.$router.push(redirect)
        return
      }
      const carryArr = ['Activity']
      let currentPath = this.$route.path.split('/')
      currentPath = currentPath.filter((item, index) => index !== currentPath.length - 1).join('/')
      if (carryArr.includes(item.name) && path === currentPath) {
        this.$router.push({
          path,
          query: this.$route.query
        })
        return 
      }
      this.$router.push(path)
    }
  }
}
</script>

<style lang="scss" scoped>
.app-breadcrumb.el-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 50px;
  margin-left: 8px;

  .no-redirect {
    color: #97a8be;
    cursor: text;
  }
}
</style>
