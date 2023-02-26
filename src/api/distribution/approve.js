import request from '@/utils/request'

// 查询配送员信息列表
export function listAuditlist(query) {
  return request({
    url: '/distribution/info/auditlist',
    method: 'get',
    params: query
  })
}

// 配送员申请通过
export function applyBy(data) {
  return request({
    url: `/distribution/info/applyagree`,
    method: 'post',
    data
  })
}

// 配送员申请拒绝
export function applyRefuse(data) {
  return request({
    url: `/distribution/info/applyrefuse`,
    method: 'post',
    data
  })
}

// 配送员离职通过
export function resignBy(distributionIds) {
  return request({
    url: `/distribution/info/separationagree/${distributionIds}`,
    method: 'post',
  })
}

// 配送员离职拒绝
export function resignRefuse(distributionIds) {
  return request({
    url: `/distribution/info/separationrefuse/${distributionIds}`,
    method: 'post',
  })
}
