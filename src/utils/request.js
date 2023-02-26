import store from '@/store'
import { getToken } from '@/utils/auth'
import errorCode from '@/utils/errorCode'
import axios from 'axios'
import { Message, MessageBox, Notification } from 'element-ui'
import { showExportModal } from '@/components/FunctionDialog'
import router from '@/router/index'

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'
// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: process.env.VUE_APP_BASE_API,
  // 超时
  timeout: 10000
})

// request拦截器
service.interceptors.request.use(config => {
  if (config.method !== 'get') {
    store.state.isLoading = true
  }
  // 是否需要设置 token
  const isToken = (config.headers || { }).isToken === false
  if (getToken() && !isToken) {
    config.headers['Authorization'] = 'Bearer ' + getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
  }
  // if (config.url.split('/').includes('areas_v2')) {
  //   config.headers[':authority'] = 'geo.datav.aliyun.com'
  //   config.headers[':method'] = 'GET'
  //   config.headers[':path'] = config.url
  // }
  // get请求映射params参数
  if (config.method === 'get' && config.params) {
    config.params = {
      ...config.params,
      orgId: config.params.orgId ?
        typeof config.params.orgId === 'object' ?
          config.params.orgId.slice(-1)[0]
          : config.params.orgId
        : null,
    }
    let url = config.url + '?';
    for (const propName of Object.keys(config.params)) {
      const value = config.params[propName];
      var part = encodeURIComponent(propName) + "=";
      if (value !== null && typeof (value) !== "undefined") {
        if (typeof value === 'object') {
          for (const key of Object.keys(value)) {
            let params = propName + '[' + key + ']';
            var subPart = encodeURIComponent(params) + "=";
            url += subPart + encodeURIComponent(value[key]) + "&";
          }
        } else {
          url += part + encodeURIComponent(value) + "&";
        }
      }
    }
    url = url.slice(0, -1);
    config.params = { };
    config.url = url;
  } else if (config.method === 'post' && config.data) {
    Object.keys(config.data).map(key => {
      if (typeof config.data[key] === 'undefined') {
        if (process.env.NODE_ENV === 'development') {
          console.error(
            '请注意：请求体 `'
            + key 
            + '` 值为undefined，将会自动转换成0.如不需要此行为，请删除此字段'
           )
        }
        config.data[key] = 0
      }
    })
  }
  return config
}, error => {
  console.log(error)
  Promise.reject(error)
})

const arrFormat = (arr) => {
  arr = arr.map(item => {
    item = {
      ...item,
      id: parseInt(item.id),
      children: item.children ? arrFormat(item.children) : undefined
    }
    return item
  })
  return arr
}

// 响应拦截器
service.interceptors.response.use(res => {
  store.state.isLoading = false
  if (res?.data?.total) {
    res = {
      ...res,
      data: {
        ...res.data,
        total: parseInt(res.data.total)
      }
    }
  }
  if (res.config.url === '/org/treeselect') {
    res = {
      ...res,
      data: {
        ...res.data,
        data: Array.isArray(res?.data?.data) && arrFormat(res.data.data)
      }
    }
  }
  // 未设置状态码则默认成功状态
  const code = res.data.code || 200;
  // 获取错误信息
  const msg = errorCode[code] || res.data.msg || errorCode['default']
  if (code === 401) {
    store.dispatch('LogOut').then(() => {
      location.href = '/index';
    })
  } else if (code === 500) {
    Message({
      message: msg,
      type: 'error'
    })
    return Promise.reject(new Error(msg))
  } else if (code !== 200 && code !== 502) {
    Notification.error({
      title: msg
    })
    return Promise.reject('error')
  } else {
    return res.data
  }
},
  error => {
    store.state.isLoading = false
    console.log('err' + error)
    let { message } = error;
    if (message == "Network Error") {
      message = "后端接口连接异常";
    }
    else if (message.includes("timeout")) {
      message = "系统接口请求超时";
    }
    else if (message.includes("Request failed with status code")) {
      message = "系统接口" + message.substr(message.length - 3) + "异常";
    }
    Message({
      message: message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

// 通用下载方法
export async function download(url, params, options) {
  const userInput = await showExportModal(options)
  // 排除以下参数
  const { orderByColumn, isAsc, pageSize, pageNum, ...otherParams } = params
  const result = await service.get(url, { params: {...otherParams, ...userInput} })
  if (result.code === 200) {
    MessageBox.confirm('导出文件已在后台运行，是否立即跳转页面查看结果?', "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
    }).then(() => {
      // window.open('/site/excel')
      let routeData = this.$router.resolve({ path: '/site/excel' });
      window.open(routeData.href, '_blank');
    })
  }
}

export default service
