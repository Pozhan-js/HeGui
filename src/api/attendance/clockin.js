import request from '@/utils/request'

// 查询打卡明细列表
export function listDetails(query) {
  return request({
    url: '/distribution/signinrecord/list/byCondition',
    method: 'get',
    params: query
  })
}

