<template>
  <section class="app-main">
    <transition name="fade-transform" mode="out-in">
      <keep-alive :include="cachedViews">
        <router-view :key="key" />
      </keep-alive>
    </transition>
    <div
      v-if="menuRotus.length > 0"
      style="
        position: fixed;
        top: 10px;
        z-index: 2000;
        right: 100px;
      "
    >
      <p v-if="menuRotus.includes('transfer')" class="action-item" :class="{ highlight: transfer > 0 }" @click="jumpTransfer">
        <svg-icon class-name="action-icon" icon-class="transfer" />
        <span class="action-text">求助</span>
      </p>
      <p v-if="menuRotus.includes('timeOut')" class="action-item" :class="{ highlight: timeOut > 0 }" @click="jumpTimeOut">
        <svg-icon class-name="action-icon" icon-class="timeOut" />
        <span class="action-text">超时</span>
      </p>
      <p v-if="menuRotus.includes('hurry')" class="action-item" :class="{ highlight: hurry > 0 }" @click="jumpHurry">
        <svg-icon class-name="action-icon" icon-class="hurry" />
        <span class="action-text">催单</span>
      </p>
      <p v-if="menuRotus.includes('afterSales')" class="action-item" :class="{ highlight: afterSales > 0 }" @click="jumpAfterSales">
        <svg-icon class-name="action-icon" icon-class="afterSales" />
        <span class="action-text">维权</span>
      </p>
    </div>
  </section>
</template>

<script>
import { getToken } from '@/utils/auth'
import moment from 'moment'

export default {
  name: 'AppMain',
  data() {
    return {
      socket: null,
      // 催单
      hurry: 0,
      // 转单
      transfer: 0,
      // 申请售后
      afterSales: 0,
      // 超出范围
      timeOut: 0,
      // 权限
      menuRotus: [],
      // 定时器
      interval: null,
      // 心跳定时器
      sendInterval: null,
      // 链接次数
      linkNumber: 0
    }
  },
  computed: {
    cachedViews() {
      return []
    },
    key() {
      return this.$route.path
    },
    numbers() {
      return this.$store.state.remind.infoArr
    }
  },
  created() {
    this.muenRoutes()
  },
  destroyed() {
    this.linkNumber = 3
    this.socket.onclose()
  },
  methods: {
    muenRoutes() {
      if (this.linkNumber >= 3) {
        clearInterval(this.interval)
      }
      const orderMuen = this.$store.state.permission.routes.filter(item => item.name === 'Order')
      const menuRotus = []
      if (orderMuen && orderMuen.length > 0) {
        const muenName = orderMuen[0].children.map(item => item.name)
        if (muenName.includes('Hurry')) {
          menuRotus.push('hurry')
        }
        if (muenName.includes('Transfer')) {
          menuRotus.push('transfer')
        }
        if (muenName.includes('AfterSales')) {
          menuRotus.push('afterSales')
        }
        if (muenName.includes('TimeOut')) {
          menuRotus.push('timeOut')
        }
      }
      if (menuRotus.length > 0) {
        this.menuRotus = menuRotus
        this.startSocket()
      }
    },
    startSocket() {
      const socket = new WebSocket(`${process.env.VUE_APP_SOCKET}/mss/im/ws?token=${getToken()}`)
      // 监听socket连接
      socket.onopen = this.open
      // 监听socket错误信息
      socket.onerror = this.error
      // 监听socket消息
      socket.onmessage = this.getMessage
      socket.onclose = this.close
      this.socket = socket
    },
    open() {
      this.linkNumber = 0
      if (this.interval) {
        clearInterval(this.interval)
      }
      this.sendInterval = setInterval(() => {
        this.send()
      }, 30000)
      console.log('socket连接成功', moment().format('YYYY-MM-DD HH:mm:ss'))
    },
    error() {
      console.log('连接错误', moment().format('YYYY-MM-DD HH:mm:ss'))
    },
    getMessage(msg) {
      if (!['hurry', 'transfer', 'afterSales', 'timeOut'].includes(msg.data)) return
      this[msg.data] = this[msg.data] + 1
    },
    send() {
      this.socket.send('111')
    },
    close() {
      this.tryLink()
      if (this.sendInterval) {
        clearInterval(this.sendInterval)
      }
      console.log('socket已经关闭', moment().format('YYYY-MM-DD HH:mm:ss'))
    },
    // 尝试二次链接
    tryLink() {
      if (getToken() && this.linkNumber < 3) {
        this.interval = setInterval(() => {
          this.muenRoutes()
          this.linkNumber += 1
        }, 60000)
      }
    },
    /** 用户催单跳转 */
    jumpHurry() {
      this.hurry = 0
      const hashUrl = window.location.hash
      const url = hashUrl.substr(hashUrl.lastIndexOf('#') + 1)
      if (url === '/order/delivery/hurry') return
      this.$router.push({
        path: '/order/delivery/hurry'
      })
    },
    /** 用户转单 */
    jumpTransfer() {
      this.transfer = 0
      const hashUrl = window.location.hash
      const url = hashUrl.substr(hashUrl.lastIndexOf('#') + 1)
      if (url === '/order/delivery/transfer') return
      this.$router.push({
        path: '/order/delivery/transfer'
      })
    },
    /** 申请售后 */
    jumpAfterSales() {
      this.afterSales = 0
      const hashUrl = window.location.hash
      const url = hashUrl.substr(hashUrl.lastIndexOf('#') + 1)
      if (url === '/order/delivery/afterSales') return
      this.$router.push({
        path: '/order/delivery/afterSales'
      })
    },
    /** 超出范围 */
    jumpTimeOut() {
      this.timeOut = 0
      const hashUrl = window.location.hash
      const url = hashUrl.substr(hashUrl.lastIndexOf('#') + 1)
      if (url === '/order/delivery/timeOut') return
      this.$router.push({
        path: '/order/delivery/timeOut'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/assets/styles/variables.scss";

.app-main {
  /* 50= navbar  50  */
  flex: 1;
  overflow-y: auto;
  position: relative;
  .action-item {
    float: left;
    margin: 0 20px 0 0;
    cursor: pointer;
    &:last-child {
      margin-right: 5px;
    }
    &.highlight {
      color: $primary;
    }
    .action-icon {
      display: block;
      font-size: 26px;
    }
    .action-text {
      font-size: 12px;
    }
  }
}

</style>

<style lang="scss">
// fix css style bug in open el-dialog
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 15px;
  }
}
</style>
