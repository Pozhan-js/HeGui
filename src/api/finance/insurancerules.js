import request from '@/utils/request'

// 查询保险金规格列表
export function listInsurancerules(query) {
    return request({
        url: '/distribution/insurancerules/list',
        method: 'get',
        params: query
    })
}

// 查询保险金规格详细
export function getInsurancerules(rulesId) {
    return request({
        url: '/distribution/insurancerules/info/' + rulesId,
        method: 'get'
    })
}

// 新增保险金规格
export function addInsurancerules(data) {
    return request({
        url: '/distribution/insurancerules/add',
        method: 'post',
        data: data
    })
}

// 修改保险金规格
export function updateInsurancerules(data) {
    return request({
        url: '/distribution/insurancerules/update',
        method: 'post',
        data: data
    })
}

// 删除保险金规格
export function delInsurancerules(rulesId) {
    return request({
        url: '/distribution/insurancerules/remove/' + rulesId,
        method: 'delete'
    })
}
