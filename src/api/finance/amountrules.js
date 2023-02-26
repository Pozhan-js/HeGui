import request from '@/utils/request'

// 查询质保金规格列表
export function listAmountrules(query) {
    return request({
        url: '/distribution/amountrules/list',
        method: 'get',
        params: query
    })
}

// 查询质保金规格详细
export function getAmountrules(rulesId) {
    return request({
        url: '/distribution/amountrules/info/' + rulesId,
        method: 'get'
    })
}

// 新增质保金规格
export function addAmountrules(data) {
    return request({
        url: '/distribution/amountrules/add',
        method: 'post',
        data: data
    })
}

// 修改质保金规格
export function updateAmountrules(data) {
    return request({
        url: '/distribution/amountrules/update',
        method: 'post',
        data: data
    })
}

// 删除质保金规格
export function delAmountrules(rulesId) {
    return request({
        url: '/distribution/amountrules/remove/' + rulesId,
        method: 'delete'
    })
}
