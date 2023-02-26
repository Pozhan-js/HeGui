import { getConfigKey } from '@/api/system/config'
import { getDicts } from '@/api/system/dict/data'
import '@/assets/styles/index.scss' // global css
import '@/assets/styles/ruoyi.scss' // ruoyi css
import Jump from '@/components/Jump'
import NoneNullInput from '@/components/NoneNullInput'
import Pagination from '@/components/Pagination'
import RangePicker from '@/components/RangePicker'
import BreakTime from '@/components/BreakTime'
// 自定义表格工具扩展
import RightToolbar from '@/components/RightToolbar'
import { encrypt } from '@/utils/jsencrypt'
import { download } from '@/utils/request'
import { toDecimal2 } from '@/utils/self'
import { cascaderFilter } from '@/utils/cascader'
import { addDateRange, handleTree, parseTime, resetForm, selectDictLabel, selectDictLabels, formatDate, formatSeconds } from '@/utils/tool'
import Element from 'element-ui'
import Cookies from 'js-cookie'
import Vue from 'vue'
import App from './App'
import './assets/icons' // icon
import './assets/styles/element-variables.scss'
import permission from './directive/permission'
import './permission' // permission control
import router from './router'
import store from './store'
import echarts from 'echarts'

// 全局方法挂载
Vue.prototype.getDicts = getDicts
Vue.prototype.getConfigKey = getConfigKey
Vue.prototype.parseTime = parseTime
Vue.prototype.resetForm = resetForm
Vue.prototype.addDateRange = addDateRange
Vue.prototype.selectDictLabel = selectDictLabel
Vue.prototype.selectDictLabels = selectDictLabels
Vue.prototype.download = download
Vue.prototype.handleTree = handleTree
Vue.prototype.toDecimal2 = toDecimal2
Vue.prototype.encrypt = encrypt
Vue.prototype.$echarts = echarts
Vue.prototype.formatDate = formatDate
Vue.prototype.formatSeconds = formatSeconds
Vue.prototype.$cascaderFilter = cascaderFilter

Vue.prototype.msgSuccess = function(msg) {
  this.$message({ showClose: true, message: msg, type: 'success' })
}

Vue.prototype.msgError = function(msg) {
  this.$message({ showClose: true, message: msg, type: 'error' })
}

Vue.prototype.msgInfo = function(msg) {
  this.$message.info(msg)
}

Vue.prototype.warning = function(msg) {
  this.$message({ type: 'warning', message: msg })
}

// 全局组件挂载
Vue.component('Pagination', Pagination)
Vue.component('RightToolbar', RightToolbar)
Vue.component('RangePicker', RangePicker)
Vue.component('Jump', Jump)
Vue.component('BreakTime', BreakTime)

Vue.use(permission)

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online! ! !
 */

Vue.use(Element, {
  size: Cookies.get('size') || 'medium' // set element-ui default size
})

// 覆盖element-ui的input
Vue.component('NoneNullInput', NoneNullInput)

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
