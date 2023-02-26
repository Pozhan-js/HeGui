import request from '@/utils/request'

// 刷新方法
export function getDepartments() {
  return request({
    url: '/workwechat/dept/tree',
    method: 'get'
  })
}

export function queryGroupTag() {
  return request({
    url: '/workwechat/groupTag/all',
    params: {
      groupType: 'customer'
    },
    method: 'get'
  })
}

export function queryUserAll() {
  return request({
    url: '/workwechat/user/all',
    method: 'get'
  })
}

export function queryUserChatWindowTab(userId) {
  return request({
    url: `/workwechat/user/${userId}/chatWindowTab`,
    method: 'get'
  })
}
export function queryChatWindowTab(userId) {
  return request({
    url: `/workwechat/user/allChatWindowTab`,
    method: 'get'
  })
}

export function updateUserChatWindowTab(data) {
  return request({
    url: `/workwechat/user/saveChatWindow`,
    method: 'post',
    data
  })
}

export function syncWorkUsers() {
  return request({
    url: `/workwechat/user/sync`,
    method: 'post',
  })
}

export function syncDepartments() {
  return request({
    url: `/workwechat/dept/sync`,
    method: 'post',
  })
}

export function syncCustomerTags(data) {
  return request({
    url: `/workwechat/groupTag/sync`,
    method: 'post',
    data
  })
}
