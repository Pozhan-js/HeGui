import request from '@/utils/request'

// 查询提现付款信息列表
export function listTransferInfo(query) {
  return request({
    url: '/transferInfo/list',
    method: 'get',
    params: query
  })
}

// 查询提现付款信息详细
export function getTransferInfo(transferInfoId) {
  return request({
    url: '/transferInfo/info/' + transferInfoId,
    method: 'get'
  })
}

// 新增提现付款信息
export function addTransferInfo(data) {
  return request({
    url: '/transferInfo/add',
    method: 'post',
    data: data
  })
}

// 修改提现付款信息
export function updateTransferInfo(data) {
  return request({
    url: '/transferInfo/update',
    method: 'post',
    data: data
  })
}

// 删除提现付款信息
export function delTransferInfo(transferInfoId) {
  return request({
    url: '/transferInfo/remove/' + transferInfoId,
    method: 'delete'
  })
}
