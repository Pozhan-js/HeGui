import request from '@/utils/request'

// 查询考勤排班列表
export function listSchedule(query) {
  return request({
    url: '/attendance/schedule/list',
    method: 'get',
    params: query
  })
}

// 查询考勤排班详细
export function getSchedule(attendanceScheduleId) {
  return request({
    url: '/attendance/schedule/info/' + attendanceScheduleId,
    method: 'get'
  })
}

// 新增考勤排班
export function addSchedule(data) {
  return request({
    url: '/attendance/schedule/add',
    method: 'post',
    data: data
  })
}

// 修改考勤排班
export function updateSchedule(data) {
  return request({
    url: '/attendance/schedule/batch/update',
    method: 'post',
    data: data
  })
}

// 删除考勤排班
export function delSchedule(attendanceScheduleId) {
  return request({
    url: '/attendance/schedule/remove/' + attendanceScheduleId,
    method: 'delete'
  })
}

// 初始考勤排班
export function firstSchedule(data) {
  return request({
    url: '/attendance/schedule/first',
    method: 'post',
    data: data
  })
}
