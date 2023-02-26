import request from '@/utils/request'

// 获取通用配置
export function getSetting() {
  return request({
    url: '/commonSetting/info',
    method: 'get'
  })
}

// 编辑通用配置
export function edit(data) {
  return request({
    url: `/commonSetting/edit`,
    method: 'post',
    data: data
  })
}

export function getOrderSetting() {
  return request({
    url: '/commonSetting/order/info',
    method: 'get'
  })
}

export function orderEdit(data) {
  return request({
    url: `/commonSetting/order/edit`,
    method: 'post',
    data: data
  })
}

