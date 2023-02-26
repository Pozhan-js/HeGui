import request from '@/utils/request'

// 查询区域
export function getAreaTree() {
  return request({
    url: '/region/treeselect',
    method: 'get'
  })
}

// 查询组织
export function getOrgTree(query) {
  return request({
    url: '/org/treeselect',
    method: 'get',
    params: query
  })
}

/**
 * 通过区域码查询区域数据
 * @param {*} code 区域码
 * @returns 
 */
export function getAreasJson(code) {
  return request({
    url: `/tools/areas/geojson?code=${code}`,
    method: 'get'
  })
}

/**
 * 获取短信验证码
 * @param {*} query 
 * @returns 
 */
export function telephoneDirect(query) {
  return request({
    url: `/distribution/telephone/direct`,
    method: 'get',
    params: query
  })
}
