import request from '@/utils/request'

// 查询支付订单流水列表
export function listOrderInfo(query) {
  return request({
    url: '/orderInfo/list',
    method: 'get',
    params: query
  })
}

// 查询支付订单流水详细
export function getOrderInfo(orderInfoId) {
  return request({
    url: '/orderInfo/info/' + orderInfoId,
    method: 'get'
  })
}

// 新增支付订单流水
export function addOrderInfo(data) {
  return request({
    url: '/orderInfo/add',
    method: 'post',
    data: data
  })
}

// 修改支付订单流水
export function updateOrderInfo(data) {
  return request({
    url: '/orderInfo/update',
    method: 'post',
    data: data
  })
}

// 删除支付订单流水
export function delOrderInfo(orderInfoId) {
  return request({
    url: '/orderInfo/remove/' + orderInfoId,
    method: 'delete'
  })
}
