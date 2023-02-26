import request from '@/utils/request'

// 查询采购订单列表
export function getPurchaseList(query) {
  return request({
    url: '/score/purchase/list',
    method: 'get',
    params: query,
  })
}


// 审核通过
export function pass(scoreId) {
  return request({
    url: `/score/pass/${scoreId}`,
    method: 'post'
  })
}

// 审核不通过
export function fail(scoreId) {
  return request({
    url: `/score/fail/${scoreId}`,
    method: 'post'
  })
}

// 查询配送订单列表
export function getScoreList(query) {
  return request({
    url: '/score/list',
    method: 'get',
    params: query,
  })
}

// 置顶
export function stickTop(scoreId) {
  return request({
    url: `/score/stickTop/${scoreId}`,
    method: 'post'
  })
}

// 取消置顶
export function unStickTop(scoreId) {
  return request({
    url: `/score/unStickTop/${scoreId}`,
    method: 'post'
  })
}

// 回复
export function replyAdd(data) {
  return request({
    url: `/reply/add`,
    method: 'post',
    data
  })
}
