import request from '@/utils/request'

// 查询供应商结算明细列表
export function listSupplierDetail(query) {
  return request({
    url: '/supplierDetail/list',
    method: 'get',
    params: query
  })
}

// 查询供应商结算明细详细
export function getSupplierDetail(supplierDetailId) {
  return request({
    url: '/supplierDetail/info/' + supplierDetailId,
    method: 'get'
  })
}

// 新增供应商结算明细
export function addSupplierDetail(data) {
  return request({
    url: '/supplierDetail/add',
    method: 'post',
    data: data
  })
}

// 修改供应商结算明细
export function updateSupplierDetail(data) {
  return request({
    url: '/supplierDetail/update',
    method: 'post',
    data: data
  })
}

// 删除供应商结算明细
export function delSupplierDetail(supplierDetailId) {
  return request({
    url: '/supplierDetail/remove/' + supplierDetailId,
    method: 'delete'
  })
}
