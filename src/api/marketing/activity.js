import request from '@/utils/request'

export function listActivity(query) {
  return request({
    url: '/lotteryActivity/list',
    method: 'get',
    params: query
  })
}

export function addActivity(data) {
  return request({
    url: '/lotteryActivity/add',
    method: 'post',
    data: data
  })
}

export function updateActivity(data) {
  return request({
    url: '/lotteryActivity/update',
    method: 'post',
    data: data
  })
}

export function getActivityInfo(activityId) {
  return request({
    url: `/lotteryActivity/info/${activityId}`,
    method: 'get'
  })
}

export function getActivityLink(query) {
  return request({
    url: '/lotteryActivity/linkurl',
    method: 'get',
    query
  })
}

export function delActivity(activityId) {
  return request({
    url: `/lotteryActivity/remove/${activityId}`,
    method: 'delete'
  })
}

export function offlineActivity(activityId) {
  return request({
    url: `/lotteryActivity/${activityId}/offline`,
    method: 'post'
  })
}

export function onlineActivity(activityId) {
  return request({
    url: `/lotteryActivity/${activityId}/online`,
    method: 'post'
  })
}

export function listAllActivity() {
  return request({
    url: '/lotteryActivity/all',
    method: 'get'
  })
}

export function listAward(activityId) {
  return request({
    url: `/lotteryActivity/${activityId}/awards`,
    method: 'get'
  })
}
