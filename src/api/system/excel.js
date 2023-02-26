import request from '@/utils/request'

// 查询导出报表列表
export function listExcel(query) {
  return request({
    url: '/excel/list',
    method: 'get',
    params: query
  })
}

// 查询导出报表详细
export function getExcel(excelId) {
  return request({
    url: '/excel/info/' + excelId,
    method: 'get'
  })
}

// 新增导出报表
export function addExcel(data) {
  return request({
    url: '/excel/add',
    method: 'post',
    data: data
  })
}

// 修改导出报表
export function updateExcel(data) {
  return request({
    url: '/excel/update',
    method: 'post',
    data: data
  })
}

// 删除导出报表
export function delExcel(excelId) {
  return request({
    url: '/excel/remove/' + excelId,
    method: 'delete'
  })
}
