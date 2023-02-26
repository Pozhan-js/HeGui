import request from '@/utils/request'

// 查询配送费规则列表
export function listDistributionFeeRule(query) {
  return request({
    url: '/distributionFeeRule/list',
    method: 'get',
    params: query
  })
}

// 查询配送费规则详细
export function getDistributionFeeRule(distributionFeeId) {
  return request({
    url: '/distributionFeeRule/info/' + distributionFeeId,
    method: 'get'
  })
}

// 查询店铺信息
export function getDistributionDistance(orgId) {
  return request({
    url: 'distributionFeeRule/distance/' + orgId,
    method: 'get'
  })
}

// 新增配送费规则
export function addDistributionFeeRule(data) {
  return request({
    url: '/distributionFeeRule/add',
    method: 'post',
    data: data
  })
}

// 修改配送费规则
export function updateDistributionFeeRule(data) {
  return request({
    url: '/distributionFeeRule/update',
    method: 'post',
    data: data
  })
}

// 删除配送费规则
export function delDistributionFeeRule(distributionFeeId) {
  return request({
    url: '/distributionFeeRule/remove/' + distributionFeeId,
    method: 'delete'
  })
}

/** 商品类型 */
export function goodsList(query) {
  return request({
    url: '/distributionFeePopularize/goodsList',
    method: 'get',
    params: {
      ...query,
      orderByColumn: 'goods_id',
      isAsc: 'desc'
    }
  })
}

// 新增自然订单配送规则
export function addNatural(data) {
  return request({
    url: '/distributionFeeRule/addNatural',
    method: 'post',
    data: data
  })
}

// 新增推广订单配送规则
export function addPopularize(data) {
  return request({
    url: '/distributionFeeRule/addPopularize',
    method: 'post',
    data: data
  })
}

// 启用规则
export function enabled(distributionFeeId) {
  return request({
    url: `/distributionFeeRule/enabled/${distributionFeeId}`,
    method: 'post'
  })
}

// 禁用规则
export function disabled(distributionFeeId) {
  return request({
    url: `/distributionFeeRule/disabled/${distributionFeeId}`,
    method: 'post'
  })
}

// 失效规则
export function expired(distributionFeeId) {
  return request({
    url: `/distributionFeeRule/expired/${distributionFeeId}`,
    method: 'post'
  })
}

// 重算
export function recalculate(data) {
  return request({
    url: `/ordercenter/order/list/orderId`,
    method: 'post',
    data
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
