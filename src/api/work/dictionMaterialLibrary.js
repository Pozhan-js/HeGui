import request from '@/utils/request'

// 查询素材库列表
export function listDictionMaterialLibrary(query) {
  return request({
    url: '/dictionMaterialLibrary/list',
    method: 'get',
    params: query
  })
}

// 查询素材库详细
export function getDictionMaterialLibrary(dictionMaterialLibraryId) {
  return request({
    url: '/dictionMaterialLibrary/info/' + dictionMaterialLibraryId,
    method: 'get'
  })
}

// 新增素材库
export function addDictionMaterialLibrary(data) {
  return request({
    url: '/dictionMaterialLibrary/add',
    method: 'post',
    data: data
  })
}

// 修改素材库
export function updateDictionMaterialLibrary(data) {
  return request({
    url: '/dictionMaterialLibrary/update',
    method: 'post',
    data: data
  })
}

// 删除素材库
export function delDictionMaterialLibrary(dictionMaterialLibraryId) {
  return request({
    url: '/dictionMaterialLibrary/remove/' + dictionMaterialLibraryId,
    method: 'delete'
  })
}