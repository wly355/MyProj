import request from '@/utils/request'

// 申请成为管理员
export const applyForAdmin = (data) => {
  return request({
    url: '/admin-applications/apply',
    method: 'post',
    data
  })
}

// 获取申请列表（管理员）
export const getApplications = () => {
  return request({
    url: '/admin-applications/applications',
    method: 'get'
  })
}

// 审核申请（管理员）
export const reviewApplication = (id, data) => {
  return request({
    url: `/admin-applications/applications/${id}`,
    method: 'put',
    data
  })
}