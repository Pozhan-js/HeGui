import request from '@/utils/request'

// 查询主订单列表
export function listOrderInfo(query) {
  return request({
    url: '/ordercenter/purchase/order/list',
    method: 'get',
    params: query,
  })
}


// 查询订单详情
export function getOrderInfo(purchaseOrderId) {
  return request({
    url: `/ordercenter/purchase/order/info/${purchaseOrderId}`,
    method: 'get',
  })
}

// 设置备注
export function setRemark(data) {
  return request({
    url: `/ordercenter/purchase/order/remark`,
    method: 'post',
    data
  })
}
