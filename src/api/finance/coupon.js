import request from '@/utils/request'

// 查询结算提现列表
export function getList(query) {
  return request({
    url: '/marketing/couponReceive/list',
    method: 'get',
    params: query
  })
}
