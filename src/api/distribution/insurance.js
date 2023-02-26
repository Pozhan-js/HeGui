import request from '@/utils/request'

// 查询保险金列表
export function listInsurance(query) {
  return request({
    url: '/distribution/insurance/list',
    method: 'get',
    params: query
  })
}

// 查询保险金详细
export function getInsurance(insuranceId) {
  return request({
    url: '/insurance/info/' + insuranceId,
    method: 'get'
  })
}

// 新增保险金
export function addInsurance(data) {
  return request({
    url: '/insurance/add',
    method: 'post',
    data: data
  })
}

// 修改保险金
export function updateInsurance(data) {
  return request({
    url: '/insurance/update',
    method: 'post',
    data: data
  })
}

// 删除保险金
export function delInsurance(insuranceId) {
  return request({
    url: '/insurance/remove/' + insuranceId,
    method: 'delete'
  })
}
