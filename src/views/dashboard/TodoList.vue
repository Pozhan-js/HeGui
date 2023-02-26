<template>
  <el-card class="box-card" shadow="never">
    <div slot="header" class="flex-between-center">
      <span>待办事项</span>
      <el-form
        ref="queryForm"
        :model="queryParams"
        :inline="true"
        label-width="100px"
      >
        <org-field :queryParams="queryParams"/>
      </el-form>
    </div>
    <el-row :gutter="14" class="panel-group">
      <el-col :xs="8" :sm="12" :lg="6" class="card-panel-col" v-for="item in list" :key="item.path">
        <jump :path="item.path" class="card-panel">
          <div class="card-panel-description">
            <div class="card-panel-text">{{item.title}}</div>
            <div class="card-panel-num">{{item.value}}</div>
          </div>
          <div class="card-panel-icon-wrapper">
            <svg-icon :icon-class="item.icon" class-name="card-panel-icon" />
          </div>
        </jump>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
  import { getTimeoutCount, getTransferCount, getAfterSalesCount, getHurryCount} from '@/api/home'
  import OrgField from './components/OrgField'
  import CountTo from 'vue-count-to'
  import { getToken } from '@/utils/auth'
  import moment from 'moment'
  
  export default {
    name: 'TodoList',
    components: {
      OrgField,
      CountTo
    },
    data() {
      return {
        queryParams: {
          orgId: null,
        },
        // 超出范围
        timeoutCount: null,
        // 转单
        transferCount: null,
        // 售后
        afterSalesCount: null,
        // 催单
        hurryCount: null, 
        socket: null,
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
    watch: {
      queryParams: {
        handler(val, oldVal) {
          this.init()
        },
        deep: true,
        immediate: true
      }
    },
    created() {
      this.muenRoutes()
    },
    destroyed() {
      this.linkNumber = 3
      this.socket.onclose()
    },
    computed: {
      list() {
        return [
          {title: '求助转单', path: '/order/delivery/transfer', icon: 'help-order', value: this.transferCount },
          {title: '临近超时', path: '/order/delivery/timeOut', icon: 'timeout-order', value: this.timeoutCount },
          {title: '用户催单', path: '/order/delivery/hurry', icon: 'hurry-order',  value: this.hurryCount },
          {title: '售后维权', path: '/order/delivery/afterSales', icon: 'after-sales-order', value: this.afterSalesCount},
        ]
      }
    },
    methods: {
      init() {
        this.getTimeoutCount()
        this.getTransferCount()
        this.getHurryCount()
        this.getAfterSalesCount()
      },
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
      /** 查询临近超时 */
      getTimeoutCount() {
        this.loading = true;
        getTimeoutCount(this.queryParams).then((response) => {
          this.timeoutCount = response.data
          this.loading = false;
        });
      },
      /** 查询求助订单 */
      getTransferCount() {
        this.loading = true;
        getTransferCount(this.queryParams).then((response) => {
          this.transferCount = response.data
          this.loading = false;
        });
      },
      /** 查询用户催单 */
      getHurryCount() {
        this.loading = true;
        getHurryCount(this.queryParams).then((response) => {
          this.hurryCount = response.data
          this.loading = false;
        });
      },
      /** 查询售后维权 */
      getAfterSalesCount() {
        this.loading = true;
        getAfterSalesCount(this.queryParams).then((response) => {
          this.afterSalesCount = response.data
          this.loading = false;
        });
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
        switch(msg.data) {
          case 'hurry' : 
            this.getHurryCount() 
            break
          case 'transfer':
            this.getTransferCount() 
            break
          case 'afterSales':
            this.getAfterSalesCount() 
            break
          case 'timeOut':
            this.getTimeoutCount() 
            break
        }
      },
      send() {
        this.socket.send('222')
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
    }
  }
</script>

<style lang="scss" scoped>
.panel-group{
  padding: 0 12px;
}
.card-panel{
  flex: 1;
  padding: 12px 24px;
  color: rgba($color: #000, $alpha: 0.6);
  background: #FAFAFA;
  .card-panel-description {
    flex: 1;
  }
}
.card-panel-col {
  margin: 7px 0;
}
</style>