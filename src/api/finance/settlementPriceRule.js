import request from '@/utils/request'

// 查询结算价设置列表
export function listSettlementPriceRule(query) {
  return request({
    url: '/settlementPriceRule/list',
    method: 'get',
    params: query
  })
}

// 查询结算价设置详细
export function getSettlementPriceRule(settlementPriceId) {
  return request({
    url: '/settlementPriceRule/info/' + settlementPriceId,
    method: 'get'
  })
}

// 新增结算价设置
export function addSettlementPriceRule(data) {
  return request({
    url: '/settlementPriceRule/add',
    method: 'post',
    data: data
  })
}

// 修改结算价设置
export function updateSettlementPriceRule(data) {
  return request({
    url: '/settlementPriceRule/update',
    method: 'post',
    data: data
  })
}

// 删除结算价设置
export function delSettlementPriceRule(settlementPriceId) {
  return request({
    url: '/settlementPriceRule/remove/' + settlementPriceId,
    method: 'delete'
  })
}

/** 商品数据 */
export function goodsList(query) {
  return request({
    url: '/settlementPriceRuleGoods/goodsList',
    method: 'get',
    params: {
      ...query,
      orderByColumn: 'goods_id',
      isAsc: 'desc'
    }
  })
}

// 启用规则
export function enabled(settlementPriceId) {
  return request({
    url: `/settlementPriceRule/enabled/${settlementPriceId}`,
    method: 'post',
  })
}

// 禁用规则
export function disabled(settlementPriceId) {
  return request({
    url: `/settlementPriceRule/disabled/${settlementPriceId}`,
    method: 'post',
  })
}

// 失效规则
export function expired(settlementPriceId) {
  return request({
    url: `/settlementPriceRule/expired/${settlementPriceId}`,
    method: 'post',
  })
}
