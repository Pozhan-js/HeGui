// 级联选择器筛选
export const cascaderFilter = (inputValue, path) => {
  return path.some(option => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1)
}