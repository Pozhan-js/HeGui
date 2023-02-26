import request from '@/utils/request'

// 新增积分商品
export function addScoreGoods(data) {
  return request({
    url: '/scoreGoods/add',
    method: 'post',
    data: data
  })
}

// 修改积分商品
export function updateScoreGoods(data) {
  return request({
    url: '/scoreGoods/update',
    method: 'post',
    data: data
  })
}

// 删除积分商品
export function delScoreGoods(scoreGoodsId) {
  return request({
    url: '/scoreGoods/remove/' + scoreGoodsId,
    method: 'delete'
  })
}

// 启用积分商品
export function enabledScoreGoods(scoreGoodsId) {
  return request({
    url: '/scoreGoods/enabled/' + scoreGoodsId,
    method: 'post'
  })
}

// 禁用积分商品
export function disabledScoreGoods(scoreGoodsId) {
  return request({
    url: '/scoreGoods/disabled/' + scoreGoodsId,
    method: 'post'
  })
}

// 失效积分商品
export function expiredScoreGoods(scoreGoodsId) {
  return request({
    url: '/scoreGoods/expired/' + scoreGoodsId,
    method: 'post'
  })
}

// 查询积分商品详细
export function getScoreGoodsInfo(scoreGoodsId) {
  return request({
    url: '/scoreGoods/info/' + scoreGoodsId,
    method: 'get'
  })
}

// 积分商城推广码
export function promoteQR() {
  return request({
    url: '/qrcode/wechat/get/scoreGoods',
    method: 'get'
  })
}

// 查询积分商城开关
export function getScoreMall() {
  return request({
    url: '/commonSetting/getScoreGoods',
    method: 'get'
  })
}

// 修改积分商城开关
export function setScoreMall(data) {
  return request({
    url: '/commonSetting/editScoreGoods',
    method: 'post',
    data
  })
}
