import request from '@/utils/request'

// 查询优惠券信息列表
export function listCouponInfo(query) {
  return request({
    url: '/marketing/couponInfo/can/issue',
    method: 'get',
    params: query
  })
}

// 客服发券
export function customerCoupon(data) {
  return request({
    url: '/marketing/couponInfo/customer/issue/coupon',
    method: 'post',
    data: data
  })
}

// 运营发券批量
export function operationCouponBatch(data) {
  return request({
    url: '/marketing/couponInfo/issue/coupon/batch',
    method: 'post',
    data: data
  })
}


// 运营发券
export function operationCoupon(data) {
  return request({
    url: '/marketing/couponInfo/operation/issue/coupon',
    method: 'post',
    data: data
  })
}

// 验证订单
export function checkOrderNo(query) {
  return request({
    url: `/ordercenter/order/check/orderNo`,
    method: 'get',
    params: query
  })
}
