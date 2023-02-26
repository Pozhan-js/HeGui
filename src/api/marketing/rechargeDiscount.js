import request from '@/utils/request'

// 查询充值优惠信息列表
export function listRechargeDiscount(query) {
  return request({
    url: '/marketing/rechargeDiscount/list',
    method: 'get',
    params: query
  })
}

// 查询充值优惠信息详细
export function getRechargeDiscount(rechargeDiscountId) {
  return request({
    url: '/marketing/rechargeDiscount/info/' + rechargeDiscountId,
    method: 'get'
  })
}

// 新增充值优惠信息
export function addRechargeDiscount(data) {
  return request({
    url: '/marketing/rechargeDiscount/add',
    method: 'post',
    data: data
  })
}

// 修改充值优惠信息
export function updateRechargeDiscount(data) {
  return request({
    url: '/marketing/rechargeDiscount/update',
    method: 'post',
    data: data
  })
}

// 删除充值优惠信息
export function delRechargeDiscount(rechargeDiscountId) {
  return request({
    url: '/marketing/rechargeDiscount/remove/' + rechargeDiscountId,
    method: 'delete'
  })
}

// 查询优惠券信息列表
export function listCouponInfo(query) {
  return request({
    url: '/marketing/rechargeDiscount/presentation/coupon/list',
    method: 'get',
    params: query
  })
}
