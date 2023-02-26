import request from '@/utils/request'

const apiArr = {
  // 商品分组
  goodsGroup: '/goods/group/dropDownList',
  // 商品信息
  goodsList: '/goods/dropDownList',
  // 配送员等级
  distributionLevel: '/distribution/level/drop',
  // 配送员分组
  distributionGroup: '/distribution/group/drop',
  // 配送员
  distributionList: '/distribution/info/droplist',
  // 客户等级
  customerLevel: '/customer/level/dropDownList',
  // 客户标签
  customerLabel: '/customer/label/dropDownList',
  // 优惠券所属包
  package: '/marketing/couponInfo/package/down/list',
  // 查询角色
  roleList: '/system/role/optionselect',
  // 查询店铺
  shopList: '/wms/warehouse/shopinfos',
  // 仓库管理员
  managers: '/wms/warehouse/managers',
  // 库存
  warehouse: '/wms/warehouse/all'
}

// 查询下拉数据
export function getDropDown(api, query = {}) {
  return request({
    url: apiArr[api],
    method: 'get',
    params: query
  })
}
