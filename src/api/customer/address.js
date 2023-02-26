import request from '@/utils/request'

// 查询客户收货地址列表
export function listAddress(query) {
  return request({
    url: '/customer/address/list',
    method: 'get',
    params: query
  })
}

// 查询客户收货地址详细
export function getAddress(addressId) {
  return request({
    url: '/customer/address/info/' + addressId,
    method: 'get'
  })
}

// 新增客户收货地址
export function addAddress(data) {
  return request({
    url: '/customer/address/add',
    method: 'post',
    data: data
  })
}

// 修改客户收货地址
export function updateAddress(data) {
  return request({
    url: '/customer/address/update',
    method: 'post',
    data: data
  })
}

// 删除客户收货地址
export function delAddress(addressId) {
  return request({
    url: '/customer/address/remove/' + addressId,
    method: 'delete'
  })
}
