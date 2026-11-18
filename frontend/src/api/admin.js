import request from '@/utils/request'

export const getUsers = () => {
  return request({
    url: '/admin/users',
    method: 'get'
  })
}

export const updateUserStatus = (id, data) => {
  return request({
    url: `/admin/users/${id}/status`,
    method: 'put',
    data
  })
}

export const getStats = () => {
  return request({
    url: '/admin/stats',
    method: 'get'
  })
}

export const getConfig = (key) => {
  return request({
    url: `/admin/config/${key}`,
    method: 'get'
  })
}

export const updateConfig = (key, data) => {
  return request({
    url: `/admin/config/${key}`,
    method: 'put',
    data
  })
}

export const getFeedbacks = (params) => {
  return request({
    url: '/admin/feedbacks',
    method: 'get',
    params
  })
}

export const updateFeedback = (id, data) => {
  return request({
    url: `/admin/feedbacks/${id}`,
    method: 'put',
    data
  })
}

