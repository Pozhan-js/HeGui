import request from '@/utils/request'

// 查询优惠券信息列表
export function listCouponInfo(query) {
  return request({
    url: '/marketing/couponInfo/list',
    method: 'get',
    params: query
  })
}

// 查询优惠券信息详细
export function getCouponInfo(couponId) {
  return request({
    url: '/marketing/couponInfo/info/' + couponId,
    method: 'get'
  })
}

// 新增优惠券信息
export function addCouponInfo(data) {
  return request({
    url: '/marketing/couponInfo/add',
    method: 'post',
    data: data
  })
}

// 修改优惠券信息
export function updateCouponInfo(data) {
  return request({
    url: '/marketing/couponInfo/update/notnull',
    method: 'post',
    data: data
  })
}

// 删除优惠券信息
export function delCouponInfo(couponId) {
  return request({
    url: '/marketing/couponInfo/remove/' + couponId,
    method: 'delete'
  })
}

// 失效，正常，状态修改
export function invalid(data) {
  return request({
    url: `/marketing/couponInfo/invalid`,
    method: 'post',
    data
  })
}

// 优惠券默认商品及分组
export function defaultGoodsInfo(query) {
  return request({
    url: '/shopGoods/getGroupGoodsList',
    method: 'get',
    params: query
  })
}

// 优惠券商品
export function getGoodsList(query) {
  return request({
    url: '/shopGoods/getGoodsList',
    method: 'get',
    params: query
  })
}

// 优惠券商品分组
export function getGroupList(query) {
  return request({
    url: '/shopGoods/getGroupList',
    method: 'get',
    params: query
  })
}

// 优惠券推广码
export function getPromote(couponId) {
  return request({
    url: `/qrcode/wechat/get/coupon/${couponId}`,
    method: 'get',
  })
}

// 启用优惠券
export function enabled(couponId) {
  return request({
    url: `/marketing/couponInfo/enabled/${couponId}`,
    method: 'post'
  })
}

// 禁用优惠券
export function disabled(couponId) {
  return request({
    url: `/marketing/couponInfo/disabled/${couponId}`,
    method: 'post'
  })
}

// 验证排序是否存在
export function checkSort(sort) {
  return request({
    url: `/marketing/couponInfo/check/sort/${sort}`,
    method: 'get'
  })
}

// 修改排序
export function editSort(data) {
  return request({
    url: `/marketing/couponInfo/edit/sort`,
    method: 'post',
    data
  })
}

// 复制优惠券
export function copyCoupon(data) {
  return request({
    url: `/marketing/couponInfo/copy`,
    method: 'post',
    data
  })
}

