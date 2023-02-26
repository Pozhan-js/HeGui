
/**
 * 数组去重
 * @param {*} arr 需要去重数组
 * @param {*} key 指定去重KEY
 * @returns
 */
export function filterArr(arr, key) {
  const hash = {}
  return arr.reduce((ss, item) => {
    hash[item[key]] ? '' : (hash[item[key]] = true && ss.push(item))
    return ss
  }, [])
}

/**
 * 查询级联数据ID结构
 * @param {*} id 结构ID
 * @param {*} idKey ID名字
 * @param {*} arr 数组
 * @param {*} pidKey 上级ID
 * @returns
 */
export function searchSuperior(id, idKey, arr, pidKey) {
  let idArr = [parseInt(id)]
  arr.map(item => {
    if (id == item[idKey] && item[pidKey] && item[pidKey] != 0 && arr.map(arrItem => arrItem.id).includes(parseInt(item[pidKey]))) {
      idArr = searchSuperior(item[pidKey], idKey, arr, pidKey).concat(idArr)
    }
  })
  return idArr
}

/**
 * 多维数组平铺
 * @param {*} arr 数组
 * @param {*} childrenKey 子集Key
 * @returns
 */
export function flatten(arr, childrenKey) {
  let newArr = arr
  arr.map(item => {
    if (item[childrenKey] && item[childrenKey].length > 0) {
      newArr = newArr.concat(flatten(item[childrenKey], childrenKey))
    }
  })
  return newArr
}
