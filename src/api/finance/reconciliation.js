import request from '@/utils/request'

// 查询配送员结算明细列表
export function listOrderInfoListBillDetail(query) {
  return request({
    url: '/orderInfo/list/bill/detail',
    method: 'get',
    params: query
  })
}

// 查询配送员结算汇总列表
export function listPaymentOrderTransferStatistics(query) {
  return request({
    url: '/paymentOrderTransfer/statistics/list',
    method: 'get',
    params: query
  })
}
