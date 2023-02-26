import request from '@/utils/request'

// 查询客户账户记录列表
export function listAccountRecord(query) {
  return request({
    url: '/customer/accountRecord/list',
    method: 'get',
    params: query
  })
}

// 查询客户账户记录详细
export function getAccountRecord(accountRecordId) {
  return request({
    url: '/customer/accountRecord/info/' + accountRecordId,
    method: 'get'
  })
}

// 新增客户账户记录
export function addAccountRecord(data) {
  return request({
    url: '/customer/accountRecord/add',
    method: 'post',
    data: data
  })
}

// 修改客户账户记录
export function updateAccountRecord(data) {
  return request({
    url: '/customer/accountRecord/update',
    method: 'post',
    data: data
  })
}

// 删除客户账户记录
export function delAccountRecord(accountRecordId) {
  return request({
    url: '/customer/accountRecord/remove/' + accountRecordId,
    method: 'delete'
  })
}
