import request from '@/utils/request'

// 查询客户余额订单列表
export function listOrder(query) {
  return request({
    url: '/customer/order/list',
    method: 'get',
    params: query
  })
}

// 查询客户余额订单详细
export function getOrder(orderId) {
  return request({
    url: '/customer/order/info/' + orderId,
    method: 'get'
  })
}

// 新增客户余额订单
export function addOrder(data) {
  return request({
    url: '/customer/order/add',
    method: 'post',
    data: data
  })
}

// 修改客户余额订单
export function updateOrder(data) {
  return request({
    url: '/customer/order/update',
    method: 'post',
    data: data
  })
}

// 删除客户余额订单
export function delOrder(orderId) {
  return request({
    url: '/customer/order/remove/' + orderId,
    method: 'delete'
  })
}
