import request from '@/utils/request'

// 查询质保金汇总列表
export function listAmountstatistics(query) {
  return request({
    url: '/distribution/amountstatistics/list',
    method: 'get',
    params: query
  })
}

// 查询质保金汇总详细
export function getAmountstatistics(statisticsId) {
  return request({
    url: '/distribution/amountstatistics/info/' + statisticsId,
    method: 'get'
  })
}

// 新增质保金汇总
export function addAmountstatistics(data) {
  return request({
    url: '/distribution/amountstatistics/add',
    method: 'post',
    data: data
  })
}

// 修改质保金汇总
export function updateAmountstatistics(data) {
  return request({
    url: '/distribution/amountstatistics/update',
    method: 'post',
    data: data
  })
}

// 删除质保金汇总
export function delAmountstatistics(statisticsId) {
  return request({
    url: '/distribution/amountstatistics/remove/' + statisticsId,
    method: 'delete'
  })
}
