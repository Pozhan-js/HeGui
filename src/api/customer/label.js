import request from '@/utils/request'

// 查询客户标签列表
export function listLabel(query) {
  return request({
    url: '/customer/label/list',
    method: 'get',
    params: query
  })
}

export function listLabelRule(query) {
  return request({
    url: '/customer/label/rule/list',
    method: 'get',
    params: query
  })
}

export function detailLabelRule(labelRuleId) {
  return request({
    url: '/customer/label/rule/info/' + labelRuleId,
    method: 'get'
  })
}

export function listLabelType(params) {
  return request({
    url: '/customer/label/type/dropDownList',
    method: 'get',
    params
  })
}

export function listLabelDropdownList(params) {
  return request({
    url: '/customer/label/dropDownList',
    method: 'get',
    params
  })
}
export function getLabelConditionList(params) {
  return request({
    url: '/customer/label/condition/list',
    method: 'get',
    params
  })
}

export function listLabelPropertyList(params) {
  return request({
    url: '/customer/label/property/list',
    method: 'get',
    params
  })
}

export function removeLabelType(typeId) {
  return request({
    url: '/customer/label/type/remove/' + typeId,
    method: 'delete'
  })
}
export function removeLabelRule(labelRuleIds) {
  return request({
    url: '/customer/label/rule/remove/' + labelRuleIds,
    method: 'delete'
  })
}
export function createLabelType(data) {
  return request({
    url: '/customer/label/type/add',
    method: 'post',
    data
  })
}
export function createLabelRule(data) {
  return request({
    url: '/customer/label/rule/add',
    method: 'post',
    data
  })
}
export function updateLabelType(data) {
  return request({
    url: '/customer/label/type/update',
    method: 'post',
    data
  })
}

export function updateLabelRule(data) {
  return request({
    url: '/customer/label/rule/update',
    method: 'post',
    data
  })
}

// 查询客户标签详细
export function getLabel(labelId) {
  return request({
    url: '/customer/label/info/' + labelId,
    method: 'get'
  })
}

// 新增客户标签
export function addLabel(data) {
  return request({
    url: '/customer/label/add',
    method: 'post',
    data: data
  })
}

// 修改客户标签
export function updateLabel(data) {
  return request({
    url: '/customer/label/update',
    method: 'post',
    data: data
  })
}

// 删除客户标签
export function delLabel(labelId) {
  return request({
    url: '/customer/label/remove/' + labelId,
    method: 'delete'
  })
}

// 标签启用
export function enabled(labelId) {
  return request({
    url: `/customer/label/enabled/${labelId}`,
    method: 'post'
  })
}

// 标签禁用
export function disabled(labelId) {
  return request({
    url: `/customer/label/disabled/${labelId}`,
    method: 'post'
  })
}

// 标签禁用
export function disabledRuleId(labelRuleId) {
  return request({
    url: `/customer/label/rule/disabled/${labelRuleId}`,
    method: 'post'
  })
}
// 标签禁用
export function enabledRuleId(labelRuleId) {
  return request({
    url: `/customer/label/rule/enabled/${labelRuleId}`,
    method: 'post'
  })
}
