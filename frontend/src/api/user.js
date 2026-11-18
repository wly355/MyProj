import request from '@/utils/request'

export const getCities = () => {
  return request({
    url: '/user/cities',
    method: 'get'
  })
}

export const addCity = (data) => {
  return request({
    url: '/user/cities',
    method: 'post',
    data
  })
}

export const deleteCity = (cityId) => {
  return request({
    url: `/user/cities/${cityId}`,
    method: 'delete'
  })
}

export const togglePinCity = (cityId) => {
  return request({
    url: `/user/cities/${cityId}/pin`,
    method: 'put'
  })
}

export const getSettings = () => {
  return request({
    url: '/user/settings',
    method: 'get'
  })
}

export const updateSettings = (data) => {
  return request({
    url: '/user/settings',
    method: 'put',
    data
  })
}

export const submitFeedback = (data) => {
  return request({
    url: '/user/feedback',
    method: 'post',
    data
  })
}

export const getMyFeedbacks = () => {
  return request({
    url: '/user/feedbacks',
    method: 'get'
  })
}

