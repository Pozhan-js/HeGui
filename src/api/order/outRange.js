import request from '@/utils/request'

// 查询主订单列表
export function listOrderInfo(query) {
  return request({
    url: '/ordercenter/order/list/out/range',
    method: 'get',
    params: query,
  })
}
