import request from '@/utils/request'

// 查询质保金列表
export function listAmountorder(query) {
  return request({
    url: '/distribution/amountorder/list',
    method: 'get',
    params: query
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
