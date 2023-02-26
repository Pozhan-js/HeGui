import request from '@/utils/request'

// 查询主订单列表
export function listOrderInfo(query) {
  return request({
    url: '/ordercenter/order/list',
    method: 'get',
    params: query,
  })
}

// 查询订单详情
export function getOrderDetails(orderId) {
  return request({
    url: `/ordercenter/order/info/${orderId}`,
    method: 'get',
  })
}

// 设置备注
export function setRemark(data) {
  return request({
    url: `/ordercenter/order/remark`,
    method: 'post',
    data
  })
}

// 查询调度列表
export function getDistribution(orderId) {
  return request({
    url: `/ordercenter/order/manual/distribution/list/${orderId}`,
    method: 'get'
  })
}

// 选择配送员
export function pushDistribution(data) {
  return request({
    url: '/ordercenter/order/manual/push',
    method: 'post',
    data
  })
}

// 订单奖励惩罚
export function rewardPunishment(data) {
  return request({
    url: `/distributionDetail/add/rewardPunishment`,
    method: 'post',
    data
  })
}

// 完成订单
export function finish(data) {
  return request({
    url: `/ordercenter/order/finish`,
    method: 'post',
    data
  })
}

// 关闭订单
export function close(data) {
  return request({
    url: `/ordercenter/order/close`,
    method: 'post',
    data
  })
}

// 订单退款
export function refund(data) {
  return request({
    url: `/ordercenter/order/refund`,
    method: 'post',
    data
  })
}
