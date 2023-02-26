import request from '@/utils/request'



// 查询客户购买统计列表
export function goodsStatistics(query) {
  return request({
    url: '/goodsDataStatistics/goods',
    method: 'get',
    params: query
  })
}
