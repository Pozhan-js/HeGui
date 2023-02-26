import request from '@/utils/request'

// 查询业务操作日志记录列表
export function listBusinessLog(query) {
  return request({
    url: '/businessLog/list',
    method: 'get',
    params: query
  })
}

// 查询业务操作日志记录详细
export function getBusinessLog(businessLogId) {
  return request({
    url: '/businessLog/info/' + businessLogId,
    method: 'get'
  })
}

// 新增业务操作日志记录
export function addBusinessLog(data) {
  return request({
    url: '/businessLog/add',
    method: 'post',
    data: data
  })
}

// 修改业务操作日志记录
export function updateBusinessLog(data) {
  return request({
    url: '/businessLog/update',
    method: 'post',
    data: data
  })
}

// 删除业务操作日志记录
export function delBusinessLog(businessLogId) {
  return request({
    url: '/businessLog/remove/' + businessLogId,
    method: 'delete'
  })
}
