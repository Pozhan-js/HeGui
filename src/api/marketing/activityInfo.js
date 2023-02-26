import request from '@/utils/request'

// 查询活动信息列表
export function listActivityInfo(query) {
    return request({
        url: '/activity/info/list',
        method: 'get',
        params: query
    })
}

// 查询活动信息详细
export function getActivityInfo(activityId) {
    return request({
        url: '/activity/info/info/' + activityId,
        method: 'get'
    })
}

// 新增活动信息
export function addActivityInfo(data) {
    return request({
        url: '/activity/info/add',
        method: 'post',
        data: data
    })
}

// 修改活动信息
export function updateActivityInfo(data) {
    return request({
        url: '/activity/info/update',
        method: 'post',
        data: data
    })
}

// 删除活动信息
export function delActivityInfo(activityId) {
    return request({
        url: '/activity/info/remove/' + activityId,
        method: 'delete'
    })
}

// 删除活动信息
export function updateActivityInfoStatus(data) {
    return request({
        url: '/activity/info/update/status',
        method: 'post',
        data
    })
}
// 查询商品列表
export function listActivityGoods(query) {
    return request({
        url: '/activity/info/selectGoodsList',
        method: 'get',
        params: query
    })
}

// 查询打包优惠券列表
export function listPackage(query) {
    return request({
        url: '/marketing/package/scancode/list',
        method: 'get',
        params: query
    })
}



