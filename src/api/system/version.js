import request from '@/utils/request'

// 查询app版本控制列表
export function listVersion(query) {
    return request({
        url: '/system/mss/version/list/tabledata',
        method: 'get',
        params: query
    })
}

// 查询app版本控制详细
export function getVersion(id) {
    return request({
        url: '/system/mss/version/info/' + id,
        method: 'get'
    })
}

// 新增app版本控制
export function addVersion(data) {
    return request({
        url: '/system/mss/version/add',
        method: 'post',
        data: data
    })
}

// 修改app版本控制
export function updateVersion(data) {
    return request({
        url: '/system/mss/version/update',
        method: 'post',
        data: data
    })
}

// 删除app版本控制
export function delVersion(id) {
    return request({
        url: '/system/mss/version/remove/' + id,
        method: 'post'
    })
}

// 修改版本状态
export function updateStatusVersion(data) {
    return request({
        url: '/system/mss/version/update/status',
        method: 'post',
        data: data
    })
}

// 获取版本
export function listVersionNo() {
    return request({
        url: '/system/mss/version/list',
        method: 'get'
    })
}