import request from '@/utils/request'

// 查询店铺商品列表
export function listShopGoods(query) {
  return request({
    url: '/shopGoods/list',
    method: 'get',
    params: query
  })
}

// 查询店铺商品详细
export function getShopGoods(shopGoodsId) {
  return request({
    url: '/shopGoods/info/' + shopGoodsId,
    method: 'get'
  })
}

// 新增店铺商品
export function addShopGoods(data) {
  return request({
    url: '/shopGoods/add',
    method: 'post',
    data: data
  })
}

// 修改店铺商品
export function updateShopGoods(data) {
  return request({
    url: '/shopGoods/update',
    method: 'post',
    data: data
  })
}

// 删除店铺商品
export function delShopGoods(shopGoodsId) {
  return request({
    url: '/shopGoods/remove/' + shopGoodsId,
    method: 'delete'
  })
}

// 采购开关
export function addPurchase(data) {
  return request({
    url: '/shopGoods/addPurchase',
    method: 'post',
    data: data
  })
}


// 加入商品
export function addGoods(data) {
  return request({
    url: '/shopGoods/addGoods',
    method: 'post',
    data: data
  })
}
