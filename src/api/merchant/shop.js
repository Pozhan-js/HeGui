import request from '@/utils/request'

// 查询店铺信息列表
export function listShop(query) {
  return request({
    url: '/shop/list',
    method: 'get',
    params: query
  })
}

// 查询店铺信息详细
export function getShop(shopId) {
  return request({
    url: '/shop/info/' + shopId,
    method: 'get'
  })
}

// 新增店铺信息
export function addShop(data) {
  return request({
    url: '/shop/add',
    method: 'post',
    data: data
  })
}

// 修改店铺信息
export function updateShop(data) {
  return request({
    url: '/shop/update',
    method: 'post',
    data: data
  })
}

// 删除店铺信息
export function delShop(shopId) {
  return request({
    url: '/shop/remove/' + shopId,
    method: 'delete'
  })
}

// 启用店铺信息
export function enabled(shopId) {
  return request({
    url: `/shop/enabled/${shopId}`,
    method: 'post'
  })
}

// 禁用店铺信息
export function disabled(shopId) {
  return request({
    url: `/shop/disabled/${shopId}`,
    method: 'post'
  })
}

// 推广码
export function promoteQR(shopId) {
  return request({
    url: `/qrcode/wechat/get/shop/${shopId}`,
    method: 'get'
  })
}

/** 查询当前城市电子围栏 */
export function getShopFence(query) {
  return request({
    url: '/shop/dropDownList',
    method: 'get',
    params: query
  })
}

/** 默认营业时间 */
export function getShopTime() {
  return request({
    url: '/config/getCommonDefaultShopTime',
    method: 'get'
  })
}

