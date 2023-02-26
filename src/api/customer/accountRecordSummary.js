import request from '@/utils/request'

// 查询客户账户记录汇总列表
export function listAccountRecordSummary(query) {
  return request({
    url: '/accountRecordSummary/list',
    method: 'get',
    params: query
  })
}

// 查询客户账户记录汇总详细
export function getAccountRecordSummary(accountRecordSummaryId) {
  return request({
    url: '/accountRecordSummary/info/' + accountRecordSummaryId,
    method: 'get'
  })
}

// 新增客户账户记录汇总
export function addAccountRecordSummary(data) {
  return request({
    url: '/accountRecordSummary/add',
    method: 'post',
    data: data
  })
}

// 修改客户账户记录汇总
export function updateAccountRecordSummary(data) {
  return request({
    url: '/accountRecordSummary/update',
    method: 'post',
    data: data
  })
}

// 删除客户账户记录汇总
export function delAccountRecordSummary(accountRecordSummaryId) {
  return request({
    url: '/accountRecordSummary/remove/' + accountRecordSummaryId,
    method: 'delete'
  })
}
