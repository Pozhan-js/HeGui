import request from '@/utils/request'

// 查询结算提现列表
export function listCashout(query) {
  return request({
    url: '/cashout/supplier/remitlist',
    method: 'get',
    params: query
  })
}

export function listRewardAudit(query) {
  return request({
    url: '/cashout/rewardPunishment/auditlist',
    method: 'get',
    params: query
  })
}

export function listRewardRemit(query) {
  return request({
    url: '/cashout/rewardPunishment/remitlist',
    method: 'get',
    params: query
  })
}

export function listCashoutAudit(query) {
  return request({
    url: '/cashout/supplier/auditlist',
    method: 'get',
    params: query
  })
}

export function remitAgree(data) {
  return request({
    url: '/cashout/remitagree',
    method: 'post',
    data
  })
}

export function auditDistributionIncomeAgree(data) {
  return request({
    url: '/cashout/distributionIncome/auditagree',
    method: 'post',
    data
  })
}
export function auditRewardPunishmentAgree(data) {
  return request({
    url: '/cashout/rewardPunishment/auditagree',
    method: 'post',
    data
  })
}
export function auditSupplierAgree(data) {
  return request({
    url: '/cashout/supplier/auditagree',
    method: 'post',
    data
  })
}
export function auditDistributionIncomeRemit(data) {
  return request({
    url: '/cashout/distributionIncome/remitagree',
    method: 'post',
    data
  })
}
export function auditRewardPunishmentRemit(data) {
  return request({
    url: '/cashout/rewardPunishment/remitagree',
    method: 'post',
    data
  })
}
export function auditSupplierRemit(data) {
  return request({
    url: '/cashout/supplier/remitagree',
    method: 'post',
    data
  })
}

export function auditAgree(data) {
  return request({
    url: '/cashout/auditagree',
    method: 'post',
    data
  })
}
