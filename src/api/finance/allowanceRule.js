import request from '@/utils/request'

// 查询提成规则列表
export function listAllowanceRule(query) {
  return request({
    url: '/allowanceRule/list',
    method: 'get',
    params: query
  })
}

// 查询提成规则详细
export function getAllowanceRule(allowanceRuleId) {
  return request({
    url: '/allowanceRule/info/' + allowanceRuleId,
    method: 'get'
  })
}

// 新增提成规则
export function addAllowanceRule(data) {
  return request({
    url: '/allowanceRule/add',
    method: 'post',
    data: data
  })
}

// 修改提成规则
export function updateAllowanceRule(data) {
  return request({
    url: '/allowanceRule/update',
    method: 'post',
    data: data
  })
}

// 删除提成规则
export function delAllowanceRule(allowanceRuleId) {
  return request({
    url: '/allowanceRule/remove/' + allowanceRuleId,
    method: 'delete'
  })
}

/** 商品数据 */
export function goodsList(query) {
  return request({
    url: '/allowanceRuleGoods/goodsList',
    method: 'get',
    params: {
      ...query,
      orderByColumn: 'goods_id',
      isAsc: 'desc'
    }
  })
}

// 禁用提成规则
export function disabled(allowanceRuleId) {
  return request({
    url: `/allowanceRule/disabled/${allowanceRuleId}`,
    method: 'post'
  })
}

// 启用提成规则
export function enabled(allowanceRuleId) {
  return request({
    url: `/allowanceRule/enabled/${allowanceRuleId}`,
    method: 'post'
  })
}

// 失效提成规则
export function expired(allowanceRuleId) {
  return request({
    url: `/allowanceRule/expired/${allowanceRuleId}`,
    method: 'post'
  })
}

// 查询配送员分组
export function listDistributionGroup(query) {
  return request({
    url: '/distribution/group/dropDownList',
    method: 'get',
    params: query
  })
}

// 查询管理津贴分组列表
export function getSelectGroupList(allowanceRuleId) {
  return request({
    url: '/allowanceRuleGoods/selectGroupList/' + allowanceRuleId,
    method: 'get'
  })
}

// 查询管理津贴分组列表
export function delSelectGroup({ allowanceRuleId, groupId }) {
  return request({
    url: `/allowanceRuleGoods/deleteGroup/${allowanceRuleId}/${groupId}`,
    method: 'delete'
  })
}

