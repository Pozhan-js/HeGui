import request from '@/utils/request'

// 查询店铺活动列表
export function listActivity(query) {
  return request({
    url: '/activity/list',
    method: 'get',
    params: query
  })
}

// 查询店铺活动详细
export function getActivity(activityId) {
  return request({
    url: '/activity/info/' + activityId,
    method: 'get'
  })
}

// 新增店铺活动
export function addActivity(data) {
  return request({
    url: '/activity/add',
    method: 'post',
    data: data
  })
}

// 修改店铺活动
export function updateActivity(data) {
  return request({
    url: '/activity/update',
    method: 'post',
    data: data
  })
}

// 删除店铺活动
export function delActivity(activityId) {
  return request({
    url: '/activity/remove/' + activityId,
    method: 'delete'
  })
}
