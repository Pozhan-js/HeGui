import request from '@/utils/request'

// 查询封面或签名素材列表
export function listCoverSignatureMaterial(query) {
  return request({
    url: '/coverSignatureMaterial/list',
    method: 'get',
    params: query
  })
}

// 查询封面或签名素材详细
export function getCoverSignatureMaterial(coverSignatureId) {
  return request({
    url: '/coverSignatureMaterial/info/' + coverSignatureId,
    method: 'get'
  })
}

// 新增封面或签名素材
export function addCoverSignatureMaterial(data) {
  return request({
    url: '/coverSignatureMaterial/add',
    method: 'post',
    data: data
  })
}

// 修改封面或签名素材
export function updateCoverSignatureMaterial(data) {
  return request({
    url: '/coverSignatureMaterial/update',
    method: 'post',
    data: data
  })
}

// 删除封面或签名素材
export function delCoverSignatureMaterial(coverSignatureId) {
  return request({
    url: '/coverSignatureMaterial/remove/' + coverSignatureId,
    method: 'delete'
  })
}