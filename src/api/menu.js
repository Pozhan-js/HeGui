import request from '@/utils/request'

// 获取路由
export const getRouters = () => {
  return request({
    url: '/system/menu/getRouters',
    method: 'get'
  })
}

/** 查询配送员位置 */
export function getDistribution(query) {
  return request({
    url: '/distribution/location/list',
    method: 'get',
    params: query
  })
}

/** 查询配送员库存 */
export function getGoodsstock(query) {
  return request({
    url: '/distribution/location/goodsstock',
    method: 'get',
    params: query
  })
}

