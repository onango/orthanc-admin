import request from 'utils/request';

const group = 'v1-log';

export function list(data) {
  return request({
    url: `/${group}/list`,
    method: 'POST',
    data: data,
  });
}

export function remove(data) {
  return request({
    url: `/${group}/remove`,
    method: 'DELETE',
    data: data,
  });
}
