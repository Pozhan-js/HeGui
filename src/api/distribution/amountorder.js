import request from '@/utils/request'

// 查询质保金列表
export function listAmountorder(query) {
  return request({
    url: '/distribution/amountorder/list',
    method: 'get',
    params: query
  })
}

// 查询质保金审核列表
export function auditListAmountorder(query) {
  return request({
    url: '/distribution/amountorder/auditlist',
    method: 'get',
    params: query
  })
}

// 批量审核通过
export function auditListAmountorderAuditAgree(data) {
  return request({
    url: '/distribution/amountorder/auditagree',
    method: 'post',
    data
  })
}

// 批量审核拒绝
export function auditListAmountorderAuditRefuse(amountOrderIds) {
  return request({
    url: '/distribution/amountorder/auditrefuse/' + amountOrderIds,
    method: 'post',
  })
}

// 出纳打款[质保金订单]列表
export function auditListAmountorderRemitlist(query) {
  return request({
    url: '/distribution/amountorder/remitlist',
    method: 'get',
    params: query
  })
}

export function auditListAmountorderRemitAgree(data) {
  return request({
    url: '/distribution/amountorder/remitagree',
    method: 'post',
    data
  })
}

// 查询质保金详细
export function getAmountorder(amountOrderId) {
  return request({
    url: '/distribution/amountorder/info/' + amountOrderId,
    method: 'get'
  })
}

// 新增质保金
export function addAmountorder(data) {
  return request({
    url: '/distribution/amountorder/add',
    method: 'post',
    data: data
  })
}

// 修改质保金
export function updateAmountorder(data) {
  return request({
    url: '/distribution/amountorder/update',
    method: 'post',
    data: data
  })
}

// 删除质保金
export function delAmountorder(amountOrderId) {
  return request({
    url: '/distribution/amountorder/remove/' + amountOrderId,
    method: 'delete'
  })
}
