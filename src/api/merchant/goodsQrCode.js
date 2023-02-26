import request from '@/utils/request'

// 查询二维码商品列表
export function listGoodsQrCode(query) {
    return request({
        url: '/goodsQrCode/list',
        method: 'get',
        params: query
    })
}

// 查询二维码商品详细
export function getGoodsQrCode(goodsQrCodeId) {
    return request({
        url: '/goodsQrCode/info/' + goodsQrCodeId,
        method: 'get'
    })
}

// 新增二维码商品
export function addGoodsQrCode(data) {
    return request({
        url: '/goodsQrCode/add',
        method: 'post',
        data: data
    })
}

// 修改二维码商品
export function updateGoodsQrCode(data) {
    return request({
        url: '/goodsQrCode/update',
        method: 'post',
        data: data
    })
}

// 删除二维码商品
export function delGoodsQrCode(goodsQrCodeId) {
    return request({
        url: '/goodsQrCode/remove/' + goodsQrCodeId,
        method: 'delete'
    })
}
