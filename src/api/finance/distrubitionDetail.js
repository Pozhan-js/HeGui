import request from '@/utils/request'

// 查询配送员结算明细列表
export function listDistrubitionDetail(query) {
  return request({
    url: '/distributionDetail/list/income',
    method: 'get',
    params: query
  })
}

// 查询配送员结算明细详细
export function getDistrubitionDetail(distrubitionDeatailId) {
  return request({
    url: '/distrubitionDetail/info/' + distrubitionDeatailId,
    method: 'get'
  })
}

// 新增配送员结算明细
export function addDistrubitionDetail(data) {
  return request({
    url: '/distrubitionDetail/add',
    method: 'post',
    data: data
  })
}

// 修改配送员结算明细
export function updateDistrubitionDetail(data) {
  return request({
    url: '/distrubitionDetail/update',
    method: 'post',
    data: data
  })
}

// 删除配送员结算明细
export function delDistrubitionDetail(distrubitionDeatailId) {
  return request({
    url: '/distrubitionDetail/remove/' + distrubitionDeatailId,
    method: 'delete'
  })
}
