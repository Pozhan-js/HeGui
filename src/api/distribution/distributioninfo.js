import request from '@/utils/request'

// 查询配送员信息列表
export function listDistributioninfo(query) {
  return request({
    url: '/distribution/info/managelist',
    method: 'get',
    params: query
  })
}

// 查询配送员详情
export function distributionInfo(distributionId) {
  return request({
    url: `/distribution/info/info/${distributionId}`,
    method: 'get',
  })
}



// 停运配送员
export function outService(distributionIds) {
  return request({
    url: `/distribution/info/shutdown/${distributionIds}`,
    method: 'post',
  })
}

// 启运配送员
export function departure(distributionIds) {
  return request({
    url: `/distribution/info/shipment/${distributionIds}`,
    method: 'post',
  })
}

// 配送员申请通过
export function applyBy(distributionIds) {
  return request({
    url: `/distribution/info/applyagree/${distributionIds}`,
    method: 'post',
  })
}

// 配送员申请拒绝
export function applyRefuse(distributionIds) {
  return request({
    url: `/distribution/info/applyrefuse/${distributionIds}`,
    method: 'post',
  })
}

// 配送员离职通过
export function resignBy(distributionIds) {
  return request({
    url: `/distribution/info/separationagree/${distributionIds}`,
    method: 'post',
  })
}

// 配送员离职拒绝
export function resignRefuse(distributionIds) {
  return request({
    url: `/distribution/info/separationrefuse/${distributionIds}`,
    method: 'post',
  })
}

// 查询送货员信息列表
export function listDeliveryinfo(query) {
  return request({
    url: '/distribution/deliveryinfo/list',
    method: 'get',
    params: query
  })
}

// 配送员加入黑名单
export function joinBlacklist(data) {
  return request({
    url: `/distribution/info/yesblacklist`,
    method: 'post',
    data
  })
}

// 配送员移除黑名单
export function removeBlacklist(distributionIds) {
  return request({
    url: `/distribution/info/noblacklist/${distributionIds}`,
    method: 'post',
  })
}

// 配送员接自然单
export function joinSingle(distributionIds) {
  return request({
    url: `/distribution/info/yesnatural/${distributionIds}`,
    method: 'post',
  })
}

// 配送员不接自然单
export function notSingle(distributionIds) {
  return request({
    url: `/distribution/info/nonatural/${distributionIds}`,
    method: 'post',
  })
}


// 配送员绑定送货员
export function bindingDelivery(data) {
  return request({
    url: '/distribution/info/binding',
    method: 'post',
    data
  })
}

// 专职配送员添加电子围栏
export function postFence(data) {
  return request({
    url: '/distribution/info/fence',
    method: 'post',
    data
  })
}

// 修改配送员分组
export function updateGroup(data) {
  return request({
    url: '/distribution/info/updategroup',
    method: 'post',
    data
  })
}

// 查询配送员分组列表
export function listGroup(query) {
  return request({
    url: '/distribution/group/list',
    method: 'get',
    params: query
  })
}

// 查询配送员出入组记录列表
export function listGroupJoinLog(query) {
  return request({
    url: '/distribution/joinLog/list',
    method: 'get',
    params: query
  })
}

/** 转为专职配送员 */
export function fullDistribution(data) {
  return request({
    url: `/distribution/info/full`,
    method: 'post',
    data
  })
}

/** 转为兼职配送员 */
export function partDistribution(data) {
  return request({
    url: `/distribution/info/part`,
    method: 'post',
    data
  })
}

// 查询配送员轨迹
export function listTrajectory(query) {
  return request({
    url: '/distribution/location/locationalert',
    method: 'get',
    params: query
  })
}

// 配送员电子围栏
export function shopFence(query) {
  return request({
    url: '/distribution/info/shopfence',
    method: 'get',
    params: query
  })
}
