import request from '@/utils/request'

// 查询出库详情列表
export function listRecord(query) {
  return request({
    url: '/wms/orderout/code/list',
    method: 'get',
    params: query
  })
}
