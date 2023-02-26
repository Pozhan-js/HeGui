import request from '@/utils/request'
import { stringify } from 'querystring'

export function fileGroup() {
  return request({
    url: '/system/mss/fileGroup/simpleList',
    method: 'post',
    data: {}
  })
}

export function upload(data) {
  return request({
    url: '/system/file/upload',
    method: 'POST',
    data
  })
}

export function uploadByKey(data) {
  return request({
    url: '/system/file/uploadApiByKey',
    method: 'POST',
    data
  })
}

export function groupInfo(groupId) {
  return request({
    url: '/system/mss/fileGroup/info/' + groupId,
    method: 'get',
  })
}


export function addGroup(data) {
  return request({
    url: '/system/mss/fileGroup/add',
    method: 'post',
    data
  })
}

export function fileListTableData(data, pagination) {
  return request({
    url: '/system/mss/file/list/tabledata?' + stringify(pagination),
    method: 'post',
    data
  })
}

export function removeGroup(groupId) {
  return request({
    url: '/system/mss/fileGroup/remove/' + groupId,
    method: 'delete',
  })
}

export function updateGroup(data) {
  return request({
    url: '/system/mss/fileGroup/update/all',
    method: 'post',
    data: data
  })
}

export function removeFiles(fileIds) {
  return request({
    url: '/system/mss/file/remove/' + fileIds,
    method: 'delete',
  })
}

export function fileInfo(fileId) {
  return request({
    url: '/system/mss/file/info/' + fileId,
    method: 'get'
  })
}

export function updateFile(data) {
  return request({
    url: '/system/mss/file/update/all',
    method: 'post',
    data
  })
}

export function addFile(data) {
  return request({
    url: '/system/mss/file/add',
    method: 'post',
    data
  })
}
