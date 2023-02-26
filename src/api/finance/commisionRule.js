import request from '@/utils/request'

// 查询提成规则列表
export function listCommisionRule(query) {
  return request({
    url: '/commisionRule/list',
    method: 'get',
    params: query
  })
}

// 查询提成规则详细
export function getCommisionRule(commisionRuleId) {
  return request({
    url: '/commisionRule/info/' + commisionRuleId,
    method: 'get'
  })
}

// 新增提成规则
export function addCommisionRule(data) {
  return request({
    url: '/commisionRule/add',
    method: 'post',
    data: data
  })
}

// 修改提成规则
export function updateCommisionRule(data) {
  return request({
    url: '/commisionRule/update',
    method: 'post',
    data: data
  })
}

// 删除提成规则
export function delCommisionRule(commisionRuleId) {
  return request({
    url: '/commisionRule/remove/' + commisionRuleId,
    method: 'delete'
  })
}

/** 商品数据 */
export function goodsList(query) {
  return request({
    url: '/commisionRuleGoods/goodsList',
    method: 'get',
    params: {
      ...query,
      orderByColumn: 'goods_id',
      isAsc: 'desc'
    }
  })
}

// 禁用提成规则
export function disabled(commisionRuleId) {
  return request({
    url: `/commisionRule/disabled/${commisionRuleId}`,
    method: 'post'
  })
}

// 启用提成规则
export function enabled(commisionRuleId) {
  return request({
    url: `/commisionRule/enabled/${commisionRuleId}`,
    method: 'post'
  })
}

// 失效提成规则
export function expired(commisionRuleId) {
  return request({
    url: `/commisionRule/expired/${commisionRuleId}`,
    method: 'post'
  })
}
