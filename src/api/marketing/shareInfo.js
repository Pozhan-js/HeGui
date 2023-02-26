import request from '@/utils/request'

// 查询分享有礼信息列表
export function listShareInfo(query) {
    return request({
        url: '/shareInfo/list',
        method: 'get',
        params: query
    })
}

// 查询分享有礼信息详细
export function getShareInfo(activityShareId) {
    return request({
        url: '/share/info/info/' + activityShareId,
        method: 'get'
    })
}

// 新增分享有礼信息
export function addShareInfo(data) {
    return request({
        url: '/share/info/add',
        method: 'post',
        data: data
    })
}

// 修改分享有礼信息
export function updateShareInfo(data) {
    return request({
        url: '/share/info/update',
        method: 'post',
        data: data
    })
}

// 修改分享有礼状态
export function updateShareInfoStatus(data) {
    return request({
        url: '/share/info/update/status',
        method: 'post',
        data: data
    })
}

// 删除分享有礼信息
export function delShareInfo(activityShareId) {
    return request({
        url: '/share/info/remove/' + activityShareId,
        method: 'delete'
    })
}
// 分享活动商品
export function listShopGoods(query) {
    return request({
        url: '/shopGoods/list',
        method: 'get',
        params: query
    })
}

// 查询优惠券
export function couponIssue(query) {
    return request({
        url: '/marketing/couponInfo/can/issue/list',
        method: 'get',
        params: query
    })
}

// 查询优惠券
export function goodsStockList(query) {
    return request({
        url: '/shopGoods/goodsStockList',
        method: 'get',
        params: query
    })
}

// 参与详情
export function shareRecordList(query) {
    return request({
        url: '/customer/share/record/list',
        method: 'get',
        params: query
    })
}


