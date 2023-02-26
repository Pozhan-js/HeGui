import request from '@/utils/request'

export function listCouponInfo(query) {
  return request({
    url: '/marketing/couponInfo/list',
    method: 'get',
    params: query
  })
}

export function listOverview(query) {
  return request({
    url: '/data/marketingAnalysis/overview',
    method: 'get',
    params: query
  })
}

export function listGoodsEffect(query) {
  return request({
    url: '/data/marketingAnalysis/goodsEffect',
    method: 'get',
    params: query
  })
}

export function listAnalysis(query) {
  return request({
    url: '/data/marketingAnalysis/effect/analysis',
    method: 'get',
    params: query
  })
}

export function listDataTrend(query) {
  return request({
    url: '/data/marketingAnalysis/dataTrend',
    method: 'get',
    params: query
  })
}
