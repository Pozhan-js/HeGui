import request from '@/utils/request'

// 查询分销客户列表
export function listCustomer(query) {
  return request({
    url: '/income/list',
    method: 'get',
    params: query
  })
}

// 查询分销二维码
export function getQrCode(customerId) {
  return request({
    url: `/customer/qrcode/sale/get/${customerId}`,
    method: 'get'
  })
}

// 生成分销二维码
export function genQrCode(customerId) {
  return request({
    url: `/customer/qrcode/sale/gen/${customerId}`,
    method: 'get'
  })
}

// 修改二维码状态
export function updateStatus(data) {
  return request({
    url: '/customer/qrcode/sale/update/status',
    method: 'post',
    data: data
  })
}
