import request from '@/utils/request'

// 查询保险金订单记录列表
export function listInsuranceorder(query) {
  return request({
    url: '/distribution/insuranceorder/list',
    method: 'get',
    params: query
  })
}

// 查询保险金订单记录详细
export function getInsuranceorder(insuranceOrderId) {
  return request({
    url: '/distribution/insuranceorder/info/' + insuranceOrderId,
    method: 'get'
  })
}

// 新增保险金订单记录
export function addInsuranceorder(data) {
  return request({
    url: '/distribution/insuranceorder/add',
    method: 'post',
    data: data
  })
}

// 修改保险金订单记录
export function updateInsuranceorder(data) {
  return request({
    url: '/distribution/insuranceorder/update',
    method: 'post',
    data: data
  })
}

// 删除保险金订单记录
export function delInsuranceorder(insuranceOrderId) {
  return request({
    url: '/distribution/insuranceorder/remove/' + insuranceOrderId,
    method: 'delete'
  })
}

// 获取保险公司日志记录
export function statusLogInsuranceorder(insuranceOrderId) {
  return request({
    url: '/distribution/insuranceorder/statuslog/' + insuranceOrderId,
    method: 'get'
  })
}

