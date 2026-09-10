import request from '@/utils/request'

// 查询用户卡组列表
export function listDeck(query) {
  return request({
    url: '/game/deck/list',
    method: 'get',
    params: query
  })
}

// 查询用户卡组详细
export function getDeck(deckId) {
  return request({
    url: '/game/deck/' + deckId,
    method: 'get'
  })
}

// 新增用户卡组
export function addDeck(data) {
  return request({
    url: '/game/deck',
    method: 'post',
    data: data
  })
}

// 修改用户卡组
export function updateDeck(data) {
  return request({
    url: '/game/deck',
    method: 'put',
    data: data
  })
}

// 删除用户卡组
export function delDeck(deckId) {
  return request({
    url: '/game/deck/' + deckId,
    method: 'delete'
  })
}
