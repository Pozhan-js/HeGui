import request from '@/utils/request'

// 查询积分具体变动规则
export function listScoreRule(query) {
  return request({
    url: '/score/rule/info',
    method: 'get',
    params: query
  })
}

// 变更积分具体变动规则
export function updateScoreRule(data) {
  return request({
    url: '/score/rule/save',
    method: 'post',
    data: data
  })
}
