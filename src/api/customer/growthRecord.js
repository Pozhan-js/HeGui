import request from '@/utils/request'

// 查询客户账户记录列表
export function list() {
  return request({
    url: '/growthStrategy/list',
    method: 'get',
  })
}

// 修改规则配置
export function update(data) {
  return request({
    url: '/growthStrategy/update',
    method: 'post',
    data: data
  })
}

/** 查询详情 */
export function detail(growthStrategyId) {
  return request({
    url: `/growthRule/detail/${growthStrategyId}`,
    method: 'get',
  })
}

/** 成长值策略修改 */
export function growthRuleUpdate(data) {
  return request({
    url: '/growthRule/add',
    method: 'post',
    data: data
  })
}
