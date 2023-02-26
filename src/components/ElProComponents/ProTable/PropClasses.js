// 混合 全部 属性
const mixinAllFn = function(obj) {
  Object.entries(obj).forEach(([key, value]) => {
    this[key] = value
  })
}

// 混合 default 属性
const mixinFn = function(obj, defaultObj) {
  Object.entries(defaultObj).forEach(([key, value]) => {
    this[key] = obj[key] ?? value
  })
}

class FormClass {
  constructor(obj = {}) {
    const defaultObj = {
      inline: true,
      size: 'small',
      labelWidth: '100px'
    }
    mixinAllFn.call(this, { ...defaultObj, ...obj })
  }
}

class SearchConfigClass {
  constructor(obj = {}) {
    const defaultObj = {
      searchText: '筛选',
      resetText: '重置',
      span: 6,
      className: 'search-form',
      // 使用 折叠展开 功能
      useCollapse: true,
      defaultCollapsed: true,
      onCollapse: void 0
    }
    mixinFn.call(this, obj, defaultObj)
  }
}

export default {
  FormClass,
  SearchConfigClass
}
