import request from '@/utils/request'

// 查询供应商结算中间表列表
export function listSupplier(query) {
  return request({
    url: '/supplier/list',
    method: 'get',
    params: query
  })
}

// 查询供应商结算中间表详细
export function getSupplier(settlementId) {
  return request({
    url: '/supplier/info/' + settlementId,
    method: 'get'
  })
}

// 新增供应商结算中间表
export function addSupplier(data) {
  return request({
    url: '/supplier/add',
    method: 'post',
    data: data
  })
}

// 修改供应商结算中间表
export function updateSupplier(data) {
  return request({
    url: '/supplier/update',
    method: 'post',
    data: data
  })
}

// 删除供应商结算中间表
export function delSupplier(settlementId) {
  return request({
    url: '/supplier/remove/' + settlementId,
    method: 'delete'
  })
}
