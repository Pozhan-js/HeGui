import request from '@/utils/request'

// 查询配送收益结算中间表列表
export function listAuditDistrubition(query) {
  return request({
    url: '/cashout/distributionIncome/auditlist',
    method: 'get',
    params: query
  })
}
// 查询配送收益结算中间表列表
export function listRemitDistrubition(query) {
  return request({
    url: '/cashout/distributionIncome/remitlist',
    method: 'get',
    params: query
  })
}
// 查询配送收益结算中间表列表
export function queryTransferStatus(businessId) {
  return request({
    url: '/transferPlus/transferStatus/' + businessId,
    method: 'get',
  })
}

// 查询配送收益结算中间表详细
export function getDistrubition(settlementDistrubitionId) {
  return request({
    url: '/distrubition/info/' + settlementDistrubitionId,
    method: 'get'
  })
}

// 新增配送收益结算中间表
export function addDistrubition(data) {
  return request({
    url: '/distrubition/add',
    method: 'post',
    data: data
  })
}

// 修改配送收益结算中间表
export function updateDistrubition(data) {
  return request({
    url: '/distrubition/update',
    method: 'post',
    data: data
  })
}

// 删除配送收益结算中间表
export function delDistrubition(settlementDistrubitionId) {
  return request({
    url: '/distrubition/remove/' + settlementDistrubitionId,
    method: 'delete'
  })
}
