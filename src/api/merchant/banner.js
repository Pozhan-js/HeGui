import request from '@/utils/request'

// 查询店铺banner列表
export function listBanner(query) {
  return request({
    url: '/banner/list',
    method: 'get',
    params: query
  })
}

// 查询店铺banner详细
export function getBanner(bannerId) {
  return request({
    url: '/banner/detail/' + bannerId,
    method: 'get'
  })
}

// 新增店铺banner
export function addBanner(data) {
  return request({
    url: '/banner/batchAdd',
    method: 'post',
    data: data
  })
}

// 修改店铺banner
export function updateBanner(data) {
  return request({
    url: '/banner/update',
    method: 'post',
    data: data
  })
}

// 删除店铺banner
export function delBanner(bannerId) {
  return request({
    url: '/banner/remove/' + bannerId,
    method: 'delete'
  })
}
