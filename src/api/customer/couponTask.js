import request from '@/utils/request'

// 查询客户发券任务列表
export function listCouponTask(query) {
  return request({
    url: '/couponTask/list',
    method: 'get',
    params: query
  })
}

// 查询客户发券任务详细
export function getCouponTask(couponTaskId) {
  return request({
    url: '/couponTask/info/' + couponTaskId,
    method: 'get'
  })
}

// 新增客户发券任务
export function addCouponTask(data) {
  return request({
    url: '/couponTask/add',
    method: 'post',
    data: data
  })
}

// 修改客户发券任务
export function updateCouponTask(data) {
  return request({
    url: '/couponTask/update',
    method: 'post',
    data: data
  })
}

// 删除客户发券任务
export function delCouponTask(couponTaskId) {
  return request({
    url: '/couponTask/remove/' + couponTaskId,
    method: 'delete'
  })
}

// 失效
export function disabled(couponTaskId) {
  return request({
    url: `/couponTask/disabled/${couponTaskId}`,
    method: 'post'
  })
}


/** 查询客群数 */
export function getTaskCount(query) {
  return request({
    url: '/couponTask/count',
    method: 'get',
    params: query
  })
}

// 查询优惠券
export function couponIssue(query) {
  return request({
    url: '/marketing/couponInfo/can/issue',
    method: 'get',
    params: query
  })
}

// 根据ID查询优惠券
export function couponIdQuery(data) {
  return request({
    url: '/marketing/couponInfo/info/by/couponIds',
    method: 'post',
    data: data
  })
}
