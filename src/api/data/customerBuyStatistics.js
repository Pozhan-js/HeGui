import request from '@/utils/request'

// 查询客户购买统计列表
export function listCustomerBuyStatistics(query) {
  return request({
    url: '/customerBuyStatistics/list',
    method: 'get',
    params: query
  })
}

// 查询客户购买统计详细
export function getCustomerBuyStatistics(buyStatisticsId) {
  return request({
    url: '/customerBuyStatistics/info/' + buyStatisticsId,
    method: 'get'
  })
}

// 新增客户购买统计
export function addCustomerBuyStatistics(data) {
  return request({
    url: '/customerBuyStatistics/add',
    method: 'post',
    data: data
  })
}

// 修改客户购买统计
export function updateCustomerBuyStatistics(data) {
  return request({
    url: '/customerBuyStatistics/update',
    method: 'post',
    data: data
  })
}

// 删除客户购买统计
export function delCustomerBuyStatistics(buyStatisticsId) {
  return request({
    url: '/customerBuyStatistics/remove/' + buyStatisticsId,
    method: 'delete'
  })
}
