import request from '@/utils/request'

/** 查询列表信息 */
export function listIntegralFeeRule(query) {
  return request({
    url: '/mallDistributionFeeRule/list',
    method: 'get',
    params: query
  })
}

/** 查询详情 */
export function getInfo(id) {
  return request({
    url: `/mallDistributionFeeRule/info/${id}`,
    method: 'get'
  })
}

/** 启用 */
export function enabled(id) {
  return request({
    url: `/mallDistributionFeeRule/enabled/${id}`,
    method: 'post'
  })
}

/** 禁用 */
export function disabled(id) {
  return request({
    url: `/mallDistributionFeeRule/disabled/${id}`,
    method: 'post'
  })
}

/** 失效 */
export function expired(id) {
  return request({
    url: `/mallDistributionFeeRule/expired/${id}`,
    method: 'post'
  })
}

/** 删除 */
export function remove(id) {
  return request({
    url: `/mallDistributionFeeRule/remove/${id}`,
    method: 'DELETE'
  })
}

/** 查询电子围栏 */
export function getFence(query) {
  return request({
    url: '/geofence/list',
    method: 'get',
    params: {
      ...query,
      pageNum: 1,
      pageSize: 999
    }
  })
}

/** 新增[积分商城配送费规则] */
export function addMall(data) {
  return request({
    url: `/mallDistributionFeeRule/add`,
    method: 'post',
    data
  })
}
