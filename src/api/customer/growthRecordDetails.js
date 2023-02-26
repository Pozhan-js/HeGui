import request from '@/utils/request'

// 查询成长值变动记录列表
export function listGrowthRecord(query) {
    return request({
        url: '/growthRecord/list',
        method: 'get',
        params: query
    })
}

// 查询成长值变动记录详细
export function getGrowthRecord(growthRecordId) {
    return request({
        url: '/growthRecord/info/' + growthRecordId,
        method: 'get'
    })
}

// 新增成长值变动记录
export function addGrowthRecord(data) {
    return request({
        url: '/growthRecord/add',
        method: 'post',
        data: data
    })
}

// 修改成长值变动记录
export function updateGrowthRecord(data) {
    return request({
        url: '/growthRecord/update',
        method: 'post',
        data: data
    })
}

// 删除成长值变动记录
export function delGrowthRecord(growthRecordId) {
    return request({
        url: '/growthRecord/remove/' + growthRecordId,
        method: 'delete'
    })
}
