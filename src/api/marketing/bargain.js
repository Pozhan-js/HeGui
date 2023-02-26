import request from '@/utils/request'

export const listOfAct = (params) => {
  return request({
    url: '',
    method: 'get',
    params
  })
}

export const promoteQR = (activityBargainId) => {
  return request({
    url: '/bargain/info/gen/qrcode/' + activityBargainId,
    method: 'get',
  })
}

export const removeAct = (activityBargainId) => {
  return request({
    url: '/bargain/info/remove/' + activityBargainId,
    method: 'delete',
  })
}

export const toggleStatus = (data) => {
  return request({
    url: '/bargain/info/update/status',
    method: 'post',
    data
  })
}

export const createAct = (data) => {
  return request({
    url: '/bargain/info/add',
    method: 'post',
    data
  })
}

export const updateAct = (data) => {
  return request({
    url: '/bargain/info/update',
    method: 'post',
    data
  })
}

export const queryActDetail = (activityBargainId) => {
  return request({
    url: '/bargain/info/info/' + activityBargainId,
    method: 'get',
  })
}

export const listOfBargainProcess = (params) => {
  return request({
    url: '',
    method: 'get',
    params
  })
}

export const disableBargainProcess = (params) => {
  return request({
    url: '',
    method: 'get',
    params
  })
}

export const enableBargainProcess = (params) => {
  return request({
    url: '',
    method: 'get',
    params
  })
}

export const removeBargainProcess = (params) => {
  return request({
    url: '',
    method: 'get',
    params
  })
}