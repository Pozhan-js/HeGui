<template>
  <div v-if="!route.hidden" class="nav-item">
    <el-submenu v-if="hasChildren" :index="resolvedBase">
      <template v-if="route.meta" slot="title">
        <svg-icon style="margin-right: 8px" :icon-class="route.meta.icon" />
        <span>{{ route.meta.title }}</span>
      </template>
      <nav-item v-for="item in route.children" :key="item.path" :route="item" :base="resolvedBase" />
    </el-submenu>
    <el-menu-item v-else :index="resolvedBase" @click="to">
      <svg-icon v-if="route.meta" style="margin-right: 8px" :icon-class="route.meta.icon" />
      <span v-if="route.meta">{{ route.meta.title }}</span>
    </el-menu-item>
  </div>
</template>

<script>
import path from 'path'
export default {
  name: 'NavItem',
  props: {
    route: Object,
    base: String
  },
  computed: {
    resolvedBase() {
      if (this.route.path.startsWith('http')) {
        return this.route.path
      }
      return path.resolve(this.base, this.route.path)
    },
    hasChildren() {
      return this.route.children != null && this.route.children.some(i => !i.hidden)
    }
  },
  methods: {
    to() {
      if (this.resolvedBase.startsWith('http')) {
        window.open(this.resolvedBase)
      } else {
        this.$router.push(this.resolvedBase)
      }
    }
  }
}
</script>

<style lang="scss">
@import "~@/assets/styles/variables.scss";
.nav-item {
  .el-submenu {
    &.is-opened {
      .el-menu {
        background: rgba($primary, .05);
        border-radius: 3px;
      }
    }
  }
  .el-menu-item.is-active {
    position: relative;
    background: rgba($primary, .3);
    &:before {
      position: absolute;
      content: '';
      right: 0;
      top: 0;
      bottom: 0;
      width: 2px;
      background: $primary;
    }
  }
  .el-submenu .el-menu-item {
    min-width: unset;
    padding: 0;
  }
  .el-menu-item,
  .el-submenu__title {
    padding-left: 10px !important;
    &:hover {
      background: rgba($primary, .3);
    }
  }
}
</style>
