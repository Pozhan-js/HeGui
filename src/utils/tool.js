/**
 * 通用js方法封装处理
 * Copyright (c) 2019 ruoyi
 */

const baseURL = process.env.VUE_APP_BASE_API

//  秒数转化为时分秒
export function formatSeconds(value) {
  //  秒
  let second = parseInt(value)
  //  分
  let minute = 0
  //  小时
  let hour = 0
  //  天
  //  let day = 0
  //  如果秒数大于60，将秒数转换成整数
  if (second > 60) {
    //  获取分钟，除以60取整数，得到整数分钟
    minute = parseInt(second / 60)
    //  获取秒数，秒数取佘，得到整数秒数
    second = parseInt(second % 60)
    //  如果分钟大于60，将分钟转换成小时
    if (minute > 60) {
      //  获取小时，获取分钟除以60，得到整数小时
      hour = parseInt(minute / 60)
      //  获取小时后取佘的分，获取分钟除以60取佘的分
      minute = parseInt(minute % 60)
    }
  }

  let result = '' + parseInt(second) + '秒'
  if (minute > 0) {
    result = '' + parseInt(minute) + '分' + result
  }
  if (hour > 0) {
    result = '' + parseInt(hour) + '小时' + result
  }
  return result
}

// 日期格式化
export function parseTime(time, pattern) {
  if (arguments.length === 0 || !time) {
    return null
  }
  const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
      time = parseInt(time)
    } else if (typeof time === 'string') {
      time = time.replace(new RegExp(/-/gm), '/')
    }
    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value] }
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return time_str
}

// 表单重置
export function resetForm(refName) {
  if (this.$refs[refName]) {
    this.$refs[refName].resetFields()
  }
}

// 添加日期范围
export function addDateRange(params, dateRange, propName) {
  var search = params
  search.params = {}
  if (dateRange != null && dateRange != '') {
    if (typeof (propName) === 'undefined') {
      search.params['beginTime'] = dateRange[0]
      search.params['endTime'] = dateRange[1]
    } else {
      search.params['begin' + propName] = dateRange[0]
      search.params['end' + propName] = dateRange[1]
    }
  }
  return search
}

// 回显数据字典
export function selectDictLabel(datas, value) {
  var actions = []
  Object.keys(datas).some((key) => {
    if (datas[key].dictValue == ('' + value)) {
      actions.push(datas[key].dictLabel)
      return true
    }
  })
  return actions.join('')
}

// 回显数据字典（字符串数组）
export function selectDictLabels(datas, value, separator) {
  var actions = []
  var currentSeparator = undefined === separator ? ',' : separator
  var temp = value.split(currentSeparator)
  Object.keys(value.split(currentSeparator)).some((val) => {
    Object.keys(datas).some((key) => {
      if (datas[key].dictValue == ('' + temp[val])) {
        actions.push(datas[key].dictLabel + currentSeparator)
      }
    })
  })
  return actions.join('').substring(0, actions.join('').length - 1)
}

// 通用下载方法
export function download(fileName) {
  window.location.href = baseURL + '/common/download?fileName=' + encodeURI(fileName) + '&delete=' + true
}

// 字符串格式化(%s )
export function sprintf(str) {
  var args = arguments; var flag = true; var i = 1
  str = str.replace(/%s/g, function() {
    var arg = args[i++]
    if (typeof arg === 'undefined') {
      flag = false
      return ''
    }
    return arg
  })
  return flag ? str : ''
}

// 转换字符串，undefined,null等转化为""
export function praseStrEmpty(str) {
  if (!str || str == 'undefined' || str == 'null') {
    return ''
  }
  return str
}

/**
 * 构造树型结构数据
 * @param {*} data 数据源
 * @param {*} id id字段 默认 'id'
 * @param {*} parentId 父节点字段 默认 'parentId'
 * @param {*} children 孩子节点字段 默认 'children'
 */
export function handleTree(data, id, parentId, children) {
  const config = {
    id: id || 'id',
    parentId: parentId || 'parentId',
    childrenList: children || 'children'
  }

  var childrenListMap = {}
  var nodeIds = {}
  var tree = []

  for (const d of data) {
    const parentId = d[config.parentId]
    if (childrenListMap[parentId] == null) {
      childrenListMap[parentId] = []
    }
    nodeIds[d[config.id]] = d
    childrenListMap[parentId].push(d)
  }

  for (const d of data) {
    const parentId = d[config.parentId]
    if (nodeIds[parentId] == null) {
      tree.push(d)
    }
  }

  for (const t of tree) {
    adaptToChildrenList(t)
  }

  function adaptToChildrenList(o) {
    if (childrenListMap[o[config.id]] !== null) {
      o[config.childrenList] = childrenListMap[o[config.id]]
    }
    if (o[config.childrenList]) {
      for (const c of o[config.childrenList]) {
        adaptToChildrenList(c)
      }
    }
  }
  return tree
}

/**
* 参数处理
* @param {*} params  参数
*/
export function tansParams(params) {
  let result = ''
  Object.keys(params).forEach((key) => {
    if (!Object.is(params[key], undefined) && !Object.is(params[key], null) && !Object.is(JSON.stringify(params[key]), '{}')) {
      result += encodeURIComponent(key) + '=' + encodeURIComponent(params[key]) + '&'
    }
  })
  return result
}

export function formatDate(date) {
  return date ? date.trim().split(' ') : []
}
