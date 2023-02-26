<template>
  <div class="nav" :class="{ 'has-logo': true }" @mouseleave="resetFocus">
    <div class="left">
      <logo :collapse="false" />
      <div class="menu-wrapper" :class="settings.sideTheme">
        <div class="menu-list">
          <div
            v-for="route in routes"
            :key="route.path"
            class="menu-item"
            :class="{ active: isActive(route), hover: route == focusPanel }"
            @mouseenter="focus(route)"
            @click="to(route)"
          >
            <svg-icon :icon-class="route.meta.icon" />
            <div>{{ route.meta.title }}</div>
          </div>
        </div>
      </div>
    </div>
    <transition name="menu">
      <div v-if="validChildren && validChildren.length" class="right" :class="{closed: openFoldMenu}">
        <div class="expand-button" @click="toggleRightMenu" />
        <div class="current-title">{{ focusPanel.meta.title }}</div>
        <el-menu
          :default-active="activeMenu"
          :collapse="false"
          :unique-opened="true"
          :collapse-transition="false"
          mode="vertical"
        >
          <nav-item
            v-for="route in validChildren"
            :key="route.path"
            :route="route"
            :base="focusPanel.path"
          />
        </el-menu>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import Logo from './Sidebar/Logo'
import SvgIcon from '@/components/SvgIcon'
import NavItem from './NavItem'

export default {
  components: { Logo, SvgIcon, NavItem },
  data() {
    return {
      focusPanel: undefined,
      collapse: false
    }
  },
  computed: {
    ...mapState({ settings: state => state.settings, openFoldMenu: state => state.app.openFoldMenu }),
    ...mapGetters(['sidebarRouters', 'sidebar']),
    routes() {
      return this.sidebarRouters.filter(i => i?.meta != null)
    },
    validChildren() {
      return this.focusPanel?.children?.filter(i => !i.hidden)
    },
    activeMenu() {
      const { meta, path } = this.$route
      return meta.activeMenu || path
    }
  },
  watch: {
    validChildren(children) {
      this.$store.commit('app/TOGGLE_FOLD_MENU', !children?.length)
    },
    '$route.path': 'resetFocus'
  },
  created() {
    this.resetFocus()
  },
  methods: {
    toggleRightMenu() {
      this.$store.commit('app/TOGGLE_FOLD_MENU', !this.$store.state.app.openFoldMenu)
    },
    /**
     * 当鼠标移入的时候，把当前菜单显示在右侧
     */
    focus(route) {
      const validChild = route.children?.filter(i => !i.hidden)
      if (validChild?.length) {
        this.focusPanel = route
        this.$store.commit('app/TOGGLE_FOLD_MENU', false)
      }
    },
    to(route) {
      const validChild = route.children?.filter(i => !i.hidden)
      if (!validChild?.length) {
        if (route.path.startsWith('http')) {
          window.open(route.path)
        } else {
          /**
           * hack 这种情况表示要跳往首页
           */
          this.$router.push('/')
        }
        this.focusPanel = route
        this.$store.commit('app/TOGGLE_FOLD_MENU', false)
      }
    },
    /**
     * 当光标移出菜单区域，重新计算当前选中的菜单
     */
    resetFocus() {
      this.focusPanel = this.routes.find(this.isActive)
    },
    /**
     * 判断是不是当前选中的路由
     */
    isActive(route) {
      /**
       * hack 框架对于一层路由操作过于复杂，以此解决最为简单。暂未找到最优解。
       */
      if (route.path === '//') {
        return this.$route.matched.some(i => i.path === '/index')
      }
      return this.$route.matched.some(i => i.path === route.path)
    }
  }
}
</script>

<style lang="scss">
@import "~@/assets/styles/variables";
.nav {
  background-color: #fff !important;
  display: flex;
  ::-webkit-scrollbar {
    display: none;
  }
  .left {
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
    z-index: 999;
    background: #fff;
  }
  .sidebar-logo-container {
    background-color: transparent !important;
  }
  .menu-wrapper {
    .menu-list {
      width: 80px;
    }
    .menu-item {
      font-size: 14px;
      display: flex;
      align-items: center;
      flex-direction: column;
      border-radius: 5px;
      width: 56px;
      background: rgba($primary, .1);
      padding: 10px 0;
      margin: 0 auto 10px;
      text-align: center;
      cursor: pointer;

      &:hover {
        background: rgba($primary, 1);
        color: #fff;
      }
      .svg-icon {
        display: none;
      }
      &.active {
        background: $primary;
        color: #fff;
        .svg-icon {
          display: block;
          width: 1.2em;
          height: 1.2em;
        }
      }
      &.hover:not(.active) {
        background: $primary;
        color: #fff;
      }
    }
  }
  .menu-enter, .menu-leave-to, .closed {
    transform: translateX(-100%);
  }
  .right {
    position: absolute;
    transition: transform .3s;
    top: 50px;
    left: 80px;
    width: $sideBarWidth;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
    bottom: 0;
    background: #fff;
    z-index: 998;
    &.closed {
      .expand-button::before {
        background-image: url('~@/assets/images/fold.png');
      }
    }
    .expand-button {
      position: absolute;
      right: -25px;
      top: 50%;
      width: 25px;
      height: 70px;
      box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.2);
      cursor: pointer;
      background: #fff;
      &:before {
        position: absolute;
        content: '';
        background-image: url('~@/assets/images/open.png');
        width: 16px;
        height: 16px;
        background-size: 100% 100%;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 1;
      }
    }
    .current-title {
      text-align: center;
      line-height: 40px;
      border-radius: 6px;
      font-size: 14px;
      background: rgba($primary, .2);
      color: #000;
      font-weight: bold;
      margin-bottom: 10px;
      margin-left: 10px;
      margin-right: 10px;
    }
    .el-menu-item {
      height: 40px;
      line-height: 40px;
    }
    .el-submenu__icon-arrow {
      margin-top: -5px;
    }
  }
}
</style>
