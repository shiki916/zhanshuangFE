import request from '@/utils/request'

// 查询卡池管理列表
export function listCard(query) {
  return request({
    url: '/game/card/list',
    method: 'get',
    params: query
  })
}

// 查询卡池管理详细
export function getCard(id) {
  return request({
    url: '/game/card/' + id,
    method: 'get'
  })
}

// 新增卡池管理
export function addCard(data) {
  return request({
    url: '/game/card',
    method: 'post',
    data: data
  })
}

// 修改卡池管理
export function updateCard(data) {
  return request({
    url: '/game/card',
    method: 'put',
    data: data
  })
}

// 删除卡池管理
export function delCard(id) {
  return request({
    url: '/game/card/' + id,
    method: 'delete'
  })
}
