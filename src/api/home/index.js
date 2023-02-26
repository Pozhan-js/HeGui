import request from '@/utils/request'

// 查询核心指标
export function getCoreIndicators(query) {
  return request({
    url: '/home/page/coreIndicators/list',
    method: 'get',
    params: query
  })
}

// 系统通知列表
export function getNoticeList(query) {
  return request({
    url: '/home/page/notice/list',
    method: 'get',
    params: query
  })
}

// 查询数据概况
export function getOverviewList(query) {
  return request({
    url: '/home/page/overview/select',
    method: 'get',
    params: query
  })
}

// 查询销售额排名
export function getSalesAnalysisList(query) {
  return request({
    url: '/home/page/salesAnalysis/list',
    method: 'get',
    params: query
  })
}

// 查询服务分析列表
export function getServeList(query) {
  return request({
    url: '/home/page/serve/list',
    method: 'get',
    params: query
  })
}

// 获取图表数据
export function getServerChart(query) {
  return request({
    url: '/home/page/serve/chart',
    method: 'get',
    params: query
  })
}

// 临近超时中数量
export function getTimeoutCount(query) {
  return request({
    url: '/home/page/timeout/count',
    method: 'get',
    params: query
  })
}

// 求助转单中数量
export function getTransferCount(query) {
  return request({
    url: '/home/page/transfer/count',
    method: 'get',
    params: query
  })
}

// 售后维权中数量
export function getAfterSalesCount(query) {
  return request({
    url: '/home/page/after/sales/count',
    method: 'get',
    params: query
  })
}

// 用户催单中数量
export function getHurryCount(query) {
  return request({
    url: '/home/page/hurry/count',
    method: 'get',
    params: query
  })
}






