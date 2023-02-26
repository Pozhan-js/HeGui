import request from '@/utils/request'

// 查询质保金规格列表
export function listGoods(query) {
  return request({
      url: '/goodsDataStatistics/list/tabledata',
      method: 'get',
      params: query
  })
}
