import request from '../utils/request';

const group = 'member';
const apiUrl = 'admin-api';

export function isMemberExist(data) {
  return request({
    url: `${apiUrl}/${group}/isMemberExist`,
    method: 'POST',
    data: data,
  });
}

export function validateOldPassword(data) {
  return request({
    url: `${apiUrl}/${group}/validateOldPassword`,
    method: 'POST',
    data: data,
  });
}

export function register(data) {
  return request({
    url: `${apiUrl}/${group}/register`,
    method: 'POST',
    data: data,
  });
}

export function login(data) {
  return request({
    url: `${apiUrl}/${group}/login`,
    method: 'POST',
    data: data,
  });
}

export function logout() {
  return request({
    url: `${apiUrl}/${group}/logout`,
    method: 'DELETE',
  });
}

export function validateAccessToken() {
  return request({
    url: `${apiUrl}/${group}/validateAccessToken`,
    method: 'POST',
  });
}

export function refreshAccessToken(data) {
  return request({
    url: `${apiUrl}/${group}/refreshAccessToken`,
    method: 'PUT',
    data: data,
  });
}

export function detail(data) {
  return request({
    url: `${apiUrl}/${group}/detail`,
    method: 'POST',
    data: data,
  });
}

export function profile() {
  return request({
    url: `${apiUrl}/${group}/profile`,
    method: 'GET',
  });
}

export function list(data) {
  return request({
    url: `${apiUrl}/${group}/list`,
    method: 'POST',
    data: data,
  });
}

export function updatePassword(data) {
  return request({
    url: `${apiUrl}/${group}/updatePassword`,
    method: 'PUT',
    data: data,
  });
}

export function updateProfile(data) {
  return request({
    url: `${apiUrl}/${group}/updateProfile`,
    method: 'PUT',
    data: data,
  });
}

export function updateDetail(data) {
  return request({
    url: `${apiUrl}/${group}/updateDetail`,
    method: 'PUT',
    data: data,
  });
}

export function add(data) {
  return request({
    url: `${apiUrl}/${group}/add`,
    method: 'POST',
    data: data,
  });
}

export function remove(data) {
  return request({
    url: `${apiUrl}/${group}/remove`,
    method: 'DELETE',
    data: data,
  });
}
