import request from '@/utils/request'

// 查询打包优惠券列表
export function listPackage(query) {
  return request({
    url: '/marketing/package/list',
    method: 'get',
    params: query
  })
}

// 查询打包优惠券详细
export function getPackage(couponPckId) {
  return request({
    url: '/marketing/package/info/' + couponPckId,
    method: 'get'
  })
}

// 新增打包优惠券
export function addPackage(data) {
  return request({
    url: '/marketing/package/add',
    method: 'post',
    data: data
  })
}

// 修改打包优惠券
export function updatePackage(data) {
  return request({
    url: '/marketing/package/update/notnull',
    method: 'post',
    data: data
  })
}

// 删除打包优惠券
export function delPackage(couponPckId) {
  return request({
    url: '/marketing/package/remove/' + couponPckId,
    method: 'delete'
  })
}


// 查询打包优惠券推广链接
export function getPackageUrl(couponPckId) {
  return request({
    url: `/qrcode/wechat/get/pck/coupon/${couponPckId}`,
    method: 'get'
  })
}

// 失效，正常，状态修改
export function packageInvalid(data) {
  return request({
    url: `/marketing/package/invalid`,
    method: 'post',
    data
  })
}

// 获取打包优惠券
export function couponInfoPck(query) {
  return request({
    url: `/marketing/couponInfo/list/can/pck`,
    method: 'get',
    params: query
  })
}
