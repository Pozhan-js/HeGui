import request from '@/utils/request'

// 查询商品信息列表
export function listGoods(query) {
  return request({
    url: '/goods/list',
    method: 'get',
    params: query
  })
}

// 查询商品信息详细
export function getGoods(goodsId) {
  return request({
    url: '/goods/info/' + goodsId,
    method: 'get'
  })
}

// 新增商品信息
export function addGoods(data) {
  return request({
    url: '/goods/add',
    method: 'post',
    data: data
  })
}

// 修改商品信息
export function updateGoods(data) {
  return request({
    url: '/goods/update',
    method: 'post',
    data: data
  })
}

// 删除商品信息
export function delGoods(goodsId) {
  return request({
    url: '/goods/remove/' + goodsId,
    method: 'delete'
  })
}

// 上架商品
export function enabled(goodsId) {
  return request({
    url: `/goods/batchEnabled/${goodsId}`,
    method: 'post',
  })
}

// 下架商品
export function disabled(goodsId) {
  return request({
    url: `/goods/batchDisabled/${goodsId}`,
    method: 'post',
  })
}

// 修改商品详情
export function updateDetail(data) {
  return request({
    url: '/goods/updateDetail',
    method: 'post',
    data: data
  })
}

// 修改商品价格
export function updatePrice(data) {
  return request({
    url: '/sku/update',
    method: 'post',
    data: data
  })
}

// 修改商品排序
export function updateSort(data) {
  return request({
    url: '/goods/updateSort',
    method: 'post',
    data: data
  })
}
