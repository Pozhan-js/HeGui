import request from '@/utils/request'

// 查询项目升级版本信息记录列表
export function listLog(query) {
    return request({
        url: '/system/mss/upgrade/list/tabledata',
        method: 'get',
        params: query
    })
}