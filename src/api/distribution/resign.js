import request from '@/utils/request'

// 查询配送员信息列表
export function listAuditlist(query) {
  return request({
    url: '/distribution/info/departurelist',
    method: 'get',
    params: query
  })
}

// 配送员离职通过
export function resignBy(data) {
  return request({
    url: `/distribution/info/separationagree`,
    method: 'post',
    data
  })
}

// 配送员离职拒绝
export function resignRefuse(data) {
  return request({
    url: `/distribution/info/separationrefuse`,
    method: 'post',
    data
  })
}
