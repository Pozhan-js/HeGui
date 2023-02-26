import request from '@/utils/request'

// 查询配送员结算汇总列表
export function listDistrubitionSummary(query) {
  return request({
    url: '/distribution/list/byCondition',
    method: 'get',
    params: query
  })
}

// 查询配送员结算汇总详细
export function getDistrubitionSummary(distrubitionSummaryId) {
  return request({
    url: '/distrubitionSummary/info/' + distrubitionSummaryId,
    method: 'get'
  })
}

// 新增配送员结算汇总
export function addDistrubitionSummary(data) {
  return request({
    url: '/distrubitionSummary/add',
    method: 'post',
    data: data
  })
}

// 修改配送员结算汇总
export function updateDistrubitionSummary(data) {
  return request({
    url: '/distrubitionSummary/update',
    method: 'post',
    data: data
  })
}

// 删除配送员结算汇总
export function delDistrubitionSummary(distrubitionSummaryId) {
  return request({
    url: '/distrubitionSummary/remove/' + distrubitionSummaryId,
    method: 'delete'
  })
}
